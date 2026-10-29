// "glitchhop": a glitch-hop score (used by 《信息焦虑》 — the feed that never
// stops) — another set of sounds: a swung, crunchy, bit-crushed break, a wobble
// bass (a saw through a low-pass that an LFO throws open in triplets),
// notification blips, stutter edits that chop the end of a bar into repeats —
// and under the quiet parts, a kalimba.
//
// Per scene, `energy` decides what plays:
//   0  a kalimba alone
//   1  + a soft swung beat and a sub
//   2  + the crunchy break, the wobble bass, notification blips
//   3  + a bit-crushed square lead, and the last beat of every bar stuttered
// Between scenes: the bar before a scene with more energy, a snare roll while
// the wobble speeds up, half a beat of silence, the drop; the bar before a
// breakdown, the bar glitches out — its second half chopped into ever-shorter
// repeats — and stops.
import { CHORD_NOTES, SAW, SR, TABLE_SIZE, addMono, biquad, buffer, echo, hz, mix, noise, normalize } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

const crush = (v, bits = 5) => Math.round(v * (1 << bits)) / (1 << bits);
const kick = (vel = 1) => (t) => Math.tanh((Math.sin(2 * Math.PI * (48 * t + (140 / 26) * (1 - Math.exp(-26 * t)))) * Math.exp(-t * 8) + Math.sin(2 * Math.PI * 2600 * t) * Math.exp(-t * 300) * 0.3) * 1.8) * vel;
const snare = (vel = 1, crunch = false) => {
  const bp = biquad();
  return (t) => {
    const v = (Math.sin(2 * Math.PI * 210 * t) * Math.exp(-t * 22) * 0.6 + bp(noise(), "bp", 2200, 0.5) * Math.exp(-t * 13)) * vel;
    return crunch ? crush(Math.tanh(v * 2), 4) * 0.7 : v;
  };
};
const hat = (vel = 1) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 9000) * Math.exp(-t * 70) * vel;
};
const blip = (f, vel = 1) => (t) => (Math.sin(2 * Math.PI * f * t) * (t < 0.07 ? 1 : 0) + Math.sin(2 * Math.PI * f * 1.5 * t) * (t >= 0.08 && t < 0.16 ? 1 : 0)) * Math.min(1, (t % 0.08) / 0.003) * vel;
// kalimba: a struck tine — fundamental plus a bright, quickly-dying overtone
const kalimba = (f, vel = 1) => (t) => (Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 3.2) + Math.sin(2 * Math.PI * f * 5.95 * t) * 0.3 * Math.exp(-t * 30) + Math.sin(2 * Math.PI * f * 2 * t) * 0.12 * Math.exp(-t * 8)) * Math.min(1, t / 0.002) * vel;

const SWING = 0.18; // of a 16th, on the off 16ths
const KICKS = { 1: [0, 10], 2: [0, 6, 10], 3: [0, 3, 6, 10, 11] };
const SNARES = [4, 12];

