// Synthesises the background score and sound effects from scratch, so the
// template ships with no third-party audio. The score follows the scene
// timings, so it is regenerated before every studio/render: `npm run music`.
//
//   public/music/bgm.wav  — dark score on the video's 72 BPM grid: pad chords that
//                           change on each scene's downbeat, a high drone, sub
//                           bass, a kick/tick pulse in the tense scenes, a piano
//                           arpeggio and a riser into every cut
//   public/sfx/*.wav      — one-shots placed by the scenes (see components/Sfx.tsx)

import { mkdirSync, writeFileSync } from "node:fs";
import { script } from "../src/script.ts";
import { BPM, sceneFrames, totalFrames } from "../src/timeline.ts";
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
//
// Everything is placed on the same 72 BPM grid the video uses (timeline.ts), so
// scene cuts, subtitle changes and sound effects all land on the music.

const BEAT_S = 60 / BPM;
const BAR_S = BEAT_S * 4;
const sceneStarts = [];
{
  let t = 0;
  for (const s of script) { sceneStarts.push(t / FPS); t += sceneFrames(s); }
}
const songEnd = totalFrames / FPS;
const length = songEnd + 3;

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

// Each scene's harmony and whether the rhythm section plays. Tension builds
// through the "need others" section and releases into D major for the ending.
// Scenes not listed cycle through the minor chords with the pulse on.
const MOODS = {
  title: { chord: "Dm", pulse: false },
  diagnosis: { chord: "Bb", pulse: false },
  misconception: { chord: "Gm", pulse: true },
  social: { chord: "A", pulse: true },
  twoLoves: { chord: "F", pulse: false },
  podium: { chord: "Gm", pulse: true },
  scores: { chord: "Dm", pulse: true },
  rebuttal: { chord: "Bb", pulse: true },
  question: { chord: "A", pulse: false },
  cup: { chord: "Gm", pulse: true },
  rank: { chord: "A", pulse: true },
  audience: { chord: "F", pulse: false },
  standFirm: { chord: "D", pulse: false },
};
const FALLBACK = ["Dm", "Bb", "Gm", "A"];
const sceneAt = (t) => {
  let k = 0;
  sceneStarts.forEach((s, i) => { if (t >= s - 1e-6) k = i; });
  return k;
};
const moodAt = (t) => {
  const k = sceneAt(t);
  return MOODS[script[k].id] ?? { chord: FALLBACK[k % FALLBACK.length], pulse: true };
};

// One cycle of the pad's saw-ish waveform (6 harmonics), looked up by phase.
const TABLE_SIZE = 4096;
const WAVE = Float32Array.from({ length: TABLE_SIZE + 1 }, (_, i) => {
  let s = 0;
  for (let h = 1; h <= 6; h++) s += Math.sin((2 * Math.PI * h * i) / TABLE_SIZE) / h ** 1.4;
  return s;
});

const addMono = (out, t0, dur, fn) => {
  const s0 = Math.round(t0 * SR);
  for (let i = 0; i < dur * SR && s0 + i < out[0].length; i++) {
    const v = fn(i / SR);
    out[0][s0 + i] += v;
    out[1][s0 + i] += v;
  }
};

