// "bossanova": a bossa nova score (used by 《INFP · 理想》 — a glowing flower
// kept under a glass dome on a grey street) — another set of sounds: a nylon-
// string guitar comping the bossa pattern (thumb on the bass, chords on the
// syncopations), a rim-click clave, a shaker, an upright bass walking root
// and fifth, a brushed kit, a flute line — and strings when it opens up.
//
// Per scene, `energy` decides what plays:
//   0  the nylon guitar alone
//   1  + the rim-click clave and a soft shaker
//   2  + the upright bass, a brushed kit (kick, swish), a soft Rhodes pad
//   3  + a flute melody and a string section swelling on each bar
// Between scenes: the bar before a scene with more energy, a guitar strum
// run and a cymbal swell; the bar before a breakdown, it all stops on 3 and
// the guitar's last chord rings.
import { CHORD_NOTES, SAW, SR, TABLE_SIZE, addMono, biquad, buffer, echo, hz, mix, noise, normalize, rand } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

// nylon guitar: a soft Karplus-ish pluck (sine + few partials, warm decay)
const nylon = (f, vel = 1) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.45 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t * 5) + 0.2 * Math.sin(6 * Math.PI * f * t) * Math.exp(-t * 9)) * Math.exp(-t * 2.6) * Math.min(1, t / 0.003) * vel;
const rim = (vel = 1) => (t) => (Math.sin(2 * Math.PI * 1600 * t) + 0.6 * Math.sin(2 * Math.PI * 740 * t)) * Math.exp(-t * 110) * vel;
const shaker = (vel = 1) => {
  const bp = biquad();
  return (t) => bp(noise(), "bp", 6500, 0.8) * Math.sin(Math.PI * Math.min(1, t / 0.06)) * vel;
};
const kick = (vel = 1) => (t) => Math.sin(2 * Math.PI * (55 * t + (50 / 25) * (1 - Math.exp(-25 * t)))) * Math.exp(-t * 12) * vel;
const brush = (vel = 1) => {
  const bp = biquad();
  return (t) => bp(noise(), "bp", 3500, 0.5) * Math.exp(-t * 9) * Math.min(1, t / 0.02) * vel;
};
const upright = (f, dur, vel = 1) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t * 8)) * Math.exp(-t * 3) * Math.min(1, t / 0.008) * Math.min(1, (dur - t) / 0.03) * vel;
const flute = (f, dur, vel = 1) => {
  const lp = biquad();
  return (t) => {
    const vib = 1 + 0.006 * Math.sin(2 * Math.PI * 5.2 * t) * Math.min(1, t / 0.3);
    const tone = Math.sin(2 * Math.PI * f * vib * t) + 0.12 * Math.sin(4 * Math.PI * f * t);
    return (tone + lp(noise(), "lp", 3000) * 0.05) * Math.min(1, t / 0.06) * Math.min(1, (dur - t) / 0.08) * vel;
  };
};

// bossa: 16th steps in a bar; bass thumb on 0, 6, 8, 14; chords on the clave-ish syncopations
const THUMB = [0, 6, 8, 14];
const CHORD = [0, 3, 6, 10, 12];
const CLAVE = [0, 3, 6, 10, 13];
const MELODY = [[0, 2, 1.5], [1.5, 1, 0.5], [2, 0, 1], [3, 1, 1]];

