// "minimalism": a minimalist score in the Reich / Glass manner (used by
// 《ISTJ · 有用》 — a man ticking off an endless checklist under a great old
// tree) — another set of sounds: interlocking marimba ostinatos, a soft
// vibraphone with motor tremolo, a pulsing piano in steady 8ths, a bass
// clarinet holding the roots — and, at the top, a second marimba phasing
// against the first and an organ swell.
//
// Per scene, `energy` decides what plays:
//   0  the vibraphone alone, tremolo chords
//   1  + the marimba ostinato in 8ths
//   2  + the pulsing piano, the bass clarinet, a soft kick on 1
//   3  + a second marimba in 16ths a step out of phase, an organ swell
// Between scenes: the bar before a scene with more energy, the ostinato
// doubles to 16ths and climbs an octave; the bar before a breakdown, the
// pattern drops out note by note.
import { CHORD_NOTES, addMono, biquad, buffer, echo, hz, mix, normalize, rand } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

const marimba = (f, vel = 1) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 4 * t) * Math.exp(-t * 30) + 0.15 * Math.sin(2 * Math.PI * f * 9.9 * t) * Math.exp(-t * 60)) * Math.exp(-t * 7) * Math.min(1, t / 0.0015) * vel;
const vibes = (f, dur, vel = 1) => {
  const ph = rand() * 6;
  return (t) => (Math.sin(2 * Math.PI * f * t) + 0.2 * Math.sin(2 * Math.PI * f * 4 * t) * Math.exp(-t * 3)) * (0.75 + 0.25 * Math.sin(2 * Math.PI * 5.5 * t + ph)) * Math.exp(-t * 0.9) * Math.min(1, t / 0.004) * Math.min(1, (dur - t) / 0.08) * vel;
};
const piano = (f, vel = 1) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.45 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t * 5) + 0.2 * Math.sin(6 * Math.PI * f * t) * Math.exp(-t * 9)) * Math.exp(-t * 3.5) * Math.min(1, t / 0.002) * vel;
const clarinet = (f, dur, vel = 1) => {
  const lp = biquad();
  return (t) => lp(Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(6 * Math.PI * f * t) + 0.2 * Math.sin(10 * Math.PI * f * t), "lp", 1200) * Math.min(1, t / 0.08) * Math.min(1, (dur - t) / 0.1) * vel;
};
const organ = (f, dur, vel = 1) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(4 * Math.PI * f * t) + 0.25 * Math.sin(8 * Math.PI * f * t)) * Math.sin(Math.PI * Math.min(1, t / dur)) * vel * 0.3;
const kick = (vel = 1) => (t) => Math.sin(2 * Math.PI * (50 * t + (40 / 20) * (1 - Math.exp(-20 * t)))) * Math.exp(-t * 10) * vel;

const OST = [0, 2, 1, 3, 2, 0, 1, 2];           // 8ths over a four-note voicing
const OST2 = [0, 1, 2, 3, 1, 2, 3, 0, 2, 3, 0, 1, 3, 0, 1, 2]; // 16ths, one step ahead

export const scoreMinimalism = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const S8 = BEAT_S / 2, S16 = BEAT_S / 4;
  const len = songEnd + 3;
  const mar = buffer(len), mar2 = buffer(len), vib = buffer(len), pno = buffer(len), cl = buffer(len), org = buffer(len), drums = buffer(len), pad = buffer(len);
  const nBars = Math.round(songEnd / BAR_S);
  const bars = Array.from({ length: nBars }, (_, b) => {
    const t = b * BAR_S;
    const k = sceneAt(t + 1e-4);
    const s = scenes[k], next = scenes[k + 1];
    const last = t + BAR_S >= s.end - 1e-4;
    return { t, chord: chordAt(t + 1e-4), energy: s.energy, build: last && next && next.energy > s.energy && next.energy >= 2, stop: last && next && next.energy === 0 && s.energy > 0 };
  });

  bars.forEach((bar) => {
    const { t, energy, chord } = bar;
    const rootPc = CHORD_NOTES[chord][0] % 12;
    let root = rootPc + 36; if (root < 40) root += 12;
    const tones = [...new Set(CHORD_NOTES[chord].map((n) => n % 12))].map((p) => { let m = p; while (m < 64) m += 12; return m; }).sort((a, z) => a - z);
    const v4 = [...tones, tones[0] + 12];

    // vibes: always, a held voicing
    tones.forEach((m, j) => addMono(vib, t, BAR_S, vibes(hz(m), BAR_S, energy === 0 ? 0.45 : 0.25), 0.4 + 0.1 * j, 0.6 - 0.1 * j));
    if (energy >= 1) {
      const n = bar.stop ? 5 : 8;
      if (bar.build) {
        for (let i = 0; i < 16; i++) addMono(mar, t + i * S16, 0.5, marimba(hz(v4[OST[i % 8]] + (i >= 8 ? 12 : 0)), 0.32), i % 2 ? 0.35 : 0.65, i % 2 ? 0.65 : 0.35);
      } else {
        for (let i = 0; i < n; i++) addMono(mar, t + i * S8, 0.6, marimba(hz(v4[OST[i]]), 0.38), i % 2 ? 0.35 : 0.65, i % 2 ? 0.65 : 0.35);
      }
    }
    if (energy >= 2 && !bar.build) {
      const n = bar.stop ? 4 : 8;
      for (let i = 0; i < n; i++) tones.slice(0, 2).forEach((m) => addMono(pno, t + i * S8, 0.4, piano(hz(m - 12), 0.22), 0.5, 0.5));
      addMono(cl, t, BAR_S, clarinet(hz(root), BAR_S, 0.4));
      addMono(drums, t, 0.5, kick(0.6));
      if (!bar.stop) addMono(drums, t + 2 * BEAT_S, 0.5, kick(0.4));
    }
    if (energy >= 3 && !bar.build && !bar.stop) {
      OST2.forEach((k, i) => addMono(mar2, t + i * S16, 0.4, marimba(hz(v4[k] + 12), 0.2), 0.25, 0.75));
      tones.forEach((m) => addMono(org, t, BAR_S, organ(hz(m - 12), BAR_S, 0.5)));
    }
  });

  renderPad(pad, { chordAt, levelAt: (t) => (scenes[sceneAt(t)].energy === 0 ? 0.006 : 0.004), cutoffAt: () => 900, xfade: 0.2 });
  echo(mar, BEAT_S * 0.75 * 1000, 0.2);
  echo(vib, BEAT_S * 1000, 0.25);

  const out = buffer(len);
  mix(out, mar, 1.1);
  mix(out, mar2, 0.9);
  mix(out, vib, 0.9);
  mix(out, pno, 0.8);
  mix(out, cl, 0.7);
  mix(out, org, 0.5);
  mix(out, drums, 0.7);
  mix(out, pad, 1);
  for (let i = 0; i < out[0].length; i++) {
    out[0][i] = Math.tanh(out[0][i] * 1.1);
    out[1][i] = Math.tanh(out[1][i] * 1.1);
  }
  fadeTail(out, songEnd);
  normalize(out, -1);
  return out;
};
