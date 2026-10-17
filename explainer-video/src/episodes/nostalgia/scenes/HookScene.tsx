import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FLOOR, Road, RoadLabels, Walker } from "../road";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

// He walks backwards along the road — facing the warm, sharp past on the
// left, stepping blindly into the grey fog on the right. One step per beat.
export const walkX = (frame: number, from: number, speed = 1.6) => from + frame * speed;
export const stride = (frame: number) => (frame / BEAT) * Math.PI + Math.PI / 2; // feet land on the beat

export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const labels = interpolate(frame, [cues[1], cues[1] + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <ObsFrame duration={duration}>
      <Road frame={frame} photos={interpolate(frame, [0, 3 * BEAT], [0, 1], { extrapolateRight: "clamp" })} />
      <Walker x={walkX(frame, 820)} bottom={FLOOR} face="left" walk={stride(frame)} lean={-3} />
      <RoadLabels opacity={labels} />
      {Array.from({ length: 11 }, (_, k) => (
        <Sfx key={k} name="step" at={(k + 1) * BEAT} volume={0.16} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
