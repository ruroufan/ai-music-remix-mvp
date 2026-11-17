// 人物造型（全片统一）：渡边纲（侧面，朝左）、被衣女子/鬼（侧面，朝左）、祖母/鬼（正面）、马
import { clamp, lerp, rng, TAU, P, poly, shape, stroke, fill, lg, rg, css, mix, at, ss } from '../lib.js';
const INK = '#0b0908';
const sh = (c, k) => css([c[0] * k, c[1] * k, c[2] * k]);

// 全片固定配色
export const PAL = {
  skin: [226, 200, 168], skinSh: [178, 140, 110],
  tsunaRobe: [34, 48, 78], tsunaRobeD: [20, 28, 48], tsunaIn: [222, 214, 196], tsunaRed: [138, 40, 30],
  eboshi: [16, 14, 16], hilt: [208, 196, 168], gold: [176, 138, 62], saya: [18, 16, 18],
  veil: [196, 190, 204], veilD: [128, 122, 146], womanIn: [160, 44, 36], hair: [14, 12, 14],
  oni: [128, 46, 36], oniD: [64, 22, 20], horn: [214, 200, 168], eye: [240, 190, 50],
  granny: [86, 70, 84], grannyD: [48, 38, 48], grannyIn: [206, 198, 182], grey: [196, 192, 184],
  horse: [44, 30, 26], horseD: [20, 14, 13], tack: [150, 38, 28],
};

// ============ 渡边纲 ============
// 头部（侧面朝左）。原点≈头部中心，脸高约 200。look: 视线上下(-1 上, 1 下)；wide: 睁大；k 亮度
export function tsunaHead(ctx, { look = 0, wide = 0, k = 1, rim = 0, sweat = 0, neck = true } = {}) {
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // 颈
  if (neck) shape(ctx, 'M -34 70 C -30 110 -40 150 -52 176 L 62 176 C 44 140 40 90 44 40 Z', sh(PAL.skinSh, k), INK, 3);
  // 脸
  const face = P('M -40 -96 C -58 -84 -68 -62 -70 -42 C -70 -34 -66 -30 -66 -24 C -74 -8 -86 6 -94 16 C -96 22 -90 26 -78 26 C -80 32 -82 38 -78 42 C -74 46 -76 50 -80 54 C -78 60 -72 62 -72 66 C -76 80 -74 96 -58 104 C -36 112 -6 100 16 82 C 36 66 52 30 52 -10 C 52 -60 20 -100 -40 -96 Z');
  ctx.fillStyle = lg(ctx, -90, 0, 60, 0, [[0, sh(PAL.skin, k * 1.03)], [.6, sh(PAL.skin, k * .96)], [1, sh(PAL.skinSh, k)]]); ctx.fill(face); stroke(ctx, face, INK, 3.2);
  // 下颌阴影
  ctx.save(); ctx.clip(face); ctx.fillStyle = css(PAL.skinSh, .55 * k + .1); ctx.fill(P('M -70 86 C -40 96 0 80 30 40 L 60 60 L 20 120 L -70 120 Z')); ctx.restore();
  // 耳
  shape(ctx, 'M 14 -14 C 30 -24 42 -8 38 10 C 36 24 26 34 18 30 C 12 18 10 -2 14 -14 Z', sh(PAL.skin, k * .95), INK, 2.5);
  stroke(ctx, 'M 22 -6 C 30 -4 30 10 24 18', css(PAL.skinSh, 1), 2);
  // 鬓发
  shape(ctx, 'M -30 -98 C 0 -104 40 -90 52 -50 C 58 -20 52 10 46 30 C 40 10 36 -10 30 -22 C 20 -30 10 -20 8 0 C 0 -30 -10 -60 -30 -70 Z', sh(PAL.hair, 1), INK, 2);
  // 眉
  ctx.fillStyle = sh(PAL.hair, 1); ctx.fill(P(`M -72 ${-44 - wide * 6} C -60 ${-56 - wide * 8} -44 ${-58 - wide * 6} -28 ${-52 - wide * 3} L -30 ${-46 - wide * 3} C -46 ${-50 - wide * 5} -58 ${-46 - wide * 6} -70 ${-38 - wide * 5} Z`));
  // 眼
  const eo = 5 + wide * 7, ey = -28;
  const eye = P(`M -68 ${ey} C -60 ${ey - eo} -46 ${ey - eo - 1} -34 ${ey - 1} C -46 ${ey + eo * .55} -60 ${ey + eo * .5} -68 ${ey} Z`);
  ctx.fillStyle = '#efe8d8'; ctx.fill(eye);
  ctx.save(); ctx.clip(eye); ctx.fillStyle = '#120e0c'; ctx.beginPath(); ctx.arc(-56 + 0, ey + look * 3.5 - wide * 1, 5.5 + wide * .8, 0, TAU); ctx.fill(); ctx.restore();
  stroke(ctx, `M -70 ${ey + 1} C -60 ${ey - eo - 1} -46 ${ey - eo - 2} -32 ${ey - 2}`, INK, 3.4);
  stroke(ctx, `M -66 ${ey + 2} C -58 ${ey + eo * .6} -48 ${ey + eo * .6} -38 ${ey + 2}`, INK, 1.4);
  // 鼻翼、口、法令
  stroke(ctx, 'M -80 24 C -74 18 -68 20 -66 26', INK, 2.2);
  stroke(ctx, `M -80 54 C -70 ${52 + wide * 3} -62 ${54 + wide * 2} -54 58`, INK, 2.6);
  stroke(ctx, 'M -60 30 C -54 40 -52 50 -54 60', css(PAL.skinSh, .9), 2);
  // 小胡
  stroke(ctx, 'M -78 44 C -70 42 -64 44 -58 48', sh(PAL.hair, 1), 2.2);
  if (sweat > 0) { ctx.fillStyle = `rgba(230,240,255,${.7 * sweat})`; ctx.beginPath(); ctx.ellipse(-20, 20 + sweat * 14, 3.5, 6, 0, 0, TAU); ctx.fill(); }
  // 乌帽子（折乌帽子）
  const eb = P('M -74 -62 C -60 -92 -30 -112 10 -112 C 40 -110 62 -92 70 -64 C 76 -100 80 -150 74 -196 C 70 -224 50 -238 34 -226 C 6 -204 -30 -150 -52 -112 C -64 -96 -72 -80 -74 -62 Z');
  ctx.fillStyle = sh(PAL.eboshi, 1); ctx.fill(eb); stroke(ctx, eb, INK, 3);
  stroke(ctx, 'M -40 -118 C -10 -160 20 -196 44 -216', 'rgba(120,120,130,.35)', 2.5);
  stroke(ctx, 'M 10 -112 C 30 -140 54 -170 70 -180', 'rgba(120,120,130,.25)', 2);
  shape(ctx, 'M -74 -62 C -40 -84 20 -92 70 -64 L 68 -52 C 20 -78 -38 -72 -72 -50 Z', sh([30, 28, 32], 1), INK, 2);
  // 帽绳（白）
  stroke(ctx, 'M 30 -66 C 34 -10 20 60 -30 104', sh([230, 224, 208], k), 4);
  stroke(ctx, 'M -30 104 C -40 112 -46 124 -44 138 M -30 104 C -24 116 -22 128 -26 140', sh([230, 224, 208], k), 3.5);
  if (rim > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.strokeStyle = `rgba(160,190,230,${rim})`; ctx.lineWidth = 5; ctx.stroke(P('M 52 -10 C 52 30 36 66 16 82')); ctx.restore(); }
  ctx.restore();
}
// 渡边家纹：三星一文字
export function mon(ctx, x, y, s, a = .8) { ctx.save(); ctx.translate(x, y); ctx.fillStyle = `rgba(220,212,190,${a})`; for (const [px, py] of [[0, -s * .5], [-s * .55, s * .25], [s * .55, s * .25]]) { ctx.beginPath(); ctx.arc(px, py, s * .3, 0, TAU); ctx.fill(); } ctx.fillRect(-s * .9, -s * 1.25, s * 1.8, s * .28); ctx.restore(); }

