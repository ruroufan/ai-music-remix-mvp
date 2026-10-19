// "dembow": a warm reggaeton score (used by 《恋爱脑》) — another set of sounds:
// the dembow beat (a kick on every beat, the snare's "boom-ch-boom-chick"),
// timbale fills, a round sub, a marimba, a nylon-string guitar (Karplus–Strong)
// and a bright synth pluck lead at the peaks.
//
// Per scene, `energy` decides what plays:
//   0  the nylon guitar alone, picking the chord
//   1  + marimba, a soft kick on every beat, a shaker
//   2  + the dembow snare, the sub, pluck stabs on the off-beats
//   3  + the pluck lead, claps on the snare, a timbale fill every other bar
// Between scenes: the bar before a scene with more energy, the timbales roll
// faster and faster under a rising sweep, half a beat of silence, then the
// drop; the bar before a breakdown, one guitar strum on 3 and everything stops.
import { CHORD_NOTES, SR, addMono, biquad, buffer, echo, hz, mix, noise, normalize, rand } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

const pluckKS = (out, t0, midi, vel = 1, pan = 0.5, decay = 0.996, dur = 2, bright = 0.55) => {
  const f = hz(midi), n = Math.max(2, Math.round(SR / f));
  const buf = new Float32Array(n);
  for (let i = 0; i < n; i++) buf[i] = rand() * 2 - 1;
  const s0 = Math.round(t0 * SR), len = Math.round(dur * SR);
  let idx = 0;
  for (let i = 0; i < len && s0 + i < out[0].length; i++) {
    if (s0 + i < 0) continue;
    const y = buf[idx], nx = buf[(idx + 1) % n];
    buf[idx] = (y * (0.5 + 0.25 * bright) + nx * (0.5 - 0.25 * bright)) * decay;
    idx = (idx + 1) % n;
    const fade = i > len - 300 ? (len - i) / 300 : 1;
    out[0][s0 + i] += y * vel * (1 - pan) * fade;
    out[1][s0 + i] += y * vel * pan * fade;
  }
};
const kick = (vel = 1) => (t) => (Math.sin(2 * Math.PI * (50 * t + (100 / 26) * (1 - Math.exp(-26 * t)))) * Math.exp(-t * 7) + Math.sin(2 * Math.PI * 1800 * t) * Math.exp(-t * 300) * 0.2) * vel;
const snare = (vel = 1) => {
  const bp = biquad();
  return (t) => (Math.sin(2 * Math.PI * 220 * t) * Math.exp(-t * 30) * 0.5 + bp(noise(), "bp", 3000, 0.7) * Math.exp(-t * 22)) * vel;
};
const clap = (vel = 1) => {
  const bp = biquad();
  return (t) => bp(noise(), "bp", 1500, 0.8) * ([0, 0.01, 0.02].reduce((a, o) => a + (t >= o ? Math.exp(-(t - o) * 150) : 0), 0) * 0.6 + Math.exp(-t * 14) * 0.4) * vel;
};
const shaker = (vel = 1) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 7000) * Math.min(1, t / 0.01) * Math.exp(-t * 50) * vel;
};
// timbale: a ringing, pitched metal-shelled drum
const timbale = (f, vel = 1) => {
  const bp = biquad();
  return (t) => (Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 12) + Math.sin(2 * Math.PI * f * 2.3 * t) * Math.exp(-t * 20) * 0.4 + bp(noise(), "bp", 4000, 1) * Math.exp(-t * 80) * 0.5) * vel;
};
const marimba = (f, vel = 1) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(2 * Math.PI * f * 4 * t) * Math.exp(-t * 30)) * Math.min(1, t / 0.002) * Math.exp(-t * 6) * vel;
// bright synth pluck: two detuned saws, filter snapping shut
const synthPluck = (f, vel = 1) => {
  const lp = biquad();
  let a = 0, b = rand();
  return (t) => {
    a = (a + f / SR) % 1; b = (b + (f * 1.007) / SR) % 1;
    return lp(2 * a - 1 + 2 * b - 1, "lp", 400 + 6000 * Math.exp(-t * 14)) * Math.min(1, t / 0.002) * Math.exp(-t * 6) * vel * 0.5;
  };
};

