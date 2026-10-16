// 皮影偶：SVG 分件 + 关节骨架
// 每个部件是一段 SVG path（用 Path2D 绘制），绕自己的关节点旋转：
//   根(脚底) → 髋 → 躯干 → 颈 → 头
//                     └→ 肩 → 上臂 → 肘 → 前臂(手)
//            髋 → 大腿 → 膝 → 小腿(靴)
// 角度约定（弧度，面朝右时）：肢体 0 = 竖直向下，正值 = 向前摆；躯干/头 正值 = 向前倾。
(function () {
  const TAU = Math.PI * 2;
  const DIM = { THIGH: 84, SHIN: 78, TORSO: 132, UPPER: 62, FORE: 54, SH: [6, -118], NECK: [4, -132] };
  const LINE = '#2A1A10', FACE = '#F3E4C8';
  const COLORS = {
    red: ['rgba(178,40,32,0.92)', 'rgba(118,22,18,0.94)'], yellow: ['rgba(214,160,40,0.92)', 'rgba(146,100,18,0.94)'],
    blue: ['rgba(40,82,142,0.92)', 'rgba(22,48,92,0.94)'], green: ['rgba(42,116,72,0.92)', 'rgba(24,72,44,0.94)'],
    brown: ['rgba(130,72,30,0.92)', 'rgba(82,42,16,0.94)'], black: ['rgba(40,28,22,0.95)', 'rgba(24,16,12,0.96)'],
    white: ['rgba(240,228,200,0.92)', 'rgba(196,180,150,0.94)']
  };
  const FACES = { light: FACE, black: 'rgba(36,24,20,0.97)', red: 'rgba(168,46,34,0.96)' };
  // 颜色可写色名（COLORS 里的）或十六进制 #RRGGBB；返回 [正面色, 背光暗面色]
  function pair(c) {
    if (COLORS[c]) return COLORS[c];
    const m = /^#?([0-9a-f]{6})$/i.exec(c || '');
    if (!m) return COLORS.brown;
    const n = parseInt(m[1], 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    return [`rgba(${r},${g},${b},0.93)`, `rgba(${r * 0.62 | 0},${g * 0.62 | 0},${b * 0.62 | 0},0.95)`];
  }

  // ---------- SVG path 生成 ----------
  const f1 = v => Math.round(v * 10) / 10;
  function smoothD(pts) {
    const n = pts.length, m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let s = m(pts[n - 1], pts[0]), d = `M${f1(s[0])} ${f1(s[1])}`;
    for (let i = 0; i < n; i++) { const p = pts[i], q = m(pts[i], pts[(i + 1) % n]); d += ` Q${f1(p[0])} ${f1(p[1])} ${f1(q[0])} ${f1(q[1])}`; }
    return d + ' Z';
  }
  const polyD = pts => 'M' + pts.map(p => `${f1(p[0])} ${f1(p[1])}`).join(' L') + ' Z';
  const H = pts => pts.map(([x, y]) => [x * 1.2, y * 1.2 - 43]); // 头部：原始侧脸坐标 → 以颈为原点
  const cache = new Map();
  const P2 = d => { let p = cache.get(d); if (!p) { p = new Path2D(d); cache.set(d, p); } return p; };

  const PART = {
    torso: smoothD([[-27, 4], [31, 4], [35, -40], [34, -96], [24, -124], [8, -134], [-12, -129], [-24, -104], [-29, -40]]),
    collar: polyD([[8, -134], [20, -96], [30, -120]]),
    belt: polyD([[-30, -16], [34, -16], [35, -3], [-31, -3]]),
    skirtLong: smoothD([[-29, -8], [33, -8], [40, 60], [44, 120], [56, 168], [-46, 168], [-38, 120], [-34, 60]]),
    skirtShort: polyD([[-29, -8], [33, -8], [46, 66], [-42, 66]]),
    skirtKneel: smoothD([[-31, -8], [31, -8], [66, 4], [94, 24], [104, 50], [-48, 50], [-54, 34], [-46, 6]]),
    thigh: polyD([[-13, 0], [13, 0], [10, DIM.THIGH], [-10, DIM.THIGH]]),
    shin: polyD([[-10, -2], [10, -2], [8, DIM.SHIN], [-8, DIM.SHIN]]),
    boot: polyD([[-10, DIM.SHIN - 8], [24, DIM.SHIN - 5], [28, DIM.SHIN + 8], [-10, DIM.SHIN + 8]]),
    upper: polyD([[-12, -2], [12, -2], [10, DIM.UPPER], [-10, DIM.UPPER]]),
    fore: polyD([[-10, 0], [10, 0], [8, DIM.FORE], [-8, DIM.FORE]]),
    cuff: polyD([[-9, DIM.FORE - 9], [9, DIM.FORE - 9], [9, DIM.FORE], [-9, DIM.FORE]]),
    hand: smoothD([[-7, DIM.FORE - 2], [7, DIM.FORE - 3], [10, DIM.FORE + 9], [2, DIM.FORE + 15], [-7, DIM.FORE + 10]]),
    face: smoothD(H([[-24, -10], [-8, -31], [18, -24], [25, -11], [27, -4], [35, 4], [27, 7], [29, 12], [24, 22], [6, 27], [4, 36], [-12, 33], [-22, 14]])),
    hair: smoothD(H([[-25, -8], [-22, -28], [0, -35], [20, -27], [16, -19], [-2, -22], [-14, -2]])),
    eye: (() => { const [a, b, c] = H([[10, -5], [17, -10], [24, -5]]), [d] = H([[17, -1]]); return `M${f1(a[0])} ${f1(a[1])} Q${f1(b[0])} ${f1(b[1])} ${f1(c[0])} ${f1(c[1])} Q${f1(d[0])} ${f1(d[1])} ${f1(a[0])} ${f1(a[1])} Z`; })(),
    brow: H([[7, -13], [16, -17.5], [26, -13]]), mouth: H([[24, 11], [29, 11]]),
    beard: {
      long: smoothD(H([[18, 14], [30, 18], [33, 46], [27, 74], [17, 58], [7, 28]])),
      white: smoothD(H([[18, 14], [31, 18], [35, 52], [28, 92], [16, 70], [6, 28]])),
      short: smoothD(H([[20, 15], [30, 19], [29, 40], [19, 33]])),
      bushy: polyD(H([[14, 10], [34, 14], [40, 28], [32, 34], [38, 48], [26, 44], [24, 60], [14, 48], [6, 54], [6, 28]]))
    },
    hat: {
      helmet: [[smoothD(H([[-28, -8], [-25, -32], [-4, -47], [18, -41], [30, -22], [28, -14], [-2, -22], [-20, -2]])), 'black'], [polyD(H([[-22, -6], [-37, 18], [-24, 24], [-13, 2]])), 'black']],
      helmetS: [[smoothD(H([[-26, -10], [-20, -32], [0, -40], [20, -32], [26, -18], [0, -24]])), 'brown']],
      crown: [[smoothD(H([[-14, -27], [16, -30], [22, -46], [2, -52], [-12, -42]])), 'black']],
      tall: [[smoothD(H([[-14, -27], [16, -30], [22, -64], [2, -74], [-12, -56]])), 'black']],
      liu: [[polyD(H([[-8, -27], [12, -30], [28, -88], [10, -94]])), 'black']],
      scholar: [[smoothD(H([[-25, -12], [-22, -31], [0, -41], [22, -32], [26, -20], [0, -27]])), 'blue']],
      band: [[polyD(H([[-16, -30], [-8, -44], [4, -42], [4, -30]])), 'black'], [polyD(H([[-25, -20], [20, -26], [21, -19], [-23, -12]])), 'red']],
      mianliu: [[polyD(H([[-12, -27], [14, -30], [14, -42], [-10, -40]])), 'black'], [polyD(H([[-32, -40], [36, -47], [37, -42], [-31, -35]])), 'black']],
      kerchief: [[smoothD(H([[-26, -10], [-23, -30], [0, -39], [20, -31], [24, -19], [0, -25]])), 'cloth'], [smoothD(H([[-26, -16], [-40, -8], [-36, 4], [-24, -6]])), 'cloth']],
      bun: [[smoothD(H([[-14, -30], [-16, -42], [-4, -46], [4, -38]])), 'black']],
      gaoji: [[smoothD(H([[-18, -28], [-24, -48], [-14, -70], [4, -68], [10, -50], [4, -30]])), 'black'], [smoothD(H([[-6, -66], [2, -80], [12, -76], [8, -64]])), 'black']],
      douli: [[polyD(H([[-48, -24], [0, -52], [48, -24], [44, -19], [-44, -19]])), 'cloth']]
    }
  };

  // ---------- 角色库 ----------
  const CHARS = {
    xiangyu: { name: '项羽', s: 1.08, robe: 'red', trim: 'black', face: 'black', hat: 'helmet', plume: true, beard: 'long', skirt: 'long', pattern: 'scale', sleeve: 'tight', legs: 'black' },
    liubang: { name: '刘邦', s: 1.0, robe: 'yellow', trim: 'red', face: 'light', hat: 'liu', beard: 'long', skirt: 'long', pattern: 'dots', sleeve: 'wide', legs: 'black' },
    zhangliang: { name: '张良', s: 0.97, robe: 'blue', trim: 'white', face: 'light', hat: 'scholar', ribbons: 'blue', beard: 'none', skirt: 'long', pattern: 'lattice', sleeve: 'wide', legs: 'black' },
    fankuai: { name: '樊哙', s: 1.06, robe: 'black', trim: 'red', face: 'red', hat: 'band', ribbons: 'red', beard: 'bushy', skirt: 'short', pattern: 'scale', sleeve: 'tight', legs: 'black' },
    fanzeng: { name: '范增', s: 0.96, robe: 'brown', trim: 'white', face: 'light', hat: 'tall', beard: 'white', skirt: 'long', pattern: 'huiwen', sleeve: 'wide', legs: 'black' },
    xiangzhuang: { name: '项庄', s: 1.0, robe: 'red', trim: 'yellow', face: 'light', hat: 'band', ribbons: 'red', beard: 'none', skirt: 'short', pattern: 'scale', sleeve: 'tight', legs: 'black' },
    xiangbo: { name: '项伯', s: 0.97, robe: 'green', trim: 'yellow', face: 'light', hat: 'crown', pin: true, beard: 'short', skirt: 'long', pattern: 'huiwen', sleeve: 'wide', legs: 'black' },
    qinxiaogong: { name: '秦孝公', s: 1.02, robe: '#2B2B2B', trim: '#C9A24A', face: 'light', hat: 'mianliu', beard: 'long', skirt: 'long', pattern: 'huiwen', sleeve: 'wide', legs: 'black' },
    shangyang: { name: '商鞅', s: 1.0, robe: '#6B3E26', trim: 'black', face: 'light', hat: 'tall', beard: 'short', skirt: 'long', pattern: 'lattice', sleeve: 'wide', legs: 'black' },
    porter: { name: '扛木人', s: 0.96, wx: 0.84, robe: '#A88A5C', trim: '#6B4A2A', face: 'light', hat: 'kerchief', cloth: '#7A6040', beard: 'none', skirt: 'short', pattern: 'dots', sleeve: 'tight', legs: '#5A4630' },
    villager: { name: '百姓', s: 0.72, robe: '#5E7183', trim: '#3E4A56', face: 'light', hat: 'kerchief', cloth: '#4A5866', beard: 'none', skirt: 'short', pattern: 'dots', sleeve: 'tight', legs: '#3E4A56' },
    linxiangru: { name: '蔺相如', s: 1.02, wx: 0.88, robe: '#3F6B5E', trim: '#C9A24A', face: 'light', hat: 'tall', beard: 'long', skirt: 'long', pattern: 'lattice', sleeve: 'wide', legs: 'black' },
    zhaowang: { name: '赵王', s: 1.03, robe: '#2F5D50', trim: '#C9A24A', face: 'light', hat: 'mianliu', beard: 'long', skirt: 'long', pattern: 'huiwen', sleeve: 'wide', legs: 'black' },
    qinwang: { name: '秦王', s: 1.16, robe: '#1F1A18', trim: '#9E2B25', face: 'light', hat: 'mianliu', beard: 'long', skirt: 'long', pattern: 'scale', sleeve: 'wide', legs: 'black' },
    meiren: { name: '美人', s: 0.94, robe: '#D98C8C', trim: '#C9A24A', face: 'light', hat: 'gaoji', pin: true, beard: 'none', skirt: 'long', pattern: 'dots', sleeve: 'wide', legs: '#B06A6A' },
    minister: { name: '大臣', s: 0.98, robe: '#4A3426', trim: 'black', face: 'light', hat: 'crown', beard: 'short', skirt: 'long', pattern: 'huiwen', sleeve: 'wide', legs: 'black' },
    suicong: { name: '随从', s: 0.95, robe: '#A88A5C', trim: '#6B4A2A', face: 'light', hat: 'douli', cloth: '#C8A86A', beard: 'none', skirt: 'short', pattern: 'dots', sleeve: 'tight', legs: '#5A4630' },
    soldier: { name: '士卒', s: 0.94, robe: 'brown', trim: 'black', face: 'light', hat: 'helmetS', beard: 'none', skirt: 'short', pattern: 'scale', sleeve: 'tight', legs: 'black' }
  };

  // ---------- 姿势库 ----------
  // aN/aF = 近侧/远侧手臂 [上臂, 前臂相对弯曲]；lN/lF = 腿 [大腿, 小腿相对弯曲]
  const STAND_L = { lN: [0.06, 0], lF: [-0.06, 0] };
  const KNEEL_L = { lN: [1.05, -2.62], lF: [0.98, -2.55] };
  const POSES = {
    stand: { torso: 0, head: 0, aN: [0.15, 0.2], aF: [-0.1, 0.15], ...STAND_L },
    kneel: { torso: 0, head: 0, aN: [0.55, 0.95], aF: [0.42, 1.05], ...KNEEL_L, kneel: 1 },
    bow: { torso: 0.3, head: 0.15, aN: [1.25, 0.85], aF: [1.15, 0.95], ...STAND_L },
    kneel_bow: { torso: 0.45, head: 0.2, aN: [1.3, 0.8], aF: [1.2, 0.9], ...KNEEL_L, kneel: 1 },
    point: { torso: -0.05, head: -0.05, aN: [1.75, 0.05], aF: [-0.15, 0.2], ...STAND_L },
    kneel_point: { torso: -0.03, head: -0.05, aN: [1.7, 0.05], aF: [0.42, 1.05], ...KNEEL_L, kneel: 1 },
    angry: { torso: -0.08, head: -0.12, aN: [0.8, 1.6], aF: [0.6, 1.7], lN: [0.22, 0], lF: [-0.22, 0] },
    kneel_angry: { torso: -0.06, head: -0.1, aN: [0.9, 1.5], aF: [0.6, 1.4], ...KNEEL_L, kneel: 1 },
    raise: { torso: -0.02, head: -0.1, aN: [2.55, -0.25], aF: [0.42, 1.05], ...STAND_L },
    kneel_raise: { torso: -0.02, head: -0.1, aN: [2.55, -0.25], aF: [0.42, 1.05], ...KNEEL_L, kneel: 1 },
    kneel_drink: { torso: -0.05, head: -0.22, aN: [1.05, 2.1], aF: [0.42, 1.05], ...KNEEL_L, kneel: 1 },
    kneel_silent: { torso: 0.04, head: 0.12, aN: [0.55, 0.95], aF: [0.42, 1.05], ...KNEEL_L, kneel: 1 },
    shield: { torso: 0, head: -0.05, aN: [2.1, 0.25], aF: [-2.0, -0.3], lN: [0.4, 0], lF: [-0.42, -0.1] },
    sword_up: { torso: -0.05, head: -0.05, aN: [2.9, 0.1], aF: [0.6, 1.1], lN: [0.35, 0.05], lF: [-0.35, -0.1] },
    sword_low: { torso: 0.05, head: 0.2, aN: [0.5, 0.3], aF: [0.2, 0.4], ...STAND_L },
    sneak: { torso: 0.32, head: -0.1, aN: [0.6, 0.6], aF: [0.3, 0.8], lN: [0.35, -0.25], lF: [-0.3, -0.3] },
    mourn: { torso: 0.12, head: 0.35, aN: [0.35, 0.25], aF: [0.1, 0.3], ...STAND_L },
    order: { torso: -0.04, head: -0.06, aN: [2.2, 0.5], aF: [0.1, 0.4], ...STAND_L },
    smash_up: { torso: -0.12, head: -0.15, aN: [3.0, 0.2], aF: [2.8, 0.3], ...STAND_L },
    smash_down: { torso: 0.28, head: 0.18, aN: [1.0, 0.1], aF: [0.9, 0.2], lN: [0.25, 0], lF: [-0.2, -0.05] },
    fist: { torso: -0.06, head: -0.08, aN: [1.4, 1.2], aF: [0.5, 1.5], lN: [0.3, 0], lF: [-0.3, -0.05] },
    kneel_talk: { torso: -0.02, head: -0.04, aN: [1.6, 0.7], aF: [0.42, 1.05], ...KNEEL_L, kneel: 1 },
    kneel_lowhead: { torso: 0.1, head: 0.38, aN: [0.5, 0.9], aF: [0.4, 1.0], ...KNEEL_L, kneel: 1 },
    talk: { torso: -0.02, head: -0.04, aN: [1.5, 0.7], aF: [-0.1, 0.15], ...STAND_L },
    cheer: { torso: -0.08, head: -0.18, aN: [2.95, 0.15], aF: [2.85, 0.2], ...STAND_L },
    point_up: { torso: -0.04, head: -0.12, aN: [2.2, 0.0], aF: [-0.1, 0.2], ...STAND_L },
    carry: { torso: 0.08, head: -0.02, aN: [2.75, -2.55], aF: [2.6, -2.4], ...STAND_L },
    give: { torso: 0.06, head: 0.05, aN: [1.55, 0.05], aF: [-0.1, 0.15], ...STAND_L },
    receive: { torso: 0.1, head: 0.12, aN: [1.3, 0.35], aF: [1.2, 0.45], ...STAND_L },
    knock: { torso: 0.02, head: 0, aN: [1.65, 0.75], aF: [-0.1, 0.2], ...STAND_L },
    raise_both: { torso: -0.08, head: -0.18, aN: [2.95, 0.15], aF: [2.85, 0.25], lN: [0.25, 0], lF: [-0.25, -0.05] },
    present: { torso: 0.05, head: 0.05, aN: [1.45, 0.35], aF: [1.3, 0.45], ...STAND_L },
    reach: { torso: 0.1, head: 0.05, aN: [1.65, 0.05], aF: [-0.1, 0.2], ...STAND_L },
    clutch: { torso: 0.12, head: 0.05, aN: [0.75, 2.0], aF: [0.55, 1.9], ...STAND_L },
    worried: { torso: 0.06, head: 0.18, aN: [0.9, 1.7], aF: [0.7, 1.8], ...STAND_L },
    kneel_proud: { torso: -0.2, head: -0.22, aN: [0.9, 1.3], aF: [0.42, 1.05], ...KNEEL_L, kneel: 1 },
    kneel_hold: { torso: -0.04, head: 0.08, aN: [1.35, 0.6], aF: [0.42, 1.05], ...KNEEL_L, kneel: 1 },
    hold_out: { torso: 0, head: 0.04, aN: [1.4, 0.45], aF: [-0.1, 0.2], ...STAND_L }
  };
  function blendPose(a, b, k) {
    const out = {}, keys = ['torso', 'head', 'kneel'];
    for (const key of keys) out[key] = (a[key] || 0) + ((b[key] || 0) - (a[key] || 0)) * k;
    for (const key of ['aN', 'aF', 'lN', 'lF']) out[key] = [0, 1].map(i => a[key][i] + (b[key][i] - a[key][i]) * k);
    return out;
  }

  // ---------- 镂空纹样（只刻在当前部件内） ----------
  function carve(ctx, path, kind, box) {
    if (!kind) return;
    ctx.save(); ctx.clip(path); ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000'; ctx.strokeStyle = '#000';
    const [x0, y0, x1, y1] = box;
    if (kind === 'dots') { for (let y = y0; y < y1; y += 11) for (let x = x0 + ((y / 11) & 1) * 5.5; x < x1; x += 11) { ctx.beginPath(); ctx.arc(x, y, 2.2, 0, TAU); ctx.fill(); } }
    if (kind === 'scale') { ctx.lineWidth = 1.8; for (let y = y0; y < y1; y += 11) for (let x = x0 + ((y / 11) & 1) * 6; x < x1; x += 12) { ctx.beginPath(); ctx.arc(x, y, 5, 0.15, Math.PI - 0.15); ctx.stroke(); } }
    if (kind === 'lattice') { ctx.lineWidth = 1.6; for (let k = x0 - (y1 - y0); k < x1; k += 16) { ctx.beginPath(); ctx.moveTo(k, y0); ctx.lineTo(k + (y1 - y0), y1); ctx.moveTo(k, y1); ctx.lineTo(k + (y1 - y0), y0); ctx.stroke(); } }
    if (kind === 'huiwen') { ctx.lineWidth = 1.8; for (let y = y0 + 6; y < y1; y += 20) for (let x = x0 + 4; x < x1; x += 20) { ctx.beginPath(); ctx.moveTo(x, y + 10); ctx.lineTo(x, y); ctx.lineTo(x + 10, y); ctx.lineTo(x + 10, y + 7); ctx.lineTo(x + 4, y + 7); ctx.lineTo(x + 4, y + 3); ctx.stroke(); } }
    ctx.restore();
  }
  function fillPart(ctx, d, fill, kind, box, lw) {
    const p = P2(d);
    ctx.fillStyle = fill; ctx.fill(p);
    carve(ctx, p, kind, box || [-60, -200, 120, 200]);
    ctx.strokeStyle = LINE; ctx.lineWidth = lw || 2; ctx.lineJoin = 'round'; ctx.stroke(p);
  }
  function strokeLine(ctx, pts, lw, col) { ctx.strokeStyle = col || LINE; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke(); }
  const toScreen = (ctx, x, y) => { const p = ctx.getTransform().transformPoint(new DOMPoint(x, y)); return [p.x, p.y]; };

  // ---------- 手持道具（前臂坐标系，手在 (0, FORE+8)） ----------
  function drawProp(ctx, kind, swordAng, out) {
    const F = DIM.FORE;
    if (kind === 'sword') {
      ctx.save(); ctx.translate(0, F + 6); ctx.rotate(-(swordAng || 0));
      fillPart(ctx, polyD([[-4, 6], [4, 6], [3.2, 180], [0, 198], [-3.2, 180]]), 'rgba(220,226,232,0.94)', null, null, 1.4);
      fillPart(ctx, polyD([[-14, 2], [14, 2], [12, 8], [-12, 8]]), COLORS.yellow[0], null, null, 1.2);
      fillPart(ctx, polyD([[-3.5, -18], [3.5, -18], [3.5, 2], [-3.5, 2]]), COLORS.brown[1], null, null, 1.2);
      out.sword = { base: toScreen(ctx, 0, 8), tip: toScreen(ctx, 0, 198) };
      ctx.restore();
    } else if (kind === 'jade') {
      const [x, y] = [0, F + 24];
      ctx.lineCap = 'butt'; ctx.strokeStyle = LINE; ctx.lineWidth = 11; ctx.beginPath(); ctx.arc(x, y, 14, 0.5, TAU - 0.2); ctx.stroke();
      ctx.strokeStyle = 'rgba(86,178,122,0.97)'; ctx.lineWidth = 7.5; ctx.beginPath(); ctx.arc(x, y, 14, 0.56, TAU - 0.26); ctx.stroke();
      out.jade = toScreen(ctx, x, y);
    } else if (kind === 'cup') {
      fillPart(ctx, polyD([[-12, F + 4], [12, F + 4], [9, F + 18], [-9, F + 18]]), COLORS.red[1], null, null, 1.4);
    } else if (kind === 'bi') { // 和氏璧：圆形玉璧，中心有孔
      const r = 40, cy = F + 30;
      ctx.beginPath(); ctx.arc(0, cy, r, 0, TAU); ctx.arc(0, cy, r * 0.32, 0, TAU, true);
      ctx.fillStyle = 'rgba(127,200,169,0.98)'; ctx.fill('evenodd'); ctx.strokeStyle = LINE; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = 'rgba(220,255,236,0.8)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, cy, r * 0.7, 0, TAU); ctx.stroke();
      out.bi = toScreen(ctx, 0, cy); out.biScale = Math.hypot(...(() => { const m = ctx.getTransform(); return [m.a, m.b]; })());
    } else if (kind === 'gold') { // 金饼
      fillPart(ctx, smoothD([[-14, F + 12], [14, F + 12], [16, F + 20], [0, F + 26], [-16, F + 20]]), 'rgba(232,194,90,0.97)', null, null, 1.5);
      out.gold = toScreen(ctx, 0, F + 18);
    } else if (kind === 'dipper') {
      fillPart(ctx, smoothD([[-16, F + 10], [16, F + 10], [14, F + 30], [-14, F + 30]]), 'rgba(86,178,122,0.95)', null, null, 1.4);
      out.dipper = toScreen(ctx, 0, F + 20);
    } else if (kind === 'spear') {
      ctx.save(); ctx.translate(0, F + 6); ctx.rotate(-(swordAng || 0));
      strokeLine(ctx, [[0, -150], [0, 160]], 5, COLORS.brown[1]);
      fillPart(ctx, polyD([[-6, -150], [6, -150], [0, -186]]), 'rgba(220,226,232,0.94)', null, null, 1.2);
      ctx.restore();
    }
  }

  // ---------- 整只皮影 ----------
  // st: { x, y, face(±1 可为小数，用于转身), rot(整体摆动), pose{...}, hold, swordAng, alpha, t }
  function drawPuppet(ctx, def, st) {
    const out = { rods: [] };
    const C = pair(def.robe), T = pair(def.trim), L = pair(def.legs);
    const p = st.pose, s = def.s;
    ctx.save(); ctx.globalAlpha = st.alpha;
    ctx.translate(st.x, st.y); ctx.rotate(st.rot || 0); ctx.scale(st.face * s * (def.wx || 1), s);
    out.hands = {};
    // 髋高：让最低的脚/膝贴地
    const legLow = ([t, k]) => Math.max(DIM.THIGH * Math.cos(t), DIM.THIGH * Math.cos(t) + DIM.SHIN * Math.cos(t + k));
    const hipY = -(Math.max(legLow(p.lN), legLow(p.lF)) + 8);
    const leg = ([t, k], far) => {
      ctx.save(); ctx.translate(far ? -4 : 4, hipY); ctx.rotate(-t);
      fillPart(ctx, PART.thigh, far ? L[1] : L[0]);
      ctx.translate(0, DIM.THIGH); ctx.rotate(-k);
      fillPart(ctx, PART.shin, far ? L[1] : L[0]); fillPart(ctx, PART.boot, COLORS.black[far ? 1 : 0]);
      ctx.restore();
    };
    leg(p.lF, true); leg(p.lN, false);
    const torsoFrame = () => { ctx.translate(0, hipY); ctx.rotate(p.torso); };
    const arm = ([u, k], far, hold) => {
      ctx.save(); torsoFrame(); ctx.translate(DIM.SH[0], DIM.SH[1]); ctx.rotate(-u);
      fillPart(ctx, PART.upper, far ? C[1] : C[0]);
      ctx.translate(0, DIM.UPPER); ctx.rotate(-k);
      if (hold && hold !== 'sword' && hold !== 'spear') { /* 小道具画在手后 */ }
      if (def.sleeve === 'wide') {
        // 宽袖：袖口按重力下垂（把世界的"下"换算到前臂坐标系）
        const a = (st.rot || 0) * Math.sign(st.face) + p.torso - u - k;
        const g = [Math.sin(a) * Math.sign(st.face || 1), Math.cos(a)];
        const F = DIM.FORE, D = [g[0] * 36, F * 0.62 + g[1] * 36];
        fillPart(ctx, smoothD([[-12, -2], [12, -2], [18, F + 2], D, [-18, F + 2]]), far ? C[1] : C[0], def.pattern === 'dots' ? 'dots' : null, [-40, -10, 40, 100]);
      } else {
        fillPart(ctx, PART.fore, far ? C[1] : C[0]); fillPart(ctx, PART.cuff, T[0], null, null, 1.4);
      }
      if (hold) drawProp(ctx, hold, st.swordAng, out);
      fillPart(ctx, PART.hand, FACE, null, null, 1.6);
      out.hands[far ? 'far' : 'near'] = toScreen(ctx, 0, DIM.FORE + 8);
      out.rods.push(toScreen(ctx, 0, DIM.FORE + 6));
      ctx.restore();
    };
    if (st.onlyNear) { arm(p.aN, false, st.hold); ctx.restore(); return out; }
    arm(p.aF, true, st.holdFar);
    // 横扛在肩上的长木（画在近侧手臂之前，手搭在木头上）
    if (st.carry) {
      ctx.save(); torsoFrame(); ctx.translate(DIM.SH[0], DIM.SH[1] - 16);
      const Lp = st.carry.len || 520, back = Lp * 0.62;
      fillPart(ctx, polyD([[-back, -11], [Lp - back, -11], [Lp - back, 11], [-back, 11]]), 'rgba(122,84,46,0.95)', null, null, 2);
      ctx.strokeStyle = 'rgba(60,36,18,0.6)'; ctx.lineWidth = 1.2;
      for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-back + 30 + k * 90, -4 + (k % 2) * 7); ctx.lineTo(-back + 110 + k * 120, -3 + (k % 2) * 6); ctx.stroke(); }
      ctx.restore();
    }
    // 下摆
    ctx.save(); ctx.translate(0, hipY);
    if (p.kneel > 0.5) fillPart(ctx, PART.skirtKneel, C[0], def.pattern, [-50, 0, 104, 48]);
    else fillPart(ctx, def.skirt === 'long' ? PART.skirtLong : PART.skirtShort, C[0], def.pattern, [-50, 10, 60, 170]);
    ctx.restore();
    // 躯干
    ctx.save(); torsoFrame();
    fillPart(ctx, PART.torso, C[0], def.pattern, [-28, -126, 36, -20]);
    fillPart(ctx, PART.collar, T[0], null, null, 1.6); fillPart(ctx, PART.belt, T[0], null, null, 1.6);
    out.rods.push(toScreen(ctx, -6, -110));
    // 头
    ctx.translate(DIM.NECK[0], DIM.NECK[1]); ctx.rotate(p.head);
    drawHead(ctx, def, st.t);
    out.head = toScreen(ctx, 10, -96);
    ctx.restore();
    if (!st.skipNear) arm(p.aN, false, st.hold);
    ctx.restore();
    return out;
  }
  function drawHead(ctx, def, t) {
    const hatCol = k => k === 'cloth' ? pair(def.cloth || def.robe)[0] : pair(k)[0];
    // 帽后：盔缨、飘带
    if (def.plume) {
      ctx.strokeStyle = COLORS.red[0]; ctx.lineCap = 'round';
      for (let k = 0; k < 5; k++) { const w = Math.sin(t * 3 + k) * 5; ctx.lineWidth = 5 - k * 0.5; ctx.beginPath(); ctx.moveTo(-2, -100); ctx.quadraticCurveTo(-22 - k * 4, -146 + w, -50 - k * 5, -156 + k * 7 + w); ctx.stroke(); }
    }
    if (def.ribbons) {
      ctx.strokeStyle = hatCol(def.ribbons); ctx.lineCap = 'round';
      for (const k of [0, 1]) { const w = Math.sin(t * 4 + k * 2) * 6; ctx.lineWidth = 4.5; ctx.beginPath(); ctx.moveTo(-28, -64); ctx.quadraticCurveTo(-52, -60 + w + k * 10, -82, -48 + w * 1.5 + k * 14); ctx.stroke(); }
    }
    if (def.hat !== 'helmet') fillPart(ctx, PART.hair, COLORS.black[0]);
    const faceCol = FACES[def.face];
    fillPart(ctx, PART.face, faceCol);
    const featureCol = def.face === 'light' ? LINE : FACE;
    // 眉眼：深色线描（黑脸/红脸用浅色线）
    ctx.fillStyle = featureCol; ctx.strokeStyle = featureCol; ctx.lineWidth = 1.8;
    const eye = P2(PART.eye); ctx.stroke(eye);
    const [ex, ey] = [17 * 1.2, -5 * 1.2 - 43]; ctx.beginPath(); ctx.arc(ex, ey, 2.2, 0, TAU); ctx.fill();
    strokeLine(ctx, PART.brow, 2.8, featureCol); strokeLine(ctx, PART.mouth, 1.8, featureCol);
    if (def.beard && def.beard !== 'none') {
      fillPart(ctx, PART.beard[def.beard], def.beard === 'white' ? COLORS.white[0] : COLORS.black[0]);
      if (def.beard === 'white') for (let k = 0; k < 3; k++) strokeLine(ctx, H([[17 + k * 5, 32], [20 + k * 4, 70]]), 1, LINE);
    }
    ctx.save(); ctx.translate(0, -(def._hatLift || 0));
    for (const [d, col] of PART.hat[def.hat] || []) fillPart(ctx, d, hatCol(col), def.hat === 'helmet' ? 'dots' : null, [-40, -110, 40, -40]);
    if (def.hat === 'crown' || def.hat === 'tall' || def.pin) strokeLine(ctx, H([[-24, -38], [28, -43]]), 2.8, COLORS.yellow[0]);
    if (def.hat === 'liu') strokeLine(ctx, H([[-4, -28], [-8, 4], [6, 26]]), 1.4, LINE);
    ctx.restore();
    if (def.hat === 'mianliu') { // 冕旒：平顶冠前后垂珠，随头轻摆
      const sw = Math.sin(t * 2.2) * 1.5;
      for (const [x0, y0] of [...[30, 33, 36].map(x => [x, -46]), ...[-24, -27, -30].map(x => [x, -38])]) {
        const [a] = H([[x0, y0]]);
        ctx.strokeStyle = LINE; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(a[0] + sw, a[1] + 34); ctx.stroke();
        for (let k = 1; k <= 4; k++) { ctx.fillStyle = k % 2 ? 'rgba(201,162,74,0.97)' : 'rgba(86,178,122,0.95)'; ctx.beginPath(); ctx.arc(a[0] + sw * k / 4, a[1] + k * 8.5, 2.6, 0, TAU); ctx.fill(); }
      }
    }
  }

  window.RIG = { DIM, CHARS, POSES, blendPose, drawPuppet, fillPart, polyD, smoothD, COLORS, carve, P2, pair };
})();
