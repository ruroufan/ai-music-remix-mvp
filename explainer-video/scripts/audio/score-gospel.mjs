// "gospel": a warm gospel score (used by 《ENFJ · 付出》 — the kettle that
// fills everyone's cup but his own) — another set of sounds: a Hammond organ
// with a Leslie wobble and a swell pedal, a gospel piano comping, handclaps
// on 2 and 4, a shuffled kit, a bass — and a choir singing "aah".
//
// Per scene, `energy` decides what plays:
//   0  the organ alone, swelling
//   1  + the piano comping, soft claps on 2 and 4
//   2  + the kit (kick, snare backbeat, shuffled hats), the bass
//   3  + the choir, a tambourine, organ stabs
// Between scenes: the bar before a scene with more energy, a piano run up
// and a snare roll; the bar before a breakdown, a big held chord on 1 and
// silence.
import { CHORD_NOTES, SAW, SR, TABLE_SIZE, addMono, biquad, buffer, echo, hz, mix, noise, normalize, rand } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

// organ: drawbar sines (16', 8', 4', 2 2/3') through a Leslie (AM + slight FM)
const organ = (f, dur, vel = 1, swell = false) => {
  const ph = rand() * 6.28;
  return (t) => {
    const les = 1 + 0.004 * Math.sin(2 * Math.PI * 6.2 * t + ph);
    const w = 2 * Math.PI * f * les * t;
    const s = 0.5 * Math.sin(w * 0.5) + Math.sin(w) + 0.6 * Math.sin(w * 2) + 0.35 * Math.sin(w * 3) + 0.15 * Math.sin(w * 4);
    const am = 0.85 + 0.15 * Math.sin(2 * Math.PI * 6.2 * t + ph);
    const env = swell ? Math.min(1, t / (dur * 0.6)) : Math.min(1, t / 0.01);
    return s * am * env * Math.min(1, (dur - t) / 0.05) * vel * 0.3;
  };
};
const piano = (f, vel = 1) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t * 4) + 0.25 * Math.sin(6 * Math.PI * f * t) * Math.exp(-t * 7)) * Math.exp(-t * 2.2) * Math.min(1, t / 0.002) * vel;
const clap = (vel = 1) => {
  const bp = biquad();
  return (t) => bp(noise(), "bp", 1400, 0.7) * (Math.exp(-t * 30) + 0.6 * (t > 0.012 ? Math.exp(-(t - 0.012) * 30) : 0) + 0.4 * (t > 0.024 ? Math.exp(-(t - 0.024) * 18) : 0)) * vel;
};
const kick = (vel = 1) => (t) => Math.sin(2 * Math.PI * (55 * t + (80 / 30) * (1 - Math.exp(-30 * t)))) * Math.exp(-t * 9) * vel;
const snare = (vel = 1) => {
  const bp = biquad();
  return (t) => (Math.sin(2 * Math.PI * 200 * t) * Math.exp(-t * 25) * 0.5 + bp(noise(), "bp", 2800, 0.6) * Math.exp(-t * 16)) * vel;
};
const hat = (vel = 1) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 8500) * Math.exp(-t * 60) * vel;
};
const tamb = (vel = 1) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 7000) * Math.exp(-t * 35) * vel;
};
const bassNote = (f, dur, vel = 1) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(4 * Math.PI * f * t)) * Math.min(1, t / 0.005) * Math.exp(-t * 1.5) * Math.min(1, (dur - t) / 0.03) * vel;
// choir "aah": detuned saws through two formant band-passes
const choir = (f, dur, vel = 1) => {
  const f1 = biquad(), f2 = biquad();
  const vs = [-0.1, 0, 0.1].map((d) => ({ d, ph: rand() }));
  return (t) => {
    let s = 0;
    vs.forEach((v) => { v.ph = (v.ph + (f * (1 + v.d / 12) * (1 + 0.003 * Math.sin(2 * Math.PI * 5 * t))) / SR) % 1; s += SAW[(v.ph * TABLE_SIZE) | 0]; });
    s /= vs.length;
    return (f1(s, "bp", 750, 2) + 0.6 * f2(s, "bp", 1200, 2.5)) * Math.min(1, t / 0.15) * Math.min(1, (dur - t) / 0.1) * vel;
  };
};

const SWING = (i) => (i % 2 ? 0.66 : 0); // shuffled 8ths, in beats within the beat

