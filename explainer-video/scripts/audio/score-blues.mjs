// "blues": a slow-burning blues score (used by 《ISTP · 沉默》 — a man at his
// workbench who can fix anything but his own feelings) — another set of
// sounds: a fingerpicked guitar with a bottleneck slide, a shuffle (triplet
// swing) on brushes then sticks, a walking bass, a harmonica — and an
// overdriven lead guitar bending notes when it opens up.
//
// Per scene, `energy` decides what plays:
//   0  the slide guitar alone
//   1  + a brushed shuffle, a walking bass
//   2  + the full shuffle kit (kick, snare backbeat, ride), a harmonica
//   3  + an overdriven lead guitar with bends, a rhythm guitar chop
// Between scenes: the bar before a scene with more energy, a turnaround lick
// and a snare pickup; the bar before a breakdown, a stop-time hit on 1.
import { CHORD_NOTES, SAW, SR, TABLE_SIZE, addMono, biquad, buffer, echo, hz, mix, noise, normalize, rand } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

const SW = 2 / 3; // shuffle: the "and" lands on the third triplet
// plucked steel string with an optional slide from `from` semitones below
const pluck = (f, vel = 1, slide = 0) => (t) => {
  const ff = f * Math.pow(2, (-slide * Math.max(0, 1 - t / 0.12)) / 12);
  return (Math.sin(2 * Math.PI * ff * t) + 0.5 * Math.sin(4 * Math.PI * ff * t) * Math.exp(-t * 4) + 0.3 * Math.sin(6 * Math.PI * ff * t) * Math.exp(-t * 8)) * Math.exp(-t * 2) * Math.min(1, t / 0.002) * vel;
};
const kick = (vel = 1) => (t) => Math.sin(2 * Math.PI * (55 * t + (60 / 25) * (1 - Math.exp(-25 * t)))) * Math.exp(-t * 10) * vel;
const snare = (vel = 1) => {
  const bp = biquad();
  return (t) => (Math.sin(2 * Math.PI * 210 * t) * Math.exp(-t * 25) * 0.4 + bp(noise(), "bp", 2600, 0.6) * Math.exp(-t * 15)) * vel;
};
const brush = (vel = 1) => {
  const bp = biquad();
  return (t) => bp(noise(), "bp", 4000, 0.5) * Math.exp(-t * 12) * Math.min(1, t / 0.015) * vel;
};
const ride = (vel = 1) => {
  const hp = biquad();
  return (t) => (hp(noise(), "hp", 6000) * 0.6 + Math.sin(2 * Math.PI * 3200 * t) * 0.2) * Math.exp(-t * 6) * vel;
};
const upright = (f, dur, vel = 1) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t * 6)) * Math.exp(-t * 2.5) * Math.min(1, t / 0.008) * Math.min(1, (dur - t) / 0.03) * vel;
// harmonica: reedy square-ish tone, a little wobble and breath
const harp = (f, dur, vel = 1, bend = 0) => {
  const bp = biquad();
  let ph = rand();
  return (t) => {
    const ff = f * Math.pow(2, (-bend * Math.max(0, 1 - t / 0.2)) / 12) * (1 + 0.01 * Math.sin(2 * Math.PI * 6 * t));
    ph = (ph + ff / SR) % 1;
    const s = (ph < 0.4 ? 1 : -1) * 0.6 + SAW[(ph * TABLE_SIZE) | 0] * 0.3 + noise() * 0.05;
    return bp(s, "bp", 1400, 0.6) * Math.min(1, t / 0.04) * Math.min(1, (dur - t) / 0.05) * vel;
  };
};
const lead = (f, dur, vel = 1, bend = 0) => {
  const lp = biquad();
  let ph = rand();
  return (t) => {
    const ff = f * Math.pow(2, (bend * Math.min(1, t / 0.15)) / 12) * (1 + 0.008 * Math.sin(2 * Math.PI * 5.5 * t) * Math.min(1, t / 0.3));
    ph = (ph + ff / SR) % 1;
    return Math.tanh(lp(SAW[(ph * TABLE_SIZE) | 0], "lp", 2400, 0.8) * 3) * 0.5 * Math.min(1, t / 0.01) * Math.min(1, (dur - t) / 0.05) * vel;
  };
};

