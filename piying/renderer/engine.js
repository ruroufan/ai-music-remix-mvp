// 皮影戏历史短视频渲染引擎
// build.mjs 把分镜脚本 + 配音时间编译成 timeline（所有时间均为成片秒数），
// 再调用 ENGINE.setup(timeline)，然后按顺序 ENGINE.renderFrame(f) 逐帧取图。
(function () {
  const { CHARS, POSES, blendPose, drawPuppet, fillPart, polyD, smoothD, COLORS, carve, P2, pair } = window.RIG;
  const W = 1920, H = 1080, FLOOR = 880, TAU = Math.PI * 2;
  const COL = {
    screenIn: '#F6E7C1', screenOut: '#C9A774', valance: '#9E2B25', tassel: '#C9A24A', floor: '#5A3A22', flame: '#FFB347',
    ink: '#2A1A10', sub: '#3B2414', subStroke: '#F6E7C1', plate: '#9E2B25', seal: '#B22222', hook: '#F6E7C1'
  };
  const FONT_CAL = 'MSZ', FONT_SERIF = 'NSerif';

  // ---------- 工具 ----------
  const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
  const lerp = (a, b, t) => a + (b - a) * t;
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const ease = t => { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }; // ease-in-out
  const elastic = t => { t = clamp(t, 0, 1); if (t === 0 || t === 1) return t; return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1; };
  function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
  function noise1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u); }
  function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  const toS = (cam, x, y) => [(x - cam.x) * cam.z + W / 2, (y - cam.y) * cam.z + H / 2];

  let TL, main, mg, buf, bg2, pl, plg, tmpA, tmpB, paper, vign;
  const trails = new Map();
  let lastTrailFrame = -1;

  // ---------- 资源 ----------
  function makePaper() { // 纸纹噪点（平铺，跟随镜头）
    const c = mk(512, 512), x = c.getContext('2d'), im = x.createImageData(512, 512), d = im.data;
    let s = 9;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 512 * 512; i++) { const v = 128 + (rnd() - 0.5) * 200; d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = 255; }
    x.putImageData(im, 0, 0);
    x.globalAlpha = 0.25; x.strokeStyle = '#000';
    for (let i = 0; i < 400; i++) { const px = rnd() * 512, py = rnd() * 512, l = 8 + rnd() * 30, a = rnd() * TAU; x.lineWidth = 0.6; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
    return c;
  }
  function makeVign() {
    const c = mk(W, H), x = c.getContext('2d');
    const r = x.createRadialGradient(W / 2, H * 0.46, H * 0.32, W / 2, H / 2, W * 0.66);
    r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(1, 'rgba(40,18,6,0.55)');
    x.fillStyle = r; x.fillRect(0, 0, W, H); return c;
  }

  // ---------- 镜头 ----------
  // camera: { x, y, zoom, move: static|pan|push|fastpush|pull, toX, toY, toZoom, at, dur, follow: {who, dx, at} }
  // 写了 toX/toY/toZoom 就在 [at, at+dur]（默认整个镜头）内 ease-in-out 过渡。
  function camera(shot, t, states) {
    const c = shot.camera || {}, d = Math.max(0.01, shot.end - shot.start), u = clamp((t - shot.start) / d, 0, 1);
    const move = c.move || 'static';
    let x = c.x != null ? c.x : 960, y = c.y != null ? c.y : 540, z = c.zoom || 1;
    const t0 = c.at != null ? c.at : shot.start, k = ease((t - t0) / (c.dur || Math.max(0.01, shot.end - t0)));
    if (c.toX != null) x = lerp(x, c.toX, k);
    if (c.toY != null) y = lerp(y, c.toY, k);
    if (c.toZoom != null) z = lerp(z, c.toZoom, k);
    else if (move.includes('fastpush')) z = lerp(z, 1.35, ease((t - shot.start) / 0.4));
    else if (move.includes('push')) z = lerp(z, 1.15, ease(u));
    else if (move.includes('pull')) z = lerp(1.15, 1.0, ease(u));
    if (c.follow && states) {
      const s = states.find(o => (o.m.id || o.m.who) === c.follow.who);
      if (s) { const fa = c.follow.at != null ? c.follow.at : shot.start; x = lerp(x, s.st.x + (c.follow.dx || 0), ease((t - fa) / 0.6)); }
    }
    return { x, y, z };
  }

  // ---------- 角色状态 ----------
  function castState(m, t, shot) {
    const def = Object.assign({}, CHARS[m.who], m.look || {});
    let carry = m.carry ? { len: m.carry.len || 520 } : null;
    let pose = POSES[m.pose || 'stand'], x = m.x, face = m.face || 1, alpha = m.alpha != null ? m.alpha : 1, yOff = 0;
    let hold = m.hold || null, holdFar = m.holdFar || null, swordAng = m.swordAng || 0, moving = false, rot = 0;
    const acts = (m.actions || []).slice().sort((a, b) => a.at - b.at);
    for (const a of acts) {
      if (a.at > t) {
        if (a.do === 'show' && a.at > t) alpha = Math.min(alpha, 0); // 尚未出场
        continue;
      }
      const k = ease((t - a.at) / (a.dur || 0.4));
      if (a.do === 'pose') pose = blendPose(pose, POSES[a.name], k);
      else if (a.do === 'walk' || a.do === 'run') {
        const dur = a.dur || 1.2, from = x, kk = ease((t - a.at) / dur);
        x = lerp(from, a.to, kk);
        if (t < a.at + dur) {
          moving = true;
          const steps = Math.max(1, Math.round(Math.abs(a.to - from) / (a.do === 'run' ? 90 : 60)));
          const ph = kk * steps * Math.PI;
          yOff = -6 * Math.abs(Math.sin(ph));      // 跳动式前进
          if (!(pose.kneel > 0.5)) {
            const sw = Math.sin(ph) * (a.do === 'run' ? 0.55 : 0.35);
            pose = Object.assign({}, pose, { lN: [sw, -Math.max(0, sw) * 0.3], lF: [-sw, -Math.max(0, -sw) * 0.3] });
          }
        }
      }
      else if (a.do === 'turn') face = lerp(face, -face, ease((t - a.at) / (a.dur || 0.3)));
      else if (a.do === 'show') alpha = lerp(0, 1, ease((t - a.at) / (a.dur || 0.3)));
      else if (a.do === 'hide') alpha = lerp(alpha, 0, ease((t - a.at) / (a.dur || 0.3)));
      else if (a.do === 'hold') { if (a.hand === 'far') holdFar = a.item || null; else hold = a.item || null; }
      else if (a.do === 'carry') carry = a.on === false ? null : { len: a.len || 520 };
      else if (a.do === 'wave') { // 挥手：近侧手臂抬起，前臂左右摆 times 次
        const dur = a.dur || 1.2, u = (t - a.at) / dur;
        if (u < 1) { const e = sstep(0, 0.12, u) * (1 - sstep(0.88, 1, u)); pose = blendPose(pose, Object.assign({}, pose, { aN: [1.75, 0.25 + 0.75 * Math.sin(TAU * (a.times || 2) * u)] }), e); }
      }
      else if (a.do === 'lunge') {
        const dur = a.dur || 0.5, kk = ease((t - a.at) / dur), dir = Math.sign(face) || 1;
        x += (a.dx || 140) * dir * kk;
        const lp = { torso: 0.15, head: -0.05, aN: [1.6, 0], aF: [-1.0, 0.5], lN: [0.95, 0.25], lF: [-0.85, -0.55] };
        pose = blendPose(pose, Object.assign({}, lp, { kneel: 0 }), kk); swordAng = lerp(swordAng, 0, kk);
      }
      else if (a.do === 'dance') {
        const dur = a.dur || 3, tau = t - a.at;
        if (tau < dur) {
          moving = true; const w = 5.2, e = sstep(0, 0.3, tau) * (1 - sstep(dur - 0.3, dur, tau));
          const dp = { torso: 0.05 * Math.sin(w * tau), head: -0.05, aN: [2.3 + 0.95 * Math.sin(w * tau), -0.6 + 0.65 * Math.sin(w * tau + 1.2)], aF: [1.0 + 0.5 * Math.sin(w * tau + Math.PI), 0.9], lN: [0.42 + 0.12 * Math.sin(w * tau), 0.05], lF: [-0.42, -0.12], kneel: 0 };
          pose = blendPose(pose, dp, e); swordAng = 0.4 * Math.sin(w * tau + 2) * e;
          x += (a.dx || 50) * Math.sin(tau * 1.3) * e; rot = 0.05 * Math.sin(w * tau) * e;
        }
      }
    }
    // 节拍：短暂换姿势再回来（如三次举玦）
    for (const a of acts) if (a.do === 'beat' && t >= a.at) {
      const d = a.dur || 0.6, k = sstep(a.at, a.at + 0.2, t) * (1 - sstep(a.at + d - 0.2, a.at + d, t));
      if (k > 0) pose = blendPose(pose, POSES[a.name], k);
    }
    // 待机晃动 ±2°，周期 1.5 秒
    if (!moving) rot += (2 * Math.PI / 180) * Math.sin(TAU * t / 1.5 + (m.x || 0) * 0.013);
    return { def, x, y: FLOOR + yOff, face, alpha: clamp(alpha, 0, 1), pose, hold, holdFar, swordAng, rot, t, carry, layer: m.layer || 0 };
  }

  // ---------- 布景道具 ----------
  const SCENES = {
    camp: [{ type: 'hill', x: 300, w: 900, h: 260 }, { type: 'hill', x: 1500, w: 1100, h: 320 }, { type: 'tent', x: 380 }, { type: 'tent', x: 1560, w: 420 }, { type: 'banner', x: 720, text: '楚' }, { type: 'banner', x: 2160, text: '楚' }, { type: 'rack', x: 1900 }, { type: 'lamp', x: 980 }],
    hall: [{ type: 'screen', x: 960, w: 820 }, { type: 'banner', x: 260, text: '楚' }, { type: 'lamp', x: 620 }, { type: 'lamp', x: 1300 }],
    field: [{ type: 'moon', x: 1460, y: 230 }, { type: 'hill', x: 500, w: 1200, h: 300 }, { type: 'reeds', x0: 0, x1: 760 }, { type: 'waves', x0: -400, x1: 2400 }],
    blank: [{ type: 'lamp', x: 480 }, { type: 'lamp', x: 1440 }]
  };
  // 七国地图：归一化坐标的简笔版图（西→东），按秦灭六国的先后顺序可逐块变色
  const STATES = [
    { name: '秦', pts: [[0.02, 0.18], [0.2, 0.08], [0.36, 0.16], [0.4, 0.42], [0.36, 0.62], [0.3, 0.84], [0.12, 0.9], [0.03, 0.62]], lab: [0.18, 0.46], col: '#8A8A8A' },
    { name: '赵', pts: [[0.4, 0.1], [0.56, 0.04], [0.7, 0.1], [0.68, 0.34], [0.54, 0.36], [0.42, 0.3]], lab: [0.55, 0.2], col: '#7C8C5A' },
    { name: '燕', pts: [[0.7, 0.04], [0.92, 0.06], [0.97, 0.26], [0.84, 0.32], [0.7, 0.3]], lab: [0.83, 0.17], col: '#5E7A86' },
    { name: '魏', pts: [[0.42, 0.32], [0.54, 0.37], [0.66, 0.36], [0.64, 0.5], [0.5, 0.52], [0.4, 0.44]], lab: [0.53, 0.44], col: '#A88A4A' },
    { name: '韩', pts: [[0.38, 0.46], [0.5, 0.53], [0.52, 0.64], [0.4, 0.66], [0.36, 0.58]], lab: [0.445, 0.58], col: '#8C6A5A' },
    { name: '齐', pts: [[0.68, 0.32], [0.86, 0.34], [0.98, 0.42], [0.92, 0.56], [0.72, 0.56], [0.66, 0.48]], lab: [0.82, 0.45], col: '#6A8A70' },
    { name: '楚', pts: [[0.36, 0.64], [0.52, 0.66], [0.66, 0.52], [0.9, 0.58], [0.94, 0.8], [0.7, 0.96], [0.4, 0.94], [0.3, 0.84]], lab: [0.63, 0.78], col: '#9A7A4A' }
  ];
  const mixHex = (a, b, k) => { const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); const ch = sh => Math.round(lerp((pa >> sh) & 255, (pb >> sh) & 255, k)); return `rgba(${ch(16)},${ch(8)},${ch(0)},0.94)`; };
  function drawMap(ctx, p, t) {
    const { x, y, w, h } = p, x0 = x - w / 2, y0 = y - h / 2, P = ([u, v]) => [x0 + u * w, y0 + v * h];
    if (p.hang) { ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - w * 0.3, y0 - 8); ctx.lineTo(x, y0 - 90); ctx.lineTo(x + w * 0.3, y0 - 8); ctx.stroke(); }
    fillPart(ctx, polyD([[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]]), 'rgba(226,200,150,0.9)', null, null, 2.4);
    const red = '#6E1E1A';
    for (const s of STATES) {
      let k = 0;
      if (s.name === '秦' && p.qin) k = ease((t - p.qin.at) / (p.qin.dur || 0.8));
      const c = (p.conquer || []).find(c => c.state === s.name);
      if (c) k = ease((t - c.at) / (c.dur || 0.5));
      const col = mixHex(s.col, red, k);
      // 边界抖动一点，像手刻
      const pts = s.pts.map(([u, v], i) => P([u + 0.006 * Math.sin(i * 7.1 + u * 30), v + 0.006 * Math.cos(i * 5.3 + v * 30)]));
      fillPart(ctx, smoothD(pts), col, k < 0.5 ? 'dots' : null, [x0, y0, x0 + w, y0 + h], 2);
      const [lx, ly] = P(s.lab);
      ctx.save(); ctx.fillStyle = k > 0.5 ? 'rgba(246,231,193,0.95)' : COL.ink; ctx.font = `${Math.round(h * 0.11)}px ${FONT_CAL}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s.name, lx, ly); ctx.restore();
    }
    if (p.hang) for (const yy of [y0 - 6, y0 + h + 6]) fillPart(ctx, polyD([[x0 - 18, yy - 7], [x0 + w + 18, yy - 7], [x0 + w + 18, yy + 7], [x0 - 18, yy + 7]]), COLORS.brown[1], null, null, 1.6);
  }
  function drawProp(ctx, p, t, fx, cam) {
    const C = COLORS;
    if (p.parallax && cam) p = Object.assign({}, p, { x: p.x + (cam.x - 960) * p.parallax });
    if (p.showAt != null && t < p.showAt) return;
    if (p.hideAt != null && t >= p.hideAt) return;
    if (p.type === 'gate') { // 城门：城墙 + 门楼 + 拱门洞 + 可切换牌匾
      const x = p.x, w = p.w || 780, wallH = 300, top = FLOOR - wallH;
      ctx.save(); ctx.globalAlpha *= p.alpha || 0.8;
      const wall = [[x - w / 2, FLOOR], [x - w / 2, top]];
      for (let k = 0; k <= 12; k++) { const xx = x - w / 2 + k * w / 12; wall.push([xx, top]); if (k < 12) { wall.push([xx + w / 48, top]); wall.push([xx + w / 48, top - 22]); wall.push([xx + w / 24, top - 22]); wall.push([xx + w / 24, top]); } }
      wall.push([x + w / 2, top], [x + w / 2, FLOOR]);
      fillPart(ctx, polyD(wall), 'rgba(104,84,62,0.92)', null, null, 2);
      carve(ctx, P2(polyD(wall)), 'huiwen', [x - w / 2, top, x + w / 2, FLOOR]);
      const tw = 320, th = 110, ty = top - th;
      fillPart(ctx, polyD([[x - tw / 2, top], [x - tw / 2, ty], [x + tw / 2, ty], [x + tw / 2, top]]), 'rgba(120,46,34,0.92)', 'lattice', [x - tw / 2, ty, x + tw / 2, top]);
      for (const [yy, ww, hh] of [[ty, tw + 120, 46], [ty - 70, tw - 40, 40]]) fillPart(ctx, smoothD([[x - ww / 2 - 20, yy + 4], [x - ww / 2 + 30, yy - 10], [x, yy - hh], [x + ww / 2 - 30, yy - 10], [x + ww / 2 + 20, yy + 4], [x, yy - 6]]), 'rgba(40,30,24,0.95)');
      fillPart(ctx, polyD([[x - tw / 2 + 40, ty - 50], [x + tw / 2 - 40, ty - 50], [x + tw / 2 - 40, ty - 4], [x - tw / 2 + 40, ty - 4]]), 'rgba(120,46,34,0.92)');
      // 拱形门洞：镂空，透出幕布的光
      ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.moveTo(x - 90, FLOOR); ctx.lineTo(x - 90, FLOOR - 150); ctx.arc(x, FLOOR - 150, 90, Math.PI, 0); ctx.lineTo(x + 90, FLOOR); ctx.closePath(); ctx.fill(); ctx.restore();
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 90, FLOOR); ctx.lineTo(x - 90, FLOOR - 150); ctx.arc(x, FLOOR - 150, 90, Math.PI, 0); ctx.lineTo(x + 90, FLOOR); ctx.stroke();
      // 牌匾
      const py = top - 56;
      fillPart(ctx, polyD([[x - 86, py - 34], [x + 86, py - 34], [x + 86, py + 34], [x - 86, py + 34]]), 'rgba(30,22,16,0.96)', null, null, 2.4);
      ctx.strokeStyle = COL.tassel; ctx.lineWidth = 2; ctx.strokeRect(x - 78, py - 26, 156, 52);
      const kk = p.plaqueTo ? ease((t - p.plaqueTo.at) / (p.plaqueTo.dur || 0.8)) : 0;
      ctx.font = `46px ${FONT_CAL}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = COL.tassel;
      if (kk < 1) { ctx.globalAlpha = (p.alpha || 0.8) * (1 - kk); ctx.fillText(p.plaque || '南门', x, py + 2); }
      if (kk > 0) { ctx.globalAlpha = (p.alpha || 0.8) * kk; ctx.fillText(p.plaqueTo.text, x, py + 2); }
      ctx.restore();
    } else if (p.type === 'pole') { // 三丈长木：可从地面升起、可倾倒扛上肩、可平放
      const h = p.h || 520, w = p.w || 28;
      const drawBeam = () => {
        fillPart(ctx, polyD([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]), 'rgba(122,84,46,0.95)', null, null, 2);
        ctx.strokeStyle = 'rgba(60,36,18,0.55)'; ctx.lineWidth = 1.2;
        for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(-w / 2 + 6 + (k % 3) * 6, -h / 2 + 30 + k * 80); ctx.lineTo(-w / 2 + 8 + (k % 3) * 6, -h / 2 + 100 + k * 80); ctx.stroke(); }
      };
      ctx.save();
      if (p.lying) { ctx.translate(p.x, FLOOR - w / 2); ctx.rotate(Math.PI / 2); drawBeam(); }
      else {
        const rise = p.rise ? ease((t - p.rise.at) / (p.rise.dur || 1)) : 1;
        const tk = p.tilt ? ease((t - p.tilt.at) / (p.tilt.dur || 0.6)) : 0;
        if (p.tilt && t >= p.tilt.at + (p.tilt.dur || 0.6)) { ctx.restore(); return; }
        const cx = lerp(p.x, p.tilt ? p.tilt.toX : p.x, tk), cy = lerp(FLOOR - h / 2 + h * (1 - rise), p.tilt ? p.tilt.toY : 0, tk);
        if (rise < 1) { ctx.beginPath(); ctx.rect(p.x - 400, -2000, 800, FLOOR + 2000); ctx.clip(); }
        ctx.translate(cx, cy); ctx.rotate(-Math.PI / 2 * tk); drawBeam();
      }
      ctx.restore();
    } else if (p.type === 'board') { // 木告示牌：竖排告示，可划线、盖红字
      const x = p.x, bw = p.w || 270, bh = 320, top = FLOOR - 470;
      for (const dx of [-bw / 2 + 24, bw / 2 - 24]) fillPart(ctx, polyD([[x + dx - 8, top + 20], [x + dx + 8, top + 20], [x + dx + 9, FLOOR], [x + dx - 9, FLOOR]]), COLORS.brown[1]);
      fillPart(ctx, polyD([[x - bw / 2, top], [x + bw / 2, top], [x + bw / 2, top + bh], [x - bw / 2, top + bh]]), 'rgba(196,156,100,0.94)', null, null, 2.6);
      fillPart(ctx, polyD([[x - bw / 2 - 16, top - 18], [x + bw / 2 + 16, top - 18], [x + bw / 2, top], [x - bw / 2, top]]), COLORS.brown[1], null, null, 2);
      const cols = p.cols || ['徙此木至北门者', '赏十金'], fs = 36;
      ctx.save(); ctx.font = `${fs}px ${FONT_CAL}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = COL.ink;
      cols.forEach((col, i) => [...col].forEach((ch, j) => ctx.fillText(ch, x + bw / 2 - 52 - i * 64, top + 22 + j * fs * 1.12)));
      ctx.restore();
      const cx2 = x + bw / 2 - 52 - 64, y1 = top + 22 + fs * 1.12, y2 = top + 22 + fs * 1.12 * 3;   // 「十金」所在位置
      if (p.strike && t >= p.strike.at) {
        const k = ease((t - p.strike.at) / (p.strike.dur || 0.4));
        ctx.strokeStyle = 'rgba(178,34,34,0.95)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(cx2 - 22, y1 - 2); ctx.lineTo(lerp(cx2 - 22, cx2 + 22, k), lerp(y1 - 2, y2 + 2, k)); ctx.stroke();
      }
      if (p.stamp && t >= p.stamp.at) {
        const k = clamp((t - p.stamp.at) / 0.2, 0, 1), sc = lerp(1.4, 1, ease(k)), sx = cx2 - 66, sy = top + 40;
        ctx.save(); ctx.globalAlpha *= Math.min(1, k * 2); ctx.translate(sx, sy + fs * 1.6); ctx.rotate(-0.05); ctx.scale(sc, sc); ctx.translate(-sx, -(sy + fs * 1.6));
        ctx.font = `${fs + 4}px ${FONT_CAL}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = 'rgba(178,34,34,0.97)';
        [...(p.stamp.text || '五十金')].forEach((ch, j) => ctx.fillText(ch, sx, sy + j * (fs + 4) * 1.08));
        ctx.restore();
      }
    } else if (p.type === 'map') {
      drawMap(ctx, p, t);
    } else if (p.type === 'inn') { // 客栈：墙、檐、招子、两扇木门（门缝可开）
      const x = p.x, w = p.w || 560, wallH = 380, top = FLOOR - wallH, dw = 170, dh = 270, dTop = FLOOR - dh;
      const wall = [[x - w / 2, FLOOR], [x - w / 2, top], [x + w / 2, top], [x + w / 2, FLOOR], [x + dw / 2, FLOOR], [x + dw / 2, dTop], [x - dw / 2, dTop], [x - dw / 2, FLOOR]];
      fillPart(ctx, polyD(wall), 'rgba(110,84,58,0.9)', 'lattice', [x - w / 2, top, x + w / 2, FLOOR]);
      fillPart(ctx, smoothD([[x - w / 2 - 50, top + 6], [x - w / 2, top - 30], [x, top - 60], [x + w / 2, top - 30], [x + w / 2 + 50, top + 6], [x, top - 10]]), 'rgba(40,30,24,0.95)');
      const fl = x - w / 2 + 60, sway = Math.sin(t * 1.5) * 3; // 招子「客栈」
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fl, top + 30); ctx.lineTo(fl + sway, top + 50); ctx.stroke();
      fillPart(ctx, polyD([[fl - 26 + sway, top + 50], [fl + 26 + sway, top + 50], [fl + 26 + sway * 1.4, top + 190], [fl - 26 + sway * 1.4, top + 190]]), 'rgba(160,40,30,0.92)');
      ctx.save(); ctx.fillStyle = COL.tassel; ctx.font = `40px ${FONT_CAL}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText('客', fl + sway * 1.2, top + 70); ctx.fillText('栈', fl + sway * 1.3, top + 120); ctx.restore();
      let v = 0; for (const k of p.door || []) if (t >= k.at) v = lerp(v, k.v, ease((t - k.at) / (k.dur || 0.5)));
      const gap = v * 120;
      p._gap = { x0: x - gap / 2 + 20, x1: x + gap / 2 + 20, top: dTop, v };
      if (gap > 2) fx.push({ kind: 'warm', x0: x - gap / 2 + 20, x1: x + gap / 2 + 20, y0: dTop + 6, y1: FLOOR, v });
      return p._gap;
    } else if (p.type === 'innDoors') { // 门扇（画在店主之上）
      const x = p.x, dw = 170, dh = 270, dTop = FLOOR - dh;
      let v = 0; for (const k of p.door || []) if (t >= k.at) v = lerp(v, k.v, ease((t - k.at) / (k.dur || 0.5)));
      const gap = v * 120, mid = x + 20;
      fillPart(ctx, polyD([[x - dw / 2, dTop], [mid - gap / 2, dTop], [mid - gap / 2, FLOOR], [x - dw / 2, FLOOR]]), 'rgba(92,60,34,0.95)', 'dots', [x - dw / 2, dTop, mid, FLOOR]);
      fillPart(ctx, polyD([[mid + gap / 2, dTop], [x + dw / 2, dTop], [x + dw / 2, FLOOR], [mid + gap / 2, FLOOR]]), 'rgba(92,60,34,0.95)', 'dots', [mid, dTop, x + dw / 2, FLOOR]);
      for (const hx of [mid - gap / 2 - 14, mid + gap / 2 + 14]) { ctx.fillStyle = COL.tassel; ctx.beginPath(); ctx.arc(hx, dTop + dh * 0.5, 5, 0, TAU); ctx.fill(); }
    }
    if (p.type === 'table') {
      const w = p.w || 200, x = p.x, y = FLOOR - 62;
      fillPart(ctx, polyD([[x - w / 2 - 8, y - 6], [x + w / 2 + 8, y - 6], [x + w / 2, y + 10], [x - w / 2, y + 10]]), C.black[0], 'dots', [x - w / 2, y - 6, x + w / 2, y + 10]);
      for (const lx of [x - w / 2 + 14, x + w / 2 - 14]) fillPart(ctx, polyD([[lx - 6, y + 10], [lx + 6, y + 10], [lx + 9, FLOOR], [lx - 12, FLOOR]]), C.black[0]);
      fillPart(ctx, polyD([[x - 56, y - 6], [x - 20, y - 6], [x - 25, y - 19], [x - 51, y - 19]]), C.red[0], null, null, 1.6);
      fillPart(ctx, polyD([[x + 8, y - 6], [x + 42, y - 6], [x + 47, y - 22], [x + 3, y - 22]]), C.red[1], null, null, 1.6);
      fillPart(ctx, polyD([[x + 58, y - 6], [x + 72, y - 6], [x + 74, y - 32], [x + 65, y - 42], [x + 55, y - 32]]), C.yellow[1], null, null, 1.6);
    } else if (p.type === 'lamp') {
      const x = p.x;
      fillPart(ctx, polyD([[x - 22, FLOOR], [x + 22, FLOOR], [x + 6, FLOOR - 22], [x - 6, FLOOR - 22]]), C.yellow[1], null, null, 1.6);
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, FLOOR - 22); ctx.lineTo(x, FLOOR - 210); ctx.stroke();
      fillPart(ctx, polyD([[x - 26, FLOOR - 212], [x + 26, FLOOR - 212], [x + 14, FLOOR - 198], [x - 14, FLOOR - 198]]), C.yellow[1], null, null, 1.6);
      fx.push({ kind: 'flame', x, y: FLOOR - 224, seed: x });
    } else if (p.type === 'lampSmall') { // 案上小油灯
      const x = p.x, y = p.y || FLOOR - 62;
      fillPart(ctx, polyD([[x - 16, y], [x + 16, y], [x + 6, y - 30], [x - 6, y - 30]]), C.yellow[1], null, null, 1.6);
      fillPart(ctx, polyD([[x - 20, y - 32], [x + 20, y - 32], [x + 10, y - 22], [x - 10, y - 22]]), C.yellow[1], null, null, 1.6);
      fx.push({ kind: 'flame', x, y: y - 42, seed: x, small: true });
    } else if (p.type === 'banner') {
      const x = p.x, top = p.top || 300;
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x, FLOOR); ctx.lineTo(x, top - 20); ctx.stroke();
      const pts = [[x, top], [x + 150, top]];
      for (let k = 0; k <= 10; k++) pts.push([x + 150 + Math.sin(t * 2.4 + k * 0.6 + x) * 8, top + k * 21]);
      pts.push([x, top + 210]);
      const path = P2(polyD(pts));
      ctx.fillStyle = COLORS[p.color || 'black'][0]; ctx.fill(path); ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.stroke(path);
      if (p.text) { ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.font = `100px ${FONT_CAL}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.text, x + 76, top + 108); ctx.restore(); }
    } else if (p.type === 'tent') {
      const x = p.x, w = p.w || 360, h = p.h || 300, c = COLORS[p.color || 'brown'];
      fillPart(ctx, polyD([[x - w / 2, FLOOR], [x - w / 2 + 20, FLOOR - h * 0.55], [x, FLOOR - h], [x + w / 2 - 20, FLOOR - h * 0.55], [x + w / 2, FLOOR]]), c[1], 'lattice', [x - w / 2, FLOOR - h, x + w / 2, FLOOR]);
      fillPart(ctx, polyD([[x - w * 0.16, FLOOR], [x, FLOOR - h * 0.62], [x + w * 0.16, FLOOR]]), COLORS.black[0]);
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, FLOOR - h); ctx.lineTo(x, FLOOR - h - 50); ctx.stroke();
      fillPart(ctx, polyD([[x, FLOOR - h - 50], [x + 40 + Math.sin(t * 3) * 4, FLOOR - h - 42], [x, FLOOR - h - 32]]), COLORS.red[0], null, null, 1.4);
    } else if (p.type === 'screen') { // 屏风
      // 屏风放在后景：浅色、半透明，避免和人物抢
      const x = p.x, w = p.w || 800, n = 5, pw = w / n, top = FLOOR - (p.h || 280);
      ctx.save(); ctx.globalAlpha *= 0.42;
      for (let i = 0; i < n; i++) {
        const x0 = x - w / 2 + i * pw;
        fillPart(ctx, polyD([[x0, top], [x0 + pw, top], [x0 + pw, FLOOR], [x0, FLOOR]]), i % 2 ? COLORS.brown[0] : COLORS.yellow[1], 'lattice', [x0 + 8, top + 10, x0 + pw - 8, FLOOR - 50], 2.4);
      }
      ctx.restore();
    } else if (p.type === 'rack') {
      const x = p.x;
      fillPart(ctx, polyD([[x - 70, FLOOR - 180], [x + 70, FLOOR - 180], [x + 70, FLOOR - 168], [x - 70, FLOOR - 168]]), COLORS.brown[1]);
      for (const dx of [-60, 60]) fillPart(ctx, polyD([[x + dx - 5, FLOOR - 180], [x + dx + 5, FLOOR - 180], [x + dx + 8, FLOOR], [x + dx - 8, FLOOR]]), COLORS.brown[1]);
      for (let k = -2; k <= 2; k++) { ctx.strokeStyle = COL.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + k * 22, FLOOR - 10); ctx.lineTo(x + k * 22 + 10, FLOOR - 330); ctx.stroke(); fillPart(ctx, polyD([[x + k * 22 + 4, FLOOR - 330], [x + k * 22 + 16, FLOOR - 330], [x + k * 22 + 12, FLOOR - 370]]), 'rgba(220,226,232,0.94)', null, null, 1.2); }
    } else if (p.type === 'hill') {
      const x = p.x, w = p.w || 900, h = p.h || 280, pts = [[x - w / 2, FLOOR]];
      for (let k = 0; k <= 16; k++) { const u = k / 16; pts.push([x - w / 2 + u * w, FLOOR - h * Math.sin(Math.PI * u) * (0.75 + 0.25 * noise1(u * 6 + x))]); }
      pts.push([x + w / 2, FLOOR]);
      ctx.save(); ctx.globalAlpha *= 0.55; fillPart(ctx, smoothD(pts), COLORS.green[1], 'huiwen', [x - w / 2, FLOOR - h, x + w / 2, FLOOR]); ctx.restore();
    } else if (p.type === 'moon') {
      ctx.save(); ctx.globalAlpha *= 0.5; ctx.fillStyle = 'rgba(255,250,235,1)'; ctx.beginPath(); ctx.arc(p.x, p.y, 70, 0, TAU); ctx.fill(); ctx.restore();
    } else if (p.type === 'waves') {
      const pts = [[p.x0, FLOOR + 2]];
      for (let x = p.x0; x <= p.x1; x += 40) pts.push([x, FLOOR - 24 - 10 * Math.sin(x * 0.05 + t * 2)]);
      pts.push([p.x1, FLOOR + 2]);
      fillPart(ctx, polyD(pts), COLORS.blue[0], 'scale', [p.x0, FLOOR - 40, p.x1, FLOOR]);
    } else if (p.type === 'reeds') {
      for (let x = p.x0; x < p.x1; x += 26) { const h = 120 + 80 * hash(x), sw = Math.sin(t * 1.6 + x * 0.05) * 8; ctx.strokeStyle = 'rgba(60,48,24,0.85)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, FLOOR); ctx.quadraticCurveTo(x + sw * 0.5, FLOOR - h * 0.6, x + sw, FLOOR - h); ctx.stroke(); }
    }
  }
  function drawValance(ctx, x0, x1, t) {
    const a0 = Math.floor(x0 / 120) * 120 - 120, a1 = x1 + 240;
    const pts = [[a0, -600], [a1, -600], [a1, 46]];
    for (let x = a1; x >= a0; x -= 120) { pts.push([x, 46]); pts.push([x - 60, 70]); }
    ctx.fillStyle = COL.valance; const p = P2(polyD(pts)); ctx.fill(p); ctx.strokeStyle = COL.ink; ctx.lineWidth = 2; ctx.stroke(p);
    ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.lineWidth = 2;
    for (let x = a0 + 30; x < a1; x += 60) { ctx.beginPath(); ctx.arc(x, 24, 8, 0.4, TAU * 0.85); ctx.stroke(); }
    ctx.restore();
    // 金色流苏：±1.5°，周期 3 秒
    for (let x = a0 + 60; x < a1; x += 120) {
      const ang = (1.5 * Math.PI / 180) * Math.sin(TAU * t / 3 + x * 0.004);
      ctx.save(); ctx.translate(x, 70); ctx.rotate(ang);
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 26); ctx.stroke();
      ctx.fillStyle = COL.tassel; const tp = P2(polyD([[-7, 24], [7, 24], [10, 70], [-10, 70]])); ctx.fill(tp); ctx.strokeStyle = COL.ink; ctx.stroke(tp);
      ctx.restore();
    }
  }
  function drawFloor(ctx, x0, x1) { // 地面线 y=880，回纹花纹条，高 14px
    const a0 = Math.floor(x0 / 28) * 28 - 28;
    ctx.fillStyle = COL.floor; ctx.fillRect(a0, FLOOR, x1 - a0 + 56, 14);
    ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.lineWidth = 1.6; ctx.strokeStyle = '#000';
    for (let x = a0; x < x1 + 28; x += 14) { ctx.beginPath(); ctx.moveTo(x + 2, FLOOR + 11); ctx.lineTo(x + 2, FLOOR + 3); ctx.lineTo(x + 10, FLOOR + 3); ctx.lineTo(x + 10, FLOOR + 8); ctx.lineTo(x + 6, FLOOR + 8); ctx.stroke(); }
    ctx.restore();
  }

  // ---------- 一个镜头画进缓冲区 ----------
  function lightAt(shot, t) {
    let v = shot.light != null ? shot.light : 1;
    for (const k of (shot.lightKeys || []).slice().sort((a, b) => a.at - b.at)) if (t >= k.at) v = lerp(v, k.to, ease((t - k.at) / (k.dur || 0.5)));
    return v;
  }
  function renderShot(ctx, shot, t, lightMul) {
    const states = (shot.cast || []).map(m => ({ m, st: castState(m, t, shot) }));
    const cam = camera(shot, t, states), light = clamp(lightAt(shot, t) * lightMul, 0, 1);
    const flick = 1 + 0.06 * (noise1(t * 7) * 2 - 1);  // 油灯闪烁 ±6%
    // 幕布
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = 'none';
    const g = ctx.createRadialGradient(W / 2, H * 0.45, 60, W / 2, H / 2, W * 0.62);
    g.addColorStop(0, COL.screenIn); g.addColorStop(1, COL.screenOut);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.setTransform(cam.z, 0, 0, cam.z, W / 2 - cam.x * cam.z, H / 2 - cam.y * cam.z);
    ctx.globalAlpha = 0.08; ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = ctx.createPattern(paper, 'repeat');
    ctx.fillRect(cam.x - W / cam.z, cam.y - H / cam.z, 2 * W / cam.z, 2 * H / cam.z); ctx.restore();
    // 皮影层：布景、人物、帷幔、地面
    const fx = [], heads = {}, rods = [];
    plg.setTransform(1, 0, 0, 1, 0, 0); plg.globalCompositeOperation = 'source-over'; plg.globalAlpha = 1; plg.clearRect(0, 0, W, H);
    plg.setTransform(cam.z, 0, 0, cam.z, W / 2 - cam.x * cam.z, H / 2 - cam.y * cam.z);
    const vx0 = cam.x - W / 2 / cam.z, vx1 = cam.x + W / 2 / cam.z;
    const props = (shot.scene && SCENES[shot.scene] ? SCENES[shot.scene] : []).concat(shot.props || []);
    for (const p of props.filter(p => !p.front)) drawProp(plg, p, t, fx, cam);
    plg.save(); plg.beginPath(); plg.rect(vx0 - 400, -2000, vx1 - vx0 + 800, FLOOR + 2000 + 1); plg.clip();
    let doors = props.find(p => p.type === 'innDoors');
    const inn = props.find(p => p.type === 'inn');
    if (inn && !doors) doors = { type: 'innDoors', x: inn.x, door: inn.door };
    for (const { m, st } of states.slice().sort((a, b) => a.st.layer - b.st.layer)) {
      if (st.alpha <= 0.001) continue;
      if (m.behindDoor && doors) { // 门后的人：身体被门扇挡住，只有近侧手臂伸到门外
        plg.save(); plg.beginPath(); plg.rect(doors.x - 85, FLOOR - 270, 170, 270); plg.clip();
        drawPuppet(plg, st.def, Object.assign({}, st, { skipNear: true }));
        plg.restore();
        drawProp(plg, doors, t, fx, cam);
        const out = drawPuppet(plg, st.def, Object.assign({}, st, { onlyNear: true }));
        heads[m.id || m.who] = { p: out.head, face: st.face, alpha: st.alpha, hands: out.hands };
        continue;
      }
      const out = drawPuppet(plg, st.def, st);
      heads[m.id || m.who] = { p: out.head, face: st.face, alpha: st.alpha, hands: out.hands };
      for (const r of out.rods) rods.push({ p: r, a: st.alpha });
      if (out.sword) fx.push({ kind: 'sword', key: shot.id + ':' + (m.id || m.who), ...out.sword });
      if (out.jade) heads[(m.id || m.who) + ':jade'] = { p: out.jade };
    }
    if (doors && !states.some(o => o.m.behindDoor)) drawProp(plg, doors, t, fx, cam);
    plg.restore();
    for (const p of props.filter(p => p.front)) drawProp(plg, p, t, fx, cam);
    drawFloor(plg, vx0, vx1);
    drawValance(plg, vx0, vx1, t);
    // 操纵杆：颈与双手各一根，直线延伸到画面底部
    plg.setTransform(1, 0, 0, 1, 0, 0); plg.strokeStyle = 'rgba(30,18,10,0.85)'; plg.lineWidth = Math.max(1, cam.z);
    for (const r of rods) { plg.globalAlpha = r.a; plg.beginPath(); plg.moveTo(r.p[0], r.p[1]); plg.lineTo(r.p[0], H + 4); plg.stroke(); }
    plg.globalAlpha = 1;
    // 合成：柔和投影 + 透色（正片叠底）
    ctx.save(); ctx.globalAlpha = 0.25; ctx.filter = `brightness(0) blur(${(6 * cam.z).toFixed(1)}px)`; ctx.drawImage(pl, 8 * cam.z, 6 * cam.z); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(pl, 0, 0); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(vign, 0, 0); ctx.restore();
    // 本集色调（如夜景冷青滤镜）
    if (shot.tint) { ctx.save(); ctx.globalAlpha = shot.tint.opacity != null ? shot.tint.opacity : 0.35; ctx.fillStyle = shot.tint.color; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    // 灯焰与剑光
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const e of fx) {
      if (e.kind === 'flame') continue; // 灯焰在亮度遮罩之后单独画
      if (e.kind === 'warm') { // 门缝透出的暖光
        const [a0, b0] = toS(cam, e.x0, e.y0), [a1, b1] = toS(cam, e.x1, e.y1), cx = (a0 + a1) / 2;
        const wg = ctx.createRadialGradient(cx, (b0 + b1) / 2, 10, cx, (b0 + b1) / 2, 360 * cam.z);
        wg.addColorStop(0, `rgba(255,190,100,${0.45 * e.v / 0.35})`); wg.addColorStop(1, 'rgba(255,150,60,0)');
        ctx.fillStyle = wg; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(255,200,120,0.85)'; ctx.fillRect(a0, b0, a1 - a0, b1 - b0);
      } else if (e.kind === 'sword') {
        let tr = trails.get(e.key); if (!tr) trails.set(e.key, tr = []);
        if (tr.lastF !== curFrame) { tr.push({ base: e.base, tip: e.tip }); tr.lastF = curFrame; while (tr.length > 7) tr.shift(); }
        for (let i = 1; i < tr.length; i++) {
          const a = i / tr.length, p0 = tr[i - 1], p1 = tr[i];
          ctx.fillStyle = `rgba(255,205,120,${0.2 * a * a})`;
          ctx.beginPath(); ctx.moveTo(p0.base[0], p0.base[1]); ctx.lineTo(p0.tip[0], p0.tip[1]); ctx.lineTo(p1.tip[0], p1.tip[1]); ctx.lineTo(p1.base[0], p1.base[1]); ctx.closePath(); ctx.fill();
        }
      }
    }
    ctx.restore();
    // 全局亮度：暗场 0.15，正常 1
    if (light < 1) { ctx.save(); ctx.fillStyle = `rgba(8,4,2,${(1 - light) * 0.92})`; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    // 灯焰：画在亮度遮罩之后，暗场里也看得见（随亮度减弱但不熄灭）
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.4 + 0.6 * light;
    for (const e of fx) if (e.kind === 'flame') {
      const [sx, sy] = toS(cam, e.x, e.y), fl = 1 + 0.06 * (noise1(t * 9 + e.seed) * 2 - 1), r = (e.small ? 14 : 22) * cam.z * fl;
      const fg = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 4);
      fg.addColorStop(0, `rgba(255,236,190,${0.95 * fl})`); fg.addColorStop(0.18, 'rgba(255,179,71,0.7)'); fg.addColorStop(0.5, 'rgba(255,179,71,0.18)'); fg.addColorStop(1, 'rgba(255,179,71,0)');
      ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(sx, sy, r * 4, 0, TAU); ctx.fill();
      ctx.fillStyle = COL.flame; ctx.beginPath(); ctx.ellipse(sx, sy - r * 0.2, r * 0.32, r * 0.6, 0, 0, TAU); ctx.fill();
    }
    ctx.restore();
    drawEffects(ctx, shot, t, cam, heads);
    drawShotOverlays(ctx, shot, t, cam, heads, light);
  }

  // ---------- 特效 ----------
  // effects: [{ type:'pass', item:'gold', from, to, at, dur }, { type:'sparkle', who, hand, at, dur, color }]
  function drawEffects(ctx, shot, t, cam, heads) {
    for (const e of shot.effects || []) {
      const u = t - e.at;
      if (e.type === 'pass' && u >= 0 && u <= (e.dur || 0.7)) {
        const a = heads[e.from], b = heads[e.to]; if (!a || !b || !a.hands || !b.hands) continue;
        const pa = a.hands[e.fromHand || 'near'], pb = b.hands[e.toHand || 'near'], k = ease(u / (e.dur || 0.7));
        const x = lerp(pa[0], pb[0], k), y = lerp(pa[1], pb[1], k) - Math.sin(Math.PI * k) * 90 * cam.z;
        ctx.save(); ctx.translate(x, y); ctx.scale(cam.z, cam.z); ctx.rotate(k * 4);
        ctx.fillStyle = 'rgba(232,194,90,0.98)'; ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.ellipse(0, 0, 17, 10, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
      }
      if (e.type === 'sparkle' && u >= 0 && u <= (e.dur || 1.6)) {
        const h = heads[e.who]; if (!h) continue;
        const o = (h.hands && h.hands[e.hand || 'near']) || h.p, col = e.color || '#E8C25A', n = e.count || 40;
        const r = parseInt(col.slice(1, 3), 16), g = parseInt(col.slice(3, 5), 16), b = parseInt(col.slice(5, 7), 16);
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < n; i++) { // 无状态粒子：由序号决定方向与速度
          const ang = hash(i * 3.1) * TAU, sp = (60 + 160 * hash(i * 7.7)) * cam.z, life = 0.8 + 0.8 * hash(i * 1.3);
          if (u > life) continue;
          const x = o[0] + Math.cos(ang) * sp * u, y = o[1] + Math.sin(ang) * sp * u - 60 * u * cam.z, al = 1 - u / life;
          ctx.fillStyle = `rgba(${r},${g},${b},${al})`; ctx.beginPath(); ctx.arc(x, y, (2 + 3 * hash(i)) * cam.z * (0.6 + al * 0.4), 0, TAU); ctx.fill();
        }
        ctx.restore();
      }
    }
  }

  // ---------- 文字叠层（随镜头一起溶解） ----------
  function seal(ctx, cx, cy, size, k) { // 红印章，「盖下」：缩放 1.4→1.0，0.2 秒
    if (k <= 0) return;
    const s = lerp(1.4, 1, ease(k));
    ctx.save(); ctx.globalAlpha = Math.min(1, k * 2); ctx.translate(cx, cy); ctx.scale(s, s);
    ctx.fillStyle = COL.seal; ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.strokeStyle = 'rgba(255,240,230,0.5)'; ctx.lineWidth = 2; ctx.strokeRect(-size / 2 + 5, -size / 2 + 5, size - 10, size - 10);
    ctx.fillStyle = '#fff'; ctx.font = `${size * 0.36}px ${FONT_CAL}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('历', 0, -size * 0.19); ctx.fillText('史', 0, size * 0.21);
    ctx.restore();
  }
  function vChars(ctx, s, x, y, size, color, t0, t, stagger, font) {
    let yy = y; const chars = [...s];
    chars.forEach((ch, i) => {
      const a = sstep(t0 + i * stagger, t0 + i * stagger + 0.35, t);
      if (a > 0) { ctx.globalAlpha = a; ctx.fillStyle = color; ctx.font = `${size}px ${font || FONT_CAL}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText(ch, x, yy); }
      yy += size * 1.08;
    });
    ctx.globalAlpha = 1; return yy;
  }
  function drawShotOverlays(ctx, shot, t, cam, heads, light) {
    // 深色字在暗场里看不见：亮度低于 ~0.5 时逐渐换成幕布浅色
    const inkK = sstep(0.32, 0.62, light == null ? 1 : light);
    const inkCol = `rgb(${Math.round(lerp(246, 42, inkK))},${Math.round(lerp(231, 26, inkK))},${Math.round(lerp(193, 16, inkK))})`;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over';
    // 钩子句：暗场居中，72px，逐字淡入
    if (shot.kind === 'hook' && shot.hookText) {
      const chars = [...shot.hookText], d = shot.end - shot.start, stg = Math.min(0.12, d * 0.55 / chars.length), h0 = shot.textAt != null ? shot.textAt - 0.1 : shot.start;
      ctx.font = `72px ${FONT_CAL}`; ctx.textBaseline = 'middle';
      const ws = chars.map(c => ctx.measureText(c).width), tot = ws.reduce((a, b) => a + b, 0);
      let x = W / 2 - tot / 2;
      chars.forEach((c, i) => { const a = sstep(h0 + 0.1 + i * stg, h0 + 0.1 + i * stg + 0.35, t); ctx.globalAlpha = a; ctx.fillStyle = COL.hook; ctx.fillText(c, x, H / 2); x += ws[i]; });
      ctx.globalAlpha = 1;
    }
    // 片名：竖排居中偏右，120px，右下角盖章
    if (shot.kind === 'title' && shot.title) {
      const n = [...shot.title].length, x = W * 0.62, y0 = H / 2 - n * 120 * 1.08 / 2;
      const yEnd = vChars(ctx, shot.title, x, y0, 120, inkCol, shot.start + 0.15, t, 0.18);
      seal(ctx, x + 100, yEnd - 40, 84, (t - (shot.start + 0.2 + n * 0.18 + 0.3)) / 0.2);
    }
    // 名牌：头顶斜上方红底竖牌，弹入后停 2 秒淡出
    for (const np of shot.nameplates || []) {
      const h = heads[np.who]; if (!h || !h.p) continue;
      const u = t - np.at; if (u < 0 || u > 2.65) continue;
      const k = elastic(u / 0.35) * (1 - sstep(2.35, 2.65, u));
      const text = np.text || (CHARS[np.who] ? CHARS[np.who].name : np.who), n = [...text].length;
      const pw = 46, ph = n * 30 + 20, px = h.p[0] + (np.dx != null ? np.dx : 70 * Math.sign(h.face || 1)), py = h.p[1] + (np.dy != null ? np.dy : -40) - ph;
      ctx.save(); ctx.globalAlpha = clamp(k, 0, 1) * h.alpha; ctx.translate(px, py + ph); ctx.scale(Math.max(0.01, k), Math.max(0.01, k)); ctx.translate(-px, -(py + ph));
      ctx.fillStyle = COL.plate; ctx.fillRect(px - pw / 2, py, pw, ph);
      ctx.strokeStyle = 'rgba(246,231,193,0.5)'; ctx.lineWidth = 1.5; ctx.strokeRect(px - pw / 2 + 4, py + 4, pw - 8, ph - 8);
      ctx.fillStyle = '#fff'; ctx.font = `600 26px ${FONT_SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      [...text].forEach((c, i) => ctx.fillText(c, px, py + 10 + i * 30));
      ctx.restore();
    }
    // 数字弹出：红色书法数字，弹性放大
    for (const nb of shot.numbers || []) {
      const u = t - nb.at, dur = nb.dur || 2.2; if (u < 0 || u > dur) continue;
      let x = nb.x, y = nb.y;
      if (nb.who && heads[nb.who + (nb.anchor === 'jade' ? ':jade' : '')]) { const h = heads[nb.who + (nb.anchor === 'jade' ? ':jade' : '')]; x = h.p[0] + (nb.dx || 0); y = h.p[1] + (nb.dy || -60); }
      const k = elastic(u / 0.5), a = 1 - sstep(dur - 0.3, dur, u);
      ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(k, k);
      ctx.fillStyle = COL.seal; ctx.font = `${nb.size || 120}px ${FONT_CAL}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.strokeStyle = 'rgba(246,231,193,0.9)'; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.strokeText(nb.text, 0, 0); ctx.fillText(nb.text, 0, 0);
      ctx.restore();
    }
    // 竖排大字：画面右侧，96px，逐字淡入，最后盖章，停到镜头结束
    if (shot.bigText && t >= shot.bigText.at) {
      const cols = shot.bigText.columns; let t0 = shot.bigText.at, lastEnd = 0, lastX = 0;
      cols.forEach((col, i) => {
        const x = (shot.bigText.x || 1730) - i * 130;
        lastEnd = vChars(ctx, col, x, shot.bigText.y || 150, 96, shot.bigText.colors ? shot.bigText.colors[i] : inkCol, t0, t, 0.2);
        t0 += [...col].length * 0.2 + 0.15; lastX = x;
      });
      seal(ctx, lastX - 8, lastEnd + 46, 72, (t - t0 - 0.1) / 0.2);
    }
    ctx.restore();
  }
  const bigTextVisible = (shot, t) => shot.bigText && t >= shot.bigText.at;

  // ---------- 转场 ----------
  function drawCurtain(ctx, xL, xR) { // 深红幕布
    if (xR <= xL) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    const g = ctx.createLinearGradient(xL, 0, xR, 0);
    for (let i = 0; i <= 12; i++) g.addColorStop(i / 12, i % 2 ? '#7a1a16' : '#5e1210');
    ctx.fillStyle = g; ctx.fillRect(xL, 0, xR - xL, H);
    ctx.fillStyle = COL.tassel; ctx.fillRect(xL, 0, xR - xL, 10); ctx.fillRect(xL, H - 10, xR - xL, 10);
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(xR, 0); ctx.lineTo(xR, H); ctx.moveTo(xL, 0); ctx.lineTo(xL, H); ctx.stroke();
    ctx.restore();
  }
  function scrollRod(ctx, x) {
    const g = ctx.createLinearGradient(x - 14, 0, x + 14, 0);
    g.addColorStop(0, '#3a2414'); g.addColorStop(0.5, '#8a5a30'); g.addColorStop(1, '#3a2414');
    ctx.fillStyle = g; ctx.fillRect(x - 14, -10, 28, H + 20);
    ctx.fillStyle = COL.tassel; ctx.fillRect(x - 18, 0, 36, 22); ctx.fillRect(x - 18, H - 22, 36, 22);
  }

  // ---------- 逐帧 ----------
  let curFrame = 0;
  function shotIndexAt(t) { const s = TL.shots; for (let i = s.length - 1; i >= 0; i--) if (t >= s[i].start) return i; return 0; }
  function renderStage(t) {
    const S = TL.shots, endT = TL.voiceEnd;
    // 片尾：配音结束后灯灭，定格最后一个画面 2 秒
    if (t >= endT) {
      const last = S[S.length - 1], lm = lerp(1, 0.15 / Math.max(0.15, last.light != null ? last.light : 1), ease((t - endT) / 0.5));
      renderShot(bg2, last, endT - 1 / TL.fps, lm); return;
    }
    const i = shotIndexAt(t), cur = S[i], next = S[i + 1];
    const trIn = i > 0 ? (cur.transition || 'dissolve') : 'cut';
    const tn = next ? (next.transition || 'dissolve') : 'cut';
    // 进入下一镜头之前的半段
    if (next && tn === 'dissolve' && t > next.start - 0.2) return mix(cur, next, t, (t - (next.start - 0.2)) / 0.4);
    if (next && tn === 'lights' && t > next.start - 0.5) return renderShot(bg2, cur, t, lerp(1, 0.15, ease((t - (next.start - 0.5)) / 0.5)));
    if (next && tn === 'curtain' && t > next.start - 0.5) { renderShot(bg2, cur, t, 1); drawCurtain(bg2, 0, W * ease((t - (next.start - 0.5)) / 0.5)); return; }
    // 进入当前镜头之后的半段
    const u = t - cur.start, prev = S[i - 1];
    if (trIn === 'dissolve' && u < 0.2 && prev) return mix(prev, cur, t, (u + 0.2) / 0.4);
    if (trIn === 'lights' && u < 0.5) return renderShot(bg2, cur, t, lerp(0.15, 1, ease(u / 0.5)));
    if (trIn === 'curtain' && u < 0.5) { renderShot(bg2, cur, t, 1); drawCurtain(bg2, W * ease(u / 0.5), W); return; }
    if (trIn === 'scroll' && u < 0.8 && prev) {
      renderShot(bg2, prev, t, 1);
      const k = ease(u / 0.8), half = W / 2 * k;
      renderShot(tmpB.getContext('2d'), cur, t, 1);
      bg2.save(); bg2.setTransform(1, 0, 0, 1, 0, 0); bg2.beginPath(); bg2.rect(W / 2 - half, 0, half * 2, H); bg2.clip(); bg2.drawImage(tmpB, 0, 0); bg2.restore();
      bg2.save(); bg2.setTransform(1, 0, 0, 1, 0, 0); scrollRod(bg2, W / 2 - half); scrollRod(bg2, W / 2 + half); bg2.restore();
      return;
    }
    renderShot(bg2, cur, t, 1);
  }
  function mix(a, b, t, k) {
    k = clamp(k, 0, 1);
    renderShot(bg2, a, t, 1);
    const tb = tmpB.getContext('2d'); renderShot(tb, b, t, 1);
    bg2.save(); bg2.setTransform(1, 0, 0, 1, 0, 0); bg2.globalAlpha = ease(k); bg2.drawImage(tmpB, 0, 0); bg2.restore();
  }

  // ---------- 字幕 ----------
  function subtitleAt(t) {
    const i = shotIndexAt(t), sh = TL.shots[i];
    if (t >= TL.voiceEnd || (sh.kind === 'hook' && !sh.subtitles) || sh.kind === 'title' || bigTextVisible(sh, t)) return null;
    for (const s of TL.subtitles) if (t >= s.start && t < s.end) return s.text;
    return null;
  }
  function drawSubtitle(ctx, text, x, y, size, fill, stroke) {
    ctx.save(); ctx.font = `500 ${size}px ${FONT_SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round'; ctx.strokeStyle = stroke; ctx.lineWidth = 6; ctx.strokeText(text, x, y); // 6px 描边 ≈ 外侧 3px
    ctx.fillStyle = fill; ctx.fillText(text, x, y); ctx.restore();
  }

  window.ENGINE = {
    setup(timeline) {
      TL = timeline;
      main = document.getElementById('c');
      main.width = TL.vertical ? 1080 : W; main.height = TL.vertical ? 1920 : H;
      mg = main.getContext('2d');
      buf = mk(W, H); bg2 = buf.getContext('2d'); pl = mk(W, H); plg = pl.getContext('2d'); tmpB = mk(W, H);
      paper = makePaper(); vign = makeVign();
      return { w: main.width, h: main.height };
    },
    renderFrame(f) {
      curFrame = f;
      const t = f / TL.fps;
      renderStage(t);
      const sub = subtitleAt(t);
      mg.setTransform(1, 0, 0, 1, 0, 0); mg.globalAlpha = 1; mg.globalCompositeOperation = 'source-over';
      if (!TL.vertical) {
        mg.drawImage(buf, 0, 0);
        if (sub) drawSubtitle(mg, sub, W / 2, 1010, 44, COL.sub, COL.subStroke);
      } else {
        // 竖屏：舞台等比缩放到 1080 宽，垂直居中；上方系列名，下方字幕
        const sh = 1080 * H / W, y0 = (1920 - sh) / 2;
        mg.fillStyle = '#21140c'; mg.fillRect(0, 0, 1080, 1920);
        mg.drawImage(buf, 0, y0, 1080, sh);
        mg.strokeStyle = COL.tassel; mg.lineWidth = 3; mg.strokeRect(0, y0 - 2, 1080, sh + 4);
        mg.save(); mg.fillStyle = COL.hook; mg.font = `76px ${FONT_CAL}`; mg.textAlign = 'center'; mg.textBaseline = 'middle';
        mg.fillText(TL.seriesLine || '', 540, y0 - 150); mg.restore();
        if (sub) drawSubtitle(mg, sub, 540, y0 + sh + 150, 56, COL.hook, '#21140c');
      }
      if (TL.fadeIn && t < 0.3) { mg.fillStyle = `rgba(0,0,0,${1 - t / 0.3})`; mg.fillRect(0, 0, main.width, main.height); }
      return main.toDataURL('image/jpeg', 0.92);
    }
  };
})();
