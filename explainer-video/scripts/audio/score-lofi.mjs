// "lofi": a late-night lo-fi / trap score (used by 《报复性熬夜》) — another set
// of sounds: vinyl crackle, a wobbly electric piano, swung boom-bap drums, a
// gliding 808, and trap hi-hat rolls at the peaks.
//
// Per scene, `energy` decides what plays:
//   0  electric piano chords + vinyl crackle (+ a soft sub on the downbeat)
//   1  + rimshot on 2 and 4, swung 8th hats, sub bass
//   2  + boom-bap kick/snare (laid back), 808 instead of the sub
//   3  + 16th hats with 32nd-note rolls, open hats, piano stabs on the off-beats
// Between scenes: the bar before a scene with more energy, the drums drop out
// and the hats roll faster and faster under a reversed swell; the beat before
// a breakdown, a "power-down" (everything sweeps down into silence).
import { CHORD_NOTES, SR, addMono, biquad, buffer, echo, hz, mix, noise, normalize, rand } from "./lib.mjs";
import { arrangement } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

// ---- voices ----
const kick = (vel = 1) => (t) => Math.tanh(Math.sin(2 * Math.PI * (48 * t + (120 / 30) * (1 - Math.exp(-30 * t)))) * Math.exp(-t * 9) * 1.6) * vel;
const snare = (vel = 1) => {
  const bp = biquad(), lp = biquad();
  return (t) => (Math.sin(2 * Math.PI * 200 * t) * Math.exp(-t * 25) * 0.45 + lp(bp(noise(), "bp", 2400, 0.5), "lp", 5000) * Math.exp(-t * 16) * 1.1) * vel;
};
const rim = (vel = 1) => {
  const bp = biquad();
  return (t) => (bp(noise(), "bp", 1700, 4) * 1.5 + Math.sin(2 * Math.PI * 820 * t) * 0.7) * Math.exp(-t * 60) * vel;
};
const hat = (vel = 1, open = false) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 8000) * Math.exp(-t * (open ? 10 : 80)) * vel;
};
// FM electric piano with a little tape wobble
const epiano = (f, vel = 1, wob = 0) => (t) => {
  const v = 1 + 0.004 * Math.sin(2 * Math.PI * 0.6 * t + wob);
  const s = Math.sin(2 * Math.PI * f * v * t + 1.6 * Math.exp(-t * 5) * Math.sin(2 * Math.PI * f * v * t));
  return s * Math.min(1, t / 0.004) * Math.exp(-t * 1.4) * (1 + 0.15 * Math.sin(2 * Math.PI * 4.5 * t)) * vel;
};
// 808: sine with a pitch glide from `from` Hz and a long tail, a little driven
const eight08 = (f, from, dur, vel = 1) => {
  let ph = 0;
  return (t) => {
    const fr = f + (from - f) * Math.exp(-t * 18);
    ph += fr / SR;
    return Math.tanh(Math.sin(2 * Math.PI * ph) * 1.8) * Math.min(1, t / 0.005) * Math.exp(-Math.max(0, t - dur * 0.7) * 8) * vel;
  };
};

const voicing = (chord) => {
  const [root, , ...rest] = CHORD_NOTES[chord];
  const tones = [...new Set(rest.map((n) => { let m = n; while (m < 55) m += 12; while (m > 70) m -= 12; return m; }))].sort((a, b) => a - b);
  let r = root; while (r < 48) r += 12;
  return [...tones, r + 14].sort((a, b) => a - b); // add the 9th for colour
};

