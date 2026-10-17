import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { SEPIA } from "../road";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// 0 · a page of Kierkegaard's journal (1843), handwriting in brown ink.
// 1 · the line as a quote card with two arrows: understand ← backwards,
//     live → forwards.
export const DiagnosisScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const page = useRamp(0, 10);
  const card = useRamp(cues[1], 10);
  const a1 = interpolate(frame, [cues[1] + 2 * BEAT, cues[1] + 3 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const a2 = interpolate(frame, [cues[1] + 4 * BEAT, cues[1] + 5 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: page * (1 - card) }}>
        <Halo x={960} y={480} r={440} intensity={0.55} rgb={SEPIA} />
        <div style={{ position: "absolute", left: 960 - 260, top: 230, width: 520, height: 500, transform: "rotate(-2deg)", background: "linear-gradient(#e8dcc0, #cdbb94)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", padding: "40px 44px", boxSizing: "border-box" }}>
          <div style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 26, color: "#5a3a1a", marginBottom: 18 }}>Journalen JJ · 1843</div>
          {Array.from({ length: 12 }, (_, i) => (
            <svg key={i} width={430} height={26} style={{ display: "block", marginTop: 6 }}>
              <path d={`M0 16 ${Array.from({ length: 24 }, (_, k) => `q 9 ${(k + i) % 3 ? -7 : 5} 18 0`).join(" ")}`} fill="none" stroke="rgba(90,58,26,0.55)" strokeWidth={1.4} strokeDasharray={i === 11 ? "180 1000" : undefined} />
            </svg>
          ))}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 6, color: palette.dim }}>SØREN KIERKEGAARD · 1813—1855 · 日记</div>
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: card }}>
        <Halo x={960} y={360} r={460} intensity={0.4} rgb={SEPIA} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 220, textAlign: "center", fontSize: 76, fontWeight: 900, letterSpacing: 6, lineHeight: 1.5 }}>
          <div>人生只能<span style={{ color: `rgb(${SEPIA})` }}>向后</span>理解，</div>
          <div>却必须<span style={{ color: palette.accent }}>向前</span>生活。</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center", fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim }}>SØREN KIERKEGAARD · JOURNALS · 1843</div>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <g opacity={a1}>
            <line x1={940} y1={600} x2={940 - 360 * a1} y2={600} stroke={`rgb(${SEPIA})`} strokeWidth={5} />
            <path d={`M${940 - 360 * a1} 600 l22 -14 l0 28 Z`} fill={`rgb(${SEPIA})`} />
          </g>
          <g opacity={a2}>
            <line x1={980} y1={600} x2={980 + 360 * a2} y2={600} stroke={palette.accent} strokeWidth={5} />
            <path d={`M${980 + 360 * a2} 600 l-22 -14 l0 28 Z`} fill={palette.accent} />
          </g>
        </svg>
        <div style={{ position: "absolute", left: 560, top: 630, fontFamily: fonts.mono, fontSize: 24, letterSpacing: 6, color: `rgb(${SEPIA})`, opacity: a1 }}>理解</div>
        <div style={{ position: "absolute", left: 1290, top: 630, fontFamily: fonts.mono, fontSize: 24, letterSpacing: 6, color: palette.accent, opacity: a2 }}>生活</div>
      </div>
      <Sfx name="whoosh" at={0} volume={0.3} />
      <Sfx name="stamp" at={cues[1]} volume={0.6} />
      <Sfx name="whoosh" at={cues[1] + 2 * BEAT} volume={0.3} />
      <Sfx name="whoosh" at={cues[1] + 4 * BEAT} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[1]} />
    </ObsFrame>
  );
};
