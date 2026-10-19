// "futurebass": a glossy future-bass score (used by 《容貌焦虑》) — another set
// of sounds: wide supersaw chords that bend into each hit and swell back after
// every beat (sidechained), a half-time beat (kick, a big snare on 3, hats), a
// sub, formant "vocal chops" at the peaks, square plucks — and under the quiet
// parts a felt piano with nothing on it (the unfiltered sound; the ending is
// that alone).
//
// Per scene, `energy` decides what plays:
//   0  the felt piano alone, a broken chord per bar
//   1  + plucks in 8ths, a soft kick on 1 and 3, hats, a dark held supersaw
//   2  + the half-time beat, supersaw chords pumping on every beat, the sub
//   3  + vocal chops, the chords wobble in triplets, hats go 16th, a clap
// Between scenes: the bar before a scene with more energy, a snare roll speeds
// up (4ths → 8ths → 16ths → 32nds) under a noise riser and an opening filter,
// then half a beat of silence, and the next scene lands on an impact; the beat
// before a breakdown, the chord glitches — retriggered in 32nds, bit-crushed,
// pitching down — and cuts out.
import { CHORD_NOTES, SQUARE, SR, TABLE_SIZE, addMono, biquad, buffer, echo, hz, mix, noise, normalize, rand } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

// a brighter saw than lib's (24 harmonics) — supersaws need the top end
const BRIGHT = Float32Array.from({ length: TABLE_SIZE + 1 }, (_, i) => {
  let s = 0;
  for (let h = 1; h <= 24; h++) s += Math.sin((2 * Math.PI * h * i) / TABLE_SIZE) / h;
  return s * 0.6;
});

// ---- drums ----
const kick = (vel = 1) => (t) => (Math.sin(2 * Math.PI * (45 * t + (110 / 30) * (1 - Math.exp(-30 * t)))) * Math.exp(-t * 6) * 1.1 + Math.sin(2 * Math.PI * 2400 * t) * Math.exp(-t * 400) * 0.25) * vel;
const snare = (vel = 1) => {
  const bp = biquad(), hp = biquad();
  return (t) => (Math.sin(2 * Math.PI * 185 * t) * Math.exp(-t * 22) * 0.6 + bp(noise(), "bp", 2200, 0.6) * Math.exp(-t * 13) * 0.9 + hp(noise(), "hp", 6000) * Math.exp(-t * 30) * 0.3) * vel;
};
const clap = (vel = 1) => {
  const bp = biquad();
  return (t) => bp(noise(), "bp", 1500, 0.8) * ([0, 0.009, 0.019, 0.03].reduce((a, o) => a + (t >= o ? Math.exp(-(t - o) * 160) : 0), 0) * 0.6 + Math.exp(-t * 11) * 0.45) * vel;
};
const hat = (vel = 1, open = false) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 8500) * Math.exp(-t * (open ? 8 : 70)) * vel;
};