export const scoreBlues = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const len = songEnd + 3;
  const gtr = buffer(len), drums = buffer(len), bass = buffer(len), hp_ = buffer(len), ld = buffer(len), pad = buffer(len);
  const nBars = Math.round(songEnd / BAR_S);
  const bars = Array.from({ length: nBars }, (_, b) => {
    const t = b * BAR_S;
    const k = sceneAt(t + 1e-4);
    const s = scenes[k], next = scenes[k + 1];
    const last = t + BAR_S >= s.end - 1e-4;
    return { t, chord: chordAt(t + 1e-4), energy: s.energy, build: last && next && next.energy > s.energy && next.energy >= 2, stop: last && next && next.energy === 0 && s.energy > 0 };
  });

  bars.forEach((bar, b) => {
    const { t, energy, chord } = bar;
    const rootPc = CHORD_NOTES[chord][0] % 12;
    let root = rootPc + 40; if (root < 43) root += 12;
    const minor = chord.endsWith("m");
    const tones = [...new Set(CHORD_NOTES[chord].map((n) => n % 12))].map((p) => { let m = p; while (m < 55) m += 12; return m; }).sort((a, z) => a - z);
    const blue = [0, 3, 5, 6, 7, 10].map((d) => root + 24 + d); // blues scale over the root

    if (bar.stop) {
      tones.forEach((m) => addMono(gtr, t, 2, pluck(hz(m), 0.4), 0.5, 0.5));
      addMono(drums, t, 0.4, kick(0.9));
      return;
    }
    // guitar: alternating thumb bass + a slid double-stop on 2 and the "and" of 3
    [0, 1, 2, 3].forEach((beat) => addMono(gtr, t + beat * BEAT_S, 0.8, pluck(hz(root - 12 + (beat % 2 ? 7 : 0)), 0.22), 0.55, 0.45));
    addMono(gtr, t + BEAT_S, 1.2, pluck(hz(tones[1]), 0.35, 2), 0.4, 0.6);
    addMono(gtr, t + BEAT_S + 0.01, 1.2, pluck(hz(tones[2]), 0.3, 2), 0.4, 0.6);
    addMono(gtr, t + (2 + SW) * BEAT_S, 1, pluck(hz(blue[b % 2 ? 2 : 4]), 0.3, 1), 0.6, 0.4);
    if (bar.build) {
      // turnaround lick down the blues scale, snare pickup
      [5, 4, 3, 2, 1, 0].forEach((k, i) => addMono(gtr, t + 2 * BEAT_S + i * (BEAT_S / 3), 0.4, pluck(hz(blue[k]), 0.35), 0.5, 0.5));
      [3, 3 + 1 / 3, 3 + 2 / 3].forEach((at, i) => addMono(drums, t + at * BEAT_S, 0.2, snare(0.3 + 0.2 * i), 0.5, 0.5));
      return;
    }
    if (energy >= 1) {
      // walking bass in shuffle 4s
      const walk = minor ? [0, 3, 5, 7] : [0, 4, 7, 9];
      walk.forEach((d, i) => addMono(bass, t + i * BEAT_S, BEAT_S * 0.9, upright(hz(root - 12 + d), BEAT_S * 0.9, 0.75)));
      for (let i = 0; i < 4; i++) {
        addMono(drums, t + i * BEAT_S, 0.3, brush(energy === 1 ? 0.25 : 0.12), 0.45, 0.55);
        addMono(drums, t + (i + SW) * BEAT_S, 0.2, brush(energy === 1 ? 0.15 : 0.08), 0.55, 0.45);
      }
    }
    if (energy >= 2) {
      [0, 2].forEach((at) => addMono(drums, t + at * BEAT_S, 0.4, kick(0.9)));
      [1, 3].forEach((at) => addMono(drums, t + at * BEAT_S, 0.3, snare(0.7)));
      for (let i = 0; i < 4; i++) { addMono(drums, t + i * BEAT_S, 0.6, ride(0.12), 0.65, 0.35); addMono(drums, t + (i + SW) * BEAT_S, 0.4, ride(0.07), 0.65, 0.35); }
      if (b % 2 === 0) [[0, 4, 1.5, 1], [2, 3, 1, 0], [3, 2, 1, 0]].forEach(([at, k, d, bend]) => addMono(hp_, t + at * BEAT_S, d * BEAT_S, harp(hz(blue[k]), d * BEAT_S, 0.35, bend), 0.4, 0.6));
    }
    if (energy >= 3) {
      [[0, 4, 1.5, 2], [1.66, 3, 0.33, 0], [2, 2, 1, 1], [3, 0, 1, 0]].forEach(([at, k, d, bend]) => addMono(ld, t + at * BEAT_S, d * BEAT_S, lead(hz(blue[k]), d * BEAT_S, 0.3, bend), 0.55, 0.45));
      [SW, 1 + SW, 2 + SW, 3 + SW].forEach((at) => tones.forEach((m) => addMono(gtr, t + at * BEAT_S, 0.12, pluck(hz(m), 0.15), 0.3, 0.7)));
    }
  });

  renderPad(pad, { chordAt, levelAt: (t) => (scenes[sceneAt(t)].energy === 0 ? 0.005 : 0.003), cutoffAt: () => 800, xfade: 0.2 });
  echo(gtr, BEAT_S * 0.75 * 1000, 0.2);
  echo(ld, BEAT_S * 0.5 * 1000, 0.25);
  echo(hp_, BEAT_S * 0.5 * 1000, 0.2);

  const out = buffer(len);
  mix(out, gtr, 1.1);
  mix(out, drums, 0.85);
  mix(out, bass, 0.35);
  mix(out, hp_, 1.0);
  mix(out, ld, 0.7);
  mix(out, pad, 1);
  for (let i = 0; i < out[0].length; i++) {
    out[0][i] = Math.tanh(out[0][i]);
    out[1][i] = Math.tanh(out[1][i]);
  }
  fadeTail(out, songEnd);
  normalize(out, -1);
  return out;
};
