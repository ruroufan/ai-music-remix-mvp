import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { Horizon } from "../../../channels/backlit/parts";
import { FallenMask, MaskedFigure, WallShadow } from "../mask";
import { MASK_REST } from "./ScaleScene";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const FLOOR = 800;

// 0 · the opening's front light again: he walks on, unmasked, and his shadow
//     on the wall is just his own size now. The mask stays on the floor.
// 1 · end card, with the channel sign-off.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const walk = interpolate(frame, [2 * BEAT, 8 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * (2 - t) });
  const x = 520 + walk * 520;
  const card = useRamp(cues[1], 12);
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - card * 0.75 }}>
        <div style={{ position: "absolute", left: 160, top: 110, width: 1600, height: FLOOR - 110, background: "radial-gradient(ellipse at 50% 85%, rgba(255,214,170,0.14), rgba(14,19,28,0.9) 65%)" }} />
        <Horizon y={FLOOR} />
        <WallShadow x={x + 40} bottom={FLOOR - 30} height={262} pose="plain" opacity={0.7} />
        <FallenMask x={MASK_REST.x} floor={MASK_REST.floor} opacity={1 - walk * 0.5} />
        <MaskedFigure x={x} bottom={FLOOR} height={270} mask={0} fall={1} glow={1.1} />
      </div>
      <EndCard opacity={card} signoffAt={cues[1] + BEAT} />
      <Sfx name="step" at={2 * BEAT} volume={0.4} />
      <Sfx name="step" at={4 * BEAT} volume={0.35} />
      <Sfx name="step" at={6 * BEAT} volume={0.3} />
      <Sfx name="glint" at={cues[1]} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[1]} />
    </ObsFrame>
  );
};
