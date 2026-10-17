// "drive": a tense, beat-driven score for a fast-cut episode (used by 《讨好》).
//
// Per scene, `energy` decides what plays:
//   0  pad + drone (+ a soft sub heartbeat) — breakdowns and the ending
//   1  + pulsing 8th-note bass, closed hats, sub on the downbeat
//   2  + kick pattern, clap/snare on 2 and 4, 16th hats, crash on the downbeat
//   3  + 16th-note pluck arpeggio and open hats
// Between scenes: the bar before a scene with more energy is a build (snare
// roll + noise riser, kick drops out); the beat before a breakdown is a stop.
// The bass and pad duck under every kick (side-chain pumping).
import { CHORD_NOTES, SAW, SQUARE, SR, TABLE_SIZE, addMono, biquad, buffer, echo, hz, mix, noise, normalize } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";
import { fadeTail } from "./score-ambient.mjs";

// ---- drum voices (each returns a sample function of t seconds) ----
const kick = (vel = 1) => {
  return (t) =>
    (Math.sin(2 * Math.PI * (45 * t + (110 / 26) * (1 - Math.exp(-26 * t)))) * Math.exp(-t * 7) + noise() * Math.exp(-t * 400) * 0.25) * vel;
};
const snare = (vel = 1, pitch = 185) => {
  const bp = biquad();
  return (t) => (Math.sin(2 * Math.PI * pitch * t) * Math.exp(-t * 20) * 0.5 + bp(noise(), "bp", 2100, 0.7) * Math.exp(-t * 13) * 1.1) * vel;
};
const clap = (vel = 1) => {
  const bp = biquad();
  return (t) => {
    const bursts = [0, 0.011, 0.023].reduce((a, o) => a + (t >= o ? Math.exp(-(t - o) * 180) : 0), 0);
    return bp(noise(), "bp", 1300, 0.9) * (bursts * 0.6 + Math.exp(-t * 11) * 0.7) * vel;
  };
};
const hat = (vel = 1, open = false) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 7500) * Math.exp(-t * (open ? 9 : 70)) * vel;
};
const crash = (vel = 1) => {
  const hp = biquad();
  return (t) => hp(noise(), "hp", 3500) * Math.exp(-t * 1.8) * vel;
};

// Kick placements per bar, in 16ths.
const KICKS = { 2: [0, 6, 8], 3: [0, 6, 8, 11, 14] };

