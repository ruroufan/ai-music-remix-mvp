// Pure timing maths shared by the video and the Node scripts (no React here).
//
// Everything sits on a musical grid: every subtitle starts on a beat and every
// scene starts on a bar, so cuts and hits land on the music ("踩点").
import { FPS } from "./theme.ts";
import { script, type Line, type SceneSpec } from "./script.ts";
import { voiceover } from "./voiceover.generated.ts";

// 72 BPM at 30 fps = exactly 25 frames per beat, so the grid never drifts.
export const BPM = 72;
export const BEAT = Math.round((FPS * 60) / BPM);
export const BAR = BEAT * 4;
export const HALF_BEAT = BEAT / 2;

// Snap a frame offset to the nearest half beat.
export const onBeat = (frames: number) => Math.round(Math.round(frames / HALF_BEAT) * HALF_BEAT);

// Silence after each spoken line before the next one starts (voiceover only).
export const PAUSE_AFTER_VOICE = 0.45;
// Voice starts this long after its subtitle fades in.
export const VOICE_DELAY = 0.15;

// How long a subtitle needs on screen to be read comfortably.
const READ_CHARS_PER_SEC = 7;
const READ_PADDING = 0.8;
const MIN_BEATS = 3;
export const readSeconds = (line: Line) =>
  READ_PADDING + line.text.replace(/[\s【】，。：？！、——]/g, "").length / READ_CHARS_PER_SEC;

export const sec = (s: number) => Math.round(s * FPS);

export const lineKey = (sceneId: string, index: number) => `${sceneId}-${index}`;

// Unsnapped length of a line: the longest of its minimum hold (`seconds`), the
// time needed to read it, and its voiceover clip if there is one.
export const lineSeconds = (sceneId: string, index: number, line: Line) => {
  const clip = voiceover[lineKey(sceneId, index)];
  return Math.max(line.seconds ?? 0, readSeconds(line), clip ? VOICE_DELAY + clip.seconds + PAUSE_AFTER_VOICE : 0);
};

// Start frame (scene-local) of every line, plus the scene end. Lines are
// rounded up to whole beats; the last line stretches so every scene starts on
// a beat 1 or beat 3 (half bars).
export const lineStarts = (scene: SceneSpec) => {
  const starts: number[] = [];
  let t = 0;
  scene.lines.forEach((l, i) => {
    starts.push(t);
    t += Math.max(MIN_BEATS, Math.ceil(sec(lineSeconds(scene.id, i, l)) / BEAT)) * BEAT;
  });
  return { starts, end: Math.ceil(t / (BAR / 2)) * (BAR / 2) };
};

export const sceneFrames = (scene: SceneSpec) => lineStarts(scene).end;

export const totalFrames = script.reduce((sum, s) => sum + sceneFrames(s), 0);

export const hasVoiceover = Object.keys(voiceover).length > 0;

// Absolute [from, to) frame ranges where narration is audible — used to duck the music.
export const voiceRanges = () => {
  const ranges: [number, number][] = [];
  let offset = 0;
  for (const scene of script) {
    const { starts, end } = lineStarts(scene);
    scene.lines.forEach((_, i) => {
      const clip = voiceover[lineKey(scene.id, i)];
      if (!clip) return;
      const from = offset + starts[i] + sec(VOICE_DELAY);
      ranges.push([from, from + sec(clip.seconds)]);
    });
    offset += end;
  }
  return ranges;
};
