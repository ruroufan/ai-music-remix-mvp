// "frenchhouse": a filtered-disco / French-house score (used by 《空虚》 — the
// pendulum that swings between pain and boredom) — another set of sounds: a
// four-on-the-floor kick that every other part ducks under (the pump), a disco
// chord loop through a sweeping low-pass, an octave-jumping slap bass, claps,
// open hats — and under the quiet parts, a music box over a pendulum's tick-tock.
//
// Per scene, `energy` decides what plays:
//   0  the music box and the tick-tock
//   1  + the chord loop behind a nearly closed filter, a soft kick
//   2  + the full kick, claps on 2 and 4, open hats, the slap bass, the filter
//        open and pumping
//   3  + the loop chopped in 16ths, a shaker, a string line rising over the bar
// Between scenes: the bar before a scene with more energy, the filter closes
// right down and then flies open over a snare roll, half a beat of silence,
// the drop; the bar before a breakdown, the whole mix tape-stops on 3.
import { CHORD_NOTES, SAW, SR, TABLE_SIZE, addMono, biquad, buffer, echo, hz, mix, noise, normalize, rand } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

const kick = (vel = 1) => (t) => (Math.sin(2 * Math.PI * (50 * t + (130 / 32) * (1 - Math.exp(-32 * t)))) * Math.exp(-t * 7) + Math.sin(2 * Math.PI * 3000 * t) * Math.exp(-t * 400) * 0.25) * vel;
const clap = (vel = 1) => {
  const bp = biquad();
  return (t) => bp(noise(), "bp", 1500, 0.9) * ([0, 0.01, 0.02].reduce((a, o) => a + (t >= o ? Math.exp(-(t - o) * 140) : 0), 0) * 0.6 + Math.exp(-t * 14) * 0.5) * vel;
};
const hat = (vel = 1, open = false) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 8000) * Math.exp(-t * (open ? 11 : 65)) * vel;
};
const shaker = (vel = 1) => {
  const bp = biquad();
  return (t) => bp(noise(), "bp", 6500, 1.2) * Math.min(1, t / 0.008) * Math.exp(-t * 45) * vel;
};
const snare = (vel = 1) => {
  const bp = biquad();
  return (t) => (Math.sin(2 * Math.PI * 200 * t) * Math.exp(-t * 25) * 0.5 + bp(noise(), "bp", 2400, 0.6) * Math.exp(-t * 16)) * vel;
};
// music box: high, bright partials, quick decay
const mbox = (f, vel = 1) => (t) => (Math.sin(2 * Math.PI * f * t) + Math.sin(2 * Math.PI * f * 3.01 * t) * 0.25 * Math.exp(-t * 6) + Math.sin(2 * Math.PI * f * 5.4 * t) * 0.08 * Math.exp(-t * 12)) * Math.exp(-t * 2.6) * Math.min(1, t / 0.002) * vel;
// the pendulum: a wooden tick (high) and tock (low)
const tick = (hi, vel = 1) => {
  const bp = biquad();
  return (t) => (bp(noise(), "bp", hi ? 3200 : 1700, 6) * 2 + Math.sin(2 * Math.PI * (hi ? 1900 : 1100) * t) * 0.4) * Math.exp(-t * 90) * vel;
};
// 16-step chop for energy 3 (1 = sounding)
const CHOP = [1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0];
// slap bass, 16ths: [step, octave up?]
const BASS = [[0, 0], [3, 1], [4, 0], [6, 0], [7, 1], [10, 0], [11, 1], [12, 0], [14, 1]];

