import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { PathField, PersonFromAbove, Vertigo } from "../paths";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

// Line 0: from above, paths fork out around a person — one more ring of
// choices on every beat, and the person gets smaller.
// Line 1: the camera starts, very slightly, to turn.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  // the field grows in steps, one depth level per beat
  const draw = Math.min(1, Math.floor(frame / BEAT + 1) / 6 + interpolate(frame % BEAT, [0, 6], [-0.08, 0], { extrapolateRight: "clamp" }));
  const shrink = interpolate(frame, [0, cues[1]], [1.2, 0.7], { extrapolateRight: "clamp" });
  const spin = interpolate(frame, [cues[1], duration], [0, 25], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t });
  const strength = interpolate(frame, [cues[1], duration], [0, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulse = Math.max(0, 1 - (frame % BEAT) / 8);

  return (
    <ObsFrame duration={duration}>
      <Vertigo strength={strength} frame={frame} spin={spin}>
        <PathField cx={960} cy={500} draw={draw} pulse={pulse} />
        <PersonFromAbove x={960} y={500} size={70 * shrink} />
      </Vertigo>
      {[1, 2, 3, 4, 5].map((k) => (
        <Sfx key={k} name="glint" at={k * BEAT} volume={0.12 + k * 0.03} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
