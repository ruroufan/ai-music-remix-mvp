// "marching": a marching-band score (used by 《ESTJ · 标准》 — a man trimming a
// row of saplings to one shape with a ruler) — another set of sounds: a
// drumline (tight snare rudiments, bass drums, crash cymbals), a tuba on the
// roots and fifths, a brass chorale — and a glockenspiel and piccolo on top.
//
// Per scene, `energy` decides what plays:
//   0  the brass chorale alone, soft
//   1  + bass drum on 1 and 3, a light snare tap, the tuba
//   2  + the full drumline (16th rudiments, accents, flams), trumpets on the tune
//   3  + glockenspiel, piccolo trills, a crash on the downbeat
// Between scenes: the bar before a scene with more energy, a snare roll that
// crescendos into a crash; the bar before a breakdown, a unison "stop hit" on
// 1 and 2, then silence.
import { CHORD_NOTES, SAW, SR, TABLE_SIZE, addMono, biquad, buffer, echo, hz, mix, noise, normalize, rand } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

const snare = (vel = 1) => {
  const bp = biquad();
  return (t) => (Math.sin(2 * Math.PI * 330 * t) * Math.exp(-t * 40) * 0.5 + bp(noise(), "bp", 3800, 0.7) * Math.exp(-t * 26)) * vel;
};
const bass = (f, vel = 1) => (t) => Math.sin(2 * Math.PI * f * t * (1 + 0.4 * Math.exp(-t * 30))) * Math.exp(-t * 7) * vel;
const crash = (vel = 1) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 5000) * Math.exp(-t * 2.5) * Math.min(1, t / 0.003) * vel;
};
// brass: saws through a lowpass that opens with the attack ("blat")
const brass = (f, dur, vel = 1, bright = 1) => {
  const lp = biquad();
  const vs = [-0.05, 0.05].map((d) => ({ d, ph: rand() }));
  return (t) => {
    let s = 0;
    vs.forEach((v) => { v.ph = (v.ph + (f * (1 + v.d / 12) * (1 + 0.004 * Math.sin(2 * Math.PI * 5 * t) * Math.min(1, t / 0.4))) / SR) % 1; s += SAW[(v.ph * TABLE_SIZE) | 0]; });
    const env = Math.min(1, t / 0.04) * Math.min(1, (dur - t) / 0.06);
    return lp(s / 2, "lp", (500 + 1800 * bright) * (0.6 + 0.4 * Math.min(1, t / 0.08)), 0.8) * env * vel;
  };
};
const tuba = (f, dur, vel = 1) => {
  const lp = biquad();
  let ph = rand();
  return (t) => { ph = (ph + f / SR) % 1; return lp(SAW[(ph * TABLE_SIZE) | 0], "lp", 380, 0.9) * Math.min(1, t / 0.03) * Math.min(1, (dur - t) / 0.05) * vel; };
};
const glock = (f, vel = 1) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 10)) * Math.exp(-t * 3) * Math.min(1, t / 0.001) * vel;
const piccolo = (f, dur, vel = 1) => (t) => Math.sin(2 * Math.PI * f * t * (1 + 0.005 * Math.sin(2 * Math.PI * 6 * t))) * Math.min(1, t / 0.03) * Math.min(1, (dur - t) / 0.04) * vel;

const RUDIMENT = [1, 0.35, 0.5, 0.35, 0.8, 0.35, 0.5, 0.35, 1, 0.35, 0.5, 0.6, 0.9, 0.4, 0.7, 0.5];
const TUNE = [[0, 2, 1], [1, 1, 0.5], [1.5, 2, 0.5], [2, 3, 1.5], [3.5, 2, 0.5]];

