import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Horizon } from "../../../channels/backlit/parts";
import { EndCard } from "../../../channels/backlit/EndCard";
import { Gilded, FloorShadow, LABELS } from "../gilded";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const FLOOR = 800;

// Line 0: the labels peel off, one per beat.
// Line 1: the cracks close and the light behind settles; the shadow stands up.
// Line 2: end card with the channel sign-off.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const peelAt = LABELS.map((_, i) => cues[0] + (i + 2) * BEAT);
  const peel = peelAt.map((t) => interpolate(frame, [t, t + BEAT * 1.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const heal = interpolate(frame, [cues[1], cues[1] + 6 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t * (3 - 2 * t) });
  const settled = frame >= cues[1] + 2 * BEAT;
  const stageOut = interpolate(frame, [cues[2] - 6, cues[2] + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const card = useRamp(cues[2], 12);

  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: stageOut }}>
        <Horizon y={FLOOR} />
        <FloorShadow x={960} floor={FLOOR} height={360} opacity={0.85 * (1 - heal)} pose="hunch" />
        <FloorShadow x={960} floor={FLOOR} height={420} opacity={0.85 * heal} pose="plain" />
        <Gilded
          x={960}
          bottom={FLOOR}
          height={420}
          pose={settled ? "plain" : "proud"}
          labels={[1, 1, 1, 1]}
          peel={peel}
          crack={1}
          crackGlow={heal > 0 && heal < 1 ? Math.sin(heal * Math.PI) : 0}
          heal={heal}
          glow={0.8 + heal * 0.5}
          frame={frame}
        />
      </div>
      <EndCard opacity={card} signoffAt={cues[2] + BEAT} />

      {peelAt.map((t, i) => (
        <Sfx key={i} name="whoosh" at={t} volume={0.22} />
      ))}
      <Sfx name="glint" at={cues[1]} volume={0.3} />
      <Sfx name="glint" at={cues[1] + 4 * BEAT} volume={0.25} />
      <Sfx name="boom" at={cues[2]} volume={0.45} />

      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
