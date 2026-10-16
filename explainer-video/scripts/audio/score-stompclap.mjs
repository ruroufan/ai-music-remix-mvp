// "stompclap": a bright stomp-and-clap folk-pop score (used by 《完美主义》, the
// whiteboard episode) — another set of sounds: strummed acoustic guitar
// (Karplus–Strong strings), stomps, layered hand claps, finger snaps, a
// glockenspiel melody and a plucked upright bass.
//
// Per scene, `energy` decides what plays:
//   0  a gently picked guitar + glockenspiel
//   1  + snaps on 2 and 4, upright bass, guitar strums in 8ths
//   2  + stomp on every beat, big layered clap on 2 and 4
//   3  + the glockenspiel melody and a shaker, strums go 16th
// Between scenes: the bar before a scene with more energy, the claps speed up
// (quarters → 8ths → 16ths) under a strum tremolo; the beat before a breakdown,
// one muted strum and everyone stops.
import { CHORD_NOTES, SR, addMono, biquad, buffer, echo, hz, mix, noise, normalize, rand } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

// Karplus–Strong string straight into `out`
const pluck = (out, t0, midi, vel = 1, pan = 0.5, decay = 0.996, dur = 2.2, bright = 0.6) => {
  const f = hz(midi), n = Math.max(2, Math.round(SR / f));
  const buf = new Float32Array(n);
  for (let i = 0; i < n; i++) buf[i] = (rand() * 2 - 1);
  const s0 = Math.round(t0 * SR), len = Math.round(dur * SR);
  let idx = 0;
  for (let i = 0; i < len && s0 + i < out[0].length; i++) {
    if (s0 + i < 0) continue;
    const y = buf[idx], nx = buf[(idx + 1) % n];
    buf[idx] = (y * (0.5 + 0.25 * bright) + nx * (0.5 - 0.25 * bright)) * decay;
    idx = (idx + 1) % n;
    const fadeOut = i > len - 400 ? (len - i) / 400 : 1;
    out[0][s0 + i] += y * vel * (1 - pan) * fadeOut;
    out[1][s0 + i] += y * vel * pan * fadeOut;
  }
};
const stomp = (vel = 1) => {
  const lp = biquad();
  return (t) => (Math.sin(2 * Math.PI * (55 * t + (70 / 18) * (1 - Math.exp(-18 * t)))) * Math.exp(-t * 9) + lp(noise(), "lp", 300) * Math.exp(-t * 20) * 0.9) * vel;
};
const clap = (vel = 1, spread = 0) => {
  const bp = biquad();
  const offs = [0, 0.008 + spread, 0.017 + spread * 1.5, 0.026 + spread * 2];
  return (t) => bp(noise(), "bp", 1400, 0.7) * (offs.reduce((a, o) => a + (t >= o ? Math.exp(-(t - o) * 150) : 0), 0) * 0.55 + Math.exp(-t * 12) * 0.5) * vel;
};
const snap = (vel = 1) => {
  const bp = biquad();
  return (t) => bp(noise(), "bp", 2800, 3) * Math.exp(-t * 90) * 2 * vel;
};
const shaker = (vel = 1) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 6500) * Math.min(1, t / 0.012) * Math.exp(-t * 45) * vel;
};
// glockenspiel: inharmonic bar partials
const glock = (f, vel = 1) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(2 * Math.PI * f * 2.76 * t) * Math.exp(-t * 6) + 0.2 * Math.sin(2 * Math.PI * f * 5.4 * t) * Math.exp(-t * 14)) * Math.min(1, t / 0.002) * Math.exp(-t * 3.2) * vel;

// guitar voicing in open position from the chord's notes
const voicing = (chord) => {
  const ns = CHORD_NOTES[chord];
  const out = [];
  let lo = ns[0]; while (lo < 40) lo += 12;
  out.push(lo);
  for (const n of ns.slice(1)) { let m = n; while (m <= out[out.length - 1]) m += 12; while (m > 71) m -= 12; if (m > out[out.length - 1]) out.push(m); }
  return out.slice(0, 6);
};
const STRUM8 = [[0, "D", 1], [1, "D", 0.6], [2, "U", 0.5], [3, "U", 0.55], [4, "D", 0.8], [5, "U", 0.55]]; // in 8ths: D . D U . U D U
const POS8 = [0, 2, 3, 5, 6, 7];

