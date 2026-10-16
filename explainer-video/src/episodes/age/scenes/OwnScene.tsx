import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Walker } from "../../nostalgia/road";
import { Axis, AXIS_Y, OwnPath } from "../timeline";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

export const STEP = { x: 840, y: AXIS_Y + 130 };

// 0 · he slows to a walk, stops — and the timeline stops with him. He steps
//     down off it.
// 1 · where his foot lands, a path starts to grow: his own, lights opening along it.
export const OwnScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const slow = interpolate(frame, [0, 4 * BEAT], [1, 0], { extrapolateRight: "clamp" });
  const age = 29 + (frame < 4 * BEAT ? frame * 0.012 * slow : 4 * BEAT * 0.006);
  const stepAt = 6 * BEAT;
  const down = interpolate(frame, [stepAt, stepAt + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t * (3 - 2 * t) });
  const grow = interpolate(frame, [cues[1], cues[1] + 7 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => 1 - (1 - t) ** 2 });
  const fadeAxis = interpolate(frame, [stepAt, cues[1] + 2 * BEAT], [1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x = 760 + down * 80;
  const bottom = AXIS_Y + down * 130 - Math.sin(down * Math.PI) * 50;
  return (
    <ObsFrame duration={duration}>
      <Axis age={age} opacity={fadeAxis} blur={down * 2} />
      <OwnPath x0={STEP.x} y0={STEP.y} grow={grow} frame={frame} />
      <Walker x={x + grow * 30} bottom={bottom} height={230} face="right" walk={frame < 4 * BEAT ? (frame / HALF_BEAT) * Math.PI * slow : 0} lean={6 * slow} glow={0.7 + 0.6 * down} />
      <div style={{ position: "absolute", left: STEP.x + 640, top: STEP.y + 30, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 6, color: `rgb(${palette.halo})`, opacity: grow }}>只属于你的一生 →</div>
      <Sfx name="step" at={BEAT} volume={0.3} />
      <Sfx name="step" at={3 * BEAT} volume={0.2} />
      <Sfx name="step" at={stepAt + 6} volume={0.5} />
      <Sfx name="glint" at={cues[1]} volume={0.4} />
      <Sfx name="rise" at={cues[1] + BEAT} volume={0.25} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
