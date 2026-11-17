// 家中场景：障子门外的人影、祖母登门、抓臂、变脸、破屋顶、空箱前的纲、片尾落版、封面
import { W, H, clamp, lerp, ss, io, eout, ein, rng, TAU, n1, flicker, camera, at, poly, lg, rg, css, glow, darkness, wash, fog, motes, vtext, htext, P, stroke, shape, map, mix, SERIF } from '../lib.js';
import { PAL, grannyBust, grannyHead } from '../art/chars.js';
import { grannyStand, tsunaStand, oniFlight } from '../art/figures.js';
import { drawBox, drawBoxTop, drawArm, drawLidFallen, rope } from '../art/props.js';
import { room, lighting, knockPulse, OX, OY } from './room.js';
import { layer, sky } from './outdoor.js';

// ---------- 障子门 ----------
const DX0 = 80, DX1 = 1000, DY0 = 340, DY1 = 1540, PW = (DX1 - DX0) / 2;
function visitorShadow(ctx, { size = 1, soft = 1, a = .8, cane = 0, x = 0 } = {}) {
  // 佝偻、披衣的人形影子（多层叠画形成柔边）
  const d = P('M -18 -560 C -70 -560 -96 -510 -86 -456 C -80 -430 -70 -412 -60 -402 C -130 -380 -190 -300 -214 -180 C -236 -80 -244 60 -250 200 L 230 200 C 226 60 216 -80 190 -200 C 168 -300 110 -380 44 -404 C 60 -420 72 -450 70 -486 C 66 -530 30 -560 -18 -560 Z');
  ctx.save(); ctx.translate(x, 0);
  const n = 9;
  for (let i = 0; i < n; i++) { const k = 1 + (i / (n - 1) - .5) * .16 * soft; ctx.save(); ctx.translate(0, -180); ctx.scale(size * k, size * k); ctx.translate(0, 180); ctx.fillStyle = `rgba(6,8,14,${a / n * 1.9})`; ctx.fill(d); if (cane > 0) { ctx.strokeStyle = `rgba(6,8,14,${a / n * 1.9 * cane})`; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(196, -190); ctx.lineTo(236, 200); ctx.stroke(); } ctx.restore(); }
  ctx.restore();
}
function panel(ctx, x, { moon = .6, k = 1 } = {}) {
  // 一扇障子：纸 + 桟 + 腰板
  const y0 = DY0, y1 = DY1, kb = 230;
  ctx.fillStyle = '#0d0907'; ctx.fillRect(x, y0, PW, y1 - y0);
  ctx.fillStyle = '#0f0a08'; ctx.fillRect(x + 16, y1 - kb, PW - 32, kb - 16);
  ctx.strokeStyle = 'rgba(40,26,16,.5)'; ctx.lineWidth = 2; for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(x + 16 + i * (PW - 32) / 5, y1 - kb); ctx.lineTo(x + 16 + i * (PW - 32) / 5, y1 - 16); ctx.stroke(); }
}
function paperLight(ctx, x, moon, t) {
  const y0 = DY0 + 16, y1 = DY1 - 230 - 12, w = PW - 32;
  ctx.fillStyle = lg(ctx, 0, y0, 0, y1, [[0, css([96 * moon + 22, 110 * moon + 24, 140 * moon + 30])], [.5, css([150 * moon + 22, 164 * moon + 24, 190 * moon + 30])], [1, css([86 * moon + 20, 98 * moon + 22, 126 * moon + 28])]]);
  ctx.fillRect(x + 16, y0, w, y1 - y0);
}
function lattice(ctx, x) {
  const y0 = DY0 + 16, y1 = DY1 - 230 - 12, w = PW - 32;
  ctx.fillStyle = '#0d0907';
  for (let i = 1; i < 4; i++) ctx.fillRect(x + 16 + i * w / 4 - 3, y0, 6, y1 - y0);
  for (let j = 1; j < 9; j++) ctx.fillRect(x + 16, y0 + j * (y1 - y0) / 9 - 3, w, 6);
  ctx.fillRect(x + 16, y1, w, 12);
}
function doorFrame(ctx) {
  ctx.fillStyle = '#080605'; ctx.fillRect(-400, -400, 1880, DY0 + 400); ctx.fillRect(-400, -400, DX0 + 400, 3000); ctx.fillRect(DX1, -400, 800, 3000);
  ctx.fillStyle = '#120c09'; ctx.fillRect(-400, DY0 - 40, 1880, 40); ctx.fillRect(DX0 - 46, -400, 46, 2400); ctx.fillRect(DX1, -400, 46, 2400);
  // 地板
  ctx.fillStyle = lg(ctx, 0, DY1, 0, 2300, [[0, '#20140d'], [1, '#0c0705']]); ctx.fillRect(-400, DY1, 1880, 900);
  ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 4; for (let x = -300; x < 1500; x += 170) { ctx.beginPath(); ctx.moveTo(x, DY1 + 30); ctx.lineTo(x - 60, 2300); ctx.stroke(); }
  ctx.fillStyle = '#0b0705'; ctx.fillRect(-400, DY1 - 6, 1880, 36);
}
// 门外的夜
function outside(ctx, t) {
  ctx.fillStyle = lg(ctx, 0, DY0, 0, DY1, [[0, '#0e1730'], [.6, '#22304e'], [1, '#141b2c']]); ctx.fillRect(DX0, DY0, DX1 - DX0, DY1 - DY0);
  glow(ctx, 880, 520, 500, [170, 190, 230], .5);
  // 松枝与石径
  ctx.fillStyle = '#080c14'; ctx.fill(P('M 1000 400 C 900 420 820 470 760 540 C 820 520 880 520 940 540 C 900 560 880 600 870 650 C 920 610 960 600 1000 600 Z'));
  ctx.fillStyle = '#0c1220'; ctx.fillRect(DX0, 1420, DX1 - DX0, 130);
  ctx.fillStyle = 'rgba(120,140,180,.22)'; for (const [x, y, w] of [[700, 1450, 150], [840, 1500, 170], [600, 1510, 120]]) { ctx.beginPath(); ctx.ellipse(x, y, w / 2, 16, 0, 0, TAU); ctx.fill(); }
}
// 通用：门的场景。open: 右扇向左拉开的量 0..1
function door(ctx, t, { moon = .55, sh = null, open = 0, granny = null, lamp = .3, rattle = 0 } = {}) {
  const off = -open * (PW - 30), jx = rattle * n1(t * 60, 4) * 5;
  doorFrame(ctx);
  if (open > 0) { ctx.save(); ctx.beginPath(); ctx.rect(DX0, DY0, DX1 - DX0, DY1 - DY0); ctx.clip(); outside(ctx, t); fog(ctx, t, { y: 1440, h: 200, n: 5, a: .09, seed: 3, color: [160, 180, 220] }); if (granny) granny(); ctx.restore(); }
  // 纸上的光与影
  for (const [x, i] of [[DX0 + jx * .6, 0], [DX0 + PW + off + jx, 1]]) {
    panel(ctx, x); paperLight(ctx, x, moon, t);
    ctx.save(); ctx.beginPath(); ctx.rect(x + 16, DY0 + 16, PW - 32, DY1 - DY0 - 258); ctx.clip();
    // 枯枝的影
    ctx.strokeStyle = 'rgba(10,14,24,.34)'; ctx.lineCap = 'round';
    const sw = Math.sin(t * .7) * 10;
    for (const [d, w] of [[`M 1100 380 C 900 ${430 + sw} 760 ${420 + sw} 600 ${520 + sw * 1.4}`, 13], [`M 860 ${428 + sw} C 800 ${520 + sw} 760 ${600 + sw} 700 ${660 + sw * 1.6}`, 8], [`M 760 ${440 + sw} C 700 ${400 + sw} 640 ${390 + sw} 560 ${400 + sw * 1.5}`, 7], [`M 660 ${480 + sw} C 640 ${560 + sw} 600 ${620 + sw} 590 ${700 + sw * 1.7}`, 5]]) { ctx.lineWidth = w; ctx.stroke(P(d)); }
    if (sh && !(i === 1 && open > .02)) { ctx.translate(0, DY1 - 230); visitorShadow(ctx, sh); }
    ctx.restore();
    lattice(ctx, x);
    ctx.strokeStyle = '#060403'; ctx.lineWidth = 5; ctx.strokeRect(x, DY0, PW, DY1 - DY0);
  }
  // 室内暖光与压暗
  glow(ctx, 1150, 1700, 900, [255, 150, 62], .3 * lamp * flicker(t, 3));
}

