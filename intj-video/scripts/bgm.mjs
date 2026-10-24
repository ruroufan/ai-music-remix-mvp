// scripts/bgm.mjs — synthesise the film's score from data.json → assets/bgm.mp3
//
//   node scripts/bgm.mjs
//
// Nothing is sampled: every sound is made here. 120 BPM, so every cut (all the
// shot lengths are multiples of 0.5 s) lands on a beat. D minor, dark and
// cinematic, in the archive's black-white-red mood:
//   series   a boom on the downbeat, a braam when INTJ lands, a taiko pulse
//   hook     four-on-the-floor kick, 16th ticks, a driving low ostinato
//   title    an impact under the red block, a low drone
//   card     a reversed swell into a boom on the cut
//   line / quote   a clock-tick pulse, a low string ostinato in 8ths, a felt
//            piano figure; a bell on each key word; energy builds through
//            the film (shots 15–18 the highest)
//   end      piano and pad alone, fading out
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SR = 44100;
const BEAT = 0.5;
const S16 = BEAT / 4;

// ── tiny synth kit ─────────────────────────────────────────────────────────
let seed = 20261022;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const noise = () => rand() * 2 - 1;
const hz = (m) => 440 * 2 ** ((m - 69) / 12);
const buf = (sec) => [new Float32Array(Math.ceil(sec * SR)), new Float32Array(Math.ceil(sec * SR))];
const add = (out, t0, dur, fn, gl = 1, gr = 1) => {
  const s0 = Math.round(t0 * SR), n = Math.round(dur * SR);
  for (let i = 0; i < n; i++) {
    const j = s0 + i;
    if (j < 0 || j >= out[0].length) continue;
    const v = fn(i / SR);
    out[0][j] += v * gl;
    out[1][j] += v * gr;
  }
};
const biquad = () => {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return (x, type, f, q = 0.7) => {
    const w = (2 * Math.PI * Math.min(f, SR * 0.45)) / SR, a = Math.sin(w) / (2 * q), c = Math.cos(w);
    const [b0, b1, b2] = type === "lp" ? [(1 - c) / 2, 1 - c, (1 - c) / 2] : type === "hp" ? [(1 + c) / 2, -(1 + c), (1 + c) / 2] : [a, 0, -a];
    const y = (b0 * x + b1 * x1 + b2 * x2 + 2 * c * y1 - (1 - a) * y2) / (1 + a);
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
};
const saw = (ph) => 2 * (ph % 1) - 1;
const mix = (into, from, g = 1) => { for (let i = 0; i < into[0].length; i++) { into[0][i] += from[0][i] * g; into[1][i] += from[1][i] * g; } };
// a plain feedback-delay "room"
const room = ([L, R], ms, fb, wet) => {
  const d = Math.round((ms / 1000) * SR), dl = new Float32Array(L.length), dr = new Float32Array(R.length);
  for (let i = 0; i < L.length; i++) {
    const a = i >= d ? dl[i - d] : 0, b = i >= d ? dr[i - d] : 0;
    dl[i] = L[i] + b * fb; dr[i] = R[i] + a * fb;
    L[i] += a * wet; R[i] += b * wet;
  }
};

// instruments
const kick = (vel = 1, dist = 1.6) => (t) => Math.tanh((Math.sin(2 * Math.PI * (44 * t + (150 / 26) * (1 - Math.exp(-26 * t)))) * Math.exp(-t * 6) + Math.sin(2 * Math.PI * 2400 * t) * Math.exp(-t * 300) * 0.2) * dist) * vel * 0.8;
const boom = (vel = 1) => {
  const lp = biquad();
  return (t) => (Math.sin(2 * Math.PI * (30 * t + (60 / 6) * (1 - Math.exp(-6 * t)))) * Math.exp(-t * 1.6) + lp(noise(), "lp", 300) * Math.exp(-t * 5) * 0.6) * vel;
};
const tick = (vel = 1) => {
  const bp = biquad();
  return (t) => (bp(noise(), "bp", 3800, 5) * 2.5 + Math.sin(2 * Math.PI * 2300 * t) * 0.3) * Math.exp(-t * 110) * vel;
};
const hat = (vel = 1) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 8500) * Math.exp(-t * 70) * vel;
};
const snare = (vel = 1) => {
  const bp = biquad();
  return (t) => (Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t * 24) * 0.5 + bp(noise(), "bp", 2000, 0.5) * Math.exp(-t * 14)) * vel;
};
const taiko = (vel = 1) => (t) => (Math.sin(2 * Math.PI * (70 * t + 8 * (1 - Math.exp(-20 * t)))) * Math.exp(-t * 9) + noise() * Math.exp(-t * 60) * 0.3) * vel;
const piano = (f, vel = 1) => (t) => [1, 2.002, 3.006, 4.012, 5.02].reduce((a, r, i) => a + Math.sin(2 * Math.PI * f * r * t) * Math.exp(-t * (1.2 + i * 1.3)) / (1 + i * 1.5), 0) * Math.min(1, t / 0.006) * vel;
const bell = (f, vel = 1) => (t) => [1, 2.76, 5.4, 8.93].reduce((a, r, i) => a + Math.sin(2 * Math.PI * f * r * t) * Math.exp(-t * (1.1 + i * 1.8)) / (i + 1), 0) * Math.min(1, t / 0.002) * vel;
const braam = (root, dur, vel = 1) => {
  const lp = biquad(), lp2 = biquad();
  const ph = [0, 0.3, 0.6, 0.1, 0.45];
  const ms = [root - 12, root - 11.9, root, root + 0.1, root + 7];
  return (t) => {
    let s = 0;
    ms.forEach((m, i) => { ph[i] += hz(m) / SR; s += saw(ph[i]); });
    const c = 200 + 1600 * Math.exp(-t * 1.4);
    return Math.tanh(lp2(lp(s, "lp", c, 1.2), "lp", c, 0.7) * 1.4) * Math.min(1, t / 0.02) * Math.min(1, (dur - t) / 0.6) * vel;
  };
};
const string = (m, dur, cut, vel = 1) => {
  const lp = biquad();
  let p1 = rand(), p2 = rand();
  return (t) => {
    p1 += hz(m - 0.06) / SR; p2 += hz(m + 0.06) / SR;
    return lp(saw(p1) + saw(p2), "lp", cut, 0.9) * Math.min(1, t / 0.015) * Math.min(1, Math.max(0, (dur - t) / 0.04)) * vel;
  };
};
const swell = (dur, vel = 1) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 600 + 7000 * (t / dur) ** 2) * (t / dur) ** 2.4 * vel;
};