// 胸像（侧面朝左）。原点 = 头部中心。
export function tsunaBust(ctx, o = {}) {
  const k = o.k ?? 1; ctx.save(); ctx.lineJoin = 'round';
  shape(ctx, 'M -34 70 C -30 110 -40 150 -56 200 L 70 200 C 44 140 40 90 44 40 Z', sh(PAL.skinSh, k), INK, 3);
  ctx.translate(0, 130); ctx.scale(.8, .86); ctx.translate(0, -130);
  // 后背与肩、宽袖
  const body = P('M 60 120 C 130 150 230 200 280 300 C 330 420 350 600 360 900 L -330 900 C -320 700 -300 520 -250 380 C -220 300 -150 220 -70 170 C -50 150 -40 140 -34 130 Z');
  ctx.fillStyle = lg(ctx, -300, 0, 360, 0, [[0, sh(PAL.tsunaRobe, k * 1.05)], [.5, sh(PAL.tsunaRobe, k * .9)], [1, sh(PAL.tsunaRobeD, k)]]); ctx.fill(body); stroke(ctx, body, INK, 4);
  // 衣褶
  for (const d of ['M 120 220 C 160 360 170 560 150 900', 'M -160 300 C -190 460 -210 640 -220 900', 'M 240 320 C 280 520 290 700 300 900', 'M -40 420 C -60 560 -70 720 -76 900']) stroke(ctx, d, 'rgba(6,8,16,.6)', 3);
  // 领：白里衣 + 赤 + 外领
  shape(ctx, 'M -40 128 C -70 180 -110 260 -130 360 L -96 372 C -76 280 -40 200 0 150 Z', sh(PAL.tsunaIn, k), INK, 3);
  shape(ctx, 'M -34 134 C -58 180 -92 250 -112 350 L -100 356 C -80 270 -48 196 -16 150 Z', sh(PAL.tsunaRed, k), null);
  shape(ctx, 'M 56 116 C 20 160 -40 250 -86 380 L -40 400 C -6 290 50 200 110 150 Z', sh(PAL.tsunaRobeD, k * 1.5), INK, 3);
  // 胸纽与家纹
  stroke(ctx, 'M -70 372 C -60 400 -64 430 -80 456 M -70 372 C -44 396 -40 430 -52 460', sh([226, 218, 198], k), 5);
  mon(ctx, 170, 420, 34, .55 * k);
  ctx.restore();
  ctx.save(); ctx.rotate(o.tilt || 0); tsunaHead(ctx, { ...o, neck: false }); ctx.restore();
}

