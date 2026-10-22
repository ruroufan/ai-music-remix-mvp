// "trance": an uplifting-trance score (used by 《INTP · 想太多》 — out of the
// grey study, into the green) — another set of sounds: a four-on-the-floor
// kick under a rolling off-beat bass (three 16ths after every kick), a plucked
// arpeggio, gated supersaw chords, open hats, big risers — and under the quiet
// parts, a breathy wooden flute.
//
// Per scene, `energy` decides what plays:
//   0  a wooden flute alone
//   1  + a plucked arpeggio, a soft kick
//   2  + the full kick, the rolling bass, open hats, the supersaw gated in 16ths
//   3  + the supersaw lead on top, a second arpeggio an octave up
// Between scenes: the bar before a scene with more energy, a snare roll and a
// white-noise riser climbing, the filter opening, half a beat of silence, the
// drop; the bar before a breakdown, the supersaw swells and everything stops
// on 3.
import { CHORD_NOTES, SAW, SR, TABLE_SIZE, addMono, biquad, buffer, echo, hz, mix, noise, normalize, rand } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

const kick = (vel = 1) => (t) => (Math.sin(2 * Math.PI * (50 * t + (140 / 30) * (1 - Math.exp(-30 * t)))) * Math.exp(-t * 7) + Math.sin(2 * Math.PI * 2800 * t) * Math.exp(-t * 400) * 0.25) * vel;
const hat = (vel = 1, open = false) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 8500) * Math.exp(-t * (open ? 12 : 70)) * vel;
};
const snare = (vel = 1) => {
  const bp = biquad();
  return (t) => (Math.sin(2 * Math.PI * 200 * t) * Math.exp(-t * 25) * 0.5 + bp(noise(), "bp", 2400, 0.6) * Math.exp(-t * 16)) * vel;
};
const clap = (vel = 1) => {
  const bp = biquad();
  return (t) => bp(noise(), "bp", 1400, 0.9) * ([0, 0.01, 0.02].reduce((a, o) => a + (t >= o ? Math.exp(-(t - o) * 140) : 0), 0) * 0.6 + Math.exp(-t * 13) * 0.45) * vel;
};
// a plucked saw: bright attack, quick decay
const pluck = (f, vel = 1) => {
  const lp = biquad();
  let ph = rand();
  return (t) => { ph = (ph + f / SR) % 1; return lp(SAW[(ph * TABLE_SIZE) | 0], "lp", 500 + 4500 * Math.exp(-t * 18)) * Math.exp(-t * 6) * Math.min(1, t / 0.002) * vel; };
};
// a breathy flute: a sine with a little vibrato and breath noise
const flute = (f, dur, vel = 1) => {
  const bp = biquad();
  let ph = 0;
  return (t) => {
    ph = (ph + f * (1 + 0.006 * Math.sin(2 * Math.PI * 5 * t) * Math.min(1, t / 0.4)) / SR) % 1;
    const env = Math.min(1, t / 0.12) * Math.min(1, Math.max(0, (dur - t) / 0.25));
    return (Math.sin(2 * Math.PI * ph) + Math.sin(4 * Math.PI * ph) * 0.12 + bp(noise(), "bp", f * 2, 2) * 0.25) * env * vel;
  };
};
const ARP = [0, 1, 2, 3, 2, 1, 0, 2, 1, 3, 2, 0, 3, 1, 2, 3]; // chord-tone indices, 16ths