// D minor: the chords cycle every 2 bars
const PROG = [[50, 53, 57], [46, 50, 53], [48, 52, 55], [45, 49, 52]]; // Dm Bb C A
const chordAt = (t) => PROG[Math.floor(t / (BEAT * 8)) % PROG.length];
const ENERGY = { series: 3, hook: 3, title: 2, card: 2, end: 0 };
const lineEnergy = (id) => (id <= 5 ? 1 : id <= 13 ? 2 : id <= 18 ? 3 : 2);

// key-word bell: roughly when the key lands on screen (see src/main.js)
const keyTime = (s) => {
  if (!s.key) return null;
  if (s.b && s.b.includes(s.key)) return 1.4 + [...s.b.slice(0, s.b.indexOf(s.key))].length * 0.06 + (s.decode ? [...s.b].length * 0.06 + 0.25 : 0);
  if (s.a && s.a.includes(s.key)) return 0.4;
  return null;
};

// ── the score ───────────────────────────────────────────────────────────────
const data = JSON.parse(await readFile(join(ROOT, "data.json"), "utf8"));
let t0 = 0;
const shots = data.shots.map((s) => { const r = { ...s, start: t0, end: t0 + s.dur }; t0 += s.dur; return r; });
const LEN = t0;
const drums = buf(LEN + 3), bass = buf(LEN + 3), strings = buf(LEN + 3), keys = buf(LEN + 3), fx = buf(LEN + 3);