// 太刀：原点=鞘口（镡的位置），柄朝 -x，鞘朝 +x。draw: 拔出比例
export function tachi(ctx, { k = 1, draw = 0, len = 300 } = {}) {
  ctx.save(); ctx.lineJoin = 'round';
  // 鞘（微弯）
  const saya = P(`M 0 -9 C ${len * .4} -6 ${len * .8} 6 ${len} 26 L ${len - 4} 40 C ${len * .8} 22 ${len * .4} 10 0 9 Z`);
  ctx.fillStyle = sh(PAL.saya, 1); ctx.fill(saya); stroke(ctx, saya, INK, 2.5);
  for (const u of [.18, .42]) { const x = len * u, y = u * u * 26; shape(ctx, `M ${x - 7} ${y - 12} L ${x + 7} ${y - 11} L ${x + 7} ${y + 13} L ${x - 7} ${y + 12} Z`, sh(PAL.gold, k), INK, 1.5); }
  shape(ctx, `M ${len - 26} 14 L ${len} 26 L ${len - 4} 40 L ${len - 30} 28 Z`, sh(PAL.gold, k), INK, 1.5);
  // 刀身（拔出时可见）
  const dx = -draw * len * .95;
  if (draw > 0) { ctx.fillStyle = sh([226, 232, 240], k); ctx.fill(P(`M ${dx} -6 L 0 -6 L 0 6 L ${dx} 6 Z`)); stroke(ctx, `M ${dx} -6 L 0 -6 M ${dx} 6 L 0 6`, INK, 1.5); stroke(ctx, `M ${dx} 0 L 0 0`, 'rgba(120,130,150,.7)', 1.2); }
  // 镡 + 柄
  ctx.translate(dx, 0);
  shape(ctx, 'M -4 -20 L 5 -20 L 5 20 L -4 20 Z', sh(PAL.gold, k), INK, 2);
  const hl = 96; const tsuka = P(`M -4 -9 L ${-hl} -12 C ${-hl - 10} -10 ${-hl - 10} 8 ${-hl} 10 L -4 9 Z`);
  ctx.fillStyle = sh(PAL.hilt, k); ctx.fill(tsuka); stroke(ctx, tsuka, INK, 2.5);
  ctx.strokeStyle = sh(PAL.tsunaRed, k * 1.1); ctx.lineWidth = 4; for (let x = -14; x > -hl + 6; x -= 15) { ctx.beginPath(); ctx.moveTo(x, -10); ctx.lineTo(x - 10, 10); ctx.stroke(); }
  shape(ctx, `M ${-hl - 2} -13 L ${-hl - 14} -11 L ${-hl - 14} 9 L ${-hl - 2} 11 Z`, sh(PAL.gold, k), INK, 2);
  ctx.restore();
}

