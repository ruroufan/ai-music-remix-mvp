// "disco": a 70s disco score (used by 《ESFJ · 被喜欢》 — a man in a ring of
// people holding up score cards) — another set of sounds: four-on-the-floor
// kick, an octave-jumping bass, open hi-hats on the off-beat, handclaps, a
// "chicken-scratch" rhythm guitar, a string section with runs and stabs —
// and a bell lead on top.
//
// Per scene, `energy` decides what plays:
//   0  a string pad and soft electric piano chords
//   1  + the four-on-the-floor kick, the octave bass
//   2  + open hats on the off-beat, claps on 2 and 4, the rhythm guitar
//   3  + string runs and stabs, a bell lead
// Between scenes: the bar before a scene with more energy, a rising string
// glissando and a tom fill; the bar before a breakdown, everything stops on
// a big string stab.
import { CHORD_NOTES, SAW, SR, TABLE_SIZE, addMono, biquad, buffer, echo, hz, mix, noise, normalize, rand } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

const kick = (vel = 1) => (t) => Math.sin(2 * Math.PI * (52 * t + (90 / 28) * (1 - Math.exp(-28 * t)))) * Math.exp(-t * 9) * vel;
const hat = (vel = 1, open = false) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 8000) * Math.exp(-t * (open ? 12 : 70)) * vel;
};
const clap = (vel = 1) => {
  const bp = biquad();
  return (t) => bp(noise(), "bp", 1500, 0.7) * (Math.exp(-t * 30) + 0.6 * (t > 0.01 ? Math.exp(-(t - 0.01) * 30) : 0) + 0.5 * (t > 0.022 ? Math.exp(-(t - 0.022) * 16) : 0)) * vel;
};
const tom = (f, vel = 1) => (t) => Math.sin(2 * Math.PI * f * t * (1 + 0.6 * Math.exp(-t * 20))) * Math.exp(-t * 10) * vel;
const bassNote = (f, dur, vel = 1) => {
  const lp = biquad();
  let ph = rand();
  return (t) => { ph = (ph + f / SR) % 1; return lp(SAW[(ph * TABLE_SIZE) | 0] * 0.6 + Math.sin(2 * Math.PI * ph) * 0.6, "lp", 600 + 900 * Math.exp(-t * 12), 1) * Math.min(1, t / 0.004) * Math.min(1, (dur - t) / 0.02) * vel; };
};
const strings = (f, dur, vel = 1, att = 0.15) => {
  const lp = biquad();
  const vs = [-0.09, 0, 0.09].map((d) => ({ d, ph: rand() }));
  return (t) => { let s = 0; vs.forEach((v) => { v.ph = (v.ph + (f * (1 + v.d / 12) * (1 + 0.003 * Math.sin(2 * Math.PI * 5.5 * t))) / SR) % 1; s += SAW[(v.ph * TABLE_SIZE) | 0]; }); return lp(s / 3, "lp", 2600, 0.6) * Math.min(1, t / att) * Math.min(1, (dur - t) / 0.08) * vel; };
};
const ep = (f, vel = 1) => (t) => Math.sin(2 * Math.PI * f * t + 1.1 * Math.exp(-t * 6) * Math.sin(2 * Math.PI * f * t)) * Math.exp(-t * 1.6) * Math.min(1, t / 0.004) * vel;
const scratch = (f, vel = 1) => {
  const bp = biquad();
  let ph = rand();
  return (t) => { ph = (ph + f / SR) % 1; return bp(SAW[(ph * TABLE_SIZE) | 0] + noise() * 0.3, "bp", 1600, 1.4) * Math.exp(-t * 40) * vel; };
};
const bell = (f, vel = 1) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(2 * Math.PI * f * 3.5 * t) * Math.exp(-t * 6)) * Math.exp(-t * 2.5) * Math.min(1, t / 0.001) * vel;

const LEAD = [[0, 2], [0.75, 3], [1.5, 2], [2, 1], [3, 2], [3.5, 3]];

