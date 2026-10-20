// "acid": a relentless acid-techno score (used by 《控制欲》 — the line that never
// lets go) — another set of sounds: a rumbling four-on-the-floor kick, claps,
// open hats on the off-beat, a 303-style acid line (a saw through a resonant
// filter, accents and slides) that runs in 16ths, chord stabs — and under the
// quiet parts, tubular bells over a pad.
//
// Per scene, `energy` decides what plays:
//   0  tubular bells and a soft pad
//   1  + the acid line, its filter almost closed, a soft kick
//   2  + the rumble kick, claps on 2 and 4, open hats, the filter opening
//   3  + a second acid line an octave up, a ride, stabs on the off-beats
// Between scenes: the bar before a scene with more energy, the filter sweeps
// all the way open over a snare roll, half a beat of silence, the drop; the
// bar before a breakdown, the acid line slides down and stops on 3.
import { CHORD_NOTES, SAW, SR, TABLE_SIZE, addMono, biquad, buffer, echo, hz, mix, noise, normalize } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

const kick = (vel = 1) => {
  const lp = biquad();
  return (t) => (Math.sin(2 * Math.PI * (48 * t + (110 / 30) * (1 - Math.exp(-30 * t)))) * Math.exp(-t * 6) * 1.1 + Math.sin(2 * Math.PI * 2200 * t) * Math.exp(-t * 400) * 0.25 + lp(noise(), "lp", 120) * Math.exp(-t * 4) * 0.8) * vel;
};
const clap = (vel = 1) => {
  const bp = biquad();
  return (t) => bp(noise(), "bp", 1300, 0.8) * ([0, 0.011, 0.022].reduce((a, o) => a + (t >= o ? Math.exp(-(t - o) * 130) : 0), 0) * 0.6 + Math.exp(-t * 12) * 0.45) * vel;
};
const hat = (vel = 1, open = false) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 8000) * Math.exp(-t * (open ? 12 : 70)) * vel;
};
const ride = (vel = 1) => {
  const hp = biquad();
  return (t) => ([1, 1.47, 1.97, 2.63].reduce((a, r, i) => a + Math.sin(2 * Math.PI * 3400 * r * t + i) / (i + 1), 0) * 0.15 + hp(noise(), "hp", 6500) * 0.4) * Math.exp(-t * 6) * vel;
};
const snare = (vel = 1) => {
  const bp = biquad();
  return (t) => (Math.sin(2 * Math.PI * 200 * t) * Math.exp(-t * 25) * 0.5 + bp(noise(), "bp", 2400, 0.6) * Math.exp(-t * 16)) * vel;
};
// tubular bell: inharmonic partials, long ring
const bell = (f, vel = 1) => (t) => [1, 2.76, 5.4, 8.9].reduce((a, r, i) => a + Math.sin(2 * Math.PI * f * r * t) * Math.exp(-t * (0.8 + i * 1.6)) / (i + 1), 0) * Math.min(1, t / 0.003) * vel;

// the acid line: one continuous voice so slides glide; 16 steps of
// [semitone offset, accent, slide, gate]
const PATTERN = [
  [0, 1, 0, 1], [0, 0, 0, 1], [12, 0, 1, 1], [0, 0, 0, 1], [3, 1, 0, 1], [0, 0, 0, 0], [7, 0, 1, 1], [5, 0, 0, 1],
  [0, 1, 0, 1], [12, 0, 0, 1], [10, 0, 1, 1], [0, 0, 0, 1], [3, 1, 0, 1], [3, 0, 1, 1], [7, 0, 0, 1], [0, 0, 0, 0],
];