// ---- tones ----
// square pluck, its filter snapping shut
const pluck = (f, vel = 1) => {
  const lp = biquad();
  let ph = 0;
  return (t) => {
    ph = (ph + f / SR) % 1;
    return lp(SQUARE[(ph * TABLE_SIZE) | 0], "lp", 300 + 4200 * Math.exp(-t * 16)) * Math.exp(-t * 7) * Math.min(1, t / 0.002) * vel;
  };
};
// felt piano: soft hammer, upper partials damped fast, a little thump
const felt = (out, t0, midi, gain, pan = 0.5) => {
  const f = hz(midi), s0 = Math.round(t0 * SR), len = Math.round(3.5 * SR);
  const lp = biquad();
  for (let i = 0; i < len && s0 + i < out[0].length; i++) {
    if (s0 + i < 0) continue;
    const t = i / SR;
    let s = 0;
    for (let h = 1; h <= 4; h++) s += (Math.sin(2 * Math.PI * f * h * t * (1 + 0.0003 * h * h)) * Math.exp(-t * h * 1.4)) / (h * h);
    const v = (s * Math.min(1, t / 0.012) * Math.exp(-t * 1.3) + lp(noise(), "lp", 900) * Math.exp(-t * 90) * 0.12) * gain;
    out[0][s0 + i] += v * (1 - pan) * 2;
    out[1][s0 + i] += v * pan * 2;
  }
};
// supersaw chord: six detuned saws per note, split across the stereo field;
// `bend` semitones up into the note, `wob` = tremolo depth at `wobRate` Hz
const DETUNE = [-0.2, -0.12, -0.04, 0.04, 0.12, 0.2];
const supersaw = (out, t0, dur, notes, { vel = 1, bend = 0, cutoff = 5200, cutoffEnd = cutoff, wob = 0, wobRate = 6, attack = 0.008, release = 0.1 } = {}) => {
  const s0 = Math.round(t0 * SR), n = Math.round((dur + release) * SR);
  const ph = notes.map(() => DETUNE.map(() => rand()));
  const fl = [biquad(), biquad()], fr = [biquad(), biquad()];
  for (let i = 0; i < n && s0 + i < out[0].length; i++) {
    if (s0 + i < 0) continue;
    const t = i / SR;
    const b = bend ? -bend * Math.exp(-t / 0.05) : 0;
    let l = 0, r = 0;
    for (let k = 0; k < notes.length; k++) {
      for (let d = 0; d < DETUNE.length; d++) {
        ph[k][d] = (ph[k][d] + hz(notes[k] + DETUNE[d] + b) / SR) % 1;
        const v = BRIGHT[(ph[k][d] * TABLE_SIZE) | 0];
        if (d % 2) r += v; else l += v;
      }
    }
    const env = Math.min(1, t / attack) * (t > dur ? Math.max(0, 1 - (t - dur) / release) : 1);
    const w = wob ? 1 - wob * (0.5 + 0.5 * Math.cos(2 * Math.PI * wobRate * t)) : 1;
    const g = (env * w * vel) / (notes.length * 3);
    const c = cutoff + (cutoffEnd - cutoff) * Math.min(1, t / dur);
    out[0][s0 + i] += fl[1](fl[0](l, "lp", c), "lp", c) * g;
    out[1][s0 + i] += fr[1](fr[0](r, "lp", c), "lp", c) * g;
  }
};
// formant "vocal chop": a bright saw through three vowel formants (shifted up,
// like a pitched-up sample), sliding up into the note
const VOWELS = { a: [800, 1150, 2900], o: [450, 800, 2830], e: [350, 2000, 2800], u: [325, 700, 2530] };
const chop = (out, t0, midi, dur, vowel, vel = 1, pan = 0.5) => {
  const [F1, F2, F3] = VOWELS[vowel];
  const b1 = biquad(), b2 = biquad(), b3 = biquad();
  const s0 = Math.round(t0 * SR), n = Math.round((dur + 0.05) * SR);
  let ph = 0;
  for (let i = 0; i < n && s0 + i < out[0].length; i++) {
    if (s0 + i < 0) continue;
    const t = i / SR;
    const f = hz(midi - 1.2 * Math.exp(-t / 0.025)) * (1 + 0.006 * Math.sin(2 * Math.PI * 5.5 * t));
    ph = (ph + f / SR) % 1;
    const raw = BRIGHT[(ph * TABLE_SIZE) | 0] + noise() * 0.05;
    const s = b1(raw, "bp", F1 * 1.18, 5) * 1.0 + b2(raw, "bp", F2 * 1.18, 7) * 0.8 + b3(raw, "bp", F3 * 1.12, 9) * 0.35;
    const env = Math.min(1, t / 0.006) * (t > dur ? Math.max(0, 1 - (t - dur) / 0.05) : 1);
    out[0][s0 + i] += s * env * vel * (1 - pan) * 2;
    out[1][s0 + i] += s * env * vel * pan * 2;
  }
};

// chord tones: the root low, then the triad in [61, 73)
const pcs = (chord) => [...new Set(CHORD_NOTES[chord].map((n) => n % 12))];
const voicing = (chord) => {
  const root = CHORD_NOTES[chord][0] % 12;
  const up = pcs(chord).map((p) => { let m = p; while (m < 61) m += 12; return m; }).sort((a, z) => a - z);
  let low = root; while (low < 49) low += 12;
  return [low, ...up];
};
const tonesFrom = (chord, lo) => pcs(chord).map((p) => { let m = p; while (m < lo) m += 12; return m; }).sort((a, z) => a - z);

