// "cinematic": a trailer-style score (used by 《年龄焦虑》) — another set of
// sounds: spiccato strings, taiko drums, low brass "braams", an endlessly
// rising Shepard tone at the peaks, and a solo piano in the quiet parts.
//
// Per scene, `energy` decides what plays:
//   0  solo piano arpeggios + a soft string pad
//   1  + spiccato strings in 8ths, a taiko heartbeat on 1
//   2  + spiccato in 16ths, syncopated taiko pattern, a braam at the top of the scene
//   3  + rim "ka" on the off-beats and the Shepard tone (running and never arriving)
// Between scenes: the bar before a scene with more energy is a taiko roll that
// accelerates into the next braam; the beat before a breakdown sucks back into silence.
import { CHORD_NOTES, SAW, SR, TABLE_SIZE, addMono, biquad, buffer, echo, hz, mix, noise, normalize, pianoNote } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

const taiko = (vel = 1, f = 62) => {
  const lp = biquad();
  return (t) => (Math.sin(2 * Math.PI * (f * t + (f * 0.8 / 14) * (1 - Math.exp(-14 * t)))) * Math.exp(-t * 4.5) + lp(noise(), "lp", 400) * Math.exp(-t * 30) * 0.8) * vel;
};
const ka = (vel = 1) => {
  const bp = biquad();
  return (t) => (bp(noise(), "bp", 2300, 3) * 1.6 + Math.sin(2 * Math.PI * 950 * t) * 0.5) * Math.exp(-t * 55) * vel;
};
const spiccato = (f, vel = 1) => {
  const lp = biquad();
  const ph = [0, 0];
  return (t) => {
    ph[0] = (ph[0] + (f * 1.003) / SR) % 1; ph[1] = (ph[1] + (f * 0.997) / SR) % 1;
    const env = Math.min(1, t / 0.006) * Math.exp(-t * 20);
    return lp(SAW[(ph[0] * TABLE_SIZE) | 0] + SAW[(ph[1] * TABLE_SIZE) | 0], "lp", 900 + 2400 * env) * env * vel;
  };
};
const braam = (root, dur) => {
  const lp = biquad();
  const notes = [root, root + 7, root + 12, root - 12].map(hz);
  const ph = notes.map(() => [0, 0]);
  return (t) => {
    const env = Math.min(1, t / 0.06) * Math.exp(-Math.max(0, t - 0.4) * (3 / dur));
    let s = 0;
    notes.forEach((f, i) => {
      ph[i][0] = (ph[i][0] + (f * 1.004) / SR) % 1; ph[i][1] = (ph[i][1] + (f * 0.996) / SR) % 1;
      s += SAW[(ph[i][0] * TABLE_SIZE) | 0] + SAW[(ph[i][1] * TABLE_SIZE) | 0];
    });
    const cut = 200 + 1600 * Math.exp(-t * 2.2) * Math.min(1, t / 0.08);
    return Math.tanh(lp(s, "lp", cut) * 0.9) * env;
  };
};

const tonesOf = (chord, low) => [...new Set(CHORD_NOTES[chord].map((n) => { let m = n; while (m < low) m += 12; return m; }))].sort((a, b) => a - b);

