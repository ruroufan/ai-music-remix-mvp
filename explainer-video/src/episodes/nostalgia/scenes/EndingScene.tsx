import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { palette } from "../../../channels/backlit/look";
import { FLOOR, Road, Walker } from "../road";
import { stride } from "./HookScene";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// 0 · he slows, stops, takes one more look back at the warm road.
// 1 · he turns round to face the fog. Faint frames appear in it: photos not taken yet.
// 2 · the fog starts to glow, warm, from inside; he walks into it, forwards.
// 3 · end card, with the channel sign-off.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const slow = interpolate(frame, [0, 4 * BEAT], [1, 0], { extrapolateRight: "clamp" });
  const x0 = 900 + Math.min(frame, 4 * BEAT) * 1.6 * 0.5;
  const turnAt = cues[1] + 2 * BEAT;
  const turned = frame >= turnAt;
  const future = interpolate(frame, [turnAt, cues[2]], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const light = interpolate(frame, [cues[2], cues[3] + 2 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t * (3 - 2 * t) });
  const go = Math.max(0, frame - cues[2]);
  const x = x0 + go * 2.2;
  const card = useRamp(cues[3], 12);
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - card * 0.7 }}>
        <Road frame={frame} future={future} light={light} />
        <Walker
          x={x}
          bottom={FLOOR}
          face={turned ? "right" : "left"}
          walk={turned ? (go > 0 ? stride(go) : 0) : stride(frame) * slow}
          lean={turned ? 3 * Math.min(1, go / 10) : -3 * slow}
          glow={0.7 + light * 0.6}
          rgb={turned ? "255, 200, 130" : palette.halo}
        />
      </div>
      <EndCard opacity={card} signoffAt={cues[3] + BEAT} />
      {[1, 2, 3].map((k) => (
        <Sfx key={k} name="step" at={k * BEAT} volume={0.18 - k * 0.03} />
      ))}
      <Sfx name="whoosh" at={turnAt} volume={0.45} />
      <Sfx name="rise" at={cues[2]} volume={0.3} />
      {Array.from({ length: 6 }, (_, k) => (
        <Sfx key={`f${k}`} name="step" at={cues[2] + (k + 1) * BEAT} volume={0.2} />
      ))}
      <Sfx name="glint" at={cues[3]} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[3]} />
    </ObsFrame>
  );
};
