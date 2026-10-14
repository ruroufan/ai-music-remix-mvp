import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { Backlit, Eyes, Horizon } from "../../../channels/backlit/parts";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const FLOOR = 840;

// Line 0: you live inside their eyes… they close, and you step out onto the floor.
// Line 1: a gaze passes by — it is only a line of light.
// Line 2: end card with the channel sign-off.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const close = interpolate(frame, [cues[0] + 2 * BEAT, cues[0] + 4 * BEAT], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const out = useRamp(cues[0] + 3 * BEAT, 2 * BEAT);
  const beam = interpolate(frame, [cues[1] + BEAT, cues[1] + 5 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const card = useRamp(cues[2], 12);
  const stageOut = interpolate(frame, [cues[2] - 6, cues[2] + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: stageOut }}>
        <div style={{ opacity: close }}>
          <Eyes x={960} y={420} scale={1.1} open={Math.max(0.02, close)} mirror={1} id="end" />
        </div>
        <div style={{ position: "absolute", inset: 0, opacity: out }}>
          <Horizon y={FLOOR} />
          <Backlit x={960} bottom={FLOOR} height={260} glow={0.8 + out * 0.4} />
        </div>
        {/* a gaze crossing the frame — harmless, just light */}
        <div style={{ position: "absolute", left: -200 + beam * 2400, top: FLOOR - 190, width: 360, height: 2, background: `linear-gradient(90deg, transparent, rgba(232,238,242,0.8), transparent)`, opacity: beam > 0 && beam < 1 ? 1 : 0 }} />
      </div>

      <EndCard opacity={card} signoffAt={cues[2] + 4} />

      <Sfx name="whoosh" at={cues[0] + 3 * BEAT} volume={0.3} />
      <Sfx name="glint" at={cues[1] + BEAT} volume={0.3} />
      <Sfx name="boom" at={cues[2]} volume={0.5} />

      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
