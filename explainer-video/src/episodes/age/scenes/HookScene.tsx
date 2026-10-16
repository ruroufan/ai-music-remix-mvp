import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Walker } from "../../nostalgia/road";
import { AXIS_Y, Axis, SpeedLines } from "../timeline";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

// Running along the timeline; other people's milestones whip past overhead.
// The age counter in the corner keeps ticking — and in the second line it
// speeds up.
export const ageAt = (frame: number, from: number, rate: number) => from + frame * rate;
export const Runner: React.FC<{ frame: number; x?: number; speed?: number; glow?: number; bottom?: number }> = ({ frame, x = 760, speed = 1, glow = 0.8, bottom = AXIS_Y }) => (
  <Walker x={x} bottom={bottom - 3} height={230} face="right" walk={(frame / HALF_BEAT) * Math.PI * speed} lean={6 + 4 * speed} glow={glow} />
);

export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const fast = interpolate(frame, [cues[1], cues[1] + 2 * BEAT], [1, 2.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const age = 22.5 + (frame < cues[1] ? frame * 0.012 : cues[1] * 0.012 + (frame - cues[1]) * 0.012 * fast);
  return (
    <ObsFrame duration={duration}>
      <SpeedLines frame={frame} speed={12 * fast} />
      <Axis age={age} />
      <Runner frame={frame} speed={fast} />
      <div style={{ position: "absolute", right: 170, top: 150, textAlign: "right", fontFamily: fonts.mono }}>
        <div style={{ fontSize: 20, letterSpacing: 6, color: palette.dim }}>AGE</div>
        <div style={{ fontSize: 96, fontWeight: 700, color: age >= 25 ? palette.alert : palette.ink }}>{age.toFixed(1)}</div>
      </div>
      {Array.from({ length: 24 }, (_, k) => (
        <Sfx key={k} name="step" at={k * HALF_BEAT + HALF_BEAT} volume={0.1} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
