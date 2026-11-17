#!/usr/bin/env node
// 逐帧渲染：Playwright(Chromium) 画布 -> JPEG 帧 -> ffmpeg(H.264)
// 用法:
//   node tools/render.mjs ep01 --out build/ep01/seg0.mp4 [--from 0 --to 300]
//   node tools/render.mjs ep01 --stills 1.5,4,8 --sheet build/ep01/sheet.jpg [--h 640]
//   node tools/render.mjs ep01 --scene box --t 1,2 --dur 5 --p '{"lamp":0.4}' --sheet x.jpg
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let chromium; try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2); const ep = args[0];
const opt = k => { const i = args.indexOf('--' + k); return i < 0 ? null : args[i + 1]; };
const tl = JSON.parse(fs.readFileSync(path.join(ROOT, 'build', ep, 'timeline.json'), 'utf8'));
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png' };
const srv = http.createServer((q, r) => {
  const f = path.join(ROOT, 'web', decodeURIComponent(q.url.split('?')[0]).replace(/\.\./g, ''));
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': mime[path.extname(f)] || 'application/octet-stream' }); r.end(b); } });
});
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ args: ['--disable-web-security', '--font-render-hinting=none'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.error('[page]', m.text()); });
page.on('pageerror', e => console.error('[pageerror]', e.message));
await page.goto(`http://127.0.0.1:${srv.address().port}/index.html`);
await page.waitForFunction(() => !!window.setup);
await page.evaluate(t => window.setup(t), tl);
const ff = (a, stdin) => new Promise((res, rej) => { const p = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...a], { stdio: [stdin ? 'pipe' : 'ignore', 'inherit', 'inherit'] }); p.on('close', c => c ? rej(new Error('ffmpeg ' + c)) : res()); if (stdin) stdin(p.stdin); });

if (opt('stills') || opt('scene')) {
  const tmp = fs.mkdtempSync(path.join(ROOT, 'build', 'st-')); const files = []; const h = +(opt('h') || 640);
  const ts = (opt('stills') || opt('t')).split(',').map(Number);
  for (const [i, t] of ts.entries()) {
    const b64 = opt('scene') ? await page.evaluate(([s, t, d, p]) => window.sceneStill(s, t, d, p), [opt('scene'), t, +(opt('dur') || 6), JSON.parse(opt('p') || '{}')]) : await page.evaluate(t => window.stillPNG(t), t);
    const f = path.join(tmp, `s${String(i).padStart(3, '0')}.png`); fs.writeFileSync(f, Buffer.from(b64, 'base64')); files.push(f);
  }
  const cols = +(opt('cols') || Math.min(ts.length, 6)), rows = Math.ceil(ts.length / cols);
  await ff(['-framerate', '1', '-i', path.join(tmp, 's%03d.png'), '-vf', `scale=-2:${h},tile=${cols}x${rows}:padding=6:color=0x202020`, '-frames:v', '1', '-q:v', '3', opt('sheet')]);
  if (opt('keep')) console.log(tmp); else fs.rmSync(tmp, { recursive: true });
} else {
  const from = +(opt('from') || 0), to = +(opt('to') || tl.frames); const t0 = Date.now();
  await ff(['-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(tl.fps), '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', opt('crf') || '14',
    '-pix_fmt', 'yuv420p', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-movflags', '+faststart', opt('out')], async (stdin) => {
    for (let f = from; f < to; f++) {
      const b64 = await page.evaluate(f => window.frameJPEG(f, .96), f);
      if (!stdin.write(Buffer.from(b64, 'base64'))) await new Promise(r => stdin.once('drain', r));
      if ((f - from) % 150 === 0) console.error(`[${opt('out')}] frame ${f}/${to}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    stdin.end();
  });
}
await browser.close(); srv.close();
