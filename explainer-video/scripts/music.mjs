// Synthesises the background score and sound effects from scratch, so the
// template ships with no third-party audio. Run after `npm run voiceover`
// (the score follows the scene timings): `npm run music`.
//
//   public/music/bgm.wav  — dark ambient bed: slow pad chords that change with
//                           each scene, a soft heartbeat pulse, sparse piano notes
//   public/sfx/*.wav      — one-shots placed by the scenes (see components/Sfx.tsx)

import { mkdirSync, writeFileSync } from "node:fs";
import { script } from "../src/script.ts";
import { sceneFrames, totalFrames } from "../src/timeline.ts";
import { FPS } from "../src/theme.ts";

const SR = 44100;
const root = new URL("../public/", import.meta.url);

// ---------- helpers ----------

let seed = 7;
const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const noise = () => rand() * 2 - 1;
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

const buffer = (seconds) => [new Float32Array(Math.ceil(seconds * SR)), new Float32Array(Math.ceil(seconds * SR))];

// RBJ biquad, coefficients recomputed per call so the cutoff can sweep.
const biquad = () => {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return (x, type, f, q = 0.7) => {
    const w = (2 * Math.PI * Math.min(f, SR * 0.45)) / SR;
    const a = Math.sin(w) / (2 * q), c = Math.cos(w);
    let b0, b1, b2;
    if (type === "lp") [b0, b1, b2] = [(1 - c) / 2, 1 - c, (1 - c) / 2];
    else if (type === "hp") [b0, b1, b2] = [(1 + c) / 2, -(1 + c), (1 + c) / 2];
    else [b0, b1, b2] = [a, 0, -a]; // band-pass
    const a0 = 1 + a, a1 = -2 * c, a2 = 1 - a;
    const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
};

// Ping-pong feedback delay — cheap space for the piano and effects.
const echo = ([L, R], ms, feedback) => {
  const d = Math.round((ms / 1000) * SR);
  for (let i = d; i < L.length; i++) {
    L[i] += R[i - d] * feedback;
    R[i] += L[i - d] * feedback;
  }
};

const normalize = ([L, R], peakDb = -1) => {
  let peak = 0;
  for (let i = 0; i < L.length; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const g = peak ? 10 ** (peakDb / 20) / peak : 1;
  for (let i = 0; i < L.length; i++) { L[i] *= g; R[i] *= g; }
};

const writeWav = (path, [L, R]) => {
  const n = L.length, data = Buffer.alloc(44 + n * 4);
  data.write("RIFF", 0); data.writeUInt32LE(36 + n * 4, 4); data.write("WAVE", 8);
  data.write("fmt ", 12); data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(2, 22);
  data.writeUInt32LE(SR, 24); data.writeUInt32LE(SR * 4, 28); data.writeUInt16LE(4, 32); data.writeUInt16LE(16, 34);
  data.write("data", 36); data.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), 44 + i * 4);
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), 46 + i * 4);
  }
  writeFileSync(path, data);
  console.log(`wrote ${path.pathname ?? path} (${(n / SR).toFixed(1)}s)`);
};

// A piano-ish tone: a few decaying harmonics with a soft attack.
const pianoNote = (out, t0, midi, gain, pan) => {
  const f = hz(midi), start = Math.round(t0 * SR), len = Math.round(4 * SR);
  for (let i = 0; i < len && start + i < out[0].length; i++) {
    const t = i / SR;
    const env = Math.min(1, t / 0.006) * Math.exp(-t * 1.6);
    let s = 0;
    for (let h = 1; h <= 5; h++) s += Math.sin(2 * Math.PI * f * h * t * (1 + 0.0004 * h * h)) * Math.exp(-t * h * 0.9) / h ** 1.6;
    s *= env * gain;
    out[0][start + i] += s * (1 - pan);
    out[1][start + i] += s * pan;
  }
};

// ---------- background score ----------

const sceneStarts = [];
{
  let t = 0;
  for (const s of script) { sceneStarts.push(t / FPS); t += sceneFrames(s); }
}
const length = totalFrames / FPS + 2;

// Pad chords (MIDI notes).
const CHORD_NOTES = {
  Dm: [38, 45, 50, 53, 57],
  Bb: [34, 41, 46, 50, 53],
  Gm: [31, 38, 43, 46, 50],
  A: [33, 40, 45, 49, 52],
  F: [29, 41, 45, 48, 53],
  D: [38, 45, 50, 54, 57], // D major: the resolution at the very end
};
const CHORDS = Object.values(CHORD_NOTES);
const chordIndex = Object.fromEntries(Object.keys(CHORD_NOTES).map((k, i) => [k, i]));

