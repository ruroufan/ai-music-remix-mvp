import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { backlitLookFx as fx, fonts, palette } from "../../../channels/backlit/look";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const COLS = ["人须在事上磨", "方立得住"];

// 0 · an old thread-bound book: 传习录, in vertical columns.
// 1 · the line, brushed in vertically, column by column; under it a blade
//     drawn across a whetstone — sparks on every beat.
export const DiagnosisScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const book = useRamp(0, 10);
  const card = useRamp(cues[1], 8);
  const t1 = frame - cues[1];
  const stroke = ((t1 % BEAT) + BEAT) % BEAT / BEAT;
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: book * (1 - card) }}>
        <Halo x={960} y={480} r={420} intensity={0.55} />
        <div style={{ position: "absolute", left: 960 - 180, top: 220, width: 360, height: 520, background: "linear-gradient(135deg, #3a2f22, #1f1810)", border: "2px solid #6b5236", boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}>
          {[0, 1, 2, 3].map((k) => (
            <div key={k} style={{ position: "absolute", left: -2, top: 60 + k * 130, width: 26, height: 3, background: "#c9b48a" }} />
          ))}
          <div style={{ position: "absolute", right: 46, top: 50, width: 80, padding: "20px 0", background: "#e8dcc0", writingMode: "vertical-rl", fontSize: 54, fontWeight: 900, color: "#2a1a0a", letterSpacing: 12, textAlign: "center", lineHeight: "80px" }}>传习录</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 160, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 6, color: palette.dim }}>王阳明 · 1472—1529 ·《传习录》</div>
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: card }}>
        <Halo x={960} y={400} r={460} intensity={0.45} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", flexDirection: "row-reverse", justifyContent: "center", gap: 70 }}>
          {COLS.map((c, ci) => (
            <div key={c} style={{ writingMode: "vertical-rl", fontSize: 92, fontWeight: 900, letterSpacing: 14, lineHeight: 1 }}>
              {[...c].map((ch, i) => {
                const at = (ci * 6 + i) * 3;
                const p = interpolate(t1, [at, at + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const key = ch === "磨" || (ci === 1 && i >= 1);
                return <span key={i} style={{ display: "inline-block", opacity: p, filter: `blur(${(1 - p) * 8}px)`, transform: `scale(${1.6 - 0.6 * p})`, color: key ? fx.key : palette.ink, textShadow: key ? `0 0 26px ${fx.keyGlow}` : undefined }}>{ch}</span>;
              })}
            </div>
          ))}
        </div>
        {/* the whetstone */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <rect x={1260} y={640} width={300} height={44} rx={6} fill="#3a3a3a" stroke="#6a6a6a" />
          <g transform={`translate(${1290 + stroke * 200} ${612}) rotate(-12)`}>
            <path d="M0 0 L190 6 L190 18 L0 22 Z" fill="#dfe8ef" />
            <rect x={-80} y={2} width={80} height={18} rx={6} fill="#5a3a22" />
          </g>
          {t1 >= 0 && stroke < 0.4 && Array.from({ length: 10 }, (_, i) => {
            const a = -Math.PI / 2 + (random(`sp-${i}`) - 0.5) * 2;
            const L = 20 + stroke * 120 * random(`sl-${i}`);
            const x = 1470 + stroke * 60;
            return <line key={i} x1={x} y1={640} x2={x + Math.cos(a) * L} y2={640 + Math.sin(a) * L} stroke={`rgb(${palette.halo})`} strokeWidth={2} opacity={1 - stroke * 2.5} />;
          })}
        </svg>
        <div style={{ position: "absolute", left: 1260, top: 700, width: 300, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: `rgb(${palette.halo})` }}>事 上 磨</div>
      </div>
      <Sfx name="whoosh" at={0} volume={0.3} />
      <Sfx name="stamp" at={cues[1]} volume={0.6} />
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((k) => (
        <Sfx key={k} name="glint" at={cues[1] + k * BEAT} volume={0.12} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[1]} />
    </ObsFrame>
  );
};
