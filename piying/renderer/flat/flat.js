// 扁平插画竖屏模板（生活小技巧系列）
// 1080×1920：上方 0-300 标题栏，中间 300-1500 演示区，下方 1500-1750 字幕。
// 与皮影模板共用 build.mjs：同样的 timeline（时间都是成片秒数），ENGINE.setup / renderFrame 接口一致。
(function () {
  const W = 1080, H = 1920, TAU = Math.PI * 2;
  const DEMO = [300, 1500], SUB_Y = 1625;
  const C = {
    bg: '#FFF8EE', red: '#F05A3C', mint: '#3CB58A', ink: '#2B2B2B', white: '#FFFFFF', yellow: '#F6B93B',
    garlic: '#F7EBD3', garlicSkin: '#E8D3B0', onion: '#A2577F', onionLight: '#C97BA6', egg: '#F8E3C3', yolk: '#FFC23D',
    lemon: '#FFD24A', warn: '#FFC53D', mold: '#7E9A74', woodBoard: '#D9A066',
    water: 'rgba(120,200,230,0.35)', waterLine: '#5DB7DA', skin: '#F9D2B0', tear: '#5DB7DA', steel: '#D9DEE3', wood: '#9A6440',
    fridge: '#E6F3EE', gas: '#8C9AA3', gray: '#B9B2A8'
  };
  const LW = 4;   // 描边 4px
  const FONT = 'NSans';

  // ---------- 工具 ----------
  const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
  const lerp = (a, b, t) => a + (b - a) * t;
  const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const ease = t => { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  // 弹性入场：0.8 → 1.05 → 1
  const popScale = u => u <= 0 ? 0.8 : u < 0.6 ? lerp(0.8, 1.05, ease(u / 0.6)) : u < 1 ? lerp(1.05, 1, ease((u - 0.6) / 0.4)) : 1;
  // 数字弹出：更夸张 0.4 → 1.25 → 1
  const bigPop = u => u <= 0 ? 0.4 : u < 0.55 ? lerp(0.4, 1.25, ease(u / 0.55)) : u < 1 ? lerp(1.25, 1, ease((u - 0.55) / 0.45)) : 1;
  function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function paint(ctx, fill, lw) { if (fill) { ctx.fillStyle = fill; ctx.fill(); } ctx.lineWidth = lw || LW; ctx.strokeStyle = C.ink; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
  function blob(ctx, pts) { // 平滑闭合曲线
    const n = pts.length, m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    ctx.beginPath(); const s = m(pts[n - 1], pts[0]); ctx.moveTo(s[0], s[1]);
    for (let i = 0; i < n; i++) { const q = m(pts[i], pts[(i + 1) % n]); ctx.quadraticCurveTo(pts[i][0], pts[i][1], q[0], q[1]); }
    ctx.closePath();
  }
  function text(ctx, s, x, y, size, color, weight, align) {
    ctx.font = `${weight || 800} ${size}px ${FONT}`; ctx.fillStyle = color; ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y);
  }

  // ---------- 物件库（局部坐标，中心为原点） ----------
  const DRAW = {
    garlicBulb(ctx) {
      blob(ctx, [[0, -110], [60, -60], [110, 10], [90, 80], [0, 105], [-90, 80], [-110, 10], [-60, -60]]); paint(ctx, C.garlic);
      ctx.beginPath(); for (const x of [-50, 0, 50]) { ctx.moveTo(x * 0.4, -95); ctx.quadraticCurveTo(x * 1.3, 0, x * 0.8, 100); } ctx.lineWidth = 3; ctx.stroke();
      rr(ctx, -12, -150, 24, 50, 10); paint(ctx, C.garlicSkin);
      ctx.beginPath(); for (const x of [-30, -10, 10, 30]) { ctx.moveTo(x * 0.6, 102); ctx.lineTo(x, 125); } ctx.lineWidth = 3; ctx.stroke();
    },
    clove(ctx, P) {
      const peeled = P('peeled', 0);
      blob(ctx, [[0, -48], [28, -10], [30, 30], [0, 44], [-26, 32], [-22, -8]]);
      paint(ctx, peeled > 0.5 ? '#FFF6E0' : C.garlicSkin);
      if (peeled <= 0.5) { ctx.beginPath(); ctx.moveTo(-6, -40); ctx.quadraticCurveTo(-14, 0, -8, 38); ctx.moveTo(8, -38); ctx.quadraticCurveTo(14, 0, 10, 40); ctx.lineWidth = 2.5; ctx.stroke(); }
      else { ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.ellipse(-8, -6, 5, 14, 0.2, 0, TAU); ctx.fill(); }
    },
    skin(ctx, P) {
      const v = P('v', 0);
      ctx.beginPath(); ctx.moveTo(-26, 8); ctx.quadraticCurveTo(-4, -22 - v * 6, 26, -4); ctx.quadraticCurveTo(4, -6, -26, 8); paint(ctx, C.garlicSkin, 3);
    },
    bowl(ctx, P) { // 侧视碗；flip=1 时倒扣
      ctx.save(); if (P('flip', 0) > 0.5) ctx.rotate(Math.PI);
      const col = P('color', C.mint);
      ctx.beginPath(); ctx.moveTo(-160, -10); ctx.quadraticCurveTo(-150, 110, 0, 118); ctx.quadraticCurveTo(150, 110, 160, -10); ctx.closePath(); paint(ctx, col);
      rr(ctx, -172, -24, 344, 26, 13); paint(ctx, C.white);
      rr(ctx, -50, 112, 100, 22, 8); paint(ctx, col);
      ctx.restore();
    },
    timer(ctx, P, t, el) { // 倒计时圆环
      const from = P('from', 20), u = clamp((t - el.cd.at) / Math.max(0.1, el.cd.until - el.cd.at), 0, 1), left = Math.ceil(from * (1 - u) - 1e-6);
      ctx.beginPath(); ctx.arc(0, 0, 92, 0, TAU); paint(ctx, C.white);
      ctx.lineCap = 'round'; ctx.lineWidth = 18; ctx.strokeStyle = '#F3E6D6'; ctx.beginPath(); ctx.arc(0, 0, 70, 0, TAU); ctx.stroke();
      ctx.strokeStyle = C.red; ctx.beginPath(); ctx.arc(0, 0, 70, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - u)); ctx.stroke();
      if (P('fmt', 's') === 'mmss') { const sec = Math.ceil(from * (1 - u) - 1e-6); text(ctx, `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`, 0, 8, 46, C.ink, 900); const pre = P('prefix', ''); if (pre) text(ctx, pre, 0, -34, 28, C.red, 900); }
      else { text(ctx, String(left), 0, 2, 64, C.ink, 900); text(ctx, '秒', 0, 52, 26, C.ink, 700); }
    },
    finger(ctx) {
      rr(ctx, -34, -90, 68, 190, 34); paint(ctx, C.skin);
      rr(ctx, -22, -80, 44, 50, 18); paint(ctx, '#FFE9DA', 3);
      ctx.beginPath(); ctx.moveTo(-16, 20); ctx.lineTo(16, 20); ctx.moveTo(-16, 40); ctx.lineTo(16, 40); ctx.lineWidth = 3; ctx.stroke();
      ctx.strokeStyle = C.red; ctx.lineWidth = 5; for (const a of [-0.6, 0, 0.6]) { ctx.beginPath(); ctx.moveTo(Math.sin(a) * 60, -100 - Math.cos(a) * 20); ctx.lineTo(Math.sin(a) * 80, -112 - Math.cos(a) * 34); ctx.stroke(); }
    },
    eye(ctx, P, t) {
      ctx.beginPath(); ctx.moveTo(-80, 0); ctx.quadraticCurveTo(0, -70, 80, 0); ctx.quadraticCurveTo(0, 70, -80, 0); ctx.closePath(); paint(ctx, C.white);
      ctx.beginPath(); ctx.arc(0, 0, 28, 0, TAU); paint(ctx, C.ink); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-9, -9, 8, 0, TAU); ctx.fill();
      for (const [x, ph] of [[-46, 0], [40, 0.5]]) { const d = ((t * 0.9 + ph) % 1) * 70; ctx.save(); ctx.translate(x, 34 + d); blob(ctx, [[0, -20], [12, 2], [0, 14], [-12, 2]]); paint(ctx, C.tear, 3); ctx.restore(); }
    },
    onion(ctx) {
      blob(ctx, [[0, -120], [30, -70], [95, -20], [100, 50], [0, 100], [-100, 50], [-95, -20], [-30, -70]]); paint(ctx, C.onion);
      ctx.beginPath(); for (const x of [-45, 0, 45]) { ctx.moveTo(x * 0.25, -100); ctx.quadraticCurveTo(x * 1.4, 0, x * 0.6, 96); } ctx.strokeStyle = C.onionLight; ctx.lineWidth = 6; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -118); ctx.quadraticCurveTo(6, -140, 2, -158); paint(ctx, null, 5);
      ctx.beginPath(); for (const x of [-20, 0, 20]) { ctx.moveTo(x * 0.6, 98); ctx.lineTo(x, 116); } ctx.lineWidth = 3; ctx.stroke();
    },
    egg(ctx, P) {
      blob(ctx, [[0, -78], [44, -46], [58, 18], [36, 70], [0, 80], [-36, 70], [-58, 18], [-44, -46]]); paint(ctx, C.egg);
      ctx.fillStyle = '#FFF6E8'; ctx.beginPath(); ctx.ellipse(-20, -30, 10, 20, 0.3, 0, TAU); ctx.fill();
    },
    question(ctx) { text(ctx, '?', 0, 0, 170, C.red, 900); },
    plus(ctx) { text(ctx, '+', 0, 0, 90, C.ink, 900); },
    fridge(ctx, P) {
      const open = P('open', 0), w = 360, h = 600;
      rr(ctx, -w / 2, -h / 2, w, h, 36); paint(ctx, C.fridge);
      // 冰箱内部（门开时可见）
      rr(ctx, -w / 2 + 20, -h / 2 + 20, w - 40, h - 40, 20); paint(ctx, '#DFF3FA', 3);
      ctx.beginPath(); for (const y of [-120, 20, 150]) { ctx.moveTo(-w / 2 + 24, y); ctx.lineTo(w / 2 - 24, y); } ctx.lineWidth = 4; ctx.stroke();
      // 门：左侧铰链，开门时宽度收窄（平面化透视）
      const dw = w * lerp(1, 0.18, ease(open));
      rr(ctx, -w / 2, -h / 2, dw, h, 36); paint(ctx, C.mint);
      if (open < 0.6) { rr(ctx, -w / 2 + dw - 46, -60, 18, 130, 9); paint(ctx, C.white, 3); }
      rr(ctx, -w / 2 + 14, -h / 2 + 150, dw - 28, 5, 2); ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fill();
    },
    clock(ctx, P) {
      const pr = P('progress', 0);
      ctx.beginPath(); ctx.arc(0, 0, 80, 0, TAU); paint(ctx, C.white);
      ctx.fillStyle = 'rgba(240,90,60,0.25)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 66, -Math.PI / 2, -Math.PI / 2 + TAU * pr); ctx.closePath(); ctx.fill();
      for (let k = 0; k < 12; k++) { const a = k * TAU / 12; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 64, Math.sin(a) * 64); ctx.lineTo(Math.cos(a) * 72, Math.sin(a) * 72); ctx.lineWidth = 3; ctx.stroke(); }
      ctx.save(); ctx.rotate(TAU * pr * 6); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -56); ctx.lineWidth = 5; ctx.stroke(); ctx.restore();
      ctx.save(); ctx.rotate(TAU * pr * 0.5); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -36); ctx.lineWidth = 7; ctx.stroke(); ctx.restore();
      ctx.beginPath(); ctx.arc(0, 0, 8, 0, TAU); paint(ctx, C.red, 3);
    },
    gas(ctx, P, t) { // 刺激性气体：波浪线向上飘
      const amt = P('amount', 1), n = Math.round(lerp(2, 9, amt));
      ctx.strokeStyle = P('color', C.gas); ctx.lineCap = 'round';
      for (let i = 0; i < n; i++) {
        const x0 = (i - (n - 1) / 2) * 26, ph = (t * 0.8 + hash(i) * 3) % 1, len = lerp(60, 150, amt);
        ctx.globalAlpha = (1 - ph) * 0.9; ctx.lineWidth = 6;
        ctx.beginPath();
        for (let k = 0; k <= 12; k++) { const y = -ph * 120 - k * len / 12, x = x0 + Math.sin(k * 0.9 + t * 6 + i) * 10; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
    knife(ctx, P) {
      const dull = P('dull', 0) > 0.5;
      if (dull) { blob(ctx, [[-150, -26], [110, -30], [150, -10], [150, 24], [-150, 26]]); paint(ctx, '#C4C9CE'); ctx.beginPath(); for (let x = -130; x < 140; x += 40) { ctx.moveTo(x, 26); ctx.lineTo(x + 10, 18); ctx.lineTo(x + 20, 26); } ctx.lineWidth = 3; ctx.stroke(); }
      else { ctx.beginPath(); ctx.moveTo(-150, -24); ctx.lineTo(120, -24); ctx.quadraticCurveTo(160, -20, 170, 22); ctx.lineTo(-150, 22); ctx.closePath(); paint(ctx, C.steel); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-140, 14); ctx.lineTo(150, 14); ctx.stroke(); }
      rr(ctx, -260, -18, 120, 36, 16); paint(ctx, C.wood);
    },
    check(ctx, P, t, el) {
      const k = el.drawK; ctx.strokeStyle = C.mint; ctx.lineWidth = 22; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const pts = [[-50, 0], [-14, 38], [56, -46]], L1 = Math.hypot(36, 38), L2 = Math.hypot(70, 84), d = k * (L1 + L2);
      ctx.beginPath(); ctx.moveTo(...pts[0]);
      if (d <= L1) ctx.lineTo(lerp(pts[0][0], pts[1][0], d / L1), lerp(pts[0][1], pts[1][1], d / L1));
      else { ctx.lineTo(...pts[1]); const e = (d - L1) / L2; ctx.lineTo(lerp(pts[1][0], pts[2][0], e), lerp(pts[1][1], pts[2][1], e)); }
      ctx.stroke();
    },
    cross(ctx, P, t, el) {
      const k = el.drawK; ctx.strokeStyle = C.red; ctx.lineWidth = 22; ctx.lineCap = 'round';
      const a = clamp(k * 2, 0, 1), b = clamp(k * 2 - 1, 0, 1);
      ctx.beginPath(); ctx.moveTo(-44, -44); ctx.lineTo(lerp(-44, 44, a), lerp(-44, 44, a));
      if (b > 0) { ctx.moveTo(44, -44); ctx.lineTo(lerp(44, -44, b), lerp(-44, 44, b)); }
      ctx.stroke();
    },
    label(ctx, P) { // 圆角文字标签
      const s = P('text', ''), size = P('size', 44), col = P('color', C.red), fg = P('fg', C.white);
      ctx.font = `800 ${size}px ${FONT}`; const w = ctx.measureText(s).width + size * 1.2, h = size * 1.7;
      rr(ctx, -w / 2, -h / 2, w, h, h / 2); paint(ctx, col);
      text(ctx, s, 0, 2, size, fg, 800);
    },
    title(ctx, P) { text(ctx, P('text', ''), 0, 0, P('size', 110), P('color', C.ink), 900); },
    bignum(ctx, P) { // 关键数字
      const s = P('text', ''), size = P('size', 150);
      ctx.font = `900 ${size}px ${FONT}`; ctx.lineWidth = 14; ctx.lineJoin = 'round'; ctx.strokeStyle = C.white; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.strokeText(s, 0, 0);
      ctx.lineWidth = 5; ctx.strokeStyle = C.ink; ctx.strokeText(s, 0, 0); ctx.fillStyle = P('color', C.red); ctx.fillText(s, 0, 0);
    },
    waterBowl(ctx, P, t, el) { // 透明水碗侧面剖视
      const w = 300, h = 230, lvl = P('level', 0.7), rip = el.k && el.k.ripple ? el.k.ripple : null;
      ctx.beginPath(); ctx.moveTo(-w / 2, -h / 2); ctx.lineTo(-w / 2 + 20, h / 2 - 30); ctx.quadraticCurveTo(-w / 2 + 26, h / 2, 0, h / 2); ctx.quadraticCurveTo(w / 2 - 26, h / 2, w / 2 - 20, h / 2 - 30); ctx.lineTo(w / 2, -h / 2);
      const wy = h / 2 - h * lvl;
      ctx.save(); ctx.clip(); ctx.fillStyle = C.water; ctx.fillRect(-w, wy, 2 * w, h); ctx.restore();
      ctx.lineWidth = LW; ctx.strokeStyle = C.ink; ctx.stroke();
      // 水面 + 波纹
      ctx.strokeStyle = C.waterLine; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-w / 2 + 10, wy); ctx.lineTo(w / 2 - 10, wy); ctx.stroke();
      for (const r of rip || []) { const u = t - r.at; if (u < 0 || u > 1.2) continue; for (let k = 0; k < 3; k++) { const uu = u - k * 0.15; if (uu < 0) continue; ctx.globalAlpha = Math.max(0, 1 - uu / 1.0); ctx.beginPath(); ctx.ellipse(r.x || 0, wy, 20 + uu * 120, 6 + uu * 14, 0, 0, TAU); ctx.stroke(); } ctx.globalAlpha = 1; }
    },
    eggSection(ctx, P) { // 鸡蛋剖面：钝端气室
      const air = P('air', 0.1);
      blob(ctx, [[0, -150], [84, -90], [110, 30], [70, 132], [0, 152], [-70, 132], [-110, 30], [-84, -90]]); paint(ctx, '#FFFDF6');
      ctx.save(); ctx.clip();
      const ay = 152 - lerp(14, 90, air); // 钝端在下方
      ctx.fillStyle = '#D7EEF7'; ctx.fillRect(-200, ay, 400, 200);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(-140, ay); ctx.quadraticCurveTo(0, ay - 26, 140, ay); ctx.stroke(); ctx.setLineDash([]);
      ctx.restore();
      ctx.beginPath(); ctx.arc(0, -10, 54, 0, TAU); paint(ctx, C.yolk);
      blob(ctx, [[0, -150], [84, -90], [110, 30], [70, 132], [0, 152], [-70, 132], [-110, 30], [-84, -90]]); paint(ctx, null, 6);
      if (air > 0.05) text(ctx, '气室', 0, 152 - lerp(14, 90, air) / 2 + 2, 30, C.ink, 800);
    },
    bowlSection(ctx, P, t) { // 两碗扣合的剖面：蒜瓣来回撞，蒜皮剥离
      ctx.beginPath(); ctx.arc(0, 0, 200, 0, TAU); paint(ctx, '#FFFFFF');
      ctx.beginPath(); ctx.arc(0, 0, 200, 0, TAU); ctx.lineWidth = 26; ctx.strokeStyle = C.mint; ctx.stroke(); ctx.lineWidth = LW; ctx.strokeStyle = C.ink;
      ctx.beginPath(); ctx.arc(0, 0, 213, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 187, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-214, 0); ctx.lineTo(214, 0); ctx.setLineDash([12, 10]); ctx.stroke(); ctx.setLineDash([]);
      const off = P('peel', 0);
      for (let i = 0; i < 5; i++) {
        const ph = t * 2.2 + i * 1.3, x = Math.sin(ph * 1.7 + i) * 110, y = Math.cos(ph * 2.3 + i * 2) * 110;
        ctx.save(); ctx.translate(x, y); ctx.rotate(ph); ctx.scale(0.9, 0.9); DRAW.clove(ctx, k => k === 'peeled' ? off : 0); ctx.restore();
        // 撞击线
        const hit = Math.abs(Math.cos(ph * 2.3 + i * 2)) > 0.93;
        if (hit) { ctx.save(); ctx.translate(x * 1.45, y * 1.45); ctx.strokeStyle = C.red; ctx.lineWidth = 5; for (const a of [-0.5, 0, 0.5]) { const b = Math.atan2(y, x) + a; ctx.beginPath(); ctx.moveTo(Math.cos(b) * 6, Math.sin(b) * 6); ctx.lineTo(Math.cos(b) * 26, Math.sin(b) * 26); ctx.stroke(); } ctx.restore(); }
        if (off > 0.2) { ctx.save(); ctx.translate(x + Math.sin(ph * 3) * 40 * off, y + 30 * off); ctx.rotate(ph * 1.5); ctx.scale(0.7, 0.7); DRAW.skin(ctx, () => 0); ctx.restore(); }
      }
    },
    follow(ctx, P, t, el) { // 关注按钮：点击后变已关注
      const tapAt = el.tap ? el.tap.at : null, tap = tapAt != null ? t - tapAt : -1, done = tap > 0.15;
      const sq = tap > 0 && tap < 0.3 ? 1 - 0.12 * Math.sin(Math.PI * tap / 0.3) : 1;
      ctx.save(); ctx.scale(sq, sq);
      rr(ctx, -200, -60, 400, 120, 60); paint(ctx, done ? C.mint : C.red);
      text(ctx, done ? '✓ 已关注' : '＋ 关注', 0, 4, 54, C.white, 900);
      ctx.restore();
      // 点击的小手
      const hk = tapAt != null ? sstep(tapAt - 0.6, tapAt, t) * (1 - sstep(tapAt + 0.6, tapAt + 1.0, t)) : 0;
      if (hk > 0) { ctx.save(); ctx.globalAlpha *= hk; ctx.translate(110 + (1 - hk) * 60, 70 + (1 - hk) * 60); ctx.rotate(-0.4); rr(ctx, -20, -10, 40, 90, 20); paint(ctx, C.skin); rr(ctx, -20, 40, 70, 80, 26); paint(ctx, C.skin); ctx.restore(); }
    },
    iconCircle(ctx, P) { // 口诀小图标
      ctx.beginPath(); ctx.arc(0, 0, 70, 0, TAU); paint(ctx, P('bg', '#FFFFFF'));
      const ic = P('icon', 'garlic'); ctx.save();
      const none = () => 0;
      if (ic === 'garlic') { ctx.scale(0.42, 0.42); DRAW.garlicBulb(ctx); } else if (ic === 'onion') { ctx.scale(0.42, 0.42); DRAW.onion(ctx); }
      else if (ic === 'microwave') { ctx.scale(0.2, 0.2); DRAW.microwave(ctx, none, 0, {}); } else if (ic === 'faucet') { ctx.scale(0.36, 0.36); ctx.translate(30, 20); DRAW.faucet(ctx, none, 0, {}); }
      else if (ic === 'board') { ctx.scale(0.2, 0.2); DRAW.board(ctx, none, 0, {}); ctx.translate(40, 0); ctx.scale(0.9, 0.9); DRAW.lemonHalf(ctx, none); }
      else { ctx.scale(0.62, 0.62); DRAW.egg(ctx); }
      ctx.restore();
    },
    // ---------- 清洁三招 ----------
    microwave(ctx, P, t, el) { // 微波炉剖面：门透明，可见内腔、转盘、油污、蒸汽；part=body|door 可拆成两层，中间夹碗
      const light = P('light', 0), grime = P('grime', 0), steam = P('steam', 0), open = P('open', 0), wipe = P('wipe', -1), part = P('part', 'all');
      const ix = -230, iy = -140, iw = 340, ih = 280;
      if (part !== 'door') {
      const spinA = el && el.k && el.k.spin ? integ(el, 'spin', t) * 3 : 0;
      rr(ctx, -260, -170, 520, 340, 34); paint(ctx, '#F4F1EA');
      // 内腔
      rr(ctx, ix, iy, iw, ih, 18);
      const lc = [Math.round(lerp(92, 255, light)), Math.round(lerp(88, 226, light)), Math.round(lerp(84, 150, light))];
      paint(ctx, `rgb(${lc[0]},${lc[1]},${lc[2]})`, 3);
      ctx.save(); rr(ctx, ix, iy, iw, ih, 18); ctx.clip();
      // 油污斑点：变浅时边缘晕开；抹布擦过的地方直接干净
      for (let i = 0; i < 9; i++) {
        const sx = ix + 30 + hash(i * 3.3) * (iw - 60), sy = iy + 24 + hash(i * 7.1) * (ih - 120), r = 10 + hash(i) * 14;
        if (wipe >= 0 && sx < ix + wipe * iw) continue;
        ctx.globalAlpha = grime; ctx.fillStyle = '#9A6A3A'; ctx.beginPath(); ctx.arc(sx, sy, r * (1 + (1 - grime) * 0.8), 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
      // 转盘
      ctx.beginPath(); ctx.ellipse(ix + iw / 2, iy + ih - 34, 130, 22, 0, 0, TAU); paint(ctx, '#E9F3F7', 3);
      ctx.save(); ctx.translate(ix + iw / 2, iy + ih - 34); ctx.scale(1, 0.17);
      for (let k = 0; k < 6; k++) { const a = k * TAU / 6 + spinA; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 60, Math.sin(a) * 60); ctx.lineTo(Math.cos(a) * 110, Math.sin(a) * 110); ctx.lineWidth = 10; ctx.strokeStyle = C.ink; ctx.stroke(); }
      ctx.restore();
      // 蒸汽
      if (steam > 0.02) {
        ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineCap = 'round'; ctx.lineWidth = 7;
        for (let i = 0; i < Math.round(3 + steam * 9); i++) {
          const x0 = ix + 20 + ((i * 37) % (iw - 40)), ph = (t * 0.6 + hash(i) * 2) % 1;
          ctx.globalAlpha = steam * (1 - ph) * 0.9; ctx.beginPath();
          for (let k = 0; k <= 10; k++) { const y = iy + ih - 50 - ph * 120 - k * 14, x = x0 + Math.sin(k * 0.9 + t * 5 + i) * 9; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      ctx.restore();
      }
      if (part === 'body') return;
      // 门（透明玻璃 + 门框）：open 0~1 时向左收窄
      const dw = lerp(iw + 20, 40, ease(open));
      ctx.save(); rr(ctx, ix - 10, iy - 10, dw, ih + 20, 22); ctx.fillStyle = `rgba(190,225,240,${0.28 * (1 - open)})`; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = C.ink; ctx.stroke(); ctx.restore();
      // 控制面板
      rr(ctx, 130, -140, 110, 280, 16); paint(ctx, '#E3DED3', 3);
      rr(ctx, 148, -122, 74, 40, 8); paint(ctx, light > 0.5 ? '#3CB58A' : '#4A4A4A', 3);
      for (const y of [-30, 50]) { ctx.beginPath(); ctx.arc(185, y, 26, 0, TAU); paint(ctx, '#FFFFFF', 3); ctx.beginPath(); ctx.moveTo(185, y); ctx.lineTo(185, y - 18); ctx.lineWidth = 4; ctx.stroke(); }
    },
    faucet(ctx, P, t) { // 水龙头：底部水垢一圈、纸巾层层包裹、水流
      const scale = P('scale', 0), wrap = P('wrap', 0), flow = P('flow', 0);
      rr(ctx, -220, -40, 70, 80, 16); paint(ctx, '#C9CED3');
      ctx.beginPath(); ctx.moveTo(-150, -22); ctx.lineTo(40, -22); ctx.quadraticCurveTo(100, -22, 100, 40); ctx.lineTo(100, 90); ctx.lineTo(60, 90); ctx.lineTo(60, 40); ctx.quadraticCurveTo(60, 18, 40, 18); ctx.lineTo(-150, 18); ctx.closePath(); paint(ctx, C.steel);
      rr(ctx, -40, -82, 30, 60, 10); paint(ctx, '#C9CED3'); rr(ctx, -84, -100, 118, 26, 13); paint(ctx, C.red);
      if (flow > 0.02) { ctx.globalAlpha = flow; rr(ctx, 64, 90, 32, 320, 14); paint(ctx, 'rgba(110,190,230,0.7)', 3); ctx.globalAlpha = 1; }
      if (scale > 0.02) { ctx.globalAlpha = scale; ctx.fillStyle = '#FFFFFF'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI; ctx.beginPath(); ctx.arc(80 + Math.cos(a) * 26, 88 + Math.sin(a) * 6 - 4, 5 + hash(i) * 3, 0, TAU); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke(); } ctx.globalAlpha = 1; }
      const n = Math.round(wrap * 5);
      for (let i = 0; i < n; i++) { ctx.save(); ctx.translate(80, 20 + i * 15); ctx.rotate(-0.12 + (i % 2) * 0.24); rr(ctx, -50, -16, 100, 34, 10); paint(ctx, 'rgba(225,240,250,0.92)', 3); ctx.restore(); }
    },
    tissue(ctx, P) {
      const wet = P('wet', 0);
      rr(ctx, -110, -80, 220, 160, 16); paint(ctx, wet > 0.5 ? 'rgba(205,228,242,0.85)' : '#FFFFFF');
      ctx.beginPath(); ctx.moveTo(-110, -20); ctx.lineTo(110, -20); ctx.moveTo(-110, 30); ctx.lineTo(110, 30); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(43,43,43,0.4)'; ctx.stroke();
      if (wet > 0.05) { ctx.globalAlpha = wet; ctx.fillStyle = 'rgba(120,180,220,0.35)'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-70 + i * 28, -40 + (i % 2) * 60, 16, 0, TAU); ctx.fill(); } ctx.globalAlpha = 1; }
    },
    bottle(ctx, P, t, el) { // 白醋瓶 / 84 消毒液瓶；pour=1 时瓶口流出液体
      const kind = P('kind', 'vinegar'), pour = P('pour', 0);
      ctx.beginPath(); ctx.moveTo(-60, -60); ctx.lineTo(-60, 130); ctx.quadraticCurveTo(-60, 150, -40, 150); ctx.lineTo(40, 150); ctx.quadraticCurveTo(60, 150, 60, 130); ctx.lineTo(60, -60); ctx.quadraticCurveTo(60, -90, 26, -110); ctx.lineTo(26, -150); ctx.lineTo(-26, -150); ctx.lineTo(-26, -110); ctx.quadraticCurveTo(-60, -90, -60, -60); ctx.closePath();
      paint(ctx, kind === 'vinegar' ? 'rgba(235,245,250,0.95)' : '#FFFFFF');
      rr(ctx, -30, -186, 60, 40, 10); paint(ctx, kind === 'vinegar' ? C.red : '#3A78C2');
      rr(ctx, -52, -10, 104, 100, 14); paint(ctx, kind === 'vinegar' ? C.lemon : '#3A78C2', 3);
      if (kind === 'vinegar') text(ctx, '白醋', 0, 40, 38, C.ink, 900);
      else { text(ctx, '84', 0, 22, 44, C.white, 900); text(ctx, '消毒液', 0, 66, 24, C.white, 800); }
      if (pour > 0.02) { ctx.save(); ctx.globalAlpha = pour; ctx.strokeStyle = 'rgba(150,200,230,0.95)'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -190); ctx.quadraticCurveTo(-10, -260, -30 + Math.sin(t * 20) * 3, -340); ctx.stroke(); ctx.restore(); }
    },
    lemonSlice(ctx) {
      ctx.beginPath(); ctx.arc(0, 0, 60, 0, TAU); paint(ctx, C.lemon);
      ctx.beginPath(); ctx.arc(0, 0, 48, 0, TAU); paint(ctx, '#FFF0A8', 3);
      ctx.beginPath(); for (let k = 0; k < 8; k++) { const a = k * TAU / 8; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 46, Math.sin(a) * 46); } ctx.lineWidth = 3; ctx.strokeStyle = C.lemon; ctx.stroke();
    },
    lemonHalf(ctx) { // 俯视：切面朝下的半个柠檬
      ctx.beginPath(); ctx.ellipse(0, 0, 90, 66, 0, 0, TAU); paint(ctx, C.lemon);
      ctx.fillStyle = 'rgba(200,150,20,0.5)'; for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.arc(-60 + hash(i * 2.1) * 120, -40 + hash(i * 5.3) * 80, 3, 0, TAU); ctx.fill(); }
      ctx.beginPath(); ctx.ellipse(-78, 0, 12, 8, 0, 0, TAU); paint(ctx, '#B8D86A', 3);
    },
    lemon(ctx) { ctx.beginPath(); ctx.ellipse(0, 0, 70, 52, 0, 0, TAU); paint(ctx, C.lemon); ctx.beginPath(); ctx.ellipse(-70, 0, 12, 9, 0, 0, TAU); paint(ctx, '#B8D86A', 3); ctx.beginPath(); ctx.ellipse(70, 0, 10, 8, 0, 0, TAU); paint(ctx, C.lemon, 3); },
    toothbrush(ctx) {
      rr(ctx, -150, -14, 230, 28, 14); paint(ctx, C.mint);
      rr(ctx, 70, -26, 90, 26, 6); paint(ctx, '#FFFFFF', 3);
      ctx.beginPath(); for (let x = 78; x < 156; x += 10) { ctx.moveTo(x, -26); ctx.lineTo(x, -46); } ctx.lineWidth = 4; ctx.strokeStyle = '#7AC7E8'; ctx.stroke();
    },
    rag(ctx) { blob(ctx, [[-80, -50], [70, -60], [90, 40], [-60, 60], [-95, 10]]); paint(ctx, '#7AC7E8'); ctx.beginPath(); ctx.moveTo(-50, -20); ctx.quadraticCurveTo(0, 0, 50, -30); ctx.moveTo(-40, 20); ctx.quadraticCurveTo(10, 40, 60, 10); ctx.lineWidth = 3; ctx.stroke(); },
    sparkle(ctx, P, t, el) {
      const u = (t - el.at) / 0.6, sc = Math.sin(Math.PI * clamp(u, 0, 1)) * 1.2 + (u > 1 ? 0.0 : 0);
      if (sc <= 0.01) return;
      ctx.save(); ctx.scale(sc, sc); ctx.rotate(u * 1.2);
      ctx.beginPath(); for (let k = 0; k < 8; k++) { const r = k % 2 ? 14 : 50, a = k * Math.PI / 4; k ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); paint(ctx, C.lemon, 3);
      ctx.restore();
    },
    magnifier(ctx, P, t) { // 放大镜：碳酸钙颗粒遇醋酸冒泡、缩小、消失
      const react = P('react', 0);
      ctx.save(); ctx.rotate(0.7); rr(ctx, 200, -24, 190, 48, 22); paint(ctx, C.wood); ctx.restore();
      ctx.beginPath(); ctx.arc(0, 0, 250, 0, TAU); paint(ctx, '#F3FAFC', 6);
      ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 244, 0, TAU); ctx.clip();
      ctx.fillStyle = '#C9CED3'; ctx.fillRect(-260, 120, 520, 140); ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-260, 120); ctx.lineTo(260, 120); ctx.stroke();
      for (let i = 0; i < 9; i++) { // 碳酸钙颗粒
        const gx = -180 + i * 45, gy = 96 - (i % 3) * 30, r = (22 + hash(i) * 10) * (1 - clamp((react - hash(i * 3) * 0.3) / 0.7, 0, 1));
        if (r > 1) { ctx.beginPath(); ctx.arc(gx, gy, r, 0, TAU); paint(ctx, '#FFFFFF', 3); }
        if (react > 0.15 && r > 1) for (let b = 0; b < 3; b++) { const ph = (t * 1.6 + b * 0.33 + hash(i + b)) % 1; ctx.globalAlpha = 1 - ph; ctx.beginPath(); ctx.arc(gx + (b - 1) * 10, gy - r - ph * 70, 6 - b, 0, TAU); paint(ctx, null, 2); ctx.globalAlpha = 1; }
      }
      for (let i = 0; i < 12; i++) { // 醋酸小点（黄）从上方靠近
        const ax = -200 + hash(i * 4.4) * 400, ay = lerp(-300, 40 + hash(i * 2.2) * 60, clamp(react * 1.6 - hash(i) * 0.3, 0, 1));
        ctx.beginPath(); ctx.arc(ax, ay, 10, 0, TAU); paint(ctx, C.lemon, 3);
      }
      ctx.restore();
      ctx.beginPath(); ctx.arc(0, 0, 250, 0, TAU); paint(ctx, null, 10);
    },
    board(ctx, P) { // 俯视砧板：wet=柠檬擦过的湿痕
      const wet = P('wet', 0);
      rr(ctx, -300, -200, 600, 400, 50); paint(ctx, C.woodBoard);
      ctx.beginPath(); ctx.arc(230, -130, 26, 0, TAU); paint(ctx, C.bg, 3);
      ctx.strokeStyle = 'rgba(120,70,30,0.35)'; ctx.lineWidth = 3; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-260, -150 + i * 60); ctx.quadraticCurveTo(0, -130 + i * 60, 260, -150 + i * 60); ctx.stroke(); }
      if (wet > 0.01) { ctx.save(); ctx.globalAlpha = 0.35; ctx.strokeStyle = '#8A5A2A'; ctx.lineWidth = 120; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-200, 0); ctx.lineTo(lerp(-200, 200, wet), Math.sin(wet * 9) * 30); ctx.stroke(); ctx.restore(); }
    },
    saltFall(ctx, P, t, el) { // 粗盐颗粒撒落，rinse 时被水冲走
      const rinse = P('rinse', 0);
      for (let i = 0; i < 46; i++) {
        const tx = -240 + hash(i * 1.7) * 480, ty = -150 + hash(i * 3.9) * 300, d = hash(i * 7.7) * 0.7, u = clamp((t - el.at - d) / 0.45, 0, 1);
        if (u <= 0) continue;
        const gone = clamp((rinse * 1.3 - (tx + 240) / 480 * 0.5) / 0.5, 0, 1);
        if (gone >= 1) continue;
        const x = tx + gone * 160, y = lerp(ty - 420, ty, u * u) + gone * 60;
        ctx.save(); ctx.globalAlpha = 1 - gone; ctx.translate(x, y); ctx.rotate(hash(i) * 3); rr(ctx, -7, -7, 14, 14, 3); paint(ctx, '#FFFFFF', 2.5); ctx.restore();
      }
    },
    stream(ctx, P) { rr(ctx, -26, -420, 52, 440, 22); paint(ctx, 'rgba(110,190,230,0.7)', 3); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-6, -380); ctx.lineTo(-6, -20); ctx.stroke(); },
    rack(ctx, P, t) { // 砧板竖放在架子上，空气从两面穿过
      rr(ctx, -150, 60, 300, 26, 10); paint(ctx, '#B9B2A8');
      for (const x of [-120, 120]) { rr(ctx, x - 10, -40, 20, 110, 8); paint(ctx, '#B9B2A8'); }
      rr(ctx, -22, -200, 44, 270, 14); paint(ctx, C.woodBoard);
      ctx.strokeStyle = '#7AC7E8'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      for (const side of [-1, 1]) for (let k = 0; k < 3; k++) { const ph = (t * 0.8 + k / 3) % 1, y = -170 + k * 80; ctx.globalAlpha = Math.sin(Math.PI * ph); const x = side * (60 + 60 * ph); ctx.beginPath(); ctx.moveTo(x - 30 * side, y); ctx.quadraticCurveTo(x, y - 10, x + 30 * side, y); ctx.stroke(); }
      ctx.globalAlpha = 1;
    },
    boardFlat(ctx, P) { // 平放的砧板（侧视）：底面长霉点
      const mold = P('mold', 0);
      rr(ctx, -260, -30, 520, 60, 18); paint(ctx, C.woodBoard);
      rr(ctx, -300, 30, 600, 16, 6); paint(ctx, '#B9B2A8');
      if (mold > 0.02) for (let i = 0; i < 14; i++) { const x = -230 + hash(i * 2.9) * 460, r = (5 + hash(i) * 9) * clamp(mold * 1.3 - hash(i * 5) * 0.3, 0, 1); if (r > 0.5) { ctx.beginPath(); ctx.arc(x, 18 - hash(i * 7) * 30, r, 0, TAU); paint(ctx, C.mold, 2); } }
    },
    smellBreak(ctx, P, t) { // 腥味线遇到柠檬酸（黄点）断开消失
      const br = P('break', 0);
      ctx.lineCap = 'round';
      for (let i = 0; i < 5; i++) {
        const x0 = (i - 2) * 40; ctx.strokeStyle = C.mint; ctx.lineWidth = 7;
        for (let k = 0; k < 8; k++) { const seg = k / 8; if (seg > 1 - br * 1.1 + hash(i * 9 + k) * 0.2) continue; ctx.globalAlpha = 1 - br * 0.6; ctx.beginPath(); const y0 = 120 - k * 34; ctx.moveTo(x0 + Math.sin(k + t * 4 + i) * 10, y0); ctx.lineTo(x0 + Math.sin(k + 1 + t * 4 + i) * 10, y0 - 30); ctx.stroke(); }
      }
      ctx.globalAlpha = 1;
      for (let i = 0; i < 6; i++) { const y = lerp(-220, -40 + i * 26, clamp(br * 1.5 - i * 0.05, 0, 1)); ctx.beginPath(); ctx.arc(-110 + i * 44, y, 12, 0, TAU); paint(ctx, C.lemon, 3); }
    },
    arrowsLR(ctx, P, t) { const d = Math.sin(t * 6) * 40; ctx.save(); ctx.translate(d, 0); ctx.strokeStyle = C.red; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-110, 0); ctx.lineTo(110, 0); ctx.moveTo(-80, -28); ctx.lineTo(-110, 0); ctx.lineTo(-80, 28); ctx.moveTo(80, -28); ctx.lineTo(110, 0); ctx.lineTo(80, 28); ctx.stroke(); ctx.restore(); },
    forbid(ctx, P, t, el) { const k = el.drawK; ctx.lineWidth = 26; ctx.strokeStyle = C.red; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, 110, -Math.PI / 2, -Math.PI / 2 + TAU * clamp(k * 1.5, 0, 1)); ctx.stroke(); if (k > 0.66) { const e = (k - 0.66) / 0.34; ctx.beginPath(); ctx.moveTo(-78, -78); ctx.lineTo(lerp(-78, 78, e), lerp(-78, 78, e)); ctx.stroke(); } },
    warn(ctx, P, t, el) { // ⚠ 图标，入场后闪烁两次
      const u = t - el.at, on = !(u > 0.5 && u < 1.6 && Math.floor((u - 0.5) / 0.275) % 2 === 0);
      if (!on) return;
      ctx.beginPath(); ctx.moveTo(0, -100); ctx.lineTo(112, 90); ctx.lineTo(-112, 90); ctx.closePath(); ctx.lineJoin = 'round'; paint(ctx, C.warn, 8);
      text(ctx, '!', 0, 22, 120, C.ink, 900);
    },
    warnFrame(ctx) { // 警示黄黑条纹边框（包住演示区）
      const x0 = 20, y0 = 320, x1 = 1060, y1 = 1480, th = 34;
      ctx.save(); ctx.beginPath(); ctx.rect(x0 - 540, y0 - 900, x1 - x0, y1 - y0); ctx.rect(x0 + th - 540, y0 + th - 900, x1 - x0 - 2 * th, y1 - y0 - 2 * th); ctx.clip('evenodd');
      ctx.fillStyle = C.warn; ctx.fillRect(-600, -650, 1200, 1300);
      ctx.fillStyle = C.ink; for (let k = -40; k < 40; k++) { ctx.beginPath(); ctx.moveTo(k * 60 - 600, -650); ctx.lineTo(k * 60 - 570, -650); ctx.lineTo(k * 60 + 730, 650); ctx.lineTo(k * 60 + 700, 650); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    },
    divider(ctx) { ctx.setLineDash([18, 14]); ctx.beginPath(); ctx.moveTo(0, -520); ctx.lineTo(0, 520); ctx.lineWidth = 5; ctx.strokeStyle = C.gray; ctx.stroke(); ctx.setLineDash([]); },
    impact(ctx) { ctx.strokeStyle = C.red; ctx.lineWidth = 6; ctx.lineCap = 'round'; for (let k = 0; k < 6; k++) { const a = k * TAU / 6; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 30, Math.sin(a) * 30); ctx.lineTo(Math.cos(a) * 60, Math.sin(a) * 60); ctx.stroke(); } }
  };

  // ---------- 元素状态 ----------
  function param(el, name, def, t) {
    let v = el.p && el.p[name] != null ? el.p[name] : def;
    const ks = el.k && el.k[name];
    if (Array.isArray(ks) && typeof v === 'number') for (const k of ks) if (t >= k.at) v = lerp(v, k.v, ease((t - k.at) / (k.dur || 0.4)));
    else if (Array.isArray(ks)) for (const k of ks) if (t >= k.at) v = k.v;
    return v;
  }
  function integ(el, name, t) { // 参数对时间的积分（转盘角度等）
    let acc = 0; const t0 = Math.min(...el.k[name].map(k => k.at));
    for (let x = t0; x < t; x += 1 / 30) acc += param(el, name, 0, x) / 30;
    return acc;
  }
  function drawEl(ctx, el, t) {
    if (t < el.at - 0.001) return;
    if (el.out != null && t > el.out + 0.35) return;
    let x = el.x, y = el.y, s = el.s || 1, rot = el.rot || 0;
    for (const m of el.moves || []) if (t >= m.at) { const k = ease((t - m.at) / (m.dur || 0.5)); if (m.x != null) x = lerp(x, m.x, k); if (m.y != null) y = lerp(y, m.y, k); if (m.s != null) s = lerp(s, m.s, k); if (m.rot != null) rot = lerp(rot, m.rot, k); }
    if (el.shake && t >= el.shake.at && t < el.shake.at + el.shake.dur) (el.shake.axis === 'x' ? (v => { x += v; }) : (v => { y += v; }))(Math.sin(TAU * (el.shake.hz || 8) * (t - el.shake.at)) * (el.shake.amp || 40) * sstep(0, 0.1, t - el.shake.at) * (1 - sstep(el.shake.dur - 0.1, el.shake.dur, t - el.shake.at)));
    if (el.bob) y += Math.sin(t * TAU / (el.bob.period || 1.6) + (el.x || 0)) * (el.bob.amp || 6);
    const u = (t - el.at) / (el.enterDur || 0.45);
    let a = 1, sc = 1, dx = 0, dy = 0;
    const en = el.enter || 'pop';
    if (en === 'pop') { sc = popScale(u); a = clamp(u * 3, 0, 1); }
    else if (en === 'big') { sc = bigPop(u); a = clamp(u * 3, 0, 1); }
    else if (en === 'drop') { const k = clamp(u, 0, 1); dy = -(1 - ease(k)) * 500 + (k > 0.7 ? Math.sin((k - 0.7) / 0.3 * Math.PI) * -18 : 0); a = clamp(u * 4, 0, 1); }
    else if (en === 'fall') { const k = clamp(u, 0, 1); dy = -(1 - k * k) * (el.fallH || 420); a = clamp(u * 5, 0, 1); }
    else if (en === 'slideL') { dx = -(1 - ease(u)) * 700; a = clamp(u * 2, 0, 1); }
    else if (en === 'slideR') { dx = (1 - ease(u)) * 700; a = clamp(u * 2, 0, 1); }
    else if (en === 'fade') a = clamp(u, 0, 1);
    if (el.out != null && t > el.out) { const v = (t - el.out) / 0.35; if ((el.exit || 'pop') === 'pop') { sc *= lerp(1, 0.6, ease(v)); } a *= 1 - ease(v); }
    // 「亮起」：hl=0 时变暗
    const hl = el.k && el.k.hl ? param(el, 'hl', 1, t) : 1;
    a *= lerp(0.3, 1, hl);
    el.drawK = el.enter === 'draw' ? ease(u / 1) : 1;
    if (a <= 0.001) return;
    const P = (name, def) => param(el, name, def, t);
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x + dx, y + dy); ctx.rotate(rot); ctx.scale(s * sc, s * sc);
    DRAW[el.type](ctx, P, t, el);
    ctx.restore();
    if (el.type === 'waterBowl' && el.k && el.k.hl && hl > 0.6) { ctx.save(); ctx.globalAlpha = (hl - 0.6) / 0.4 * 0.9; ctx.strokeStyle = C.yellow; ctx.lineWidth = 8; rr(ctx, x - 170, y - 230, 340, 420, 40); ctx.stroke(); ctx.restore(); }
  }

  // ---------- 镜头 ----------
  let TL, main, mg, bufA, ga, bufB, gb;
  function shotAt(t) { const s = TL.shots; for (let i = s.length - 1; i >= 0; i--) if (t >= s[i].start) return i; return 0; }
  function renderShotDemo(ctx, shot, t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
    const els = (shot.els || []).slice().sort((a, b) => (a.z || 0) - (b.z || 0));
    const z = shot.zoom || 1; // 整个演示区以 (540, 900) 为中心缩放
    ctx.translate(540, 900); ctx.scale(z, z); ctx.translate(-540, -900);
    for (const el of els) drawEl(ctx, el, t);
  }
  function titleBar(ctx, t) {
    // 本集标题 + 招数标签（每招开头弹出，整招期间停在标题栏）
    const sh = TL.shots[shotAt(t)];
    ctx.save();
    text(ctx, TL.seriesLine || '', W / 2, 78, 34, '#8C8478', 700);
    text(ctx, TL.title || '', W / 2, 168, 92, C.ink, 900);
    ctx.fillStyle = C.red; rr(ctx, W / 2 - 60, 228, 120, 10, 5); ctx.fill();
    // 当前招数
    let tag = null, tagStart = null;
    for (const s of TL.shots) { if (s.start > t) break; if (s.tag !== undefined) { if (s.tag !== tag) { tag = s.tag; tagStart = s.start; } } }
    if (tag) {
      const u = (t - tagStart) / 0.45, sc = popScale(u);
      ctx.translate(W - 150, 168); ctx.scale(sc, sc); ctx.globalAlpha = clamp(u * 3, 0, 1);
      DRAW.label(ctx, (k, d) => ({ text: `第${tag}招`, size: 44, color: C.red })[k] ?? d);
    }
    ctx.restore();
  }
  function subtitle(ctx, t) {
    if (t >= TL.voiceEnd) return;
    const s = TL.subtitles.find(s => t >= s.start && t < s.end); if (!s) return;
    const kws = (TL.keywords || []).slice().sort((a, b) => b.length - a.length);
    // 按关键词切段：关键词番茄红，其余黑色
    const segs = []; let str = s.text;
    while (str.length) {
      let hit = null, at = str.length;
      for (const k of kws) { const i = str.indexOf(k); if (i >= 0 && i < at) { at = i; hit = k; } }
      if (at > 0) segs.push([str.slice(0, at), false]);
      if (!hit) break;
      segs.push([hit, true]); str = str.slice(at + hit.length);
    }
    ctx.save(); ctx.font = `900 56px ${FONT}`; ctx.textBaseline = 'middle';
    const tot = segs.reduce((a, [x]) => a + ctx.measureText(x).width, 0);
    let x = W / 2 - tot / 2;
    const u = (t - s.start) / 0.18, sc = lerp(0.92, 1, ease(u));
    ctx.translate(W / 2, SUB_Y); ctx.scale(sc, sc); ctx.translate(-W / 2, -SUB_Y);
    for (const [seg, hot] of segs) {
      ctx.lineWidth = 10; ctx.lineJoin = 'round'; ctx.strokeStyle = C.white; ctx.strokeText(seg, x, SUB_Y);
      ctx.fillStyle = hot ? C.red : C.ink; ctx.textAlign = 'left'; ctx.fillText(seg, x, SUB_Y); x += ctx.measureText(seg).width;
    }
    ctx.restore();
  }

  window.ENGINE = {
    setup(tl) {
      TL = tl; main = document.getElementById('c'); main.width = W; main.height = H; mg = main.getContext('2d');
      bufA = mk(W, H); ga = bufA.getContext('2d'); bufB = mk(W, H); gb = bufB.getContext('2d');
      return { w: W, h: H };
    },
    renderFrame(f) {
      const t = f / TL.fps, S = TL.shots, i = shotAt(t), cur = S[i], next = S[i + 1];
      const tt = Math.min(t, TL.voiceEnd + 0.4); // 片尾定格
      mg.setTransform(1, 0, 0, 1, 0, 0); mg.globalAlpha = 1;
      mg.fillStyle = C.bg; mg.fillRect(0, 0, W, H);
      // 演示区：横向滑动切换（0.45 秒，以下一镜头开始时刻为中点）
      const SL = 0.45;
      mg.save(); mg.beginPath(); mg.rect(0, DEMO[0], W, DEMO[1] - DEMO[0]); mg.clip();
      let k = -1, A = cur, B = null;
      if (next && t > next.start - SL / 2) { k = (t - (next.start - SL / 2)) / SL; B = next; }
      else if (i > 0 && t < cur.start + SL / 2) { k = (t - (cur.start - SL / 2)) / SL; A = S[i - 1]; B = cur; }
      if (B && (B.transition || 'slide') === 'slide' && k >= 0 && k <= 1) {
        const e = ease(k);
        renderShotDemo(ga, A, tt); renderShotDemo(gb, B, tt);
        mg.drawImage(bufA, -e * W, 0); mg.drawImage(bufB, (1 - e) * W, 0);
      } else { renderShotDemo(ga, cur, tt); mg.drawImage(bufA, 0, 0); }
      mg.restore();
      titleBar(mg, t);
      subtitle(mg, t);
      if (t < 0.25) { mg.fillStyle = `rgba(255,248,238,${1 - t / 0.25})`; mg.fillRect(0, 0, W, H); }
      return main.toDataURL('image/jpeg', 0.92);
    }
  };
})();