export const scoreBossanova = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const S16 = BEAT_S / 4;
  const len = songEnd + 3;
  const gtr = buffer(len), perc = buffer(len), drums = buffer(len), bass = buffer(len), fl = buffer(len), str = buffer(len), pad = buffer(len), fx = buffer(len);
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
    const steps = bar.stop ? 9 : 16;
    const rootPc = CHORD_NOTES[chord][0] % 12;
    let root = rootPc + 40; if (root < 43) root += 12;
    const tones = [...new Set(CHORD_NOTES[chord].map((n) => n % 12))].map((p) => { let m = p; while (m < 55) m += 12; return m; }).sort((a, z) => a - z);
    // a jazzier voicing: add the 7th or 9th above
    const seventh = CHORD_NOTES[chord].length && tones[0] + (chord.endsWith("m") ? 10 : 11);
    const voicing = [...tones, seventh];

    if (bar.first && b > 0 && bars[b - 1].build) addMono(fx, t, 1.2, (x) => Math.sin(2 * Math.PI * (45 * x + (40 / 10) * (1 - Math.exp(-10 * x)))) * Math.exp(-x * 3) * 0.6);
    // guitar: always
    if (!bar.build) {
      THUMB.forEach((i) => { if (i < steps) addMono(gtr, t + i * S16, 0.6, nylon(hz(i === 6 || i === 14 ? root - 12 + 7 : root - 12), 0.55), 0.55, 0.45); });
      CHORD.forEach((i, k) => { if (i < steps) voicing.forEach((m, j) => addMono(gtr, t + i * S16 + j * 0.006, i === 12 && bar.stop ? 2.5 : 0.35, nylon(hz(m), energy === 0 ? 0.3 : 0.24), 0.4 + 0.07 * j, 0.6 - 0.07 * j)); void k; });
    }
    if (energy >= 1 && !bar.build) {
      CLAVE.forEach((i) => { if (i < steps) addMono(perc, t + i * S16, 0.1, rim(0.3), 0.4, 0.6); });
      for (let i = 0; i < steps; i += 2) addMono(perc, t + i * S16, 0.12, shaker(i % 4 === 2 ? 0.2 : 0.12), 0.65, 0.35);
    }
    if (energy >= 2 && !bar.build) {
      for (const i of [0, 6, 8, 14]) if (i < steps) addMono(drums, t + i * S16, 0.4, kick(i % 8 === 0 ? 0.8 : 0.55));
      for (const i of [4, 12]) if (i < steps) addMono(drums, t + i * S16, 0.3, brush(0.35), 0.5, 0.5);
      [[0, root], [6, root + 7], [8, root + 7], [12, root + 12], [14, root]].forEach(([i, m]) => { if (i < steps) addMono(bass, t + i * S16, S16 * 2.5, upright(hz(m), S16 * 2.5, 0.7)); });
    }
    if (energy >= 3 && !bar.build) {
      MELODY.forEach(([at, k, d]) => { if (at * 4 < steps) addMono(fl, t + at * BEAT_S, d * BEAT_S, flute(hz(voicing[k] + 12), d * BEAT_S, 0.32), 0.45, 0.55); });
      // strings: detuned saws, filtered, swelling over the bar
      const lp = biquad();
      const vs = tones.flatMap((m) => [-0.07, 0.07].map((d) => ({ m: m + d, ph: rand() })));
      const dur = (steps / 16) * BAR_S;
      addMono(str, t, dur, (x) => { let s = 0; vs.forEach((v) => { v.ph = (v.ph + hz(v.m) / SR) % 1; s += SAW[(v.ph * TABLE_SIZE) | 0]; }); return lp(s / vs.length, "lp", 1600, 0.7) * Math.sin(Math.PI * Math.min(1, x / dur)) * 0.6; }, 0.5, 0.5);
    }
    if (bar.build) {
      // a strummed run down the voicing on every 8th, and a cymbal swell
      for (let i = 0; i < 8; i++) voicing.forEach((m, j) => addMono(gtr, t + i * 2 * S16 + j * 0.012, 0.3, nylon(hz(m), 0.18 + i * 0.02)));
      const hp = biquad();
      addMono(fx, t, BAR_S, (x) => hp(noise(), "hp", 5000) * (x / BAR_S) ** 3 * 0.5, 0.5, 0.5);
    }
  });

  renderPad(pad, { chordAt, levelAt: (t) => (scenes[sceneAt(t)].energy >= 2 ? 0.008 : 0.005), cutoffAt: () => 1000, xfade: 0.15 });
  echo(gtr, BEAT_S * 0.75 * 1000, 0.18);
  echo(fl, BEAT_S * 0.5 * 1000, 0.3);

  const out = buffer(len);
  mix(out, gtr, 1.15);
  mix(out, perc, 0.6);
  mix(out, drums, 0.8);
  mix(out, bass, 0.8);
  mix(out, fl, 0.9);
  mix(out, str, 0.55);
  mix(out, pad, 1);
  mix(out, fx, 0.4);
  for (let i = 0; i < out[0].length; i++) {
    out[0][i] = Math.tanh(out[0][i] * 1.1);
    out[1][i] = Math.tanh(out[1][i] * 1.1);
  }
  fadeTail(out, songEnd);
  normalize(out, -1);
  return out;
};
