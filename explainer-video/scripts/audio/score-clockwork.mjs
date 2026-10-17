// "clockwork": a ticking, plucked score (used by 《拖延》) — a different set of
// sounds from "drive": no four-on-the-floor, no saw bass, no square arp.
//
// Per scene, `energy` decides what plays:
//   0  pad + a clock ticking in a quiet room (+ a bell on the downbeat)
//   1  + tick-tock woodblock on every 8th, pizzicato ostinato in 8ths, piano bass
//   2  + half-time drums: kick on 1 and the "and" of 3, big snare on 3, shaker
//   3  + pizzicato doubles to 16ths, bell counter-melody
// Between scenes: the bar before a scene with more energy, the clock speeds up
// (8ths → 16ths → 32nds) under a riser; the beat before a breakdown, an alarm
// bell rings and everything stops.
import { CHORD_NOTES, SR, addMono, biquad, echo, hz, mix, noise, normalize, buffer, pianoNote } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

// ---- voices (each returns a sample function of t seconds) ----
const tick = (vel = 1, pitch = 2600) => {
  const bp = biquad();
  return (t) => (bp(noise(), "bp", pitch, 6) * 2.2 + Math.sin(2 * Math.PI * pitch * 0.7 * t) * 0.6) * Math.exp(-t * 90) * vel;
};
const kick = (vel = 1) => (t) => Math.sin(2 * Math.PI * (50 * t + (90 / 20) * (1 - Math.exp(-20 * t)))) * Math.exp(-t * 5) * vel;
const snare = (vel = 1) => {
  const bp = biquad(), lp = biquad();
  return (t) => (Math.sin(2 * Math.PI * 160 * t) * Math.exp(-t * 18) * 0.5 + lp(bp(noise(), "bp", 1800, 0.6), "lp", 6000) * Math.exp(-t * 7) * 1.2) * vel;
};
const shaker = (vel = 1) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 6000) * Math.min(1, t / 0.012) * Math.exp(-t * 45) * vel;
};
// plucked string: a few harmonics through a body resonance, fast decay
const pizz = (f, vel = 1) => {
  const bp = biquad();
  return (t) => {
    const env = Math.min(1, t / 0.003) * Math.exp(-t * 9);
    const s = Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t * 20) + 0.25 * Math.sin(6 * Math.PI * f * t) * Math.exp(-t * 30);
    return (s * 0.7 + bp(s, "bp", 900, 0.8) * 0.6) * env * vel;
  };
};
// FM bell
const bell = (f, vel = 1) => (t) => Math.sin(2 * Math.PI * f * t + 2.2 * Math.exp(-t * 3) * Math.sin(2 * Math.PI * f * 3.5 * t)) * Math.exp(-t * 2.2) * vel;

const tonesOf = (chord, low) => [...new Set(CHORD_NOTES[chord].map((n) => { let m = n; while (m < low) m += 12; return m; }))].sort((a, b) => a - b);

