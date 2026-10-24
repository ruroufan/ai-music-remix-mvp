import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { FLOOR, Polaroid, Road, SEPIA, Walker } from "../road";
import { stride, walkX } from "./HookScene";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

// 0 · while he looks back, "此刻" — a small warm light — drifts past behind his
//     back and is gone into the past before he sees it.
// 1 · an ordinary day, today, grey: "2026.10.15 · 普通的周四". +10 years —
//     and it's a sepia photo: "最怀念的一天".
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const moment = interpolate(frame, [BEAT, 7 * BEAT], [1700, 300], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t1 = frame - cues[1];
  const age = interpolate(t1, [3 * BEAT, 6 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t * (3 - 2 * t) });
  const year = Math.round(2026 + interpolate(t1, [BEAT, 6 * BEAT], [0, 10], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <ObsFrame duration={duration}>
      {frame < cues[1] && (
        <>
          <Road frame={frame} />
          <Walker x={walkX(frame, 900, 1)} bottom={FLOOR} face="left" walk={stride(frame)} lean={-3} />
          <div style={{ position: "absolute", left: moment - 30, top: 560, width: 60, height: 60, borderRadius: 30, background: "#ffd9a0", boxShadow: "0 0 50px 10px rgba(255,200,120,0.6)", opacity: moment < 400 ? (moment - 300) / 100 : 1 }} />
          <div style={{ position: "absolute", left: moment - 60, top: 640, width: 120, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, color: "#ffd9a0", opacity: moment < 400 ? (moment - 300) / 100 : 1 }}>此刻</div>
          <div style={{ position: "absolute", left: 1300, top: 400, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: palette.alert, opacity: moment < 900 ? 1 : 0 }}>错过了 ✕</div>
        </>
      )}
      {frame >= cues[1] && (
        <>
          <div style={{ position: "absolute", left: 960 - 280, top: 170, width: 560, height: 520, filter: `sepia(${age}) saturate(${1 + age * 0.4})`, boxShadow: `0 0 ${100 * age}px rgba(255,190,110,${0.45 * age})` }}>
            <div style={{ position: "absolute", inset: 0, background: age < 0.5 ? "#3a4252" : "transparent", opacity: 1 - age * 2 }} />
            <Polaroid x={280} y={0} w={560} kind="home" tone={age} caption={age > 0.5 ? "最怀念的一天 ♥" : "普通的一天"} />
          </div>
          <div style={{ position: "absolute", left: 1320, top: 300, fontFamily: fonts.mono, fontSize: 24, letterSpacing: 4, color: palette.dim }}>
            今天 · 2026.10.15 · 周四
            <div style={{ fontSize: 80, fontWeight: 700, color: age > 0.5 ? `rgb(${SEPIA})` : palette.ink, marginTop: 20 }}>{year}</div>
            <div style={{ color: `rgb(${SEPIA})`, opacity: age }}>+10 年 · 回看</div>
          </div>
        </>
      )}
      {Array.from({ length: 7 }, (_, k) => (
        <Sfx key={k} name="step" at={(k + 1) * BEAT} volume={0.15} />
      ))}
      <Sfx name="whoosh" at={4 * BEAT} volume={0.3} />
      <Sfx name="rise" at={cues[1] + BEAT} volume={0.3} />
      <Sfx name="glint" at={cues[1] + 5 * BEAT} volume={0.45} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