export const scoreDisco = (ep_, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep_, tl, fps);
  const S16 = BEAT_S / 4;
  const len = songEnd + 3;
  const drums = buffer(len), perc = buffer(len), bass = buffer(len), str = buffer(len), keys = buffer(len), gtr = buffer(len), ld = buffer(len), pad = buffer(len), fx = buffer(len);
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
    const tones = [...new Set(CHORD_NOTES[chord].map((n) => n % 12))].map((p) => { let m = p; while (m < 60) m += 12; return m; }).sort((a, z) => a - z);
    const t4 = [...tones, tones[0] + 12];

    if (bar.first && b > 0 && bars[b - 1].build) tones.forEach((m) => addMono(str, t, 0.4, strings(hz(m + 12), 0.4, 0.5, 0.01)));
    if (bar.stop) {
      tones.forEach((m) => addMono(str, t, 1.5, strings(hz(m), 1.5, 0.6, 0.01)));
      addMono(drums, t, 0.5, kick(1));
      return;
    }
    // pad strings + electric piano: always
    tones.forEach((m, j) => addMono(str, t, BAR_S, strings(hz(m - 12), BAR_S, energy === 0 ? 0.35 : 0.2, 0.3), 0.4 + 0.1 * j, 0.6 - 0.1 * j));
    [0, 1.5, 2.5].forEach((at) => tones.forEach((m) => addMono(keys, t + at * BEAT_S, 1.2, ep(hz(m), energy === 0 ? 0.25 : 0.15), 0.55, 0.45)));
    if (bar.build) {
      // a rising string gliss and a tom fill
      addMono(fx, t, BAR_S, (x) => { const f = hz(tones[0]) * Math.pow(2, x / BAR_S * 1.5); return Math.sin(2 * Math.PI * f * x) * (x / BAR_S) * 0.3; }, 0.5, 0.5);
      [2, 2.5, 3, 3.25, 3.5, 3.75].forEach((at, i) => addMono(drums, t + at * BEAT_S, 0.4, tom(160 - i * 14, 0.6), 0.5, 0.5));
      [0, 1].forEach((at) => addMono(drums, t + at * BEAT_S, 0.5, kick(0.9)));
      return;
    }
    if (energy >= 1) {
      for (let i = 0; i < 4; i++) addMono(drums, t + i * BEAT_S, 0.5, kick(1));
      for (let i = 0; i < 8; i++) addMono(bass, t + i * (BEAT_S / 2), BEAT_S * 0.45, bassNote(hz(root + (i % 2 ? 12 : 0)), BEAT_S * 0.45, 0.7));
    }
    if (energy >= 2) {
      for (let i = 0; i < 4; i++) addMono(perc, t + (i + 0.5) * BEAT_S, 0.3, hat(0.2, true), 0.6, 0.4);
      for (let i = 0; i < 16; i += 2) addMono(perc, t + i * S16, 0.05, hat(0.07), 0.4, 0.6);
      [1, 3].forEach((at) => addMono(perc, t + at * BEAT_S, 0.2, clap(0.6), 0.5, 0.5));
      for (let i = 0; i < 16; i++) if (i % 4 !== 0) addMono(gtr, t + i * S16, 0.05, scratch(hz(tones[i % 3]), i % 2 ? 0.25 : 0.4), 0.3, 0.7);
    }
    if (energy >= 3) {
      // string run up into each bar's stab on the "and" of 4
      for (let i = 0; i < 6; i++) addMono(str, t + 3 * BEAT_S + i * (BEAT_S / 12), 0.12, strings(hz(t4[i % 4] + 12), 0.12, 0.35, 0.01), 0.5, 0.5);
      [0.5, 2.5].forEach((at) => tones.forEach((m) => addMono(str, t + at * BEAT_S, 0.18, strings(hz(m), 0.18, 0.45, 0.01))));
      LEAD.forEach(([at, k]) => addMono(ld, t + at * BEAT_S, 1, bell(hz(t4[k] + 12), 0.28), 0.5, 0.5));
    }
  });

  renderPad(pad, { chordAt, levelAt: () => 0.004, cutoffAt: () => 900, xfade: 0.15 });
  echo(keys, BEAT_S * 0.75 * 1000, 0.2);
  echo(ld, BEAT_S * 0.75 * 1000, 0.3);

  const out = buffer(len);
  mix(out, drums, 0.6);
  mix(out, perc, 1.3);
  mix(out, bass, 0.35);
  mix(out, str, 0.8);
  mix(out, keys, 0.9);
  mix(out, gtr, 0.7);
  mix(out, ld, 0.8);
  mix(out, pad, 1);
  mix(out, fx, 0.6);
  for (let i = 0; i < out[0].length; i++) {
    out[0][i] = Math.tanh(out[0][i]);
    out[1][i] = Math.tanh(out[1][i]);
  }
  fadeTail(out, songEnd);
  normalize(out, -1);
  return out;
};