export const scoreAcid = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const S16 = BEAT_S / 4;
  const len = songEnd + 3;
  const drums = buffer(len), hats = buffer(len), acid = buffer(len), stabs = buffer(len), bells = buffer(len), pad = buffer(len), fx = buffer(len);
  const nBars = Math.round(songEnd / BAR_S);
  const N = Math.ceil(len * SR);
  const gate = new Float32Array(N).fill(1);
  const bars = Array.from({ length: nBars }, (_, b) => {
    const t = b * BAR_S;
    const k = sceneAt(t + 1e-4);
    const s = scenes[k], next = scenes[k + 1];
    const last = t + BAR_S >= s.end - 1e-4;
    return { t, chord: chordAt(t + 1e-4), energy: s.energy, first: Math.abs(t - s.start) < 1e-4, build: last && next && next.energy > s.energy && next.energy >= 2, stop: last && next && next.energy === 0 && s.energy > 0 };
  });

  // render an acid bar: `cut` base cutoff, `sweep` extra over the bar, octave
  const acidBar = (t, root, energy, cut, sweep, oct, steps, vel) => {
    const lp = [biquad(), biquad()];
    let ph = 0, prevMidi = root + PATTERN[0][0] + oct;
    for (let i = 0; i < steps; i++) {
      const [off, acc, slide, on] = PATTERN[i];
      if (!on) continue;
      const midi = root + off + oct;
      const from = slide ? prevMidi : midi;
      const dur = S16 * (slide ? 1.05 : 0.6);
      const s0 = Math.round((t + i * S16) * SR), n = Math.round(dur * SR);
      for (let j = 0; j < n && s0 + j < N; j++) {
        const x = j / SR;
        const m = from + (midi - from) * Math.min(1, x / 0.04);
        ph = (ph + hz(m) / SR) % 1;
        const env = Math.exp(-x * (acc ? 9 : 16));
        const c = cut + sweep * (i / 16) + (acc ? 2600 : 1500) * env;
        const v = lp[1](lp[0](SAW[(ph * TABLE_SIZE) | 0], "lp", c, acc ? 7 : 5), "lp", c * 1.2, 0.7);
        const amp = Math.min(1, x / 0.002) * Math.min(1, Math.max(0, (dur - x) / 0.004)) * (acc ? 1 : 0.7) * vel;
        acid[0][s0 + j] += Math.tanh(v * 1.6) * amp;
        acid[1][s0 + j] += Math.tanh(v * 1.6) * amp;
      }
      prevMidi = midi;
    }
  };

  bars.forEach((bar, b) => {
    const { t, energy, chord } = bar;
    const steps = bar.stop ? 12 : 16;
    const root = (CHORD_NOTES[chord][0] % 12) + 36;

    if (bar.first && b > 0 && bars[b - 1].build) {
      addMono(fx, t, 1.6, (x) => Math.sin(2 * Math.PI * (32 * x + (70 / 9) * (1 - Math.exp(-9 * x)))) * Math.exp(-x * 2.2) * 0.9);
      const hp = biquad();
      addMono(fx, t, 1.8, (x) => hp(noise(), "hp", 5000) * Math.exp(-x * 2.2) * 0.35, 0.8, 1);
    }

    // bells (energy 0)
    if (energy === 0) {
      const tn = [...new Set(CHORD_NOTES[chord].map((n) => n % 12))].map((p) => { let m = p; while (m < 67) m += 12; return m; }).sort((a, z) => a - z);
      addMono(bells, t, 4, bell(hz(tn[0]), 0.3), 0.5, 0.6);
      addMono(bells, t + 2 * BEAT_S, 4, bell(hz(tn[tn.length - 1]), 0.2), 0.6, 0.5);
    }

    // the acid line
    if (energy >= 1 && !bar.build) {
      const cut = energy === 1 ? 250 : energy === 2 ? 500 : 800;
      const sweep = energy === 1 ? 200 : 900 * (0.5 + 0.5 * Math.sin(b * 0.9));
      acidBar(t, root, energy, cut, sweep, 0, steps, 0.6);
      if (energy >= 3) acidBar(t, root, energy, cut + 400, sweep, 12, steps, 0.25);
    }
    if (bar.stop && energy >= 1) {
      let ph = 0;
      addMono(acid, t + 2 * BEAT_S, BEAT_S * 0.9, (x) => { ph = (ph + hz(root + 12 - 18 * (x / (BEAT_S * 0.9))) / SR) % 1; return (2 * ph - 1) * Math.exp(-x * 3) * 0.3; });
    }

    // drums
    if (energy === 1 && !bar.build) for (let k = 0; k * 4 < steps; k++) addMono(drums, t + k * BEAT_S, 0.5, kick(0.55));
    if (energy >= 2 && !bar.build) {
      for (let k = 0; k * 4 < steps; k++) addMono(drums, t + k * BEAT_S, 0.6, kick(1));
      for (const k of [1, 3]) if (k * 4 < steps) addMono(drums, t + k * BEAT_S, 0.4, clap(0.55), 0.48, 0.52);
      for (let k = 0; k * 4 < steps; k++) addMono(hats, t + k * BEAT_S + 2 * S16, 0.25, hat(0.22, true), 0.4, 0.6);
      for (let i = 0; i < steps; i++) if (i % 4 !== 2) addMono(hats, t + i * S16, 0.05, hat(0.08), 0.6, 0.4);
      if (energy >= 3) {
        for (let k = 0; k * 4 < steps; k++) addMono(hats, t + k * BEAT_S, 0.4, ride(0.14), 0.65, 0.35);
        const tn = [...new Set(CHORD_NOTES[chord].map((n) => n % 12))].map((p) => { let m = p; while (m < 60) m += 12; return m; });
        for (const i of [2, 10]) if (i < steps) {
          const lp = biquad();
          const ph = tn.map(() => 0);
          addMono(stabs, t + i * S16, 0.25, (x) => { let s = 0; tn.forEach((m, j) => { ph[j] = (ph[j] + hz(m) / SR) % 1; s += 2 * ph[j] - 1; }); return lp(s, "lp", 2400) * Math.exp(-x * 14) * 0.3; }, 0.45, 0.55);
        }
      }
    }

    // build: the filter flies open over a snare roll, then a gap
    if (bar.build) {
      acidBar(t, root, 2, 300, 6000, 0, 14, 0.6);
      const hits = [0, 2, 4, 6, 8, 9, 10, 11, 12, 12.5, 13, 13.5];
      hits.forEach((p, i) => addMono(drums, t + p * S16, 0.2, snare(0.25 + 0.55 * (i / hits.length)), 0.5, 0.5));
      const hp = biquad();
      addMono(fx, t, BAR_S - BEAT_S / 2, (x) => { const k = x / (BAR_S - BEAT_S / 2); return hp(noise(), "hp", 800 + 8000 * k * k) * k * k * 0.6; });
      const g0 = Math.round((t + BAR_S - BEAT_S / 2) * SR), g1 = Math.round((t + BAR_S) * SR);
      for (let i = g0; i < g1 && i < N; i++) gate[i] = Math.max(0, 1 - (i - g0) / 200, 1 - (g1 - i) / 80);
    }
  });

  renderPad(pad, { chordAt, levelAt: (t) => (scenes[sceneAt(t)].energy === 0 ? 0.016 : 0.01), cutoffAt: () => 900, xfade: 0.1 });
  echo(acid, BEAT_S * 0.75 * 1000, 0.2);
  echo(bells, BEAT_S * 1.5 * 1000, 0.3);
  echo(stabs, BEAT_S * 0.75 * 1000, 0.3);

  const out = buffer(len);
  mix(out, drums, 0.9);
  mix(out, hats, 0.6);
  mix(out, acid, 0.45);
  mix(out, stabs, 0.5);
  mix(out, bells, 1.1);
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
