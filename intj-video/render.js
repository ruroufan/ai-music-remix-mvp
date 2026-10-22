// render.js — deterministic frame-by-frame renderer for 《INTJ · 正确》.
//
//   node render.js                                  whole film → out/INTJ_正确.mp4
//   node render.js --from 0 --to 30 --out preview.mp4
//   node render.js --stills                         check frames → out/stills/*.png
//
// A tiny static server serves the project; Playwright (Chromium) opens
// src/index.html, waits for the fonts and images, then for every frame calls
// window.seekTo(t) and pipes a PNG screenshot into ffmpeg (1920×1080, 30 fps,
// H.264, yuv420p, CRF 18). If assets/bgm.mp3 exists it is mixed in, faded out
// over the last 2 s and cut to the video's length.
import { createServer } from "node:http";
import { readFile, mkdir, access } from "node:fs/promises";
import { spawn } from "node:child_process";
import { extname, join, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "out");
const FPS = 30;

// ── args ──────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const arg = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
const STILLS = argv.includes("--stills");
const exists = (p) => access(p).then(() => true, () => false);

// ── static server ─────────────────────────────────────────────────────────
const MIME = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".woff2": "font/woff2", ".woff": "font/woff", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml" };
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  const file = join(ROOT, path);
  if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": MIME[extname(file).toLowerCase()] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const PORT = server.address().port;

// ── browser ───────────────────────────────────────────────────────────────
const CANDIDATES = [process.env.CHROME_PATH, "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell"].filter(Boolean);
let executablePath;
for (const c of CANDIDATES) if (await exists(c)) { executablePath = c; break; }
const browser = await chromium.launch({ executablePath, args: ["--font-render-hinting=none", "--disable-gpu", "--hide-scrollbars"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on("pageerror", (e) => console.error("[page]", e.message));
await page.goto(`http://127.0.0.1:${PORT}/src/index.html`);
await page.waitForFunction(() => window.__ready === true || window.__error, null, { timeout: 120000 });
const err = await page.evaluate(() => window.__error);
if (err) { console.error(err); process.exit(1); }
const info = await page.evaluate(() => ({ duration: window.__duration, shots: window.__shots, missing: window.__missing, fonts: window.__fonts }));

console.log(`film: ${info.duration.toFixed(2)} s, ${info.shots.length} shots`);
console.log(`fonts loaded: ${Object.entries(info.fonts).map(([k, v]) => `${k}=${v ? "yes" : "NO"}`).join(", ")}`);
if (info.missing.length) {
  console.log(`missing images (${info.missing.length}) — using the black + outline-word fallback:`);
  for (const m of info.missing) {
    const uses = info.shots.length;
    void uses;
    console.log(`  · assets/img/${m}`);
  }
}
if (Object.values(info.fonts).some((v) => !v)) { console.error("a font failed to load — stopping"); process.exit(1); }

const seek = (t) => page.evaluate((s) => window.seekTo(s), t);
const shoot = () => page.screenshot({ type: "png", clip: { x: 0, y: 0, width: 1920, height: 1080 } });

// ── stills ────────────────────────────────────────────────────────────────
if (STILLS) {
  await mkdir(join(OUT, "stills"), { recursive: true });
  const marks = [
    { t: 2.0, name: "t02.0" },
    { t: 5.5, name: "t05.5" },
  ];
  for (const id of [3, 7, 15, 20, 22]) {
    const s = info.shots.find((x) => x.id === id);
    marks.push({ t: s.start + 1.0, name: `shot${String(id).padStart(2, "0")}_a_+1.0` });
    marks.push({ t: s.start + 3.5, name: `shot${String(id).padStart(2, "0")}_b_+3.5` });
    marks.push({ t: s.end - 0.2, name: `shot${String(id).padStart(2, "0")}_c_end-0.2` });
  }
  marks.sort((a, b) => a.t - b.t);
  for (const m of marks) {
    const frame = Math.round(m.t * FPS);
    await seek(frame / FPS);
    const buf = await shoot();
    await (await import("node:fs/promises")).writeFile(join(OUT, "stills", `${m.name}.png`), buf);
    console.log(`still ${m.name}.png  (t=${(frame / FPS).toFixed(2)} s)`);
  }
  // determinism: render one frame, go elsewhere, come back, compare
  const { createHash } = await import("node:crypto");
  const probe = Math.round((info.shots.find((x) => x.id === 15).start + 2.6) * FPS) / FPS;
  await seek(probe);
  const h1 = createHash("md5").update(await shoot()).digest("hex");
  await seek(10);
  await seek(probe);
  const h2 = createHash("md5").update(await shoot()).digest("hex");
  console.log(`determinism check at t=${probe.toFixed(2)} s: ${h1 === h2 ? "identical" : "DIFFERENT"} (${h1})`);
  await browser.close();
  server.close();
  process.exit(0);
}

// ── video ─────────────────────────────────────────────────────────────────
const from = Math.max(0, parseFloat(arg("from") ?? "0"));
const to = Math.min(info.duration, parseFloat(arg("to") ?? String(info.duration)));
const outName = arg("out") ?? "INTJ_正确.mp4";
const outPath = join(OUT, outName);
await mkdir(OUT, { recursive: true });
const frames = Math.round((to - from) * FPS);
const length = frames / FPS;
const bgm = join(ROOT, "assets", "bgm.mp3");
const hasBgm = await exists(bgm);

const ff = ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "png", "-i", "-"];
if (hasBgm) {
  ff.push("-ss", String(from), "-i", bgm);
  ff.push("-filter_complex", `[1:a]atrim=0:${length},afade=t=out:st=${Math.max(0, length - 2)}:d=2,asetpts=PTS-STARTPTS[a]`, "-map", "0:v", "-map", "[a]", "-c:a", "aac", "-b:a", "192k");
}
ff.push("-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(FPS), "-movflags", "+faststart", "-t", String(length), outPath);
const ffmpeg = spawn("ffmpeg", ff, { stdio: ["pipe", "inherit", "inherit"] });
const done = new Promise((res, rej) => ffmpeg.on("close", (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`)))));

console.log(`rendering ${from}–${to} s (${frames} frames) → out/${outName}${hasBgm ? " + bgm" : " (no assets/bgm.mp3, silent)"}`);
const t0 = Date.now();
for (let i = 0; i < frames; i++) {
  await seek(from + i / FPS);
  const buf = await shoot();
  if (!ffmpeg.stdin.write(buf)) await new Promise((r) => ffmpeg.stdin.once("drain", r));
  if (i % 150 === 0) console.log(`  frame ${i}/${frames}  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
ffmpeg.stdin.end();
await done;
console.log(`done: out/${outName} in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
await browser.close();
server.close();
