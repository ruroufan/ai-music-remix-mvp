// "breakbeat": a driving big-beat / breakbeat score (used by 《倦怠》 — the
// treadmill that keeps speeding up) — another set of sounds: a chopped
// breakbeat with ghost notes, a growling reese bass (two detuned saws through
// a moving filter), saw stabs, a rising siren line at the peaks — and under
// the quiet parts, a harp.
//
// Per scene, `energy` decides what plays:
//   0  the harp alone, rippling up the chord
//   1  + a sub pulse on the beat and a light break
//   2  + the full break with ghost snares, the reese bass
//   3  + stabs on the off-beats, a siren rising over the bar, the break busier
// Between scenes: the bar before a scene with more energy, a snare roll and a
// reese that slides up, half a beat of silence, the drop; the bar before a
// breakdown, the reese sinks an octave and the beat stops on 3.
import { CHORD_NOTES, SAW, SR, TABLE_SIZE, addMono, biquad, buffer, echo, hz, mix, noise, normalize, rand } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

const kick = (vel = 1) => (t) => (Math.sin(2 * Math.PI * (52 * t + (120 / 28) * (1 - Math.exp(-28 * t)))) * Math.exp(-t * 9) + Math.sin(2 * Math.PI * 2400 * t) * Math.exp(-t * 350) * 0.3) * vel;
const snare = (vel = 1) => {
  const bp = biquad(), hp = biquad();
  return (t) => (Math.sin(2 * Math.PI * 190 * t) * Math.exp(-t * 20) * 0.7 + bp(noise(), "bp", 2000, 0.5) * Math.exp(-t * 15) * 0.9 + hp(noise(), "hp", 7000) * Math.exp(-t * 35) * 0.3) * vel;
};
const hat = (vel = 1, open = false) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 8500) * Math.exp(-t * (open ? 10 : 60)) * vel;
};
const pluck = (out, t0, midi, vel = 1, pan = 0.5) => {
  const f = hz(midi), n = Math.max(2, Math.round(SR / f));
  const buf = new Float32Array(n);
  for (let i = 0; i < n; i++) buf[i] = rand() * 2 - 1;
  const s0 = Math.round(t0 * SR), len = Math.round(3 * SR);
  let idx = 0;
  for (let i = 0; i < len && s0 + i < out[0].length; i++) {
    if (s0 + i < 0) continue;
    const y = buf[idx], nx = buf[(idx + 1) % n];
    buf[idx] = (y * 0.62 + nx * 0.38) * 0.9975;
    idx = (idx + 1) % n;
    out[0][s0 + i] += y * vel * (1 - pan);
    out[1][s0 + i] += y * vel * pan;
  }
};

// break patterns in 16ths
const BREAK2 = { kick: [0, 10], snare: [4, 12], ghost: [7, 9, 15] };
const BREAK3 = { kick: [0, 2, 10, 11], snare: [4, 12], ghost: [6, 7, 9, 14, 15] };

