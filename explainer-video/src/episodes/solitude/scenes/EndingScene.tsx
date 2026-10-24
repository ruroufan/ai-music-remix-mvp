import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { WindowSeat } from "../porcupine";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// 0 · alone at the window, snow outside. His broken, see-through outline
//     closes up and lights — sharp again.
// 1 · end card over the window seat, with the channel sign-off.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const solid = interpolate(frame, [2 * BEAT, 7 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t * (3 - 2 * t) });
  const card = useRamp(cues[1], 12);
  return (
    <ObsFrame duration={duration}>
      <WindowSeat frame={frame} solid={solid} opacity={1 - card * 0.7} />
      <EndCard opacity={card} signoffAt={cues[1] + BEAT} />
      <Sfx name="glint" at={7 * BEAT} volume={0.4} />
      <Sfx name="glint" at={cues[1]} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[1]} />
    </ObsFrame>
  );
};