// Each scene's harmony and whether the heartbeat runs. Tension builds through
// the "need others" section and releases into D major for the ending. Scenes
// not listed cycle through the minor chords with the heartbeat on.
const MOODS = {
  title: { chord: "Dm", beat: false },
  diagnosis: { chord: "Bb", beat: false },
  misconception: { chord: "Gm", beat: true },
  social: { chord: "A", beat: true },
  twoLoves: { chord: "F", beat: false },
  podium: { chord: "Gm", beat: true },
  scores: { chord: "Dm", beat: true },
  rebuttal: { chord: "Bb", beat: true },
  question: { chord: "A", beat: false },
  cup: { chord: "Gm", beat: true },
  rank: { chord: "A", beat: true },
  audience: { chord: "F", beat: false },
  standFirm: { chord: "D", beat: false },
};
const FALLBACK = ["Dm", "Bb", "Gm", "A"];
const moodAt = (t) => {
  let k = 0;
  sceneStarts.forEach((s, i) => { if (t >= s) k = i; });
  return MOODS[script[k].id] ?? { chord: FALLBACK[k % FALLBACK.length], beat: true };
};

// One cycle of the pad's saw-ish waveform (6 harmonics), looked up by phase.
const TABLE_SIZE = 4096;
const WAVE = Float32Array.from({ length: TABLE_SIZE + 1 }, (_, i) => {
  let s = 0;
  for (let h = 1; h <= 6; h++) s += Math.sin((2 * Math.PI * h * i) / TABLE_SIZE) / h ** 1.4;
  return s;
});

const bgm = buffer(length);
{
  const [L, R] = bgm;
  const lpL = biquad(), lpR = biquad();
  const phases = new Float64Array(64);
  const blend = CHORDS.map((_, i) => (i === 0 ? 1 : 0));
  let target = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    if (i % 1024 === 0) target = chordIndex[moodAt(t).chord];
    // Crossfade chords over ~1.5 s when the scene changes.
    for (let k = 0; k < blend.length; k++) blend[k] += ((k === target ? 1 : 0) - blend[k]) / (0.5 * SR);
    let l = 0, r = 0, p = 0;
    CHORDS.forEach((chord, k) => {
      if (blend[k] < 1e-4) { p += chord.length * 2; return; }
      chord.forEach((n, j) => {
        for (const det of [-0.11, 0.11]) {
          // Saw-ish wavetable, detuned pairs panned apart.
          phases[p] = (phases[p] + hz(n + det) / SR) % 1;
          let s = WAVE[(phases[p] * TABLE_SIZE) | 0];
          s *= blend[k] * (j === 0 ? 1.4 : 0.6);
          if (det < 0) l += s; else r += s;
          p++;
        }
      });
    });
    // Slow breathing filter keeps the pad moving.
    const cutoff = 520 + 260 * Math.sin(t * 0.35) + 120 * Math.sin(t * 0.13);
    L[i] = lpL(l, "lp", cutoff) * 0.08;
    R[i] = lpR(r, "lp", cutoff) * 0.08;
  }

  // Heartbeat: a soft double thump, in the scenes whose mood asks for it.
  for (let t0 = 0.5; t0 < length - 2; t0 += 1.25) {
    if (!moodAt(t0).beat) continue;
    for (const [off, g] of [[0, 1], [0.24, 0.6]]) {
      const s0 = Math.round((t0 + off) * SR);
      for (let i = 0; i < 0.35 * SR && s0 + i < L.length; i++) {
        const t = i / SR;
        const v = Math.sin(2 * Math.PI * (48 + 30 * Math.exp(-t * 30)) * t) * Math.exp(-t * 14) * 0.32 * g;
        L[s0 + i] += v; R[s0 + i] += v;
      }
    }
  }

  // Sparse high piano notes from the D minor scale, through the echo.
  const keys = bgm.map((ch) => new Float32Array(ch.length));
  const SCALE = [74, 77, 81, 76, 72, 79, 74, 69];
  let k = 0;
  for (let t0 = 1.2; t0 < length - 3; t0 += 2.6 + rand() * 1.6) {
    pianoNote(keys, t0, SCALE[k++ % SCALE.length], 0.09, 0.3 + rand() * 0.4);
  }
  echo(keys, 380, 0.42);
  for (let i = 0; i < L.length; i++) { L[i] += keys[0][i]; R[i] += keys[1][i]; }

  // Fade the tail.
  const fade = Math.round(1.5 * SR);
  for (let i = 0; i < fade; i++) {
    const g = i / fade;
    L[L.length - 1 - i] *= g; R[R.length - 1 - i] *= g;
  }
  normalize(bgm, -1);
}

