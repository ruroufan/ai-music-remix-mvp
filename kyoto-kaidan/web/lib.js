// 京都怪谈 · 渲染引擎基础库：数学、随机、噪声、画布工具、纸纹与光效
export const W = 1080, H = 1920;
export const TAU = Math.PI * 2;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ss = (a, b, x) => { x = clamp((x - a) / (b - a)); return x * x * (3 - 2 * x); };
export const io = t => (t = clamp(t), t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const eout = t => 1 - Math.pow(1 - clamp(t), 3);
export const ein = t => Math.pow(clamp(t), 3);
export const map = (x, a, b, c, d) => lerp(c, d, clamp((x - a) / (b - a)));

export function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const hash = (x, y, s) => { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 2147483647) | 0; h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; };
export function vnoise(x, y, s = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return lerp(lerp(hash(xi, yi, s), hash(xi + 1, yi, s), u), lerp(hash(xi, yi + 1, s), hash(xi + 1, yi + 1, s), u), v);
}
export function fbm(x, y, s = 0, oct = 4) { let a = .5, f = 1, r = 0, n = 0; for (let i = 0; i < oct; i++) { r += a * vnoise(x * f, y * f, s + i * 17); n += a; a *= .5; f *= 2; } return r / n; }
// 一维平滑噪声（时间上的抖动：烛火、呼吸、手持感）
export const n1 = (t, s = 0) => vnoise(t, s * 7.31, s) * 2 - 1;
export const flicker = (t, s = 0) => 0.9 + 0.07 * n1(t * 7, s) + 0.03 * n1(t * 23, s + 5);

export function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
const _cache = new Map();
export function cache(key, w, h, fn) { let c = _cache.get(key); if (!c) { c = mk(w, h); fn(c.getContext('2d'), c); _cache.set(key, c); } return c; }

// 灰度 fbm 纹理（用于水墨晕染、云雾、木纹底）
export function noiseTex(w, h, { scale = 200, seed = 1, oct = 4, lo = 0, hi = 1, sx = 1, sy = 1, alpha = false, color = [255, 255, 255] } = {}) {
  const c = mk(w, h), g = c.getContext('2d'), im = g.createImageData(w, h), d = im.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const v = clamp((fbm(x / scale * sx, y / scale * sy, seed, oct) - lo) / (hi - lo)), i = (y * w + x) * 4;
    if (alpha) { d[i] = color[0]; d[i + 1] = color[1]; d[i + 2] = color[2]; d[i + 3] = v * 255; }
    else { d[i] = d[i + 1] = d[i + 2] = v * 255; d[i + 3] = 255; }
  }
  g.putImageData(im, 0, 0); return c;
}