// ---------- S02 片头：门外模糊的人影 ----------
export function shoji_open(ctx, s) {
  const { t, dur } = s, u = t / dur, a = ss(.2, dur * .8, t);
  camera(ctx, { cx: lerp(540, 560, u), cy: lerp(960, 900, u), z: lerp(1.0, 1.13, io(u)) }, () => {
    door(ctx, t, { moon: .5, sh: { size: lerp(1.2, 1.55, a), soft: 2.6, a: lerp(.25, .7, a), x: lerp(640, 560, a) } });
  });
  darkness(ctx, 540, 900, 380, 1250, .9);
}
// ---------- S17 第六夜的敲门 ----------
export function shoji_knock(ctx, s) {
  const { t, dur } = s, kn = s.m('knockB', .4), u = t / dur, kp = knockPulse(t, kn);
  const a = ss(0, dur * .9, t);
  camera(ctx, { cx: 550, cy: lerp(930, 900, u), z: lerp(1.04, 1.16, io(u)), ox: n1(t * 40, 2) * kp * 5 }, () => {
    door(ctx, t, { moon: .55, rattle: kp, sh: { size: lerp(1.55, 1.25, a), soft: lerp(2.6, 1.6, a), a: lerp(.6, .82, a), x: 560 } });
  });
  darkness(ctx, 540, 900, 380, 1250, .9);
}
// ---------- S18 开门：祖母站在外面 ----------
export function door_open(ctx, s) {
  const { t, dur } = s, u = t / dur, c1 = s.m('L20.c1', 1.5);
  const op = io(clamp((t - .25) / 1.5));
  camera(ctx, { cx: lerp(600, 760, io(u)), cy: lerp(940, 1010, io(u)), z: lerp(1.08, 1.5, io(u)) }, () => {
    door(ctx, t, {
      moon: .55, open: op, lamp: .6, sh: { size: lerp(1.25, 1.0, op), soft: 1.3, a: .82, x: lerp(560, 300, op), cane: 0 },
      granny: () => layer(ctx, g => at(g, 780, 1560, .7, 0, () => grannyStand(g, { k: 1 })), { tint: 'rgba(14,24,54,.16)' })
    });
    glow(ctx, 780, 1100, 520, [255, 170, 90], .16 * op);
  });
  darkness(ctx, 560, 960, 420, 1300, .86);
}