const pcs = (chord) => [...new Set(CHORD_NOTES[chord].map((n) => n % 12))];
const tonesFrom = (chord, lo) => pcs(chord).map((p) => { let m = p; while (m < lo) m += 12; return m; }).sort((a, z) => a - z);
const DEMBOW = [3, 6, 11, 14]; // the snare, in 16ths
const LEAD = [[0, 2], [3, 1], [6, 2], [8, 3], [10, 2], [12, 1], [14, 0]];

export const scoreDembow = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const S16 = BEAT_S / 4;
  const len = songEnd + 3;
  const drums = buffer(len), perc = buffer(len), bass = buffer(len), keys = buffer(len), gtr = buffer(len), lead = buffer(len), pad = buffer(len), fx = buffer(len);
  const nBars = Math.round(songEnd / BAR_S);
  const N = Math.ceil(len * SR);
  const duck = new Float32Array(N).fill(1);
  const gate = new Float32Array(N).fill(1);
  const bars = Array.from({ length: nBars }, (_, b) => {
    const t = b * BAR_S;
    const k = sceneAt(t + 1e-4);
    const s = scenes[k], next = scenes[k + 1];
    const last = t + BAR_S >= s.end - 1e-4;
    return { t, chord: chordAt(t + 1e-4), energy: s.energy, first: Math.abs(t - s.start) < 1e-4, build: last && next && next.energy > s.energy && next.energy >= 2, stop: last && next && next.energy === 0 && s.energy > 0 };
  });

  bars.forEach((bar, b) => {
    const { t, energy, chord } = bar;
    const steps = bar.stop ? 12 : 16;
    const root = CHORD_NOTES[chord][0] % 12;

    if (bar.first && b > 0 && bars[b - 1].build) {
      addMono(fx, t, 1.4, (x) => Math.sin(2 * Math.PI * (36 * x + (60 / 9) * (1 - Math.exp(-9 * x)))) * Math.exp(-x * 2.6) * 0.8);
      const hp = biquad();
      addMono(fx, t, 1.6, (x) => hp(noise(), "hp", 5000) * Math.exp(-x * 2.4) * 0.3, 0.8, 1);
    }

    // nylon guitar: picked chord (energy 0), light strums otherwise
    const g = tonesFrom(chord, 52);
    let low = root + 36; if (low < 40) low += 12;
    if (energy === 0) {
      [[0, low], [1, g[0] + 12], [2, g[1] + 12], [3, g[2] + 12], [4, g[1] + 12], [5, g[0] + 12], [6, g[2] + 12], [7, g[1] + 12]].forEach(([i, m]) => pluckKS(gtr, t + i * 2 * S16, m, i === 0 ? 0.85 : 0.55, 0.4 + 0.04 * i, 0.997, 2.2, 0.4));
    } else if (!bar.build && energy <= 2) {
      for (const o of [0, 6, 10]) if (o < steps) [low, ...g.map((m) => m + 12)].forEach((m, j) => pluckKS(gtr, t + o * S16 + j * 0.01, m, energy === 1 ? 0.28 : 0.18, 0.55, 0.994, 1.2, 0.5));
    }
    if (bar.stop) [low, ...g.map((m) => m + 12)].forEach((m, j) => pluckKS(gtr, t + 8 * S16 + j * 0.012, m, 0.35, 0.5, 0.996, 2, 0.5));

    // marimba
    if (energy >= 1 && !bar.build) {
      const tn = tonesFrom(chord, 64);
      const pat = [0, 2, 1, 2, 0, 2, 1, 2];
      for (let i = 0; i < 8; i++) if (i * 2 < steps) addMono(keys, t + i * 2 * S16, 0.6, marimba(hz(tn[pat[i] % tn.length]), (i % 2 ? 0.22 : 0.3) * (energy === 1 ? 1.5 : 1)), i % 2 ? 0.65 : 0.45, i % 2 ? 0.45 : 0.65);
    }

    // drums
    if (energy >= 1 && !bar.build) {
      for (let k = 0; k * 4 < steps; k++) {
        addMono(drums, t + k * BEAT_S, 0.5, kick(energy === 1 ? 0.85 : 1));
        const s0 = Math.round((t + k * BEAT_S) * SR);
        for (let j = 0; j < 0.25 * SR && s0 + j < N; j++) duck[s0 + j] = Math.min(duck[s0 + j], 1 - (energy === 1 ? 0.3 : 0.5) * Math.exp(-(j / SR) / 0.08));
      }
      for (let i = 0; i < steps; i++) addMono(perc, t + i * S16, 0.06, shaker(i % 2 ? 0.1 : 0.16), 0.4, 0.6);
    }
    if (energy >= 2 && !bar.build) {
      for (const i of DEMBOW) if (i < steps) {
        addMono(drums, t + i * S16, 0.3, snare(0.6));
        if (energy >= 3) addMono(drums, t + i * S16 + 0.004, 0.3, clap(0.4), 0.45, 0.55);
      }
      // the sub, on the beat, sliding a touch
      let r = root + 24; if (r < 31) r += 12;
      for (let k = 0; k * 4 < steps; k++) addMono(bass, t + k * BEAT_S, BEAT_S * 0.95, (x) => Math.tanh(Math.sin(2 * Math.PI * hz(r) * x) * 1.5) * Math.min(1, x / 0.005) * Math.min(1, Math.max(0, (BEAT_S * 0.95 - x) / 0.03)));
      // pluck stabs on the off-beats
      const tn = tonesFrom(chord, 64);
      for (const i of [2, 6, 10, 14]) if (i < steps) tn.forEach((m) => addMono(lead, t + i * S16, 0.4, synthPluck(hz(m), 0.18), 0.5, 0.5));
    }
    if (energy >= 3 && !bar.build) {
      const tn = tonesFrom(chord, 72);
      for (const [i, k] of LEAD) if (i < steps) addMono(lead, t + i * S16, 0.5, synthPluck(hz(tn[k % tn.length] + (k >= tn.length ? 12 : 0)), 0.42), 0.45, 0.55);
      if (b % 2 === 1 && steps === 16) [12, 13, 14, 15].forEach((i, j) => addMono(perc, t + i * S16, 0.3, timbale(j < 2 ? 520 : 390, 0.5), j < 2 ? 0.7 : 0.4, j < 2 ? 0.4 : 0.7));
    }

    // build: timbale roll speeding up, a sweep, a gap
    if (bar.build) {
      const hits = [0, 2, 4, 6, 8, 9, 10, 11, 12, 12.5, 13, 13.5];
      hits.forEach((p, i) => addMono(perc, t + p * S16, 0.3, timbale(i % 2 ? 520 : 390, 0.3 + 0.5 * (i / hits.length)), i % 2 ? 0.7 : 0.4, i % 2 ? 0.4 : 0.7));
      const hp = biquad();
      addMono(fx, t, BAR_S - BEAT_S / 2, (x) => { const k = x / (BAR_S - BEAT_S / 2); return hp(noise(), "hp", 700 + 8000 * k * k) * k * k * 0.7; });
      const g0 = Math.round((t + BAR_S - BEAT_S / 2) * SR), g1 = Math.round((t + BAR_S) * SR);
      for (let i = g0; i < g1 && i < N; i++) gate[i] = Math.max(0, 1 - (i - g0) / 200, 1 - (g1 - i) / 80);
    }
  });

  renderPad(pad, { chordAt, levelAt: (t) => (scenes[sceneAt(t)].energy === 0 ? 0.008 : 0.014), cutoffAt: () => 900, xfade: 0.1 });
  for (let i = 0; i < N && i < pad[0].length; i++) {
    for (const buf of [pad, keys, lead]) { buf[0][i] *= duck[i]; buf[1][i] *= duck[i]; }
    const d = 1 - (1 - duck[i]) * 0.4;
    bass[0][i] *= d; bass[1][i] *= d;
  }
  echo(gtr, BEAT_S * 0.75 * 1000, 0.18);
  echo(keys, BEAT_S * 0.75 * 1000, 0.22);
  echo(lead, BEAT_S * 0.5 * 1000, 0.25);

  const out = buffer(len);
  mix(out, drums, 0.85);
  mix(out, perc, 0.7);
  mix(out, bass, 0.3);
  mix(out, keys, 0.6);
  mix(out, gtr, 0.9);
  mix(out, lead, 0.35);
  mix(out, pad, 1);
  mix(out, fx, 0.45);
  for (let i = 0; i < out[0].length; i++) {
    const g = i < N ? gate[i] : 1;
    out[0][i] = Math.tanh(out[0][i] * 1.1) * g;
    out[1][i] = Math.tanh(out[1][i] * 1.1) * g;
  }
  fadeTail(out, songEnd);
  normalize(out, -1);
  return out;
};
