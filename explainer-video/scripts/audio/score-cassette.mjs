// "cassette": a warm 80s / music-box score (used by 《怀旧》) — another set of
// sounds: a music-box melody, a galloping bass, LinnDrum-style drums with a
// big gated-reverb snare, chorused poly-synth stabs, all through a slightly
// wobbly tape. Transitions are tom fills (into a build) and tape stops (into
// a breakdown).
//
// Per scene, `energy` decides what plays:
//   0  music box + warm pad
//   1  + gallop bass (8th + two 16ths) and a soft clap on 2 and 4
//   2  + kick on every beat, gated snare on 2 and 4, 8th hats
//   3  + poly-synth stabs on the off-beats and 16th hats
import { CHORD_NOTES, SAW, SQUARE, SR, TABLE_SIZE, addMono, biquad, buffer, echo, hz, mix, noise, normalize } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

// ---- voices ----
const kick = (vel = 1) => (t) => Math.sin(2 * Math.PI * (52 * t + (130 / 35) * (1 - Math.exp(-35 * t)))) * Math.exp(-t * 8) * vel;
// the 80s snare: a crack plus a burst of bright reverb that is cut off dead
const gated = (vel = 1) => {
  const bp = biquad(), hp = biquad();
  return (t) => {
    const crack = Math.sin(2 * Math.PI * 190 * t) * Math.exp(-t * 30) * 0.6 + bp(noise(), "bp", 1900, 0.7) * Math.exp(-t * 25);
    const gate = t < 0.22 ? 1 : Math.max(0, 1 - (t - 0.22) / 0.015);
    const tail = hp(noise(), "hp", 900) * 0.55 * gate * Math.exp(-t * 2);
    return (crack + tail) * vel;
  };
};
const clap = (vel = 1) => {
  const bp = biquad();
  return (t) => bp(noise(), "bp", 1200, 0.9) * ([0, 0.01, 0.022].reduce((a, o) => a + (t >= o ? Math.exp(-(t - o) * 160) : 0), 0) * 0.6 + Math.exp(-t * 14) * 0.5) * vel;
};
const hat = (vel = 1) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 9000) * Math.exp(-t * 60) * vel;
};
const tom = (f, vel = 1) => (t) => Math.sin(2 * Math.PI * (f * t + (f * 0.6 / 12) * (1 - Math.exp(-12 * t)))) * Math.exp(-t * 6) * vel;
// music box: bright sine with a high inharmonic partial, quick decay
const musicBox = (f, vel = 1) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 4.2 * t) * Math.exp(-t * 8) + 0.15 * Math.sin(2 * Math.PI * f * 6.8 * t) * Math.exp(-t * 14)) * Math.min(1, t / 0.002) * Math.exp(-t * 2.6) * vel;

const tonesOf = (chord, low) => [...new Set(CHORD_NOTES[chord].map((n) => { let m = n; while (m < low) m += 12; return m; }))].sort((a, b) => a - b);

// A short melody per bar, from the chord's tones, varying across the phrase.
const MOTIFS = [
  [[0, 2], [1, 1], [1.5, 0], [2, 1], [3, 2]],
  [[0, 3], [1, 2], [2, 1], [2.5, 2], [3, 0]],
  [[0, 2], [0.5, 3], [1, 2], [2, 1], [3, 1]],
  [[0, 1], [1, 0], [2, 1], [2.5, 2], [3.5, 3]],
];