const bgm = buffer(length);
{
  const [L, R] = bgm;

  // 1. Pad: chords crossfade quickly at each scene's downbeat.
  const lpL = biquad(), lpR = biquad();
  const phases = new Float64Array(64);
  const blend = CHORDS.map((_, i) => (i === chordIndex[moodAt(0).chord] ? 1 : 0));
  let target = 0;
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    if (i % 512 === 0) target = chordIndex[moodAt(t).chord];
    for (let k = 0; k < blend.length; k++) blend[k] += ((k === target ? 1 : 0) - blend[k]) / (0.12 * SR);
    let l = 0, r = 0, p = 0;
    CHORDS.forEach((chord, k) => {
      if (blend[k] < 1e-4) { p += chord.length * 2; return; }
      chord.forEach((n, j) => {
        for (const det of [-0.11, 0.11]) {
          phases[p] = (phases[p] + hz(n + det) / SR) % 1;
          const s = WAVE[(phases[p] * TABLE_SIZE) | 0] * blend[k] * (j === 0 ? 1.4 : 0.6);
          if (det < 0) l += s; else r += s;
          p++;
        }
      });
    });
    // The filter opens a little on every beat, so even the pad breathes in time.
    const beatPos = (t % BEAT_S) / BEAT_S;
    const cutoff = 480 + 220 * Math.exp(-beatPos * 4) + 120 * Math.sin(t * 0.13);
    L[i] = lpL(l, "lp", cutoff) * 0.07;
    R[i] = lpR(r, "lp", cutoff) * 0.07;
  }

  // 2. A thin high drone over everything (A4 + D5), slowly shimmering.
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const v = (Math.sin(2 * Math.PI * 440 * t) + 0.7 * Math.sin(2 * Math.PI * 587.33 * t)) * (0.012 + 0.005 * Math.sin(t * 0.9));
    L[i] += v * (1 + 0.3 * Math.sin(t * 0.5));
    R[i] += v * (1 - 0.3 * Math.sin(t * 0.5));
  }

  const keys = bgm.map((ch) => new Float32Array(ch.length));
  for (let b = 0; b * BEAT_S < songEnd; b++) {
    const t0 = b * BEAT_S;
    const mood = moodAt(t0 + 1e-3);
    const chord = CHORD_NOTES[mood.chord];
    const beatInBar = b % 4;

    // 3. Sub bass: the chord root on every downbeat, ringing through the bar.
    if (beatInBar === 0) {
      const f = hz(chord[0] < 33 ? chord[0] + 12 : chord[0]);
      addMono(bgm, t0, BAR_S, (t) => Math.sin(2 * Math.PI * f * t) * Math.min(1, t / 0.02) * Math.exp(-t * 1.1) * (mood.pulse ? 0.35 : 0.22));
    }

    // 4. Rhythm (tension scenes): soft kick on 1 and 3, a ticking clock on every beat.
    if (mood.pulse) {
      if (beatInBar === 0 || beatInBar === 2) {
        addMono(bgm, t0, 0.4, (t) => Math.sin(2 * Math.PI * (46 + 40 * Math.exp(-t * 35)) * t) * Math.exp(-t * 12) * (beatInBar === 0 ? 0.45 : 0.3));
      }
      const hp = biquad();
      addMono(bgm, t0, 0.06, (t) => hp(noise(), "hp", 6500) * Math.exp(-t * 90) * (beatInBar === 0 ? 0.16 : 0.1));
    }

    // 5. Piano: the chord's upper notes as a slow arpeggio, one note every two beats.
    if (b % 2 === 0) {
      const upper = chord.map((n) => n + 24).filter((n) => n >= 62 && n <= 84);
      const note = upper[(b / 2) % upper.length];
      pianoNote(keys, t0, note, 0.085, 0.35 + 0.3 * ((b / 2) % 2));
    }
  }
  echo(keys, BEAT_S * 750, 0.3); // dotted-eighth echo on the piano, in time with the tempo
  for (let i = 0; i < L.length; i++) { L[i] += keys[0][i]; R[i] += keys[1][i]; }

  // 6. A riser over the last two beats before every scene change, so cuts land hard.
  sceneStarts.slice(1).forEach((s) => {
    const dur = 2 * BEAT_S, bp = biquad();
    addMono(bgm, s - dur, dur, (t) => {
      const k = t / dur;
      return bp(noise(), "bp", 400 + 5000 * k * k, 2) * k * k * 0.35;
    });
  });

  // Let the final chord ring, then fade.
  const fadeFrom = Math.round(songEnd * SR), fadeLen = L.length - fadeFrom;
  for (let i = 0; i < fadeLen; i++) {
    const g = 1 - i / fadeLen;
    L[fadeFrom + i] *= g; R[fadeFrom + i] *= g;
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