for (const s of shots) {
  const e = s.type === "line" || s.type === "quote" ? lineEnergy(s.id) : ENERGY[s.type] ?? 1;
  const beats = Math.round(s.dur / BEAT);
  for (let k = 0; k < beats; k++) {
    const t = s.start + k * BEAT;
    const ch = chordAt(t);
    const root = ch[0] - 24;
    if (s.type === "series" || s.type === "hook") {
      add(drums, t, 0.5, kick(1, 2.2));
      for (let i = 0; i < 4; i++) add(drums, t + i * S16, 0.05, hat(i === 2 ? 0.35 : 0.18), 0.45, 0.6);
      if (k % 2 === 1) add(drums, t, 0.4, snare(0.55), 0.5, 0.5);
      for (let i = 0; i < 4; i++) add(bass, t + i * S16, S16 * 0.9, string(root + (i === 3 ? 12 : 0), S16 * 0.9, 900, 0.5));
      if (s.type === "series" && k % 2 === 0) add(drums, t + S16 * 3, 0.4, taiko(0.6));
    } else if (s.type === "title") {
      if (k === 0) add(fx, t, 4, boom(1));
      if (k % 2 === 0) add(drums, t, 0.4, taiko(0.5));
      add(bass, t, BEAT, string(root, BEAT, 300, 0.6));
    } else if (s.type === "card") {
      add(drums, t, 0.4, kick(0.9, 2));
      for (let i = 0; i < 4; i++) add(drums, t + i * S16, 0.04, tick(0.35), 0.4, 0.7);
      add(bass, t, BEAT, string(root, BEAT, 400, 0.5));
    } else if (s.type === "end") {
      if (k % 4 === 0 && k < beats - 4) {
        add(keys, t, 4, piano(hz(ch[0]), 0.5), 0.55, 0.55);
        add(keys, t + BEAT, 3, piano(hz(ch[1] + 12), 0.3), 0.45, 0.65);
        add(keys, t + 2 * BEAT, 3, piano(hz(ch[2] + 12), 0.28), 0.65, 0.45);
      }
    } else {
      // line / quote: the pulse
      add(drums, t, 0.4, kick(e >= 2 ? 0.8 : 0.55, e >= 3 ? 2 : 1.4));
      if (e >= 2 && k % 2 === 1) add(drums, t + S16 * 2, 0.4, kick(0.5, 1.4));
      for (let i = 0; i < 4; i += e >= 2 ? 1 : 2) add(drums, t + i * S16, 0.04, tick(i % 2 ? 0.2 : 0.35), 0.4, 0.7);
      if (e >= 3 && k % 2 === 1) add(drums, t, 0.4, snare(0.4), 0.5, 0.5);
      // low strings, 8ths
      for (let i = 0; i < 2; i++) add(bass, t + i * BEAT / 2, BEAT / 2 * 0.92, string(root + (i ? 7 : 0), (BEAT / 2) * 0.92, 380 + 260 * e, 0.45));
      if (e >= 3) add(strings, t, BEAT, string(ch[2] + 12, BEAT, 1800, 0.12), 0.4, 0.6);
      // piano figure: one note every two beats
      if (k % 2 === 0) add(keys, t, 2.5, piano(hz(ch[(k / 2) % 3] + 12), 0.3), 0.5, 0.6);
    }
  }
  // per-shot accents
  if (s.type === "series") {
    add(fx, s.start, 4, boom(1.1));
    add(fx, s.start + 1.0, 0.6, taiko(0.8));
    add(fx, s.start + 2.0, 2, braam(50, 2, 0.5));
    add(fx, s.start + 2.0, 3, boom(0.9));
  }
  if (s.type === "hook") s.lines.forEach((_, i) => add(fx, s.start + 0.15 + i * 0.85, 0.5, taiko(0.7)));
  if (s.type === "title") add(fx, s.start + 0.7, 2.5, braam(50, 2.5, 0.45));
  if (s.type === "card") {
    add(fx, s.start - 1.0, 1.0, swell(1.0, 0.5), 0.8, 1);
    add(fx, s.start, 3, boom(0.9));
    add(fx, s.start, 2, bell(hz(74), 0.18), 0.5, 0.6);
  }
  const kt = keyTime(s);
  if (kt !== null) add(fx, s.start + kt, 3, bell(hz(chordAt(s.start + kt)[0] + 24), 0.22), 0.6, 0.5);
  if (s.decode) for (let i = 0; i < 10; i++) add(fx, s.start + 1.4 + i * 0.11, 0.05, (t) => Math.sign(Math.sin(2 * Math.PI * (1200 + 300 * (i % 4)) * t)) * Math.exp(-t * 60) * 0.08, 0.5, 0.5);
}
// a soft pad under everything, the chord of the moment
{
  const lp = biquad(), lp2 = biquad();
  const ph = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < Math.round(LEN * SR); i++) {
    const t = i / SR;
    const ch = chordAt(t);
    let l = 0, r = 0;
    ch.forEach((m, k) => { ph[k] += hz(m) / SR; ph[k + 3] += hz(m + 0.08) / SR; l += saw(ph[k]); r += saw(ph[k + 3]); });
    const g = 0.035;
    strings[0][i] += lp(l, "lp", 700) * g;
    strings[1][i] += lp2(r, "lp", 700) * g;
  }
}
room(keys, 375, 0.35, 0.3);
room(fx, 260, 0.3, 0.25);
room(strings, 190, 0.25, 0.2);

