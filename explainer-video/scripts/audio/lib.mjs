// Tiny synthesis toolkit shared by the scores and sound effects.
import { writeFileSync } from "node:fs";

export const SR = 44100;

let seed = 7;
export const reseed = (s) => { seed = s; };
export const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
export const noise = () => rand() * 2 - 1;
export const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

export const buffer = (seconds) => [new Float32Array(Math.ceil(seconds * SR)), new Float32Array(Math.ceil(seconds * SR))];

// RBJ biquad, coefficients recomputed per call so the cutoff can sweep.
export const biquad = () => {
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
export const echo = ([L, R], ms, feedback) => {
  const d = Math.round((ms / 1000) * SR);
  for (let i = d; i < L.length; i++) {
    L[i] += R[i - d] * feedback;
    R[i] += L[i - d] * feedback;
  }
};

export const normalize = ([L, R], peakDb = -1) => {
  let peak = 0;
  for (let i = 0; i < L.length; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const g = peak ? 10 ** (peakDb / 20) / peak : 1;
  for (let i = 0; i < L.length; i++) { L[i] *= g; R[i] *= g; }
};

export const writeWav = (path, [L, R]) => {
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
export const pianoNote = (out, t0, midi, gain, pan) => {
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

// Add a mono voice into a stereo buffer, starting at t0 seconds.
export const addMono = (out, t0, dur, fn, gainL = 1, gainR = 1) => {
  const s0 = Math.round(t0 * SR);
  for (let i = 0; i < dur * SR && s0 + i < out[0].length; i++) {
    if (s0 + i < 0) continue;
    const v = fn(i / SR);
    out[0][s0 + i] += v * gainL;
    out[1][s0 + i] += v * gainR;
  }
};

export const mix = (into, from, gain = 1) => {
  for (let i = 0; i < into[0].length; i++) { into[0][i] += from[0][i] * gain; into[1][i] += from[1][i] * gain; }
};

// One cycle of a saw-ish waveform (6 harmonics), looked up by phase 0–1.
export const TABLE_SIZE = 4096;
export const SAW = Float32Array.from({ length: TABLE_SIZE + 1 }, (_, i) => {
  let s = 0;
  for (let h = 1; h <= 6; h++) s += Math.sin((2 * Math.PI * h * i) / TABLE_SIZE) / h ** 1.4;
  return s;
});
// …and a hollow square-ish one (odd harmonics) for plucks.
export const SQUARE = Float32Array.from({ length: TABLE_SIZE + 1 }, (_, i) => {
  let s = 0;
  for (let h = 1; h <= 9; h += 2) s += Math.sin((2 * Math.PI * h * i) / TABLE_SIZE) / h;
  return s;
});

// Pad voicings (MIDI notes): low root, then the chord spread upward.
export const CHORD_NOTES = {
  Dm: [38, 45, 50, 53, 57],
  Bb: [34, 41, 46, 50, 53],
  Gm: [31, 38, 43, 46, 50],
  A: [33, 40, 45, 49, 52],
  F: [29, 41, 45, 48, 53],
  D: [38, 45, 50, 54, 57],
  Am: [33, 45, 52, 57, 60],
  C: [36, 48, 52, 55, 60],
  G: [31, 43, 50, 55, 59],
  E: [28, 40, 47, 52, 56],
};
