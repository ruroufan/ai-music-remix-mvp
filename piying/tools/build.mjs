#!/usr/bin/env node
// 皮影短视频构建：分镜脚本 + 配音(+SRT) → MP4
//
// 用法：
//   node tools/build.mjs <集目录> [--vertical] [--out 文件] [--preview N] [--from 秒] [--to 秒]
//
// 集目录包含：
//   episode.json   分镜脚本（格式见 README）
//   voice.wav/mp3  配音
//   voice.srt      配音字幕（可选；没有时调用 tools/align.py 用 ASR 自动对齐）
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync, execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FPS = 30, TITLE_DUR = 2.5, TAIL = 2.0;

// ---------- 参数 ----------
const args = process.argv.slice(2);
if (!args[0] || args[0].startsWith('--')) { console.error('用法: node tools/build.mjs <集目录> [--vertical] [--out 文件] [--preview N] [--from 秒] [--to 秒]'); process.exit(1); }
const epDir = path.resolve(args[0]);
const flag = (k) => args.includes(k);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const vertical = flag('--vertical');
const preview = opt('--preview', null);
const outFile = path.resolve(opt('--out', path.join(epDir, vertical ? 'out_vertical.mp4' : 'out.mp4')));

const episode = JSON.parse(fs.readFileSync(path.join(epDir, 'episode.json'), 'utf8'));
const voiceFile = ['voice.wav', 'voice.mp3', 'voice.m4a'].map(f => path.join(epDir, f)).find(f => fs.existsSync(f));
if (!voiceFile) { console.error(`找不到配音：${epDir}/voice.wav|mp3|m4a（可先运行 python3 tools/tts.py ${args[0]} 生成预览配音）`); process.exit(1); }
let srtFile = path.join(epDir, 'voice.srt');
if (!fs.existsSync(srtFile)) {
  console.log('没有 voice.srt，用 ASR 生成带时间戳的字幕并与文案对齐 …');
  const r = spawnSync('python3', [path.join(ROOT, 'tools/align.py'), epDir], { stdio: 'inherit' });
  if (r.status !== 0 || !fs.existsSync(srtFile)) { console.error('自动对齐失败'); process.exit(1); }
}

// ---------- SRT ----------
const ts = s => { const m = s.trim().match(/(\d+):(\d+):(\d+)[,.](\d+)/); return +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000; };
const cues = fs.readFileSync(srtFile, 'utf8').replace(/\r/g, '').split(/\n\s*\n/).map(b => b.trim().split('\n')).filter(l => l.length >= 2 && l.some(x => x.includes('-->')))
  .map(l => { const i = l.findIndex(x => x.includes('-->')); const [a, b] = l[i].split('-->'); return { start: ts(a), end: ts(b), text: l.slice(i + 1).join('') }; });
const voiceDur = +execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${voiceFile}"`).toString().trim();

// ---------- 文案 → SRT 时间对齐 ----------
const norm = s => s.replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)).replace(/[^\p{Script=Han}A-Za-z0-9]/gu, '').toLowerCase();
const stream = []; // 每个字及其时间
cues.forEach((c, ci) => { const n = [...norm(c.text)]; n.forEach((ch, i) => stream.push({ ch, t: i === 0 ? c.start : c.start + (c.end - c.start) * i / n.length, ci })); });
const streamStr = stream.map(s => s.ch).join('');
const streamAll = stream, streamAllStr = streamStr;
let ptr = 0;
function locate(script) {
  const first = script.split(/[。！？!?；;]/).find(s => norm(s).length) || script;
  const key = norm(first).slice(0, 10);
  let idx = streamStr.indexOf(key, ptr);
  if (idx < 0) { // 模糊匹配：逐位比对，取得分最高的位置
    let best = -1, bs = 0;
    for (let j = ptr; j < Math.min(stream.length, ptr + 600); j++) { let s = 0; for (let k = 0; k < key.length; k++) if (streamStr[j + k] === key[k]) s++; if (s > bs) { bs = s; best = j; } }
    if (bs < key.length * 0.5) throw new Error(`文案在 SRT 里找不到：「${first}」`);
    idx = best;
  }
  ptr = idx + key.length;
  return stream[idx].t;
}

// ---------- 编译镜头时间线 ----------
const shotsIn = episode.shots;
const voiced = s => !['title', 'pause'].includes(s.kind);
const vStart = shotsIn.map(s => voiced(s) ? locate(s.script) : null);
if (shotsIn[0] && voiced(shotsIn[0])) vStart[0] = 0;
const gaps = []; // {at: 配音时间, dur}
shotsIn.forEach((s, i) => {
  if (voiced(s)) return;
  const nextV = vStart.slice(i + 1).find(v => v != null);
  gaps.push({ at: nextV != null ? nextV : voiceDur, dur: s.kind === 'title' ? TITLE_DUR : (s.duration || 1.5), shot: i });
});
const offsetAt = v => gaps.filter(g => v >= g.at - 1e-6).reduce((a, g) => a + g.dur, 0);
const outStart = [];
shotsIn.forEach((s, i) => {
  if (voiced(s)) outStart[i] = i === 0 ? 0 : vStart[i] + offsetAt(vStart[i]);
  else { const g = gaps.find(g => g.shot === i); outStart[i] = g.at + gaps.filter(h => h.at < g.at - 1e-6 || (Math.abs(h.at - g.at) < 1e-6 && h.shot < i)).reduce((a, h) => a + h.dur, 0); }
});
const totalGap = gaps.reduce((a, g) => a + g.dur, 0);
const voiceEnd = voiceDur + totalGap, duration = voiceEnd + TAIL;

