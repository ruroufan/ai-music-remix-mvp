// "triphop": a trip-hop score (used by 《ISFJ · 忍》 — a glass jar in the chest
// filling up with stones) — another set of sounds: a dusty half-time
// breakbeat, a deep sub bass, a Rhodes through a tape wobble, vinyl crackle —
// and a glassy theremin-like lead and string swells when it builds.
//
// Per scene, `energy` decides what plays:
//   0  the Rhodes alone, with crackle
//   1  + the half-time beat (kick on 1, snare on 3), the sub bass
//   2  + ghosted hats and a shaker, a string pad, a bass line
//   3  + the beat heavier and saturated, a gliding sine lead, string stabs
// Between scenes: the bar before a scene with more energy, a reversed cymbal
// and a tape-stop on the last beat; the bar before a breakdown, the beat
// drops out and only the crackle hangs on.
import { CHORD_NOTES, SAW, SR, TABLE_SIZE, addMono, biquad, buffer, echo, hz, mix, noise, normalize, rand } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

const kick = (vel = 1) => (t) => Math.tanh(Math.sin(2 * Math.PI * (48 * t + (70 / 18) * (1 - Math.exp(-18 * t)))) * Math.exp(-t * 6) * 1.6) * vel;
const snare = (vel = 1) => {
  const bp = biquad(), lp = biquad();
  return (t) => Math.tanh((Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t * 18) * 0.6 + lp(bp(noise(), "bp", 1800, 0.5), "lp", 5000) * Math.exp(-t * 11)) * 1.5) * vel;
};
const hat = (vel = 1) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 7500) * Math.exp(-t * 55) * vel;
};
const shaker = (vel = 1) => {
  const bp = biquad();
  return (t) => bp(noise(), "bp", 5000, 0.8) * Math.sin(Math.PI * Math.min(1, t / 0.08)) * vel;
};
// rhodes with a slow tape wobble
const rhodes = (f, vel = 1) => {
  const ph = rand() * 6;
  return (t) => { const w = 1 + 0.003 * Math.sin(2 * Math.PI * 0.9 * t + ph); return (Math.sin(2 * Math.PI * f * w * t + 1.2 * Math.exp(-t * 5) * Math.sin(2 * Math.PI * f * w * t)) * Math.exp(-t * 1.2) + 0.12 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t * 3)) * Math.min(1, t / 0.006) * vel; };
};
const sub = (f, dur, vel = 1) => (t) => Math.sin(2 * Math.PI * f * t) * Math.min(1, t / 0.01) * Math.min(1, (dur - t) / 0.04) * vel;
const lead = (f0, f1, dur, vel = 1) => {
  let ph = 0;
  return (t) => { const f = f0 + (f1 - f0) * Math.min(1, t / 0.25); ph += (f * (1 + 0.008 * Math.sin(2 * Math.PI * 5.5 * t))) / SR; return Math.sin(2 * Math.PI * ph) * Math.min(1, t / 0.08) * Math.min(1, (dur - t) / 0.12) * vel; };
};
const strings = (f, dur, vel = 1) => {
  const lp = biquad();
  const vs = [-0.08, 0.08].map((d) => ({ d, ph: rand() }));
  return (t) => { let s = 0; vs.forEach((v) => { v.ph = (v.ph + (f * (1 + v.d / 12)) / SR) % 1; s += SAW[(v.ph * TABLE_SIZE) | 0]; }); return lp(s / 2, "lp", 1300, 0.7) * Math.sin(Math.PI * Math.min(1, t / dur)) * vel; };
};