export const scoreLofi = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const S16 = BEAT_S / 4;
  const SWING = S16 * 0.22; // late 16ths
  const len = songEnd + 3;
  const drums = buffer(len), hats = buffer(len), keys = buffer(len), low = buffer(len), vinyl = buffer(len), fx = buffer(len);
  const nBars = Math.round(songEnd / BAR_S);
  const duck = new Float32Array(Math.ceil(len * SR)).fill(1);
  const sw = (i) => (i % 2 ? SWING : 0);

  const bars = Array.from({ length: nBars }, (_, b) => {
    const t = b * BAR_S;
    const k = sceneAt(t + 1e-4);
    const s = scenes[k], next = scenes[k + 1];
    const last = t + BAR_S >= s.end - 1e-4;
    return { t, chord: chordAt(t + 1e-4), energy: s.energy, first: Math.abs(t - s.start) < 1e-4, build: last && next && next.energy > s.energy && next.energy >= 2, stop: last && next && next.energy === 0 && s.energy > 0 };
  });

  let lastBass = 0;
  bars.forEach((bar, b) => {
    const { t, energy, chord } = bar;
    const steps = bar.stop ? 12 : 16;
    const root = CHORD_NOTES[chord][0];
    const bassF = hz(root < 30 ? root + 12 : root);

    // --- electric piano: chord on 1, again on the "and" of 2 (and stabs at the peak)
    const v = voicing(chord);
    const hits = energy >= 3 && !bar.build ? [[0, 0.5], [1.5, 0.35], [2.5, 0.25], [3.5, 0.25]] : [[0, 0.5], [1.5, 0.32]];
    for (const [o, vel] of hits) {
      if (o * 4 >= steps) continue;
      v.forEach((n, j) => addMono(keys, t + o * BEAT_S + j * 0.012, 2.6, epiano(hz(n), vel * (j === v.length - 1 ? 0.6 : 1), b + j), j % 2 ? 0.7 : 1, j % 2 ? 1 : 0.7));
    }

    // --- low end
    if (energy >= 2 && !bar.build) {
      for (const [o, d] of [[0, 1.4], [1.75, 0.6], [3, 0.9]]) {
        if (o * 4 >= steps) continue;
        const f = o === 1.75 ? bassF * 2 ** (7 / 12) : bassF;
        addMono(low, t + o * BEAT_S, d + 0.3, eight08(f, lastBass || f, d, o === 0 ? 0.9 : 0.7));
        lastBass = f;
      }
    } else if (energy >= 1 && !bar.build) {
      addMono(low, t, BAR_S * 0.9, (x) => Math.sin(2 * Math.PI * bassF * x) * Math.min(1, x / 0.02) * Math.exp(-x * 1.2) * 0.6);
      addMono(low, t + 2.5 * BEAT_S, BEAT_S * 1.4, (x) => Math.sin(2 * Math.PI * bassF * x) * Math.min(1, x / 0.02) * Math.exp(-x * 2) * 0.4);
    } else if (energy === 0 && bar.first) {
      addMono(low, t, 2, (x) => Math.sin(2 * Math.PI * bassF * x) * Math.min(1, x / 0.05) * Math.exp(-x * 1.5) * 0.4);
    }

    // --- drums
    if (energy >= 2 && !bar.build) {
      const kicks = energy >= 3 ? [0, 7, 10, 14] : [0, 7, 10];
      for (const i of kicks) if (i < steps) {
        addMono(drums, t + i * S16 + sw(i), 0.5, kick(i === 0 ? 1 : 0.8));
        const s0 = Math.round((t + i * S16 + sw(i)) * SR);
        for (let j = 0; j < 0.25 * SR && s0 + j < duck.length; j++) duck[s0 + j] = Math.min(duck[s0 + j], 1 - 0.45 * Math.exp(-(j / SR) / 0.07));
      }
      for (const i of [4, 12]) if (i < steps) addMono(drums, t + i * S16 + 0.018, 0.5, snare(0.85)); // laid back
    } else if (energy === 1 && !bar.build) {
      for (const i of [4, 12]) if (i < steps) addMono(drums, t + i * S16 + 0.012, 0.15, rim(0.5));
    }
    if (energy >= 1 && !bar.build) {
      const trap = energy >= 3;
      for (let i = 0; i < steps; i += trap ? 1 : 2) {
        const acc = i % 4 === 0 ? 1 : i % 2 === 0 ? 0.7 : 0.5;
        const pan = 0.35 + 0.3 * ((i >> 1) % 2);
        // trap rolls: the last beat of every other bar breaks into 32nds / triplets
        if (trap && b % 2 === 1 && i >= 12) {
          const n = i === 14 ? 3 : 2;
          for (let r = 0; r < n; r++) addMono(hats, t + i * S16 + (r * S16) / n, 0.06, hat(0.18 * acc + 0.05 * r), 1 - pan, pan);
        } else addMono(hats, t + i * S16 + sw(i), 0.08, hat((trap ? 0.2 : 0.17) * acc), 1 - pan, pan);
        if (trap && i % 8 === 6) addMono(hats, t + i * S16 + sw(i), 0.5, hat(0.1, true), pan, 1 - pan);
      }
    }

    // --- build: hats roll faster and faster over a reversed swell
    if (bar.build) {
      const rolls = [];
      for (let i = 0; i < 8; i++) rolls.push(i * 2 * S16);
      for (let i = 0; i < 8; i++) rolls.push(2 * BEAT_S + i * (S16 / 2));
      for (let i = 0; i < 8; i++) rolls.push(3 * BEAT_S + i * (S16 / 2) * (1 - i * 0.06));
      rolls.forEach((o, i) => addMono(hats, t + o, 0.05, hat(0.12 + 0.2 * (i / rolls.length)), 0.5 + 0.4 * Math.sin(i), 0.5 - 0.4 * Math.sin(i)));
      const lp = biquad();
      addMono(fx, t, BAR_S, (x) => { const k = x / BAR_S; return lp(noise(), "lp", 500 + 9000 * k * k) * k * k * k * 1.3; });
    }
    // --- stop: a power-down sweep into silence
    if (bar.stop) addMono(fx, t + 3 * BEAT_S, BEAT_S, (x) => { const k = x / BEAT_S; return Math.sin(2 * Math.PI * (220 * x - 180 * x * k)) * (1 - k) * 0.5; });
  });

  // vinyl: hiss + sparse crackle, always
  const hp = biquad(), lp = biquad();
  for (let i = 0; i < vinyl[0].length; i++) {
    const h = lp(hp(noise(), "hp", 1500), "lp", 7000) * 0.012;
    const c = rand() < 0.0004 ? noise() * (0.15 + rand() * 0.25) : 0;
    vinyl[0][i] += h + c;
    vinyl[1][i] += h + (rand() < 0.0003 ? noise() * 0.2 : 0);
  }

  for (const buf of [keys, low]) for (let i = 0; i < buf[0].length && i < duck.length; i++) { buf[0][i] *= duck[i]; buf[1][i] *= duck[i]; }
  // keys: a dark low-pass and a long slap — the "late night" colour
  const kl = biquad(), kr = biquad();
  for (let i = 0; i < keys[0].length; i++) { keys[0][i] = kl(keys[0][i], "lp", 2600); keys[1][i] = kr(keys[1][i], "lp", 2600); }
  echo(keys, BEAT_S * 0.75 * 1000, 0.28);
  echo(drums, 80, 0.15);

  const out = buffer(len);
  mix(out, drums, 0.95);
  mix(out, hats, 0.8);
  mix(out, keys, 0.24);
  mix(out, low, 0.22);
  mix(out, vinyl, 1);
  mix(out, fx, 0.3);
  for (let i = 0; i < out[0].length; i++) { out[0][i] = Math.tanh(out[0][i] * 1.1); out[1][i] = Math.tanh(out[1][i] * 1.1); }

  fadeTail(out, songEnd);
  normalize(out, -1);
  return out;
};
