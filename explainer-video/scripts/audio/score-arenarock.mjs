// "arenarock": an arena-rock score (used by 《ENTJ · 赢》 — the commander on his
// stage) — another set of sounds: fat distorted power chords (root, fifth,
// octave through a hard clipper and a speaker-cabinet filter), palm-muted
// chugs, a rock kit with a big snare, gang claps, crashes — and under the quiet
// parts, a clean picked guitar.
//
// Per scene, `energy` decides what plays:
//   0  a clean guitar, picked, alone
//   1  + palm-muted chugs on the root in 8ths, a kick on 1 and 3
//   2  + the full kit (snare on 2 and 4, hats in 8ths), open power chords
//        ringing, gang claps on the snare
//   3  + chugs doubled to 16ths, a crash on every bar, a lead line on top
// Between scenes: the bar before a scene with more energy, a tom fill rolling
// down and a feedback swell, half a beat of silence, the drop on a crash; the
// bar before a breakdown, one big chord rings out on 3 and stops.
import { CHORD_NOTES, SAW, SR, TABLE_SIZE, addMono, biquad, buffer, echo, hz, mix, noise, normalize, rand } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

const kick = (vel = 1) => (t) => (Math.sin(2 * Math.PI * (55 * t + (110 / 30) * (1 - Math.exp(-30 * t)))) * Math.exp(-t * 8) + Math.sin(2 * Math.PI * 3200 * t) * Math.exp(-t * 500) * 0.35) * vel;
const snare = (vel = 1) => {
  const bp = biquad(), lp = biquad();
  return (t) => (Math.sin(2 * Math.PI * 190 * t) * Math.exp(-t * 18) * 0.7 + lp(bp(noise(), "bp", 1700, 0.4), "lp", 7000) * Math.exp(-t * 9) * 1.1) * vel;
};
const hat = (vel = 1) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 7500) * Math.exp(-t * 45) * vel;
};
const crash = (vel = 1) => {
  const hp = biquad();
  return (t) => (hp(noise(), "hp", 5000) * 0.8 + [1, 1.43, 2.11].reduce((a, r) => a + Math.sin(2 * Math.PI * 4100 * r * t) * 0.08, 0)) * Math.exp(-t * 1.6) * Math.min(1, t / 0.003) * vel;
};
const clap = (vel = 1) => {
  const bp = biquad();
  return (t) => bp(noise(), "bp", 1200, 0.7) * ([0, 0.012, 0.025, 0.04].reduce((a, o) => a + (t >= o ? Math.exp(-(t - o) * 90) : 0), 0) * 0.5 + Math.exp(-t * 10) * 0.4) * vel;
};
const tom = (f, vel = 1) => (t) => Math.sin(2 * Math.PI * (f * t + 20 * (1 - Math.exp(-15 * t)) / 15)) * Math.exp(-t * 7) * vel;
// a clean plucked string (Karplus–Strong)
const pluck = (out, t0, midi, vel = 1, pan = 0.5, decay = 0.996) => {
  const f = hz(midi), n = Math.max(2, Math.round(SR / f));
  const b = new Float32Array(n);
  for (let i = 0; i < n; i++) b[i] = rand() * 2 - 1;
  const s0 = Math.round(t0 * SR), len = Math.round(2.6 * SR);
  let idx = 0;
  for (let i = 0; i < len && s0 + i < out[0].length; i++) {
    if (s0 + i < 0) continue;
    const y = b[idx], nx = b[(idx + 1) % n];
    b[idx] = (y * 0.5 + nx * 0.5) * decay;
    idx = (idx + 1) % n;
    out[0][s0 + i] += y * vel * (1 - pan);
    out[1][s0 + i] += y * vel * pan;
  }
};

