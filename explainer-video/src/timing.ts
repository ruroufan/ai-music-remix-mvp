import { useCurrentFrame, interpolate } from "remotion";
import { FPS } from "./theme";
import type { Line, SceneSpec } from "./script";

export const sec = (s: number) => Math.round(s * FPS);

export const sceneFrames = (scene: SceneSpec) =>
  scene.lines.reduce((sum, l) => sum + sec(l.seconds), 0);

// Start frame (scene-local) of every line, plus the scene end.
export const lineStarts = (lines: Line[]) => {
  const starts: number[] = [];
  let t = 0;
  for (const l of lines) {
    starts.push(t);
    t += sec(l.seconds);
  }
  return { starts, end: t };
};

export type SceneProps = { lines: Line[]; cues: number[]; duration: number };

// 0 → 1 over `len` frames starting at `start`, clamped, eased.
export const useRamp = (start: number, len = 18) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [start, start + len], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
};