// ============ 被衣女子 / 鬼 ============
// 头部（侧面朝左）。o: 0 人 → 1 鬼。原点≈头中心。
export function womanHead(ctx, { o = 0, k = 1, eyeClose = .55, lip = 0 } = {}) {
  const skin = mix([238, 228, 214], PAL.oni, o * .85), skinD = mix([196, 176, 164], PAL.oniD, o);
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // 后发
  shape(ctx, 'M -30 -104 C 30 -120 84 -80 88 -10 C 92 80 100 220 120 420 L 20 420 C 30 260 20 120 10 60 Z', sh(PAL.hair, 1), INK, 2.5);
  // 颈
  shape(ctx, 'M -30 70 C -26 110 -34 150 -44 180 L 50 180 C 36 140 34 90 36 40 Z', sh(skinD, k), INK, 2.5);
  // 脸
  const jaw = o * 10;
  const face = P(`M -34 -92 C -52 -80 -62 -60 -64 -40 C -64 -32 -60 -28 -62 -22 C -68 -8 -78 6 -84 14 C -86 20 -80 24 -70 24 C -72 30 -74 34 -70 38 C -68 42 -70 46 -72 50 C -70 54 -66 56 -66 60 C -70 ${74 + jaw} -66 ${90 + jaw} -52 ${96 + jaw} C -30 ${102 + jaw} -4 92 14 76 C 32 60 44 30 44 -10 C 44 -56 18 -96 -34 -92 Z`);
  ctx.fillStyle = lg(ctx, -84, 0, 50, 0, [[0, sh(skin, k * 1.02)], [.7, sh(skin, k * .95)], [1, sh(skinD, k)]]); ctx.fill(face); stroke(ctx, face, INK, 2.8);
  // 前发与鬓（垂在脸侧）
  shape(ctx, 'M -40 -98 C -10 -110 30 -100 48 -60 C 56 -20 50 60 40 150 C 36 220 40 300 46 380 L 6 380 C 10 280 12 180 8 100 C 6 40 0 -10 -8 -40 C -14 -64 -26 -84 -40 -98 Z', sh(PAL.hair, 1), INK, 2);
  // 引眉（高处淡眉）→ 鬼：怒眉
  if (o < .5) { ctx.fillStyle = `rgba(60,50,56,${.5 * (1 - o * 2)})`; ctx.beginPath(); ctx.ellipse(-46, -62, 9, 5, -.3, 0, TAU); ctx.fill(); }
  if (o > .2) { ctx.fillStyle = sh(PAL.hair, 1); ctx.globalAlpha = clamp((o - .2) * 2); ctx.fill(P('M -70 -30 C -56 -46 -40 -54 -22 -56 L -24 -46 C -40 -44 -54 -36 -66 -24 Z')); ctx.globalAlpha = 1; }
  // 眼
  const ey = -26, eo = lerp(lerp(7, 1.2, eyeClose), 12, o);
  const eye = P(`M -64 ${ey + 1} C -56 ${ey - eo} -42 ${ey - eo} -28 ${ey - 2} C -42 ${ey + eo * .5} -56 ${ey + eo * .5} -64 ${ey + 1} Z`);
  ctx.fillStyle = css(mix([240, 234, 222], PAL.eye, o)); ctx.fill(eye);
  ctx.save(); ctx.clip(eye); ctx.fillStyle = '#0c0a0a'; ctx.beginPath(); ctx.ellipse(-50, ey + (1 - o) * 2, lerp(5.5, 2.6, o), lerp(5.5, 9, o), 0, 0, TAU); ctx.fill(); ctx.restore();
  stroke(ctx, `M -66 ${ey + 2} C -56 ${ey - eo - 1} -42 ${ey - eo - 1} -24 ${ey - 4}`, INK, 3.2);
  if (o > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = rg(ctx, -48, ey, 0, 40, [[0, css(PAL.eye, .8 * o)], [1, css(PAL.eye, 0)]]); ctx.fillRect(-90, ey - 40, 84, 80); ctx.restore(); }
  // 鼻、口
  stroke(ctx, 'M -72 22 C -66 18 -62 20 -60 24', INK, 2);
  if (o < .5) {
    ctx.fillStyle = sh([178, 40, 34], k); ctx.fill(P(`M -72 48 C -66 ${44 - lip} -60 ${45 - lip} -54 50 C -60 ${54 + lip * 2} -66 ${54 + lip * 2} -72 48 Z`));
    stroke(ctx, 'M -72 48 C -66 49 -60 49 -54 50', INK, 1.2);
  } else {
    // 鬼口：裂到耳根，獠牙
    const m = (o - .5) * 2;
    const mo = P(`M -74 46 C -50 ${44 - m * 4} -20 ${40 - m * 8} ${-4 + m * 10} ${20 - m * 14} C -14 ${52 + m * 8} -46 ${64 + m * 10} -72 ${58 + m * 4} Z`);
    ctx.fillStyle = '#1a0606'; ctx.fill(mo); stroke(ctx, mo, INK, 2.5);
    ctx.fillStyle = sh(PAL.horn, k);
    for (const [x, y, d] of [[-66, 47, 1], [-52, 46, 1], [-38, 44, 1], [-24, 40, 1], [-60, 60, -1], [-44, 62, -1], [-28, 58, -1]]) { ctx.beginPath(); ctx.moveTo(x - 5, y); ctx.lineTo(x + 5, y - 1); ctx.lineTo(x, y + d * (8 + m * 7)); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.stroke(); }
  }
  ctx.restore();
}
// 角（侧面，一前一后）
export function hornsSide(ctx, o, k = 1) {
  if (o <= 0) return; const L = o;
  ctx.save(); ctx.lineJoin = 'round';
  for (const [x, y, s, kk] of [[-22, -116, .85, .7], [-50, -104, 1, 1]]) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const tip = [lerp(-4, -66, L), lerp(-6, -118, L)];
    const h = P(`M -16 4 C ${-26 * L - 10} ${-40 * L} ${tip[0] + 6} ${tip[1] + 30} ${tip[0]} ${tip[1]} C ${tip[0] + 22} ${tip[1] + 34} ${12 - 10 * L} ${-34 * L} 16 2 Z`);
    ctx.fillStyle = lg(ctx, 0, 0, tip[0], tip[1], [[0, sh(PAL.horn, k * kk)], [.75, sh(PAL.horn, k * kk * .8)], [1, sh([60, 40, 30], k)]]); ctx.fill(h); stroke(ctx, h, INK, 2.5);
    ctx.restore();
  }
  ctx.restore();
}
// 被衣（披在头上的外衣）+ 上身。原点=头中心。flow: 衣摆飘动相位
export function womanBust(ctx, { o = 0, k = 1, eyeClose = .55, sway = 0, lip = 0, tilt = 0 } = {}) {
  ctx.save(); ctx.lineJoin = 'round';
  const vc = sh(PAL.veil, k), vd = sh(PAL.veilD, k);
  // 身后的被衣
  const back = P(`M -70 -150 C 0 -210 110 -190 150 -90 C 200 40 ${250 + sway * 10} 300 ${300 + sway * 24} 900 L -330 900 C -300 640 -250 420 -150 300 C -110 250 -90 200 -80 160 Z`);
  ctx.fillStyle = lg(ctx, -300, 0, 320, 0, [[0, vc], [.55, sh(PAL.veil, k * .86)], [1, vd]]); ctx.fill(back); stroke(ctx, back, INK, 4);
  // 内衣领（朱）
  shape(ctx, 'M -38 130 C -70 190 -100 270 -110 380 L -60 396 C -52 300 -30 220 6 160 Z', sh(PAL.womanIn, k), INK, 3);
  shape(ctx, 'M -30 136 C -54 190 -76 270 -84 372 L -66 378 C -58 290 -40 220 -10 160 Z', sh([232, 224, 208], k), null);
  ctx.save(); ctx.rotate(tilt); womanHead(ctx, { o, k, eyeClose, lip }); hornsSide(ctx, o, k); ctx.restore();
  // 被衣前缘：从头顶垂到胸前，半遮侧脸
  const front = P(`M -80 -140 C -30 -210 90 -200 140 -110 C 176 -40 150 60 120 150 C 96 230 80 330 90 460 C 40 420 10 330 20 230 C 30 130 70 30 60 -40 C 52 -100 0 -130 -44 -112 C -60 -106 -72 -116 -80 -140 Z`);
  ctx.fillStyle = lg(ctx, -80, -200, 140, 400, [[0, sh(PAL.veil, k * 1.06)], [1, sh(PAL.veil, k * .82)]]); ctx.fill(front); stroke(ctx, front, INK, 3.5);
  // 被衣纹样（淡）与褶
  for (const d of ['M 100 -60 C 110 40 80 140 70 260', 'M 130 -20 C 136 60 110 160 104 280', 'M 190 200 C 230 420 250 640 262 900', 'M -160 420 C -190 580 -210 740 -220 900', 'M 40 520 C 30 660 26 780 30 900']) stroke(ctx, d, css(PAL.veilD, .8), 3);
  ctx.fillStyle = css(PAL.veilD, .5); for (const [x, y] of [[210, 520], [150, 700], [-120, 640], [-200, 820], [80, 840], [250, 780]]) { for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(x + Math.cos(i * TAU / 5) * 13, y + Math.sin(i * TAU / 5) * 13, 8, 8, 0, 0, TAU); ctx.fill(); } }
  // 捏着被衣的手
  const hs = mix([238, 228, 214], PAL.oni, o * .85);
  shape(ctx, 'M 36 250 C 20 244 6 250 0 262 C -4 274 4 284 18 286 C 34 288 46 278 48 266 Z', sh(hs, k), INK, 2.5);
  stroke(ctx, 'M 6 258 C 16 262 26 262 38 258 M 2 270 C 14 274 26 274 42 270', INK, 1.5);
  if (o > .3) { ctx.fillStyle = '#141010'; for (const y of [256, 268, 280]) { ctx.beginPath(); ctx.moveTo(2, y - 4); ctx.lineTo(-22 * o, y + 4); ctx.lineTo(4, y + 5); ctx.closePath(); ctx.fill(); } }
  ctx.restore();
}