// chop melody (16th index, tone index, vowel, length in 16ths): a 3-3-2 figure
const CHOPS = [[0, 2, "a", 2], [3, 1, "o", 2], [6, 2, "a", 1], [8, 3, "e", 2], [11, 2, "o", 2], [14, 1, "u", 2]];

export const scoreFuturebass = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const S16 = BEAT_S / 4;
  const len = songEnd + 3;
  const drums = buffer(len), hats = buffer(len), chords = buffer(len), sub = buffer(len), chops = buffer(len), plucks = buffer(len), keys = buffer(len), pad = buffer(len), fx = buffer(len);
  const nBars = Math.round(songEnd / BAR_S);
  const N = Math.ceil(len * SR);
  const pump = new Float32Array(N).fill(1);
  const gate = new Float32Array(N).fill(1);

  const bars = Array.from({ length: nBars }, (_, b) => {
    const t = b * BAR_S;
    const k = sceneAt(t + 1e-4);
    const s = scenes[k], next = scenes[k + 1];
    const last = t + BAR_S >= s.end - 1e-4;
    return { t, chord: chordAt(t + 1e-4), energy: s.energy, first: Math.abs(t - s.start) < 1e-4, build: last && next && next.energy > s.energy && next.energy >= 2, stop: last && next && next.energy === 0 && s.energy > 0 };
  });

  const duck = (t0, depth, tau) => {
    const s0 = Math.round(t0 * SR);
    for (let j = 0; j < 0.5 * SR && s0 + j < N; j++) pump[s0 + j] = Math.min(pump[s0 + j], 1 - depth * Math.exp(-(j / SR) / tau));
  };

  bars.forEach((bar, b) => {
    const { t, energy, chord } = bar;
    const steps = bar.stop ? 12 : 16;
    const v = voicing(chord);
    const root = CHORD_NOTES[chord][0];

    // --- the drop: an impact on the first downbeat after a build
    if (bar.first && b > 0 && bars[b - 1].build) {
      addMono(fx, t, 1.6, (x) => Math.sin(2 * Math.PI * (34 * x + (60 / 8) * (1 - Math.exp(-8 * x)))) * Math.exp(-x * 2.4) * 0.9);
      const hp = biquad();
      addMono(fx, t, 2, (x) => hp(noise(), "hp", 5000) * Math.exp(-x * 2.2) * 0.35, 0.8, 1);
    }

    // --- felt piano (energy 0–1)
    if (energy <= 1 && !bar.build) {
      const lowRoot = root < 36 ? root + 12 : root;
      if (energy === 0) {
        const tn = tonesFrom(chord, 56);
        const seq = [[0, lowRoot, 0.5], [1, tn[0], 0.3], [2, tn[1], 0.32], [3, tn[2], 0.3], [4, tn[0] + 12, 0.34], [5, tn[2], 0.26], [6, tn[1], 0.28]];
        for (const [o, m, g] of seq) if (o * 2 < steps) felt(keys, t + o * 2 * S16, m, g, 0.35 + 0.05 * o);
      } else {
        felt(keys, t, lowRoot, 0.4, 0.45);
        for (const m of tonesFrom(chord, 58)) felt(keys, t + 0.012, m, 0.2, 0.55);
        if (8 < steps) for (const m of tonesFrom(chord, 58)) felt(keys, t + 2 * BEAT_S, m, 0.14, 0.55);
      }
    }

    // --- plucks: 8ths at energy 1, quiet 16ths at 3
    if ((energy === 1 || energy === 3) && !bar.build) {
      const tn = tonesFrom(chord, 68);
      const arp = [0, 1, 2, 1, 0, 2, 1, 2];
      const fast = energy === 3;
      const n = fast ? 16 : 8, step = fast ? S16 : 2 * S16;
      for (let i = 0; i < n; i++) {
        if (i * step >= steps * S16) break;
        const m = tn[arp[i % 8] % tn.length] + (fast && i % 4 === 3 ? 12 : 0);
        addMono(plucks, t + i * step, 0.5, pluck(hz(m), (i % 4 === 0 ? 0.32 : 0.22) * (fast ? 0.6 : 1)), i % 2 ? 0.75 : 0.45, i % 2 ? 0.45 : 0.75);
      }
    }

    // --- drums
    if (energy === 1 && !bar.build) {
      for (const i of [0, 8]) if (i < steps) { addMono(drums, t + i * S16, 0.6, kick(0.8)); duck(t + i * S16, 0.6, 0.14); }
      for (let i = 2; i < steps; i += 4) addMono(hats, t + i * S16, 0.08, hat(0.2), 0.45, 0.55);
      // a dark, held supersaw under it, breathing with the kick
      supersaw(chords, t, (steps / 16) * BAR_S * 0.98, v, { vel: 0.6, cutoff: 1300, attack: 0.06, release: 0.25 });
    }
    if (energy >= 2 && !bar.build) {
      const kicks = b % 2 ? [0, 6, 10] : [0, 6];
      if (energy >= 3 && b % 2 === 0) kicks.push(3);
      for (const i of kicks) if (i < steps) { addMono(drums, t + i * S16, 0.6, kick(i === 0 ? 1 : 0.85)); duck(t + i * S16, 0.35, 0.09); }
      if (8 < steps) {
        addMono(drums, t + 8 * S16, 0.6, snare(0.95));
        if (energy >= 3) addMono(drums, t + 8 * S16 + 0.004, 0.5, clap(0.6), 0.45, 0.55);
      }
      if (energy >= 3 && 15 < steps) addMono(drums, t + 15 * S16, 0.3, snare(0.25));
      const hs = energy >= 3 ? 1 : 2;
      for (let i = 0; i < steps; i += hs) addMono(hats, t + i * S16 + (i % 2 ? S16 * 0.1 : 0), 0.08, hat(i % 4 === 2 ? 0.22 : i % 2 ? 0.1 : 0.15), 0.4, 0.6);
      if (14 < steps) addMono(hats, t + 14 * S16, 0.5, hat(0.13, true), 0.6, 0.4);
      // every beat the chords dip and swell back (the future-bass pump)
      for (let k = 0; k < 4; k++) if (k * 4 < steps) duck(t + k * BEAT_S, 0.85, 0.11);
    }

    // --- supersaw chords
    if (energy >= 2 && !bar.build) {
      for (let k = 0; k < 4; k++) {
        if (k * 4 >= steps) break;
        supersaw(chords, t + k * BEAT_S, BEAT_S * 0.98, v, { vel: k === 0 ? 1 : 0.85, bend: k === 0 ? 1.5 : 0, cutoff: energy >= 3 ? 6000 : 4200, wob: energy >= 3 && k >= 2 ? 0.55 : 0, wobRate: 3 / BEAT_S });
      }
      // the sub, under the kicks
      const f = root < 33 ? root + 12 : root;
      const notes = b % 2 ? [[0, 6], [6, 4], [10, 6]] : [[0, 6], [6, 10]];
      for (const [i, d] of notes) {
        if (i >= steps) continue;
        const dur = Math.min(d, steps - i) * S16;
        addMono(sub, t + i * S16, dur + 0.03, (x) => Math.tanh(Math.sin(2 * Math.PI * hz(f) * x) * 1.4) * Math.min(1, x / 0.005) * Math.min(1, Math.max(0, (dur - x) / 0.03 + 1)));
      }
    }

    // --- vocal chops at the peaks
    if (energy >= 3 && !bar.build) {
      const tn = tonesFrom(chord, 70);
      for (const [i, k, vow, d] of CHOPS) if (i < steps) chop(chops, t + i * S16, tn[k % tn.length] + (k >= tn.length ? 12 : 0), d * S16 * 0.9, vow, i === 0 ? 0.5 : 0.38, 0.4 + 0.2 * (i % 3) / 2);
    }

    // --- build: snare roll speeding up, a riser, the filter opening, then a gap
    if (bar.build) {
      supersaw(chords, t, BAR_S - BEAT_S / 2, v, { vel: 0.8, cutoff: 350, cutoffEnd: 7000, attack: 0.3, release: 0.02 });
      // in 16ths: 8ths on beat 1, 16ths on 2, 32nds on 3, 64ths up to the gap
      const hits = [0, 2, 4, 5, 6, 7];
      for (let i = 0; i < 8; i++) hits.push(8 + i * 0.5);
      for (let i = 0; i < 8; i++) hits.push(12 + i * 0.25);
      hits.forEach((p, i) => addMono(drums, t + p * S16, 0.2, snare(0.25 + 0.55 * (i / hits.length)), 0.5, 0.5));
      const hp = biquad();
      addMono(fx, t, BAR_S - BEAT_S / 2, (x) => { const k = x / (BAR_S - BEAT_S / 2); return hp(noise(), "hp", 600 + 9000 * k * k) * k * k * 0.9; });
      let ph = 0;
      addMono(fx, t, BAR_S - BEAT_S / 2, (x) => { const k = x / (BAR_S - BEAT_S / 2); ph = (ph + (220 + 1400 * k * k) / SR) % 1; return Math.sin(2 * Math.PI * ph) * k * k * 0.12; });
      const g0 = Math.round((t + BAR_S - BEAT_S / 2) * SR), g1 = Math.round((t + BAR_S) * SR);
      for (let i = g0; i < g1 && i < N; i++) gate[i] = Math.max(0, 1 - (i - g0) / 200, 1 - (g1 - i) / 80);
    }

    // --- stop: the chord glitches out on the last beat
    if (bar.stop) {
      if (energy >= 2) {
        const t4 = t + 3 * BEAT_S;
        for (let k = 0; k < 8; k++) {
          const tmp = buffer(0.09);
          supersaw(tmp, 0, S16 / 2 * 0.8, v.map((m) => m - k * 1.5), { vel: 1.2 * (1 - k / 10), cutoff: 5000 - k * 450, release: 0.005 });
          let held = 0;
          for (let i = 0; i < tmp[0].length; i++) {
            if (i % 6 === 0) held = Math.round(tmp[0][i] * 30) / 10;
            const at = Math.round((t4 + k * S16 / 2) * SR) + i;
            if (at < N) { fx[0][at] += held; fx[1][at] += held; }
          }
        }
      } else {
        // energy 1 → 0: the plucks just stop; the piano rings on
        felt(keys, t + 3 * BEAT_S, (root < 36 ? root + 12 : root) + 12, 0.25, 0.5);
      }
    }
  });

  renderPad(pad, {
    chordAt,
    levelAt: (t) => [0.006, 0.01, 0.014, 0.016][scenes[sceneAt(t)].energy],
    cutoffAt: (t) => 700 + 300 * scenes[sceneAt(t)].energy,
    xfade: 0.1,
  });

  for (let i = 0; i < N && i < chords[0].length; i++) {
    const p = pump[i], ps = 1 - (1 - p) * 0.6;
    chords[0][i] *= p; chords[1][i] *= p;
    pad[0][i] *= ps; pad[1][i] *= ps;
    plucks[0][i] *= ps; plucks[1][i] *= ps;
    sub[0][i] *= 1 - (1 - p) * 0.3; sub[1][i] *= 1 - (1 - p) * 0.3;
  }
  echo(chords, BEAT_S * 0.75 * 1000, 0.18);
  echo(chops, BEAT_S * 0.75 * 1000, 0.3);
  echo(plucks, BEAT_S * 0.5 * 1000, 0.3);
  echo(keys, BEAT_S * 1.5 * 1000, 0.18);
  echo(drums, 45, 0.12);

  const out = buffer(len);
  mix(out, drums, 1.0);
  mix(out, hats, 0.8);
  mix(out, chords, 0.55);
  mix(out, sub, 0.42);
  mix(out, chops, 0.16);
  mix(out, plucks, 0.4);
  mix(out, keys, 0.5);
  mix(out, pad, 1);
  mix(out, fx, 0.45);
  for (let i = 0; i < out[0].length; i++) {
    const g = i < N ? gate[i] : 1;
    out[0][i] = Math.tanh(out[0][i] * 1.1) * g;
    out[1][i] = Math.tanh(out[1][i] * 1.1) * g;
  }

  fadeTail(out, songEnd);
  normalize(out, -1);
  return out;
};
