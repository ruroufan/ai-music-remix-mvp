// 京都怪谈 · 主渲染循环：按时间轴取镜头 -> 画场景 -> 转场 -> 纸纹/颗粒/暗角 -> 字幕
import { W, H, mk, clamp, ss, paperTex, grainTex, vignetteTex, htext, SANS, SERIF } from './lib.js';
import { SCENES } from './scenes/index.js';

const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const out = cv.getContext('2d');
const bufA = mk(W, H), bufB = mk(W, H);
let TL = null;

function drawShot(buf, shot, T) {
  const g = buf.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.fillStyle = '#050406'; g.fillRect(0, 0, W, H);
  const sc = SCENES[shot.scene];
  if (!sc) { g.fillStyle = '#400'; g.fillRect(0, 0, W, H); htext(g, shot.scene + '?', W / 2, H / 2, 60); return; }
  g.save();
  sc(g, { t: T - shot.start, dur: shot.end - shot.start, T, p: shot.p || {}, m: (name, d = 1e9) => (TL.marks[name] ?? d) - shot.start, TL, shot });
  g.restore();
}

function subtitles(g, T) {
  for (const s of TL.subs) {
    if (T < s.start - .02 || T > s.end) continue;
    const a = Math.min(ss(s.start - .02, s.start + .1, T), 1 - ss(s.end - .1, s.end, T));
    const size = 58, y = 1470;
    let rows = [s.text];
    if ([...s.text].length > 15) { const cs = [...s.text], h = Math.ceil(cs.length / 2); rows = [cs.slice(0, h).join(''), cs.slice(h).join('')]; }
    rows.forEach((r, i) => {
      const yy = y + (i - (rows.length - 1) / 2) * size * 1.35;
      g.save(); g.globalAlpha = a; g.font = `500 ${size}px ${SANS}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.shadowColor = 'rgba(0,0,0,.9)'; g.shadowBlur = 14; g.shadowOffsetY = 2;
      g.lineJoin = 'round'; g.lineWidth = 7; g.strokeStyle = 'rgba(0,0,0,.72)'; g.strokeText(r, W / 2, yy);
      g.shadowBlur = 0; g.shadowOffsetY = 0; g.fillStyle = '#ffffff'; g.fillText(r, W / 2, yy); g.restore();
    });
  }
}
function overlays(g, T) {
  for (const o of TL.overlays || []) {
    const st = TL.marks[o.from] ?? o.start ?? 0, en = TL.marks[o.to] ?? o.end ?? 0;
    if (T < st || T > en) continue;
    const a = Math.min(ss(st, st + .8, T), 1 - ss(en - .8, en, T)) * (o.alpha ?? .75);
    if (o.type === 'note') htext(g, o.text, W / 2, o.y ?? 150, o.size ?? 30, { color: '#e8dfc8', weight: 400, font: SERIF, alpha: a, spacing: 10, shadow: 'rgba(0,0,0,.8)' });
  }
}

function post(g, T, frame) {
  // 黑位略微抬起并带纸感
  g.save();
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = .62; g.drawImage(paperTex(), 0, 0);
  g.globalCompositeOperation = 'screen'; g.globalAlpha = .05; g.drawImage(paperTex(), 0, 0);
  g.globalCompositeOperation = 'overlay'; g.globalAlpha = .11; g.imageSmoothingEnabled = true;
  const gi = Math.floor(frame / 2) % 6; g.drawImage(grainTex(gi), 0, 0, W, H);
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = 1; g.drawImage(vignetteTex(), 0, 0);
  g.restore();
}

function render(T) {
  const frame = Math.round(T * TL.fps);
  const shots = TL.shots;
  let i = shots.findIndex(s => T >= s.start && T < s.end); if (i < 0) i = shots.length - 1;
  const s = shots[i], prev = shots[i - 1];
  out.setTransform(1, 0, 0, 1, 0, 0); out.globalAlpha = 1; out.globalCompositeOperation = 'source-over';
  const tin = s.in || { type: 'cut' }, lt = T - s.start, rem = s.end - T;
  drawShot(bufA, s, T);
  out.drawImage(bufA, 0, 0);
  if (tin.type === 'dissolve' && prev && lt < tin.dur) {
    drawShot(bufB, prev, T);
    out.globalAlpha = 1 - ss(0, tin.dur, lt); out.drawImage(bufB, 0, 0); out.globalAlpha = 1;
  }
  let dim = 0, flash = 0;
  if (tin.type === 'fade' && lt < tin.dur) dim = 1 - ss(0, tin.dur, lt);
  if (tin.type === 'flash' && lt < tin.dur) flash = 1 - ss(0, tin.dur, lt);
  if (s.out && s.out.type === 'fade' && rem < s.out.dur) dim = Math.max(dim, 1 - ss(0, s.out.dur, rem));
  post(out, T, frame);
  if (flash > 0) { out.fillStyle = `rgba(245,238,220,${flash})`; out.fillRect(0, 0, W, H); }
  if (dim > 0) { out.fillStyle = `rgba(3,2,3,${dim})`; out.fillRect(0, 0, W, H); }
  overlays(out, T);
  subtitles(out, T);
}

window.setup = async (tl) => {
  TL = tl;
  await Promise.all([`700 60px ${SERIF}`, `900 60px ${SERIF}`, `500 60px ${SANS}`, `400 60px ${SERIF}`].map(f => document.fonts.load(f, '京都怪谈一条戻桥')));
  paperTex(); vignetteTex(); for (let i = 0; i < 6; i++) grainTex(i);
  render(0);
  return true;
};
window.renderAt = (T) => { render(T); return true; };
window.frameJPEG = (f, q = .95) => { render(f / TL.fps); return cv.toDataURL('image/jpeg', q).slice(23); };
window.stillPNG = (T) => { render(T); return cv.toDataURL('image/png').slice(22); };
window.sceneStill = (scene, t, dur, p) => {
  // 调试：直接画某个场景
  const shot = { scene, start: 0, end: dur, p: p || {}, id: 'dbg' };
  const save = TL; TL = { ...TL, shots: [shot], subs: [], overlays: [], marks: p && p._marks || {} };
  render(t); TL = save; return cv.toDataURL('image/png').slice(22);
};