// ---------- sound effects ----------

const sfx = {};

// Low impact: pitch-dropping sine plus a muffled noise hit.
sfx.boom = (() => {
  const out = buffer(2.5), lp = biquad();
  for (let i = 0; i < out[0].length; i++) {
    const t = i / SR;
    const sub = Math.sin(2 * Math.PI * (32 * t + (40 / 3) * (1 - Math.exp(-t * 3)))) * Math.exp(-t * 2.2);
    const hit = lp(noise(), "lp", 900 * Math.exp(-t * 6) + 80) * Math.exp(-t * 9) * 2;
    out[0][i] = out[1][i] = sub + hit;
  }
  echo(out, 140, 0.25);
  normalize(out, -1);
  return out;
})();

// Breaking glass/stone: a crack, then dozens of tiny high "tinks" scattering.
sfx.shatter = (() => {
  const out = buffer(2.2), hp = biquad();
  for (let i = 0; i < 0.25 * SR; i++) {
    const t = i / SR;
    const v = hp(noise(), "hp", 1800) * Math.exp(-t * 22);
    out[0][i] += v; out[1][i] += v;
  }
  for (let n = 0; n < 40; n++) {
    const t0 = Math.pow(rand(), 1.8) * 0.9, f = 2200 + rand() * 5000, pan = rand();
    const s0 = Math.round(t0 * SR);
    for (let i = 0; i < 0.18 * SR; i++) {
      const t = i / SR;
      const v = Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 30) * 0.25;
      out[0][s0 + i] += v * (1 - pan); out[1][s0 + i] += v * pan;
    }
  }
  echo(out, 220, 0.3);
  normalize(out, -2);
  return out;
})();

// Tension riser: noise through a rising band-pass, with a rising tone underneath.
sfx.rise = (() => {
  const dur = 1.6, out = buffer(dur + 0.8), bpL = biquad(), bpR = biquad();
  let ph = 0;
  for (let i = 0; i < dur * SR; i++) {
    const t = i / SR, k = t / dur;
    const env = k * k * (1 - Math.max(0, (k - 0.93) / 0.07));
    const f = 300 + 3500 * k * k;
    ph += (2 * Math.PI * (70 + 150 * k)) / SR;
    const tone = Math.sin(ph) * 0.5;
    out[0][i] = (bpL(noise(), "bp", f, 4) * 3 + tone) * env;
    out[1][i] = (bpR(noise(), "bp", f * 1.05, 4) * 3 + tone) * env;
  }
  normalize(out, -2);
  return out;
})();

// Air movement for scene changes.
sfx.whoosh = (() => {
  const dur = 1.1, out = buffer(dur), bpL = biquad(), bpR = biquad();
  for (let i = 0; i < out[0].length; i++) {
    const t = i / SR, k = t / dur;
    const env = Math.sin(Math.PI * Math.pow(k, 0.7)) ** 2;
    const f = 250 + 750 * Math.sin(Math.PI * k);
    out[0][i] = bpL(noise(), "bp", f, 1.5) * env * (1 - k * 0.6);
    out[1][i] = bpR(noise(), "bp", f, 1.5) * env * (0.4 + k * 0.6);
  }
  normalize(out, -3);
  return out;
})();

// A single glassy bell — mirrors appearing, small reveals.
sfx.glint = (() => {
  const out = buffer(2);
  pianoNote(out, 0, 93, 0.6, 0.5);
  pianoNote(out, 0, 100, 0.25, 0.5);
  echo(out, 260, 0.35);
  normalize(out, -4);
  return out;
})();

// ---------- write ----------

mkdirSync(new URL("music/", root), { recursive: true });
mkdirSync(new URL("sfx/", root), { recursive: true });
writeWav(new URL("music/bgm.wav", root), bgm);
for (const [name, buf] of Object.entries(sfx)) writeWav(new URL(`sfx/${name}.wav`, root), buf);
