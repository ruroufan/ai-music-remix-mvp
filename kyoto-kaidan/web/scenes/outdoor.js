// 户外场景：一条戻桥之夜
import { W, H, mk, clamp, lerp, ss, io, eout, ein, rng, TAU, n1, camera, at, poly, lg, rg, css, glow, darkness, wash, fog, motes, vtext, htext, P, stroke, shape, map, SERIF, vnoise } from '../lib.js';
import { PAL, tsunaBust, womanBust, tachi, horse } from '../art/chars.js';
import { riders, womanStand, tsunaStand, oniFlight, tsunaFall } from '../art/figures.js';
import { drawArm } from '../art/props.js';

const FIG = .46;
const deckY = x => 1215 - 70 * (1 - Math.pow((x - 540) / 560, 2));
const NIGHT = 'rgba(14,24,54,.46)';
const pool = [mk(W, H), mk(W, H)]; let depth = 0;
// 离屏图层：画完后可整体染夜色
export function layer(ctx, fn, { tint = null, alpha = 1, mode = 'source-over' } = {}) {
  const c = pool[depth++], g = c.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H);
  g.setTransform(ctx.getTransform()); g.save(); fn(g); g.restore();
  if (tint) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-atop'; g.fillStyle = tint; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over'; }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = alpha; ctx.globalCompositeOperation = mode; ctx.drawImage(c, 0, 0); ctx.restore(); depth--;
}

