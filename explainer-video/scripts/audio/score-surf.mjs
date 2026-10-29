// "surf": a surf-rock score (used by 《ESTP · 停不下来》 — a man on a motorbike
// who can't stop, with his own shadow on his tail) — another set of sounds: a
// twangy single-coil guitar drenched in spring reverb, driving floor toms, a
// picked bass in eighths, a combo organ — and a tremolo-picked lead racing
// up and down the harmonic minor when it opens up.
//
// Per scene, `energy` decides what plays:
//   0  the reverb guitar alone, slow arpeggios
//   1  + floor toms on the eighths, a picked bass
//   2  + the full kit (kick, snare backbeat, hats), a rhythm-guitar chop, an organ
//   3  + a tremolo-picked lead in sixteenths
// Between scenes: the bar before a scene with more energy, a descending
// glissando and a tom fill; the bar before a breakdown, one drippy chord.
import { CHORD_NOTES, SR, addMono, biquad, buffer, echo, hz, mix, noise, normalize, rand } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

// twangy plucked string: bright Karplus–Strong, a quick decay
const twang = (f, vel = 1, decay = 0.994) => {
  const n = Math.max(2, Math.round(SR / f));
  const buf = Float32Array.from({ length: n }, () => (rand() * 2 - 1) * vel);
  for (let i = 1; i < n; i++) buf[i] = buf[i] * 0.7 + buf[i - 1] * 0.3;
  let i = 0;
  const hp = biquad();
  return () => {
    const v = buf[i];
    buf[i] = (v + buf[(i + 1) % n]) * 0.5 * decay;
    i = (i + 1) % n;
    return hp(v, "hp", 180);
  };
};
const kick = (vel = 1) => (t) => Math.sin(2 * Math.PI * (50 * t + (70 / 30) * (1 - Math.exp(-30 * t)))) * Math.exp(-t * 12) * vel;
const tom = (vel = 1) => (t) => (Math.sin(2 * Math.PI * (95 * t + (30 / 14) * (1 - Math.exp(-14 * t)))) * Math.exp(-t * 9) + noise() * Math.exp(-t * 40) * 0.15) * vel;
const snare = (vel = 1) => {
  const bp = biquad();
  return (t) => (Math.sin(2 * Math.PI * 190 * t) * Math.exp(-t * 28) * 0.4 + bp(noise(), "bp", 3200, 0.7) * Math.exp(-t * 16)) * vel;
};
const hat = (vel = 1) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 8000) * Math.exp(-t * 45) * vel;
};
const pickBass = (f, dur, vel = 1) => {
  const lp = biquad();
  return (t) => lp(Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(4 * Math.PI * f * t) + 0.15 * Math.sin(6 * Math.PI * f * t), "lp", 900) * Math.exp(-t * 4) * Math.min(1, t / 0.004) * Math.min(1, (dur - t) / 0.02) * vel;
};
// combo organ: a thin square-ish tone with fast vibrato
const organ = (f, dur, vel = 1) => {
  let ph = rand();
  const lp = biquad();
  return (t) => {
    ph = (ph + (f * (1 + 0.004 * Math.sin(2 * Math.PI * 6.5 * t))) / SR) % 1;
    const sq = (ph < 0.5 ? 1 : -1) * 0.6 + (ph < 0.25 || (ph > 0.5 && ph < 0.75) ? 0.4 : -0.4);
    return lp(sq, "lp", 2200) * Math.min(1, t / 0.02) * Math.min(1, (dur - t) / 0.05) * vel;
  };
};

// spring reverb: a few short combs with high feedback, darkened — the "drip"
const spring = ([L, R], mixAmt = 0.35) => {
  const n = L.length;
  const wet = [new Float32Array(n), new Float32Array(n)];
  [[29, 41, 53], [33, 47, 59]].forEach((ds, ch) => {
    const src = ch ? R : L;
    ds.forEach((ms) => {
      const d = Math.round((ms / 1000) * SR);
      const y = new Float32Array(n);
      let lp = 0;
      for (let i = 0; i < n; i++) {
        const fb = i >= d ? y[i - d] : 0;
        lp = lp * 0.55 + fb * 0.45;
        y[i] = src[i] + lp * 0.78;
        wet[ch][i] += (y[i] - src[i]) / ds.length;
      }
    });
  });
  for (let i = 0; i < n; i++) { L[i] += wet[0][i] * mixAmt; R[i] += wet[1][i] * mixAmt; }
};