export const scoreMarching = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const S16 = BEAT_S / 4;
  const len = songEnd + 3;
  const drums = buffer(len), cym = buffer(len), low = buffer(len), br = buffer(len), tp = buffer(len), gl = buffer(len), pic = buffer(len), pad = buffer(len);
  const nBars = Math.round(songEnd / BAR_S);
  const bars = Array.from({ length: nBars }, (_, b) => {
    const t = b * BAR_S;
    const k = sceneAt(t + 1e-4);
    const s = scenes[k], next = scenes[k + 1];
    const last = t + BAR_S >= s.end - 1e-4;
    return { t, chord: chordAt(t + 1e-4), energy: s.energy, first: Math.abs(t - s.start) < 1e-4, build: last && next && next.energy > s.energy && next.energy >= 2, stop: last && next && next.energy === 0 && s.energy > 0 };
  });

  bars.forEach((bar, b) => {
    const { t, energy, chord } = bar;
    const rootPc = CHORD_NOTES[chord][0] % 12;
    let root = rootPc + 28; if (root < 31) root += 12;
    const tones = [...new Set(CHORD_NOTES[chord].map((n) => n % 12))].map((p) => { let m = p; while (m < 55) m += 12; return m; }).sort((a, z) => a - z);
    const t4 = [...tones, tones[0] + 12];

    if (bar.first && b > 0 && bars[b - 1].build) addMono(cym, t, 2.5, crash(0.5), 0.5, 0.5);
    if (bar.stop) {
      [0, 1].forEach((at) => { tones.forEach((m) => addMono(br, t + at * BEAT_S, 0.3, brass(hz(m), 0.3, 0.4, 1), 0.5, 0.5)); addMono(drums, t + at * BEAT_S, 0.4, bass(hz(root + 12), 1)); addMono(drums, t + at * BEAT_S, 0.2, snare(0.9)); });
      return;
    }
    // chorale: always (held voicing)
    tones.forEach((m, j) => addMono(br, t, BAR_S, brass(hz(m), BAR_S, energy === 0 ? 0.45 : 0.13, energy === 0 ? 0.3 : 0.4), 0.4 + 0.1 * j, 0.6 - 0.1 * j));
    if (bar.build) {
      for (let i = 0; i < 32; i++) addMono(drums, t + i * (BAR_S / 32), 0.08, snare(0.12 + 0.7 * (i / 32) ** 2), 0.5, 0.5);
      return;
    }
    if (energy >= 1) {
      [0, 2].forEach((at) => addMono(drums, t + at * BEAT_S, 0.5, bass(hz(root + 12), 0.6)));
      [1, 3].forEach((at) => addMono(drums, t + at * BEAT_S, 0.2, snare(energy === 1 ? 0.45 : 0.6)));
      [[0, 0], [1, 7], [2, 0], [3, 7]].forEach(([at, off]) => addMono(low, t + at * BEAT_S, BEAT_S * 0.8, tuba(hz(root + off), BEAT_S * 0.8, 0.8)));
    }
    if (energy >= 2) {
      RUDIMENT.forEach((v, i) => addMono(drums, t + i * S16, 0.12, snare(v * 0.32), 0.45, 0.55));
      TUNE.forEach(([at, k, d]) => addMono(tp, t + at * BEAT_S, d * BEAT_S * 0.92, brass(hz(t4[k] + 12), d * BEAT_S * 0.92, 0.35, 1), 0.55, 0.45));
    }
    if (energy >= 3) {
      if (b % 2 === 0) addMono(cym, t, 2, crash(0.3), 0.5, 0.5);
      [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].forEach((at, i) => addMono(gl, t + at * BEAT_S, 1, glock(hz(t4[i % 4] + 24), 0.25), 0.6, 0.4));
      addMono(pic, t + 3 * BEAT_S, BEAT_S, (x) => piccolo(hz(t4[2] + 24 + (Math.floor(x / 0.06) % 2 ? 2 : 0)), BEAT_S, 0.18)(x), 0.4, 0.6);
    }
  });

  renderPad(pad, { chordAt, levelAt: () => 0.004, cutoffAt: () => 800, xfade: 0.15 });
  echo(br, BEAT_S * 1000, 0.15);
  echo(gl, BEAT_S * 0.5 * 1000, 0.25);

  const out = buffer(len);
  mix(out, drums, 0.9);
  mix(out, cym, 0.5);
  mix(out, low, 0.32);
  mix(out, br, 0.9);
  mix(out, tp, 0.85);
  mix(out, gl, 0.8);
  mix(out, pic, 0.7);
  mix(out, pad, 1);
  for (let i = 0; i < out[0].length; i++) {
    out[0][i] = Math.tanh(out[0][i] * 1.0);
    out[1][i] = Math.tanh(out[1][i] * 1.0);
  }
  fadeTail(out, songEnd);
  normalize(out, -1);
  return out;
};
