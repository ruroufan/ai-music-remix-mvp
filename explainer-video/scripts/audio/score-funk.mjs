// "funk": a tight funk score (used by 《ENTP · 抬杠》 — the debate as a boxing
// match) — another set of sounds: a dry kit with ghost-note snares and 16th
// hats, a slap bass (thumb on the root, popped octaves, dead notes), a
// clavinet comping in 16ths, a brass section hitting off-beat stabs, a wah
// line — and under the quiet parts, a Rhodes.
//
// Per scene, `energy` decides what plays:
//   0  a Rhodes alone
//   1  + a kick and rim click, the clavinet comping softly
//   2  + the full kit with ghost snares and 16th hats, the slap bass
//   3  + brass stabs on the off-beats, a wah line, an open hat on the "and"
// Between scenes: the bar before a scene with more energy, a brass fall and a
// snare fill, half a beat of silence, the drop on a brass hit; the bar before
// a breakdown, everything stops dead on 3 on a final stab.
import { CHORD_NOTES, SAW, SR, TABLE_SIZE, addMono, biquad, buffer, echo, hz, mix, noise, normalize, rand } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

const kick = (vel = 1) => (t) => (Math.sin(2 * Math.PI * (60 * t + (90 / 35) * (1 - Math.exp(-35 * t)))) * Math.exp(-t * 11) + Math.sin(2 * Math.PI * 3500 * t) * Math.exp(-t * 600) * 0.3) * vel;
const snare = (vel = 1) => {
  const bp = biquad();
  return (t) => (Math.sin(2 * Math.PI * 220 * t) * Math.exp(-t * 28) * 0.6 + bp(noise(), "bp", 3000, 0.6) * Math.exp(-t * 22)) * vel;
};
const rim = (vel = 1) => (t) => (Math.sin(2 * Math.PI * 1700 * t) + Math.sin(2 * Math.PI * 820 * t) * 0.5) * Math.exp(-t * 90) * vel;
const hat = (vel = 1, open = false) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 9000) * Math.exp(-t * (open ? 14 : 80)) * vel;
};
// slap bass: thumb (bright, percussive) or pop (octave, snappy); dead = muted click
const slap = (m, dur, kind, vel = 1) => {
  const lp = biquad();
  let ph = rand();
  return (t) => {
    ph = (ph + hz(m) / SR) % 1;
    const tri = 1 - 4 * Math.abs(ph - 0.5);
    const saw = SAW[(ph * TABLE_SIZE) | 0];
    const bright = kind === "pop" ? 4500 : 2200;
    const body = lp(tri * 0.7 + saw * 0.5, "lp", 250 + bright * Math.exp(-t * (kind === "dead" ? 60 : 20)), 1.4);
    const env = kind === "dead" ? Math.exp(-t * 70) : Math.min(1, (dur - t) / 0.01) * Math.exp(-t * 3);
    return Math.tanh(body * 2) * Math.min(1, t / 0.001) * Math.max(0, env) * vel;
  };
};
// clavinet: a bright pulse wave, quick decay, slight wah
const clav = (f, vel = 1) => {
  const bp = biquad();
  let ph = rand();
  return (t) => { ph = (ph + f / SR) % 1; return bp((ph < 0.3 ? 1 : -1) * 0.8, "bp", 1200 + 1500 * Math.exp(-t * 25), 1.6) * Math.exp(-t * 14) * Math.min(1, t / 0.001) * vel; };
};
// rhodes: a soft FM-ish electric piano
const rhodes = (f, vel = 1) => (t) => Math.sin(2 * Math.PI * f * t + 1.4 * Math.exp(-t * 6) * Math.sin(2 * Math.PI * f * t)) * Math.exp(-t * 1.6) * Math.min(1, t / 0.004) * vel + Math.sin(2 * Math.PI * f * 2 * t) * 0.15 * Math.exp(-t * 4) * vel;

const GHOSTS = [3, 6, 9, 11, 15];
const BASS = [[0, "thumb", 0], [3, "dead", 0], [4, "pop", 12], [6, "thumb", 0], [7, "thumb", 10], [10, "pop", 12], [11, "dead", 0], [12, "thumb", 7], [14, "pop", 12]];
const CLAV = [1, 2, 5, 7, 9, 10, 13, 15];

