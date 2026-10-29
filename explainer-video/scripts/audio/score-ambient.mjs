// "ambient": a slow, dark bed for a reflective episode (used by 《傲慢》).
// Pad, high drone, a sub note per bar, a soft kick/tick pulse where energy > 0,
// a two-beat piano arpeggio, and a riser into every cut.
import { CHORD_NOTES, SR, addMono, biquad, buffer, echo, hz, noise, normalize, pianoNote } from "./lib.mjs";
import { arrangement, renderPad } from "./arrange.mjs";

export const scoreAmbient = (ep, tl, fps) => {
  const arr = arrangement(ep, tl, fps);
  const { BEAT_S, BAR_S, songEnd, scenes, sceneAt, chordAt } = arr;
  const out = buffer(songEnd + 3);
  const [L, R] = out;

  // 1. Pad; its filter opens a little on every beat, so it breathes in time.
  renderPad(out, {
    chordAt,
    levelAt: () => 0.07,
    cutoffAt: (t) => 480 + 220 * Math.exp(-((t % BEAT_S) / BEAT_S) * 4) + 120 * Math.sin(t * 0.13),
  });

  // 2. A thin high drone (A4 + D5), slowly shimmering.
  for (let i = 0; i < L.length; i++) {
    const t = i / SR;
    const v = (Math.sin(2 * Math.PI * 440 * t) + 0.7 * Math.sin(2 * Math.PI * 587.33 * t)) * (0.012 + 0.005 * Math.sin(t * 0.9));
    L[i] += v * (1 + 0.3 * Math.sin(t * 0.5));
    R[i] += v * (1 - 0.3 * Math.sin(t * 0.5));
  }

  const keys = buffer(songEnd + 3);
  for (let b = 0; b * BEAT_S < songEnd; b++) {
    const t0 = b * BEAT_S;
    const scene = scenes[sceneAt(t0 + 1e-3)];
    const chord = CHORD_NOTES[chordAt(t0 + 1e-3)];
    const pulse = scene.energy > 0;
    const beatInBar = b % 4;

    // 3. Sub bass: the chord root on every downbeat, ringing through the bar.
    if (beatInBar === 0) {
      const f = hz(chord[0] < 33 ? chord[0] + 12 : chord[0]);
      addMono(out, t0, BAR_S, (t) => Math.sin(2 * Math.PI * f * t) * Math.min(1, t / 0.02) * Math.exp(-t * 1.1) * (pulse ? 0.35 : 0.22));
    }
    // 4. Rhythm: soft kick on 1 and 3, a ticking clock on every beat.
    if (pulse) {
      if (beatInBar === 0 || beatInBar === 2) {
        addMono(out, t0, 0.4, (t) => Math.sin(2 * Math.PI * (46 + 40 * Math.exp(-t * 35)) * t) * Math.exp(-t * 12) * (beatInBar === 0 ? 0.45 : 0.3));
      }
      const hp = biquad();
      addMono(out, t0, 0.06, (t) => hp(noise(), "hp", 6500) * Math.exp(-t * 90) * (beatInBar === 0 ? 0.16 : 0.1));
    }
    // 5. Piano: the chord's upper notes, one every two beats.
    if (b % 2 === 0) {
      const upper = chord.map((n) => n + 24).filter((n) => n >= 62 && n <= 84);
      pianoNote(keys, t0, upper[(b / 2) % upper.length], 0.085, 0.35 + 0.3 * ((b / 2) % 2));
    }
  }
  echo(keys, BEAT_S * 750, 0.3); // dotted-eighth echo, in time with the tempo
  for (let i = 0; i < L.length; i++) { L[i] += keys[0][i]; R[i] += keys[1][i]; }

  // 6. A riser over the last two beats before every scene change.
  scenes.slice(1).forEach((s) => {
    const dur = 2 * BEAT_S, bp = biquad();
    addMono(out, s.start - dur, dur, (t) => {
      const k = t / dur;
      return bp(noise(), "bp", 400 + 5000 * k * k, 2) * k * k * 0.35;
    });
  });

  fadeTail(out, songEnd);
  normalize(out, -1);
  return out;
};

export const fadeTail = ([L, R], from) => {
  const s = Math.round(from * SR), n = L.length - s;
  for (let i = 0; i < n; i++) { const g = 1 - i / n; L[s + i] *= g; R[s + i] *= g; }
};
