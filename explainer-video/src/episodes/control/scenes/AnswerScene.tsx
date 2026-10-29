import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { Grip, TARGETS } from "../ropes";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// 0 · him and his ropes, as the question is asked.
// 1 · one per half beat, everything at the end of a rope gets a red tag —
//     我的责任 — and the ropes pull taut; he's dragged down under them.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const c1 = cues[1];
  const n = Math.max(0, Math.min(TARGETS.length, Math.floor((frame - c1 - BEAT) / HALF_BEAT) + 1));
  const tension = interpolate(frame, [c1 + BEAT, c1 + 5 * BEAT], [0.35, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.1]} hits={[c1 + 5 * BEAT]}>
        <Grip frame={frame} tension={tension} lift={0.9 - 0.8 * (tension - 0.35)} clench={tension > 0.8 ? 0.8 : 0} />
        {TARGETS.slice(0, n).map((t, i) => (
          <div key={t.id} style={{ position: "absolute", left: t.x + 50, top: t.y - 60, padding: "4px 12px", borderRadius: 6, background: palette.alert, color: "#fff", fontSize: 20, fontWeight: 900, transform: `rotate(${i % 2 ? 6 : -6}deg) scale(${1 + 0.4 * Math.exp(-(frame - c1 - BEAT - i * HALF_BEAT) / 4)})` }}>我的责任</div>
        ))}
      </Cam>
      <Bokeh frame={frame} />
      {TARGETS.map((_, i) => (
        <Sfx key={i} name="stamp" at={c1 + BEAT + i * HALF_BEAT} volume={0.3} />
      ))}
      <Sfx name="boom" at={c1 + 5 * BEAT} volume={0.45} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