// ============ 祖母 / 鬼（正面）============
// m: 0 慈祥老人 → 1 鬼。原点=脸中心。speak: 口部开合 0..1；lookUp: 抬眼
export function grannyHead(ctx, { m = 0, k = 1, speak = 0, eyeOpen = 0, under = 0 } = {}) {
  const skin = mix([216, 190, 160], PAL.oni, m * .9), skD = mix([160, 126, 100], PAL.oniD, m);
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // 白发（后）与发髻 → 鬼：乱发
  const hair = sh(mix(PAL.grey, [150, 146, 140], m), k);
  shape(ctx, 'M -92 -40 C -100 -110 -60 -150 0 -152 C 60 -150 100 -110 92 -40 C 96 0 92 30 86 50 L -86 50 C -92 30 -96 0 -92 -40 Z', hair, INK, 3);
  shape(ctx, `M -34 -150 C -40 ${-186 + m * 10} -16 ${-204 + m * 14} 0 ${-204 + m * 14} C 16 ${-204 + m * 14} 40 ${-186 + m * 10} 34 -150 Z`, hair, INK, 3);
  if (m > 0) {
    const r = rng(17); ctx.strokeStyle = hair; ctx.lineWidth = 5;
    for (let i = 0; i < 20; i++) { const a = -Math.PI * 1.08 + (i + .5) / 20 * Math.PI * 1.16, l = (110 + r() * 170) * m, bx = Math.cos(a) * 88, by = -50 + Math.sin(a) * 96, w = (r() - .5) * 90 * m; ctx.lineWidth = 5 + r() * 7; ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + Math.cos(a) * l * .5 + w, by + Math.sin(a) * l * .5 - 20 * m, bx + Math.cos(a) * l * 1.1, by + Math.sin(a) * l * .55 + 150 * m * r()); ctx.strokeStyle = INK; ctx.lineWidth += 3; ctx.stroke(); ctx.strokeStyle = hair; ctx.lineWidth -= 3; ctx.stroke(); }
  }
  // 颈
  shape(ctx, 'M -34 88 C -30 120 -40 150 -56 200 L 56 200 C 40 150 30 120 34 88 Z', sh(skD, k), INK, 2.5);
  stroke(ctx, 'M -12 110 C -10 130 -14 150 -18 164 M 12 110 C 10 130 14 150 18 164', css(mix([120, 86, 66], [30, 8, 8], m), .8), 2);
  // 脸：老人圆润下垂 → 鬼：颧骨尖、下巴长
  const cw = lerp(86, 96, m), ch = lerp(112, 132, m), jw = lerp(58, 40, m);
  const face = P(`M 0 -122 C 52 -122 ${cw} -84 ${cw} -24 C ${cw} 16 ${cw - 6} 44 ${jw + 16} 74 C ${jw} 98 26 ${ch} 0 ${ch} C -26 ${ch} ${-jw} 98 ${-jw - 16} 74 C ${-cw + 6} 44 ${-cw} 16 ${-cw} -24 C ${-cw} -84 -52 -122 0 -122 Z`);
  ctx.fillStyle = rg(ctx, 0, lerp(-20, 60, under), 10, 190, [[0, sh(skin, k * 1.06)], [.7, sh(skin, k * .92)], [1, sh(skD, k)]]); ctx.fill(face); stroke(ctx, face, INK, 3);
  ctx.save(); ctx.clip(face);
  // 发际（中分）
  ctx.fillStyle = hair; ctx.fill(P('M -100 -130 L 100 -130 L 96 -60 C 80 -86 40 -100 4 -112 L 0 -96 L -4 -112 C -40 -100 -80 -86 -96 -60 Z'));
  stroke(ctx, 'M 96 -60 C 80 -86 40 -100 4 -112 L 0 -96 L -4 -112 C -40 -100 -80 -86 -96 -60', INK, 2.2);
  // 皱纹
  const wa = .75 + m * .25, wc = css(mix([120, 86, 66], [30, 8, 8], m), wa);
  for (const d of ['M -40 -74 C -14 -80 14 -80 40 -74', 'M -32 -60 C -10 -65 10 -65 32 -60', 'M -30 8 C -44 24 -48 44 -42 60', 'M 30 8 C 44 24 48 44 42 60', 'M -66 -10 C -74 -6 -78 0 -80 8', 'M 66 -10 C 74 -6 78 0 80 8', 'M -58 -2 C -48 6 -36 8 -26 4', 'M 58 -2 C 48 6 36 8 26 4', 'M -22 96 C -8 102 8 102 22 96']) stroke(ctx, d, wc, 2);
  // 颧下阴影
  ctx.fillStyle = css(skD, .35 + m * .3); ctx.fill(P('M -84 10 C -70 40 -56 60 -40 76 L -60 90 L -96 40 Z')); ctx.fill(P('M 84 10 C 70 40 56 60 40 76 L 60 90 L 96 40 Z'));
  ctx.restore();
  // 眉
  for (const s of [-1, 1]) {
    ctx.save(); ctx.scale(s, 1);
    // 老人：下垂的淡眉；鬼：倒竖浓眉
    const b = P(`M 18 ${-42 - m * 0} C 32 ${-52 + m * 0} 52 ${lerp(-50, -70, m)} 66 ${lerp(-38, -78, m)} L ${lerp(64, 70, m)} ${lerp(-34, -64, m)} C 50 ${lerp(-44, -54, m)} 34 ${lerp(-44, -40, m)} 20 ${lerp(-36, -26, m)} Z`);
    ctx.fillStyle = css(mix([170, 164, 156], [14, 10, 10], m)); ctx.fill(b); if (m > .3) stroke(ctx, b, INK, 1.5);
    // 眼
    const e = clamp(Math.max(m, eyeOpen * .4));
    const ey = -18, ex = 42;
    if (e < .08) { stroke(ctx, `M ${ex - 20} ${ey} C ${ex - 10} ${ey - 9} ${ex + 10} ${ey - 9} ${ex + 20} ${ey + 1}`, INK, 3.2); }
    else {
      const up = lerp(3, 19, e), dn = lerp(2, 10, e), ew = lerp(20, 27, e), sl = m * 9;
      const eye = P(`M ${ex - ew} ${ey + sl} C ${ex - 10} ${ey - up + sl * .4} ${ex + 10} ${ey - up - sl * .6} ${ex + ew} ${ey - sl} C ${ex + 10} ${ey + dn - sl * .3} ${ex - 10} ${ey + dn + sl * .5} ${ex - ew} ${ey + sl} Z`);
      ctx.fillStyle = css(mix([228, 220, 204], PAL.eye, clamp(m * 1.4))); ctx.fill(eye);
      ctx.save(); ctx.clip(eye); ctx.fillStyle = '#0a0808'; ctx.beginPath(); ctx.ellipse(ex - 2, ey - 2, lerp(7, 3.2, m), lerp(7, 15, m), 0, 0, TAU); ctx.fill(); ctx.restore();
      stroke(ctx, eye, INK, lerp(2.4, 3.6, m));
    }
    ctx.restore();
  }
  if (m > .1) { ctx.save(); ctx.globalCompositeOperation = 'screen'; for (const s of [-1, 1]) { ctx.fillStyle = rg(ctx, s * 42, -18, 0, 70, [[0, css(PAL.eye, .75 * m)], [1, css(PAL.eye, 0)]]); ctx.fillRect(s * 42 - 70, -90, 140, 140); } ctx.restore(); }
  // 鼻
  stroke(ctx, `M -6 -10 C -8 8 -12 20 -${14 + m * 4} 30 C -8 36 8 36 ${14 + m * 4} 30`, INK, 2.4);
  stroke(ctx, 'M -9 31 C -6 34 -3 34 -1 32 M 9 31 C 6 34 3 34 1 32', INK, 2);
  // 口
  if (m < .35) {
    const op = speak * 9, sm = 1 - m * 2;
    const mo = P(`M -24 62 C -10 ${68 + sm * 3 - op * .2} 10 ${68 + sm * 3 - op * .2} 24 62 C 10 ${70 + sm * 3 + op} -10 ${70 + sm * 3 + op} -24 62 Z`);
    ctx.fillStyle = '#3a1512'; ctx.fill(mo); stroke(ctx, mo, INK, 2.4);
    stroke(ctx, 'M -30 58 C -28 60 -26 62 -24 62 M 30 58 C 28 60 26 62 24 62', INK, 2);
  } else {
    // 般若之口
    const g = (m - .35) / .65, mw = lerp(26, 62, g), up = lerp(0, 22, g), dn = lerp(6, 34, g);
    const mo = P(`M ${-mw} ${58 - up} C ${-mw * .5} ${66} ${mw * .5} ${66} ${mw} ${58 - up} C ${mw * .7} ${70 + dn} ${-mw * .7} ${70 + dn} ${-mw} ${58 - up} Z`);
    ctx.fillStyle = '#160404'; ctx.fill(mo); stroke(ctx, mo, INK, 3);
    ctx.save(); ctx.clip(mo); ctx.fillStyle = sh(PAL.horn, k);
    for (let i = -4; i <= 4; i++) { const x = i * mw / 4.6, y = 58 - up + Math.abs(i) * Math.abs(i) * -.2 + 5 + (1 - Math.abs(i) / 4) * up * .9; const big = Math.abs(i) === 3; ctx.beginPath(); ctx.moveTo(x - 6, y - 4); ctx.lineTo(x + 6, y - 4); ctx.lineTo(x, y + (big ? 26 : 11) * g); ctx.closePath(); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.stroke(); }
    for (let i = -3; i <= 3; i++) { const x = i * mw / 4.2 + 4, y = 66 + dn * .82 - Math.abs(i) * Math.abs(i) * 1.6 * g; const big = Math.abs(i) === 2; ctx.beginPath(); ctx.moveTo(x - 6, y + 4); ctx.lineTo(x + 6, y + 4); ctx.lineTo(x, y - (big ? 22 : 9) * g); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    ctx.restore();
  }
  // 角（从发际长出）
  if (m > .15) {
    const L = clamp((m - .15) / .85);
    for (const s of [-1, 1]) {
      ctx.save(); ctx.scale(s, 1); ctx.translate(44, -104);
      const tip = [lerp(6, 62, L), lerp(-10, -150, L)];
      const h = P(`M -16 8 C ${-12 + 6 * L} ${-50 * L} ${tip[0] - 22} ${tip[1] + 44} ${tip[0]} ${tip[1]} C ${tip[0] - 2} ${tip[1] + 50} ${22 + 14 * L} ${-40 * L} 18 4 Z`);
      ctx.fillStyle = lg(ctx, 0, 0, tip[0], tip[1], [[0, sh(PAL.horn, k * .95)], [.7, sh(PAL.horn, k * .8)], [1, sh([60, 40, 30], k)]]); ctx.fill(h); stroke(ctx, h, INK, 3);
      ctx.strokeStyle = 'rgba(60,40,30,.5)'; ctx.lineWidth = 1.5; for (let i = 1; i < 4; i++) { const u = i / 4; ctx.beginPath(); ctx.moveTo(lerp(-14, tip[0] - 6, u), lerp(4, tip[1] + 20, u)); ctx.lineTo(lerp(16, tip[0] + 2, u), lerp(2, tip[1] + 22, u)); ctx.stroke(); }
      ctx.restore();
    }
  }
  ctx.restore();
}
// 祖母上身（正面，佝偻窄肩）。原点=脸中心。右袖（画面左侧）空垂——她的右臂“不在”
export function grannyBust(ctx, o = {}) {
  const k = o.k ?? 1, m = o.m ?? 0; ctx.save(); ctx.lineJoin = 'round';
  ctx.translate(0, 138); ctx.scale(.78, .86); ctx.translate(0, -138);
  const body = P('M -60 140 C -150 170 -230 230 -262 330 C -300 480 -310 700 -320 960 L 320 960 C 310 700 300 480 262 330 C 230 230 150 170 60 140 Z');
  ctx.fillStyle = lg(ctx, -320, 0, 320, 0, [[0, sh(PAL.grannyD, k * 1.2)], [.5, sh(PAL.granny, k)], [1, sh(PAL.grannyD, k * 1.1)]]); ctx.fill(body); stroke(ctx, body, INK, 4);
  for (const d of ['M -200 300 C -230 480 -240 700 -246 960', 'M 200 300 C 230 480 240 700 246 960', 'M -90 420 C -100 600 -104 780 -106 960', 'M 110 440 C 118 620 120 800 122 960']) stroke(ctx, d, 'rgba(10,6,10,.6)', 3);
  // 领
  shape(ctx, 'M -62 138 C -40 220 -14 300 0 372 C 14 300 40 220 62 138 L 30 150 C 14 210 4 250 0 280 C -4 250 -14 210 -30 150 Z', sh(PAL.grannyIn, k), INK, 3);
  shape(ctx, 'M -62 138 C -110 240 -90 400 -30 520 L 16 500 C -20 400 -30 280 -30 150 Z', sh(PAL.granny, k * 1.18), INK, 3);
  shape(ctx, 'M 62 138 C 110 240 100 380 20 520 L -24 492 C 30 400 34 280 30 150 Z', sh(PAL.granny, k * 1.3), INK, 3);
  ctx.restore();
  ctx.save(); ctx.rotate(o.tilt || 0); grannyHead(ctx, o); ctx.restore();
  // 领口压住颈部
  ctx.save(); ctx.translate(0, 138); ctx.scale(.78, .86); ctx.translate(0, -138);
  shape(ctx, 'M -62 138 C -40 220 -14 300 0 372 C 14 300 40 220 62 138 L 30 150 C 14 210 4 250 0 280 C -4 250 -14 210 -30 150 Z', sh(PAL.grannyIn, k), INK, 3);
  shape(ctx, 'M -62 138 C -110 240 -90 400 -30 520 L 16 500 C -20 400 -30 280 -30 150 Z', sh(PAL.granny, k * 1.18), INK, 3);
  shape(ctx, 'M 62 138 C 110 240 100 380 20 520 L -24 492 C 30 400 34 280 30 150 Z', sh(PAL.granny, k * 1.3), INK, 3);
  ctx.restore();
}

