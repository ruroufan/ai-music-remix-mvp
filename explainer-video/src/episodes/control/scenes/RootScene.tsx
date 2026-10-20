import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Bokeh, Cam } from "../../glass/immersive";
import { Grip, TARGETS } from "../ropes";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Every rope pulled taut and red, humming; on each thing at the end of one, a
// tag lands: 不属于你. Only the short rope to himself stays loose and pale.
export const RootScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.min(TARGETS.length, Math.floor((frame - BEAT) / HALF_BEAT) + 1));
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.05, 1.2]}>
        <Grip frame={frame} tension={1} clench={0.6} lift={0.3} self={0.3} />
        {TARGETS.slice(0, n).map((t) => (
          <div key={t.id} style={{ position: "absolute", left: t.x - 70, top: t.y + 84, width: 140, textAlign: "center", padding: "3px 0", borderRadius: 6, border: "2px solid rgba(232,238,242,0.7)", color: "rgba(232,238,242,0.9)", fontSize: 18, fontWeight: 900, opacity: interpolate(frame, [BEAT, BEAT + 6], [0, 1], clamp) }}>不属于你</div>
        ))}
      </Cam>
      <Bokeh frame={frame} />
      {TARGETS.map((_, i) => (
        <Sfx key={i} name="shutter" at={BEAT + i * HALF_BEAT} volume={0.25} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
