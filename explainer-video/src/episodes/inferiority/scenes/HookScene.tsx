import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Horizon } from "../../../channels/backlit/parts";
import { Gilded, FloorShadow, LABELS } from "../gilded";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const FLOOR = 800;

// Line 0: a proud figure gets labelled, one gold sticker per beat — while the
// shadow on the floor is a small hunched shape.
// Line 1: push in on the chest; the label lifts and a lit crack shows underneath.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const labelAt = LABELS.map((_, i) => cues[0] + (i + 1) * BEAT);
  const labels = labelAt.map((t) => interpolate(frame, [t, t + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const shadow = useRamp(cues[0] + 2 * BEAT, 2 * BEAT);
  const push = interpolate(frame, [cues[1], duration], [1, 1.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t });
  const lift = useRamp(cues[1] + 2 * BEAT, BEAT);

  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${push})`, transformOrigin: `960px ${FLOOR - 290}px` }}>
        <Horizon y={FLOOR} />
        <FloorShadow x={960} floor={FLOOR} height={360} opacity={shadow * 0.9} />
        <Gilded x={960} bottom={FLOOR} height={420} labels={labels} peel={[0, lift * 0.18, 0, 0]} crack={lift} crackGlow={lift} frame={frame} />
      </div>

      {labelAt.map((t, i) => (
        <Sfx key={i} name="stamp" at={t} volume={0.28} />
      ))}
      <Sfx name="glint" at={cues[1] + 2 * BEAT} volume={0.3} />

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
