import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Axis, AXIS_Y, SpeedLines } from "../timeline";
import { Runner } from "./HookScene";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

// 0 · chasing other people's pins; a little thought bubble — 我想要什么？ —
//     tries to keep up with him and falls behind, off the left edge.
// 1 · faster still: the speedometer climbs, the compass needle just spins.
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const t1 = frame - cues[1];
  const speed = frame < cues[1] ? 1.5 : interpolate(t1, [0, 4 * BEAT], [1.5, 3], { extrapolateRight: "clamp" });
  const age = 27 + frame * 0.012 * speed;
  const lag = interpolate(frame, [BEAT, cues[1]], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const spin = t1 > 0 ? t1 * (14 + t1 * 0.4) : 0;
  return (
    <ObsFrame duration={duration}>
      <SpeedLines frame={frame} speed={14 * speed} />
      <Axis age={age} behind={age} />
      <Runner frame={frame} speed={speed} />
      {frame < cues[1] + 6 && (
        <div style={{ position: "absolute", left: 700 - lag * 760, top: AXIS_Y - 330 + Math.sin(frame / 6) * 6, padding: "12px 24px", borderRadius: 30, background: "rgba(232,238,242,0.92)", color: "#14181e", fontSize: 32, fontWeight: 800, opacity: 1 - lag * 0.5 }}>我想要什么？</div>
      )}
      {t1 >= 0 && (
        <>
          <div style={{ position: "absolute", left: 1240, top: 160, fontFamily: fonts.mono, color: palette.dim, fontSize: 20, letterSpacing: 4 }}>
            速度
            <div style={{ fontSize: 90, fontWeight: 700, color: palette.alert }}>{Math.round(speed * 40)}<span style={{ fontSize: 30 }}> km/h</span></div>
          </div>
          <svg width={200} height={200} viewBox="-100 -100 200 200" style={{ position: "absolute", left: 1560, top: 160 }}>
            <circle r={88} fill="none" stroke={palette.dim} strokeWidth={3} />
            {["N", "E", "S", "W"].map((d, i) => (
              <text key={d} x={Math.sin((i * Math.PI) / 2) * 66} y={-Math.cos((i * Math.PI) / 2) * 66 + 8} textAnchor="middle" fontSize={22} fill={palette.dim} fontFamily={fonts.mono}>{d}</text>
            ))}
            <g transform={`rotate(${spin})`}>
              <path d="M0 -60 L10 0 L-10 0 Z" fill={palette.alert} />
              <path d="M0 60 L10 0 L-10 0 Z" fill={palette.dim} />
            </g>
          </svg>
          <div style={{ position: "absolute", left: 1560, top: 370, width: 200, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, color: palette.alert }}>方向：？</div>
        </>
      )}
      {Array.from({ length: 20 }, (_, k) => (
        <Sfx key={k} name="step" at={k * BEAT} volume={0.13} />
      ))}
      <Sfx name="whoosh" at={4 * BEAT} volume={0.3} />
      <Sfx name="rise" at={cues[1]} volume={0.35} />
      <Sfx name="glitch" at={cues[1] + 3 * BEAT} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
