import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// 0 · Sein und Zeit, 1927.
// 1 · the concept as a title card — 向死而生 — and under it a life drawn as a
//     line with an end: the end is what makes the line light up.
export const DiagnosisScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const book = useRamp(0, 10);
  const card = useRamp(cues[1], 8);
  const line = interpolate(frame, [cues[1] + BEAT, cues[1] + 4 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => 1 - (1 - t) ** 3 });
  const lit = interpolate(frame, [cues[1] + 4 * BEAT, cues[1] + 6 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const chars = [..."向死而生"];
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: book * (1 - card) }}>
        <Halo x={960} y={480} r={420} intensity={0.55} />
        <div style={{ position: "absolute", left: 960 - 190, top: 230, width: 380, height: 500, transform: `rotate(-3deg) translateY(${(1 - book) * 30}px)`, background: "linear-gradient(135deg, #1e2a3a, #0e141e)", border: "2px solid #3a4a62", borderRadius: "4px 10px 10px 4px", boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontFamily: "Georgia, serif", color: "#cfd8e6", fontSize: 44, letterSpacing: 4, lineHeight: 1.3 }}>
            SEIN
            <div style={{ fontSize: 24 }}>UND</div>
            ZEIT
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 390, textAlign: "center", fontFamily: "Georgia, serif", color: "#8a9ab4", fontSize: 18, letterSpacing: 6 }}>HEIDEGGER · 1927</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 6, color: palette.dim }}>MARTIN HEIDEGGER · 1889—1976 ·《存在与时间》</div>
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: card }}>
        <Halo x={960} y={420} r={460} intensity={0.5 + 0.4 * lit} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 290, textAlign: "center", fontSize: 150, fontWeight: 900, letterSpacing: 40, paddingLeft: 40 }}>
          {chars.map((c, i) => {
            const p = interpolate(frame - cues[1], [i * 3, i * 3 + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const e = 1 - (1 - p) ** 3;
            return <span key={i} style={{ display: "inline-block", opacity: p, transform: `scale(${2 - e}) translateY(${(1 - e) * -30}px)`, filter: `blur(${(1 - e) * 12}px)`, color: i < 2 ? palette.ink : `rgb(${palette.halo})`, textShadow: i >= 2 ? `0 0 30px rgba(${palette.halo},0.7)` : undefined }}>{c}</span>;
          })}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 480, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 8, color: palette.dim }}>SEIN ZUM TODE</div>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <line x1={560} y1={620} x2={560 + 800 * line} y2={620} stroke={`rgba(${palette.halo},${0.4 + 0.6 * lit})`} strokeWidth={6} strokeLinecap="round" style={{ filter: lit > 0 ? `drop-shadow(0 0 ${12 * lit}px rgb(${palette.halo}))` : undefined }} />
          <circle cx={560} cy={620} r={10} fill={palette.ink} />
          {line >= 1 && <line x1={1360} y1={596} x2={1360} y2={644} stroke={palette.alert} strokeWidth={6} />}
        </svg>
        <div style={{ position: "absolute", left: 520, top: 650, fontFamily: fonts.mono, fontSize: 20, color: palette.dim }}>出生</div>
        <div style={{ position: "absolute", left: 1330, top: 650, fontFamily: fonts.mono, fontSize: 20, color: palette.alert, opacity: line >= 1 ? 1 : 0 }}>终点</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: `rgb(${palette.halo})`, opacity: lit }}>有限，所以发光</div>
      </div>
      <Sfx name="whoosh" at={0} volume={0.3} />
      <Sfx name="boom" at={cues[1]} volume={0.7} />
      <Sfx name="rise" at={cues[1] + BEAT} volume={0.3} />
      <Sfx name="stamp" at={cues[1] + 4 * BEAT} volume={0.5} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[1]} />
    </ObsFrame>
  );
};