export const P = d => new Path2D(d);
export function fill(ctx, d, color) { ctx.fillStyle = color; ctx.fill(typeof d === 'string' ? P(d) : d); }
export function stroke(ctx, d, color, lw = 3) { ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(typeof d === 'string' ? P(d) : d); }
export function shape(ctx, d, color, ink = '#0b0a0c', lw = 3) { const p = typeof d === 'string' ? P(d) : d; if (color) { ctx.fillStyle = color; ctx.fill(p); } if (ink && lw) stroke(ctx, p, ink, lw); }
export function poly(ctx, pts, color, ink, lw = 3) {
  ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
  if (color) { ctx.fillStyle = color; ctx.fill(); } if (ink) { ctx.strokeStyle = ink; ctx.lineWidth = lw; ctx.lineJoin = 'round'; ctx.stroke(); }
}
export function lg(ctx, x0, y0, x1, y1, stops) { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
export function rg(ctx, x, y, r0, r1, stops) { const g = ctx.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
export const rgba = (r, g, b, a = 1) => `rgba(${r | 0},${g | 0},${b | 0},${a})`;
export function mix(c1, c2, t) { return [0, 1, 2].map(i => lerp(c1[i], c2[i], t)); }
export const css = (c, a = 1) => rgba(c[0], c[1], c[2], a);

// 发光（加色）
export function glow(ctx, x, y, r, color, a = 1, mode = 'screen') {
  ctx.save(); ctx.globalCompositeOperation = mode; ctx.globalAlpha = clamp(a);
  ctx.fillStyle = rg(ctx, x, y, 0, r, [[0, css(color, 1)], [.35, css(color, .45)], [1, css(color, 0)]]);
  ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}
// 压暗：以某点为亮心，四周压黑
export function darkness(ctx, x, y, r0, r1, a = 1, col = '6,5,8') {
  ctx.save(); ctx.globalAlpha = 1;
  ctx.fillStyle = rg(ctx, x, y, r0, r1, [[0, `rgba(${col},0)`], [1, `rgba(${col},${a})`]]);
  ctx.fillRect(-3000, -3000, 8000, 8000); ctx.restore();
}
// 摄像机：让世界坐标 (cx,cy) 落在画面中心，缩放 z，旋转 r
export function camera(ctx, { cx = W / 2, cy = H / 2, z = 1, r = 0, ox = 0, oy = 0 }, fn) {
  ctx.save(); ctx.translate(W / 2 + ox, H / 2 + oy); ctx.rotate(r); ctx.scale(z, z); ctx.translate(-cx, -cy); fn(); ctx.restore();
}
export function at(ctx, x, y, s, r, fn) { ctx.save(); ctx.translate(x, y); if (r) ctx.rotate(r); if (s !== 1) { if (Array.isArray(s)) ctx.scale(s[0], s[1]); else ctx.scale(s, s); } fn(); ctx.restore(); }

export const SERIF = '"Noto Serif CJK SC","Noto Serif CJK JP",serif';
export const SANS = '"Noto Sans CJK SC","Noto Sans CJK JP",sans-serif';
// 竖排文字
export function vtext(ctx, str, x, y, size, { color = '#efe6cf', weight = 700, gap = 1.12, font = SERIF, alpha = 1, shadow = null, reveal = 1 } = {}) {
  ctx.save(); ctx.font = `${weight} ${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const cs = [...str];
  cs.forEach((ch, i) => {
    const a = clamp(reveal * cs.length - i); if (a <= 0) return;
    ctx.globalAlpha = alpha * a;
    if (shadow) { ctx.shadowColor = shadow; ctx.shadowBlur = size * .35; }
    ctx.fillStyle = color;
    const yy = y + i * size * gap + size / 2;
    if (ch === '·' || ch === '・') ctx.fillText('·', x, yy); else if (ch === '—' || ch === 'ー') { ctx.save(); ctx.translate(x, yy); ctx.rotate(Math.PI / 2); ctx.fillText(ch, 0, 0); ctx.restore(); } else ctx.fillText(ch, x, yy);
  });
  ctx.restore();
}
export function htext(ctx, str, x, y, size, { color = '#fff', weight = 500, font = SANS, alpha = 1, align = 'center', spacing = 0, shadow = null, strokeC = null, strokeW = 0 } = {}) {
  ctx.save(); ctx.font = `${weight} ${size}px ${font}`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.globalAlpha = alpha;
  if (spacing) ctx.letterSpacing = spacing + 'px';
  if (shadow) { ctx.shadowColor = shadow; ctx.shadowBlur = size * .3; }
  if (strokeC) { ctx.strokeStyle = strokeC; ctx.lineWidth = strokeW; ctx.lineJoin = 'round'; ctx.strokeText(str, x, y); }
  ctx.fillStyle = color; ctx.fillText(str, x, y); ctx.restore();
}

// ---------- 纸张与颗粒 ----------
export function paperTex() {
  return cache('paper', W, H, (g) => {
    const lo = noiseTex(270, 480, { scale: 90, seed: 11, oct: 5 });
    g.fillStyle = '#e9dfc6'; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'multiply'; g.globalAlpha = .55; g.imageSmoothingQuality = 'high'; g.drawImage(lo, 0, 0, W, H);
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    const r = rng(7);
    // 纤维
    for (let i = 0; i < 2600; i++) {
      const x = r() * W, y = r() * H, l = 10 + r() * 60, a = r() * TAU, k = (r() - .5) * 30;
      g.strokeStyle = r() < .5 ? `rgba(255,250,235,${.05 + r() * .12})` : `rgba(90,70,40,${.04 + r() * .09})`;
      g.lineWidth = .6 + r() * 1.2; g.beginPath(); g.moveTo(x, y);
      g.quadraticCurveTo(x + Math.cos(a) * l / 2 + k, y + Math.sin(a) * l / 2 - k, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
    for (let i = 0; i < 5000; i++) { g.fillStyle = `rgba(70,50,25,${r() * .12})`; g.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2); }
  });
}
export function grainTex(i) {
  return cache('grain' + i, 540, 960, (g) => {
    const im = g.createImageData(540, 960), d = im.data, r = rng(100 + i * 13);
    for (let p = 0; p < d.length; p += 4) { const v = 128 + (r() + r() + r() - 1.5) * 150; d[p] = d[p + 1] = d[p + 2] = v; d[p + 3] = 255; }
    g.putImageData(im, 0, 0);
  });
}
export function vignetteTex() {
  return cache('vig', W, H, (g) => {
    g.fillStyle = rg(g, W / 2, H * .48, H * .28, H * .78, [[0, 'rgba(0,0,0,0)'], [.6, 'rgba(8,5,3,.38)'], [1, 'rgba(4,2,1,.9)']]);
    g.fillRect(0, 0, W, H);
  });
}
// 水墨晕染大纹理
export function washTex(seed = 3) { return cache('wash' + seed, 540, 960, (g, c) => { g.drawImage(noiseTex(270, 480, { scale: 110, seed, oct: 5, lo: .2, hi: .8 }), 0, 0, 540, 960); }); }
export function wash(ctx, seed, alpha, mode = 'soft-light', ox = 0, oy = 0, sc = 1) {
  ctx.save(); ctx.globalCompositeOperation = mode; ctx.globalAlpha = alpha; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(washTex(seed), -W * (sc - 1) / 2 + ox, -H * (sc - 1) / 2 + oy, W * sc, H * sc); ctx.restore();
}
// 雾：柔和的大椭圆缓慢漂移
export function fog(ctx, t, { y = 1000, h = 300, n = 6, color = [200, 210, 225], a = .12, seed = 1, speed = 12, w = 900 } = {}) {
  const r = rng(seed); ctx.save();
  for (let i = 0; i < n; i++) {
    const bx = r() * (W + w) - w / 2, by = y + (r() - .5) * h, rw = w * (.5 + r() * .7), rh = h * (.35 + r() * .5), sp = (r() - .3) * speed;
    let x = bx + sp * t; x = ((x + w) % (W + 2 * w) + (W + 2 * w)) % (W + 2 * w) - w;
    ctx.save(); ctx.translate(x, by + Math.sin(t * .2 + i) * 8); ctx.scale(1, rh / rw);
    ctx.fillStyle = rg(ctx, 0, 0, 0, rw, [[0, css(color, a)], [1, css(color, 0)]]); ctx.fillRect(-rw, -rw, rw * 2, rw * 2); ctx.restore();
  }
  ctx.restore();
}
// 漂浮微尘 / 木屑
export function motes(ctx, t, { n = 40, seed = 5, x0 = 0, x1 = W, y0 = 0, y1 = H, color = [255, 220, 170], a = .5, size = 2.2, fall = 6, drift = 10 } = {}) {
  const r = rng(seed); ctx.save();
  for (let i = 0; i < n; i++) {
    const bx = lerp(x0, x1, r()), by = lerp(y0, y1, r()), ph = r() * 100, sz = size * (.4 + r()), sp = fall * (.4 + r());
    const yy = y0 + (((by - y0) + sp * t) % (y1 - y0) + (y1 - y0)) % (y1 - y0);
    const xx = bx + Math.sin(t * .4 + ph) * drift;
    const tw = .5 + .5 * Math.sin(t * 1.3 + ph * 3);
    ctx.fillStyle = css(color, a * tw); ctx.beginPath(); ctx.arc(xx, yy, sz, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
// 笔触线：沿折线画粗细变化的墨线
export function brush(ctx, pts, w0, w1, color) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineCap = 'round';
  for (let i = 1; i < pts.length; i++) { ctx.lineWidth = lerp(w0, w1, i / (pts.length - 1)); ctx.beginPath(); ctx.moveTo(pts[i - 1][0], pts[i - 1][1]); ctx.lineTo(pts[i][0], pts[i][1]); ctx.stroke(); }
  ctx.restore();
}
