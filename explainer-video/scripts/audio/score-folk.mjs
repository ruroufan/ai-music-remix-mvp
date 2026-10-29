// "folk": an indie-folk score (used by 《ISFP · 回避》 — someone gentle who
// always slips away without a word) — another set of sounds: a fingerpicked
// steel-string guitar (plucked strings, Karplus–Strong), a soft stomp and a
// shaker, a bowed cello, a glockenspiel, a tambourine — and a whistled tune
// over a mandolin tremolo when it opens up.
//
// Per scene, `energy` decides what plays:
//   0  the fingerpicked guitar alone
//   1  + a soft stomp on 1 and 3, a shaker, a bass
//   2  + a cello, a glockenspiel, a tambourine on 2 and 4
//   3  + a whistled tune, a mandolin tremolo
// Between scenes: the bar before a scene with more energy, a strummed
// build and a stomp pickup; the bar before a breakdown, one ringing chord.
import { CHORD_NOTES, SR, addMono, biquad, buffer, echo, hz, mix, noise, normalize, rand } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

// plucked string: a noise burst through a damped delay line
const string = (f, vel = 1, bright = 0.5, decay = 0.996) => {
  const n = Math.max(2, Math.round(SR / f));
  const buf = Float32Array.from({ length: n }, () => (rand() * 2 - 1) * vel);
  // soften the burst so it sounds picked, not scraped
  for (let k = 0; k < 2; k++) for (let i = 1; i < n; i++) buf[i] = buf[i] * bright + buf[i - 1] * (1 - bright);
  let i = 0, prev = 0;
  return () => {
    const v = buf[i];
    const nx = (v + buf[(i + 1) % n]) * 0.5 * decay;
    buf[i] = nx;
    i = (i + 1) % n;
    prev = prev * 0.2 + v * 0.8;
    return prev;
  };
};
const stomp = (vel = 1) => {
  const lp = biquad();
  return (t) => (Math.sin(2 * Math.PI * (48 * t + (40 / 18) * (1 - Math.exp(-18 * t)))) * Math.exp(-t * 9) + lp(noise(), "lp", 300) * Math.exp(-t * 30) * 0.6) * vel;
};
const shaker = (vel = 1) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 7000) * Math.min(1, t / 0.01) * Math.exp(-t * 30) * vel;
};
const tamb = (vel = 1) => {
  const bp = biquad();
  return (t) => (bp(noise(), "bp", 8500, 1.5) * 0.8 + Math.sin(2 * Math.PI * 5200 * t) * 0.15) * Math.exp(-t * 12) * vel;
};
const bassNote = (f, dur, vel = 1) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.2 * Math.sin(4 * Math.PI * f * t)) * Math.exp(-t * 1.8) * Math.min(1, t / 0.01) * Math.min(1, (dur - t) / 0.04) * vel;
// bowed cello: a filtered saw-ish tone with a slow swell and vibrato
const cello = (f, dur, vel = 1) => {
  const lp = biquad();
  let ph = rand();
  return (t) => {
    const ff = f * (1 + 0.006 * Math.sin(2 * Math.PI * 5 * t) * Math.min(1, t / 0.4));
    ph = (ph + ff / SR) % 1;
    const saw = 2 * ph - 1;
    return lp(saw, "lp", 900, 0.7) * Math.min(1, t / 0.35) * Math.min(1, (dur - t) / 0.3) * vel;
  };
};
const glock = (f, vel = 1) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 6)) * Math.exp(-t * 3.5) * Math.min(1, t / 0.001) * vel;
// whistle: a near-sine with breath and a little scoop into each note
const whistle = (f, dur, vel = 1) => {
  const bp = biquad();
  let ph = rand();
  return (t) => {
    const ff = f * Math.pow(2, (-0.6 * Math.max(0, 1 - t / 0.06)) / 12) * (1 + 0.012 * Math.sin(2 * Math.PI * 5.5 * t) * Math.min(1, t / 0.25));
    ph = (ph + ff / SR) % 1;
    return (Math.sin(2 * Math.PI * ph) + bp(noise(), "bp", f * 2, 4) * 0.12) * Math.min(1, t / 0.04) * Math.min(1, (dur - t) / 0.06) * vel;
  };
};

