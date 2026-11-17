// 道具：木箱（斜投影 3/4 视角 + 俯视）、封绳、符纸、行灯、鬼的断臂（固定为右臂）
import { clamp, lerp, rng, TAU, P, poly, shape, stroke, fill, lg, rg, css, glow, SERIF, ss } from '../lib.js';

export const BOX = { w: 520, h: 250, d: 300, foot: 36, lidT: 44, ov: 14, sx: 0.2, sy: 0.42 };
const B = BOX;
export const prj = (x, y, z) => [x + z * B.sx, -y - z * B.sy];
const INK = '#0c0908';
const WOOD = { front: [74, 47, 30], top: [98, 64, 40], side: [112, 72, 42], dark: [30, 19, 13], in: [16, 10, 8] };
const shade = (c, k) => css([c[0] * k, c[1] * k, c[2] * k]);

function grain(ctx, pts, seed, dir = 'x', n = 14, a = .28) {
  // 在四边形 pts 内画木纹
  ctx.save(); ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.clip();
  const r = rng(seed); const [p0, p1, p2, p3] = pts;
  for (let i = 0; i < n; i++) {
    const v = (i + r()) / n, amp = 2 + r() * 5, ph = r() * 9;
    ctx.beginPath();
    for (let k = 0; k <= 24; k++) {
      const u = k / 24;
      const ax = lerp(p0[0], p1[0], u), ay = lerp(p0[1], p1[1], u), bx = lerp(p3[0], p2[0], u), by = lerp(p3[1], p2[1], u);
      const vv = v + Math.sin(u * 5 + ph) * amp / 300;
      const x = lerp(ax, bx, vv), y = lerp(ay, by, vv);
      k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.strokeStyle = `rgba(10,6,4,${a * (.4 + r() * .8)})`; ctx.lineWidth = .8 + r() * 1.8; ctx.stroke();
  }
  ctx.restore();
}

// 绳：沿折线画搓捻的稻草绳
export function rope(ctx, pts, w = 16, { col = [176, 146, 88], dark = [84, 62, 30], k = 1 } = {}) {
  if (pts.length < 2) return;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const pth = () => { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); };
  pth(); ctx.strokeStyle = INK; ctx.lineWidth = w + 5; ctx.stroke();
  pth(); ctx.strokeStyle = css([col[0] * k, col[1] * k, col[2] * k]); ctx.lineWidth = w; ctx.stroke();
  // 捻纹
  let acc = 0; ctx.strokeStyle = css([dark[0] * k, dark[1] * k, dark[2] * k], .85); ctx.lineWidth = Math.max(1.5, w * .16);
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], L = Math.hypot(x1 - x0, y1 - y0); if (L < .01) continue;
    const ux = (x1 - x0) / L, uy = (y1 - y0) / L, nx = -uy, ny = ux; let s = (w * .62) - acc;
    while (s < L) {
      const cx = x0 + ux * s, cy = y0 + uy * s, h = w * .42;
      ctx.beginPath(); ctx.moveTo(cx + nx * h - ux * h * .7, cy + ny * h - uy * h * .7); ctx.lineTo(cx - nx * h + ux * h * .7, cy - ny * h + uy * h * .7); ctx.stroke();
      s += w * .62;
    }
    acc = (acc + L) % (w * .62);
  }
  // 高光
  pth(); ctx.strokeStyle = `rgba(255,236,190,${.16 * k})`; ctx.lineWidth = w * .22; ctx.setLineDash([w * .3, w * .94]); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
}
const seg = (a, b, n = 8) => Array.from({ length: n + 1 }, (_, i) => [lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n)]);
const curve = (p0, p1, p2, p3, n = 16) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, m = 1 - t; return [m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0], m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1]]; });

