// "guochao": a modern-Chinese score (used by 《内耗》, which quotes Wang Yangming)
// — another set of sounds: a plucked zheng (Karplus–Strong string model) running
// pentatonic figures, a breathy dizi line, a gong, small cymbals and a frame
// drum over a half-time beat with a sub.
//
// Per scene, `energy` decides what plays:
//   0  solo zheng, slow, + a soft pad
//   1  + sub on the root and a frame-drum heartbeat
//   2  + half-time beat (kick, a big clap-snare on 3), small cymbals, a gong at the top
//   3  + the dizi melody and a 16th shaker; the zheng doubles its pace
// Between scenes: the bar before a scene with more energy is a zheng glissando
// (刮奏) sweeping up the scale over a tanggu roll; the beat before a breakdown,
// one damped zheng "chuck" and silence.
import { CHORD_NOTES, SR, addMono, biquad, buffer, echo, hz, mix, noise, normalize, rand } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

// Karplus–Strong plucked string, rendered straight into `out`.
const zheng = (out, t0, midi, vel = 1, pan = 0.5, decay = 0.996, bright = 0.5) => {
  const f = hz(midi);
  const n = Math.max(2, Math.round(SR / f));
  const buf = new Float32Array(n);
  for (let i = 0; i < n; i++) buf[i] = (rand() * 2 - 1) * (0.6 + 0.4 * bright);
  const s0 = Math.round(t0 * SR), len = Math.round(3.2 * SR);
  let idx = 0, prev = 0;
  for (let i = 0; i < len && s0 + i < out[0].length; i++) {
    if (s0 + i < 0) continue;
    const y = buf[idx];
    const nxt = buf[(idx + 1) % n];
    buf[idx] = (y * (0.5 + 0.2 * bright) + nxt * (0.5 - 0.2 * bright)) * decay;
    idx = (idx + 1) % n;
    // a little body resonance
    const v = (y + prev * 0.3) * vel;
    prev = y;
    out[0][s0 + i] += v * (1 - pan);
    out[1][s0 + i] += v * pan;
  }
};
// dizi: sine + 2nd/3rd harmonics + breath noise, delayed vibrato
const dizi = (f, dur, vel = 1) => {
  const bp = biquad();
  let ph = 0;
  return (t) => {
    const vib = 1 + 0.008 * Math.sin(2 * Math.PI * 5.5 * t) * Math.min(1, Math.max(0, (t - 0.15) / 0.2));
    ph = (ph + (f * vib) / SR) % 1;
    const env = Math.min(1, t / 0.05) * Math.min(1, Math.max(0, (dur - t) / 0.12));
    const tone = Math.sin(2 * Math.PI * ph) + 0.35 * Math.sin(4 * Math.PI * ph) + 0.12 * Math.sin(6 * Math.PI * ph);
    return (tone + bp(noise(), "bp", f * 2, 2) * 0.35) * env * vel;
  };
};
const gong = (vel = 1) => (t) => {
  const partials = [[110, 1], [168, 0.6], [231, 0.45], [297, 0.3], [356, 0.25]];
  const sweep = 1 - 0.02 * Math.min(1, t * 2);
  return partials.reduce((s, [f, a]) => s + Math.sin(2 * Math.PI * f * sweep * t) * a, 0) * Math.min(1, t / 0.02) * Math.exp(-t * 0.9) * 0.4 * vel;
};
const kick = (vel = 1) => (t) => Math.sin(2 * Math.PI * (46 * t + (100 / 24) * (1 - Math.exp(-24 * t)))) * Math.exp(-t * 6.5) * vel;
const clapSnare = (vel = 1) => {
  const bp = biquad();
  return (t) => bp(noise(), "bp", 1500, 0.8) * ([0, 0.012, 0.025].reduce((a, o) => a + (t >= o ? Math.exp(-(t - o) * 120) : 0), 0) * 0.6 + Math.exp(-t * 9) * 0.7) * vel;
};
const cymbal = (vel = 1) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 5000) * Math.exp(-t * 7) * (1 + 0.5 * Math.sin(2 * Math.PI * 3200 * t)) * vel;
};
const frame = (vel = 1) => {
  const lp = biquad();
  return (t) => (Math.sin(2 * Math.PI * 95 * t) * Math.exp(-t * 10) + lp(noise(), "lp", 900) * Math.exp(-t * 25) * 0.6) * vel;
};
const shaker = (vel = 1) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 6500) * Math.min(1, t / 0.01) * Math.exp(-t * 50) * vel;
};

// D minor pentatonic, as MIDI notes across the zheng's range
const PENTA = [2, 5, 7, 9, 0].map((pc) => pc); // D F G A C
const scale = (lo, hi) => { const out = []; for (let m = lo; m <= hi; m++) if (PENTA.includes(((m % 12) + 12) % 12)) out.push(m); return out; };
const ZHENG = scale(50, 86);
const nearest = (m) => ZHENG.reduce((a, b) => (Math.abs(b - m) < Math.abs(a - m) ? b : a));

