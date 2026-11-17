// 全身像与剪影：骑马的纲（及身后的女子/鬼）、桥头女子、门外祖母、站立的纲、空中交锋剪影
import { clamp, lerp, rng, TAU, P, poly, shape, stroke, fill, lg, rg, css, mix, at, ss } from '../lib.js';
import { PAL, tsunaHead, tsunaBust, womanBust, grannyBust, horse, tachi, mon } from './chars.js';
const INK = '#0b0908';
const sh = (c, k) => css([c[0] * k, c[1] * k, c[2] * k]);

// 骑马。原点=马鞍下方地面，朝左。woman: 是否载着女子；o: 鬼化；bundle: 布包
export function riders(ctx, { ph = 0, k = 1, walk = 1, woman = false, o = 0, look = 0, tilt = 0, bundle = false, sil = false, hand = 0, rider = true } = {}) {
  const bob = Math.sin(ph * 2) * 4 * walk;
  horse(ctx, { ph, k, walk, sil });
  if (!rider) return;
  ctx.save(); ctx.translate(0, bob); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (sil) {
    ctx.fillStyle = '#050506';
    ctx.fill(P('M -58 -604 C -76 -560 -76 -500 -62 -452 C -92 -420 -100 -370 -86 -300 L -30 -296 C -20 -350 10 -420 60 -440 C 70 -500 62 -570 36 -606 Z'));
    ctx.fill(P('M -30 -596 C -70 -580 -110 -520 -122 -470 L -84 -452 C -60 -470 -30 -500 10 -520 Z'));
    at(ctx, -8, -668, .4, tilt, () => { ctx.fill(P('M -74 -62 C -60 -92 -30 -112 10 -112 C 40 -110 62 -92 70 -64 C 76 -100 80 -150 74 -196 C 70 -224 50 -238 34 -226 C 6 -204 -30 -150 -52 -112 C -64 -96 -72 -80 -74 -62 Z')); ctx.fill(P('M -40 -96 C -70 -62 -70 -30 -94 16 L -72 66 C -76 96 -58 104 -30 104 C 36 66 52 30 52 -10 C 52 -60 20 -100 -40 -96 Z M -34 70 L -52 176 L 62 176 L 44 40 Z')); });
    at(ctx, -24, -474, .56, .32, () => { ctx.fill(P('M 0 -9 C 120 -6 240 6 300 26 L 296 40 C 240 22 120 10 0 9 Z M -4 -9 L -110 -12 L -110 10 L -4 9 Z')); });
    if (woman) at(ctx, 96, -652, .4, 0, () => { ctx.fill(P('M -70 -150 C 0 -210 110 -190 150 -90 C 200 40 250 300 300 900 L -330 900 C -300 640 -250 420 -150 300 C -110 250 -90 200 -80 160 L -84 14 Z')); if (o > 0) { ctx.fill(P('M -66 -100 C -86 -150 -110 -190 -116 -222 C -88 -196 -56 -150 -34 -108 Z M -38 -112 C -52 -160 -64 -196 -62 -220 C -44 -190 -22 -150 -8 -120 Z')); } });
    ctx.restore(); return;
  }
  // 女子坐在身后
  if (woman) at(ctx, 96, -652, .4, 0, () => womanBust(ctx, { o, k, sway: Math.sin(ph) * .6 }));
  // 躯干
  const torso = P('M -58 -604 C -76 -560 -76 -500 -62 -452 L 60 -440 C 70 -500 62 -570 36 -606 Z');
  ctx.fillStyle = sh(PAL.tsunaRobe, k * .92); ctx.fill(torso); stroke(ctx, torso, INK, 3);
  // 裤（袴）与脚
  const hak = P('M -64 -456 C -96 -420 -104 -366 -90 -296 L -30 -292 C -18 -350 12 -420 60 -442 Z');
  ctx.fillStyle = sh(PAL.tsunaRobeD, k * 1.25); ctx.fill(hak); stroke(ctx, hak, INK, 3);
  stroke(ctx, 'M -70 -420 C -76 -380 -74 -340 -66 -300', 'rgba(4,6,12,.6)', 2);
  shape(ctx, 'M -92 -296 L -30 -292 L -34 -268 L -110 -266 C -112 -280 -104 -292 -92 -296 Z', '#0c0a0a', INK, 2.5);
  stroke(ctx, 'M -60 -440 L -62 -280', sh(PAL.tack, k * .8), 3);
  // 太刀（左腰，朝向观众一侧）
  at(ctx, -24, -474, .56, .32, () => tachi(ctx, { k }));
  // 领
  shape(ctx, 'M -30 -610 C -50 -580 -60 -540 -62 -500 L -44 -496 C -40 -540 -30 -580 -8 -606 Z', sh(PAL.tsunaIn, k), INK, 2);
  // 头
  at(ctx, -8, -668, .4, tilt, () => tsunaHead(ctx, { k, look }));
  // 近侧衣袖与手
  const hx = lerp(-104, -40, hand), hy = lerp(-466, -476, hand);
  const sl = P(`M -34 -598 C -70 -584 ${-112 + hand * 50} -524 ${hx - 18} ${hy - 4} L ${hx + 20} ${hy + 14} C -60 -470 -30 -500 12 -524 Z`);
  ctx.fillStyle = sh(PAL.tsunaRobe, k * 1.08); ctx.fill(sl); stroke(ctx, sl, INK, 3);
  mon(ctx, -44, -540, 9, .5 * k);
  shape(ctx, `M ${hx - 16} ${hy - 6} C ${hx - 30} ${hy - 2} ${hx - 30} ${hy + 14} ${hx - 14} ${hy + 16} L ${hx + 8} ${hy + 12} L ${hx + 4} ${hy - 6} Z`, sh(PAL.skin, k), INK, 2);
  if (hand < .5) stroke(ctx, `M ${hx - 22} ${hy + 6} C -200 -470 -260 -474 -298 -${470 - bob}`, sh(PAL.tack, k * .9), 3);
  if (bundle) { shape(ctx, 'M 30 -470 C 60 -500 120 -496 140 -462 C 150 -430 120 -410 80 -412 C 50 -414 24 -436 30 -470 Z', sh([188, 178, 156], k), INK, 3); stroke(ctx, 'M 50 -486 C 80 -470 110 -470 134 -480 M 60 -420 C 80 -440 100 -444 130 -436', 'rgba(60,50,40,.7)', 2); ctx.fillStyle = `rgba(90,20,16,.7)`; ctx.beginPath(); ctx.ellipse(112, -440, 16, 12, .3, 0, TAU); ctx.fill(); }
  ctx.restore();
}

