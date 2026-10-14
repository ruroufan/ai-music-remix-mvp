import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../ObsFrame";
import { Backlit, Eyes } from "../parts";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const FLOOR = 900;

// A fixed, polite smile worn over the face.
const Mask: React.FC<{ x: number; y: number; opacity: number }> = ({ x, y, opacity }) => (
  <svg width={80} height={90} viewBox="0 0 80 90" style={{ position: "absolute", left: x - 40, top: y - 45, opacity }}>
    <ellipse cx="40" cy="45" rx="34" ry="42" fill="#e8eef2" />
    <path d="M18 36 q8 -6 16 0 M46 36 q8 -6 16 0" stroke="#06080c" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M20 58 q20 18 40 0" stroke="#06080c" strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>
);

// Line 0: someone frowns — and the person below shrinks and dims.
// Line 1: the most decent illness of our time: a polite mask.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const open = useRamp(0, BEAT);
  const frown = useRamp(cues[0] + 2 * BEAT, 6);
  const eyesOut = interpolate(frame, [cues[1] - 6, cues[1]], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const mask = useRamp(cues[1] + 2 * BEAT, 8);

  const shrink = 1 - frown * 0.08;
  const height = 230;

  return (
    <ObsFrame duration={duration}>
      <div style={{ opacity: eyesOut }}>
        <Eyes x={960} y={360} scale={0.95} open={open} frown={frown} id="hook" />
      </div>
      <div style={{ position: "absolute", inset: 0, transform: `scaleY(${shrink})`, transformOrigin: `960px ${FLOOR}px` }}>
        <Backlit x={960} bottom={FLOOR} height={height} glow={1 - frown * 0.65 + mask * 0.4} />
        <Mask x={960} y={FLOOR - height + 28} opacity={mask} />
      </div>

      <Sfx name="stamp" at={cues[0] + 2 * BEAT} volume={0.45} />
      <Sfx name="glint" at={cues[1] + 2 * BEAT} volume={0.3} />

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
