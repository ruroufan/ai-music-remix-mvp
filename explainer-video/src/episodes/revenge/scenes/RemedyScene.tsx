import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { DayBar } from "../puppet";
import { DAY } from "./AnswerScene";
import { Person } from "../../solitude/porcupine";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

// 0 · back to the day bar: a teal hour opens up at noon — 留给自己 — in daylight.
// 1 · what goes in it: a lunch eaten properly; a walk with the phone on silent.
export const RemedyScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const open = interpolate(frame, [2 * BEAT, 5 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t * (3 - 2 * t) });
  const t1 = frame - cues[1];
  const v1 = interpolate(t1, [BEAT, BEAT + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const v2 = interpolate(t1, [4 * BEAT, 4 * BEAT + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const blocks: [number, number, string, string][] = DAY.flatMap((b) =>
    b[2] === "工作" ? ([[9, 12, "工作", b[3]], [12, 12 + open, "留给自己", palette.accent], [12 + open, 19, "工作", b[3]]] as [number, number, string, string][]) : [b],
  );
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 80% 10%, rgba(255,214,140,${0.18 * Math.max(open, frame >= cues[1] ? 1 : 0)}), transparent 55%)` }} />
      {frame < cues[1] ? (
        <>
          <div style={{ position: "absolute", left: 260, top: 300, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: palette.dim }}>白天 · 也给自己留一段</div>
          <DayBar x={260} y={350} w={1400} blocks={blocks} />
          <div style={{ position: "absolute", left: 260 + (12 / 24) * 1400 - 40, top: 470, fontFamily: fonts.mono, fontSize: 26, color: palette.accent, opacity: open }}>12:00</div>
        </>
      ) : (
        <>
          <div style={{ position: "absolute", left: 220, top: 170, width: 680, height: 560, opacity: v1, border: `1px solid ${palette.faint}`, background: "rgba(10,14,21,0.9)" }}>
            <svg width={680} height={420} viewBox="0 0 680 420" style={{ position: "absolute", top: 40 }}>
              <path d="M200 240 Q340 360 480 240 Z" fill="#2a3242" stroke={`rgb(${palette.halo})`} strokeWidth={3} />
              <line x1={420} y1={150} x2={520} y2={250} stroke={`rgb(${palette.halo})`} strokeWidth={5} />
              <line x1={440} y1={140} x2={534} y2={244} stroke={`rgb(${palette.halo})`} strokeWidth={5} />
              {[0, 1, 2].map((k) => (
                <path key={k} d={`M${290 + k * 45} 220 q -12 -24 0 -48 q 12 -24 0 -48`} fill="none" stroke="rgba(232,238,242,0.45)" strokeWidth={3} strokeDasharray="8 6" strokeDashoffset={-frame + k * 5} />
              ))}
            </svg>
            <div style={{ position: "absolute", left: 30, top: 24, fontFamily: fonts.mono, fontSize: 22, color: palette.dim }}>12:10</div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 30, textAlign: "center", fontSize: 34, fontWeight: 700 }}>一顿好好吃的午饭</div>
          </div>
          <div style={{ position: "absolute", left: 1020, top: 170, width: 680, height: 560, opacity: v2, border: `1px solid ${palette.faint}`, background: "rgba(10,14,21,0.9)", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 380, height: 3, background: palette.faint }} />
            <Person x={120 + Math.min(1, Math.max(0, (t1 - 4 * BEAT) / (5 * BEAT))) * 300} bottom={380} height={200} glow={0.9} />
            {/* the phone, on silent */}
            <svg width={120} height={120} viewBox="-60 -60 120 120" style={{ position: "absolute", left: 520, top: 90 }}>
              <path d="M-22 14 Q-22 -26 0 -26 Q22 -26 22 14 L28 22 L-28 22 Z" fill="none" stroke={palette.ink} strokeWidth={4} />
              <circle cx={0} cy={30} r={6} fill={palette.ink} />
              <line x1={-40} y1={-40} x2={40} y2={40} stroke={palette.alert} strokeWidth={6} />
            </svg>
            <div style={{ position: "absolute", left: 30, top: 24, fontFamily: fonts.mono, fontSize: 22, color: palette.dim }}>18:40 · 消息稍后再回</div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 30, textAlign: "center", fontSize: 34, fontWeight: 700 }}>一段不回消息的路</div>
          </div>
        </>
      )}
      <Sfx name="rise" at={2 * BEAT} volume={0.3} />
      <Sfx name="glint" at={5 * BEAT} volume={0.4} />
      <Sfx name="glint" at={cues[1] + BEAT} volume={0.3} />
      <Sfx name="glint" at={cues[1] + 4 * BEAT} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