// 在配音里找某个短语被念到的时刻（从 fromV 之后找），返回配音时间。
// 有 align.py 生成的逐字时间 voice.chars.json 时用它（比按整句插值准）。
const charsFile = path.join(epDir, 'voice.chars.json');
const fine = fs.existsSync(charsFile) && fs.statSync(charsFile).mtimeMs >= fs.statSync(srtFile).mtimeMs - 1000
  ? JSON.parse(fs.readFileSync(charsFile, 'utf8')).map(([ch, t]) => ({ ch, t })) : null;
function phraseV(phrase, fromV) {
  const stream = fine || streamAll, streamStr = fine ? fineStr : streamAllStr;
  const key = norm(phrase);
  let i0 = stream.findIndex(s => s.t >= fromV - 0.05); if (i0 < 0) i0 = 0;
  let idx = streamStr.indexOf(key, i0);
  if (idx < 0) {
    let best = -1, bs = 0;
    for (let j = i0; j < stream.length; j++) { let s = 0; for (let k = 0; k < key.length; k++) if (streamStr[j + k] === key[k]) s++; if (s > bs) { bs = s; best = j; } }
    if (bs < key.length * 0.5) throw new Error(`短语在配音里找不到：「${phrase}」`);
    idx = best;
  }
  return stream[idx].t;
}
const fineStr = fine ? fine.map(s => s.ch).join('') : '';
let curShotV = 0;
function resolveT(v, s0, s1) {
  if (v == null) return s0;
  if (typeof v === 'number') return s0 + v;
  const m = String(v).trim();
  if (m.startsWith('@')) { // "@短语" 或 "@短语+0.3"
    const mm = m.slice(1).match(/^(.*?)([+-]\d+(?:\.\d+)?)?$/);
    const pv = phraseV(mm[1], curShotV);
    return pv + offsetAt(pv) + (mm[2] ? parseFloat(mm[2]) : 0);
  }
  if (m.endsWith('%')) return s0 + (s1 - s0) * parseFloat(m) / 100;
  if (m.startsWith('end')) return s1 + parseFloat(m.slice(3) || '0');
  return s0 + parseFloat(m);
}
const shots = shotsIn.map((s, i) => {
  const start = outStart[i], end = i + 1 < shotsIn.length ? outStart[i + 1] : voiceEnd;
  curShotV = vStart[i] != null ? vStart[i] : (vStart.slice(0, i).reverse().find(v => v != null) ?? 0);
  const R = v => resolveT(v, start, end);
  const o = JSON.parse(JSON.stringify(s));
  Object.assign(o, { id: s.id || `s${i}`, kind: s.kind || 'shot', start, end });
  if (o.kind === 'hook') { o.hookText = s.text || s.script; if (o.light == null) o.light = 0.15; if (o.textAt != null) o.textAt = R(o.textAt); }
  if (o.kind === 'title') o.title = s.title || episode.title;
  // 镜头里任意层级的 at 字段都换算成成片时间（动作、名牌、数字、大字、道具关键帧、镜头、灯光、特效）
  const walk = (x) => { if (Array.isArray(x)) x.forEach(walk); else if (x && typeof x === 'object') for (const k of Object.keys(x)) { if (k === 'at') x[k] = R(x[k]); else walk(x[k]); } };
  for (const k of ['cast', 'nameplates', 'numbers', 'bigText', 'props', 'camera', 'lightKeys', 'effects']) if (o[k]) walk(o[k]);
  if (o.bigText && typeof o.bigText.columns === 'string') o.bigText.columns = [o.bigText.columns];
  for (const p of o.props || []) for (const k of ['showAt', 'hideAt']) if (p[k] != null) p[k] = R(p[k]);
  return o;
});