// ---------- 祖母特写：door 门外寒暄 / lean 凑近木箱 / morph 变脸 ----------
export function granny_close(ctx, s) {
  const { t, dur, p } = s, u = t / dur, mode = p.mode || 'door';
  let o = { k: 1 }, z = 1.2, y = 760, shake = 0, lampA = .25, red = 0;
  if (mode === 'door') {
    ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#0c1428'], [.6, '#202c48'], [1, '#101726']]); ctx.fillRect(0, 0, W, H);
    glow(ctx, 900, 300, 700, [170, 190, 230], .4);
    ctx.fillStyle = '#080c14'; ctx.fill(P('M 1080 100 C 900 130 760 200 660 320 C 760 280 860 280 960 310 C 900 350 870 410 850 480 C 930 420 1000 400 1080 400 Z'));
    ctx.fillStyle = '#0a0706'; ctx.fillRect(0, 0, 90, H); ctx.fillStyle = '#140d09'; ctx.fillRect(90, 0, 26, H);
    fog(ctx, t, { y: 1500, h: 500, n: 6, a: .08, seed: 14, color: [150, 170, 210] });
    const l0 = s.m('L21', 0), l1 = s.m('L21.end', dur), c1 = s.m('L21.c1', 2), gap = t > c1 - .35 && t < c1;
    const talking = t > l0 && t < l1 && !gap;
    o = { k: 1, speak: talking ? Math.abs(Math.sin(t * 8.5)) * (.55 + .45 * Math.sin(t * 2.7 + 1)) : 0, tilt: Math.sin(t * 1.1) * .025 + .02 };
    z = lerp(1.22, 1.4, io(u)); y = 800;
  } else {
    ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#080505'], [1, '#1d120b']]); ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#0e0907'; ctx.fillRect(820, 0, 60, H); ctx.fillRect(0, 300, W, 46);
    if (mode === 'lean') { const a = io(u); o = { k: .95, under: 1, eyeOpen: ss(.35, 1, u) * 2, tilt: lerp(0, .05, a) }; z = lerp(1.1, 1.62, a); y = lerp(700, 900, a); lampA = .5; }
    else {
      const c1 = s.m('L26.c1', 2.4), m = clamp(eout(clamp((t - c1 + .15) / 1.15)) + (t > c1 - .15 ? n1(t * 22, 3) * .05 : 0));
      shake = m * (1 - ss(c1 + 1.2, c1 + 2.2, t) * .5); red = m;
      o = { k: lerp(.95, 1.1, m), under: 1, eyeOpen: 2, m, tilt: n1(t * 14, 1) * .03 * m }; z = lerp(1.5, 1.95, io(u)); y = lerp(880, 800, m); lampA = lerp(.5, .2, m) * (t > c1 - .15 ? flicker(t * 3, 9) * (.6 + .4 * Math.abs(n1(t * 16, 2))) : 1);
    }
  }
  layer(ctx, g => at(g, 540 + n1(t * 44, 2) * shake * 12, y + n1(t * 44, 6) * shake * 12, z, 0, () => grannyBust(g, o)), { tint: mode === 'door' ? 'rgba(16,26,60,.2)' : css(mix([50, 18, 0], [60, 0, 0], red), .2 + red * .08) });
  if (mode === 'door') glow(ctx, 300, 1500, 900, [255, 160, 80], .2);
  else { glow(ctx, 600, 1750, 1000, [255, 140, 56], lampA); if (red > 0) glow(ctx, 540, 780, 900, [200, 30, 10], .22 * red); }
  darkness(ctx, 540, mode === 'door' ? 820 : 900, mode === 'door' ? 480 : lerp(420, 330, red), 1300, mode === 'door' ? .86 : .93);
}

