// "phonk": a dark, driving drift-phonk score (used by 《玻璃心》) — another set
// of sounds: a pitched 808 cowbell riff, a distorted 808 that slides between
// notes, a hard kick and a snare-clap on 2 and 4, hats with triplet rolls, a
// Memphis-style "ha" chop — and, under the quiet parts, a glass harmonica and
// glass chimes (the glass heart).
//
// Per scene, `energy` decides what plays:
//   0  the glass harmonica alone
//   1  + glass chimes, a soft kick, hats, the 808 held long and low
//   2  + the hard beat, the distorted 808 sliding, the cowbell riff
//   3  + hat rolls, the "ha" chops, the cowbell doubled an octave up
// Between scenes: the bar before a scene with more energy, a snare roll and
// an 808 that slides up, then half a beat of silence and the next scene lands
// on an impact with breaking glass; the beat before a breakdown, the 808 dives
// and everything cuts to a single glass chime.
import { CHORD_NOTES, SR, addMono, biquad, buffer, echo, hz, mix, noise, normalize } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

const kick = (vel = 1) => (t) => Math.tanh((Math.sin(2 * Math.PI * (46 * t + (130 / 28) * (1 - Math.exp(-28 * t)))) * Math.exp(-t * 7) * 1.4 + Math.sin(2 * Math.PI * 2600 * t) * Math.exp(-t * 500) * 0.4) * 1.5) * vel;
const snare = (vel = 1) => {
  const bp = biquad(), bp2 = biquad();
  return (t) => (Math.sin(2 * Math.PI * 200 * t) * Math.exp(-t * 25) * 0.5 + bp(noise(), "bp", 2400, 0.6) * Math.exp(-t * 14) * 0.8 + bp2(noise(), "bp", 1200, 1.2) * ([0, 0.01, 0.02].reduce((a, o) => a + (t >= o ? Math.exp(-(t - o) * 150) : 0), 0)) * 0.5) * vel;
};
const hat = (vel = 1, open = false) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 9000) * Math.exp(-t * (open ? 10 : 80)) * vel;
};
// 808 cowbell, pitched: two squares a fifth-and-a-bit apart through a band-pass
const cowbell = (f, vel = 1) => {
  const bp = biquad();
  let p1 = 0, p2 = 0;
  return (t) => {
    p1 = (p1 + f / SR) % 1; p2 = (p2 + (f * 1.48) / SR) % 1;
    const x = (p1 < 0.5 ? 1 : -1) + (p2 < 0.5 ? 1 : -1);
    return bp(x, "bp", f * 1.6, 1.4) * (Math.exp(-t * 18) * 0.6 + Math.exp(-t * 5) * 0.4) * vel;
  };
};
// "ha": a short breathy formant burst
const ha = (vel = 1) => {
  const b1 = biquad(), b2 = biquad();
  let ph = 0;
  return (t) => {
    ph = (ph + 180 / SR) % 1;
    const raw = (2 * ph - 1) * 0.6 + noise() * 0.5;
    return (b1(raw, "bp", 850, 4) + b2(raw, "bp", 1300, 5) * 0.7) * Math.min(1, t / 0.01) * Math.exp(-t * 12) * vel;
  };
};
// glass harmonica: two sines a hair apart (the beating), a slow swell, a long ring
const harmonica = (f, dur, vel = 1) => (t) => (Math.sin(2 * Math.PI * f * t) + Math.sin(2 * Math.PI * (f + 0.8) * t) * 0.8 + Math.sin(2 * Math.PI * 2 * f * t) * 0.15) * Math.min(1, t / 0.18) * (t > dur ? Math.exp(-(t - dur) * 3) : 1) * vel;
// a glass chime: inharmonic partials, bright and quick
const chime = (f, vel = 1) => (t) => [1, 2.76, 5.4, 8.93].reduce((a, r, i) => a + Math.sin(2 * Math.PI * f * r * t) * Math.exp(-t * (3 + i * 4)) / (i + 1), 0) * Math.min(1, t / 0.002) * vel;

const pcs = (chord) => [...new Set(CHORD_NOTES[chord].map((n) => n % 12))];
const tonesFrom = (chord, lo) => pcs(chord).map((p) => { let m = p; while (m < lo) m += 12; return m; }).sort((a, z) => a - z);
const RIFF = [[0, 0], [3, 2], [6, 1], [8, 0], [10, 2], [11, 1], [14, 0]]; // 16th, chord tone