// 符纸（封条）。part: 'all' | 'top' | 'bottom'，tear 为撕裂处 y
export function ofuda(ctx, w, h, { part = 'all', tearY = 0, k = 1 } = {}) {
  ctx.save();
  ctx.beginPath();
  if (part === 'all') ctx.rect(-w / 2, 0, w, h);
  else {
    const zig = []; for (let i = 0; i <= 8; i++) zig.push([-w / 2 + w * i / 8, tearY + (i % 2 ? -5 : 5)]);
    if (part === 'top') { ctx.moveTo(-w / 2, 0); ctx.lineTo(w / 2, 0); for (let i = 8; i >= 0; i--) ctx.lineTo(zig[i][0], zig[i][1]); }
    else { ctx.moveTo(-w / 2, h); ctx.lineTo(w / 2, h); for (let i = 8; i >= 0; i--) ctx.lineTo(zig[i][0], zig[i][1]); }
    ctx.closePath();
  }
  ctx.save(); ctx.clip();
  ctx.fillStyle = shade([226, 214, 186], k); ctx.fillRect(-w / 2, 0, w, h);
  ctx.fillStyle = `rgba(90,60,30,${.18})`; ctx.fillRect(-w / 2, 0, w * .12, h);
  ctx.font = `900 ${w * .72}px ${SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = shade([24, 18, 16], 1); ctx.fillText('封', 0, h * .3);
  ctx.font = `700 ${w * .34}px ${SERIF}`; ctx.fillText('鬼', 0, h * .56); ctx.fillText('腕', 0, h * .69);
  ctx.strokeStyle = shade([150, 34, 26], k); ctx.lineWidth = 3; ctx.strokeRect(-w * .26, h * .79, w * .52, w * .52);
  ctx.fillStyle = shade([150, 34, 26], k); ctx.fillRect(-w * .14, h * .79 + w * .12, w * .28, w * .28);
  ctx.restore();
  ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore();
}

// 3/4 视角木箱。原点 = 箱体正面底边中点（地面）。
// open: 箱盖开启角(0..1 -> 0..100°)；rope: 1=封好 0=无；lid: false 则不画箱盖；k: 整体亮度
export function drawBox(ctx, { open = 0, rope: rp = 1, seal = 1, lid = true, k = 1, tie = 1, inner = 0 } = {}) {
  const hw = B.w / 2, y0 = B.foot, y1 = B.foot + B.h, D = B.d;
  const q = (pts) => pts.map(p => prj(...p));
  ctx.save(); ctx.lineJoin = 'round';
  // 后脚与右侧面
  poly(ctx, q([[hw - 30, 0, D - 80], [hw - 30, 0, D - 30], [hw - 30, 140, D - 30], [hw - 30, 140, D - 80]]), shade(WOOD.dark, k), INK, 2.5);
  const side = q([[hw, y0, 0], [hw, y0, D], [hw, y1, D], [hw, y1, 0]]);
  poly(ctx, side, shade(WOOD.side, k), INK, 3); grain(ctx, [side[3], side[2], side[1], side[0]], 31, 'x', 10, .3);
  ctx.save(); poly(ctx, side, null); ctx.clip(); ctx.fillStyle = lg(ctx, side[0][0], 0, side[1][0], 0, [[0, 'rgba(0,0,0,.28)'], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(-600, -600, 1200, 800); ctx.restore();
  // 右侧脚
  poly(ctx, q([[hw + 8, 0, D / 2 - 26], [hw + 8, 0, D / 2 + 26], [hw + 8, 150, D / 2 + 22], [hw + 8, 150, D / 2 - 22]]), shade(WOOD.dark, k * 1.5), INK, 2.5);
  // 箱内（开盖时可见）
  const rim = q([[-hw, y1, 0], [hw, y1, 0], [hw, y1, D], [-hw, y1, D]]);
  poly(ctx, rim, shade(WOOD.in, k), INK, 3);
  ctx.save(); poly(ctx, rim, null); ctx.clip();
  poly(ctx, q([[-hw, y1, D], [hw, y1, D], [hw, y0, D], [-hw, y0, D]]), shade([40, 26, 17], k * (1 + inner)), null);
  poly(ctx, q([[-hw, y1, 0], [-hw, y1, D], [-hw, y0, D], [-hw, y0, 0]]), shade([28, 18, 12], k * (1 + inner)), null);
  ctx.fillStyle = lg(ctx, 0, rim[2][1], 0, rim[0][1], [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.85)']]); ctx.fillRect(-600, -700, 1200, 700);
  ctx.restore();
  // 正面
  const front = q([[-hw, y0, 0], [hw, y0, 0], [hw, y1, 0], [-hw, y1, 0]]);
  poly(ctx, front, shade(WOOD.front, k), INK, 3);
  grain(ctx, [front[3], front[2], front[1], front[0]], 12, 'x', 16, .34);
  ctx.save(); poly(ctx, front, null); ctx.clip();
  ctx.fillStyle = lg(ctx, -hw, 0, hw, 0, [[0, 'rgba(0,0,0,.38)'], [.55, 'rgba(0,0,0,.05)'], [1, 'rgba(255,170,90,.07)']]); ctx.fillRect(-600, -600, 1200, 700);
  ctx.strokeStyle = 'rgba(8,5,3,.7)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-hw, -(y0 + B.h * .5)); ctx.lineTo(hw, -(y0 + B.h * .5)); ctx.stroke();
  ctx.restore();
  // 正面两脚
  for (const s of [-1, 1]) {
    const x = s * (hw - 78);
    poly(ctx, [[x - 30, 0], [x + 30, 0], [x + 24, -165], [x - 24, -165]], shade(WOOD.dark, k * 1.7), INK, 3);
    ctx.fillStyle = shade([140, 112, 70], k); ctx.beginPath(); ctx.arc(x, -140, 4.5, 0, TAU); ctx.arc(x, -60, 4.5, 0, TAU); ctx.fill();
  }
  // 铁角
  for (const s of [-1, 1]) for (const yy of [y0, y1]) {
    const x = s * hw, sy = yy === y0 ? 1 : -1;
    poly(ctx, [[x, -yy], [x - s * 52, -yy], [x - s * 52, -yy - sy * 16], [x - s * 16, -yy - sy * 16], [x - s * 16, -yy - sy * 52], [x, -yy - sy * 52]], shade([22, 17, 15], k), INK, 2);
    ctx.fillStyle = shade([120, 100, 72], k); ctx.beginPath(); ctx.arc(x - s * 36, -yy - sy * 8, 3, 0, TAU); ctx.arc(x - s * 8, -yy - sy * 36, 3, 0, TAU); ctx.fill();
  }
  // 符纸下半（贴在箱体）
  const ofX = 150, ofW = 84, ofH = 250, ofTop = y1 + B.lidT - 6; // 符纸顶端在盖沿上
  if (seal > 0) { ctx.save(); ctx.translate(ofX, -ofTop); ctx.rotate(.015); ofuda(ctx, ofW, ofH, { part: open > .002 ? 'bottom' : 'all', tearY: ofTop - y1 + 2, k }); ctx.restore(); }

  // ---- 箱盖 ----
  if (lid) {
    const th = open * 100 * Math.PI / 180, c = Math.cos(th), s = Math.sin(th), lw = hw + B.ov;
    const L = (x, dy, dz) => prj(x, y1 + dy * c + dz * s, D - dz * c + dy * s);
    const F = D + B.ov, Bk = -B.ov, T = B.lidT;
    const vis = (n) => n[0] * B.sx + n[1] * B.sy - n[2] > 0;
    const faces = [
      { n: [0, -c, -s], pts: [L(-lw, 0, Bk), L(lw, 0, Bk), L(lw, 0, F), L(-lw, 0, F)], col: shade([46, 30, 20], k), g: 51 },       // 底面
      { n: [0, -s, c], pts: [L(-lw, 0, Bk), L(lw, 0, Bk), L(lw, T, Bk), L(-lw, T, Bk)], col: shade(WOOD.dark, k) },                 // 后
      { n: [1, 0, 0], pts: [L(lw, 0, F), L(lw, 0, Bk), L(lw, T, Bk), L(lw, T, F)], col: shade(WOOD.side, k * .95) },                // 右
      { n: [0, c, s], pts: [L(-lw, T, F), L(lw, T, F), L(lw, T, Bk), L(-lw, T, Bk)], col: shade(WOOD.top, k), g: 77 },              // 顶
      { n: [0, s, -c], pts: [L(-lw, 0, F), L(lw, 0, F), L(lw, T, F), L(-lw, T, F)], col: shade(WOOD.front, k * 1.12), g: 23, front: 1 }, // 前沿
    ];
    for (const f of faces) {
      if (!vis(f.n)) continue;
      poly(ctx, f.pts, f.col, INK, 3);
      if (f.g) grain(ctx, f.pts, f.g, 'x', f.front ? 4 : 12, .3);
    }
    // 封绳（盖闭合时）
    if (rp > 0 && open < .01) {
      const yt = y1 + T, k2 = k;
      const P3 = (x, y, z) => prj(x, y, z);
      // 绳 A：正面中线 -> 盖顶 -> 后
      const A = [...seg(P3(0, 0, -2), P3(0, yt, -B.ov - 2), 14), ...seg(P3(0, yt + 2, -B.ov), P3(0, yt + 2, D + B.ov), 12)];
      // 绳 C：盖顶横向 -> 右侧面向下
      const C = [...seg(P3(-lw, yt + 2, D / 2), P3(lw + 2, yt + 2, D / 2), 16), ...seg(P3(lw + 4, yt, D / 2), P3(hw + 6, 0, D / 2), 12)];
      ctx.save(); ctx.globalAlpha = clamp(rp * 3);
      rope(ctx, C, 17, { k: k2 }); rope(ctx, A, 17, { k: k2 });
      // 绳结
      const [kx, ky] = P3(0, yt + 4, D / 2);
      ctx.translate(kx, ky);
      const loose = 1 - tie;
      rope(ctx, curve([-6, 0], [-70 - loose * 30, -52], [-120 - loose * 40, 6], [-14, 6]), 13, { k: k2 });
      rope(ctx, curve([6, 0], [70 + loose * 30, -52], [120 + loose * 40, 6], [14, 6]), 13, { k: k2 });
      rope(ctx, curve([-6, 8], [-40, 40], [-64 - loose * 40, 52], [-96 - loose * 70, 84 + loose * 20]), 12, { k: k2 });
      rope(ctx, curve([6, 8], [36, 44], [70 + loose * 40, 50], [108 + loose * 70, 78 + loose * 20]), 12, { k: k2 });
      ctx.fillStyle = shade([176, 146, 88], k2); ctx.strokeStyle = INK; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(0, 4, 24 * tie + 8, 17 * tie + 6, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = shade([84, 62, 30], k2); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-12, -4); ctx.lineTo(8, 12); ctx.moveTo(0, -8); ctx.lineTo(16, 6); ctx.moveTo(-18, 4); ctx.lineTo(-4, 14); ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();
}

// 落在地上的箱盖（被掀飞后）
export function drawLidFallen(ctx, k = 1) {
  ctx.save();
  const pts = [[-280, 0], [250, -44], [300, 74], [-230, 122]];
  poly(ctx, pts.map(p => [p[0] + 4, p[1] + 26]), shade(WOOD.dark, k), INK, 3);
  poly(ctx, pts, shade(WOOD.top, k * .9), INK, 3); grain(ctx, pts, 77, 'x', 12, .3);
  ctx.restore();
}

// 行灯
export function drawAndon(ctx, t, level = 1) {
  const w = 120, h = 300, f = level;
  ctx.save();
  // 纸罩
  const paper = lg(ctx, 0, -h, 0, -40, [[0, css([120 + 110 * f, 70 + 90 * f, 30 + 40 * f])], [.5, css([150 + 105 * f, 96 + 110 * f, 40 + 70 * f])], [1, css([110 + 90 * f, 60 + 70 * f, 26 + 30 * f])]]);
  poly(ctx, [[-w / 2, -40], [w / 2, -40], [w / 2 - 8, -h], [-w / 2 + 8, -h]], paper, null);
  ctx.fillStyle = rg(ctx, 0, -h * .5, 4, 90, [[0, `rgba(255,244,210,${.9 * f})`], [1, 'rgba(255,200,120,0)']]); ctx.fillRect(-w / 2, -h, w, h - 40);
  // 骨架
  ctx.strokeStyle = '#120c09'; ctx.lineWidth = 7; ctx.lineCap = 'butt';
  ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(-w / 2 + 8, -h - 6); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2 - 8, -h - 6); ctx.stroke();
  ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-w / 2 + 8, -h); ctx.lineTo(w / 2 - 8, -h); ctx.moveTo(-w / 2, -40); ctx.lineTo(w / 2, -40); ctx.moveTo(-w / 2 + 4, -h * .56); ctx.lineTo(w / 2 - 4, -h * .56); ctx.stroke();
  ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -40); ctx.lineTo(0, -h); ctx.stroke();
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-w / 2 - 8, 0); ctx.lineTo(w / 2 + 8, 0); ctx.stroke();
  ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-w / 2 + 14, -h - 6); ctx.quadraticCurveTo(0, -h - 46, w / 2 - 14, -h - 6); ctx.stroke();
  ctx.restore();
}

// ---------- 鬼的断臂（俯视，右臂：指尖朝左，拇指在下侧，断口在右）----------
export function drawArm(ctx, { k = 1, curl = 0, wrap = 1 } = {}) {
  const skin = [122, 46, 36], dk = [62, 22, 20];
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // 前臂
  const fore = P('M 230 -52 C 150 -66 40 -52 -50 -34 C -70 -30 -84 -22 -92 -10 L -92 30 C -80 40 -64 44 -44 44 C 40 60 150 66 232 52 C 244 20 244 -22 230 -52 Z');
  ctx.fillStyle = lg(ctx, 0, -60, 0, 64, [[0, shade(skin, k * 1.12)], [.55, shade(skin, k)], [1, shade(dk, k)]]); ctx.fill(fore); stroke(ctx, fore, INK, 3.5);
  // 筋与毛
  ctx.strokeStyle = css(dk, .8); ctx.lineWidth = 2.2;
  for (const [a, b, c, d] of [[180, -30, 20, -22], [190, 8, 30, 8], [170, 34, 40, 30]]) { ctx.beginPath(); ctx.moveTo(a, b); ctx.quadraticCurveTo((a + c) / 2, b - 8, c, d); ctx.stroke(); }
  const r = rng(9); ctx.strokeStyle = 'rgba(14,8,8,.85)'; ctx.lineWidth = 1.6;
  for (let i = 0; i < 46; i++) { const x = -40 + r() * 250, y = -50 + r() * 16 + (x < 20 ? 14 : 0), l = 10 + r() * 16; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - l * .5, y - l * .9, x - l, y - l * .7 - r() * 6); ctx.stroke(); }
  // 手掌
  const palm = P('M -80 -34 C -110 -44 -150 -44 -176 -30 C -190 -10 -190 18 -178 36 C -150 50 -110 48 -84 40 C -74 20 -72 -14 -80 -34 Z');
  ctx.fillStyle = lg(ctx, 0, -44, 0, 50, [[0, shade(skin, k * 1.1)], [1, shade(dk, k * 1.1)]]); ctx.fill(palm); stroke(ctx, palm, INK, 3.5);
  // 四指（带爪）
  const fy = [-30, -10, 12, 32], fl = [86, 100, 94, 74];
  fy.forEach((y, i) => {
    const L = fl[i], c = curl * (14 + i * 3), x0 = -172;
    const tipx = x0 - L + c * 1.2, tipy = y + (i - 1.5) * 5 + c;
    ctx.beginPath(); ctx.moveTo(x0, y - 9); ctx.quadraticCurveTo(x0 - L * .5, y - 12 + (i - 1.5) * 2 + c * .2, tipx, tipy - 6);
    ctx.lineTo(tipx, tipy + 6); ctx.quadraticCurveTo(x0 - L * .5, y + 11 + (i - 1.5) * 2 + c * .2, x0, y + 9); ctx.closePath();
    ctx.fillStyle = shade(skin, k * (1.05 - i * .08)); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
    // 指节
    ctx.strokeStyle = css(dk, .9); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 - L * .42, y - 8 + c * .2); ctx.lineTo(x0 - L * .42 - 3, y + 8 + c * .2); ctx.stroke();
    // 爪
    ctx.beginPath(); ctx.moveTo(tipx + 4, tipy - 7); ctx.quadraticCurveTo(tipx - 22, tipy - 6, tipx - 40, tipy + 8 + c * .4); ctx.quadraticCurveTo(tipx - 16, tipy + 8, tipx + 4, tipy + 7); ctx.closePath();
    ctx.fillStyle = shade([24, 20, 18], k); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = `rgba(230,220,200,${.35 * k})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(tipx - 4, tipy - 3); ctx.lineTo(tipx - 24, tipy); ctx.stroke();
  });
  // 拇指（下侧）
  ctx.beginPath(); ctx.moveTo(-100, 40); ctx.quadraticCurveTo(-120, 70, -160, 78); ctx.lineTo(-166, 66); ctx.quadraticCurveTo(-140, 52, -128, 36); ctx.closePath();
  ctx.fillStyle = shade(dk, k * 1.3); ctx.fill(); ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-158, 80); ctx.quadraticCurveTo(-182, 84, -198, 100); ctx.quadraticCurveTo(-178, 74, -164, 64); ctx.closePath(); ctx.fillStyle = shade([24, 20, 18], k); ctx.fill(); ctx.stroke();
  // 断口布条
  if (wrap) {
    const w = P('M 196 -62 C 214 -66 236 -64 250 -56 C 262 -20 262 22 250 58 C 232 66 212 66 196 62 C 204 22 204 -22 196 -62 Z');
    ctx.fillStyle = shade([196, 184, 160], k); ctx.fill(w); stroke(ctx, w, INK, 3);
    ctx.fillStyle = shade([92, 20, 16], k); ctx.beginPath(); ctx.ellipse(246, 0, 14, 44, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = `rgba(92,20,16,${.55})`; ctx.beginPath(); ctx.ellipse(222, 10, 16, 30, .3, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(40,30,20,.6)'; ctx.lineWidth = 2; for (const x of [206, 218, 230]) { ctx.beginPath(); ctx.moveTo(x, -60); ctx.quadraticCurveTo(x + 8, 0, x, 60); ctx.stroke(); }
  }
  ctx.restore();
}

// 俯视木箱：外框 hw×hh，内铺白布。arm: 0/1 断臂是否在；stain: 布上的痕迹
export function drawBoxTop(ctx, { arm = 1, k = 1, stain = 1, curl = 0 } = {}) {
  const hw = 400, hh = 250, wall = 34;
  ctx.save();
  poly(ctx, [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]], shade(WOOD.top, k * .8), INK, 4);
  grain(ctx, [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]], 5, 'x', 22, .3);
  const ih = hh - wall, iw = hw - wall;
  poly(ctx, [[-iw, -ih], [iw, -ih], [iw, ih], [-iw, ih]], shade([20, 13, 10], k), INK, 3);
  // 内壁阴影
  ctx.save(); ctx.beginPath(); ctx.rect(-iw, -ih, iw * 2, ih * 2); ctx.clip();
  // 白布
  const cloth = P(`M ${-iw + 16} ${-ih + 22} C -200 ${-ih + 4} 120 ${-ih + 30} ${iw - 14} ${-ih + 14} C ${iw - 2} -60 ${iw - 22} 80 ${iw - 10} ${ih - 16} C 160 ${ih - 2} -150 ${ih - 26} ${-iw + 12} ${ih - 12} C ${-iw + 26} 60 ${-iw + 2} -70 ${-iw + 16} ${-ih + 22} Z`);
  ctx.fillStyle = lg(ctx, -iw, -ih, iw, ih, [[0, shade([150, 142, 124], k)], [1, shade([104, 96, 82], k)]]); ctx.fill(cloth); stroke(ctx, cloth, INK, 2.5);
  ctx.strokeStyle = 'rgba(40,32,24,.35)'; ctx.lineWidth = 2.5;
  for (const d of ['M -300 -150 C -200 -120 -100 -160 40 -130', 'M -260 150 C -120 120 60 170 240 130', 'M 200 -160 C 240 -60 220 40 260 120', 'M -320 -40 C -300 20 -330 80 -300 140']) ctx.stroke(P(d));
  if (stain > 0) {
    // 断臂压出的凹痕与血渍
    ctx.save(); ctx.globalAlpha = stain;
    ctx.fillStyle = 'rgba(26,18,12,.3)'; ctx.fill(P('M 250 -56 C 150 -74 30 -60 -60 -40 C -110 -52 -170 -50 -200 -34 L -300 -30 L -306 44 L -200 44 C -160 62 -110 58 -70 50 C 40 68 150 74 250 58 Z'));
    ctx.fillStyle = 'rgba(26,18,12,.22)'; ctx.fill(P('M 236 -40 C 150 -54 40 -44 -50 -26 C -100 -36 -160 -34 -186 -22 L -186 30 C -150 44 -100 42 -60 36 C 40 52 150 56 236 44 Z'));
    ctx.fillStyle = 'rgba(86,18,14,.6)'; ctx.fill(P('M 214 -52 C 250 -70 296 -40 290 6 C 300 44 262 76 222 60 C 196 30 194 -20 214 -52 Z'));
    ctx.fillStyle = 'rgba(50,10,8,.55)'; ctx.beginPath(); ctx.ellipse(250, 2, 26, 40, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(86,18,14,.5)'; for (const [x, y, r] of [[190, 70, 7], [170, -70, 5], [300, 60, 6], [140, 86, 4], [310, -50, 4]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
  if (arm > 0) { ctx.save(); ctx.globalAlpha = clamp(arm); ctx.translate(14, 0); ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(10, 34, 250, 52, 0, 0, TAU); ctx.fill(); drawArm(ctx, { k, curl }); ctx.restore(); }
  ctx.fillStyle = lg(ctx, 0, -ih, 0, -ih + 90, [[0, 'rgba(0,0,0,.75)'], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(-iw, -ih, iw * 2, 90);
  ctx.fillStyle = lg(ctx, -iw, 0, -iw + 70, 0, [[0, 'rgba(0,0,0,.6)'], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(-iw, -ih, 70, ih * 2);
  ctx.restore();
  // 铁角
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) { poly(ctx, [[sx * hw, sy * hh], [sx * (hw - 60), sy * hh], [sx * (hw - 60), sy * (hh - wall)], [sx * (hw - wall), sy * (hh - wall)], [sx * (hw - wall), sy * (hh - 60)], [sx * hw, sy * (hh - 60)]], shade([22, 17, 15], k), INK, 2.5); }
  ctx.restore();
}
