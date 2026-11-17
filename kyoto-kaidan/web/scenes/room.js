// 室内场景：木箱所在的房间（斜投影，绘卷“吹拔屋台”式构图）
import { W, H, clamp, lerp, ss, io, eout, ein, rng, TAU, n1, flicker, camera, at, poly, lg, rg, css, glow, darkness, wash, motes, vtext, P, stroke, map } from '../lib.js';
import { drawBox, drawBoxTop, drawAndon, drawLidFallen, rope, prj, BOX } from '../art/props.js';

export const OX = 540, OY = 1330;          // 木箱原点（世界坐标）
const WALLY = 1010;
export const KNOCK = [0, 0.46, 0.92];       // 三声敲门的节奏（片头与第六夜一致）
export const knockPulse = (t, t0) => { let v = 0; for (const k of KNOCK) { const d = t - (t0 + k); if (d >= 0 && d < .5) v = Math.max(v, Math.exp(-d * 9)); } return v; };

// 房间背景：墙、柱、格子窗、地板
export function room(ctx, t, { lamp = 1, moon = .3, day = 0, beam = 0, lampOn = true } = {}) {
  const fl = lamp * flicker(t, 3);
  // 墙
  ctx.fillStyle = lg(ctx, 0, -400, 0, WALLY, [[0, '#0a0706'], [.6, '#1a110c'], [1, '#22160f']]); ctx.fillRect(-600, -900, 2400, WALLY + 900);
  // 墙板竖缝
  ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 3; for (let x = -480; x < 1700; x += 150) { ctx.beginPath(); ctx.moveTo(x, -900); ctx.lineTo(x, WALLY); ctx.stroke(); }
  // 格子窗（左）
  const wx = 150, wy = 470, ww = 330, wh = 400;
  const mcol = [lerp(60, 190, day), lerp(84, 200, day), lerp(128, 200, day)];
  ctx.fillStyle = css(mcol, .25 + moon * .75); ctx.fillRect(wx, wy, ww, wh);
  ctx.fillStyle = rg(ctx, wx + ww * .6, wy + wh * .3, 10, 300, [[0, css([200, 215, 235], .5 * (moon + day))], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(wx, wy, ww, wh);
  ctx.fillStyle = '#0d0907'; for (let i = 0; i <= 9; i++) ctx.fillRect(wx + i * ww / 9 - 7, wy, 14, wh);
  ctx.fillRect(wx - 16, wy - 16, ww + 32, 20); ctx.fillRect(wx - 16, wy + wh - 4, ww + 32, 20); ctx.fillRect(wx - 16, wy + wh * .5 - 6, ww + 32, 12);
  // 横梁与柱
  ctx.fillStyle = '#120c09'; ctx.fillRect(-600, 380, 2400, 44); ctx.fillRect(60, -900, 54, WALLY + 900); ctx.fillRect(1010, -900, 54, WALLY + 900);
  ctx.fillStyle = 'rgba(255,255,255,.03)'; ctx.fillRect(60, -900, 8, WALLY + 900); ctx.fillRect(1010, -900, 8, WALLY + 900);
  // 地板
  ctx.fillStyle = lg(ctx, 0, WALLY, 0, 2300, [[0, '#2c1b11'], [.4, '#3a2416'], [1, '#22140c']]); ctx.fillRect(-600, WALLY, 2400, 1500);
  ctx.strokeStyle = 'rgba(6,3,2,.75)'; ctx.lineWidth = 3.5;
  const dx = BOX.sx / BOX.sy;
  for (let x = -900; x < 2400; x += 138) { ctx.beginPath(); ctx.moveTo(x + (2400 - OY) * -dx, 2400); ctx.lineTo(x + (OY - WALLY) * dx, WALLY); ctx.stroke(); }
  // 地板木纹（淡）
  const r = rng(4); ctx.strokeStyle = 'rgba(10,5,3,.25)'; ctx.lineWidth = 1.5;
  for (let i = 0; i < 90; i++) { const x = -500 + r() * 2200, y = WALLY + 20 + r() * 1200, l = 80 + r() * 220; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - l * dx, y + l); ctx.stroke(); }
  ctx.fillStyle = '#0c0806'; ctx.fillRect(-600, WALLY - 14, 2400, 26);
  // 月光透过格子落在地上
  if (moon + day > .02) {
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = clamp(moon * .5 + day * .7);
    for (let i = 0; i < 9; i++) {
      const x0 = wx + i * ww / 9 + 9, x1 = x0 + ww / 9 - 18, sh = 250 + beam;
      ctx.fillStyle = lg(ctx, 0, WALLY, 0, WALLY + 420, [[0, css(mcol, .55)], [1, css(mcol, 0)]]);
      ctx.beginPath(); ctx.moveTo(x0 + 40, WALLY + 30); ctx.lineTo(x1 + 40, WALLY + 30); ctx.lineTo(x1 + sh + 60, WALLY + 420); ctx.lineTo(x0 + sh + 40, WALLY + 420); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  return fl;
}
export function lamp(ctx, t, level, x = 935, y = 1180) { at(ctx, x, y, 1, 0, () => drawAndon(ctx, t, level * flicker(t, 3))); }
// 灯光与压暗
export function lighting(ctx, t, { lamp: lv = 1, day = 0, dark = .9, lx = 935, ly = 1040, cool = 0 } = {}) {
  const fl = lv * flicker(t, 3);
  glow(ctx, lx, ly, 900, [255, 150, 62], .5 * fl); glow(ctx, lx, ly, 330, [255, 205, 130], .55 * fl);
  if (day > 0) { ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = css([120, 140, 170], .3 * day); ctx.fillRect(-600, -900, 2400, 3400); ctx.restore(); }
  ctx.save(); ctx.globalCompositeOperation = 'multiply';
  const a = dark * (1 - day * .6), r1 = 600 + 900 * clamp(fl + cool);
  ctx.fillStyle = rg(ctx, lerp(540, lx, .6), 1120, 120, r1, [[0, 'rgba(255,255,255,1)'], [.5, css([120 * (1 - a) + 90, 100 * (1 - a) + 60, 90 * (1 - a) + 40])], [1, css([30 * (1 - a) + 8, 26 * (1 - a) + 6, 30 * (1 - a) + 8])]]);
  ctx.fillRect(-600, -900, 2400, 3400); ctx.restore();
}
function boxShadow(ctx, a = .55) { ctx.save(); ctx.fillStyle = `rgba(0,0,0,${a})`; ctx.beginPath(); ctx.moveTo(OX - 270, OY + 4); ctx.lineTo(OX - 560, OY + 130); ctx.lineTo(OX + 120, OY + 150); ctx.lineTo(OX + 270, OY + 4); ctx.closePath(); ctx.fill(); ctx.restore(); }

// ---------- S01 片头：黑暗中的木箱与封绳 ----------
export function box_open(ctx, s) {
  const { t, dur } = s, k0 = s.m('knockA', 0);
  const kp = knockPulse(t, k0), u = io(t / dur);
  const lv = .52 - kp * .22;
  camera(ctx, { cx: lerp(590, 600, u), cy: lerp(1035, 1010, u), z: lerp(1.5, 1.92, u), ox: n1(t * 30, 1) * kp * 5, oy: kp * 5 }, () => {
    room(ctx, t, { lamp: lv, moon: .12 });
    boxShadow(ctx);
    at(ctx, OX, OY, 1, 0, () => drawBox(ctx, { k: 1 }));
    lighting(ctx, t, { lamp: lv, dark: .96, lx: 980, ly: 1000 });
  });
  motes(ctx, t, { n: 26, seed: 3, y0: 300, y1: 1500, a: .22, size: 2, fall: 4 });
}

// ---------- S15 断臂入箱、封绳 ----------
export function box_seal(ctx, s) {
  const { t, dur } = s, c1 = s.m('L15.c3', 1.1), c0 = s.m('L15.c2', 0);
  const step = t < c1 - .12 ? 0 : t < c1 + .55 ? 1 : 2;           // 0 盖上 1 上绳 2 贴符
  const tStep = [c0, c1 - .12, c1 + .55][step], jolt = Math.exp(-(t - tStep) * 10) * (step ? 1 : 0);
  const open = step === 0 ? lerp(.5, 0, ein(map(t, 0, c1 - .2, 0, 1))) : 0;
  const u = io(t / dur);
  camera(ctx, { cx: 580, cy: lerp(1090, 1060, u), z: lerp(1.28, 1.42, u), oy: jolt * 7 }, () => {
    room(ctx, t, { lamp: .85, moon: .2 }); boxShadow(ctx); lamp(ctx, t, .85);
    at(ctx, OX, OY, 1, 0, () => drawBox(ctx, { open, rope: step >= 1 ? 1 : 0, seal: step >= 2 ? 1 : 0, tie: step >= 1 ? clamp(.3 + (t - tStep) * 3) : 1 }));
    lighting(ctx, t, { lamp: .85, dark: .86 });
  });
  motes(ctx, t, { n: 20, seed: 3, y0: 300, y1: 1500, a: .2 });
}

// ---------- S16 一夜、二夜……第六夜 ----------
export function nights(ctx, s) {
  const { t, dur } = s, a1 = s.m('L16', 0), a2 = s.m('L17', 3), a3 = s.m('L18', 6), e3 = s.m('L18.end', 8), kn = s.m('knockB', 99);
  // 第二夜之后快速流过四个昼夜
  const lapse = clamp((t - (a3 - .1)) / Math.max(.6, e3 - a3 + .5));
  const day = lapse > 0 && lapse < 1 ? Math.pow(Math.abs(Math.sin(lapse * Math.PI * 4)), 1.5) * (1 - lapse * .4) : 0;
  let lv = t < a2 - .25 ? 1 : t < a3 ? .82 : lerp(.82, .4, ss(0, 1, lapse));
  lv *= 1 - day * .7;
  const end = clamp((t - e3) / Math.max(.3, dur - e3));
  lv = lerp(lv, .26, ss(0, 1, end));
  const kp = knockPulse(t, kn);
  const u = t / dur;
  camera(ctx, { cx: lerp(560, 575, u), cy: lerp(1010, 1040, u), z: lerp(1.0, 1.16, io(u)), ox: n1(t * 30, 1) * kp * 4, oy: kp * 4 }, () => {
    room(ctx, t, { lamp: lv, moon: lerp(.3, .55, end), day, beam: lapse * 160 }); boxShadow(ctx); lamp(ctx, t, lv);
    at(ctx, OX, OY, 1, 0, () => drawBox(ctx, {}));
    lighting(ctx, t, { lamp: lv, day, dark: .9 });
  });
  motes(ctx, t, { n: 24, seed: 3, y0: 300, y1: 1500, a: .2 });
  // 竖排时间字幕
  const cap = (txt, st, en) => { const a = Math.min(ss(st, st + .35, t), 1 - ss(en - .3, en, t)); if (a > 0) { vtext(ctx, txt, 150, 300, 104, { color: '#efe4c8', weight: 900, alpha: a, shadow: 'rgba(0,0,0,.9)' }); ctx.fillStyle = `rgba(170,40,30,${a})`; ctx.fillRect(86, 300, 5, 104 * 1.12 * 3 - 12); } };
  cap('第一夜', a1, a2 - .15); cap('第二夜', a2, a3 - .1); cap('第六夜', e3 - .5, dur + 1);
}

// ---------- S20 请进屋、解绳、掀盖 ----------
export function unseal(ctx, s) {
  const { t, dur } = s, c1 = s.m('L22.c1', 2), c2 = s.m('L22.c2', 3), u = t / dur;
  const tie = 1 - ss(c1, c1 + .5, t), rp = 1 - ss(c1 + .45, c1 + .95, t);
  const open = .46 * io(map(t, c2 + .1, dur - .2, 0, 1));
  const sh = ss(.2, c1 + .4, t);        // 老人的影子伸进来
  const lv = .62 - sh * .1;
  camera(ctx, { cx: lerp(570, 590, u), cy: lerp(1080, 1010, io(u)), z: lerp(1.2, 1.62, io(u)) }, () => {
    room(ctx, t, { lamp: lv, moon: .5 }); boxShadow(ctx); lamp(ctx, t, lv);
    // 影子：佝偻的人形，从左下铺到地板和箱子上
    const shadow = () => {
      ctx.save(); ctx.translate(lerp(-520, -60, eout(sh)), 0); ctx.globalAlpha = .62;
      ctx.fillStyle = '#020102';
      ctx.fill(P('M -300 2100 C -200 1800 -60 1620 60 1500 C 90 1440 100 1380 150 1340 C 210 1300 290 1320 318 1380 C 340 1440 300 1500 260 1530 C 330 1600 420 1760 470 2100 Z'));
      ctx.restore();
    };
    shadow();
    at(ctx, OX, OY, 1, 0, () => drawBox(ctx, { open, rope: rp, tie, inner: open }));
    // 掉落的绳
    if (rp < 1) { ctx.save(); ctx.globalAlpha = 1 - rp; rope(ctx, [[250, 1352], [330, 1372], [430, 1360], [520, 1382], [640, 1366], [760, 1384], [850, 1362]], 15, { k: .8 }); ctx.restore(); }
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.beginPath(); ctx.rect(OX - 300, OY - 420, 640, 430); ctx.clip(); shadow(); ctx.restore();
    lighting(ctx, t, { lamp: lv, dark: .9 });
  });
  motes(ctx, t, { n: 20, seed: 3, y0: 300, y1: 1500, a: .2 });
}

// ---------- 俯视：箱内 ----------
function topBase(ctx, t, { lampL = .8, k = 1 } = {}) {
  ctx.fillStyle = '#24160d'; ctx.fillRect(-900, -900, 3000, 3800);
  ctx.strokeStyle = 'rgba(6,3,2,.8)'; ctx.lineWidth = 4; for (let y = -700; y < 2800; y += 150) { ctx.beginPath(); ctx.moveTo(-900, y); ctx.lineTo(2100, y + 40); ctx.stroke(); }
}
export function boxtop_empty(ctx, s) {
  const { t, dur, p } = s, u = t / dur, push = p.push ?? 0;
  const z = lerp(p.z0 ?? 1.0, p.z1 ?? 1.12, io(u));
  camera(ctx, { cx: 540, cy: lerp(980, 960, u), z, r: lerp(-.035, -.02, u) }, () => {
    topBase(ctx, t);
    at(ctx, 540, 960, 1.08, 0, () => drawBoxTop(ctx, { arm: 0, stain: 1, k: .95 }));
    // 散落的封绳与符纸
    rope(ctx, [[60, 1330], [150, 1300], [250, 1340], [330, 1420], [300, 1520], [200, 1560]], 17, { k: .7 });
    rope(ctx, [[820, 560], [900, 600], [1010, 590], [1100, 640]], 17, { k: .7 });
    // 木屑落在布上（逐渐增多）
    const r = rng(21);
    for (let i = 0; i < 46; i++) {
      const lx = 120 + r() * 840, ly = 620 + r() * 760, born = r() * (p.t0 ?? 0) + r() * 5 - (p.pre ?? 3), a = r() * TAU, l = 8 + r() * 26, w = 3 + r() * 6;
      const age = t - born; if (age < 0) continue;
      const f = clamp(age / .9), yy = ly - (1 - eout(f)) * 700, sc = lerp(2.2, 1, f);
      ctx.save(); ctx.translate(lx + Math.sin(age * 3 + i) * (1 - f) * 30, yy); ctx.rotate(a + (1 - f) * 6); ctx.scale(sc, sc);
      ctx.fillStyle = css([130 + r() * 50, 96 + r() * 30, 58], f < 1 ? .9 : .95); ctx.fillRect(-l / 2, -w / 2, l, w); ctx.strokeStyle = 'rgba(10,6,4,.8)'; ctx.lineWidth = 1.5; ctx.strokeRect(-l / 2, -w / 2, l, w); ctx.restore();
    }
    // 屋顶破洞投下的月光
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = rg(ctx, 500, 930, 200, 1150, [[0, '#ffffff'], [.45, '#5a6274'], [1, '#0b0c12']]); ctx.fillRect(-900, -900, 3000, 3800); ctx.restore();
    glow(ctx, 500, 930, 620, [150, 175, 215], .5); glow(ctx, 480, 900, 300, [215, 228, 250], .3);
  });
  motes(ctx, t, { n: 70, seed: 8, x0: 150, x1: 930, y0: 200, y1: 1700, color: [210, 222, 245], a: .5, size: 2.4, fall: 22, drift: 16 });
}