// ---------- 夜空 ----------
export function sky(ctx, t, { mx = 770, my = 430, mr = 150, glowA = 1, stars = true, top = '#070b18', mid = '#14203a', low = '#2b3854', horizon = 1100, bands = true } = {}) {
  ctx.fillStyle = lg(ctx, 0, -600, 0, horizon + 200, [[0, top], [.55, mid], [1, low]]); ctx.fillRect(-1200, -1200, 3600, horizon + 1600);
  if (stars) { const r = rng(2); for (let i = 0; i < 90; i++) { const x = -300 + r() * 1700, y = -300 + r() * 1200, a = .15 + r() * .5; ctx.fillStyle = `rgba(220,225,240,${a * (.6 + .4 * Math.sin(t * (1 + r() * 2) + i))})`; ctx.fillRect(x, y, 2 + r() * 1.5, 2 + r() * 1.5); } }
  glow(ctx, mx, my, mr * 4.2, [150, 170, 210], .42 * glowA); glow(ctx, mx, my, mr * 1.9, [226, 222, 200], .5 * glowA);
  ctx.fillStyle = rg(ctx, mx - mr * .2, my - mr * .2, mr * .1, mr, [[0, '#f4eeda'], [.8, '#e2dabc'], [1, '#cfc6a6']]); ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.clip(); ctx.fillStyle = 'rgba(150,140,110,.22)'; for (const [x, y, r] of [[-.3, -.2, .28], [.25, .1, .2], [-.1, .4, .24], [.4, -.35, .12]]) { ctx.beginPath(); ctx.arc(mx + x * mr, my + y * mr, r * mr, 0, TAU); ctx.fill(); } ctx.restore();
  // “すやり霞”：绘卷式横向云带
  if (bands) for (const [x, y, w, h, sp, a] of [[-200, my + mr * .45, 900, 38, 5, .55], [420, my - mr * .7, 900, 30, -4, .4], [-300, 760, 760, 44, 3, .4], [520, 900, 900, 50, -3, .46], [-100, 250, 600, 30, 4, .3]]) {
    const xx = x + sp * t; ctx.fillStyle = `rgba(52,66,98,${a})`;
    ctx.beginPath(); ctx.roundRect(xx, y, w, h, h / 2); ctx.fill(); ctx.beginPath(); ctx.roundRect(xx + w * .2, y + h * .8, w * .7, h * .7, h / 2); ctx.fill();
  }
}
function skyline(ctx) {
  // 东山与塔、屋顶
  ctx.fillStyle = '#101a2e'; ctx.fill(P('M -400 1130 C -200 1010 -40 1040 120 1070 C 260 1000 420 980 560 1050 C 700 1000 880 960 1060 1040 C 1200 1010 1340 1050 1500 1100 L 1500 1320 L -400 1320 Z'));
  ctx.fillStyle = '#0c1424';
  const px = 330, py = 1096; for (let i = 0; i < 5; i++) { const w = 74 - i * 9, y = py - i * 30; ctx.fill(P(`M ${px - w} ${y} L ${px + w} ${y} L ${px + w * .62} ${y - 12} L ${px - w * .62} ${y - 12} Z`)); ctx.fillRect(px - w * .42, y - 30, w * .84, 20); }
  ctx.fillRect(px - 2, py - 200, 4, 60);
  const r = rng(6); for (let x = -300; x < 1400; x += 60 + r() * 50) { const w = 50 + r() * 60, h = 20 + r() * 26, y = 1150 + r() * 20; ctx.fill(P(`M ${x - w * .6} ${y} L ${x + w * .6} ${y} L ${x + w * .36} ${y - h} L ${x - w * .36} ${y - h} Z`)); ctx.fillRect(x - w * .5, y, w, 60); }
}
// ---------- 柳 ----------
function willow(ctx, t, { x = 110, y = 1245, s = 1, k = 1, seed = 5, n = 46 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineCap = 'round';
  shape(ctx, 'M -26 0 C -20 -120 -50 -220 -20 -330 C 0 -410 50 -450 80 -520 L 104 -508 C 80 -440 40 -400 26 -320 C 6 -220 40 -120 30 0 Z', css([14 * k, 16 * k, 14 * k]), '#050605', 3);
  stroke(ctx, 'M 60 -470 C 120 -560 200 -590 300 -580 M 40 -420 C -40 -520 -120 -540 -200 -520 M 80 -510 C 100 -600 150 -660 220 -690', css([14 * k, 16 * k, 14 * k]), 9);
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const bx = -210 + r() * 520, by = -520 - Math.sin((bx + 210) / 520 * Math.PI) * 130 + r() * 40, L = 240 + r() * 330, ph = r() * 9;
    const sw = Math.sin(t * .9 + ph) * 16 + Math.sin(t * .37 + ph * 2) * 10;
    ctx.strokeStyle = css([(18 + r() * 26) * k, (30 + r() * 30) * k, (26 + r() * 16) * k], .9); ctx.lineWidth = 2 + r() * 2.4;
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + sw * .3 + 10, by + L * .5, bx + sw + 20, by + L); ctx.stroke();
  }
  ctx.restore();
}
// ---------- 桥 ----------
function rail(ctx, off, col, hi) {
  ctx.save(); ctx.lineCap = 'butt';
  const line = (dy, w) => { ctx.beginPath(); for (let x = -60; x <= 1140; x += 20) { const y = deckY(x) + dy + off; x === -60 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.lineWidth = w; ctx.stroke(); };
  ctx.strokeStyle = col; line(-60, 11); line(-30, 6);
  for (let i = 0, x = 10; x <= 1070; x += 76, i++) {
    const y = deckY(x) + off, main = i % 3 === 0;
    ctx.fillStyle = col; ctx.fillRect(x - (main ? 8 : 4), y - (main ? 84 : 62), main ? 16 : 8, main ? 84 : 62);
    if (main) { ctx.beginPath(); ctx.ellipse(x, y - 92, 11, 10, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(x - 6, y - 98); ctx.lineTo(x, y - 114); ctx.lineTo(x + 6, y - 98); ctx.fill(); ctx.fillRect(x - 11, y - 84, 22, 5); }
  }
  if (hi) { ctx.strokeStyle = hi; line(-65, 2); }
  ctx.restore();
}
export function bridge(ctx, t, between) {
  // 桥墩
  ctx.fillStyle = '#080808'; for (const x of [250, 540, 830]) { ctx.fillRect(x - 20, deckY(x), 12, 160); ctx.fillRect(x + 8, deckY(x), 12, 160); ctx.fillRect(x - 30, deckY(x) + 60, 60, 9); }
  rail(ctx, -14, '#0b0d13');
  if (between) between();
  ctx.beginPath(); for (let x = -60; x <= 1140; x += 20) ctx.lineTo(x, deckY(x)); for (let x = 1140; x >= -60; x -= 20) ctx.lineTo(x, deckY(x) + 26); ctx.closePath(); ctx.fillStyle = '#17110d'; ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 2; for (let x = -40; x < 1140; x += 26) { ctx.beginPath(); ctx.moveTo(x, deckY(x)); ctx.lineTo(x, deckY(x) + 26); ctx.stroke(); }
  rail(ctx, 6, '#100c0a', 'rgba(140,160,205,.35)');
}
function banks(ctx) {
  ctx.fillStyle = '#0a0c0c'; ctx.fill(P('M -500 1236 L 150 1236 C 220 1250 250 1280 262 1320 L 270 1400 L -500 1400 Z')); ctx.fill(P('M 1600 1236 L 930 1236 C 860 1250 830 1280 818 1320 L 810 1400 L 1600 1400 Z'));
}
export function water(ctx, t, { y0 = 1290, mx = 770, moonA = 1 } = {}) {
  ctx.fillStyle = lg(ctx, 0, y0, 0, y0 + 900, [[0, '#101a30'], [.4, '#0a1122'], [1, '#04060c']]); ctx.fillRect(-1200, y0, 3600, 1600);
  // 桥影
  ctx.save(); ctx.globalAlpha = .6; ctx.fillStyle = '#04060b';
  ctx.beginPath(); for (let x = -60; x <= 1140; x += 20) ctx.lineTo(x + Math.sin(t * 1.2 + x * .02) * 4, y0 + (y0 - deckY(x)) * .9 + 20); for (let x = 1140; x >= -60; x -= 20) ctx.lineTo(x, y0 - 4); ctx.closePath(); ctx.fill(); ctx.restore();
  // 月影
  const r = rng(12);
  for (let i = 0; i < 46; i++) {
    const y = y0 + 40 + i * 13, w = (36 + i * 4.4) * (.5 + .5 * vnoise(i * .7, t * .8, 3)), x = mx + Math.sin(t * 1.3 + i * .9) * (6 + i * .5);
    ctx.fillStyle = `rgba(226,220,190,${moonA * (.5 - i * .009) * (.5 + .5 * vnoise(i * 1.3, t * 1.4, 9))})`; ctx.beginPath(); ctx.ellipse(x, y, w, 2.6, 0, 0, TAU); ctx.fill();
  }
  // 细浪
  for (let i = 0; i < 120; i++) { const bx = -200 + r() * 1500, y = y0 + 20 + r() * 640, w = 20 + r() * 80, sp = 6 + r() * 16; const x = ((bx + sp * t) % 1500 + 1500) % 1500 - 200; ctx.fillStyle = `rgba(150,170,210,${(.05 + r() * .12) * (.5 + .5 * Math.sin(t * 2 + i))})`; ctx.fillRect(x, y, w, 1.6); }
}
function worldBG(ctx, t, o = {}) { sky(ctx, t, o); skyline(ctx); water(ctx, t, { mx: o.mx ?? 770 }); banks(ctx); }
const cart = (ctx, txt, x, y, a, size = 46) => { if (a <= 0) return; const n = [...txt].length, h = n * size * 1.12 + 30; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(120,28,22,.92)'; ctx.fillRect(x - size * .72, y, size * 1.44, h); ctx.strokeStyle = 'rgba(230,214,170,.7)'; ctx.lineWidth = 2; ctx.strokeRect(x - size * .72 + 5, y + 5, size * 1.44 - 10, h - 10); ctx.restore(); vtext(ctx, txt, x, y + 15, size, { color: '#f0e6cc', weight: 700, alpha: a }); };

// ---------- S04 桥的全景 + 片名 ----------
export function bridge_wide(ctx, s) {
  const { t, dur } = s, a4 = s.m('L04', 3), u = t / dur;
  const rx = lerp(1260, 800, clamp((t - a4 + .6) / (dur - a4 + .6)));
  camera(ctx, { cx: lerp(540, 520, u), cy: lerp(1000, 1060, io(u)), z: lerp(1.08, 1.26, io(u)) }, () => {
    worldBG(ctx, t);
    fog(ctx, t, { y: 1250, h: 160, n: 7, a: .1, seed: 4, color: [150, 170, 210] });
    bridge(ctx, t, () => layer(ctx, g => { at(g, rx, deckY(rx) + 2, FIG, 0, () => riders(g, { ph: rx * .05, k: .8 })); at(g, 215, 1240, .184, 0, () => { g.scale(-1, 1); womanStand(g, { k: .8, sway: Math.sin(t) }); }); }, { tint: NIGHT }));
    willow(ctx, t);
    fog(ctx, t, { y: 1330, h: 120, n: 5, a: .09, seed: 9, color: [170, 185, 215] });
  });
  // 片名
  const ta = Math.min(ss(.3, 1.4, t), 1 - ss(a4 + .9, a4 + 1.9, t));
  if (ta > 0) {
    ctx.save(); ctx.globalAlpha = ta * .5; ctx.fillStyle = lg(ctx, 0, 0, 0, 900, [[0, 'rgba(0,0,0,.8)'], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(0, 0, W, 900); ctx.restore();
    vtext(ctx, '一条戻桥', 300, 250, 150, { color: '#f1e8d0', weight: 900, alpha: ta, shadow: 'rgba(0,0,0,.9)', reveal: ss(.3, 2.0, t) * 1.2 });
    vtext(ctx, '京都怪谈', 476, 262, 54, { color: '#d8ccb0', weight: 700, alpha: ta * .95, gap: 1.3 });
    ctx.fillStyle = `rgba(170,40,30,${ta})`; ctx.fillRect(436, 262, 4, 54 * 1.3 * 4 - 14);
  }
  cart(ctx, '六天前', 930, 250, Math.min(ss(a4 - .2, a4 + .5, t), 1 - ss(dur - .5, dur, t)));
}

// ---------- S05 桥头女子 ----------
export function meet(ctx, s) {
  const { t, dur } = s, u = t / dur;
  const rx = lerp(800, 640, eout(clamp(t / 2.6))), walk = 1 - ss(1.8, 2.6, t);
  camera(ctx, { cx: lerp(430, 400, u), cy: lerp(1090, 1075, u), z: lerp(1.62, 1.82, io(u)) }, () => {
    worldBG(ctx, t);
    fog(ctx, t, { y: 1250, h: 160, n: 7, a: .1, seed: 4, color: [150, 170, 210] });
    bridge(ctx, t, () => layer(ctx, g => { at(g, rx, deckY(rx) + 2, FIG, 0, () => riders(g, { ph: rx * .05, k: .85, walk, look: .5 })); }, { tint: NIGHT }));
    layer(ctx, g => at(g, 215, 1244, .184, 0, () => { g.scale(-1, 1); womanStand(g, { k: .95, sway: Math.sin(t * .8) }); }), { tint: 'rgba(14,24,54,.3)' });
    willow(ctx, t);
    fog(ctx, t, { y: 1320, h: 110, n: 5, a: .1, seed: 9, color: [170, 185, 215] });
  });
}

// ---------- 女子特写：ask=桥头开口（朝右）；ride=马背上安静坐着（朝左）----------
export function woman_close(ctx, s) {
  const { t, dur, p } = s, u = t / dur, ask = p.mode === 'ask';
  const l0 = s.m(p.line || 'L06', 0), l1 = s.m((p.line || 'L06') + '.end', dur);
  const talking = ask && t > l0 && t < l1, lip = talking ? Math.abs(Math.sin(t * 9)) * (.5 + .5 * Math.sin(t * 3.1)) * 4 : 0;
  const bob = ask ? 0 : Math.sin(t * 3.4) * 7;
  sky(ctx, t, { mx: ask ? 250 : 830, my: 380, mr: 190, bands: true, horizon: 2200 });
  if (ask) camera(ctx, { cx: 540, cy: 960, z: 1 }, () => willow(ctx, t, { x: 880, y: 1700, s: 2.4, seed: 8, n: 30, k: .8 }));
  else { ctx.fillStyle = '#0c0e14'; for (let i = 0; i < 4; i++) { const x = ((i * 420 + t * 46) % 1680) - 300; ctx.fillRect(x - 20, 1560, 40, 400); ctx.beginPath(); ctx.ellipse(x, 1540, 28, 26, 0, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(x - 14, 1522); ctx.lineTo(x, 1480); ctx.lineTo(x + 14, 1522); ctx.fill(); } ctx.fillRect(-10, 1640, 1100, 30); }
  fog(ctx, t, { y: 1300, h: 500, n: 6, a: .08, seed: 14, color: [150, 170, 210] });
  const z = lerp(1.0, 1.1, io(u));
  layer(ctx, g => at(g, ask ? 500 : 590, 760 + bob, 1.32 * z, 0, () => { if (ask) g.scale(-1, 1); womanBust(g, { k: 1, eyeClose: ask ? lerp(.75, .3, ss(.2, 1.2, t)) : .8, lip, sway: Math.sin(t * .8), tilt: ask ? -.05 : .03 }); }), { tint: 'rgba(16,26,60,.26)' });
  // 月光轮廓
  glow(ctx, ask ? 250 : 830, 380, 800, [140, 160, 210], .16);
  darkness(ctx, 540, 820, 500, 1300, .82);
}

// ---------- S06 载着女子上桥 ----------
export function ride(ctx, s) {
  const { t, dur } = s, u = t / dur;
  const rx = lerp(700, 470, u);
  camera(ctx, { cx: rx - 30, cy: lerp(1060, 1045, u), z: lerp(1.9, 2.05, u) }, () => {
    worldBG(ctx, t);
    fog(ctx, t, { y: 1250, h: 160, n: 7, a: .1, seed: 4, color: [150, 170, 210] });
    bridge(ctx, t, () => layer(ctx, g => at(g, rx, deckY(rx) + 2, FIG, 0, () => riders(g, { ph: rx * .05, k: .92, woman: true })), { tint: 'rgba(14,24,54,.34)' }));
    fog(ctx, t, { y: 1330, h: 120, n: 5, a: .1, seed: 9, color: [170, 185, 215] });
  });
  darkness(ctx, 540, 900, 600, 1400, .7);
}

// ---------- 纲的特写：down 低头看河面 / grab 被掐住脖子 / up 屋内抬头 ----------
export function tsuna_close(ctx, s) {
  const { t, dur, p } = s, u = t / dur, mode = p.mode || 'down';
  let o = { k: 1 }, y = 800, x = 560, z = 1.25, shake = 0;
  if (mode === 'up') {
    ctx.fillStyle = lg(ctx, 0, 0, 0, H, [[0, '#0b0706'], [1, '#22150d']]); ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#100a08'; ctx.fillRect(120, 0, 60, H); ctx.fillRect(0, 430, W, 46);
    glow(ctx, 1000, 1300, 900, [255, 150, 62], .4);
    const a = ss(.25, 1.1, t); o = { k: .95, tilt: lerp(-.16, .2, a), look: lerp(1, -1, a), wide: ss(.9, 1.6, t), sweat: ss(1.2, 2, t) };
    z = lerp(1.2, 1.42, io(u)); x = 600; y = 860;
  } else {
    sky(ctx, t, { mx: 220, my: 330, mr: 170, horizon: 2200 });
    fog(ctx, t, { y: 1400, h: 500, n: 6, a: .08, seed: 14, color: [150, 170, 210] });
    if (mode === 'down') { const a = ss(.2, 1.3, t); o = { k: 1, tilt: lerp(0, -.2, a), look: a, wide: ss(dur - 1, dur - .3, t) * .5 }; z = lerp(1.2, 1.34, io(u)); }
    else { const g0 = dur * .34; const a = ss(g0 - .05, g0 + .1, t); shake = Math.exp(-Math.max(0, t - g0) * 5) * (t > g0 ? 1 : 0); o = { k: 1, tilt: lerp(-.1, .16, a), look: lerp(.8, -.6, a), wide: a, sweat: a }; y = 820 - ein(clamp((t - (dur - .42)) / .42)) * 1700; z = 1.3; }
  }
  layer(ctx, g => {
    at(g, x + n1(t * 40, 2) * shake * 14, y + n1(t * 40, 5) * shake * 14, z, 0, () => {
      tsunaBust(g, o);
      if (mode === 'grab') {
        const g0 = dur * .34, a = eout(clamp((t - g0 + .22) / .22));
        if (a > 0) at(g, lerp(900, 250, a), lerp(-100, 130, a), 1.05, lerp(-.5, -.12, a), () => {
          // 被衣袖口 + 鬼的右手
          shape(g, 'M 150 -90 C 300 -130 520 -120 760 -60 L 760 200 C 520 160 300 130 160 96 C 140 30 140 -30 150 -90 Z', css(PAL.veil), '#0b0908', 4);
          stroke(g, 'M 260 -90 C 280 -10 276 60 262 110 M 420 -100 C 440 0 436 80 424 130', css(PAL.veilD), 3);
          drawArm(g, { wrap: 0, curl: a });
        });
      }
    });
  }, { tint: mode === 'up' ? 'rgba(40,14,0,.22)' : 'rgba(16,26,60,.3)' });
  if (mode === 'up') glow(ctx, 1000, 1300, 700, [255, 160, 80], .22);
  darkness(ctx, 500, 800, 480, 1350, .85);
}

// ---------- S08 河面倒影：水里的那张脸，却长着角 ----------
const refl = mk(W, H);
export function reflection(ctx, s) {
  const { t, dur } = s, c1 = s.m('L10.c1', 1.6), u = t / dur;
  const g = refl.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#060a14'], [.5, '#0e1830'], [1, '#16264a']]); g.fillRect(0, 0, W, H);
  // 月亮的倒影（下方）
  g.fillStyle = rg(g, 250, 1560, 0, 420, [[0, 'rgba(226,222,196,.55)'], [.25, 'rgba(180,190,210,.22)'], [1, 'rgba(0,0,0,0)']]); g.fillRect(0, 1100, 700, 820);
  g.fillStyle = 'rgba(232,226,200,.8)'; g.beginPath(); g.arc(250, 1560, 96, 0, TAU); g.fill();
  const S = 1.9, ox = 330, oy = 150, rev = ss(c1 - .5, c1 + .5, t);
  layer(g, gg => {
    gg.save(); gg.translate(ox, oy); gg.scale(S, -S);
    riders(gg, { ph: 1 + t * .5, walk: .25, k: .95, woman: true, o: 1, look: 1, tilt: -.2 });
    gg.restore();
    // 桥身与栏杆的倒影（上方）
    gg.fillStyle = '#05070b'; gg.fillRect(0, 0, W, oy + 6);
    for (let i = 0; i < 9; i++) { const x = ((i * 180 - t * 16) % 1440 + 1440) % 1440 - 180; gg.fillRect(x - 12, 0, 24, oy + 6); }
  }, { tint: 'rgba(10,22,52,.42)' });
  // 条带扭曲（水波），在“却长着角”处渐静
  const amp = lerp(30, 6, rev), z = lerp(1.0, 1.36, io(u)), hx = ox + 104 * S, hy = oy + 626 * S;
  camera(ctx, { cx: lerp(540, hx - 30, io(u)), cy: lerp(1000, hy - 110, io(u)), z }, () => {
    const st = 5;
    for (let y = 0; y < H; y += st) {
      const d = Math.sin(y * .045 + t * 2.6) * amp * (.3 + y / H) + Math.sin(y * .0125 - t * 1.3) * amp * .9 + Math.sin(y * .21 + t * 5) * amp * .12;
      ctx.drawImage(refl, 0, y, W, st, d, y, W, st + .6);
    }
    // 水面高光
    const r = rng(31);
    for (let i = 0; i < 90; i++) { const bx = r() * 1300 - 100, y = r() * H, w = 30 + r() * 120; const x = ((bx + (8 + r() * 14) * t) % 1300) - 100; ctx.fillStyle = `rgba(170,190,230,${(.04 + r() * .1) * (.5 + .5 * Math.sin(t * 2.4 + i))})`; ctx.fillRect(x, y, w, 2); }
    // 鬼眼在水中发亮
    const ex = hx - 50 * .4 * S + Math.sin(hy * .045 + t * 2.6) * amp * .8, ey = hy + 26 * .4 * S;
    glow(ctx, ex, ey, 90 * rev, [255, 200, 60], .55 * rev); glow(ctx, ex, ey, 22, [255, 240, 170], rev);
  });
  darkness(ctx, 540, 1000, 420, 1300, .88);
}

// ---------- S09 手移向刀柄 ----------
export function hilt(ctx, s) {
  const { t, dur } = s, u = t / dur, a = io(clamp((t - .15) / (dur * .6)));
  // 衣料背景
  ctx.fillStyle = lg(ctx, 0, 0, W, H, [[0, '#1b2740'], [.6, '#131c30'], [1, '#0a0f1c']]); ctx.fillRect(0, 0, W, H);
  for (const d of ['M 200 0 C 260 500 180 1200 300 1920', 'M 620 0 C 700 600 640 1300 760 1920', 'M 900 0 C 960 500 940 1200 1010 1920', 'M -40 300 C 120 700 60 1300 120 1920']) stroke(ctx, d, 'rgba(4,6,14,.7)', 7);
  shape(ctx, 'M -100 1500 C 300 1380 800 1400 1200 1560 L 1200 2000 L -100 2000 Z', '#0d0b0d', '#050405', 5);
  stroke(ctx, 'M -100 1516 C 300 1396 800 1416 1200 1576', css(PAL.gold, .6), 5);
  camera(ctx, { cx: 540, cy: 960, z: lerp(1.0, 1.1, u) }, () => {
    layer(ctx, g => {
      at(g, 650, 1000, 2.5, .34, () => tachi(g, { draw: ss(dur - .5, dur + .2, t) * .06 }));
      // 手：从左上伸来握住刀柄
      const hx = lerp(40, 420, a), hy = lerp(380, 880, a), cl = ss(.75, 1, a);
      at(g, hx, hy, 1, .34, () => {
        shape(g, 'M -700 -330 C -420 -280 -200 -200 -60 -110 L -110 110 C -260 60 -460 30 -700 40 Z', css(PAL.tsunaRobe), '#0b0908', 5);
        shape(g, 'M -150 -120 C -80 -130 0 -110 60 -70 C 90 -40 96 20 80 70 C 40 110 -60 120 -130 96 C -160 30 -170 -60 -150 -120 Z', css(PAL.skin), '#0b0908', 4);
        for (let i = 0; i < 4; i++) { const fx = -60 + i * 44, fl = lerp(120, 70, cl); shape(g, `M ${fx - 19} 60 C ${fx - 21} ${60 + fl * .6} ${fx - 16} ${60 + fl} ${fx} ${64 + fl} C ${fx + 16} ${60 + fl} ${fx + 21} ${60 + fl * .6} ${fx + 19} 60 Z`, css([PAL.skin[0] * (1 - cl * .12), PAL.skin[1] * (1 - cl * .14), PAL.skin[2] * (1 - cl * .14)]), '#0b0908', 3.5); stroke(g, `M ${fx - 12} ${60 + fl * .5} L ${fx + 12} ${60 + fl * .5}`, css(PAL.skinSh), 2); }
        shape(g, 'M 60 -60 C 110 -50 150 -10 160 40 C 150 60 120 60 104 40 C 96 10 80 -10 56 -20 Z', css(PAL.skin), '#0b0908', 3.5);
      });
    }, { tint: 'rgba(16,26,60,.3)' });
  });
  darkness(ctx, 560, 980, 380, 1200, .9);
}

// ---------- S10 被拽向半空 ----------
export function lift(ctx, s) {
  const { t, dur } = s, u = t / dur, a = eout(clamp(t / (dur * .9)));
  const sx = n1(t * 30, 3) * 8, sy = n1(t * 30, 7) * 8;
  camera(ctx, { cx: 540 + sx, cy: 960 + sy, z: 1.06 }, () => {
    sky(ctx, t, { mx: 560, my: 780, mr: 400, bands: false, top: '#05070f', mid: '#0d1528', low: '#1a2540', horizon: 2400 });
    // 云带向下掠过
    for (let i = 0; i < 6; i++) { const y = ((i * 380 + t * 620) % 2300) - 200; ctx.fillStyle = `rgba(40,52,82,${.5})`; ctx.beginPath(); ctx.roundRect(-200 + (i % 2) * 500, y, 900, 46, 23); ctx.fill(); }
    // 桥与马落在下方
    const by = lerp(1500, 2500, a);
    ctx.fillStyle = '#04050a'; ctx.fillRect(-100, by, 1300, 600);
    at(ctx, 700, by + 6, .7, 0, () => riders(ctx, { sil: true, rider: false, ph: 2, walk: 1.4 }));
    const oy = lerp(1650, 640, a), oxx = 640 + Math.sin(t * 2) * 20;
    at(ctx, oxx, oy, 1.05, -.12, () => { oniFlight(ctx, { t, col: '#040406' }); at(ctx, -198, 372, .9, 0, () => tsunaFall(ctx, { t })); });
  });
  darkness(ctx, 540, 860, 600, 1400, .7);
}

// ---------- S11 拔刀一挥（纸底墨影）----------
export function slash(ctx, s) {
  const { t, dur } = s;
  if (t < .1) { ctx.fillStyle = '#030305'; ctx.fillRect(0, 0, W, H); const a = t / .1; ctx.strokeStyle = '#fff'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(1000, 1500); ctx.lineTo(lerp(1000, 120, a), lerp(1500, 380, a)); ctx.stroke(); return; }
  const tt = t - .1, slow = 1 - Math.exp(-tt * 2.6), INKC = '#0b0908';
  ctx.fillStyle = '#d8caa6'; ctx.fillRect(0, 0, W, H); wash(ctx, 5, .5, 'multiply');
  camera(ctx, { cx: 540, cy: 960, z: lerp(1.14, 1.0, eout(tt / dur)), r: -.02 }, () => {
    // 刀光：一笔飞白的墨弧，自右下扫向左上
    const r = rng(52); ctx.save(); ctx.lineCap = 'butt';
    const cx = 760, cy = 1560, R = 900, a0 = 3.38, a1 = 4.9, grow = clamp(tt / .12);
    for (let i = 0; i < 90; i++) {
      const u = i / 90, a = lerp(a1, a0, u); if (u > grow) break;
      const w = 90 * Math.pow(Math.sin(Math.min(1, u * 1.15) * Math.PI), .7) + 4;
      for (let k = 0; k < 7; k++) { const off = (k / 6 - .5) * w, dry = u > .55 && r() < (u - .5) * 1.1; if (dry) continue; ctx.strokeStyle = `rgba(11,9,8,${.82 + r() * .18})`; ctx.lineWidth = w / 6 + 1.5; ctx.beginPath(); ctx.arc(cx, cy, R + off, a - .02, a + .012, false); ctx.stroke(); }
    }
    ctx.restore();
    // 鬼向右上退开
    at(ctx, 770 + slow * 70, 470 - slow * 60, .9, -.28 - slow * .08, () => oniFlight(ctx, { t: tt * .4, arm: false, col: INKC }));
    // 断臂旋转着飞出
    at(ctx, 520 - slow * 40, 760 + slow * 130, .7, 2.2 + slow * 1.1, () => { ctx.save(); ctx.filter = 'brightness(0)'; drawArm(ctx, { wrap: 0 }); ctx.restore(); });
    // 纲：自左下挥刀向上
    at(ctx, 300 - slow * 20, 1150 + slow * 40, 1.0, -.16, () => tsunaFall(ctx, { t: tt * .3, sword: 1, col: INKC }));
    // 朱：自断口沿刀势向左上泼出
    const ox = 640, oy = 640;
    ctx.fillStyle = 'rgba(158,30,22,.94)';
    ctx.beginPath(); ctx.ellipse(ox, oy, 46 + slow * 40, 26 + slow * 18, -.7, 0, TAU); ctx.fill();
    for (let i = 0; i < 46; i++) {
      const a = -2.5 + (r() - .5) * 1.5, d = (40 + Math.pow(r(), 1.6) * 620) * (.25 + .75 * slow), sz = (2 + Math.pow(r(), 2.2) * 26);
      const x = ox + Math.cos(a) * d, y = oy + Math.sin(a) * d + slow * slow * 70 * r();
      ctx.fillStyle = `rgba(${150 + r() * 24},${24 + r() * 14},18,${.85 + r() * .15})`;
      ctx.beginPath(); ctx.ellipse(x, y, sz * (1.4 + r() * 1.6), sz * .55, a, 0, TAU); ctx.fill();
      if (r() < .3) { ctx.beginPath(); ctx.ellipse(x - Math.cos(a) * sz * 2.4, y - Math.sin(a) * sz * 2.4, sz * 1.6, sz * .22, a, 0, TAU); ctx.fill(); }
    }
  });
}

// ---------- S12 断臂落在桥板上（近景）----------
export function arm_fall(ctx, s) {
  const { t, dur } = s, hit = s.m('armHit', 1.0), u = t / dur, d = t - hit;
  const f = clamp(t / hit), jolt = d > 0 ? Math.exp(-d * 8) : 0;
  camera(ctx, { cx: 540 + n1(t * 40, 3) * jolt * 8, cy: 1000 + jolt * 12, z: lerp(1.0, 1.12, io(u)), r: .03 }, () => {
    // 桥板：横向木板，月色冷光
    ctx.fillStyle = '#141820'; ctx.fillRect(-300, -300, 1700, 2600);
    const r = rng(15);
    for (let y = -260, i = 0; y < 2300; y += 150, i++) {
      const c = 26 + r() * 12; ctx.fillStyle = css([c, c + 4, c + 14]); ctx.fillRect(-300, y, 1700, 144);
      ctx.strokeStyle = 'rgba(4,6,10,.5)'; ctx.lineWidth = 2;
      for (let k = 0; k < 6; k++) { const yy = y + 14 + r() * 116; ctx.beginPath(); ctx.moveTo(-300, yy); ctx.bezierCurveTo(200, yy + (r() - .5) * 20, 800, yy + (r() - .5) * 20, 1400, yy + (r() - .5) * 14); ctx.stroke(); }
      ctx.fillStyle = '#05070b'; ctx.fillRect(-300, y + 144, 1700, 6);
      ctx.fillStyle = 'rgba(150,170,210,.07)'; ctx.fillRect(-300, y, 1700, 4);
      for (const x of [60 + (i % 2) * 380, 760 + (i % 2) * 200]) { ctx.fillStyle = '#080a0e'; ctx.beginPath(); ctx.arc(x, y + 30, 6, 0, TAU); ctx.arc(x, y + 114, 6, 0, TAU); ctx.fill(); }
    }
    // 栏杆脚与其投影（上方）
    for (const x of [-60, 300, 660, 1020]) { ctx.fillStyle = '#07080c'; ctx.fillRect(x, -300, 70, 640); ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fill(P(`M ${x} 340 L ${x + 70} 340 L ${x + 250} 760 L ${x + 170} 760 Z`)); }
    ctx.fillStyle = '#07080c'; ctx.fillRect(-300, 210, 1700, 60); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(-300, 560, 1700, 50);
    // 影子先到
    const ax = 540, ay = 1090;
    ctx.fillStyle = `rgba(0,0,0,${.15 + .4 * f})`; ctx.beginPath(); ctx.ellipse(ax + 30, ay + 40, lerp(520, 300, f), lerp(180, 74, f), -.1, 0, TAU); ctx.fill();
    const y = f < 1 ? lerp(-900, ay, f * f) : ay - Math.abs(Math.sin(d * 10)) * 40 * Math.exp(-d * 5);
    const rot = f < 1 ? lerp(-2.6, -.14, f) : -.14 + Math.exp(-d * 6) * .16 * Math.sin(d * 22);
    const sc = f < 1 ? lerp(1.9, 1.32, f) : 1.32;
    layer(ctx, g => at(g, ax, y, sc, rot, () => drawArm(g, { wrap: 0, curl: d > 0 ? .25 + .55 * Math.abs(Math.sin(d * 3.2)) * Math.exp(-d * .9) : 0 })), { tint: 'rgba(14,24,60,.3)' });
    // 断口的血迹
    if (d > 0) { ctx.fillStyle = 'rgba(96,18,14,.8)'; const g2 = eout(d / .5); ctx.beginPath(); ctx.ellipse(ax + 320, ay + 30, 60 * g2, 34 * g2, .2, 0, TAU); ctx.fill(); for (const [dx, dy, rr] of [[400, -30, 12], [430, 60, 8], [370, 90, 10], [460, 10, 6]]) { ctx.beginPath(); ctx.arc(ax + dx, ay + dy, rr * g2, 0, TAU); ctx.fill(); } }
    if (d > 0) for (let i = 0; i < 4; i++) { const px = ax + (i - 1.5) * 190 * (1 + d * .5), py = ay + 60 - d * 24, pr = 150 + d * 160; ctx.save(); ctx.translate(px, py); ctx.scale(1, .42); ctx.fillStyle = rg(ctx, 0, 0, 0, pr, [[0, `rgba(170,180,200,${.2 * Math.exp(-d * 1.8)})`], [1, 'rgba(170,180,200,0)']]); ctx.fillRect(-pr, -pr, pr * 2, pr * 2); ctx.restore(); }
    glow(ctx, 300, 700, 900, [150, 170, 220], .14);
  });
  darkness(ctx, 540, 1000, 500, 1350, .86);
}

// ---------- S13 鬼遁入夜色 ----------
export function flee(ctx, s) {
  const { t, dur } = s, u = t / dur, a = io(clamp(t / (dur * .95)));
  camera(ctx, { cx: lerp(560, 520, u), cy: lerp(880, 760, io(u)), z: lerp(1.04, 1.0, u) }, () => {
    sky(ctx, t); skyline(ctx);
    const sc = lerp(.42, .05, a), x = lerp(520, 150, a), y = lerp(820, 330, a) + Math.sin(t * 3) * 10 * sc;
    ctx.save(); ctx.globalAlpha = 1 - ss(.8, 1, a); at(ctx, x, y, sc, .5, () => oniFlight(ctx, { t, arm: false, col: '#04050a' })); ctx.restore();
    ctx.fillStyle = `rgba(40,52,84,${.7})`; ctx.beginPath(); ctx.roundRect(-260 + t * 8, 300, 760, 60, 30); ctx.fill(); ctx.beginPath(); ctx.roundRect(-100 + t * 8, 350, 520, 40, 20); ctx.fill();
    water(ctx, t); banks(ctx);
    fog(ctx, t, { y: 1250, h: 160, n: 7, a: .1, seed: 4, color: [150, 170, 210] });
    bridge(ctx, t, () => layer(ctx, g => { at(g, 720, deckY(720) + 2, FIG, 0, () => riders(g, { rider: false, ph: 2, walk: .3, k: .8 })); at(g, 520, deckY(520) + 2, .2, 0, () => tsunaStand(g, { k: .85, tilt: .22, look: -1, draw: .9 })); }, { tint: NIGHT }));
    willow(ctx, t);
  });
  darkness(ctx, 540, 900, 700, 1500, .6);
}

// ---------- S14 带着布包回家 ----------
export function walk_home(ctx, s) {
  const { t, dur } = s, u = t / dur, rx = lerp(900, 560, u), gy = 1330;
  camera(ctx, { cx: lerp(600, 520, u), cy: 1010, z: lerp(1.36, 1.48, u) }, () => {
    sky(ctx, t, { mx: 900, my: 300, mr: 90, top: '#0a0e1c', mid: '#1b2840', low: '#3a4660' });
    // 筑地塀与门
    ctx.fillStyle = '#231c18'; ctx.fillRect(-400, 930, 2000, 420);
    for (let i = 0; i < 5; i++) { ctx.fillStyle = 'rgba(190,180,160,.07)'; ctx.fillRect(-400, 990 + i * 70, 2000, 5); }
    ctx.fillStyle = '#0c0b0d'; ctx.fill(P('M -400 940 L 1600 940 L 1600 900 C 1000 880 200 880 -400 900 Z'));
    for (let x = -380; x < 1600; x += 34) { ctx.fillStyle = 'rgba(70,84,110,.25)'; ctx.fillRect(x, 892, 4, 46); }
    // 自家门（左），门灯
    ctx.fillStyle = '#0b0908'; ctx.fillRect(110, 800, 30, 540); ctx.fillRect(370, 800, 30, 540); ctx.fill(P('M 60 810 L 450 810 L 420 750 C 330 730 180 730 90 750 Z')); ctx.fillStyle = '#060505'; ctx.fillRect(140, 830, 230, 510);
    ctx.fillStyle = lg(ctx, 0, 980, 0, 1070, [[0, '#ffcf86'], [1, '#d07a30']]); ctx.fillRect(408, 980, 44, 86); ctx.strokeStyle = '#0b0908'; ctx.lineWidth = 4; ctx.strokeRect(408, 980, 44, 86);
    glow(ctx, 430, 1020, 420, [255, 160, 70], .5);
    ctx.fillStyle = lg(ctx, 0, gy - 10, 0, gy + 500, [[0, '#1c1814'], [1, '#080706']]); ctx.fillRect(-400, gy - 6, 2000, 700);
    layer(ctx, g => at(g, rx, gy + 6, .62, 0, () => riders(g, { ph: rx * .045, k: .9, bundle: true, look: .6, tilt: -.06 })), { tint: 'rgba(14,22,48,.36)' });
    fog(ctx, t, { y: 1320, h: 180, n: 7, a: .12, seed: 4, color: [150, 165, 200] });
  });
  darkness(ctx, 500, 1000, 520, 1400, .82);
}