export const scoreFolk = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const len = songEnd + 3;
  const gtr = buffer(len), drums = buffer(len), bass = buffer(len), cel = buffer(len), gl = buffer(len), wh = buffer(len), man = buffer(len), pad = buffer(len);
  const nBars = Math.round(songEnd / BAR_S);
  const E = BEAT_S / 2; // an eighth
  const bars = Array.from({ length: nBars }, (_, b) => {
    const t = b * BAR_S;
    const k = sceneAt(t + 1e-4);
    const s = scenes[k], next = scenes[k + 1];
    const last = t + BAR_S >= s.end - 1e-4;
    return { t, chord: chordAt(t + 1e-4), energy: s.energy, build: last && next && next.energy > s.energy && next.energy >= 2, stop: last && next && next.energy === 0 && s.energy > 0 };
  });
  // the whistled tune, in D major scale degrees over two bars (8 eighths each)
  const D = [62, 64, 66, 67, 69, 71, 73, 74, 76, 78];
  const TUNE = [
    [[0, 4, 3], [3, 5, 1], [4, 4, 2], [6, 2, 2]],
    [[0, 1, 2], [2, 2, 2], [4, 4, 4]],
  ];

  bars.forEach((bar, b) => {
    const { t, energy, chord } = bar;
    const notes = CHORD_NOTES[chord];
    let root = notes[0] % 12 + 36; if (root < 38) root += 12;
    const tones = [...new Set(notes.map((n) => n % 12))].map((p) => { let m = p; while (m < 57) m += 12; return m; }).sort((a, z) => a - z);

    if (bar.stop) {
      [root, root + 7, ...tones].forEach((m, i) => addMono(gtr, t + i * 0.03, 3, string(hz(m), 0.5, 0.5, 0.998), 0.5, 0.5));
      return;
    }
    // Travis picking: thumb alternates root / fifth on the beats, fingers on
    // the off-beats walk up and down the chord
    for (let e = 0; e < 8; e++) {
      const at = t + e * E;
      if (e % 2 === 0) addMono(gtr, at, 1.6, string(hz(root + (e % 4 ? 7 : 0)), 0.32, 0.35), 0.55, 0.45);
      else addMono(gtr, at, 1.4, string(hz(tones[[0, 1, 2, 1][(e >> 1) % 4] % tones.length] ?? tones[0]), 0.34, 0.55), 0.4, 0.6);
    }
    if (b % 2 === 1) addMono(gtr, t + 7 * E + E / 2, 1, string(hz(tones[tones.length - 1] + 12), 0.2, 0.6), 0.35, 0.65);
    if (bar.build) {
      // strummed build: down-up strums getting louder, stomps
      for (let e = 0; e < 8; e++) tones.forEach((m, i) => addMono(gtr, t + e * E + (e % 2 ? -i : i) * 0.008, 0.5, string(hz(m), 0.12 + 0.03 * e, 0.6, 0.99), 0.5, 0.5));
      [2, 3, 3.5].forEach((at) => addMono(drums, t + at * BEAT_S, 0.5, stomp(0.7)));
      return;
    }
    if (energy >= 1) {
      [0, 2].forEach((at) => addMono(drums, t + at * BEAT_S, 0.5, stomp(energy === 1 ? 0.4 : 0.55)));
      for (let e = 0; e < 8; e++) addMono(drums, t + e * E, 0.12, shaker(e % 2 ? 0.16 : 0.24), 0.4, 0.6);
      [0, 2].forEach((at, i) => addMono(bass, t + at * BEAT_S, 2 * BEAT_S * 0.95, bassNote(hz(root - 12 + (i ? 7 : 0)), 2 * BEAT_S * 0.95, 0.7)));
    }
    if (energy >= 2) {
      [1, 3].forEach((at) => addMono(drums, t + at * BEAT_S, 0.3, tamb(0.42), 0.6, 0.4));
      addMono(cel, t, BAR_S, cello(hz(root), BAR_S, 0.3), 0.6, 0.4);
      if (b % 2 === 0) [0, 3, 6].forEach((e, i) => addMono(gl, t + e * E, 1.2, glock(hz(tones[i % tones.length] + 24), 0.22), 0.4, 0.6));
    }
    if (energy >= 3) {
      TUNE[b % 2].forEach(([e, deg, d]) => addMono(wh, t + e * E, d * E, whistle(hz(D[deg] + 12), d * E, 0.22), 0.5, 0.5));
      // mandolin tremolo on the top two chord tones
      for (let i = 0; i < 32; i++) tones.slice(-2).forEach((m) => addMono(man, t + i * (BAR_S / 32), 0.12, string(hz(m + 12), 0.08, 0.7, 0.99), 0.65, 0.35));
    }
  });

  renderPad(pad, { chordAt, levelAt: (t) => (scenes[sceneAt(t)].energy === 0 ? 0.004 : 0.002), cutoffAt: () => 900, xfade: 0.2 });
  echo(gtr, BEAT_S * 0.75 * 1000, 0.15);
  echo(wh, BEAT_S * 0.75 * 1000, 0.25);
  echo(gl, BEAT_S * 0.5 * 1000, 0.3);

  const out = buffer(len);
  mix(out, gtr, 1.0);
  mix(out, drums, 0.7);
  mix(out, bass, 0.2);
  mix(out, cel, 0.5);
  mix(out, gl, 1.0);
  mix(out, wh, 0.9);
  mix(out, man, 0.7);
  mix(out, pad, 1);
  for (let i = 0; i < out[0].length; i++) {
    out[0][i] = Math.tanh(out[0][i]);
    out[1][i] = Math.tanh(out[1][i]);
  }
  fadeTail(out, songEnd);
  normalize(out, -1);
  return out;
};