export const scoreSurf = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const len = songEnd + 3;
  const gtr = buffer(len), lead = buffer(len), drums = buffer(len), bass = buffer(len), org = buffer(len), pad = buffer(len);
  const nBars = Math.round(songEnd / BAR_S);
  const E = BEAT_S / 2, S = BEAT_S / 4;
  const bars = Array.from({ length: nBars }, (_, b) => {
    const t = b * BAR_S;
    const k = sceneAt(t + 1e-4);
    const s = scenes[k], next = scenes[k + 1];
    const last = t + BAR_S >= s.end - 1e-4;
    return { t, chord: chordAt(t + 1e-4), energy: s.energy, build: last && next && next.energy > s.energy && next.energy >= 2, stop: last && next && next.energy === 0 && s.energy > 0 };
  });
  // A harmonic minor, two octaves from A3
  const HM = [57, 59, 60, 62, 64, 65, 68, 69, 71, 72, 74, 76, 77, 80, 81];
  const near = (m) => HM.reduce((a, z) => (Math.abs(z - m) < Math.abs(a - m) ? z : a), HM[0]);
  // the lead's phrase over a bar: degrees into HM, one per beat, tremolo-picked
  const PHRASES = [[7, 6, 4, 6], [7, 9, 11, 9], [10, 9, 7, 6], [4, 6, 7, 7]];

  bars.forEach((bar, b) => {
    const { t, energy, chord } = bar;
    const notes = CHORD_NOTES[chord];
    let root = notes[0] % 12 + 33; if (root < 36) root += 12;
    const tones = [...new Set(notes.map((n) => n % 12))].map((p) => { let m = p; while (m < 57) m += 12; return m; }).sort((a, z) => a - z);

    if (bar.stop) {
      tones.forEach((m, i) => addMono(gtr, t + i * 0.04, 2.5, twang(hz(m), 0.6, 0.998), 0.5, 0.5));
      addMono(drums, t, 0.5, kick(0.8));
      return;
    }
    // guitar: arpeggio in eighths (energy 0: quarters), a low "twang" on 1
    addMono(gtr, t, 1.2, twang(hz(root + 12), 0.7), 0.55, 0.45);
    const arp = [0, 1, 2, 1, 2, 1, 0, 1].map((k) => tones[k % tones.length] + (k === 2 ? 12 : 0));
    arp.forEach((m, e) => { if (energy > 0 || e % 2 === 0) addMono(gtr, t + e * E, 0.6, twang(hz(m), 0.32), 0.35 + 0.3 * (e % 2), 0.65 - 0.3 * (e % 2)); });
    if (bar.build) {
      // glissando down the neck, tom fill
      for (let i = 0; i < 12; i++) addMono(lead, t + 2 * BEAT_S + i * (2 * BEAT_S / 12), 0.2, twang(hz(HM[14 - i]), 0.3), 0.5, 0.5);
      for (let i = 0; i < 8; i++) addMono(drums, t + 2 * BEAT_S + i * S, 0.3, tom(0.3 + 0.06 * i), 0.3 + 0.05 * i, 0.7 - 0.05 * i);
      return;
    }
    if (energy >= 1) {
      for (let e = 0; e < 8; e++) addMono(drums, t + e * E, 0.3, tom(e % 2 ? 0.14 : 0.22), 0.45, 0.55);
      for (let e = 0; e < 8; e++) addMono(bass, t + e * E, E * 0.9, pickBass(hz(root - 12 + (e === 6 ? 7 : e === 7 ? 10 : 0)), E * 0.9, 0.6));
    }
    if (energy >= 2) {
      [0, 2, 2.5].forEach((at) => addMono(drums, t + at * BEAT_S, 0.4, kick(0.55)));
      [1, 3].forEach((at) => addMono(drums, t + at * BEAT_S, 0.3, snare(0.6), 0.5, 0.5));
      for (let e = 0; e < 8; e++) addMono(drums, t + e * E, 0.08, hat(e % 2 ? 0.1 : 0.16), 0.65, 0.35);
      // rhythm chop on the off-beats
      [0.5, 1.5, 2.5, 3.5].forEach((at) => tones.forEach((m, i) => addMono(gtr, t + at * BEAT_S + i * 0.006, 0.12, twang(hz(m), 0.12, 0.98), 0.7, 0.3)));
      tones.forEach((m) => addMono(org, t, BAR_S, organ(hz(m), BAR_S, 0.07), 0.3, 0.7));
    }
    if (energy >= 3) {
      const ph = PHRASES[b % PHRASES.length];
      ph.forEach((deg, beat) => {
        const m = near(HM[deg] + (tones.includes(HM[deg]) ? 0 : 0));
        for (let k = 0; k < 4; k++) addMono(lead, t + beat * BEAT_S + k * S, S * 1.2, twang(hz(m), 0.3 - 0.04 * (k % 2)), 0.45, 0.55);
      });
    }
  });

  renderPad(pad, { chordAt, levelAt: (t) => (scenes[sceneAt(t)].energy === 0 ? 0.004 : 0.002), cutoffAt: () => 900, xfade: 0.2 });
  spring(gtr, 0.5);
  spring(lead, 0.4);
  echo(lead, BEAT_S * 0.75 * 1000, 0.2);

  const out = buffer(len);
  mix(out, gtr, 1.35);
  mix(out, lead, 1.1);
  mix(out, drums, 0.7);
  mix(out, bass, 0.17);
  mix(out, org, 1.5);
  mix(out, pad, 1);
  for (let i = 0; i < out[0].length; i++) {
    out[0][i] = Math.tanh(out[0][i]);
    out[1][i] = Math.tanh(out[1][i]);
  }
  fadeTail(out, songEnd);
  normalize(out, -1);
  return out;
};
