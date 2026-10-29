// "samba": a samba score (used by 《ESFP · 热闹》 — the life of every party,
// and the loneliest one when it's over) — another set of sounds: a nylon
// guitar, a cavaquinho strumming the syncopated "telecoteco", surdos
// answering each other on 1 and 2, a caixa in sixteenths, tamborims, an
// agogô, a ganzá — and brass stabs with a samba whistle when the bateria is
// at full tilt.
//
// Per scene, `energy` decides what plays:
//   0  the nylon guitar alone, a few soft chords
//   1  + the cavaquinho, a soft surdo, a ganzá
//   2  + the caixa, tamborims, an agogô
//   3  + the full bateria (both surdos, the repique), brass stabs, a whistle
// Between scenes: the bar before a scene with more energy, a repique call
// and the whistle; the bar before a breakdown, the bateria stops dead on 1.
import { CHORD_NOTES, SR, addMono, biquad, buffer, echo, hz, mix, noise, normalize, rand } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

// plucked string (Karplus–Strong); `bright` 0..1
const pluck = (f, vel = 1, bright = 0.5, decay = 0.995) => {
  const n = Math.max(2, Math.round(SR / f));
  const buf = Float32Array.from({ length: n }, () => (rand() * 2 - 1) * vel);
  for (let k = 0; k < 2; k++) for (let i = 1; i < n; i++) buf[i] = buf[i] * bright + buf[i - 1] * (1 - bright);
  let i = 0;
  return () => {
    const v = buf[i];
    buf[i] = (v + buf[(i + 1) % n]) * 0.5 * decay;
    i = (i + 1) % n;
    return v;
  };
};
const surdo = (f = 55, vel = 1, muted = false) => (t) => Math.sin(2 * Math.PI * (f * t + (f * 0.4 / 12) * (1 - Math.exp(-12 * t)))) * Math.exp(-t * (muted ? 18 : 5)) * Math.min(1, t / 0.003) * vel;
const caixa = (vel = 1) => {
  const bp = biquad();
  return (t) => bp(noise(), "bp", 3800, 0.8) * Math.exp(-t * 35) * vel;
};
const tamborim = (vel = 1) => {
  const bp = biquad();
  return (t) => (Math.sin(2 * Math.PI * 820 * t) * 0.6 + bp(noise(), "bp", 2400, 1.2) * 0.5) * Math.exp(-t * 40) * vel;
};
const agogo = (f, vel = 1) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(2 * Math.PI * f * 2.7 * t)) * Math.exp(-t * 14) * vel;
const ganza = (vel = 1) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 6500) * Math.min(1, t / 0.008) * Math.exp(-t * 28) * vel;
};
const bassNote = (f, dur, vel = 1) => (t) => (Math.sin(2 * Math.PI * f * t) + 0.2 * Math.sin(4 * Math.PI * f * t)) * Math.exp(-t * 3) * Math.min(1, t / 0.006) * Math.min(1, (dur - t) / 0.03) * vel;
// brass stab: a few detuned saws through a fast-opening filter
const brass = (f, dur, vel = 1) => {
  const lp = biquad();
  const ph = [rand(), rand(), rand()];
  return (t) => {
    let s = 0;
    [1, 1.004, 0.996].forEach((d, k) => { ph[k] = (ph[k] + (f * d) / SR) % 1; s += 2 * ph[k] - 1; });
    const env = Math.min(1, t / 0.02) * Math.exp(-t * 4) * Math.min(1, (dur - t) / 0.03);
    return lp(s / 3, "lp", 600 + 3400 * Math.min(1, t / 0.05) * Math.exp(-t * 3), 0.9) * env * vel;
  };
};
// samba whistle (apito): a trilled two-tone whistle
const apito = (dur, vel = 1) => {
  let ph = 0;
  return (t) => {
    const f = 2900 + 300 * Math.sign(Math.sin(2 * Math.PI * 22 * t));
    ph = (ph + f / SR) % 1;
    return (Math.sin(2 * Math.PI * ph) + noise() * 0.1) * Math.min(1, t / 0.01) * Math.min(1, (dur - t) / 0.02) * vel;
  };
};