export const scoreClockwork = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const S16 = BEAT_S / 4;
  const len = songEnd + 3;
  const clock = buffer(len), drums = buffer(len), strings = buffer(len), bass = buffer(len), bells = buffer(len), pad = buffer(len), fx = buffer(len);
  const nBars = Math.round(songEnd / BAR_S);
  const duck = new Float32Array(Math.ceil(len * SR)).fill(1);

  const bars = Array.from({ length: nBars }, (_, b) => {
    const t = b * BAR_S;
    const k = sceneAt(t + 1e-4);
    const s = scenes[k], next = scenes[k + 1];
    const last = t + BAR_S >= s.end - 1e-4;
    return {
      t,
      chord: chordAt(t + 1e-4),
      energy: s.energy,
      first: Math.abs(t - s.start) < 1e-4,
      build: last && next && next.energy > s.energy && next.energy >= 2,
      stop: last && next && next.energy === 0 && s.energy > 0,
    };
  });

  bars.forEach((bar, b) => {
    const { t, energy, chord } = bar;
    const steps = bar.stop ? 12 : 16;

    // --- the clock: always there; it's the subject of the episode
    if (bar.build) {
      // speeding up: 8ths, then 16ths, then 32nds
      const hits = [];
      for (let i = 0; i < 4; i++) hits.push(i * 2 * S16);
      for (let i = 0; i < 4; i++) hits.push(2 * BEAT_S + i * S16);
      for (let i = 0; i < 8; i++) hits.push(3 * BEAT_S + i * (S16 / 2));
      hits.forEach((o, i) => addMono(clock, t + o, 0.08, tick(0.35 + 0.5 * (i / hits.length), i % 2 ? 1900 : 2600), i % 2 ? 0.6 : 1, i % 2 ? 1 : 0.6));
      const bp = biquad();
      addMono(fx, t, BAR_S, (x) => { const k = x / BAR_S; return bp(noise(), "bp", 400 + 5000 * k * k, 3) * k * k; });
    } else if (energy === 0) {
      for (let i = 0; i < 4; i++) addMono(clock, t + i * BEAT_S, 0.08, tick(0.35, i % 2 ? 1900 : 2600), i % 2 ? 0.7 : 1, i % 2 ? 1 : 0.7);
    } else {
      for (let i = 0; i < steps; i += 2) addMono(clock, t + i * S16, 0.08, tick(i % 4 === 0 ? 0.5 : 0.32, i % 4 === 0 ? 2600 : 1900), i % 4 ? 0.6 : 1, i % 4 ? 1 : 0.6);
    }
    if (bar.stop) {
      addMono(fx, t + 3 * BEAT_S, 1.6, bell(hz(88), 0.5)); // the alarm: a high ding into silence
      addMono(fx, t + 3 * BEAT_S + 0.09, 1.4, bell(hz(88), 0.35));
    }
    if (energy === 0 && bar.first) addMono(bells, t, 3, bell(hz(tonesOf(chord, 72)[0]), 0.35));

    // --- pizzicato ostinato
    if (energy >= 1) {
      const tn = tonesOf(chord, 55);
      const run = [tn[0], tn[2] ?? tn[1], tn[1], tn[2] ?? tn[1], tn[0] + 12, tn[2] ?? tn[1], tn[1], tn[2] ?? tn[1]];
      const sixteenths = energy >= 3 && !bar.build;
      const n = sixteenths ? steps : steps / 2;
      for (let i = 0; i < n; i++) {
        const o = i * (sixteenths ? S16 : 2 * S16);
        const note = run[i % run.length];
        const acc = (sixteenths ? i % 4 === 0 : i % 2 === 0) ? 1 : 0.65;
        const pan = 0.3 + 0.4 * (i % 2);
        addMono(strings, t + o, 0.5, pizz(hz(note), acc * (bar.build ? 0.5 + 0.5 * (i / n) : 1)), 1 - pan, pan);
      }
    }

    // --- piano bass: syncopated low octaves (1, and-of-2, 4)
    if (energy >= 1 && !bar.build) {
      const root = CHORD_NOTES[chord][0];
      const low = root < 31 ? root + 12 : root;
      for (const [o, v] of [[0, 0.5], [1.5, 0.35], [3, 0.3]]) {
        if (bar.stop && o >= 3) continue;
        pianoNote(bass, t + o * BEAT_S, low, v, 0.5);
        pianoNote(bass, t + o * BEAT_S, low + 12, v * 0.5, 0.5);
      }
    }

    // --- half-time drums
    if (energy >= 2 && !bar.build) {
      const kicks = energy >= 3 ? [0, 6, 10] : [0, 10];
      for (const i of kicks) if (i < steps) {
        addMono(drums, t + i * S16, 0.6, kick(i === 0 ? 1 : 0.75));
        const s0 = Math.round((t + i * S16) * SR);
        for (let j = 0; j < 0.35 * SR && s0 + j < duck.length; j++) duck[s0 + j] = Math.min(duck[s0 + j], 1 - 0.55 * Math.exp(-(j / SR) / 0.1));
      }
      if (8 < steps) addMono(drums, t + 8 * S16, 0.9, snare(0.85));
      for (let i = 0; i < steps; i++) {
        const swing = i % 2 ? S16 * 0.14 : 0;
        addMono(drums, t + i * S16 + swing, 0.08, shaker(i % 4 === 2 ? 0.2 : 0.11), 0.55, 0.45);
      }
      if (bar.first) addMono(bells, t, 3, bell(hz(tonesOf(chord, 76)[0]), 0.25));
    }

    // --- bell counter-melody at the peak
    if (energy >= 3 && !bar.build) {
      const tn = tonesOf(chord, 74);
      const line = [[0, tn[0]], [1.5, tn[1]], [2.5, tn[2] ?? tn[0] + 12], [3.5, tn[1]]];
      for (const [o, note] of line) if (o * 4 < steps) addMono(bells, t + o * BEAT_S, 2, bell(hz(note), b % 2 ? 0.16 : 0.2), 0.7, 1);
    }
  });

  // A low, dark string pad under everything; louder when the beat drops out.
  renderPad(pad, {
    chordAt,
    levelAt: (t) => (scenes[sceneAt(t)].energy === 0 ? 0.07 : 0.035),
    cutoffAt: (t) => 380 + 180 * scenes[sceneAt(t)].energy,
    xfade: 0.08,
  });

  for (const buf of [bass, pad, strings]) for (let i = 0; i < buf[0].length && i < duck.length; i++) { buf[0][i] *= duck[i]; buf[1][i] *= duck[i]; }
  echo(drums, BEAT_S * 0.5 * 1000, 0.18); // the snare's big room
  echo(bells, BEAT_S * 0.75 * 1000, 0.35);
  echo(strings, BEAT_S * 0.25 * 1000, 0.12);

  const out = buffer(len);
  mix(out, clock, 0.5);
  mix(out, drums, 0.9);
  mix(out, strings, 0.32);
  mix(out, bass, 0.55);
  mix(out, bells, 0.3);
  mix(out, pad, 1);
  mix(out, fx, 0.3);
  for (let i = 0; i < out[0].length; i++) { out[0][i] = Math.tanh(out[0][i] * 1.05); out[1][i] = Math.tanh(out[1][i] * 1.05); }

  fadeTail(out, songEnd);
  normalize(out, -1);
  return out;
};
