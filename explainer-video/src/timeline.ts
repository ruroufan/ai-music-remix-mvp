// Pure timing maths shared by the video and the Node scripts (no React here).
import { FPS } from "./theme.ts";
import { script, type Line, type SceneSpec } from "./script.ts";
import { voiceover } from "./voiceover.generated.ts";

// Silence after each spoken line before the next one starts.
export const PAUSE_AFTER_VOICE = 0.45;
// Voice starts this long after its subtitle fades in.
export const VOICE_DELAY = 0.15;

export const sec = (s: number) => Math.round(s * FPS);

export const lineKey = (sceneId: string, index: number) => `${sceneId}-${index}`;

// `seconds` in script.ts is the minimum hold; a longer voiceover clip wins.
export const lineSeconds = (sceneId: string, index: number, line: Line) => {
  const clip = voiceover[lineKey(sceneId, index)];
  return clip ? Math.max(line.seconds, VOICE_DELAY + clip.seconds + PAUSE_AFTER_VOICE) : line.seconds;
};

// Start frame (scene-local) of every line, plus the scene end.
export const lineStarts = (scene: SceneSpec) => {
  const starts: number[] = [];
  let t = 0;
  scene.lines.forEach((l, i) => {
    starts.push(t);
    t += sec(lineSeconds(scene.id, i, l));
  });
  return { starts, end: t };
};

export const sceneFrames = (scene: SceneSpec) => lineStarts(scene).end;

export const totalFrames = script.reduce((sum, s) => sum + sceneFrames(s), 0);

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