// ---------- S22 伸手抓住断臂（俯视）----------
export function grab(ctx, s) {
  const { t, dur } = s, c1 = s.m('L24.c1', .6), u = t / dur;
  const a = eout(clamp((t - c1 - .25) / .32)), hit = c1 + .57, jolt = t > hit ? Math.exp(-(t - hit) * 7) : 0, cl = ss(hit + .2, dur, t);
  camera(ctx, { cx: 560 + n1(t * 50, 1) * jolt * 10, cy: 960 + jolt * 14, z: lerp(1.16, 1.4, io(u)) + jolt * .05, r: -.03 }, () => {
    ctx.fillStyle = '#24160d'; ctx.fillRect(-900, -900, 3000, 3800);
    ctx.strokeStyle = 'rgba(6,3,2,.8)'; ctx.lineWidth = 4; for (let y = -700; y < 2800; y += 150) { ctx.beginPath(); ctx.moveTo(-900, y); ctx.lineTo(2100, y + 40); ctx.stroke(); }
    at(ctx, 540, 960, 1.08, 0, () => drawBoxTop(ctx, { arm: 1, k: 1, curl: jolt * .6 }));
    // 祖母的左手从右上伸入
    const hx = lerp(1250, 640, a), hy = lerp(200, 930, a);
    const skin = mix([214, 188, 158], PAL.oni, cl * .55);
    at(ctx, hx, hy, 1.25, .62, () => {
      shape(ctx, 'M -150 -900 L 170 -900 C 150 -600 120 -300 84 -110 L -84 -110 C -110 -300 -140 -600 -150 -900 Z', css(PAL.granny), '#0b0908', 5);
      stroke(ctx, 'M -60 -900 C -50 -600 -40 -300 -30 -120 M 70 -900 C 60 -600 50 -300 40 -120', 'rgba(10,6,10,.6)', 4);
      shape(ctx, 'M -64 -130 C -80 -60 -84 0 -74 50 C -40 76 40 76 72 50 C 84 0 78 -60 62 -130 Z', css(skin), '#0b0908', 4);
      for (const d of ['M -40 -70 C -36 -30 -38 10 -44 40', 'M -6 -76 C -4 -30 -6 10 -10 46', 'M 28 -72 C 30 -30 28 10 26 44']) stroke(ctx, d, css([skin[0] * .72, skin[1] * .66, skin[2] * .62]), 2.5);
      const fl = lerp(120, 62, ss(.8, 1, a));
      for (let i = 0; i < 4; i++) {
        const fx = -54 + i * 36, L = fl * [.86, 1, .96, .8][i];
        shape(ctx, `M ${fx - 16} 40 C ${fx - 18} ${40 + L * .6} ${fx - 13} ${40 + L} ${fx} ${44 + L} C ${fx + 13} ${40 + L} ${fx + 18} ${40 + L * .6} ${fx + 16} 40 Z`, css(skin), '#0b0908', 3.5);
        stroke(ctx, `M ${fx - 10} ${40 + L * .5} L ${fx + 10} ${40 + L * .5}`, css([skin[0] * .7, skin[1] * .64, skin[2] * .6]), 2);
        if (cl > 0) { ctx.fillStyle = '#141010'; ctx.beginPath(); ctx.moveTo(fx - 9, 40 + L); ctx.lineTo(fx, 44 + L + 34 * cl); ctx.lineTo(fx + 9, 40 + L); ctx.closePath(); ctx.fill(); }
      }
      shape(ctx, 'M -70 -40 C -110 -20 -130 20 -124 60 C -112 76 -94 72 -88 56 C -86 30 -76 10 -62 0 Z', css(skin), '#0b0908', 3.5);
    });
    // 灯光
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = rg(ctx, 700, 900, 150, 1150, [[0, '#ffffff'], [.5, '#8a5a34'], [1, '#120a06']]); ctx.fillRect(-900, -900, 3000, 3800); ctx.restore();
    glow(ctx, 760, 860, 700, [255, 150, 62], .3 * flicker(t, 3));
  });
}

