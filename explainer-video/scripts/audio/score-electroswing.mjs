// "electroswing": a swung, stagey electro-swing score (used by 《社恐》 — a
// performance nobody is watching) — another set of sounds: a four-on-the-floor
// kick under swung hats and a ride, brushed claps on 2 and 4, a walking upright
// bass (Karplus–Strong), Charleston piano comping, brass section stabs, and a
// clarinet line at the peaks; the quiet parts are a stride piano alone.
//
// Per scene, `energy` decides what plays:
//   0  the piano alone: a bass note, then the chord, oom-pah
//   1  + the walking bass, a soft kick on 1 and 3, brushes on 2 and 4, a
//      ride, piano comping
//   2  + the kick on every beat, claps, brass stabs on the "and" of 4
//   3  + the clarinet, a brass riff, the ride busier
// Between scenes: the bar before a scene with more energy, the brass slides
// up in a crescendo over a snare roll; the bar before a breakdown, the band
// plays a "ba-dum… tss" button on 3 and stops.
import { CHORD_NOTES, SR, addMono, biquad, buffer, echo, hz, mix, noise, normalize, pianoNote, rand } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

const SWING = 2 / 3; // the off-beat 8th lands two thirds of the way through the beat

// Karplus–Strong string into `out`
const pluck = (out, t0, midi, vel = 1, pan = 0.5, decay = 0.995, dur = 1.2, bright = 0.3) => {
  const f = hz(midi), n = Math.max(2, Math.round(SR / f));
  const buf = new Float32Array(n);
  for (let i = 0; i < n; i++) buf[i] = rand() * 2 - 1;
  const s0 = Math.round(t0 * SR), len = Math.round(dur * SR);
  let idx = 0;
  for (let i = 0; i < len && s0 + i < out[0].length; i++) {
    if (s0 + i < 0) continue;
    const y = buf[idx], nx = buf[(idx + 1) % n];
    buf[idx] = (y * (0.5 + 0.25 * bright) + nx * (0.5 - 0.25 * bright)) * decay;
    idx = (idx + 1) % n;
    const fade = i > len - 300 ? (len - i) / 300 : 1;
    out[0][s0 + i] += y * vel * (1 - pan) * fade;
    out[1][s0 + i] += y * vel * pan * fade;
  }
};
const kick = (vel = 1) => (t) => (Math.sin(2 * Math.PI * (50 * t + (90 / 24) * (1 - Math.exp(-24 * t)))) * Math.exp(-t * 8) + Math.sin(2 * Math.PI * 2000 * t) * Math.exp(-t * 350) * 0.2) * vel;
const clap = (vel = 1) => {
  const bp = biquad();
  return (t) => bp(noise(), "bp", 1700, 0.7) * ([0, 0.011, 0.022].reduce((a, o) => a + (t >= o ? Math.exp(-(t - o) * 130) : 0), 0) * 0.6 + Math.exp(-t * 14) * 0.4) * vel;
};
// a brush: a soft swish of filtered noise
const brush = (vel = 1, len = 0.18) => {
  const bp = biquad();
  return (t) => bp(noise(), "bp", 3500, 0.5) * Math.min(1, t / 0.02) * Math.exp(-t / len * 3) * vel;
};
const hat = (vel = 1) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 8000) * Math.exp(-t * 60) * vel;
};
// a ride: metallic partials and a little noise wash
const ride = (vel = 1) => {
  const hp = biquad();
  return (t) => ([1, 1.47, 1.97, 2.63, 3.31].reduce((a, r, i) => a + Math.sin(2 * Math.PI * 3200 * r * t + i) / (i + 1), 0) * 0.15 + hp(noise(), "hp", 6000) * 0.5) * Math.exp(-t * 7) * vel;
};
// brass section: a few detuned saws through a filter that opens with the blow
const brass = (out, t0, dur, notes, vel = 1, pan = 0.5, glide = 0) => {
  const s0 = Math.round(t0 * SR), n = Math.round((dur + 0.08) * SR);
  const ph = notes.map(() => [rand(), rand(), rand()]);
  const lp = [biquad(), biquad()];
  for (let i = 0; i < n && s0 + i < out[0].length; i++) {
    if (s0 + i < 0) continue;
    const t = i / SR;
    const g = glide ? -glide * (1 - Math.min(1, t / dur)) : -0.4 * Math.exp(-t / 0.03);
    let s = 0;
    notes.forEach((m, k) => {
      [-0.08, 0, 0.08].forEach((d, j) => {
        ph[k][j] = (ph[k][j] + hz(m + d + g) / SR) % 1;
        s += 2 * ph[k][j] - 1;
      });
    });
    const env = Math.min(1, t / 0.025) * (t > dur ? Math.max(0, 1 - (t - dur) / 0.08) : 1);
    const cut = 600 + 3200 * Math.min(1, t / 0.06) * (glide ? 0.4 + 0.6 * Math.min(1, t / dur) : Math.exp(-t * 2) * 0.6 + 0.4);
    const v = lp[1](lp[0](s, "lp", cut), "lp", cut) * env * vel / (notes.length * 3);
    out[0][s0 + i] += v * (1 - pan) * 2;
    out[1][s0 + i] += v * pan * 2;
  }
};
// clarinet: a hollow (odd-harmonic) tone with vibrato that grows
const clarinet = (f, dur, vel = 1) => {
  const lp = biquad();
  let ph = 0;
  return (t) => {
    const vib = 1 + 0.008 * Math.min(1, t / 0.25) * Math.sin(2 * Math.PI * 5.5 * t);
    ph = (ph + (f * vib) / SR) % 1;
    const x = Math.sin(2 * Math.PI * ph) + 0.35 * Math.sin(6 * Math.PI * ph) + 0.15 * Math.sin(10 * Math.PI * ph);
    return lp(x, "lp", 2600) * Math.min(1, t / 0.03) * Math.min(1, Math.max(0, (dur - t) / 0.05)) * vel;
  };
};