export const scoreCassette = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const S16 = BEAT_S / 4;
  const len = songEnd + 3;
  const drums = buffer(len), bass = buffer(len), box = buffer(len), stabs = buffer(len), pad = buffer(len), fx = buffer(len);
  const nBars = Math.round(songEnd / BAR_S);
  const duck = new Float32Array(Math.ceil(len * SR)).fill(1);
  const stops = [];

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
    if (bar.stop) stops.push(t + 3 * BEAT_S);

    // --- music box melody, always
    const tn = tonesOf(chord, 76);
    const motif = MOTIFS[b % MOTIFS.length];
    for (const [o, idx] of motif) if (o * 4 < steps) addMono(box, t + o * BEAT_S, 1.6, musicBox(hz(tn[idx % tn.length] + (idx >= tn.length ? 12 : 0)), energy === 0 ? 0.32 : 0.22), 0.8, 1);

    // --- gallop bass: 8th + two 16ths on every beat, root, octave jump on beat 4
    if (energy >= 1 && !bar.build) {
      const root = CHORD_NOTES[chord][0];
      const f0 = hz(root < 33 ? root + 12 : root);
      for (let beat = 0; beat < 4; beat++) {
        if (beat * 4 >= steps) break;
        const f = beat === 3 && energy >= 2 ? f0 * 2 : f0;
        for (const [o, d] of [[0, 2], [2, 1], [3, 1]]) {
          const lp = biquad();
          let p1 = 0, p2 = 0;
          addMono(bass, t + (beat * 4 + o) * S16, d * S16, (x) => {
            p1 = (p1 + f / SR) % 1; p2 = (p2 + (f * 1.008) / SR) % 1;
            const env = Math.min(1, x / 0.003) * Math.exp(-x * 9);
            return lp(SQUARE[(p1 * TABLE_SIZE) | 0] * 0.6 + SAW[(p2 * TABLE_SIZE) | 0] * 0.6, "lp", 300 + 1800 * env) * env;
          });
        }
      }
    }

    // --- drums
    if (energy >= 2 && !bar.build) {
      for (let beat = 0; beat < 4; beat++) {
        if (beat * 4 >= steps) break;
        addMono(drums, t + beat * BEAT_S, 0.5, kick(beat === 0 ? 1 : 0.8));
        const s0 = Math.round((t + beat * BEAT_S) * SR);
        for (let j = 0; j < 0.25 * SR && s0 + j < duck.length; j++) duck[s0 + j] = Math.min(duck[s0 + j], 1 - 0.5 * Math.exp(-(j / SR) / 0.08));
      }
      for (const i of [4, 12]) if (i < steps) addMono(drums, t + i * S16, 0.4, gated(0.8));
      for (let i = 0; i < steps; i += energy >= 3 ? 1 : 2) addMono(drums, t + i * S16, 0.06, hat(i % 4 === 2 ? 0.2 : 0.11), 0.6, 0.4);
    } else if (energy === 1 && !bar.build) {
      for (const i of [4, 12]) if (i < steps) addMono(drums, t + i * S16, 0.3, clap(0.45));
    }

    // --- poly-synth stabs (chorused saws) on the off-beats
    if (energy >= 3 && !bar.build) {
      const v = tonesOf(chord, 60).slice(0, 4);
      for (const o of [0.5, 1.5, 2.5, 3.5]) {
        if (o * 4 >= steps) continue;
        v.forEach((n, j) => {
          const lp = biquad();
          const ph = [0, 0];
          addMono(stabs, t + o * BEAT_S, 0.35, (x) => {
            ph[0] = (ph[0] + hz(n + 0.12) / SR) % 1; ph[1] = (ph[1] + hz(n - 0.12) / SR) % 1;
            const env = Math.min(1, x / 0.004) * Math.exp(-x * 9);
            return lp(SAW[(ph[0] * TABLE_SIZE) | 0] + SAW[(ph[1] * TABLE_SIZE) | 0], "lp", 900 + 3000 * env) * env;
          }, j % 2 ? 0.6 : 1, j % 2 ? 1 : 0.6);
        });
      }
    }

    // --- build: a descending tom fill across the bar + a reversed swell
    if (bar.build) {
      const fills = [[0, 220], [0.5, 220], [1, 180], [1.5, 180], [2, 150], [2.25, 150], [2.5, 120], [2.75, 120], [3, 100], [3.25, 95], [3.5, 85], [3.75, 80]];
      fills.forEach(([o, f], i) => addMono(drums, t + o * BEAT_S, 0.5, tom(f, 0.55 + 0.4 * (i / fills.length)), 0.5 + 0.4 * Math.sin(i), 0.5 - 0.4 * Math.sin(i)));
      const lp = biquad();
      addMono(fx, t, BAR_S, (x) => { const k = x / BAR_S; return lp(noise(), "lp", 600 + 8000 * k * k) * k * k * k; });
    }
  });

  renderPad(pad, {
    chordAt,
    levelAt: (t) => (scenes[sceneAt(t)].energy === 0 ? 0.075 : 0.045),
    cutoffAt: (t) => 900 + 300 * scenes[sceneAt(t)].energy,
    xfade: 0.1,
  });

  for (const buf of [bass, pad, stabs]) for (let i = 0; i < buf[0].length && i < duck.length; i++) { buf[0][i] *= duck[i]; buf[1][i] *= duck[i]; }
  echo(box, BEAT_S * 0.75 * 1000, 0.35);
  echo(stabs, BEAT_S * 0.5 * 1000, 0.25);

  const out = buffer(len);
  mix(out, drums, 0.85);
  mix(out, bass, 0.3);
  mix(out, box, 0.3);
  mix(out, stabs, 0.08);
  mix(out, pad, 1);
  mix(out, fx, 0.3);

  // tape wobble: a slowly modulated delay over the whole mix
  const src = [out[0].slice(), out[1].slice()];
  for (let i = 0; i < out[0].length; i++) {
    const d = (0.004 + 0.0012 * Math.sin((2 * Math.PI * 0.55 * i) / SR) + 0.0004 * Math.sin((2 * Math.PI * 3.1 * i) / SR)) * SR;
    const p = i - d, i0 = Math.floor(p), fr = p - i0;
    if (i0 < 0) continue;
    for (const c of [0, 1]) out[c][i] = src[c][i0] * (1 - fr) + src[c][i0 + 1] * fr;
  }
  // tape stops: the beat before each breakdown slows to a halt
  for (const t0 of stops) {
    const s0 = Math.round(t0 * SR), n = Math.round(BEAT_S * SR);
    const copy = [out[0].slice(s0, s0 + n), out[1].slice(s0, s0 + n)];
    let pos = 0;
    for (let i = 0; i < n && s0 + i < out[0].length; i++) {
      const rate = Math.max(0, 1 - i / n);
      pos += rate;
      const j = Math.min(n - 1, Math.floor(pos));
      for (const c of [0, 1]) out[c][s0 + i] = copy[c][j] * rate;
    }
  }
  for (let i = 0; i < out[0].length; i++) { out[0][i] = Math.tanh(out[0][i] * 1.1); out[1][i] = Math.tanh(out[1][i] * 1.1); }

  fadeTail(out, songEnd);
  normalize(out, -1);
  return out;
};
