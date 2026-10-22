// "industrial": an EBM / industrial-techno score (used by 《INTJ · 正确》 — the
// mind that has already worked it all out) — another set of sounds: a
// sequenced bass running in 16ths like a machine, a distorted kick, a gated
// snare, metal clanks (inharmonic FM hits), a cold detuned lead — and under the
// quiet parts, a felt piano.
//
// Per scene, `energy` decides what plays:
//   0  a felt piano alone
//   1  + the sequencer ticking behind a nearly closed filter, a soft kick
//   2  + the distorted kick, a gated snare on 2 and 4, metal clanks, the
//        sequencer filter open
//   3  + a second sequence an octave up, a cold detuned lead, the clanks doubled
// Between scenes: the bar before a scene with more energy, the sequencer
// filter climbs over a snare roll, half a beat of silence, the drop; the bar
// before a breakdown, everything cuts out on 3 except one last metal hit.
import { CHORD_NOTES, SAW, SR, TABLE_SIZE, addMono, biquad, buffer, echo, hz, mix, noise, normalize, rand } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

const kick = (vel = 1, dist = 2.4) => (t) => Math.tanh((Math.sin(2 * Math.PI * (46 * t + (150 / 24) * (1 - Math.exp(-24 * t)))) * Math.exp(-t * 7) + Math.sin(2 * Math.PI * 2200 * t) * Math.exp(-t * 350) * 0.3) * dist) * vel * 0.85;
const snare = (vel = 1, gated = true) => {
  const bp = biquad(), lp = biquad();
  return (t) => {
    const env = gated ? (t < 0.16 ? 1 - t * 1.5 : Math.max(0, 0.76 - (t - 0.16) * 40)) : Math.exp(-t * 16);
    return (Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t * 26) * 0.5 + lp(bp(noise(), "bp", 1800, 0.4), "lp", 6000) * env * 0.9) * vel;
  };
};
const hat = (vel = 1) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 9000) * Math.exp(-t * 80) * vel;
};
// metal: a two-operator FM hit with an inharmonic ratio
const metal = (f, ratio = 1.41, vel = 1) => (t) => Math.sin(2 * Math.PI * f * t + 3.5 * Math.exp(-t * 18) * Math.sin(2 * Math.PI * f * ratio * t)) * Math.exp(-t * 9) * vel;
// felt piano: a few slightly stretched partials, soft attack, a muffled decay
const piano = (f, vel = 1) => (t) => [1, 2.003, 3.01, 4.03].reduce((a, r, i) => a + Math.sin(2 * Math.PI * f * r * t) * Math.exp(-t * (1.6 + i * 1.4)) / (1 + i * 1.6), 0) * Math.min(1, t / 0.008) * vel;
// the sequence, 16 steps: semitone offsets (null = rest)
const SEQ = [0, 0, 12, 0, 0, 7, 0, 12, 0, 0, 10, 0, 0, 7, 12, 0];
const ACC = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1];

