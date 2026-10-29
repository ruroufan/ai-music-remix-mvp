// Turns an episode's scenes + moods into a musical map: where every scene
// starts (in seconds), which chord plays in each bar, how hard each scene drives.
import { CHORD_NOTES, SR, SAW, TABLE_SIZE, biquad, hz } from "./lib.mjs";

const FALLBACK = ["Dm", "Bb", "Gm", "A"];

export const arrangement = (ep, tl, fps) => {
  const BEAT_S = 60 / ep.bpm;
  const BAR_S = BEAT_S * 4;
  const songEnd = tl.totalFrames / fps;
  const starts = tl.sceneOffsets.map((f) => f / fps);
  const scenes = ep.script.map((s, k) => {
    const mood = ep.moods[s.id] ?? { chord: FALLBACK[k % FALLBACK.length], energy: 1 };
    return { id: s.id, start: starts[k], end: starts[k + 1] ?? songEnd, prog: mood.chord.trim().split(/\s+/), energy: mood.energy };
  });
  for (const s of scenes) for (const c of s.prog) if (!CHORD_NOTES[c]) throw new Error(`Unknown chord "${c}" in scene ${s.id}`);
  const sceneAt = (t) => {
    let k = 0;
    for (let i = 0; i < scenes.length; i++) if (t >= scenes[i].start - 1e-6) k = i;
    return k;
  };
  // One chord per bar, cycling through the scene's progression.
  const chordAt = (t) => {
    const s = scenes[sceneAt(t)];
    const bar = Math.floor((t - s.start) / BAR_S + 1e-6);
    return s.prog[bar % s.prog.length];
  };
  return { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt };
};

// Detuned saw pad that follows chordAt(t), crossfading on chord changes.
export const renderPad = (out, { chordAt, levelAt, cutoffAt, xfade = 0.12 }) => {
  const [L, R] = out;
  const names = Object.keys(CHORD_NOTES);
  const chords = names.map((n) => CHORD_NOTES[n]);
  const index = Object.fromEntries(names.map((n, i) => [n, i]));
  const lpL = biquad(), lpR = biquad();
  const phases = new Float64Array(chords.length * 10);
  const blend = chords.map((_, i) => (i === index[chordAt(0)] ? 1 : 0));
  let target = index[chordAt(0)], level = levelAt(0), cutoff = cutoffAt(0);
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    if (i % 512 === 0) {
      target = index[chordAt(t)];
      level = levelAt(t);
      cutoff = cutoffAt(t);
    }
    for (let k = 0; k < blend.length; k++) blend[k] += ((k === target ? 1 : 0) - blend[k]) / (xfade * SR);
    let l = 0, r = 0;
    for (let k = 0; k < chords.length; k++) {
      if (blend[k] < 1e-4) continue;
      const chord = chords[k];
      for (let j = 0; j < chord.length; j++) {
        for (let d = 0; d < 2; d++) {
          const p = k * 10 + j * 2 + d;
          phases[p] = (phases[p] + hz(chord[j] + (d ? 0.11 : -0.11)) / SR) % 1;
          const s = SAW[(phases[p] * TABLE_SIZE) | 0] * blend[k] * (j === 0 ? 1.4 : 0.6);
          if (d) r += s; else l += s;
        }
      }
    }
    L[i] += lpL(l, "lp", cutoff) * level;
    R[i] += lpR(r, "lp", cutoff) * level;
  }
};