// ============ 马（侧面朝左）。原点=鞍下方地面。ph: 步态相位 ============
export function horse(ctx, { ph = 0, k = 1, walk = 1, sil = false } = {}) {
  const c = sil ? '#050506' : sh(PAL.horse, k), cd = sil ? '#050506' : sh(PAL.horseD, k), ink = sil ? '#050506' : INK;
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const leg = (hx, hy, a1, a2, l1, l2, w, far) => {
    // 两段腿：大腿角 a1，小腿角 a2（相对竖直，正=向前(左)）
    const kx = hx - Math.sin(a1) * l1, ky = hy + Math.cos(a1) * l1, fx = kx - Math.sin(a2) * l2, fy = ky + Math.cos(a2) * l2;
    const col = far ? cd : c;
    const taper = (x0, y0, x1, y1, w0, w1) => { const L = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / L, ny = (x1 - x0) / L; ctx.beginPath(); ctx.moveTo(x0 + nx * w0, y0 + ny * w0); ctx.lineTo(x1 + nx * w1, y1 + ny * w1); ctx.lineTo(x1 - nx * w1, y1 - ny * w1); ctx.lineTo(x0 - nx * w0, y0 - ny * w0); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 3; ctx.stroke(); };
    taper(hx, hy, kx, ky, w * .62, w * .3); taper(kx, ky, fx, fy, w * .27, w * .2);
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(kx, ky, w * .31, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(fx, fy - 6, w * .26, 0, TAU); ctx.fill();
    ctx.save(); ctx.translate(fx, fy); ctx.rotate(-a2 * .6); shape(ctx, 'M -13 -4 L 12 -4 L 18 20 L -20 20 Z', sil ? c : '#0c0a0a', ink, 2); ctx.restore();
  };
  const sw = (o) => Math.sin(ph + o) * .42 * walk, lift = (o) => Math.max(0, Math.cos(ph + o)) * .5 * walk;
  // 远侧腿
  leg(-128, -300, sw(Math.PI) + .04, sw(Math.PI) * .3 - lift(Math.PI), 160, 142, 50, true);
  leg(166, -310, sw(Math.PI * 1.5) - .16, sw(Math.PI * 1.5) * .2 + .26 + lift(Math.PI * 1.5) * .6, 168, 150, 60, true);
  // 尾
  const tw = Math.sin(ph * .5) * 12;
  shape(ctx, `M 214 -398 C 262 -390 ${296 + tw} -300 ${290 + tw} -190 C ${286 + tw} -150 ${268 + tw} -120 ${256 + tw} -110 C ${262 + tw} -190 250 -280 214 -340 Z`, cd, ink, 3);
  // 躯干
  const body = P('M -170 -330 C -182 -384 -150 -424 -100 -418 C -20 -402 60 -402 130 -422 C 192 -428 228 -384 224 -322 C 222 -280 200 -250 170 -244 C 90 -232 -40 -230 -110 -250 C -150 -262 -166 -292 -170 -330 Z');
  ctx.fillStyle = sil ? c : lg(ctx, 0, -430, 0, -230, [[0, sh(PAL.horse, k * 1.25)], [.5, c], [1, cd]]); ctx.fill(body); stroke(ctx, body, ink, 3.5);
  // 近侧腿
  leg(-140, -296, sw(0) + .04, sw(0) * .3 - lift(0), 166, 142, 54, false);
  leg(176, -306, sw(Math.PI * .5) - .16, sw(Math.PI * .5) * .2 + .26 + lift(Math.PI * .5) * .6, 174, 150, 66, false);
  // 颈与头（随步伐微点头）
  ctx.save(); ctx.translate(-130, -390); ctx.rotate(Math.sin(ph * 2) * .025 * walk); ctx.translate(130, 390);
  const neck = P('M -92 -414 C -118 -470 -158 -540 -204 -574 C -222 -588 -246 -584 -260 -568 L -338 -480 C -352 -462 -344 -438 -322 -436 C -300 -434 -284 -448 -270 -468 C -250 -482 -230 -490 -216 -482 C -202 -440 -186 -380 -168 -328 C -140 -340 -108 -372 -92 -414 Z');
  ctx.fillStyle = sil ? c : lg(ctx, -340, 0, -90, 0, [[0, sh(PAL.horse, k * 1.15)], [1, c]]); ctx.fill(neck); stroke(ctx, neck, ink, 3.5);
  shape(ctx, 'M -214 -572 L -206 -622 L -188 -574 Z', c, ink, 3); shape(ctx, 'M -232 -580 L -234 -626 L -212 -584 Z', cd, ink, 3);
  if (!sil) {
    // 鬃
    shape(ctx, 'M -206 -578 C -170 -560 -130 -500 -96 -420 C -110 -416 -126 -420 -134 -430 C -150 -480 -180 -530 -214 -556 Z', '#0a0808', INK, 2.5);
    ctx.fillStyle = '#0a0808'; ctx.beginPath(); ctx.ellipse(-264, -546, 6, 5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(-266, -548, 1.6, 0, TAU); ctx.fill();
    stroke(ctx, 'M -334 -462 C -330 -458 -326 -458 -322 -462', INK, 2.5); stroke(ctx, 'M -338 -448 C -326 -446 -316 -448 -306 -454', INK, 2);
    // 辔头、缰
    stroke(ctx, 'M -300 -520 L -282 -456 M -262 -566 L -226 -494 M -300 -520 C -280 -516 -260 -520 -246 -530', sh(PAL.tack, k), 5);
  }
  ctx.restore();
  if (!sil) {
    // 鞦、胸悬（朱色带与厚总）
    stroke(ctx, 'M -166 -340 C -130 -350 -90 -372 -60 -404', sh(PAL.tack, k), 7); stroke(ctx, 'M 60 -404 C 110 -380 170 -372 222 -340', sh(PAL.tack, k), 7);
    for (const [x, y] of [[-150, -344], [-110, -360], [130, -378], [180, -360]]) { shape(ctx, `M ${x - 9} ${y} L ${x + 9} ${y} L ${x + 13} ${y + 50} L ${x - 13} ${y + 50} Z`, sh(PAL.tack, k * .9), INK, 2); stroke(ctx, `M ${x - 6} ${y + 20} L ${x - 8} ${y + 48} M ${x + 6} ${y + 20} L ${x + 8} ${y + 48}`, 'rgba(40,8,6,.8)', 1.5); }
    // 鞍与障泥
    shape(ctx, 'M -76 -414 C -70 -340 -50 -300 -20 -290 L 40 -292 C 64 -310 76 -350 78 -410 Z', sh([30, 26, 30], k), INK, 3);
    shape(ctx, 'M -84 -420 C -80 -450 -64 -462 -52 -444 C -20 -432 20 -432 52 -444 C 66 -464 84 -450 86 -418 C 40 -404 -40 -404 -84 -420 Z', sh([22, 18, 20], 1), INK, 3);
    stroke(ctx, 'M -80 -424 C -76 -448 -64 -456 -54 -442 M 56 -444 C 66 -458 80 -448 82 -422', sh(PAL.gold, k), 2.5);
  }
  ctx.restore();
}