export const scoreStompclap = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const S16 = BEAT_S / 4;
  const len = songEnd + 3;
  const gtr = buffer(len), drums = buffer(len), bass = buffer(len), bells = buffer(len), pad = buffer(len), fx = buffer(len);
  const nBars = Math.round(songEnd / BAR_S);

  const bars = Array.from({ length: nBars }, (_, b) => {
    const t = b * BAR_S;
    const k = sceneAt(t + 1e-4);
    const s = scenes[k], next = scenes[k + 1];
    const last = t + BAR_S >= s.end - 1e-4;
    return { t, chord: chordAt(t + 1e-4), energy: s.energy, first: Math.abs(t - s.start) < 1e-4, build: last && next && next.energy > s.energy && next.energy >= 2, stop: last && next && next.energy === 0 && s.energy > 0 };
  });

  const strum = (t0, chord, dir, vel, muted = false) => {
    const v = voicing(chord);
    const order = dir === "D" ? v : [...v].reverse().slice(0, 4);
    order.forEach((n, i) => pluck(gtr, t0 + i * 0.011, n, vel * (0.5 + 0.1 * i) * 0.55, 0.3 + 0.07 * i, muted ? 0.9 : 0.995, muted ? 0.12 : 1.6, 0.7));
  };

  bars.forEach((bar, b) => {
    const { t, energy, chord } = bar;
    const steps = bar.stop ? 12 : 16;

    // --- guitar
    if (bar.build) {
      for (let i = 0; i < 16; i++) strum(t + i * S16, chord, i % 2 ? "U" : "D", 0.35 + 0.5 * (i / 16));
    } else if (energy === 0) {
      const v = voicing(chord);
      [0, 2, 3, 4, 3, 2, 1, 2].forEach((k, i) => pluck(gtr, t + i * 2 * S16, v[Math.min(v.length - 1, k)], i === 0 ? 0.45 : 0.3, 0.4 + 0.1 * (i % 3), 0.996, 2));
    } else if (energy >= 3) {
      for (let i = 0; i < steps; i++) strum(t + i * S16, chord, i % 2 ? "U" : "D", i % 4 === 0 ? 0.9 : i % 2 ? 0.45 : 0.6);
    } else {
      STRUM8.forEach(([k, dir, vel], j) => { const o = POS8[j] * 2 * S16; if (o < steps * S16) strum(t + o, chord, dir, vel); });
    }
    if (bar.stop) strum(t + 3 * BEAT_S, chord, "D", 1, true);

    // --- upright bass: root on 1 and 3, a walk-up on 4
    if (energy >= 1 && !bar.build) {
      const root = CHORD_NOTES[chord][0];
      const r = root < 31 ? root + 12 : root;
      for (const [o, m] of [[0, r], [2, r + 7], [3.5, r + 5]]) if (o * 4 < steps) pluck(bass, t + o * BEAT_S, m, 0.9, 0.5, 0.993, 1.2, 0.1);
    }

    // --- percussion
    if (energy === 1 && !bar.build) for (const i of [4, 12]) if (i < steps) addMono(drums, t + i * S16, 0.1, snap(0.5), 0.6, 0.4);
    if (energy >= 2 && !bar.build) {
      for (let k = 0; k < 4; k++) if (k * 4 < steps) addMono(drums, t + k * BEAT_S, 0.5, stomp(k % 2 ? 0.75 : 1));
      for (const i of [4, 12]) if (i < steps) { addMono(drums, t + i * S16, 0.5, clap(0.8), 0.45, 0.55); addMono(drums, t + i * S16 + 0.006, 0.5, clap(0.5, 0.004), 0.6, 0.4); }
      if (energy >= 3) for (let i = 0; i < steps; i++) addMono(drums, t + i * S16 + (i % 2 ? S16 * 0.12 : 0), 0.06, shaker(i % 4 === 2 ? 0.22 : 0.12), 0.4, 0.6);
    }
    if (bar.build) {
      const hits = [0, 1, 2, 3].map((k) => k * BEAT_S).concat([0, 1, 2, 3].map((k) => 2 * BEAT_S + k * 2 * S16).slice(0, 2), [0, 1, 2, 3, 4, 5, 6, 7].map((k) => 3 * BEAT_S + k * (S16 / 2)));
      hits.sort((a, z) => a - z).forEach((o, i) => addMono(drums, t + o, 0.4, clap(0.35 + 0.5 * (i / hits.length), 0.002), 0.5, 0.5));
    }

    // --- glockenspiel
    const tones = CHORD_NOTES[chord].map((n) => { let m = n; while (m < 79) m += 12; return m; }).sort((a, z) => a - z);
    if (energy === 0 && bar.first) addMono(bells, t, 2.5, glock(hz(tones[0]), 0.4));
    if (energy >= 3 && !bar.build) {
      const mel = [[0, 0], [0.5, 1], [1, 2], [2, 1], [2.5, 0], [3, 2], [3.5, 1]];
      for (const [o, k] of mel) if (o * 4 < steps) addMono(bells, t + o * BEAT_S, 1.5, glock(hz(tones[(k + b) % tones.length]), 0.3), 0.7, 1);
    }
  });

  renderPad(pad, { chordAt, levelAt: (t) => (scenes[sceneAt(t)].energy === 0 ? 0.02 : 0.012), cutoffAt: () => 700, xfade: 0.1 });

  echo(gtr, BEAT_S * 0.25 * 1000, 0.12);
  echo(bells, BEAT_S * 0.75 * 1000, 0.3);
  echo(drums, 60, 0.15);

  const out = buffer(len);
  mix(out, gtr, 1.0);
  mix(out, drums, 1.1);
  mix(out, bass, 0.5);
  mix(out, bells, 0.22);
  mix(out, pad, 1);
  mix(out, fx, 0.3);
  for (let i = 0; i < out[0].length; i++) { out[0][i] = Math.tanh(out[0][i] * 1.1); out[1][i] = Math.tanh(out[1][i] * 1.1); }

  fadeTail(out, songEnd);
  normalize(out, -1);
  return out;
};