export const scoreCinematic = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const S16 = BEAT_S / 4;
  const len = songEnd + 3;
  const drums = buffer(len), strings = buffer(len), brass = buffer(len), piano = buffer(len), shep = buffer(len), pad = buffer(len), fx = buffer(len);
  const nBars = Math.round(songEnd / BAR_S);
  const duck = new Float32Array(Math.ceil(len * SR)).fill(1);

  const bars = Array.from({ length: nBars }, (_, b) => {
    const t = b * BAR_S;
    const k = sceneAt(t + 1e-4);
    const s = scenes[k], next = scenes[k + 1];
    const last = t + BAR_S >= s.end - 1e-4;
    return { t, chord: chordAt(t + 1e-4), energy: s.energy, first: Math.abs(t - s.start) < 1e-4, build: last && next && next.energy > s.energy && next.energy >= 2, stop: last && next && next.energy === 0 && s.energy > 0 };
  });

  const hit = (t0, vel, f) => {
    addMono(drums, t0, 1.2, taiko(vel, f));
    const s0 = Math.round(t0 * SR);
    for (let j = 0; j < 0.3 * SR && s0 + j < duck.length; j++) duck[s0 + j] = Math.min(duck[s0 + j], 1 - 0.4 * vel * Math.exp(-(j / SR) / 0.1));
  };

  bars.forEach((bar) => {
    const { t, energy, chord } = bar;
    const steps = bar.stop ? 12 : 16;
    const root = CHORD_NOTES[chord][0];

    // --- piano in the quiet scenes: rolling 8th-note arpeggios
    if (energy === 0) {
      const tn = tonesOf(chord, 57);
      const run = [tn[0] - 12, tn[0], tn[1], tn[2] ?? tn[0] + 7, tn[0] + 12, tn[2] ?? tn[0] + 7, tn[1], tn[0]];
      run.forEach((n, i) => pianoNote(piano, t + i * 2 * S16, n, i === 0 ? 0.32 : 0.2, 0.35 + 0.3 * (i % 2)));
    }

    // --- spiccato strings
    if (energy >= 1 && !bar.build) {
      const tn = tonesOf(chord, 45);
      const pat = [tn[0], tn[0], tn[1], tn[0], tn[2] ?? tn[1], tn[0], tn[1], tn[0] + 12];
      const sixteenth = energy >= 2;
      for (let i = 0; i < steps; i += sixteenth ? 1 : 2) {
        const n = pat[(sixteenth ? i : i / 2) % pat.length];
        const acc = i % 4 === 0 ? 1 : i % 2 === 0 ? 0.7 : 0.5;
        const pan = 0.3 + 0.4 * ((i >> 1) % 2);
        addMono(strings, t + i * S16, 0.3, spiccato(hz(n), acc), 1 - pan, pan);
        if (energy >= 3) addMono(strings, t + i * S16, 0.3, spiccato(hz(n + 12), acc * 0.45), pan, 1 - pan);
      }
    }

    // --- taiko
    if (!bar.build) {
      if (energy === 1) hit(t, 0.6, 58);
      if (energy >= 2) {
        const pat = energy >= 3 ? [[0, 1], [3, 0.6], [6, 0.8], [8, 0.9], [10, 0.6], [11, 0.7], [14, 0.8]] : [[0, 1], [3, 0.55], [6, 0.75], [8, 0.9], [14, 0.7]];
        for (const [i, v] of pat) if (i < steps) hit(t + i * S16, v, i === 0 || i === 8 ? 58 : 74);
      }
      if (energy >= 3) for (const i of [2, 6, 10, 14]) if (i < steps) addMono(drums, t + i * S16, 0.1, ka(0.4), 0.7, 1);
    }
    // --- braam at the top of a driving scene
    if (energy >= 2 && bar.first) addMono(brass, t, 3, braam(root < 36 ? root : root - 12, 2.5));

    // --- build: an accelerating taiko roll and a riser
    if (bar.build) {
      const rolls = [];
      for (let i = 0; i < 4; i++) rolls.push(i * 2 * S16);
      for (let i = 0; i < 8; i++) rolls.push(2 * BEAT_S + i * S16 * 0.5 * 2);
      for (let i = 0; i < 8; i++) rolls.push(3 * BEAT_S + i * (S16 / 2));
      rolls.forEach((o, i) => hit(t + o, 0.35 + 0.6 * (i / rolls.length), 70 + (i % 2) * 10));
      const bp = biquad();
      addMono(fx, t, BAR_S, (x) => { const k = x / BAR_S; return bp(noise(), "bp", 300 + 4000 * k * k, 2) * k * k * 1.2; });
    }
    // --- stop: a reversed swell sucking back into silence
    if (bar.stop) {
      const lp = biquad();
      addMono(fx, t + 2 * BEAT_S, BEAT_S, (x) => lp(noise(), "lp", 400 + 5000 * (x / BEAT_S)) * (x / BEAT_S) ** 3 * 1.4);
    }
  });

  // --- the Shepard tone: under every energy-3 stretch, always rising, never arriving
  {
    const N = 8, f0 = 40, rate = 0.25; // one octave every 4 s
    const phases = new Float64Array(N);
    let lvl = 0;
    for (let i = 0; i < shep[0].length; i++) {
      const t = i / SR;
      const target = t < songEnd && scenes[sceneAt(t)].energy >= 3 ? 1 : 0;
      lvl += (target - lvl) * 0.00005;
      if (lvl < 1e-4) continue;
      const s = (t * rate) % 1;
      let v = 0;
      for (let k = 0; k < N; k++) {
        const pos = (k + s) % N;
        const f = f0 * 2 ** pos;
        phases[k] = (phases[k] + f / SR) % 1;
        const a = Math.exp(-(((pos - N / 2) / (N / 4)) ** 2));
        v += Math.sin(2 * Math.PI * phases[k]) * a;
      }
      shep[0][i] += v * lvl * 0.08;
      shep[1][i] += v * lvl * 0.08;
    }
  }

  renderPad(pad, {
    chordAt,
    levelAt: (t) => (scenes[sceneAt(t)].energy === 0 ? 0.05 : 0.035),
    cutoffAt: (t) => 500 + 250 * scenes[sceneAt(t)].energy,
    xfade: 0.1,
  });

  for (const buf of [strings, pad, brass, shep]) for (let i = 0; i < buf[0].length && i < duck.length; i++) { buf[0][i] *= duck[i]; buf[1][i] *= duck[i]; }
  echo(drums, BEAT_S * 0.5 * 1000, 0.22); // the hall
  echo(piano, BEAT_S * 0.75 * 1000, 0.3);
  echo(strings, 90, 0.15);

  const out = buffer(len);
  mix(out, drums, 0.9);
  mix(out, strings, 0.13);
  mix(out, brass, 0.16);
  mix(out, piano, 0.32);
  mix(out, shep, 1);
  mix(out, pad, 1);
  mix(out, fx, 0.3);
  for (let i = 0; i < out[0].length; i++) { out[0][i] = Math.tanh(out[0][i] * 1.1); out[1][i] = Math.tanh(out[1][i] * 1.1); }

  fadeTail(out, songEnd);
  normalize(out, -1);
  return out;
};