export const scoreTriphop = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const S16 = BEAT_S / 4;
  const len = songEnd + 3;
  const drums = buffer(len), perc = buffer(len), bass = buffer(len), keys = buffer(len), str = buffer(len), ld = buffer(len), pad = buffer(len), fx = buffer(len), vinyl = buffer(len);
  const nBars = Math.round(songEnd / BAR_S);
  const N = Math.ceil(len * SR);
  const bars = Array.from({ length: nBars }, (_, b) => {
    const t = b * BAR_S;
    const k = sceneAt(t + 1e-4);
    const s = scenes[k], next = scenes[k + 1];
    const last = t + BAR_S >= s.end - 1e-4;
    return { t, chord: chordAt(t + 1e-4), energy: s.energy, first: Math.abs(t - s.start) < 1e-4, build: last && next && next.energy > s.energy && next.energy >= 2, stop: last && next && next.energy === 0 && s.energy > 0 };
  });

  // vinyl crackle the whole way through
  {
    const lp = biquad();
    let r = 0;
    for (let i = 0; i < N; i++) {
      const pop = rand() < 0.0006 ? (rand() - 0.5) * 0.9 : 0;
      r = lp(noise() * 0.012 + pop, "lp", 4000);
      vinyl[0][i] = r; vinyl[1][i] = r * 0.9;
    }
  }

  bars.forEach((bar, b) => {
    const { t, energy, chord } = bar;
    const beats = bar.stop ? 2 : 4;
    const rootPc = CHORD_NOTES[chord][0] % 12;
    let root = rootPc + 24; if (root < 28) root += 12;
    const tones = [...new Set(CHORD_NOTES[chord].map((n) => n % 12))].map((p) => { let m = p; while (m < 57) m += 12; return m; }).sort((a, z) => a - z);

    if (bar.first && b > 0 && bars[b - 1].build) addMono(fx, t, 1.4, (x) => Math.sin(2 * Math.PI * (40 * x + (50 / 7) * (1 - Math.exp(-7 * x)))) * Math.exp(-x * 2.4) * 0.8);
    // rhodes: a chord on 1, an answer on the "and" of 2
    tones.forEach((m, j) => addMono(keys, t + j * 0.012, 3, rhodes(hz(m), energy === 0 ? 0.42 : 0.3), 0.45 + 0.1 * j, 0.55 - 0.1 * j));
    if (beats > 2) addMono(keys, t + 2.5 * BEAT_S, 2, rhodes(hz(tones[1] + 12), energy === 0 ? 0.3 : 0.2), 0.6, 0.4);
    if (energy >= 1 && !bar.build) {
      const heavy = energy >= 3 ? 1.15 : 1;
      [0, 1.75, 2.5].forEach((at, k) => { if (at < beats) addMono(drums, t + at * BEAT_S, 0.6, kick((k ? 0.7 : 1) * heavy)); });
      if (2 < beats) addMono(drums, t + 2 * BEAT_S, 0.6, snare(0.85 * heavy));
      addMono(bass, t, Math.min(BAR_S, beats * BEAT_S), sub(hz(root), Math.min(BAR_S, beats * BEAT_S), 0.75));
    }
    if (energy >= 2 && !bar.build) {
      for (let i = 0; i < beats * 4; i += 2) addMono(perc, t + i * S16 + (i % 4 === 2 ? S16 * 0.3 : 0), 0.06, hat(i % 4 === 0 ? 0.14 : 0.08), 0.6, 0.4);
      for (let i = 0; i < beats * 2; i++) addMono(perc, t + i * 2 * S16 + S16, 0.1, shaker(0.07), 0.35, 0.65);
      tones.forEach((m) => addMono(str, t, BAR_S, strings(hz(m - 12), BAR_S, 0.4)));
      [[1.5, 7], [3, 10]].forEach(([at, off]) => { if (at < beats) addMono(bass, t + at * BEAT_S, BEAT_S * 0.8, sub(hz(root + off), BEAT_S * 0.8, 0.5)); });
    }
    if (energy >= 3 && !bar.build && !bar.stop) {
      const a = tones[2] + 12, z = tones[1] + 12;
      addMono(ld, t, 2 * BEAT_S, lead(hz(a + 2), hz(a), 2 * BEAT_S, 0.3), 0.5, 0.5);
      addMono(ld, t + 2 * BEAT_S, 2 * BEAT_S, lead(hz(a), hz(z), 2 * BEAT_S, 0.3), 0.5, 0.5);
      [0.5, 2.75].forEach((at) => tones.forEach((m) => addMono(str, t + at * BEAT_S, 0.25, strings(hz(m), 0.25, 0.5))));
    }
    if (bar.build) {
      const hp = biquad();
      addMono(fx, t, BAR_S - BEAT_S, (x) => hp(noise(), "hp", 4000) * (x / (BAR_S - BEAT_S)) ** 2.5 * 0.5, 0.5, 0.5);
      // tape stop on the last beat: a falling kick-ish thud
      addMono(fx, t + 3 * BEAT_S, BEAT_S, (x) => Math.sin(2 * Math.PI * 110 * x * Math.pow(1 - x / BEAT_S, 2)) * (1 - x / BEAT_S) * 0.5);
    }
  });

  renderPad(pad, { chordAt, levelAt: (t) => (scenes[sceneAt(t)].energy === 0 ? 0.008 : 0.005), cutoffAt: () => 900, xfade: 0.2 });
  echo(keys, BEAT_S * 0.75 * 1000, 0.3);
  echo(ld, BEAT_S * 0.75 * 1000, 0.35);
  echo(drums, BEAT_S * 0.5 * 1000, 0.08);

  const out = buffer(len);
  mix(out, drums, 0.7);
  mix(out, perc, 0.6);
  mix(out, bass, 0.45);
  mix(out, keys, 1.05);
  mix(out, str, 0.55);
  mix(out, ld, 0.8);
  mix(out, pad, 1);
  mix(out, fx, 0.45);
  mix(out, vinyl, 1);
  for (let i = 0; i < out[0].length; i++) {
    out[0][i] = Math.tanh(out[0][i] * 0.9);
    out[1][i] = Math.tanh(out[1][i] * 0.9);
  }
  fadeTail(out, songEnd);
  normalize(out, -1);
  return out;
};
