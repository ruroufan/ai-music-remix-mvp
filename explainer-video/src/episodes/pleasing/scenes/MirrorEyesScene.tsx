import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Backlit, Eyes } from "../../../channels/backlit/parts";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const FLOOR = 900;

// Line 0: the frown again (callback to the hook).
// Line 1: their eyes are your mirror — the irises fill with a tiny you, and we push in.
export const MirrorEyesScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const open = useRamp(0, 8);
  const frown = useRamp(cues[0] + BEAT, 5);
  const mirror = useRamp(cues[1] + BEAT, BEAT);
  const push = interpolate(frame, [cues[1], duration], [1, 1.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const personOut = interpolate(frame, [cues[1], cues[1] + BEAT], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${push})`, transformOrigin: "960px 380px" }}>
        <Eyes x={960} y={380} open={open} frown={frown} mirror={mirror} id="me" />
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: personOut, transform: `scaleY(${1 - frown * 0.08})`, transformOrigin: `960px ${FLOOR}px` }}>
        <Backlit x={960} bottom={FLOOR} height={220} glow={1 - frown * 0.65} />
      </div>

      <Sfx name="stamp" at={cues[0] + BEAT} volume={0.45} />
      <Sfx name="glint" at={cues[1] + BEAT} volume={0.35} />
      <Sfx name="rise" at={duration - 3 * BEAT} volume={0.3} />

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