// 桥头站立的被衣女子。原点=脚下地面。高约 1150（局部单位），调用方自行缩放
export function womanStand(ctx, { o = 0, k = 1, sway = 0, eyeClose = .55 } = {}) {
  ctx.save(); ctx.translate(0, -1080);
  womanBust(ctx, { o, k, sway, eyeClose });
  shape(ctx, `M -330 898 C -360 960 -260 1004 -60 1000 C 120 1004 ${300 + sway * 30} 1000 ${330 + sway * 30} 960 C ${330 + sway * 24} 930 ${300 + sway * 24} 898 ${300 + sway * 24} 898 Z`, sh(PAL.veil, k * .84), INK, 4);
  shape(ctx, 'M -336 930 C -380 990 -330 1040 -220 1050 C -150 1056 -100 1030 -90 1000 C -180 1000 -280 980 -336 930 Z', sh(PAL.womanIn, k), INK, 3.5);
  ctx.restore();
}
// 门外的祖母（正面，佝偻，左手拄杖——画面右侧；右袖空垂）。原点=脚下。
export function grannyStand(ctx, o = {}) {
  const k = o.k ?? 1;
  ctx.save(); ctx.translate(0, -1010);
  grannyBust(ctx, o);
  shape(ctx, 'M -250 840 C -262 930 -200 1000 0 1004 C 200 1000 262 930 250 840 Z', sh(PAL.grannyD, k * 1.15), INK, 4);
  // 杖
  stroke(ctx, 'M 196 330 L 240 1010', INK, 15); stroke(ctx, 'M 196 330 L 240 1010', sh([96, 66, 40], k), 9);
  shape(ctx, 'M 176 390 C 168 370 184 352 204 356 C 226 360 232 384 222 402 C 208 416 186 410 176 390 Z', sh(mix([216, 190, 160], PAL.oni, (o.m || 0) * .9), k), INK, 2.5);
  stroke(ctx, 'M 184 372 L 220 380 M 182 386 L 222 394', INK, 1.5);
  ctx.restore();
}
// 站立的纲（侧面朝左）。原点=脚下。
export function tsunaStand(ctx, o = {}) {
  const k = o.k ?? 1;
  ctx.save(); ctx.translate(0, -1330); ctx.lineJoin = 'round';
  // 袴
  const hk = P('M -200 700 C -230 900 -250 1100 -240 1300 L -30 1300 C -20 1180 -6 1060 6 960 C 30 1080 60 1200 90 1300 L 280 1300 C 260 1080 240 880 210 700 Z');
  ctx.fillStyle = sh(PAL.tsunaRobeD, k * 1.3); ctx.fill(hk); stroke(ctx, hk, INK, 4);
  for (const d of ['M -120 760 C -140 940 -150 1120 -146 1300', 'M 120 760 C 150 940 170 1120 186 1300', 'M 6 960 L 0 760']) stroke(ctx, d, 'rgba(4,6,12,.6)', 3);
  shape(ctx, 'M -250 1300 L -20 1300 L -24 1332 L -290 1332 C -292 1314 -276 1302 -250 1300 Z', '#0c0a0a', INK, 3);
  shape(ctx, 'M 80 1300 L 290 1300 L 286 1332 L 40 1332 C 40 1316 56 1304 80 1300 Z', '#0c0a0a', INK, 3);
  tsunaBust(ctx, o);
  at(ctx, -150, 690, 1.25, .42, () => tachi(ctx, { k, draw: o.draw || 0 }));
  ctx.restore();
}