export const scoreFrenchhouse = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const S16 = BEAT_S / 4;
  const len = songEnd + 3;
  const drums = buffer(len), hats = buffer(len), loop = buffer(len), bass = buffer(len), strings = buffer(len), box = buffer(len), pad = buffer(len), fx = buffer(len);
  const nBars = Math.round(songEnd / BAR_S);
  const N = Math.ceil(len * SR);
  const gate = new Float32Array(N).fill(1);
  const pump = new Float32Array(N).fill(1);
  const speed = new Float32Array(N).fill(1); // tape-stop amount per sample (1 = normal)
  const bars = Array.from({ length: nBars }, (_, b) => {
    const t = b * BAR_S;
    const k = sceneAt(t + 1e-4);
    const s = scenes[k], next = scenes[k + 1];
    const last = t + BAR_S >= s.end - 1e-4;
    return { t, chord: chordAt(t + 1e-4), energy: s.energy, first: Math.abs(t - s.start) < 1e-4, build: last && next && next.energy > s.energy && next.energy >= 2, stop: last && next && next.energy === 0 && s.energy > 0 };
  });

  // the disco loop: the chord on detuned saws through a low-pass whose cutoff
  // follows `cut(x)`; `chop` gates it in 16ths
  const loopBar = (t, chord, steps, cut, vel, chop) => {
    const tones = [...new Set(CHORD_NOTES[chord].map((n) => n % 12))].map((p) => { let m = p; while (m < 55) m += 12; return m; });
    const ph = tones.flatMap(() => [rand(), rand()]);
    const lp = [biquad(), biquad()], lpR = [biquad(), biquad()];
    const dur = steps * S16;
    const s0 = Math.round(t * SR), n = Math.round(dur * SR);
    for (let j = 0; j < n && s0 + j < N; j++) {
      const x = j / SR;
      let l = 0, r = 0;
      tones.forEach((m, i) => {
        ph[2 * i] = (ph[2 * i] + hz(m - 0.08) / SR) % 1;
        ph[2 * i + 1] = (ph[2 * i + 1] + hz(m + 0.08) / SR) % 1;
        l += SAW[(ph[2 * i] * TABLE_SIZE) | 0];
        r += SAW[(ph[2 * i + 1] * TABLE_SIZE) | 0];
      });
      const c = cut(x);
      let g = 1;
      if (chop) {
        const st = Math.floor(x / S16), within = x - st * S16;
        g = CHOP[st % 16] ? Math.min(1, within / 0.003) * Math.min(1, (S16 * 0.85 - within) / 0.006 + 1) : 0;
        g = Math.max(0, g);
      }
      loop[0][s0 + j] += lp[1](lp[0](l, "lp", c, 1.4), "lp", c, 0.7) * 0.12 * vel * g;
      loop[1][s0 + j] += lpR[1](lpR[0](r, "lp", c, 1.4), "lp", c, 0.7) * 0.12 * vel * g;
    }
  };

  bars.forEach((bar, b) => {
    const { t, energy, chord } = bar;
    const steps = bar.stop ? 12 : 16;
    const root = CHORD_NOTES[chord][0] % 12;
    let r = root + 36; if (r < 40) r += 12;
    const tones = [...new Set(CHORD_NOTES[chord].map((n) => n % 12))].map((p) => { let m = p; while (m < 72) m += 12; return m; }).sort((a, z) => a - z);

    if (bar.first && b > 0 && bars[b - 1].build) {
      addMono(fx, t, 1.6, (x) => Math.sin(2 * Math.PI * (34 * x + (70 / 9) * (1 - Math.exp(-9 * x)))) * Math.exp(-x * 2.4) * 0.9);
      const hp = biquad();
      addMono(fx, t, 1.8, (x) => hp(noise(), "hp", 5000) * Math.exp(-x * 2.2) * 0.35, 0.8, 1);
    }

    // the music box and the pendulum (energy 0); the tick-tock also under energy 1
    if (energy === 0) {
      const seq = [0, 1, 2, 1, 0, 2, 1, 2];
      seq.forEach((k, i) => addMono(box, t + i * (BAR_S / 8), 1.6, mbox(hz(tones[k % tones.length] + (i === 7 ? 12 : 0)), i % 2 ? 0.2 : 0.3), 0.4 + 0.05 * i, 0.75 - 0.05 * i));
    }
    if (energy <= 1) for (let k = 0; k * 4 < steps; k++) addMono(fx, t + k * BEAT_S, 0.08, tick(k % 2 === 0, energy === 0 ? 0.5 : 0.3), k % 2 ? 0.35 : 0.7, k % 2 ? 0.7 : 0.35);

    // the loop
    if (energy === 1 && !bar.build) {
      loopBar(t, chord, steps, (x) => 380 + 150 * Math.sin(2 * Math.PI * x / BAR_S), 0.8, false);
      for (let k = 0; k * 4 < steps; k++) addMono(drums, t + k * BEAT_S, 0.4, kick(0.55));
    }
    if (energy >= 2 && !bar.build) {
      const base = energy >= 3 ? 2600 : 1500;
      loopBar(t, chord, steps, (x) => base + 900 * Math.sin(2 * Math.PI * (b * BAR_S + x) / (BAR_S * 4)), energy >= 3 ? 1.3 : 1, energy >= 3);
      for (let k = 0; k * 4 < steps; k++) addMono(drums, t + k * BEAT_S, 0.5, kick(1));
      for (const k of [1, 3]) if (k * 4 < steps) addMono(drums, t + k * BEAT_S, 0.4, clap(0.6), 0.47, 0.53);
      for (let k = 0; k * 4 < steps; k++) addMono(hats, t + k * BEAT_S + 2 * S16, 0.3, hat(0.25, true), 0.4, 0.6);
      for (let i = 0; i < steps; i++) if (i % 4 !== 2) addMono(hats, t + i * S16, 0.05, hat(0.07), 0.6, 0.4);
      // slap bass
      BASS.forEach(([i, up]) => {
        if (i >= steps) return;
        const m = r + 12 * up, lp = biquad();
        let ph = rand();
        addMono(bass, t + i * S16, S16 * 0.9, (x) => { ph = (ph + hz(m) / SR) % 1; return Math.tanh(lp(SAW[(ph * TABLE_SIZE) | 0], "lp", 300 + 2400 * Math.exp(-x * 30), 2) * 2) * Math.min(1, x / 0.002) * Math.min(1, (S16 * 0.9 - x) / 0.01) * (up ? 0.45 : 0.6); });
      });
    }
    if (energy >= 3 && !bar.build) {
      for (let i = 0; i < steps; i++) addMono(hats, t + i * S16 + (i % 2 ? S16 * 0.1 : 0), 0.06, shaker(i % 4 === 2 ? 0.2 : 0.12), 0.55, 0.45);
      // strings rising over the bar
      const ph = tones.map(() => rand());
      const lp = biquad();
      addMono(strings, t, BAR_S * (steps / 16), (x) => { let s = 0; tones.forEach((m, j) => { ph[j] = (ph[j] + hz(m + 2 * (x / BAR_S)) * (1 + 0.002 * Math.sin(2 * Math.PI * 5 * x + j)) / SR) % 1; s += 2 * ph[j] - 1; }); return lp(s, "lp", 2500) * 0.06 * Math.min(1, x / 0.4); });
    }
    // pump: everything that isn't a drum ducks under each kick
    if (energy >= 1 && !bar.build) {
      const depth = energy === 1 ? 0.45 : 0.7;
      const s0 = Math.round(t * SR), n = Math.round(steps * S16 * SR);
      for (let j = 0; j < n && s0 + j < N; j++) {
        const x = (j / SR) % BEAT_S;
        pump[s0 + j] = 1 - depth * Math.exp(-x * 9) * Math.min(1, x / 0.004 + 0.6);
      }
    }
    // build: the filter closes to nothing, then flies open over a snare roll; a gap
    if (bar.build) {
      loopBar(t, chord, 14, (x) => { const k = x / (BAR_S - BEAT_S / 2); return k < 0.4 ? 1500 - 1300 * (k / 0.4) : 200 + 7000 * Math.pow((k - 0.4) / 0.6, 2); }, 1, false);
      const hits = [0, 2, 4, 6, 8, 9, 10, 11, 12, 12.5, 13, 13.5];
      hits.forEach((p, i) => addMono(drums, t + p * S16, 0.2, snare(0.25 + 0.55 * (i / hits.length)), 0.5, 0.5));
      const hp = biquad();
      addMono(fx, t, BAR_S - BEAT_S / 2, (x) => { const k = x / (BAR_S - BEAT_S / 2); return hp(noise(), "hp", 800 + 8000 * k * k) * k * k * 0.6; });
      const g0 = Math.round((t + BAR_S - BEAT_S / 2) * SR), g1 = Math.round((t + BAR_S) * SR);
      for (let i = g0; i < g1 && i < N; i++) gate[i] = Math.max(0, 1 - (i - g0) / 200, 1 - (g1 - i) / 80);
    }
    // stop: a tape-stop over beat 3
    if (bar.stop && energy >= 1) {
      const a0 = Math.round((t + 2 * BEAT_S) * SR), a1 = Math.round((t + 3 * BEAT_S) * SR);
      for (let i = a0; i < a1 && i < N; i++) speed[i] = 1 - (i - a0) / (a1 - a0);
      for (let i = a1; i < Math.round((t + BAR_S) * SR) && i < N; i++) speed[i] = 0;
    }
  });

  renderPad(pad, { chordAt, levelAt: (t) => (scenes[sceneAt(t)].energy === 0 ? 0.014 : 0.008), cutoffAt: () => 900, xfade: 0.1 });
  echo(box, BEAT_S * 0.75 * 1000, 0.35);
  echo(loop, BEAT_S * 0.75 * 1000, 0.15);
  echo(strings, BEAT_S * 0.5 * 1000, 0.25);

  // the pumping bus (loop, bass, strings), tape-stopped where asked
  const bus = buffer(len);
  mix(bus, loop, 1);
  mix(bus, bass, 0.5);
  mix(bus, strings, 1);
  mix(bus, drums, 0.9);
  mix(bus, hats, 0.6);
  for (let i = 0; i < N && i < bus[0].length; i++) {
    bus[0][i] *= pump[i];
    bus[1][i] *= pump[i];
  }
  // tape-stop: read the bus at a slowing rate inside the stop regions
  const out = buffer(len);
  let pos = 0;
  for (let i = 0; i < out[0].length; i++) {
    const sp = i < N ? speed[i] : 1;
    if (sp >= 1) pos = i;
    else pos += sp;
    const p0 = Math.floor(pos), fr = pos - p0;
    if (p0 + 1 < bus[0].length) {
      const fade = sp >= 1 ? 1 : Math.min(1, sp * 3);
      out[0][i] += (bus[0][p0] * (1 - fr) + bus[0][p0 + 1] * fr) * fade;
      out[1][i] += (bus[1][p0] * (1 - fr) + bus[1][p0 + 1] * fr) * fade;
    }
  }
  mix(out, box, 1.1);
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