export const scoreFunk = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const S16 = BEAT_S / 4;
  const len = songEnd + 3;
  const drums = buffer(len), hats = buffer(len), bass = buffer(len), keys = buffer(len), brass = buffer(len), wah = buffer(len), ep2 = buffer(len), pad = buffer(len), fx = buffer(len);
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
  // a brass section stab: several detuned saws, quick swell, short
  const stab = (t0, notes, dur, vel, fall = false) => {
    const lp = biquad();
    const vs = notes.flatMap((m) => [-0.08, 0.08].map((d) => ({ m: m + d, ph: rand() })));
    addMono(brass, t0, dur, (x) => {
      let s = 0;
      vs.forEach((v) => { const m = fall ? v.m - 5 * Math.max(0, (x - dur * 0.4) / (dur * 0.6)) ** 2 : v.m; v.ph = (v.ph + hz(m) / SR) % 1; s += SAW[(v.ph * TABLE_SIZE) | 0]; });
      return lp(s, "lp", 900 + 2600 * Math.min(1, x / 0.03) * Math.exp(-x * 3)) * Math.min(1, x / 0.012) * Math.min(1, (dur - x) / 0.03) * vel / vs.length;
    }, 0.48, 0.52);
  };

  bars.forEach((bar, b) => {
    const { t, energy, chord } = bar;
    const steps = bar.stop ? 9 : 16;
    const rootPc = CHORD_NOTES[chord][0] % 12;
    let root = rootPc + 28; if (root < 31) root += 12;
    const tones = [...new Set(CHORD_NOTES[chord].map((n) => n % 12))].map((p) => { let m = p; while (m < 60) m += 12; return m; }).sort((a, z) => a - z);

    if (bar.first && b > 0 && bars[b - 1].build) {
      stab(t, tones.map((m) => m + 12), 0.4, 1.2);
      addMono(fx, t, 1.2, (x) => Math.sin(2 * Math.PI * (40 * x + (60 / 9) * (1 - Math.exp(-9 * x)))) * Math.exp(-x * 3) * 0.8);
    }
    // Rhodes, energy 0: a voicing on 1, an answer on the "and" of 2
    if (energy === 0) {
      tones.forEach((m, i) => addMono(ep2, t, 3, rhodes(hz(m - 12 + (i === 2 ? 12 : 0)), 0.48), 0.45 + 0.1 * i, 0.65 - 0.1 * i));
      addMono(ep2, t + 2.5 * BEAT_S, 2, rhodes(hz(tones[1]), 0.42), 0.6, 0.45);
    }
    if (energy >= 1 && !bar.build) {
      CLAV.forEach((i, k) => { if (i < steps) tones.slice(0, 2).forEach((m, j) => addMono(keys, t + i * S16, 0.2, clav(hz(m), energy === 1 ? 0.34 : 0.26), j ? 0.35 : 0.65, j ? 0.65 : 0.35)); });
    }
    if (energy === 1 && !bar.build) {
      for (const i of [0, 7, 10]) if (i < steps) addMono(drums, t + i * S16, 0.4, kick(0.9));
      for (const i of [4, 12]) if (i < steps) addMono(drums, t + i * S16, 0.1, rim(0.35), 0.45, 0.55);
      for (let i = 0; i < steps; i += 2) addMono(hats, t + i * S16, 0.05, hat(0.1), 0.6, 0.4);
    }
    if (energy >= 2 && !bar.build) {
      for (const i of [0, 7, 10]) if (i < steps) addMono(drums, t + i * S16, 0.4, kick(1));
      for (const i of [4, 12]) if (i < steps) addMono(drums, t + i * S16, 0.35, snare(0.9));
      for (const i of GHOSTS) if (i < steps) addMono(drums, t + i * S16, 0.2, snare(0.16));
      for (let i = 0; i < steps; i++) addMono(hats, t + i * S16, 0.05, hat(i % 4 === 2 ? 0.22 : 0.1), 0.6, 0.4);
      if (energy >= 3 && 14 < steps) addMono(hats, t + 14 * S16, 0.3, hat(0.18, true), 0.6, 0.4);
      BASS.forEach(([i, kind, off]) => { if (i < steps) addMono(bass, t + i * S16, S16 * 1.6, slap(root + off, S16 * 1.6, kind, kind === "pop" ? 0.45 : 0.6)); });
    }
    if (energy >= 3 && !bar.build) {
      for (const i of [2, 6, 14]) if (i < steps) stab(t + i * S16, tones, 0.14, 0.9);
      // wah: a filtered saw riff
      let ph = rand();
      const bp = biquad();
      [[0, 0], [1.5, 2], [2.5, 1], [3.5, 0]].forEach(([at, k]) => {
        if (at * 4 >= steps) return;
        const m = tones[k], dur = BEAT_S * 0.45;
        addMono(wah, t + at * BEAT_S, dur, (x) => { ph = (ph + hz(m) / SR) % 1; return bp(SAW[(ph * TABLE_SIZE) | 0], "bp", 500 + 2200 * (0.5 - 0.5 * Math.cos(2 * Math.PI * x / dur)), 3) * Math.min(1, (dur - x) / 0.02) * 0.35; }, 0.35, 0.65);
      });
    }
    // build: a snare fill, a brass fall, a gap
    if (bar.build) {
      [8, 10, 11, 12, 13, 14, 14.5].forEach((p, i) => addMono(drums, t + p * S16, 0.2, snare(0.3 + i * 0.08), 0.5, 0.5));
      stab(t, tones.map((m) => m + 12), BEAT_S * 2, 0.9, true);
      const g0 = Math.round((t + BAR_S - BEAT_S / 2) * SR), g1 = Math.round((t + BAR_S) * SR);
      for (let i = g0; i < g1 && i < N; i++) gate[i] = Math.max(0, 1 - (i - g0) / 200, 1 - (g1 - i) / 80);
    }
    if (bar.stop && energy >= 1) stab(t + 2 * BEAT_S, tones, 0.5, 1);
  });

  renderPad(pad, { chordAt, levelAt: (t) => (scenes[sceneAt(t)].energy === 0 ? 0.012 : 0.006), cutoffAt: () => 900, xfade: 0.1 });
  echo(ep2, BEAT_S * 0.75 * 1000, 0.3);
  echo(brass, BEAT_S * 0.5 * 1000, 0.18);
  echo(wah, BEAT_S * 0.75 * 1000, 0.25);

  const out = buffer(len);
  mix(out, drums, 0.95);
  mix(out, hats, 0.6);
  mix(out, bass, 0.75);
  mix(out, keys, 1);
  mix(out, brass, 1.1);
  mix(out, wah, 0.8);
  mix(out, ep2, 1.2);
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
