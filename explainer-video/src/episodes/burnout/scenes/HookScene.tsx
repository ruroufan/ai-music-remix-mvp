import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { Treadmill } from "../treadmill";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// 0 · the treadmill: 你可以, the speed creeping up; over his head, what he
//     wants — 升职, 房子, 证书 — and the battery: draining.
// 1 · the wants go out one by one; the battery hits 1%.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const speedAt = (f: number) => interpolate(f, [0, duration], [0.35, 0.8], clamp);
  const battery = interpolate(frame, [0, cues[1] + 4 * BEAT], [62, 1], clamp);
  const wants = ["升职", "房子", "证书", "自律"];
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.1]} focus={{ x: 900, y: 520 }}>
        <Treadmill cx={900} frame={frame} speedAt={speedAt} lift={1 - (62 - battery) / 80} />
        {wants.map((w, i) => {
          const off = interpolate(frame, [cues[1] + i * BEAT, cues[1] + i * BEAT + 8], [1, 0.12], clamp);
          return <div key={w} style={{ position: "absolute", left: 520 + i * 150, top: 170, padding: "8px 18px", borderRadius: 20, border: `2px solid rgba(${palette.halo},${0.8 * off})`, color: `rgba(232,238,242,${off})`, fontSize: 28, fontWeight: 800 }}>{w}</div>;
        })}
        <div style={{ position: "absolute", left: 1320, top: 160, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative", width: 90, height: 40, border: `3px solid ${palette.ink}`, borderRadius: 6 }}>
            <div style={{ position: "absolute", left: 3, top: 3, bottom: 3, width: `${battery * 0.8}px`, background: battery < 15 ? palette.alert : palette.accent }} />
          </div>
          <span style={{ fontFamily: fonts.mono, fontSize: 30, color: battery < 15 ? palette.alert : palette.ink }}>{Math.round(battery)}%</span>
        </div>
      </Cam>
      <Bokeh frame={frame} />
      <Sfx name="rise" at={0} volume={0.25} />
      {[0, 1, 2, 3].map((i) => (
        <Sfx key={i} name="glitch" at={cues[1] + i * BEAT} volume={0.15} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