// ---------- S25 撞破屋顶 ----------
export function roof(ctx, s) {
  const { t, dur } = s, b0 = s.m('crash', .45), tb = t - b0, u = t / dur;
  const sh = tb > 0 ? Math.exp(-tb * 2.2) : ss(b0 - .5, b0, t) * .25;
  camera(ctx, { cx: 540 + n1(t * 46, 1) * sh * 26, cy: 900 + n1(t * 46, 4) * sh * 26, z: 1.08 + sh * .03, r: n1(t * 30, 9) * sh * .02 }, () => {
    // 天井：椽与梁
    ctx.fillStyle = '#150e0a'; ctx.fillRect(-300, -300, 1700, 2600);
    for (let x = -260; x < 1400; x += 120) { ctx.fillStyle = '#0c0806'; ctx.fillRect(x, -300, 34, 2600); ctx.fillStyle = 'rgba(255,170,90,.05)'; ctx.fillRect(x, -300, 5, 2600); }
    ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 3; for (let y = -200; y < 2300; y += 64) { ctx.beginPath(); ctx.moveTo(-300, y); ctx.lineTo(1400, y + 14); ctx.stroke(); }
    ctx.fillStyle = '#090605'; ctx.fillRect(-300, 1280, 1700, 90); ctx.fillRect(-300, 260, 1700, 70);
    glow(ctx, 900, 2000, 1300, [255, 150, 62], tb > 0 ? .3 * Math.exp(-tb * 4) : .3 * flicker(t * 2, 3));
    if (tb <= 0) { // 黑影扑向屋顶
      const a = ein(clamp(t / b0)); ctx.save(); ctx.globalAlpha = .75; at(ctx, 560, lerp(1900, 820, a), lerp(2.2, .9, a), -.2, () => oniFlight(ctx, { t, arm: false, col: '#030203' })); ctx.restore();
    } else {
      // 破洞
      const R = 360 * eout(clamp(tb / .22)), r = rng(71), pts = [];
      for (let i = 0; i < 26; i++) { const a = i / 26 * TAU, rr = R * (.72 + r() * .5); pts.push([560 + Math.cos(a) * rr * 1.05, 800 + Math.sin(a) * rr]); }
      ctx.save(); ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.clip();
      sky(ctx, t, { mx: 700, my: 690, mr: 120, horizon: 2400, bands: false });
      const fa = eout(clamp(tb / 2.2)), sc = lerp(.95, .06, fa);
      ctx.globalAlpha = 1 - ss(.85, 1, fa);
      at(ctx, lerp(520, 660, fa), lerp(860, 640, fa), sc, -.5, () => { oniFlight(ctx, { t: t * 2, arm: false, col: '#030305' }); at(ctx, -150, 250, .6, 2.2, () => { ctx.save(); ctx.filter = 'brightness(0)'; drawArm(ctx, { wrap: 0 }); ctx.restore(); }); });
      ctx.restore();
      ctx.strokeStyle = '#060403'; ctx.lineWidth = 10; ctx.lineJoin = 'miter'; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.stroke();
      // 断椽
      for (let i = 0; i < 10; i++) { const a = r() * TAU, rr = R * (.8 + r() * .3), l = 60 + r() * 150; ctx.save(); ctx.translate(560 + Math.cos(a) * rr, 800 + Math.sin(a) * rr); ctx.rotate(a + Math.PI + (r() - .5)); ctx.fillStyle = '#0a0705'; ctx.fillRect(0, -12, l, 24); ctx.fillStyle = 'rgba(150,170,210,.25)'; ctx.fillRect(0, -12, l, 4); ctx.restore(); }
      // 月光射入
      glow(ctx, 560, 800, R * 2.6, [150, 175, 225], .35 * clamp(tb * 2));
      // 飞散的木片
      for (let i = 0; i < 70; i++) {
        const a = r() * TAU, v = 300 + r() * 900, w = 14 + r() * 70, h = 5 + r() * 16, spin = (r() - .5) * 14, life = tb;
        const x = 560 + Math.cos(a) * (R * .6 + v * (1 - Math.exp(-life * 2.4)) * .5), y = 800 + Math.sin(a) * (R * .6 + v * (1 - Math.exp(-life * 2.4)) * .4) + 900 * life * life * (.4 + r() * .6);
        const sc = 1 + life * (.3 + r());
        ctx.save(); ctx.translate(x, y); ctx.rotate(a + spin * life); ctx.scale(sc, sc);
        const wc = 34 + r() * 44; ctx.fillStyle = css([wc, wc * .74, wc * .52]); ctx.fillRect(-w / 2, -h / 2, w, h); ctx.fillStyle = 'rgba(150,170,215,.22)'; ctx.fillRect(-w / 2, -h / 2, w, 3); ctx.strokeStyle = '#050302'; ctx.lineWidth = 2; ctx.strokeRect(-w / 2, -h / 2, w, h); ctx.restore();
      }
      // 尘
      for (let i = 0; i < 12; i++) { const a = r() * TAU, d = R * (.7 + r() * .6) + tb * 120, px = 560 + Math.cos(a) * d, py = 800 + Math.sin(a) * d + tb * 160, pr = 150 + tb * 190 + r() * 90; ctx.fillStyle = rg(ctx, px, py, 0, pr, [[0, `rgba(150,140,130,${.2 * Math.exp(-tb * 1.2)})`], [1, 'rgba(150,140,130,0)']]); ctx.fillRect(px - pr, py - pr, pr * 2, pr * 2); }
      if (tb < .16) { ctx.fillStyle = `rgba(240,236,220,${1 - tb / .16})`; ctx.fillRect(-300, -300, 1700, 2600); }
    }
  });
  darkness(ctx, 540, 860, 520, 1400, .8);
}

