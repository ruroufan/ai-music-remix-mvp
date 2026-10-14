import { useCurrentFrame, interpolate } from "remotion";
import type { Line } from "./script";

export { sec } from "./timeline";

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
