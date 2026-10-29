// "chiptune": an 8-bit score (used by 《ENFP · 新鲜感》 — a runner sowing a
// field and never staying) — another set of sounds: pulse waves with a
// changing duty cycle, fast arpeggios hopping across the chord, a triangle
// bass, noise-channel drums — and a square lead with vibrato.
//
// Per scene, `energy` decides what plays:
//   0  a slow pulse arpeggio with an echo, alone
//   1  + the triangle bass, noise hats
//   2  + noise kick and snare, the arpeggio in 16ths
//   3  + the square lead (with vibrato and duty sweeps), an octave-jump bass
// Between scenes: the bar before a scene with more energy, a rising pitch
// sweep and a snare roll; the bar before a breakdown, a falling "power-down"
// blip and silence.
import { CHORD_NOTES, SR, addMono, biquad, buffer, echo, hz, mix, noise, normalize, rand } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

const pulse = (f, dur, vel = 1, duty = 0.25, vib = 0, sweep = 0) => {
  let ph = rand();
  return (t) => {
    const fv = f * (1 + vib * Math.sin(2 * Math.PI * 6 * t) * Math.min(1, t / 0.15)) * Math.pow(2, (sweep * t) / 12);
    ph = (ph + fv / SR) % 1;
    const d = duty + 0.15 * Math.sin(2 * Math.PI * 0.7 * t) * (vib > 0 ? 1 : 0);
    return (ph < d ? 1 : -1) * 0.5 * Math.min(1, (dur - t) / 0.006) * Math.min(1, t / 0.002) * vel;
  };
};
const tri = (f, dur, vel = 1) => {
  let ph = rand();
  return (t) => { ph = (ph + f / SR) % 1; const q = Math.round((1 - 4 * Math.abs(ph - 0.5)) * 7) / 7; return q * Math.min(1, (dur - t) / 0.006) * vel; };
};
// the NES-ish noise channel: stepped noise, held per "period"
const nz = (period, decay, vel = 1) => {
  let hold = 0, n = 0;
  return (t) => { if (n++ % period === 0) hold = noise(); return hold * Math.exp(-t * decay) * vel; };
};
const kick = (vel = 1) => (t) => (Math.sin(2 * Math.PI * (60 * t + (160 / 40) * (1 - Math.exp(-40 * t)))) > 0 ? 1 : -1) * Math.exp(-t * 18) * 0.5 * vel;

const ARP = [0, 1, 2, 1];
const LEAD = [[0, 2, 1], [1, 1, 0.5], [1.5, 0, 0.5], [2, 1, 1], [3, 2, 0.5], [3.5, 3, 0.5]];

export const scoreChiptune = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const S16 = BEAT_S / 4;
  const len = songEnd + 3;
  const arp = buffer(len), bass = buffer(len), drums = buffer(len), lead = buffer(len), pad = buffer(len), fx = buffer(len);
  const nBars = Math.round(songEnd / BAR_S);
  const bars = Array.from({ length: nBars }, (_, b) => {
    const t = b * BAR_S;
    const k = sceneAt(t + 1e-4);
    const s = scenes[k], next = scenes[k + 1];
    const last = t + BAR_S >= s.end - 1e-4;
    return { t, chord: chordAt(t + 1e-4), energy: s.energy, first: Math.abs(t - s.start) < 1e-4, build: last && next && next.energy > s.energy && next.energy >= 2, stop: last && next && next.energy === 0 && s.energy > 0 };
  });
  void biquad;

  bars.forEach((bar) => {
    const { t, energy, chord } = bar;
    const steps = bar.stop ? 8 : 16;
    const rootPc = CHORD_NOTES[chord][0] % 12;
    let root = rootPc + 36; if (root < 40) root += 12;
    const tones = [...new Set(CHORD_NOTES[chord].map((n) => n % 12))].map((p) => { let m = p; while (m < 64) m += 12; return m; }).sort((a, z) => a - z);
    const t4 = [...tones, tones[0] + 12];

    if (!bar.build) {
      if (energy === 0) {
        for (let i = 0; i < 8; i++) addMono(arp, t + i * 2 * S16, S16 * 1.8, pulse(hz(t4[ARP[i % 4]]), S16 * 1.8, 0.32, 0.125), 0.5, 0.5);
      } else {
        const step = energy >= 2 ? 1 : 2;
        for (let i = 0; i < steps; i += step) addMono(arp, t + i * S16, S16 * step * 0.9, pulse(hz(t4[(i / step) % 4 === 3 ? 3 : (i / step) % 3]), S16 * step * 0.9, energy >= 2 ? 0.2 : 0.26, 0.25), i % 2 ? 0.35 : 0.65, i % 2 ? 0.65 : 0.35);
      }
    }
    if (energy >= 1 && !bar.build) {
      for (let i = 0; i < steps; i += 2) addMono(bass, t + i * S16, S16 * 1.8, tri(hz(root + (energy >= 3 && i % 4 === 2 ? 12 : 0)), S16 * 1.8, 0.7));
      for (let i = 0; i < steps; i += 2) addMono(drums, t + i * S16 + S16, 0.04, nz(1, 120, 0.12), 0.6, 0.4);
    }
    if (energy >= 2 && !bar.build) {
      for (const i of [0, 6, 8]) if (i < steps) addMono(drums, t + i * S16, 0.25, kick(1));
      for (const i of [4, 12]) if (i < steps) addMono(drums, t + i * S16, 0.18, nz(6, 22, 0.5));
    }
    if (energy >= 3 && !bar.build) {
      LEAD.forEach(([at, k, d]) => { if (at * 4 < steps) addMono(lead, t + at * BEAT_S, d * BEAT_S * 0.95, pulse(hz(t4[k] + 12), d * BEAT_S * 0.95, 0.22, 0.5, 0.012), 0.5, 0.5); });
    }
    if (bar.build) {
      addMono(fx, t, BAR_S, pulse(hz(root + 12), BAR_S, 0.2, 0.25, 0, 24 / (BAR_S)), 0.5, 0.5);
      for (let i = 0; i < 16; i++) addMono(drums, t + i * S16, 0.08, nz(6, 30, 0.15 + i * 0.025), 0.5, 0.5);
    }
    if (bar.stop && energy >= 1) addMono(fx, t + 2 * BEAT_S, 0.6, pulse(hz(tones[2]), 0.6, 0.25, 0.25, 0, -30), 0.5, 0.5);
  });

  renderPad(pad, { chordAt, levelAt: (t) => (scenes[sceneAt(t)].energy === 0 ? 0.008 : 0.004), cutoffAt: () => 1200, xfade: 0.15 });
  echo(arp, BEAT_S * 0.75 * 1000, 0.3);
  echo(lead, BEAT_S * 0.5 * 1000, 0.25);

  const out = buffer(len);
  mix(out, arp, 1);
  mix(out, bass, 0.8);
  mix(out, drums, 0.9);
  mix(out, lead, 0.9);
  mix(out, pad, 1);
  mix(out, fx, 0.6);
  for (let i = 0; i < out[0].length; i++) {
    out[0][i] = Math.tanh(out[0][i] * 1.05);
    out[1][i] = Math.tanh(out[1][i] * 1.05);
  }
  fadeTail(out, songEnd);
  normalize(out, -1);
  return out;
};
