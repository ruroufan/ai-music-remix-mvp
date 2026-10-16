import { interpolate } from "remotion";
// 0 → 1 between frames a and b (clamped)
export const ramp = (frame: number, a: number, b: number) => interpolate(frame, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