export const scoreBreakbeat = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const S16 = BEAT_S / 4;
  const len = songEnd + 3;
  const drums = buffer(len), hats = buffer(len), reese = buffer(len), stabs = buffer(len), lead = buffer(len), harp = buffer(len), pad = buffer(len), fx = buffer(len);
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
  // the reese: two detuned saws, filter breathing, a little drive; `from`→`to` glide
  const reeseNote = (t0, dur, from, to, vel) => {
    const lp = [biquad(), biquad()];
    let p1 = rand(), p2 = rand();
    addMono(reese, t0, dur + 0.05, (x) => {
      const m = from + (to - from) * Math.min(1, x / dur);
      p1 = (p1 + hz(m - 0.15) / SR) % 1; p2 = (p2 + hz(m + 0.15) / SR) % 1;
      const raw = SAW[(p1 * TABLE_SIZE) | 0] + SAW[(p2 * TABLE_SIZE) | 0];
      const c = 380 + 320 * (0.5 + 0.5 * Math.sin(2 * Math.PI * 1.5 * (t0 + x)));
      return Math.tanh(lp[1](lp[0](raw, "lp", c, 2), "lp", c, 0.7) * 1.6) * Math.min(1, x / 0.01) * Math.min(1, Math.max(0, (dur - x) / 0.03 + 1)) * vel;
    });
  };

  bars.forEach((bar, b) => {
    const { t, energy, chord } = bar;
    const steps = bar.stop ? 12 : 16;
    const root = CHORD_NOTES[chord][0] % 12;
    let r = root + 24; if (r < 28) r += 12;
    const tones = [...new Set(CHORD_NOTES[chord].map((n) => n % 12))].map((p) => { let m = p; while (m < 60) m += 12; return m; }).sort((a, z) => a - z);

    if (bar.first && b > 0 && bars[b - 1].build) {
      addMono(fx, t, 1.6, (x) => Math.sin(2 * Math.PI * (34 * x + (70 / 9) * (1 - Math.exp(-9 * x)))) * Math.exp(-x * 2.4) * 0.9);
      const hp = biquad();
      addMono(fx, t, 1.8, (x) => hp(noise(), "hp", 5000) * Math.exp(-x * 2.2) * 0.35, 0.8, 1);
    }

    // harp: energy 0 a ripple up and back each bar
    if (energy === 0) {
      const seq = [...tones.map((m) => m - 12), ...tones, ...tones.map((m) => m + 12)];
      seq.forEach((m, i) => pluck(harp, t + i * (BAR_S / seq.length), m, 0.5 - i * 0.02, 0.3 + 0.05 * i));
    }
    if (energy === 1 && !bar.build) tones.forEach((m, i) => pluck(harp, t + i * S16, m + 12, 0.38, 0.4 + 0.1 * i));

    // drums
    if (energy === 1 && !bar.build) {
      for (const i of [0, 10]) if (i < steps) addMono(drums, t + i * S16, 0.5, kick(0.95));
      for (const i of [4, 12]) if (i < steps) addMono(drums, t + i * S16, 0.4, snare(0.4));
      for (let i = 2; i < steps; i += 4) addMono(hats, t + i * S16, 0.06, hat(0.18), 0.45, 0.55);
      for (let k = 0; k * 4 < steps; k++) addMono(reese, t + k * BEAT_S, BEAT_S * 0.5, (x) => Math.sin(2 * Math.PI * hz(r) * x) * Math.exp(-x * 6) * 0.5);
    }
    if (energy >= 2 && !bar.build) {
      const P = energy >= 3 ? BREAK3 : BREAK2;
      for (const i of P.kick) if (i < steps) addMono(drums, t + i * S16, 0.5, kick(i === 0 ? 1 : 0.85));
      for (const i of P.snare) if (i < steps) addMono(drums, t + i * S16, 0.5, snare(0.9));
      for (const i of P.ghost) if (i < steps) addMono(drums, t + i * S16, 0.3, snare(0.22));
      for (let i = 0; i < steps; i++) addMono(hats, t + i * S16 + (i % 2 ? S16 * 0.08 : 0), 0.06, hat(i % 4 === 2 ? 0.26 : i % 2 ? 0.1 : 0.16), 0.4, 0.6);
      if (14 < steps) addMono(hats, t + 14 * S16, 0.4, hat(0.15, true), 0.6, 0.4);
      // reese: the root for the bar (half-bar notes)
      reeseNote(t, Math.min(steps, 8) * S16 * 0.95, r, r, 0.6);
      if (steps > 8) reeseNote(t + 8 * S16, (steps - 8) * S16 * 0.95, r + (b % 2 ? 3 : 0), bar.stop ? r - 12 : r + (b % 2 ? 3 : 0), 0.6);
    }
    if (energy >= 3 && !bar.build) {
      for (const i of [3, 11]) if (i < steps) {
        const lp = biquad();
        const ph = tones.map(() => rand());
        addMono(stabs, t + i * S16, 0.3, (x) => { let s = 0; tones.forEach((m, j) => { ph[j] = (ph[j] + hz(m) / SR) % 1; s += 2 * ph[j] - 1; }); return lp(s, "lp", 3000) * Math.exp(-x * 12) * 0.35; }, 0.45, 0.55);
      }
      // the siren: a thin sine rising over the bar
      let ph = 0;
      addMono(lead, t, BAR_S * (steps / 16), (x) => { ph = (ph + hz(tones[0] + 12 + 12 * (x / BAR_S)) / SR) % 1; return Math.sin(2 * Math.PI * ph) * 0.12 * Math.min(1, x / 0.2); });
    }
    // build: a snare roll, the reese sliding up, a gap
    if (bar.build) {
      const hits = [0, 2, 4, 6, 8, 9, 10, 11, 12, 12.5, 13, 13.5];
      hits.forEach((p, i) => addMono(drums, t + p * S16, 0.2, snare(0.25 + 0.6 * (i / hits.length)), 0.5, 0.5));
      reeseNote(t, BAR_S - BEAT_S / 2, r, r + 12, 0.55);
      const hp = biquad();
      addMono(fx, t, BAR_S - BEAT_S / 2, (x) => { const k = x / (BAR_S - BEAT_S / 2); return hp(noise(), "hp", 800 + 8000 * k * k) * k * k * 0.6; });
      const g0 = Math.round((t + BAR_S - BEAT_S / 2) * SR), g1 = Math.round((t + BAR_S) * SR);
      for (let i = g0; i < g1 && i < N; i++) gate[i] = Math.max(0, 1 - (i - g0) / 200, 1 - (g1 - i) / 80);
    }
  });

  renderPad(pad, { chordAt, levelAt: (t) => (scenes[sceneAt(t)].energy === 0 ? 0.012 : 0.01), cutoffAt: () => 900, xfade: 0.1 });
  echo(harp, BEAT_S * 0.75 * 1000, 0.25);
  echo(stabs, BEAT_S * 0.75 * 1000, 0.3);
  echo(lead, BEAT_S * 0.5 * 1000, 0.3);
  echo(drums, 40, 0.1);

  const out = buffer(len);
  mix(out, drums, 0.95);
  mix(out, hats, 0.6);
  mix(out, reese, 0.4);
  mix(out, stabs, 0.6);
  mix(out, lead, 0.5);
  mix(out, harp, 1.1);
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