export const scoreArenarock = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const S16 = BEAT_S / 4;
  const len = songEnd + 3;
  const drums = buffer(len), cymbals = buffer(len), gtr = buffer(len), lead = buffer(len), clean = buffer(len), pad = buffer(len), fx = buffer(len);
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

  // a distorted power chord (root, fifth, octave): `mute` makes it a short chug
  const power = (t0, dur, root, vel, mute) => {
    const notes = [root, root + 7, root + 12];
    const voices = notes.flatMap((m) => [-0.05, 0.05].map((d) => ({ f: hz(m + d), ph: rand() })));
    const cab = [biquad(), biquad()], cab2 = [biquad(), biquad()], hp = [biquad(), biquad()];
    const s0 = Math.round(t0 * SR), n = Math.round(dur * SR);
    for (let j = 0; j < n && s0 + j < N; j++) {
      const x = j / SR;
      let l = 0, r = 0;
      voices.forEach((v, i) => { v.ph = (v.ph + v.f / SR) % 1; const s = SAW[(v.ph * TABLE_SIZE) | 0]; if (i % 2) r += s; else l += s; });
      const env = mute ? Math.exp(-x * 26) : Math.exp(-x * 0.7);
      const drive = (s) => Math.tanh(s * 6);
      const c = mute ? 1400 : 3200;
      const g = env * Math.min(1, x / 0.003) * Math.min(1, (dur - x) / 0.02) * vel;
      gtr[0][s0 + j] += cab2[0](cab[0](hp[0](drive(l), "hp", 90), "lp", c, 1.1), "lp", c * 1.3, 0.7) * g;
      gtr[1][s0 + j] += cab2[1](cab[1](hp[1](drive(r), "hp", 90), "lp", c, 1.1), "lp", c * 1.3, 0.7) * g;
    }
  };

  bars.forEach((bar, b) => {
    const { t, energy, chord } = bar;
    const steps = bar.stop ? 8 : 16;
    const rootPc = CHORD_NOTES[chord][0] % 12;
    let root = rootPc + 36; if (root < 40) root += 12; // E2…D#3
    const tones = [...new Set(CHORD_NOTES[chord].map((n) => n % 12))].map((p) => { let m = p; while (m < 60) m += 12; return m; }).sort((a, z) => a - z);

    if (bar.first && b > 0 && bars[b - 1].build) {
      addMono(cymbals, t, 3, crash(0.8), 0.45, 0.6);
      addMono(fx, t, 1.4, (x) => Math.sin(2 * Math.PI * (36 * x + (60 / 8) * (1 - Math.exp(-8 * x)))) * Math.exp(-x * 2.6) * 0.9);
    }

    // clean guitar, energy 0: a picked arpeggio up and down the chord
    if (energy === 0) {
      const seq = [0, 1, 2, 1, 0, 2, 1, 2];
      seq.forEach((k, i) => pluck(clean, t + i * (BAR_S / 8), tones[k % tones.length] - 12 + (i === 5 ? 12 : 0), i % 2 ? 0.7 : 0.9, 0.35 + 0.04 * i));
    }
    if (energy === 1 && !bar.build) {
      for (let i = 0; i * 2 < steps; i++) power(t + i * 2 * S16, 2 * S16 * 0.9, root, 0.32, true);
      for (const k of [0, 2]) if (k * 4 < steps) addMono(drums, t + k * BEAT_S, 0.5, kick(0.8));
      [0, 2, 4, 6].forEach((i) => i * 2 < steps && pluck(clean, t + i * 2 * S16, tones[i % 3], 0.22, 0.65));
    }
    if (energy >= 2 && !bar.build) {
      // power chords: ring on 1, then chugs
      power(t, BEAT_S * 1.5, root, 0.5, false);
      const chug = energy >= 3 ? 1 : 2;
      for (let i = 6; i < steps; i += chug) power(t + i * S16, S16 * chug * 0.9, root, 0.3, true);
      if (steps > 8) power(t + 8 * S16, BEAT_S * 0.9, root + (b % 2 ? 5 : 3), 0.45, false);
      // kit
      for (const i of [0, 3, 8, 10]) if (i < steps) addMono(drums, t + i * S16, 0.5, kick(i === 0 ? 1 : 0.85));
      for (const k of [1, 3]) if (k * 4 < steps) { addMono(drums, t + k * BEAT_S, 0.5, snare(0.95)); addMono(drums, t + k * BEAT_S, 0.4, clap(0.45), 0.4, 0.6); }
      for (let i = 0; i < steps; i += 2) addMono(cymbals, t + i * S16, 0.1, hat(i % 4 === 0 ? 0.22 : 0.14), 0.6, 0.4);
      if (energy >= 3) addMono(cymbals, t, 2.5, crash(0.55), 0.4, 0.6);
    }
    if (energy >= 3 && !bar.build) {
      // lead: chord tones an octave up, a bend into the first note
      [[0, 2, 2], [2, 1, 1], [3, 0, 1]].forEach(([at, k, d]) => {
        if (at * 4 >= steps) return;
        const m = tones[k] + 12, lp = biquad();
        let ph = rand();
        const dur = d * BEAT_S * 0.95;
        addMono(lead, t + at * BEAT_S, dur, (x) => { ph = (ph + hz(m - Math.max(0, 1 - x / 0.08)) * (1 + 0.005 * Math.sin(2 * Math.PI * 6 * x)) / SR) % 1; return lp(Math.tanh(SAW[(ph * TABLE_SIZE) | 0] * 4), "lp", 3500) * Math.min(1, x / 0.01) * Math.min(1, (dur - x) / 0.04) * 0.16; }, 0.55, 0.45);
      });
    }
    // build: a tom fill tumbling down, feedback swell, a gap
    if (bar.build) {
      power(t, BEAT_S * 2, root, 0.4, false);
      [[8, 196], [9, 196], [10, 165], [11, 165], [12, 131], [13, 131], [14, 110]].forEach(([i, f], k) => addMono(drums, t + i * S16, 0.4, tom(f, 0.6 + k * 0.05)));
      let ph = 0;
      addMono(fx, t, BAR_S - BEAT_S / 2, (x) => { ph = (ph + hz(tones[0] + 12 + 12 * x / BAR_S) / SR) % 1; return Math.tanh(Math.sin(2 * Math.PI * ph) * 4) * (x / BAR_S) ** 2 * 0.12; });
      const g0 = Math.round((t + BAR_S - BEAT_S / 2) * SR), g1 = Math.round((t + BAR_S) * SR);
      for (let i = g0; i < g1 && i < N; i++) gate[i] = Math.max(0, 1 - (i - g0) / 200, 1 - (g1 - i) / 80);
    }
    if (bar.stop && energy >= 1) {
      power(t + 2 * BEAT_S, BEAT_S * 2, root, 0.45, false);
      addMono(cymbals, t + 2 * BEAT_S, 2, crash(0.5), 0.5, 0.5);
    }
  });

  renderPad(pad, { chordAt, levelAt: (t) => (scenes[sceneAt(t)].energy === 0 ? 0.012 : 0.007), cutoffAt: () => 900, xfade: 0.1 });
  echo(clean, BEAT_S * 0.75 * 1000, 0.3);
  echo(lead, BEAT_S * 0.75 * 1000, 0.3);
  echo(drums, 60, 0.12);

  const out = buffer(len);
  mix(out, drums, 0.95);
  mix(out, cymbals, 0.55);
  mix(out, gtr, 0.55);
  mix(out, lead, 0.9);
  mix(out, clean, 1.1);
  mix(out, pad, 1);
  mix(out, fx, 0.45);
  for (let i = 0; i < out[0].length; i++) {
    const g = i < N ? gate[i] : 1;
    out[0][i] = Math.tanh(out[0][i] * 1.15) * g;
    out[1][i] = Math.tanh(out[1][i] * 1.15) * g;
  }
  fadeTail(out, songEnd);
  normalize(out, -1);
  return out;
};