export const scoreSamba = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const len = songEnd + 3;
  const gtr = buffer(len), cav = buffer(len), perc = buffer(len), surd = buffer(len), bass = buffer(len), br = buffer(len), wh = buffer(len), pad = buffer(len);
  const nBars = Math.round(songEnd / BAR_S);
  const S = BEAT_S / 4; // a sixteenth
  const bars = Array.from({ length: nBars }, (_, b) => {
    const t = b * BAR_S;
    const k = sceneAt(t + 1e-4);
    const s = scenes[k], next = scenes[k + 1];
    const last = t + BAR_S >= s.end - 1e-4;
    return { t, chord: chordAt(t + 1e-4), energy: s.energy, build: last && next && next.energy > s.energy && next.energy >= 2, stop: last && next && next.energy === 0 && s.energy > 0 };
  });
  // the telecoteco: which sixteenths of the bar the cavaquinho strums (two beats, repeated)
  const TELE = [0, 3, 6, 10, 12, 15];
  const TAMB = [0, 2, 3, 5, 7, 8, 10, 11, 13, 15];

  bars.forEach((bar, b) => {
    const { t, energy, chord } = bar;
    const notes = CHORD_NOTES[chord];
    let root = notes[0] % 12 + 36; if (root < 38) root += 12;
    const tones = [...new Set(notes.map((n) => n % 12))].map((p) => { let m = p; while (m < 60) m += 12; return m; }).sort((a, z) => a - z);

    if (bar.stop) {
      addMono(surd, t, 1, surdo(55, 0.8));
      tones.forEach((m, i) => addMono(gtr, t + i * 0.03, 2.5, pluck(hz(m - 12), 0.5, 0.4, 0.998), 0.5, 0.5));
      return;
    }
    // nylon guitar: bass on the beats, chord on the off-sixteenths (bossa-ish)
    [0, 2].forEach((beat) => addMono(gtr, t + beat * BEAT_S, 1.2, pluck(hz(root + (beat ? 7 : 0)), 0.26, 0.35), 0.5, 0.5));
    [3, 6, 10, 13].forEach((s16) => tones.forEach((m, i) => addMono(gtr, t + s16 * S + i * 0.006, 0.7, pluck(hz(m - 12), 0.16, 0.45), 0.45, 0.55)));
    if (bar.build) {
      // repique call: rolls on the caixa getting louder, the whistle
      for (let i = 0; i < 16; i++) addMono(perc, t + i * S, 0.1, caixa(0.1 + 0.03 * i), 0.5, 0.5);
      [0, 1, 2].forEach((k) => addMono(wh, t + (2 + k * 0.5) * BEAT_S, 0.18, apito(0.18, 0.12)));
      addMono(wh, t + 3.5 * BEAT_S, 0.4, apito(0.4, 0.12));
      return;
    }
    if (energy >= 1) {
      // cavaquinho telecoteco, bright and short
      TELE.forEach((s16) => tones.forEach((m, i) => addMono(cav, t + s16 * S + i * 0.004, 0.18, pluck(hz(m + 12), 0.13, 0.75, 0.985), 0.6, 0.4)));
      for (let i = 0; i < 16; i++) addMono(perc, t + i * S, 0.08, ganza(i % 4 === 0 ? 0.14 : 0.07), 0.4, 0.6);
      // surdo de segunda answers on 1, muted touch before beat 2
      addMono(surd, t, 0.8, surdo(62, 0.45, true));
      addMono(surd, t + 2 * BEAT_S, 0.8, surdo(62, 0.45, true));
      [0, 2].forEach((beat) => addMono(bass, t + beat * BEAT_S, BEAT_S * 1.4, bassNote(hz(root - 12 + (beat ? 7 : 0)), BEAT_S * 1.4, 0.6)));
    }
    if (energy >= 2) {
      for (let i = 0; i < 16; i++) addMono(perc, t + i * S, 0.08, caixa(i % 4 === 2 ? 0.22 : 0.1), 0.55, 0.45);
      TAMB.forEach((s16) => addMono(perc, t + s16 * S, 0.08, tamborim(0.16), 0.3, 0.7));
      [[0, 880], [2, 660], [4, 660], [6, 880], [8, 880], [11, 660], [12, 660], [14, 880]].forEach(([s16, f]) => addMono(perc, t + s16 * S, 0.25, agogo(f, 0.07), 0.7, 0.3));
    }
    if (energy >= 3) {
      // the big surdo on 2 (the heartbeat of samba), the first on 1
      addMono(surd, t, 1, surdo(50, 0.5));
      addMono(surd, t + BEAT_S, 1, surdo(45, 0.65));
      addMono(surd, t + 2 * BEAT_S, 1, surdo(50, 0.5));
      addMono(surd, t + 3 * BEAT_S, 1, surdo(45, 0.65));
      // brass stabs on the syncopations, voiced from the chord
      [[0, 0.5], [3, 0.25], [6, 0.5], [10, 0.25], [12, 0.75]].forEach(([s16, d]) => tones.forEach((m) => addMono(br, t + s16 * S, d * BEAT_S, brass(hz(m), d * BEAT_S, 0.09), 0.5, 0.5)));
      if (b % 4 === 3) addMono(wh, t + 3 * BEAT_S, 0.5, apito(0.5, 0.1));
    }
  });

  renderPad(pad, { chordAt, levelAt: (t) => (scenes[sceneAt(t)].energy === 0 ? 0.004 : 0.002), cutoffAt: () => 900, xfade: 0.2 });
  echo(gtr, BEAT_S * 0.75 * 1000, 0.12);
  echo(br, BEAT_S * 0.5 * 1000, 0.15);

  const out = buffer(len);
  mix(out, gtr, 1.4);
  mix(out, cav, 1.5);
  mix(out, perc, 1.0);
  mix(out, surd, 0.3);
  mix(out, bass, 0.13);
  mix(out, br, 1.3);
  mix(out, wh, 0.6);
  mix(out, pad, 1);
  for (let i = 0; i < out[0].length; i++) {
    out[0][i] = Math.tanh(out[0][i]);
    out[1][i] = Math.tanh(out[1][i]);
  }
  fadeTail(out, songEnd);
  normalize(out, -1);
  return out;
};