// ---- 空中交锋剪影（原点=鬼的头部）----
export function oniFlight(ctx, { t = 0, arm = true, col = '#040405', grab = 1 } = {}) {
  ctx.save(); ctx.fillStyle = col; ctx.lineJoin = 'round';
  const w = (a, f = 1) => Math.sin(t * 3 * f + a) * 16;
  // 被衣如尾翼向右下拖曳
  ctx.fill(P(`M -60 -70 C 0 -130 110 -110 160 -30 C 230 60 ${330 + w(0)} 110 ${470 + w(1)} ${250 + w(2)} C ${400 + w(1)} 250 ${350 + w(3)} 300 ${420 + w(2)} ${420 + w(1)} C ${320 + w(2)} 380 ${260 + w(0)} 420 ${300 + w(3)} ${560 + w(0)} C ${200 + w(1)} 480 ${150 + w(2)} 420 ${120 + w(1)} ${330 + w(3)} C 80 400 20 420 -60 380 C -100 300 -110 200 -90 120 Z`));
  // 头与乱发、双角
  ctx.fill(P('M -70 -60 C -90 -20 -92 30 -70 70 C -40 100 20 100 60 60 C 90 20 80 -50 40 -80 C 0 -100 -50 -90 -70 -60 Z'));
  ctx.fill(P('M -50 -70 C -70 -120 -100 -170 -124 -196 C -90 -180 -50 -130 -22 -86 Z M -8 -86 C -14 -140 -30 -186 -40 -212 C -10 -180 16 -130 26 -84 Z'));
  for (let i = 0; i < 9; i++) { const a = -.2 + i * .16; ctx.fill(P(`M ${40 + i * 4} ${-60 + i * 12} C ${120 + i * 10} ${-90 + i * 16 + w(i, 1.5)} ${180 + i * 8} ${-70 + i * 20 + w(i + 1, 1.5)} ${230 + i * 6 + w(i)} ${-40 + i * 26} C ${170 + i * 8} ${-50 + i * 22} ${110 + i * 8} ${-56 + i * 18} ${40 + i * 4} ${-40 + i * 12} Z`)); }
  // 右臂伸向下方抓人
  if (arm) ctx.fill(P(`M -60 120 C -90 180 -120 250 -${130 + grab * 20} ${330 + grab * 30} C -${150 + grab * 20} ${350 + grab * 30} -${170 + grab * 20} ${352 + grab * 30} -${180 + grab * 20} ${340 + grab * 30} C -150 250 -120 170 -100 100 Z`));
  ctx.restore();
}
export function tsunaFall(ctx, { t = 0, col = '#040405', sword = 0 } = {}) {
  // 原点=被掐住的颈部。身体悬垂，手按刀柄；sword>0 时刀已出鞘上挥
  ctx.save(); ctx.fillStyle = col;
  const s = Math.sin(t * 2.4) * .06;
  ctx.rotate(.12 + s);
  // 头（乌帽子）
  ctx.fill(P('M -34 -12 C -50 -40 -40 -84 -6 -92 C 20 -96 44 -76 44 -44 C 44 -20 30 -4 10 0 Z M -30 -70 C -24 -110 0 -150 30 -176 C 44 -184 56 -170 54 -150 C 50 -120 44 -96 40 -70 Z'));
  // 躯干与宽袖
  ctx.fill(P('M -30 -6 C -80 30 -110 110 -100 210 C -60 250 40 250 90 210 C 100 110 80 30 30 -6 Z'));
  ctx.fill(P(`M 60 30 C 130 50 ${190 + s * 200} 120 ${200 + s * 200} 190 C 160 200 120 170 80 130 Z`));
  ctx.fill(P('M -70 40 C -130 80 -170 150 -160 220 C -130 220 -100 180 -70 130 Z'));
  // 袴与腿
  ctx.fill(P(`M -98 200 C -130 320 ${-150 + s * 300} 430 ${-160 + s * 400} 520 L ${-100 + s * 400} 530 C -70 440 -30 350 0 260 C 20 350 ${50 - s * 300} 440 ${70 - s * 400} 540 L ${130 - s * 400} 530 C 120 420 110 300 90 200 Z`));
  // 刀
  if (sword <= 0) ctx.fill(P('M -70 190 L 150 280 L 146 292 L -74 204 Z'));
  else { ctx.save(); ctx.translate(100, 60); ctx.rotate(lerp(1.2, -1.9, sword)); ctx.fill(P('M -8 0 L 260 -8 L 300 0 L 260 8 Z M -30 -6 L 0 -6 L 0 6 L -30 6 Z')); ctx.restore(); }
  ctx.restore();
}