const pcs = (chord) => [...new Set(CHORD_NOTES[chord].map((n) => n % 12))];
const tonesFrom = (chord, lo) => pcs(chord).map((p) => { let m = p; while (m < lo) m += 12; return m; }).sort((a, z) => a - z);
const rootOf = (chord) => CHORD_NOTES[chord][0] % 12;

export const scoreElectroswing = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const len = songEnd + 3;
  const drums = buffer(len), cym = buffer(len), bass = buffer(len), keys = buffer(len), horns = buffer(len), lead = buffer(len), pad = buffer(len), fx = buffer(len);
  const nBars = Math.round(songEnd / BAR_S);
  const off = (beat) => beat * BEAT_S + SWING * BEAT_S; // swung "and" of a beat

  const bars = Array.from({ length: nBars }, (_, b) => {
    const t = b * BAR_S;
    const k = sceneAt(t + 1e-4);
    const s = scenes[k], next = scenes[k + 1];
    const last = t + BAR_S >= s.end - 1e-4;
    return { t, chord: chordAt(t + 1e-4), next: chordAt(t + BAR_S + 1e-4), energy: s.energy, build: last && next && next.energy > s.energy && next.energy >= 2, stop: last && next && next.energy === 0 && s.energy > 0 };
  });

  bars.forEach((bar, b) => {
    const { t, energy, chord } = bar;
    const beats = bar.stop ? 3 : 4;
    const root = rootOf(chord);
    const tn = tonesFrom(chord, 55);

    // --- piano
    if (energy === 0) {
      // stride: bass note on 1 and 3, the chord on 2 and 4
      let lo = root + 36; if (lo < 40) lo += 12;
      for (let k = 0; k < 4; k++) {
        if (k % 2 === 0) pianoNote(keys, t + k * BEAT_S, k === 0 ? lo : lo + 7, 0.45, 0.4);
        else tn.forEach((m, j) => pianoNote(keys, t + k * BEAT_S + j * 0.012, m, 0.2, 0.6));
      }
    } else if (!bar.build) {
      // Charleston comping: on 1 and the swung "and" of 2
      for (const o of [0, off(1)]) if (o < beats * BEAT_S) tn.forEach((m, j) => pianoNote(keys, t + o + j * 0.008, m + 12, o ? 0.11 : 0.14, 0.62));
    }

    // --- walking bass: chord tones, then a chromatic step into the next bar
    if (energy >= 1 && !bar.build) {
      let r = root + 36; if (r < 38) r += 12;
      const third = tonesFrom(chord, r)[1] ?? r + 4;
      const nextRoot = (() => { let m = rootOf(bar.next) + 36; if (m < 38) m += 12; return m; })();
      const walk = [r, third, r + 7, nextRoot + (nextRoot > r + 7 ? -1 : 1)];
      for (let k = 0; k < beats; k++) pluck(bass, t + k * BEAT_S, walk[k], k === 0 ? 0.95 : 0.75, 0.5, 0.993, 0.6, 0.15);
    }

    // --- drums
    if (energy >= 1 && !bar.build) {
      for (const k of [1, 3]) if (k < beats) addMono(drums, t + k * BEAT_S, 0.4, brush(energy >= 2 ? 0.35 : 0.5), 0.45, 0.55);
      if (energy === 1) for (const k of [0, 2]) if (k < beats) addMono(drums, t + k * BEAT_S, 0.5, kick(0.7));
      // ride: ding, ding-a, ding, ding-a
      for (let k = 0; k < beats; k++) {
        addMono(cym, t + k * BEAT_S, 0.5, ride(k % 2 ? 0.16 : 0.2), 0.65, 0.35);
        if (k % 2 === 1 || energy >= 3) addMono(cym, t + off(k), 0.4, ride(0.12), 0.65, 0.35);
      }
    }
    if (energy >= 2 && !bar.build) {
      for (let k = 0; k < beats; k++) addMono(drums, t + k * BEAT_S, 0.5, kick(k === 0 ? 1 : 0.85));
      for (const k of [1, 3]) if (k < beats) addMono(drums, t + k * BEAT_S, 0.4, clap(0.55), 0.48, 0.52);
      for (let k = 0; k < beats; k++) addMono(cym, t + off(k), 0.08, hat(0.2), 0.4, 0.6);
    }

    // --- brass
    if (energy >= 2 && !bar.build && !bar.stop) {
      const v = tonesFrom(chord, 62).slice(0, 3);
      brass(horns, t + off(3), 0.18, v, 0.9, 0.5); // the "and" of 4, pushing into the next bar
      if (energy >= 3) {
        // a riff: 1, the "and" of 1, 2½ held
        brass(horns, t, 0.14, v, 0.85, 0.45);
        brass(horns, t + off(0), 0.1, v.map((m) => m + 2), 0.7, 0.45);
        brass(horns, t + 2 * BEAT_S, BEAT_S * 0.9, v, 0.8, 0.55);
      }
    }

    // --- clarinet at the peaks: a swung arpeggio, up and back
    if (energy >= 3 && !bar.build) {
      const ct = tonesFrom(chord, 67);
      const line = [0, 1, 2, 3, 2, 1, 2, 0];
      for (let i = 0; i < beats * 2; i++) {
        const k = line[i % 8];
        const m = ct[k % ct.length] + (k >= ct.length ? 12 : 0);
        const o = Math.floor(i / 2) * BEAT_S + (i % 2 ? SWING * BEAT_S : 0);
        const d = i % 2 ? (1 - SWING) * BEAT_S : SWING * BEAT_S;
        addMono(lead, t + o, d, clarinet(hz(m), d * 0.95, i % 2 ? 0.22 : 0.3), 0.45, 0.55);
      }
    }

    // --- build: a snare roll under brass sliding up
    if (bar.build) {
      for (let i = 0; i < 24; i++) {
        const o = (i / 24) ** 0.8 * (BAR_S - 0.05);
        addMono(drums, t + o, 0.15, brush(0.2 + 0.6 * (i / 24), 0.08), 0.5, 0.5);
      }
      const v = tonesFrom(bar.next, 62).slice(0, 3);
      brass(horns, t + BEAT_S, BAR_S - BEAT_S, v, 1, 0.5, 5);
      addMono(drums, t, 0.6, kick(0.8));
    }

    // --- stop: "ba-dum… tss" on 3, then silence
    if (bar.stop && energy >= 1) {
      const v = tonesFrom(chord, 62).slice(0, 3);
      brass(horns, t + 2 * BEAT_S, 0.12, v, 0.9, 0.5);
      addMono(drums, t + 2 * BEAT_S, 0.5, kick(1));
      const hp = biquad();
      addMono(cym, t + 2 * BEAT_S + SWING * BEAT_S, 1.4, (x) => hp(noise(), "hp", 5000) * Math.exp(-x * 2.5) * 0.4, 0.6, 0.4);
      addMono(drums, t + 2 * BEAT_S + SWING * BEAT_S, 0.3, clap(0.7));
    }
  });

  renderPad(pad, { chordAt, levelAt: (t) => (scenes[sceneAt(t)].energy === 0 ? 0.005 : 0.01), cutoffAt: () => 900, xfade: 0.1 });

  echo(keys, BEAT_S * 0.75 * 1000, 0.12);
  echo(horns, 90, 0.18);
  echo(lead, BEAT_S * 0.5 * 1000, 0.22);
  echo(drums, 40, 0.1);

  const out = buffer(len);
  mix(out, drums, 1.0);
  mix(out, cym, 0.7);
  mix(out, bass, 1.0);
  mix(out, keys, 0.9);
  mix(out, horns, 0.32);
  mix(out, lead, 0.35);
  mix(out, pad, 1);
  mix(out, fx, 0.4);
  for (let i = 0; i < out[0].length; i++) { out[0][i] = Math.tanh(out[0][i] * 1.6); out[1][i] = Math.tanh(out[1][i] * 1.6); }

  fadeTail(out, songEnd);
  normalize(out, -1);
  return out;
};