export const scoreIndustrial = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const S16 = BEAT_S / 4;
  const len = songEnd + 3;
  const drums = buffer(len), hats = buffer(len), seq = buffer(len), lead = buffer(len), metals = buffer(len), keys = buffer(len), pad = buffer(len), fx = buffer(len);
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

  // one bar of the sequencer: short saw notes through a resonant low-pass
  const seqBar = (t, root, steps, cut, vel, oct = 0) => {
    for (let i = 0; i < steps; i++) {
      const m = root + SEQ[i] + oct, acc = ACC[i];
      const lp = [biquad(), biquad()];
      let ph = rand();
      const dur = S16 * 0.8;
      const c = typeof cut === "function" ? cut(i) : cut;
      addMono(seq, t + i * S16, dur, (x) => {
        ph = (ph + hz(m) / SR) % 1;
        const cc = c + (acc ? 1600 : 700) * Math.exp(-x * 30);
        return Math.tanh(lp[1](lp[0](SAW[(ph * TABLE_SIZE) | 0], "lp", cc, 4), "lp", cc, 0.7) * 1.8) * Math.min(1, x / 0.002) * Math.min(1, (dur - x) / 0.006) * (acc ? 1 : 0.7) * vel;
      }, 0.5 + (oct ? 0.15 : 0), 0.5 - (oct ? 0.15 : 0));
    }
  };

  bars.forEach((bar, b) => {
    const { t, energy, chord } = bar;
    const steps = bar.stop ? 8 : 16;
    const root = (CHORD_NOTES[chord][0] % 12) + 36;
    const tones = [...new Set(CHORD_NOTES[chord].map((n) => n % 12))].map((p) => { let m = p; while (m < 60) m += 12; return m; }).sort((a, z) => a - z);

    if (bar.first && b > 0 && bars[b - 1].build) {
      addMono(fx, t, 1.6, (x) => Math.sin(2 * Math.PI * (32 * x + (70 / 9) * (1 - Math.exp(-9 * x)))) * Math.exp(-x * 2.2) * 0.9);
      addMono(metals, t, 1.2, metal(hz(tones[0] - 12), 1.41, 0.5), 0.6, 0.6);
    }

    // felt piano
    if (energy === 0) {
      addMono(keys, t, 4, piano(hz(tones[0] - 12), 0.45), 0.55, 0.55);
      [1, 2, 3].forEach((k, i) => addMono(keys, t + (i + 1) * BEAT_S, 3, piano(hz(tones[k % tones.length]), 0.3 - i * 0.03), 0.45 + i * 0.08, 0.65 - i * 0.08));
    }

    if (energy === 1 && !bar.build) {
      seqBar(t, root, steps, 300, 0.62);
      for (let k = 0; k * 4 < steps; k++) addMono(drums, t + k * BEAT_S, 0.4, kick(0.72, 1.4));
      if (b % 2 === 0) addMono(keys, t, 3, piano(hz(tones[0]), 0.25), 0.5, 0.6);
    }
    if (energy >= 2 && !bar.build) {
      seqBar(t, root, steps, energy >= 3 ? 1100 : 750, 0.55);
      if (energy >= 3) seqBar(t, root, steps, 1600, 0.22, 12);
      for (let k = 0; k * 4 < steps; k++) addMono(drums, t + k * BEAT_S, 0.5, kick(1));
      for (const k of [1, 3]) if (k * 4 < steps) addMono(drums, t + k * BEAT_S, 0.4, snare(0.55), 0.5, 0.5);
      for (let i = 0; i < steps; i++) if (i % 4 === 2) addMono(hats, t + i * S16, 0.06, hat(0.22), 0.4, 0.6);
      const clanks = energy >= 3 ? [3, 7, 11, 14] : [7, 14];
      clanks.forEach((i, k) => { if (i < steps) addMono(metals, t + i * S16, 0.6, metal(hz(tones[k % tones.length] + 12), k % 2 ? 1.41 : 2.76, 0.18), k % 2 ? 0.7 : 0.35, k % 2 ? 0.35 : 0.7); });
    }
    if (energy >= 3 && !bar.build) {
      // cold lead: two detuned saws, one long note per half bar
      [0, 2].forEach((k, j) => {
        const m = tones[(b + j) % tones.length] + 12;
        const lp = biquad();
        let p1 = rand(), p2 = rand();
        const dur = BAR_S / 2 - 0.02;
        addMono(lead, t + k * BEAT_S, dur, (x) => {
          p1 = (p1 + hz(m - 0.12) / SR) % 1; p2 = (p2 + hz(m + 0.12) / SR) % 1;
          return lp(SAW[(p1 * TABLE_SIZE) | 0] + SAW[(p2 * TABLE_SIZE) | 0], "lp", 1800) * Math.min(1, x / 0.08) * Math.min(1, (dur - x) / 0.05) * 0.08;
        }, 0.45, 0.55);
      });
    }
    // build
    if (bar.build) {
      seqBar(t, root, 14, (i) => 300 + 5000 * Math.pow(i / 14, 2), 0.55);
      const hits = [0, 2, 4, 6, 8, 9, 10, 11, 12, 12.5, 13, 13.5];
      hits.forEach((p, i) => addMono(drums, t + p * S16, 0.2, snare(0.25 + 0.55 * (i / hits.length), false), 0.5, 0.5));
      const hp = biquad();
      addMono(fx, t, BAR_S - BEAT_S / 2, (x) => { const k = x / (BAR_S - BEAT_S / 2); return hp(noise(), "hp", 800 + 8000 * k * k) * k * k * 0.5; });
      const g0 = Math.round((t + BAR_S - BEAT_S / 2) * SR), g1 = Math.round((t + BAR_S) * SR);
      for (let i = g0; i < g1 && i < N; i++) gate[i] = Math.max(0, 1 - (i - g0) / 200, 1 - (g1 - i) / 80);
    }
    // stop: cut on 3, one last metal hit ringing out
    if (bar.stop && energy >= 1) addMono(metals, t + 2 * BEAT_S, 1.5, metal(hz(tones[0]), 1.41, 0.35), 0.6, 0.6);
  });

  renderPad(pad, { chordAt, levelAt: (t) => (scenes[sceneAt(t)].energy === 0 ? 0.013 : 0.008), cutoffAt: () => 900, xfade: 0.1 });
  echo(keys, BEAT_S * 0.75 * 1000, 0.25);
  echo(metals, BEAT_S * 0.75 * 1000, 0.35);
  echo(lead, BEAT_S * 0.5 * 1000, 0.3);
  echo(drums, 30, 0.08);

  const out = buffer(len);
  mix(out, drums, 0.95);
  mix(out, hats, 0.6);
  mix(out, seq, 0.42);
  mix(out, lead, 1);
  mix(out, metals, 0.8);
  mix(out, keys, 1.1);
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