const out = buf(LEN + 3);
mix(out, drums, 0.9);
mix(out, bass, 0.5);
mix(out, strings, 1);
mix(out, keys, 1.2);
mix(out, fx, 0.7);
// fade the tail with the end shot, soft-clip, normalise to −1 dBFS
const endShot = shots[shots.length - 1];
let peak = 0;
for (let i = 0; i < out[0].length; i++) {
  const t = i / SR;
  const g = t < endShot.start + 1 ? 1 : Math.max(0, 1 - (t - endShot.start - 1) / (LEN - endShot.start - 1));
  out[0][i] = Math.tanh(out[0][i] * 1.1) * g;
  out[1][i] = Math.tanh(out[1][i] * 1.1) * g;
  peak = Math.max(peak, Math.abs(out[0][i]), Math.abs(out[1][i]));
}
// peak at −4.6 dBFS: the mix then sits around −14.5 LUFS (a sensible level for
// short-video platforms) with headroom left for the AAC encoder
const gain = 10 ** (-4.6 / 20) / (peak || 1);
const n = Math.round(LEN * SR);
const wav = Buffer.alloc(44 + n * 4);
wav.write("RIFF", 0); wav.writeUInt32LE(36 + n * 4, 4); wav.write("WAVE", 8); wav.write("fmt ", 12);
wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(2, 22); wav.writeUInt32LE(SR, 24); wav.writeUInt32LE(SR * 4, 28); wav.writeUInt16LE(4, 32); wav.writeUInt16LE(16, 34);
wav.write("data", 36); wav.writeUInt32LE(n * 4, 40);
for (let i = 0; i < n; i++) {
  wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, out[0][i] * gain)) * 32767), 44 + i * 4);
  wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, out[1][i] * gain)) * 32767), 46 + i * 4);
}
await mkdir(join(ROOT, "out"), { recursive: true });
const wavPath = join(ROOT, "out", "bgm.wav");
await writeFile(wavPath, wav);
const mp3 = join(ROOT, "assets", "bgm.mp3");
await new Promise((res, rej) => spawn("ffmpeg", ["-y", "-loglevel", "error", "-i", wavPath, "-c:a", "libmp3lame", "-b:a", "256k", mp3], { stdio: "inherit" }).on("close", (c) => (c ? rej(new Error("ffmpeg")) : res())));
console.log(`assets/bgm.mp3: ${LEN.toFixed(1)} s, ${shots.length} shots`);
