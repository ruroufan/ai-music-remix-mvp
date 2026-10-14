// Pure timing maths shared by the video and the Node scripts (no React here).
//
// Everything sits on a musical grid: every subtitle starts on a beat and every
// scene starts on a bar line, so cuts and hits land on the music ("踩点").
import { FPS } from "./theme.ts";
import type { Line, SceneSpec, TimingOptions } from "./types.ts";
import { voiceover } from "./voiceover.generated.ts";

// Silence after each spoken line before the next one starts (voiceover only).
export const PAUSE_AFTER_VOICE = 0.45;
// Voice starts this long after its subtitle fades in.
export const VOICE_DELAY = 0.15;

export const sec = (s: number) => Math.round(s * FPS);
export const lineKey = (sceneId: string, index: number) => `${sceneId}-${index}`;

export const createTimeline = (script: SceneSpec[], bpm: number, opts: TimingOptions = {}) => {
  const { readCharsPerSec = 7, readPadding = 0.8, minSeconds = 2.4, sceneUnitBeats = 4 } = opts;
  // Pick tempos that divide the frame rate evenly (30 fps: 72, 90, 100, 120 BPM…)
  // so the grid never drifts.
  const BEAT = (FPS * 60) / bpm;
  if (!Number.isInteger(BEAT)) throw new Error(`${bpm} BPM is not a whole number of frames per beat at ${FPS} fps`);
  const HALF_BEAT = BEAT / 2;
  const BAR = BEAT * 4;

  // Snap a frame offset to the nearest half beat.
  const onBeat = (frames: number) => Math.round(Math.round(frames / HALF_BEAT) * HALF_BEAT);

  // How long a subtitle needs on screen to be read comfortably.
  const readSeconds = (line: Line) =>
    readPadding + line.text.replace(/[\s【】，。：？！、——“”]/g, "").length / readCharsPerSec;

  // Unsnapped length of a line: its forced hold, the time needed to read it,
  // and its voiceover clip if there is one — whichever is longest.
  const lineSeconds = (sceneId: string, index: number, line: Line) => {
    const clip = voiceover[lineKey(sceneId, index)];
    return Math.max(
      minSeconds,
      line.seconds ?? 0,
      readSeconds(line),
      clip ? VOICE_DELAY + clip.seconds + PAUSE_AFTER_VOICE : 0,
    );
  };

  // Start frame (scene-local) of every line, plus the scene end. Lines are
  // rounded up to whole beats; the last line stretches so every scene starts
  // on the grid unit (a bar by default).
  const lineStarts = (scene: SceneSpec) => {
    const starts: number[] = [];
    let t = 0;
    scene.lines.forEach((l, i) => {
      starts.push(t);
      t += Math.ceil(sec(lineSeconds(scene.id, i, l)) / BEAT) * BEAT;
    });
    const unit = BEAT * sceneUnitBeats;
    return { starts, end: Math.ceil(t / unit) * unit };
  };

  const sceneFrames = (scene: SceneSpec) => lineStarts(scene).end;
  const sceneOffsets = script.reduce<number[]>((acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + sceneFrames(script[i - 1])], []);
  const totalFrames = script.reduce((sum, s) => sum + sceneFrames(s), 0);
  const hasVoiceover = script.some((s) => s.lines.some((_, i) => voiceover[lineKey(s.id, i)]));

  // Absolute [from, to) frame ranges where narration is audible — used to duck the music.
  const voiceRanges = () => {
    const ranges: [number, number][] = [];
    script.forEach((scene, k) => {
      const { starts } = lineStarts(scene);
      scene.lines.forEach((_, i) => {
        const clip = voiceover[lineKey(scene.id, i)];
        if (!clip) return;
        const from = sceneOffsets[k] + starts[i] + sec(VOICE_DELAY);
        ranges.push([from, from + sec(clip.seconds)]);
      });
    });
    return ranges;
  };

  return { bpm, BEAT, HALF_BEAT, BAR, onBeat, readSeconds, lineSeconds, lineStarts, sceneFrames, sceneOffsets, totalFrames, hasVoiceover, voiceRanges };
};

export type Timeline = ReturnType<typeof createTimeline>;
