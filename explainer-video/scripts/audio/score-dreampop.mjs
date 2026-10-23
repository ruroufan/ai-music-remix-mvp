// "dreampop": a hazy dream-pop score (used by 《INFJ · 不被懂》 — a lamp that
// lights everyone's room but its own) — another set of sounds: a music box
// like a small light, a chorused clean guitar arpeggio through a dotted-8th
// delay, a slow half-time kit with a big washed-out snare, a round bass —
// and at the top, a shoegaze wall of detuned saws that swells in.
//
// Per scene, `energy` decides what plays:
//   0  a music box alone over a soft pad
//   1  + the chorus guitar arpeggio, a soft kick on 1 and the "and" of 3
//   2  + the half-time kit (snare on 3, wide and washy), 8th-note bass
//   3  + the shoegaze wall, a tambourine in 16ths, a glockenspiel line
// Between scenes: the bar before a scene with more energy, a reversed
// swell and a tom roll into the downbeat; the bar before a breakdown,
// everything lets go on 3 and rings out.
import { CHORD_NOTES, SAW, SR, TABLE_SIZE, addMono, biquad, buffer, echo, hz, mix, noise, normalize, rand } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

const kick = (vel = 1) => (t) => Math.sin(2 * Math.PI * (52 * t + (70 / 22) * (1 - Math.exp(-22 * t)))) * Math.exp(-t * 7) * vel;
const snare = (vel = 1) => {
  const bp = biquad(), lp = biquad();
  return (t) => (Math.sin(2 * Math.PI * 190 * t) * Math.exp(-t * 20) * 0.5 + lp(bp(noise(), "bp", 2200, 0.5), "lp", 6000) * Math.exp(-t * 7)) * vel;
};
const tom = (f, vel = 1) => (t) => Math.sin(2 * Math.PI * f * t * (1 + 0.5 * Math.exp(-t * 18))) * Math.exp(-t * 9) * vel;
const tamb = (vel = 1) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 7000) * (Math.exp(-t * 45) + 0.4 * Math.exp(-Math.max(0, t - 0.02) * 60) * (t > 0.02 ? 1 : 0)) * vel;
};
// music box: bright sine partials, inharmonic tine, long ring
const box = (f, vel = 1) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 3.01 * t) * Math.exp(-t * 6) + 0.2 * Math.sin(2 * Math.PI * f * 5.4 * t) * Math.exp(-t * 14)) * Math.exp(-t * 1.8) * Math.min(1, t / 0.002) * vel;
const glock = (f, vel = 1) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 8)) * Math.exp(-t * 3) * Math.min(1, t / 0.001) * vel;
// clean guitar: plucked saw through a soft lowpass, chorused by two voices
const guitar = (f, vel = 1) => {
  const lp = biquad();
  const vs = [0, 0.004].map((d) => ({ d, ph: rand() }));
  return (t) => {
    let s = 0;
    vs.forEach((v) => { v.ph = (v.ph + (f * (1 + v.d * Math.sin(2 * Math.PI * 0.8 * t))) / SR) % 1; s += SAW[(v.ph * TABLE_SIZE) | 0]; });
    return lp(s * 0.5, "lp", 700 + 2600 * Math.exp(-t * 9), 0.9) * Math.exp(-t * 2.4) * Math.min(1, t / 0.003) * vel;
  };
};
const bassNote = (f, dur, vel = 1) => {
  const lp = biquad();
  let ph = rand();
  return (t) => { ph = (ph + f / SR) % 1; return lp(SAW[(ph * TABLE_SIZE) | 0], "lp", 400, 0.8) * Math.min(1, t / 0.005) * Math.min(1, (dur - t) / 0.02) * vel; };
};

const ARP = [0, 2, 1, 3, 2, 1, 3, 2]; // 8ths over the voicing
const GLOCK = [[0, 3], [1.5, 2], [2, 1], [3, 2]];