// ---------- 字幕：一行不超过 16 字 ----------
const hookEndV = vStart.find((v, i) => i > 0 && v != null) ?? 0;
const subtitles = [];
for (const c of cues) {
  if (shotsIn[0]?.kind === 'hook' && !shotsIn[0].subtitles && c.start < hookEndV - 0.05) continue; // 钩子句以大字呈现，不重复出字幕
  const pieces = c.text.split(/(?<=[，。！？；、：,.!?;:])/).map(p => p.replace(/[，。；、：,.;:]$/, '').trim()).filter(Boolean);
  const lines = [];
  for (const p of pieces) {
    let s = p;
    // 按标点断句，每个分句一行；超过 16 字的再均分
    const n = Math.ceil([...s].length / 16), per = Math.ceil([...s].length / n);
    for (let k = 0; k < n; k++) lines.push([...s].slice(k * per, (k + 1) * per).join(''));
  }
  const total = lines.reduce((a, l) => a + [...l].length, 0) || 1, off = offsetAt(c.start);
  let t = c.start;
  for (const l of lines) { const d = (c.end - c.start) * [...l].length / total; subtitles.push({ start: t + off, end: t + d + off, text: l }); t += d; }
}

const timeline = {
  fps: FPS, vertical, duration, voiceEnd, shots, subtitles,
  seriesLine: `${episode.series || '一分钟历史'} · 第${episode.episode ?? 1}集`
};
fs.writeFileSync(path.join(epDir, vertical ? 'timeline_vertical.json' : 'timeline.json'), JSON.stringify(timeline, null, 1));
console.log(`配音 ${voiceDur.toFixed(2)}s + 插入 ${totalGap.toFixed(2)}s + 片尾 ${TAIL}s = ${duration.toFixed(2)}s`);
for (const s of shots) console.log(`  ${s.start.toFixed(2).padStart(6)}–${s.end.toFixed(2).padStart(6)}  ${s.kind.padEnd(5)} ${s.id}  ${(s.script || s.title || '').slice(0, 24)}`);

// ---------- 音频：在片名/停顿处插静音，末尾补片尾 ----------
const audioOut = path.join(epDir, '.audio_build.wav');
if (!preview) {
  const pts = gaps.slice().sort((a, b) => a.at - b.at);
  const ffArgs = ['-v', 'error', '-y', '-i', voiceFile];
  let fc = '', labels = [], prev = 0, k = 0;
  const seg = (a, b) => { fc += `[0:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=${a}:${b},asetpts=PTS-STARTPTS[v${k}];`; labels.push(`[v${k++}]`); };
  for (const g of pts) {
    if (g.at > prev) seg(prev, g.at);
    fc += `anullsrc=r=48000:cl=stereo,atrim=0:${g.dur}[z${k}];`; labels.push(`[z${k++}]`);
    prev = g.at;
  }
  seg(prev, voiceDur + 0.01);
  fc += `${labels.join('')}concat=n=${labels.length}:v=0:a=1,apad=pad_dur=${TAIL}[out]`;
  ffArgs.push('-filter_complex', fc, '-map', '[out]', '-t', duration.toFixed(3), audioOut);
  const r = spawnSync('ffmpeg', ffArgs, { stdio: 'inherit' });
  if (r.status !== 0) { console.error('音频合成失败'); process.exit(1); }
}

// ---------- 渲染 ----------
function loadPlaywright() {
  try { return createRequire(import.meta.url)('playwright'); } catch { }
  const g = execSync('npm root -g').toString().trim();
  return createRequire(path.join(g, 'noop.js'))('playwright');
}
const { chromium } = loadPlaywright();
const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('pageerror', e => console.error('页面错误:', e.message));
await page.goto('file://' + path.join(ROOT, 'renderer/index.html'));
await page.evaluate(async () => { await document.fonts.load('72px MSZ', '历史鸿门'); await document.fonts.load('600 44px NSerif', '历史鸿门'); });
await page.evaluate(tl => window.ENGINE.setup(tl), timeline);

const f0 = Math.floor(parseFloat(opt('--from', '0')) * FPS), f1 = Math.min(Math.ceil(duration * FPS), Math.ceil(parseFloat(opt('--to', String(duration))) * FPS));
const t0 = Date.now();
if (preview) {
  const dir = path.join(epDir, vertical ? 'preview_vertical' : 'preview'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir);
  for (let f = f0; f < f1; f += +preview) {
    const url = await page.evaluate(f => window.ENGINE.renderFrame(f), f);
    fs.writeFileSync(path.join(dir, `f_${String(f).padStart(5, '0')}.jpg`), Buffer.from(url.split(',')[1], 'base64'));
  }
  console.log(`预览帧已写入 ${dir}（${((Date.now() - t0) / 1000).toFixed(1)}s）`);
} else {
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-ss', (f0 / FPS).toFixed(3), '-i', audioOut, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', outFile], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise(r => ff.on('close', r));
  for (let f = f0; f < f1; f++) {
    const url = await page.evaluate(f => window.ENGINE.renderFrame(f), f);
    if (!ff.stdin.write(Buffer.from(url.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 150 === 0) process.stdout.write(`\r渲染 ${f}/${f1} 帧`);
  }
  ff.stdin.end(); const code = await done;
  console.log(`\n${code === 0 ? '完成' : '失败'}：${outFile}（${((Date.now() - t0) / 1000).toFixed(1)}s）`);
  fs.rmSync(audioOut, { force: true });
}
await browser.close();