export const scoreGospel = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const len = songEnd + 3;
  const org = buffer(len), pno = buffer(len), drums = buffer(len), perc = buffer(len), bass = buffer(len), ch = buffer(len), pad = buffer(len), fx = buffer(len);
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
    const beats = bar.stop ? 1 : 4;
    const rootPc = CHORD_NOTES[chord][0] % 12;
    let root = rootPc + 28; if (root < 31) root += 12;
    const tones = [...new Set(CHORD_NOTES[chord].map((n) => n % 12))].map((p) => { let m = p; while (m < 55) m += 12; return m; }).sort((a, z) => a - z);

    if (bar.first && b > 0 && bars[b - 1].build) addMono(fx, t, 1.4, (x) => Math.sin(2 * Math.PI * (42 * x + (60 / 8) * (1 - Math.exp(-8 * x)))) * Math.exp(-x * 2.5) * 0.7);
    // organ: a held voicing every bar
    const od = bar.stop ? BAR_S * 1.5 : BAR_S;
    tones.forEach((m, j) => addMono(org, t, od, organ(hz(m), od, energy === 0 ? 1 : 0.7, energy === 0), 0.5 + 0.1 * (j - 1), 0.5 - 0.1 * (j - 1)));
    if (energy >= 1 && !bar.build) {
      // piano: bass note on 1 and 3, chord on the shuffled "and"s
      [0, 2].forEach((at) => { if (at < beats) addMono(pno, t + at * BEAT_S, 1.5, piano(hz(root + 12), 0.5)); });
      [0.66, 1.66, 2.66, 3.66].forEach((at) => { if (at < beats) tones.forEach((m) => addMono(pno, t + at * BEAT_S, 0.8, piano(hz(m + 12), 0.28), 0.4, 0.6)); });
      [1, 3].forEach((at) => { if (at < beats) addMono(perc, t + at * BEAT_S, 0.2, clap(energy === 1 ? 0.35 : 0.5), 0.45, 0.55); });
    }
    if (energy >= 2 && !bar.build) {
      [0, 2.66].forEach((at) => { if (at < beats) addMono(drums, t + at * BEAT_S, 0.5, kick(1)); });
      [1, 3].forEach((at) => { if (at < beats) addMono(drums, t + at * BEAT_S, 0.3, snare(0.8)); });
      for (let i = 0; i < beats * 2; i++) addMono(perc, t + (Math.floor(i / 2) + SWING(i)) * BEAT_S, 0.05, hat(i % 2 ? 0.1 : 0.16), 0.6, 0.4);
      [[0, 0], [1.66, 7], [2, 12], [3, 10]].forEach(([at, off]) => { if (at < beats) addMono(bass, t + at * BEAT_S, BEAT_S * 0.9, bassNote(hz(root + off), BEAT_S * 0.9, 0.8)); });
    }
    if (energy >= 3 && !bar.build) {
      tones.forEach((m, j) => addMono(ch, t, BAR_S, choir(hz(m), BAR_S, 0.5), 0.35 + 0.15 * j, 0.65 - 0.15 * j));
      for (let i = 0; i < beats * 2; i++) addMono(perc, t + (Math.floor(i / 2) + SWING(i)) * BEAT_S, 0.1, tamb(i % 2 ? 0.1 : 0.2), 0.35, 0.65);
      [1.66, 3.66].forEach((at) => tones.forEach((m) => addMono(org, t + at * BEAT_S, 0.2, organ(hz(m + 12), 0.2, 0.6))));
    }
    if (bar.build) {
      // piano run up the chord tones, snare roll
      for (let i = 0; i < 12; i++) { const m = tones[i % tones.length] + 12 * Math.floor(i / tones.length); addMono(pno, t + 2 * BEAT_S + i * (BEAT_S / 6), 0.6, piano(hz(m + 12), 0.25 + i * 0.02)); }
      for (let i = 0; i < 16; i++) addMono(drums, t + i * (BEAT_S / 4), 0.15, snare(0.12 + i * 0.03), 0.5, 0.5);
    }
  });

  renderPad(pad, { chordAt, levelAt: (t) => (scenes[sceneAt(t)].energy === 0 ? 0.006 : 0.004), cutoffAt: () => 900, xfade: 0.15 });
  echo(pno, BEAT_S * 0.5 * 1000, 0.12);
  echo(ch, BEAT_S * 1000, 0.2);

  const out = buffer(len);
  mix(out, org, 1);
  mix(out, pno, 0.9);
  mix(out, drums, 0.85);
  mix(out, perc, 0.6);
  mix(out, bass, 0.75);
  mix(out, ch, 0.7);
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