export const scoreDreampop = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const S8 = BEAT_S / 2, S16 = BEAT_S / 4;
  const len = songEnd + 3;
  const drums = buffer(len), perc = buffer(len), bass = buffer(len), gtr = buffer(len), mbox = buffer(len), wall = buffer(len), bell = buffer(len), pad = buffer(len), fx = buffer(len);
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
    const beats = bar.stop ? 2.5 : 4;
    const rootPc = CHORD_NOTES[chord][0] % 12;
    let root = rootPc + 28; if (root < 31) root += 12;
    const tones = [...new Set(CHORD_NOTES[chord].map((n) => n % 12))].map((p) => { let m = p; while (m < 64) m += 12; return m; }).sort((a, z) => a - z);
    const v4 = [tones[0] - 12, ...tones, tones[0] + 12].slice(0, 4);

    if (bar.first && b > 0 && bars[b - 1].build) addMono(fx, t, 1.5, (x) => Math.sin(2 * Math.PI * (38 * x + (50 / 6) * (1 - Math.exp(-6 * x)))) * Math.exp(-x * 2.2) * 0.8);
    // music box: always, a little figure on 1, 2½, 3
    [[0, 2], [1.5, 1], [2, 0], [3, 1]].forEach(([at, k], i) => {
      if (at >= beats) return;
      if (energy >= 2 && i % 2) return;
      addMono(mbox, t + at * BEAT_S, 2.5, box(hz(tones[k] + 12), energy === 0 ? 0.42 : 0.26), 0.4 + 0.2 * (i % 2), 0.6 - 0.2 * (i % 2));
    });
    if (energy >= 1 && !bar.build) {
      ARP.forEach((k, i) => { if (i * S8 < beats * BEAT_S) addMono(gtr, t + i * S8, 1.2, guitar(hz(v4[k]), energy === 1 ? 0.5 : 0.4), i % 2 ? 0.35 : 0.65, i % 2 ? 0.65 : 0.35); });
      for (const at of [0, 2.5]) if (at < beats) addMono(drums, t + at * BEAT_S, 0.6, kick(energy === 1 ? 0.75 : 1));
    }
    if (energy >= 2 && !bar.build) {
      if (2 < beats) addMono(drums, t + 2 * BEAT_S, 1.2, snare(0.85));
      for (let i = 0; i < beats * 2; i++) addMono(bass, t + i * S8, S8 * 0.9, bassNote(hz(root), S8 * 0.9, i % 2 ? 0.5 : 0.65));
      for (let i = 0; i < beats * 2; i++) addMono(perc, t + i * S8, 0.08, tamb(0.12), 0.65, 0.35);
    }
    if (energy >= 3 && !bar.build) {
      for (let i = 0; i < beats * 4; i++) addMono(perc, t + i * S16, 0.08, tamb(i % 2 ? 0.08 : 0.16), 0.35, 0.65);
      // the wall: detuned saws, slow swell, chord tones in two octaves
      const lp = biquad();
      const vs = [...tones, tones[0] - 12].flatMap((m) => [-0.12, 0, 0.12].map((d) => ({ m: m + d - 12, ph: rand() })));
      const dur = beats * BEAT_S;
      addMono(wall, t, dur, (x) => {
        let s = 0;
        vs.forEach((v) => { v.ph = (v.ph + hz(v.m) / SR) % 1; s += SAW[(v.ph * TABLE_SIZE) | 0]; });
        return lp(Math.tanh(s / vs.length * 3), "lp", 1400 + 600 * Math.sin(Math.PI * x / dur), 0.7) * Math.min(1, x / 0.25) * Math.min(1, (dur - x) / 0.05) * 0.5;
      }, 0.5, 0.5);
      GLOCK.forEach(([at, k]) => { if (at < beats) addMono(bell, t + at * BEAT_S, 2, glock(hz(tones[k % tones.length] + 24), 0.3), 0.55, 0.45); });
    }
    if (bar.build) {
      // a tom roll and a reversed swell
      [0, 1, 2, 2.5, 3, 3.25, 3.5, 3.75].forEach((at, i) => addMono(drums, t + at * BEAT_S, 0.5, tom(i < 4 ? 140 : 100, 0.35 + i * 0.07), 0.5, 0.5));
      const hp = biquad();
      addMono(fx, t, BAR_S, (x) => hp(noise(), "hp", 2000 + 4000 * (x / BAR_S)) * (x / BAR_S) ** 3 * 0.6, 0.5, 0.5);
      ARP.slice(0, 4).forEach((k, i) => addMono(gtr, t + i * S8, 1.2, guitar(hz(v4[k]), 0.4)));
    }
  });

  renderPad(pad, { chordAt, levelAt: (t) => (scenes[sceneAt(t)].energy === 0 ? 0.016 : 0.009), cutoffAt: () => 1100, xfade: 0.2 });
  echo(gtr, BEAT_S * 0.75 * 1000, 0.45);
  echo(mbox, BEAT_S * 1.5 * 1000, 0.35);
  echo(bell, BEAT_S * 0.75 * 1000, 0.4);
  echo(drums, BEAT_S * 0.5 * 1000, 0.12);

  const out = buffer(len);
  mix(out, drums, 0.9);
  mix(out, perc, 0.5);
  mix(out, bass, 0.65);
  mix(out, gtr, 0.9);
  mix(out, mbox, 1.1);
  mix(out, wall, 0.55);
  mix(out, bell, 0.8);
  mix(out, pad, 1.1);
  mix(out, fx, 0.4);
  for (let i = 0; i < out[0].length; i++) {
    out[0][i] = Math.tanh(out[0][i] * 1.1);
    out[1][i] = Math.tanh(out[1][i] * 1.1);
  }
  fadeTail(out, songEnd);
  normalize(out, -1);
  return out;
};