export const scoreGuochao = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const S16 = BEAT_S / 4;
  const len = songEnd + 3;
  const strings = buffer(len), flute = buffer(len), drums = buffer(len), low = buffer(len), pad = buffer(len), fx = buffer(len);
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
    const anchor = nearest(root + 36);
    const ai = ZHENG.indexOf(anchor);

    // --- zheng figures (up-down pentatonic runs from the chord root)
    if (bar.build) {
      // 刮奏: a glissando sweeping up two octaves across the last two beats
      for (let i = 0; i < 18; i++) zheng(strings, t + 2 * BEAT_S + i * (2 * BEAT_S / 18), ZHENG[Math.min(ZHENG.length - 1, Math.max(0, ai - 4) + i)], 0.35 + 0.4 * (i / 18), 0.3 + 0.4 * (i / 18), 0.994, 0.7);
      for (let i = 0; i < 4; i++) zheng(strings, t + i * 2 * S16, ZHENG[ai + [0, 2, 1, 3][i]], 0.5, 0.5);
    } else {
      const fig = [0, 2, 3, 2, 4, 3, 2, 1];
      const fast = energy >= 3;
      const n = energy === 0 ? 4 : fast ? steps : steps / 2;
      const stepT = energy === 0 ? BEAT_S : fast ? S16 : 2 * S16;
      for (let i = 0; i < n; i++) {
        const m = ZHENG[Math.min(ZHENG.length - 1, ai + fig[i % fig.length] + (b % 2 && i >= n / 2 ? 2 : 0))];
        zheng(strings, t + i * stepT, m, (i % 4 === 0 ? 0.6 : 0.42) * (energy === 0 ? 0.4 : energy === 1 ? 0.7 : 1), 0.35 + 0.3 * (i % 2), energy === 0 ? 0.993 : 0.995, energy === 0 ? 0.3 : 0.5);
      }
    }
    if (bar.stop) zheng(strings, t + 3 * BEAT_S, anchor - 12, 0.7, 0.5, 0.97, 0.9); // damped "chuck"

    // --- dizi melody on the peaks: long notes, a turn at the end of the bar
    if (energy >= 3 && !bar.build) {
      const line = [[0, 2, 1.5], [1.5, 3, 1], [2.5, 4, 0.75], [3.25, 3, 0.7]];
      for (const [o, d, dur] of line) if (o * 4 < steps) addMono(flute, t + o * BEAT_S, dur * BEAT_S + 0.1, dizi(hz(ZHENG[Math.min(ZHENG.length - 1, ai + 5 + d - (b % 2))]), dur * BEAT_S + 0.1, 0.5), 0.8, 1);
    }

    // --- low end
    if (energy >= 1 && !bar.build) {
      const f = hz(root < 31 ? root + 12 : root);
      for (const [o, d] of [[0, 1.6], [2.5, 1.2]]) addMono(low, t + o * BEAT_S, d, (x) => Math.tanh(Math.sin(2 * Math.PI * f * x) * 1.4) * Math.min(1, x / 0.01) * Math.exp(-x * 1.4) * 0.8);
    }
    // --- drums
    const hit = (o, v) => {
      addMono(drums, t + o, 0.6, kick(v));
      const s0 = Math.round((t + o) * SR);
      for (let j = 0; j < 0.25 * SR && s0 + j < duck.length; j++) duck[s0 + j] = Math.min(duck[s0 + j], 1 - 0.45 * Math.exp(-(j / SR) / 0.08));
    };
    if (energy === 1 && !bar.build) for (const o of [0, 1.5]) addMono(drums, t + o * BEAT_S, 0.3, frame(0.5));
    if (energy >= 2 && !bar.build) {
      for (const [i, v] of energy >= 3 ? [[0, 1], [3, 0.6], [10, 0.85], [11, 0.5]] : [[0, 1], [10, 0.8]]) if (i < steps) hit(i * S16, v);
      if (8 < steps) addMono(drums, t + 8 * S16, 0.5, clapSnare(0.9));
      for (const i of [4, 12]) if (i < steps) addMono(drums, t + i * S16, 0.4, cymbal(0.18), 0.7, 0.5);
      if (energy >= 3) for (let i = 0; i < steps; i++) addMono(drums, t + i * S16 + (i % 2 ? S16 * 0.1 : 0), 0.06, shaker(i % 4 === 2 ? 0.22 : 0.12), 0.45, 0.55);
      if (bar.first) addMono(fx, t, 5, gong(0.9));
    }
    // --- build: a tanggu roll under the glissando
    if (bar.build) {
      for (let i = 0; i < 16; i++) addMono(drums, t + i * S16 * (1 - i * 0.012), 0.3, frame(0.15 + 0.35 * (i / 16)));
      const bp = biquad();
      addMono(fx, t, BAR_S, (x) => { const k = x / BAR_S; return bp(noise(), "bp", 500 + 4000 * k * k, 2) * k * k; });
    }
  });

  renderPad(pad, {
    chordAt,
    levelAt: (t) => (scenes[sceneAt(t)].energy === 0 ? 0.022 : 0.016),
    cutoffAt: (t) => 600 + 200 * scenes[sceneAt(t)].energy,
    xfade: 0.1,
  });

  for (const buf of [low, pad, strings]) for (let i = 0; i < buf[0].length && i < duck.length; i++) { buf[0][i] *= duck[i]; buf[1][i] *= duck[i]; }
  echo(strings, BEAT_S * 0.75 * 1000, 0.3);
  echo(flute, BEAT_S * 0.5 * 1000, 0.3);
  echo(drums, 70, 0.12);

  const out = buffer(len);
  mix(out, strings, 0.3);
  mix(out, flute, 0.12);
  mix(out, drums, 1.4);
  mix(out, low, 0.45);
  mix(out, pad, 1);
  mix(out, fx, 0.35);
  for (let i = 0; i < out[0].length; i++) { out[0][i] = Math.tanh(out[0][i] * 1.1); out[1][i] = Math.tanh(out[1][i] * 1.1); }

  fadeTail(out, songEnd);
  normalize(out, -1);
  return out;
};