export const scoreGlitchhop = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const S16 = BEAT_S / 4;
  const at16 = (t, i) => t + i * S16 + (i % 2 ? SWING * S16 : 0);
  const len = songEnd + 3;
  const drums = buffer(len), hats = buffer(len), bass = buffer(len), lead = buffer(len), blips = buffer(len), kal = buffer(len), pad = buffer(len), fx = buffer(len);
  const nBars = Math.round(songEnd / BAR_S);
  const N = Math.ceil(len * SR);
  const gate = new Float32Array(N).fill(1);
  const stutters = []; // [from, to, slice] in seconds: replay `slice` seconds from `from` over and over until `to`
  const bars = Array.from({ length: nBars }, (_, b) => {
    const t = b * BAR_S;
    const k = sceneAt(t + 1e-4);
    const s = scenes[k], next = scenes[k + 1];
    const last = t + BAR_S >= s.end - 1e-4;
    return { t, chord: chordAt(t + 1e-4), energy: s.energy, first: Math.abs(t - s.start) < 1e-4, build: last && next && next.energy > s.energy && next.energy >= 2, stop: last && next && next.energy === 0 && s.energy > 0 };
  });

  const wobble = (t0, dur, midi, rate, vel) => {
    const lp = [biquad(), biquad()];
    let p1 = 0, p2 = 0.3;
    addMono(bass, t0, dur, (x) => {
      p1 = (p1 + hz(midi) / SR) % 1; p2 = (p2 + hz(midi + 0.1) / SR) % 1;
      const lfo = 0.5 - 0.5 * Math.cos(2 * Math.PI * (typeof rate === "function" ? rate(x) : rate * x));
      const c = 120 + 2200 * lfo * lfo;
      const v = lp[1](lp[0](SAW[(p1 * TABLE_SIZE) | 0] + SAW[(p2 * TABLE_SIZE) | 0], "lp", c, 3), "lp", c * 1.3, 0.8);
      return Math.tanh(v * 2.2) * Math.min(1, x / 0.005) * Math.min(1, Math.max(0, (dur - x) / 0.02)) * vel;
    });
  };

  bars.forEach((bar, b) => {
    const { t, energy, chord } = bar;
    const root = CHORD_NOTES[chord][0] % 12;
    let r = root + 24; if (r < 31) r += 12;
    const tones = [...new Set(CHORD_NOTES[chord].map((n) => n % 12))].map((p) => { let m = p; while (m < 67) m += 12; return m; }).sort((a, z) => a - z);

    if (bar.first && b > 0 && bars[b - 1].build) {
      addMono(fx, t, 1.6, (x) => Math.sin(2 * Math.PI * (34 * x + (70 / 9) * (1 - Math.exp(-9 * x)))) * Math.exp(-x * 2.4) * 0.9);
      const hp = biquad();
      addMono(fx, t, 1.8, (x) => hp(noise(), "hp", 5000) * Math.exp(-x * 2.2) * 0.35, 0.8, 1);
    }

    // kalimba: energy 0 a gentle figure; energy 1 a sparser one
    if (energy === 0) {
      const seq = [0, 2, 1, 2, 0, 1, 2, 3];
      seq.forEach((k, i) => addMono(kal, at16(t, i * 2), 1.5, kalimba(hz(tones[k % tones.length] + (k === 3 ? 12 : 0) - 12), i % 2 ? 0.28 : 0.4), 0.45 + 0.04 * i, 0.75 - 0.04 * i));
    }
    if (energy === 1 && !bar.build) [0, 6, 10].forEach((i, k) => addMono(kal, at16(t, i), 1.2, kalimba(hz(tones[k] - 12), 0.28), 0.5, 0.6));

    // drums
    if (energy >= 1 && !bar.build) {
      const crunch = energy >= 2;
      for (const i of KICKS[Math.min(3, energy)]) addMono(drums, at16(t, i), 0.5, kick(energy === 1 ? 0.6 : i === 0 ? 1 : 0.85));
      for (const i of SNARES) addMono(drums, at16(t, i), 0.5, snare(energy === 1 ? 0.45 : 0.9, crunch));
      if (energy >= 2) for (const i of [7, 15]) addMono(drums, at16(t, i), 0.3, snare(0.2));
      for (let i = 0; i < 16; i++) if (energy >= 2 || i % 2 === 0) addMono(hats, at16(t, i), 0.05, hat(i % 4 === 2 ? 0.24 : i % 2 ? 0.1 : 0.16), i % 2 ? 0.65 : 0.4, i % 2 ? 0.4 : 0.65);
    }
    // bass
    if (energy === 1 && !bar.build) for (const i of [0, 10]) addMono(bass, at16(t, i), BEAT_S * 1.4, (x) => Math.sin(2 * Math.PI * hz(r) * x) * Math.exp(-x * 2) * 0.55);
    if (energy >= 2 && !bar.build) {
      const rate = 3 / BEAT_S; // triplet eighths
      wobble(t, BEAT_S * 2 - 0.02, r, energy >= 3 ? rate : rate / 2, 0.55);
      wobble(t + BEAT_S * 2, BEAT_S * 2 - 0.02, r + (b % 2 ? 3 : 0), rate, 0.55);
      // notifications: two little pings, now and then
      if (b % 2 === 1) addMono(blips, at16(t, 14), 0.2, blip(hz(tones[tones.length - 1] + 12), 0.18), 0.7, 0.4);
      if (b % 4 === 2) addMono(blips, at16(t, 7), 0.2, blip(hz(tones[1] + 12), 0.15), 0.4, 0.7);
    }
    if (energy >= 3 && !bar.build) {
      // a bit-crushed square lead on the chord tones
      [[0, 0], [3, 1], [6, 2], [8, 1], [11, 0], [12, 2]].forEach(([i, k]) => {
        addMono(lead, at16(t, i), S16 * 1.6, (x) => crush(Math.sign(Math.sin(2 * Math.PI * hz(tones[k]) * x)) * 0.5, 3) * Math.exp(-x * 6) * 0.22, 0.55, 0.45);
      });
      // stutter the last beat: repeat its first 16th, then 32nds
      if (!bar.stop) {
        const s0 = t + 3 * BEAT_S;
        stutters.push([s0, s0 + BEAT_S / 2, S16]);
        stutters.push([s0 + BEAT_S / 2, s0 + BEAT_S, S16 / 2]);
      }
    }
    // build: snare roll, wobble speeding up, gap
    if (bar.build) {
      const hits = [0, 2, 4, 6, 8, 9, 10, 11, 12, 12.5, 13, 13.5];
      hits.forEach((p, i) => addMono(drums, t + p * S16, 0.2, snare(0.25 + 0.6 * (i / hits.length), true), 0.5, 0.5));
      wobble(t, BAR_S - BEAT_S / 2, r, (x) => (1 / BEAT_S) * x + (3 / BEAT_S) * x * x / BAR_S, 0.5);
      const hp = biquad();
      addMono(fx, t, BAR_S - BEAT_S / 2, (x) => { const k = x / (BAR_S - BEAT_S / 2); return hp(noise(), "hp", 800 + 8000 * k * k) * k * k * 0.6; });
      const g0 = Math.round((t + BAR_S - BEAT_S / 2) * SR), g1 = Math.round((t + BAR_S) * SR);
      for (let i = g0; i < g1 && i < N; i++) gate[i] = Math.max(0, 1 - (i - g0) / 200, 1 - (g1 - i) / 80);
    }
    // stop: the second half glitches out into shorter and shorter repeats
    if (bar.stop && energy >= 1) {
      const h = t + 2 * BEAT_S;
      stutters.push([h, h + BEAT_S / 2, S16]);
      stutters.push([h + BEAT_S / 2, h + BEAT_S * 0.8, S16 / 2]);
      stutters.push([h + BEAT_S * 0.8, h + BEAT_S, S16 / 4]);
      const g0 = Math.round((h + BEAT_S) * SR), g1 = Math.round((t + BAR_S) * SR);
      for (let i = g0; i < g1 && i < N; i++) gate[i] = Math.max(0, 1 - (i - g0) / 300);
    }
  });

  renderPad(pad, { chordAt, levelAt: (t) => (scenes[sceneAt(t)].energy === 0 ? 0.014 : 0.008), cutoffAt: () => 900, xfade: 0.1 });
  echo(kal, BEAT_S * 0.75 * 1000, 0.3);
  echo(lead, BEAT_S * 0.75 * 1000, 0.3);
  echo(blips, BEAT_S * 0.5 * 1000, 0.35);

  // the glitchable bus
  const bus = buffer(len);
  mix(bus, drums, 0.95);
  mix(bus, hats, 0.6);
  mix(bus, bass, 0.42);
  mix(bus, lead, 0.8);
  mix(bus, blips, 1);
  const src = [Float32Array.from(bus[0]), Float32Array.from(bus[1])];
  for (const [from, to, slice] of stutters) {
    const a = Math.round(from * SR), z = Math.round(to * SR), n = Math.round(slice * SR);
    for (let i = a; i < z && i < N; i++) {
      const j = a + ((i - a) % n), w = (i - a) % n;
      const env = Math.min(1, w / 40, (n - w) / 40);
      bus[0][i] = src[0][j] * env;
      bus[1][i] = src[1][j] * env;
    }
  }
  const out = buffer(len);
  mix(out, bus, 1);
  mix(out, kal, 1.15);
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