export const scorePhonk = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const S16 = BEAT_S / 4;
  const len = songEnd + 3;
  const drums = buffer(len), hats = buffer(len), bass = buffer(len), bells = buffer(len), glass = buffer(len), vox = buffer(len), pad = buffer(len), fx = buffer(len);
  const nBars = Math.round(songEnd / BAR_S);
  const N = Math.ceil(len * SR);
  const duck = new Float32Array(N).fill(1);
  const gate = new Float32Array(N).fill(1);
  const bars = Array.from({ length: nBars }, (_, b) => {
    const t = b * BAR_S;
    const k = sceneAt(t + 1e-4);
    const s = scenes[k], next = scenes[k + 1];
    const last = t + BAR_S >= s.end - 1e-4;
    return { t, chord: chordAt(t + 1e-4), next: chordAt(t + BAR_S + 1e-4), energy: s.energy, first: Math.abs(t - s.start) < 1e-4, build: last && next && next.energy > s.energy && next.energy >= 2, stop: last && next && next.energy === 0 && s.energy > 0 };
  });
  // the 808: a held, distorted sine that slides from note to note
  const slide808 = (t0, dur, from, to, vel, drive) => {
    let ph = 0;
    addMono(bass, t0, dur + 0.05, (x) => {
      const k = Math.min(1, Math.max(0, (x - dur * 0.6) / (dur * 0.35)));
      const m = from + (to - from) * k * k;
      ph = (ph + hz(m) / SR) % 1;
      return Math.tanh(Math.sin(2 * Math.PI * ph) * drive) * Math.min(1, x / 0.004) * Math.min(1, Math.max(0, (dur - x) / 0.04 + 1)) * Math.exp(-x * 0.6) * vel;
    });
  };
  const sidechain = (t0, depth) => {
    const s0 = Math.round(t0 * SR);
    for (let j = 0; j < 0.3 * SR && s0 + j < N; j++) duck[s0 + j] = Math.min(duck[s0 + j], 1 - depth * Math.exp(-(j / SR) / 0.08));
  };

  bars.forEach((bar, b) => {
    const { t, energy, chord } = bar;
    const beats = bar.stop ? 3 : 4;
    const root = CHORD_NOTES[chord][0] % 12;
    let r808 = root + 24; if (r808 < 28) r808 += 12;
    let n808 = (CHORD_NOTES[bar.next][0] % 12) + 24; if (n808 < 28) n808 += 12;

    // impact after a build: a boom and breaking glass
    if (bar.first && b > 0 && bars[b - 1].build) {
      addMono(fx, t, 1.6, (x) => Math.sin(2 * Math.PI * (32 * x + (70 / 9) * (1 - Math.exp(-9 * x)))) * Math.exp(-x * 2.2) * 0.9);
      const hp = biquad();
      addMono(fx, t, 1.2, (x) => hp(noise(), "hp", 4500) * (Math.exp(-x * 5) + 0.3 * Math.exp(-x * 1.5) * (Math.sin(x * 900) > 0.6 ? 1 : 0.2)) * 0.5, 0.9, 1);
      for (let k = 0; k < 7; k++) addMono(glass, t + 0.02 + k * 0.045, 0.6, chime(hz(84 + ((k * 5) % 12)), 0.25), k % 2 ? 0.8 : 0.4, k % 2 ? 0.4 : 0.8);
    }

    // glass harmonica (energy 0) / chimes (energy 1)
    if (energy === 0) {
      const tn = tonesFrom(chord, 64);
      tn.forEach((m, i) => addMono(glass, t + i * 0.18, BAR_S * 0.95, harmonica(hz(m), BAR_S * 0.8, 0.12), i % 2 ? 0.7 : 0.5, i % 2 ? 0.5 : 0.7));
      addMono(glass, t + 2.5 * BEAT_S, 0.8, chime(hz(tn[tn.length - 1] + 12), 0.12), 0.5, 0.7);
    }
    if (energy === 1 && !bar.build) {
      const tn = tonesFrom(chord, 76);
      [0, 3, 6, 10].forEach((i, k) => addMono(glass, t + i * S16, 0.8, chime(hz(tn[k % tn.length]), 0.18), k % 2 ? 0.75 : 0.45, k % 2 ? 0.45 : 0.75));
      for (const i of [0, 8]) if (i < beats * 4) { addMono(drums, t + i * S16, 0.5, kick(0.7)); sidechain(t + i * S16, 0.4); }
      for (let i = 2; i < beats * 4; i += 4) addMono(hats, t + i * S16, 0.06, hat(0.2), 0.45, 0.55);
      slide808(t, beats * BEAT_S * 0.95, r808, bar.stop ? r808 - 12 : r808, 0.55, 1.6);
    }

    // the hard beat, the 808, the cowbell
    if (energy >= 2 && !bar.build) {
      const kicks = b % 2 ? [0, 3, 8, 10] : [0, 6, 8];
      for (const i of kicks) if (i < beats * 4) { addMono(drums, t + i * S16, 0.5, kick(i === 0 || i === 8 ? 1 : 0.8)); sidechain(t + i * S16, 0.5); }
      for (const k of [1, 3]) if (k < beats) addMono(drums, t + k * BEAT_S, 0.5, snare(0.85), 0.48, 0.52);
      for (let i = 0; i < beats * 4; i += 2) addMono(hats, t + i * S16, 0.06, hat(i % 4 === 2 ? 0.3 : 0.18), 0.4, 0.6);
      if (energy >= 3) {
        // a triplet roll into beats 2 and 4
        for (const k of [1, 3]) if (k < beats) for (let j = 0; j < 6; j++) addMono(hats, t + (k - 0.5) * BEAT_S + (j * BEAT_S) / 12, 0.04, hat(0.1 + j * 0.03), 0.6, 0.4);
        for (const i of [6, 14]) if (i < beats * 4) addMono(vox, t + i * S16, 0.2, ha(0.5), 0.55, 0.45);
      }
      // the 808: the bar's root, sliding into the next bar's
      slide808(t, beats * BEAT_S * 0.96, r808, bar.stop ? r808 - 12 : n808, 0.9, 3.5);
      // the cowbell riff
      const tn = tonesFrom(chord, 72);
      for (const [i, k] of RIFF) {
        if (i >= beats * 4) continue;
        addMono(bells, t + i * S16, 0.3, cowbell(hz(tn[k % tn.length]), i === 0 ? 0.5 : 0.38), 0.55, 0.45);
        if (energy >= 3) addMono(bells, t + i * S16, 0.3, cowbell(hz(tn[k % tn.length] + 12), 0.22), 0.4, 0.6);
      }
    }

    // build: snare roll speeding up, the 808 sliding up, then a gap
    if (bar.build) {
      const hits = [0, 2, 4, 6, 8, 9, 10, 11, 12, 12.5, 13, 13.5];
      hits.forEach((p, i) => addMono(drums, t + p * S16, 0.2, snare(0.25 + 0.6 * (i / hits.length)), 0.5, 0.5));
      slide808(t, BAR_S - BEAT_S / 2, r808, r808 + 12, 0.7, 3);
      const hp = biquad();
      addMono(fx, t, BAR_S - BEAT_S / 2, (x) => { const k = x / (BAR_S - BEAT_S / 2); return hp(noise(), "hp", 800 + 8000 * k * k) * k * k * 0.7; });
      const g0 = Math.round((t + BAR_S - BEAT_S / 2) * SR), g1 = Math.round((t + BAR_S) * SR);
      for (let i = g0; i < g1 && i < N; i++) gate[i] = Math.max(0, 1 - (i - g0) / 200, 1 - (g1 - i) / 80);
    }

    // stop: a single glass chime on the last beat, over silence
    if (bar.stop) addMono(glass, t + 3 * BEAT_S, 1.5, chime(hz(tonesFrom(chord, 84)[0]), 0.3), 0.5, 0.6);
  });

  renderPad(pad, { chordAt, levelAt: (t) => (scenes[sceneAt(t)].energy === 0 ? 0.008 : 0.012), cutoffAt: () => 800, xfade: 0.1 });

  for (let i = 0; i < N && i < pad[0].length; i++) {
    pad[0][i] *= duck[i]; pad[1][i] *= duck[i];
    const d = 1 - (1 - duck[i]) * 0.6;
    bass[0][i] *= d; bass[1][i] *= d;
  }
  echo(bells, BEAT_S * 0.75 * 1000, 0.25);
  echo(glass, BEAT_S * 0.5 * 1000, 0.35);
  echo(vox, BEAT_S * 0.5 * 1000, 0.3);
  echo(drums, 35, 0.1);

  const out = buffer(len);
  mix(out, drums, 1.0);
  mix(out, hats, 0.6);
  mix(out, bass, 0.3);
  mix(out, bells, 0.5);
  mix(out, glass, 0.9);
  mix(out, vox, 0.35);
  mix(out, pad, 1);
  mix(out, fx, 0.45);
  for (let i = 0; i < out[0].length; i++) {
    const g = i < N ? gate[i] : 1;
    out[0][i] = Math.tanh(out[0][i] * 1.2) * g;
    out[1][i] = Math.tanh(out[1][i] * 1.2) * g;
  }

  fadeTail(out, songEnd);
  normalize(out, -1);
  return out;
};
