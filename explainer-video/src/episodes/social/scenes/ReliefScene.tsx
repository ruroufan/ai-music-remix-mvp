import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { useEpisode } from "../../../EpisodeContext";
import { keyLandsAt } from "../../../components/Kinetic";
import { Field } from "../lights";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// The same field. The lights start to flicker and weaken; one by one the
// people lift their heads a little. When 解脱 lands, a soft warm breath of
// light goes through.
export const ReliefScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const dim = interpolate(frame, [BEAT, 8 * BEAT], [1, 0.45], clamp);
  const keyAt = keyLandsAt(lines[0].text, BEAT);
  const breath = frame >= keyAt ? Math.exp(-(frame - keyAt) / 25) : 0;
  return (
    <ObsFrame duration={duration}>
      <Field frame={frame} on={(i) => dim * (0.9 + 0.1 * Math.sin(frame / 3 + i))} flicker={frame > 2 * BEAT ? 0.6 : 0} lift={(i) => interpolate(frame, [2 * BEAT + i * 6, 2 * BEAT + i * 6 + 20], [0, 0.85], clamp)} />
      {breath > 0.02 && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 60%, ${look.keyGlow}, transparent 70%)`, opacity: 0.45 * breath }} />}
      <Sfx name="rise" at={2 * BEAT} volume={0.3} />
      <Sfx name="glint" at={keyAt} volume={0.45} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