export const scoreDrive = (ep, tl, fps) => {
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arrangement(ep, tl, fps);
  const S16 = BEAT_S / 4;
  const len = songEnd + 3;
  const drums = buffer(len), bass = buffer(len), pad = buffer(len), arp = buffer(len), fx = buffer(len), snareBus = buffer(len);
  const nBars = Math.round(songEnd / BAR_S);

  // Per-bar plan.
  const bars = Array.from({ length: nBars }, (_, b) => {
    const t = b * BAR_S;
    const k = sceneAt(t + 1e-4);
    const s = scenes[k];
    const next = scenes[k + 1];
    const last = t + BAR_S >= s.end - 1e-4;
    return {
      t,
      chord: chordAt(t + 1e-4),
      energy: s.energy,
      first: Math.abs(t - s.start) < 1e-4,
      build: last && next && next.energy > s.energy && next.energy >= 2,
      stop: last && next && next.energy === 0 && s.energy > 0,
    };
  });

  // Side-chain envelope: 1 normally, dips after every kick.
  const duck = new Float32Array(Math.ceil(len * SR)).fill(1);
  const addKick = (t0, vel) => {
    addMono(drums, t0, 0.5, kick(vel));
    const s0 = Math.round(t0 * SR);
    for (let i = 0; i < 0.3 * SR && s0 + i < duck.length; i++) duck[s0 + i] = Math.min(duck[s0 + i], 1 - 0.7 * Math.exp(-(i / SR) / 0.08));
  };

  bars.forEach((bar, b) => {
    const { t, energy } = bar;
    const steps = bar.stop ? 12 : 16; // a stop silences the last beat
    const buildKickCut = bar.build ? 8 : 16; // builds drop the kick for the second half

    // --- drums
    if (energy >= 2) {
      if (bar.first) addMono(drums, t, 3, crash(0.5));
      for (const i of KICKS[Math.min(3, energy)]) if (i < Math.min(steps, buildKickCut)) addKick(t + i * S16, i === 0 ? 1 : 0.8);
      for (const i of [4, 12]) if (i < steps && !(bar.build && i === 12)) {
        addMono(snareBus, t + i * S16, 0.5, snare(0.75));
        addMono(snareBus, t + i * S16, 0.4, clap(0.55));
      }
    } else if (energy === 1 && !bar.build) {
      addKick(t, 0.55); // just a downbeat thump
    }
    if (energy >= 1) {
      for (let i = 0; i < steps; i++) {
        const sixteenth = energy >= 2;
        if (!sixteenth && i % 2) continue;
        const accent = i % 4 === 0 ? 1 : i % 2 === 0 ? 0.7 : 0.45;
        const pan = 0.35 + 0.3 * ((i / 2) % 2);
        addMono(drums, t + i * S16, 0.1, hat(0.22 * accent), 1 - pan, pan);
        if (energy >= 3 && i % 4 === 2) addMono(drums, t + i * S16, 0.4, hat(0.13, true), pan, 1 - pan);
      }
    } else {
      // breakdown heartbeat: two soft sub thumps per bar
      for (const [o, v] of [[0, 0.5], [0.22, 0.32]]) addMono(drums, t + o, 0.4, (x) => Math.sin(2 * Math.PI * (48 + 30 * Math.exp(-x * 30)) * x) * Math.exp(-x * 12) * v);
    }

    // --- build into the next scene: snare roll (8ths → 16ths → 32nds) + riser
    if (bar.build) {
      const hits = [];
      for (let i = 0; i < 4; i++) hits.push(i * 2 * S16); // beats 1–2: 8ths
      for (let i = 0; i < 4; i++) hits.push(2 * BEAT_S + i * S16); // beat 3: 16ths
      for (let i = 0; i < 8; i++) hits.push(3 * BEAT_S + i * (S16 / 2)); // beat 4: 32nds
      hits.forEach((o, k) => addMono(snareBus, t + o, 0.3, snare(0.25 + 0.6 * (k / hits.length), 185 + 120 * (k / hits.length))));
      const bp = biquad();
      addMono(fx, t, BAR_S, (x) => {
        const k = x / BAR_S;
        return bp(noise(), "bp", 300 + 6000 * k * k, 2.5) * k * k * 1.2;
      });
    }
    // --- stop before a breakdown: a reversed swell into silence
    if (bar.stop) {
      const bp = biquad();
      addMono(fx, t + 2 * BEAT_S, BEAT_S, (x) => bp(noise(), "bp", 2500, 1) * (x / BEAT_S) ** 2 * 0.9);
    }

    // --- bass: 8th-note pulse on the root, gritty, filtered by its envelope
    if (energy >= 1) {
      const root = CHORD_NOTES[bar.chord][0];
      const f = hz(root < 33 ? root + 12 : root);
      const notes = bar.stop ? 6 : 8;
      for (let i = 0; i < notes; i++) {
        const lp = biquad();
        let p1 = 0, p2 = 0;
        const octave = energy >= 2 && i % 4 === 3 ? 2 : 1; // octave jump on the "and" of 2 and 4
        addMono(bass, t + i * 2 * S16, 2 * S16, (x) => {
          p1 = (p1 + (f * octave) / SR) % 1;
          p2 = (p2 + (f * octave * 1.006) / SR) % 1;
          const env = Math.min(1, x / 0.004) * Math.exp(-x * 6);
          const raw = SAW[(p1 * TABLE_SIZE) | 0] + SAW[(p2 * TABLE_SIZE) | 0] + Math.sin(2 * Math.PI * f * x) * 1.2;
          return Math.tanh(lp(raw, "lp", 180 + 1400 * env * (0.4 + energy * 0.2)) * 1.8) * env;
        });
      }
    }

    // --- arp: 16th-note plucks over the chord, up and down
    if (energy >= 3) {
      const tones = [...new Set(CHORD_NOTES[bar.chord].map((n) => { let m = n; while (m < 57) m += 12; return m; }))].sort((a, z) => a - z);
      const run = [...tones, tones[0] + 12, tones[1] + 12];
      const pattern = [0, 1, 2, 3, 4, 3, 2, 1];
      for (let i = 0; i < steps; i++) {
        const note = run[pattern[i % pattern.length] % run.length];
        const f = hz(note);
        const lp = biquad();
        let ph = 0;
        const bright = 0.5 + 0.5 * ((b % 4) / 3); // opens up across each phrase
        addMono(arp, t + i * S16, 0.22, (x) => {
          ph = (ph + f / SR) % 1;
          const env = Math.exp(-x * 16);
          return lp(SQUARE[(ph * TABLE_SIZE) | 0], "lp", 600 + 3500 * env * bright) * env;
        }, i % 2 ? 0.6 : 1, i % 2 ? 1 : 0.6);
      }
    }
  });

  // Pad + drone under everything; louder and darker when the drums are out.
  renderPad(pad, {
    chordAt,
    levelAt: (t) => (scenes[sceneAt(t)].energy === 0 ? 0.09 : 0.05),
    cutoffAt: (t) => 500 + 260 * scenes[sceneAt(t)].energy + 150 * Math.sin(t * 0.2),
    xfade: 0.05,
  });
  for (let i = 0; i < pad[0].length; i++) {
    const t = i / SR;
    const v = (Math.sin(2 * Math.PI * 659.25 * t) + 0.6 * Math.sin(2 * Math.PI * 880 * t)) * (0.01 + 0.004 * Math.sin(t * 1.3));
    pad[0][i] += v;
    pad[1][i] += v * 0.8;
  }

  // Side-chain the tonal layers to the kick, add space, and mix.
  for (const buf of [bass, pad, arp]) for (let i = 0; i < buf[0].length && i < duck.length; i++) { buf[0][i] *= duck[i]; buf[1][i] *= duck[i]; }
  echo(arp, BEAT_S * 0.75 * 1000, 0.32); // dotted-eighth ping-pong
  echo(snareBus, 95, 0.22); // short room on the snare/clap

  const out = buffer(len);
  mix(out, drums, 1);
  mix(out, snareBus, 0.85);
  mix(out, bass, 0.34);
  mix(out, pad, 1);
  mix(out, arp, 0.16);
  mix(out, fx, 0.32);
  // gentle bus saturation glues it together
  for (let i = 0; i < out[0].length; i++) { out[0][i] = Math.tanh(out[0][i] * 1.1); out[1][i] = Math.tanh(out[1][i] * 1.1); }

  fadeTail(out, songEnd);
  normalize(out, -1);
  return out;
};
