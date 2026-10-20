import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { Grip } from "../ropes";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// 0 · the ropes as tight as they go, his fists red; a gauge: 心累 climbing.
// 1 · and the things at the ends of the ropes start to go their own way —
//     the whole world turning, dragging him round; 焦虑 to the top.
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const c1 = cues[1];
  const tired = interpolate(frame, [0, c1], [0.3, 0.85], clamp);
  const anx = interpolate(frame, [c1, duration - 10], [0.4, 1], clamp);
  const spin = interpolate(frame, [c1, duration], [0, 1], { ...clamp, easing: (t) => t * t }) * 22;
  const gauge = (label: string, v: number, y: number) => (
    <div style={{ position: "absolute", left: 120, top: y, width: 300 }}>
      <div style={{ fontSize: 26, fontWeight: 900, color: palette.ink }}>{label}</div>
      <div style={{ marginTop: 8, height: 16, borderRadius: 4, background: "rgba(232,238,242,0.1)" }}>
        <div style={{ width: `${v * 100}%`, height: "100%", borderRadius: 4, background: palette.alert, boxShadow: `0 0 12px ${palette.alert}` }} />
      </div>
      <div style={{ fontFamily: fonts.mono, fontSize: 20, color: palette.alert, marginTop: 4 }}>{v > 0.97 ? "MAX" : `${Math.round(v * 100)}%`}</div>
    </div>
  );
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.15]} hits={[c1]}>
        <div style={{ position: "absolute", inset: 0, transformOrigin: "960px 500px", transform: `rotate(${spin}deg)` }}>
          <Grip frame={frame} tension={1} clench={1} lift={0.2} />
        </div>
        {gauge("心累", tired, 140)}
        {frame >= c1 && gauge("焦虑", anx, 260)}
      </Cam>
      <Bokeh frame={frame} />
      <Sfx name="rise" at={0} volume={0.3} />
      <Sfx name="glitch" at={c1} volume={0.4} />
      <Sfx name="boom" at={c1} volume={0.4} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