// ---------- S27 渡边纲站在原地 ----------
export function stand(ctx, s) {
  const { t, dur } = s, u = t / dur;
  camera(ctx, { cx: lerp(560, 540, u), cy: lerp(1010, 960, io(u)), z: lerp(1.0, .92, io(u)) }, () => {
    room(ctx, t, { lamp: 0, moon: .5 });
    // 翻倒的行灯、箱盖、断绳、木屑
    at(ctx, 250, 1560, 1, -.12, () => drawLidFallen(ctx, .8));
    rope(ctx, [[560, 1420], [650, 1450], [760, 1440], [830, 1470], [940, 1450]], 15, { k: .7 });
    const r = rng(33); for (let i = 0; i < 60; i++) { const x = 100 + r() * 880, y = 1080 + r() * 620, l = 10 + r() * 50, a = r() * TAU; ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = css([70 + r() * 50, 48 + r() * 30, 30]); ctx.fillRect(-l / 2, -3, l, 6 + r() * 6); ctx.restore(); }
    at(ctx, OX, OY, 1, 0, () => drawBox(ctx, { lid: false, rope: 0, seal: 0, k: .9, inner: .5 }));
    at(ctx, 850, 1660, .52, 0, () => tsunaStand(ctx, { k: .95, tilt: .26, look: -1, wide: .4 }));
    // 冷色月光柱
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = rg(ctx, 560, 1100, 150, 1250, [[0, '#ffffff'], [.4, '#566078'], [1, '#090a10']]); ctx.fillRect(-600, -900, 2400, 3400); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    for (let i = 0; i < 7; i++) { const e = i * 26; ctx.fillStyle = lg(ctx, 0, -300, 0, 1350, [[0, 'rgba(170,195,240,.085)'], [.8, 'rgba(150,175,225,.03)'], [1, 'rgba(150,175,225,0)']]); ctx.beginPath(); ctx.moveTo(360 + e, -400); ctx.lineTo(660 - e, -400); ctx.lineTo(930 - e * 1.6, 1420); ctx.lineTo(190 + e * 1.6, 1420); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    glow(ctx, 560, 1150, 520, [160, 185, 235], .32);
  });
  motes(ctx, t, { n: 90, seed: 8, x0: 240, x1: 860, y0: 0, y1: 1500, color: [210, 222, 245], a: .55, size: 2.4, fall: 26, drift: 18 });
  // 仍在飘落的木屑
  const r = rng(5); for (let i = 0; i < 12; i++) { const x = 300 + r() * 480, sp = 240 + r() * 300, ph = r() * 2000, y = ((ph + sp * t) % 2000) - 100, a = r() * 6 + t * (2 + r() * 3); ctx.save(); ctx.translate(x + Math.sin(t * 2 + i) * 30, y); ctx.rotate(a); ctx.fillStyle = 'rgba(120,96,70,.9)'; ctx.fillRect(-10, -3, 20 + r() * 16, 6); ctx.restore(); }
}

// ---------- 片尾落版：京都怪谈 · 第一夜 ----------
export function endcard(ctx, s) {
  const { t, dur, TL } = s, a = ss(.5, 1.8, t);
  ctx.fillStyle = '#060507'; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = a * .9;
  ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#080b16'], [.6, '#101728'], [1, '#07080e']]); ctx.fillRect(0, 0, W, H);
  glow(ctx, 540, 620, 560, [150, 170, 210], .22);
  for (const [x, y, w, h] of [[-100, 520, 700, 34], [480, 700, 700, 28], [100, 1380, 800, 30]]) { ctx.fillStyle = 'rgba(52,66,98,.4)'; ctx.beginPath(); ctx.roundRect(x + t * 4, y, w, h, h / 2); ctx.fill(); }
  ctx.restore();
  const night = TL.meta?.night || '第一夜', series = TL.meta?.series || '京都怪谈';
  vtext(ctx, series, 600, 420, 150, { color: '#efe6cd', weight: 900, alpha: a, reveal: ss(.5, 2.0, t) * 1.3, gap: 1.14 });
  const a2 = ss(1.6, 2.5, t);
  ctx.fillStyle = `rgba(170,40,30,${a2})`; ctx.beginPath(); ctx.arc(600, 1140, 9, 0, TAU); ctx.fill();
  vtext(ctx, night, 600, 1190, 96, { color: '#cfc4a6', weight: 700, alpha: a2, gap: 1.16 });
  // 朱印
  ctx.save(); ctx.globalAlpha = a2 * .95; ctx.translate(400, 1400); ctx.rotate(-.04);
  ctx.fillStyle = '#9c2a20'; ctx.beginPath(); ctx.roundRect(-56, -100, 112, 200, 8); ctx.fill();
  ctx.strokeStyle = 'rgba(240,220,190,.6)'; ctx.lineWidth = 3; ctx.strokeRect(-46, -90, 92, 180);
  ctx.restore();
  vtext(ctx, '戻桥', 400, 1312, 76, { color: '#f2e6cc', weight: 900, alpha: a2, gap: 1.14 });
  htext(ctx, '京都民间传说改编', W / 2, 1700, 28, { color: '#b8ad92', weight: 400, font: SERIF, alpha: a2 * .7, spacing: 10 });
}

// ---------- 封面 ----------
export function cover(ctx, s) {
  const t = 2;
  camera(ctx, { cx: 560, cy: 930, z: 1.1 }, () => door(ctx, t, { moon: .62, lamp: .8, sh: { size: 1.42, soft: 1.8, a: .82, x: 560 } }));
  darkness(ctx, 540, 900, 420, 1250, .88);
  ctx.fillStyle = lg(ctx, 0, 0, 0, 760, [[0, 'rgba(0,0,0,.82)'], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(0, 0, W, 760);
  ctx.fillStyle = lg(ctx, 0, 1250, 0, H, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.9)']]); ctx.fillRect(0, 1250, W, 700);
  htext(ctx, '京都怪谈', W / 2 - 50, 250, 170, { color: '#f1e8d0', weight: 900, font: SERIF, shadow: 'rgba(0,0,0,.9)' });
  ctx.fillStyle = '#a32c22'; ctx.beginPath(); ctx.arc(954, 250, 62, 0, TAU); ctx.fill();
  htext(ctx, '一', 954, 246, 78, { color: '#f4e8cc', weight: 900, font: SERIF });
  ctx.fillStyle = '#a32c22'; ctx.fillRect(160, 368, 760, 6);
  htext(ctx, '一条戻桥', W / 2, 436, 56, { color: '#d8ccb0', weight: 700, font: SERIF, spacing: 26 });
  htext(ctx, '第六夜，', W / 2, 1500, 128, { color: '#ffffff', weight: 900, font: SERIF, shadow: 'rgba(0,0,0,1)', strokeC: 'rgba(0,0,0,.6)', strokeW: 10 });
  htext(ctx, '谁来敲门？', W / 2, 1668, 150, { color: '#f0c070', weight: 900, font: SERIF, shadow: 'rgba(0,0,0,1)', strokeC: 'rgba(0,0,0,.6)', strokeW: 10 });
}
