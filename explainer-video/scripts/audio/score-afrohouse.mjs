// "afrohouse": a warm, rolling Afro-house score (used by 《自我怀疑》) — another
// set of sounds: a deep four-on-the-floor kick, hand-played congas and tumba,
// a 3-2 son clave, a shaker, a kalimba ostinato, an offbeat sub bass, and an
// "ooh" choir (sawtooth through vowel formants) at the peaks.
//
// Per scene, `energy` decides what plays:
//   0  kalimba alone over a soft pad
//   1  + shaker, a soft kick on every beat, the offbeat sub
//   2  + congas, clave, a clap on 2 and 4
//   3  + the choir stabs and conga fills, kalimba doubles up
// Between scenes: the bar before a scene with more energy, the kick drops out
// and the congas roll faster and faster under a swell; the beat before a
// breakdown, the kalimba tumbles down the scale into silence.
import { CHORD_NOTES, SAW, SR, TABLE_SIZE, addMono, biquad, buffer, echo, hz, mix, noise, normalize } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

// ---- voices ----
const kick = (vel = 1) => (t) => (Math.sin(2 * Math.PI * (48 * t + (90 / 22) * (1 - Math.exp(-22 * t)))) * Math.exp(-t * 7.5) + Math.sin(2 * Math.PI * 1800 * t) * Math.exp(-t * 300) * 0.15) * vel;
// conga / tumba: a pitched membrane with a little pitch drop and a slap of noise
const conga = (f, vel = 1, slap = 0.3) => {
  const bp = biquad();
  return (t) => (Math.sin(2 * Math.PI * (f * t + (f * 0.12 / 25) * (1 - Math.exp(-25 * t)))) * Math.exp(-t * 14) + bp(noise(), "bp", f * 4, 1.2) * Math.exp(-t * 60) * slap) * vel;
};
const clave = (vel = 1) => (t) => (Math.sin(2 * Math.PI * 2500 * t) * 0.8 + Math.sin(2 * Math.PI * 3700 * t) * 0.3) * Math.exp(-t * 45) * vel;
const clap = (vel = 1) => {
  const bp = biquad();
  return (t) => bp(noise(), "bp", 1300, 0.8) * ([0, 0.01, 0.021].reduce((a, o) => a + (t >= o ? Math.exp(-(t - o) * 140) : 0), 0) * 0.6 + Math.exp(-t * 13) * 0.45) * vel;
};
const shaker = (vel = 1) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 7000) * Math.min(1, t / 0.008) * Math.exp(-t * 55) * vel;
};
// kalimba: a sine with a bright, quickly dying inharmonic tine and a little buzz
const kalimba = (f, vel = 1) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.45 * Math.sin(2 * Math.PI * f * 5.95 * t) * Math.exp(-t * 18) + 0.12 * Math.sin(2 * Math.PI * f * 2.01 * t) * Math.exp(-t * 4)) * Math.min(1, t / 0.002) * Math.exp(-t * 3.4) * vel;
// "ooh": two detuned saws through the formants of /u/
const ooh = (notes, dur, vel = 1) => {
  const f1 = notes.map(() => [biquad(), biquad()]), f2 = notes.map(() => [biquad(), biquad()]);
  const ph = notes.map(() => [0, 0]);
  return (t) => {
    const env = Math.min(1, t / 0.08) * Math.min(1, Math.max(0, (dur - t) / 0.25));
    let s = 0;
    notes.forEach((n, i) => {
      const f = hz(n) * (1 + 0.004 * Math.sin(2 * Math.PI * 5 * t + i));
      ph[i][0] = (ph[i][0] + f / SR) % 1; ph[i][1] = (ph[i][1] + (f * 1.005) / SR) % 1;
      const raw = SAW[(ph[i][0] * TABLE_SIZE) | 0] + SAW[(ph[i][1] * TABLE_SIZE) | 0];
      s += f1[i][0](raw, "bp", 330, 3) * 1.2 + f2[i][0](raw, "bp", 870, 4) * 0.5;
    });
    return s * env * vel;
  };
};