export const scoreTrance = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const S16 = BEAT_S / 4;
  const len = songEnd + 3;
  const drums = buffer(len), hats = buffer(len), bass = buffer(len), arp = buffer(len), saw = buffer(len), lead = buffer(len), wind = buffer(len), pad = buffer(len), fx = buffer(len);
  const nBars = Math.round(songEnd / BAR_S);
  const N = Math.ceil(len * SR);
  const gate = new Float32Array(N).fill(1);
  const pump = new Float32Array(N).fill(1);
  const bars = Array.from({ length: nBars }, (_, b) => {
    const t = b * BAR_S;
    const k = sceneAt(t + 1e-4);
    const s = scenes[k], next = scenes[k + 1];
    const last = t + BAR_S >= s.end - 1e-4;
    return { t, chord: chordAt(t + 1e-4), energy: s.energy, first: Math.abs(t - s.start) < 1e-4, build: last && next && next.energy > s.energy && next.energy >= 2, stop: last && next && next.energy === 0 && s.energy > 0 };
  });

  // supersaw: seven detuned saws per chord tone through a low-pass
  const supersaw = (out, t0, dur, notes, cut, vel, gated) => {
    const voices = notes.flatMap((m) => [-0.25, -0.15, -0.06, 0, 0.06, 0.15, 0.25].map((d) => ({ f: hz(m + d), ph: rand(), side: d })));
    const lp = [biquad(), biquad()], lp2 = [biquad(), biquad()];
    const s0 = Math.round(t0 * SR), n = Math.round(dur * SR);
    for (let j = 0; j < n && s0 + j < N; j++) {
      const x = j / SR;
      let l = 0, r = 0;
      for (const v of voices) {
        v.ph = (v.ph + v.f / SR) % 1;
        const s = SAW[(v.ph * TABLE_SIZE) | 0];
        l += s * (0.5 - v.side); r += s * (0.5 + v.side);
      }
      let g = Math.min(1, x / 0.01) * Math.min(1, (dur - x) / 0.03);
      if (gated) { const w = (x % S16) / S16; g *= w < 0.7 ? 1 : Math.max(0, 1 - (w - 0.7) / 0.1); }
      const c = typeof cut === "function" ? cut(x) : cut;
      out[0][s0 + j] += lp[1](lp[0](l, "lp", c, 0.9), "lp", c, 0.7) * g * vel / voices.length;
      out[1][s0 + j] += lp2[1](lp2[0](r, "lp", c, 0.9), "lp", c, 0.7) * g * vel / voices.length;
    }
  };

  bars.forEach((bar, b) => {
    const { t, energy, chord } = bar;
    const steps = bar.stop ? 8 : 16;
    const root = CHORD_NOTES[chord][0] % 12;
    let r = root + 36; if (r < 40) r += 12;
    const tones = [...new Set(CHORD_NOTES[chord].map((n) => n % 12))].map((p) => { let m = p; while (m < 60) m += 12; return m; }).sort((a, z) => a - z);
    const t4 = [...tones, tones[0] + 12];

    if (bar.first && b > 0 && bars[b - 1].build) {
      addMono(fx, t, 1.6, (x) => Math.sin(2 * Math.PI * (34 * x + (70 / 9) * (1 - Math.exp(-9 * x)))) * Math.exp(-x * 2.4) * 0.9);
      const hp = biquad();
      addMono(fx, t, 2, (x) => hp(noise(), "hp", 4000) * Math.exp(-x * 1.8) * 0.4, 0.8, 1);
    }

    // flute (energy 0): a slow phrase over the bar
    if (energy === 0) {
      [[0, 0, 1.5], [1.5, 2, 1], [2.5, 1, 1.5]].forEach(([at, k, d]) => addMono(wind, t + at * BEAT_S, d * BEAT_S + 0.3, flute(hz(t4[k] + 12), d * BEAT_S + 0.3, 0.34), 0.5, 0.6));
    }

    if (energy >= 1 && !bar.build) {
      for (let i = 0; i < steps; i++) addMono(arp, t + i * S16, 0.4, pluck(hz(t4[ARP[i]] + (energy >= 2 ? 0 : 0)), i % 4 === 0 ? 0.32 : 0.22), i % 2 ? 0.35 : 0.65, i % 2 ? 0.65 : 0.35);
      if (energy >= 3) for (let i = 0; i < steps; i++) addMono(arp, t + i * S16, 0.3, pluck(hz(t4[ARP[(i + 2) % 16]] + 12), 0.12), 0.7, 0.3);
    }
    if (energy === 1 && !bar.build) for (let k = 0; k * 4 < steps; k++) addMono(drums, t + k * BEAT_S, 0.4, kick(0.6));
    if (energy >= 2 && !bar.build) {
      for (let k = 0; k * 4 < steps; k++) {
        addMono(drums, t + k * BEAT_S, 0.5, kick(1));
        // rolling bass: the three 16ths after each kick
        for (const s of [1, 2, 3]) {
          const lp = biquad();
          let ph = rand();
          const m = s === 2 && b % 2 ? r + 12 : r;
          addMono(bass, t + k * BEAT_S + s * S16, S16 * 0.85, (x) => { ph = (ph + hz(m) / SR) % 1; return Math.tanh(lp(SAW[(ph * TABLE_SIZE) | 0], "lp", 700 + 1200 * Math.exp(-x * 40), 1.2) * 1.6) * Math.min(1, x / 0.002) * Math.min(1, (S16 * 0.85 - x) / 0.008) * 0.55; });
        }
        addMono(hats, t + k * BEAT_S + 2 * S16, 0.3, hat(0.24, true), 0.4, 0.6);
      }
      for (const k of [1, 3]) if (k * 4 < steps) addMono(drums, t + k * BEAT_S, 0.4, clap(0.5), 0.48, 0.52);
      for (let i = 0; i < steps; i++) if (i % 4 !== 2) addMono(hats, t + i * S16, 0.05, hat(0.07), 0.6, 0.4);
      supersaw(saw, t, steps * S16, tones, energy >= 3 ? 3800 : 2400, 0.55, true);
    }
    if (energy >= 3 && !bar.build) {
      // the lead: a supersaw melody on chord tones, two notes a bar
      [[0, 3], [2, 2]].forEach(([at, k]) => { if (at * 4 < steps) supersaw(lead, t + at * BEAT_S, 2 * BEAT_S - 0.03, [t4[k] + 12], 5000, 0.7, false); });
    }
    // pump: the arps and saws duck under the kick
    if (energy >= 2 && !bar.build) {
      const s0 = Math.round(t * SR), n = Math.round(steps * S16 * SR);
      for (let j = 0; j < n && s0 + j < N; j++) { const x = (j / SR) % BEAT_S; pump[s0 + j] = 1 - 0.55 * Math.exp(-x * 10); }
    }
    // build: snare roll, riser, the supersaw filter opening, a gap
    if (bar.build) {
      const hits = [0, 2, 4, 6, 8, 9, 10, 11, 12, 12.5, 13, 13.5];
      hits.forEach((p, i) => addMono(drums, t + p * S16, 0.2, snare(0.25 + 0.6 * (i / hits.length)), 0.5, 0.5));
      supersaw(saw, t, BAR_S - BEAT_S / 2, tones, (x) => 400 + 5000 * Math.pow(x / (BAR_S - BEAT_S / 2), 2), 0.5, true);
      const hp = biquad();
      addMono(fx, t, BAR_S - BEAT_S / 2, (x) => { const k = x / (BAR_S - BEAT_S / 2); return hp(noise(), "hp", 800 + 8000 * k * k) * k * k * 0.6; });
      const g0 = Math.round((t + BAR_S - BEAT_S / 2) * SR), g1 = Math.round((t + BAR_S) * SR);
      for (let i = g0; i < g1 && i < N; i++) gate[i] = Math.max(0, 1 - (i - g0) / 200, 1 - (g1 - i) / 80);
    }
    // stop: a supersaw swell into silence on 3
    if (bar.stop && energy >= 1) supersaw(saw, t, 2 * BEAT_S, tones, 3000, 0.4, false);
  });

  renderPad(pad, { chordAt, levelAt: (t) => (scenes[sceneAt(t)].energy === 0 ? 0.014 : 0.008), cutoffAt: () => 900, xfade: 0.1 });
  echo(arp, BEAT_S * 0.75 * 1000, 0.35);
  echo(lead, BEAT_S * 0.75 * 1000, 0.3);
  echo(wind, BEAT_S * 0.75 * 1000, 0.3);

  const ducked = buffer(len);
  mix(ducked, arp, 0.9);
  mix(ducked, saw, 1.1);
  mix(ducked, lead, 1.1);
  mix(ducked, bass, 0.45);
  for (let i = 0; i < N && i < ducked[0].length; i++) { ducked[0][i] *= pump[i]; ducked[1][i] *= pump[i]; }
  const out = buffer(len);
  mix(out, ducked, 1);
  mix(out, drums, 0.95);
  mix(out, hats, 0.6);
  mix(out, wind, 1.2);
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