const tonesOf = (chord, low) => [...new Set(CHORD_NOTES[chord].map((n) => { let m = n; while (m < low) m += 12; return m; }))].sort((a, b) => a - b);

// 3-2 son clave across two bars, in 16ths
const CLAVE = [[0, 6, 12], [4, 8]];
// conga (h = high, l = low tumba) in 16ths
const CONGA2 = [[2, "h"], [3, "h"], [6, "l"], [7, "l"], [10, "h"], [14, "l"]];
const CONGA3 = [[2, "h"], [3, "h"], [5, "h"], [6, "l"], [7, "l"], [10, "h"], [11, "h"], [13, "h"], [14, "l"], [15, "l"]];

export const scoreAfrohouse = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const S16 = BEAT_S / 4;
  const len = songEnd + 3;
  const drums = buffer(len), perc = buffer(len), keys = buffer(len), low = buffer(len), choir = buffer(len), pad = buffer(len), fx = buffer(len);
  const nBars = Math.round(songEnd / BAR_S);
  const duck = new Float32Array(Math.ceil(len * SR)).fill(1);

  const bars = Array.from({ length: nBars }, (_, b) => {
    const t = b * BAR_S;
    const k = sceneAt(t + 1e-4);
    const s = scenes[k], next = scenes[k + 1];
    const last = t + BAR_S >= s.end - 1e-4;
    return { t, chord: chordAt(t + 1e-4), energy: s.energy, first: Math.abs(t - s.start) < 1e-4, build: last && next && next.energy > s.energy && next.energy >= 2, stop: last && next && next.energy === 0 && s.energy > 0 };
  });

  bars.forEach((bar, b) => {
    const { t, energy, chord } = bar;
    const steps = bar.stop ? 12 : 16;
    const root = CHORD_NOTES[chord][0];

    // --- kalimba ostinato (always)
    const tn = tonesOf(chord, 69);
    const pat = [0, 2, 1, 2, 0, 3, 1, 2];
    if (bar.stop) {
      for (let i = 0; i < 12; i++) addMono(keys, t + i * 2 * S16 * (i < 8 ? 1 : 0.5) + (i >= 8 ? 2 * BEAT_S : 0), 1.2, kalimba(hz(tn[pat[i % 8] % tn.length] + (i < 8 ? 0 : 12 - (i - 8) * 3)), 0.32), 0.6, 0.9);
    } else {
      const fast = energy >= 3 && !bar.build;
      const n = energy === 0 ? 4 : fast ? 16 : 8;
      const step = energy === 0 ? BEAT_S : fast ? S16 : 2 * S16;
      for (let i = 0; i < n; i++) {
        const k = pat[i % pat.length] + (b % 2 && i >= n / 2 ? 1 : 0);
        const m = tn[k % tn.length] + (k >= tn.length ? 12 : 0);
        addMono(keys, t + i * step, 1.2, kalimba(hz(m), (i % 4 === 0 ? 0.36 : 0.24) * (energy === 0 ? 1.1 : 1)), i % 2 ? 0.9 : 0.6, i % 2 ? 0.6 : 0.9);
      }
    }

    // --- kick + offbeat sub
    if (energy >= 1 && !bar.build) {
      for (let k = 0; k < 4; k++) {
        if (k * 4 >= steps) break;
        addMono(drums, t + k * BEAT_S, 0.5, kick(energy === 1 ? 0.6 : 0.95));
        const s0 = Math.round((t + k * BEAT_S) * SR);
        for (let j = 0; j < 0.22 * SR && s0 + j < duck.length; j++) duck[s0 + j] = Math.min(duck[s0 + j], 1 - 0.55 * Math.exp(-(j / SR) / 0.07));
      }
      const f = hz(root < 33 ? root + 12 : root);
      const offs = energy >= 3 ? [2, 6, 10, 13, 14] : [2, 6, 10, 14];
      for (const i of offs) if (i < steps) addMono(low, t + i * S16, 2 * S16, (x) => Math.tanh(Math.sin(2 * Math.PI * f * x) * 1.6) * Math.min(1, x / 0.004) * Math.exp(-x * 5));
    }
    // --- shaker
    if (energy >= 1 && !bar.build) for (let i = 0; i < steps; i++) addMono(perc, t + i * S16 + (i % 2 ? S16 * 0.08 : 0), 0.06, shaker(i % 4 === 2 ? 0.24 : i % 2 ? 0.1 : 0.15), 0.4, 0.6);
    // --- congas, clave, clap
    if (energy >= 2 && !bar.build) {
      for (const [i, h] of energy >= 3 ? CONGA3 : CONGA2) if (i < steps) addMono(perc, t + i * S16, 0.4, conga(h === "h" ? 330 : 205, h === "h" ? 0.55 : 0.7, h === "h" ? 0.4 : 0.2), h === "h" ? 0.75 : 0.35, h === "h" ? 0.35 : 0.75);
      for (const i of CLAVE[b % 2]) if (i < steps) addMono(perc, t + i * S16, 0.12, clave(0.3), 0.8, 0.5);
      for (const i of [4, 12]) if (i < steps) addMono(drums, t + i * S16, 0.4, clap(0.55));
    }
    // --- choir stabs at the peaks
    if (energy >= 3 && !bar.build) {
      const v = tonesOf(chord, 57).slice(0, 3);
      addMono(choir, t, BEAT_S * 1.6, ooh(v, BEAT_S * 1.6, 0.5));
      if (14 < steps) addMono(choir, t + 2.5 * BEAT_S, BEAT_S * 1.2, ooh(v, BEAT_S * 1.2, 0.35));
    }
    // --- build: conga roll, faster and faster, and a swell
    if (bar.build) {
      const hits = [];
      for (let i = 0; i < 8; i++) hits.push(i * 2 * S16);
      for (let i = 0; i < 8; i++) hits.push(BAR_S / 2 + i * S16);
      for (let i = 0; i < 8; i++) hits.push(BAR_S * 0.75 + i * (S16 / 2) * 0.9);
      hits.forEach((o, i) => addMono(perc, t + o, 0.3, conga(i % 2 ? 330 : 205, 0.3 + 0.5 * (i / hits.length), 0.35), i % 2 ? 0.75 : 0.35, i % 2 ? 0.35 : 0.75));
      const lp = biquad();
      addMono(fx, t, BAR_S, (x) => { const k = x / BAR_S; return lp(noise(), "lp", 400 + 7000 * k * k) * k * k * 1.1; });
    }
  });

  renderPad(pad, {
    chordAt,
    levelAt: (t) => (scenes[sceneAt(t)].energy === 0 ? 0.03 : 0.02),
    cutoffAt: (t) => 650 + 220 * scenes[sceneAt(t)].energy,
    xfade: 0.1,
  });

  for (const buf of [low, pad, choir, keys]) for (let i = 0; i < buf[0].length && i < duck.length; i++) { buf[0][i] *= duck[i]; buf[1][i] *= duck[i]; }
  echo(keys, BEAT_S * 0.75 * 1000, 0.33);
  echo(choir, BEAT_S * 0.5 * 1000, 0.3);
  echo(perc, 70, 0.12);

  const out = buffer(len);
  mix(out, drums, 1.0);
  mix(out, perc, 0.85);
  mix(out, keys, 0.45);
  mix(out, low, 0.5);
  mix(out, choir, 0.05);
  mix(out, pad, 1);
  mix(out, fx, 0.3);
  for (let i = 0; i < out[0].length; i++) { out[0][i] = Math.tanh(out[0][i] * 1.1); out[1][i] = Math.tanh(out[1][i] * 1.1); }

  fadeTail(out, songEnd);
  normalize(out, -1);
  return out;
};
