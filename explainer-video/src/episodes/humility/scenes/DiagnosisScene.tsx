import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// 0 · the book of maxims, and a scalpel laid across it: "the anatomist of human nature".
// 1 · the maxim, first half, as a quote card.
// 2 · second half — and under it a lever: push your own end down, the other end goes up.
export const DiagnosisScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const book = useRamp(0, 10);
  const knife = interpolate(frame, [BEAT, 3 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => 1 - (1 - t) ** 3 });
  const card = useRamp(cues[1], 10);
  const q2 = useRamp(cues[2], 10);
  const lever = interpolate(frame, [cues[2] + 2 * BEAT, cues[2] + 4 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t * (3 - 2 * t) });
  const ang = -14 * lever; // left end down = "放低自己", right end up
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: book * (1 - card) }}>
        <Halo x={960} y={480} r={420} intensity={0.6} />
        <div style={{ position: "absolute", left: 960 - 190, top: 230, width: 380, height: 500, transform: "rotate(3deg)", background: "linear-gradient(135deg, #2b1f1a, #140e0b)", border: "2px solid #6b4a36", borderRadius: "4px 10px 10px 4px", boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontFamily: "Georgia, serif", color: "#d9b77a", fontSize: 26, letterSpacing: 4, lineHeight: 1.6 }}>
            RÉFLEXIONS
            <div style={{ fontSize: 48, letterSpacing: 6 }}>MAXIMES</div>
            MORALES
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center", fontFamily: "Georgia, serif", color: "#b39463", fontSize: 18, letterSpacing: 6 }}>PARIS · 1665</div>
        </div>
        {/* the scalpel */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: knife }}>
          <g transform={`translate(${1320 - knife * 260} ${360 + knife * 60}) rotate(-28)`}>
            <rect x={0} y={-6} width={180} height={12} rx={5} fill="#3a4456" stroke="rgba(232,238,242,0.4)" />
            <path d="M-80 0 L0 -9 L0 9 Z" fill="#dfe8ef" />
          </g>
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 6, color: palette.dim }}>LA ROCHEFOUCAULD · 1613—1680 · 人性的解剖师</div>
      </div>

      <div style={{ position: "absolute", inset: 0, opacity: card }}>
        <Halo x={960} y={360} r={460} intensity={0.4} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", fontSize: 58, fontWeight: 900, letterSpacing: 4, lineHeight: 1.5 }}>
          <div>谦虚常常只是一种假装的顺从，用来让别人臣服；</div>
          <div style={{ opacity: q2 }}>
            它是骄傲的计谋：<span style={{ color: palette.accent }}>放低自己，是为了抬高自己。</span>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center", fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim }}>LA ROCHEFOUCAULD ·《箴言集》MAXIMES · 1665</div>
        {/* the lever */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: q2 }}>
          <path d="M945 690 L975 690 L960 662 Z" fill="#c9b48a" />
          <g transform={`rotate(${ang} 960 660)`}>
            <line x1={660} y1={660} x2={1260} y2={660} stroke="#c9b48a" strokeWidth={8} strokeLinecap="round" />
            <circle cx={680} cy={636} r={22} fill="#030405" stroke={`rgb(${palette.halo})`} strokeWidth={2} />
            <circle cx={1240} cy={636} r={22} fill="#030405" stroke={palette.alert} strokeWidth={2} />
          </g>
        </svg>
        <div style={{ position: "absolute", left: 560, top: 720, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: `rgb(${palette.halo})`, opacity: lever }}>放低自己 ↓</div>
        <div style={{ position: "absolute", left: 1200, top: 520, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: palette.alert, opacity: lever }}>抬高自己 ↑</div>
      </div>

      <Sfx name="glint" at={BEAT} volume={0.35} />
      <Sfx name="stamp" at={cues[1]} volume={0.6} />
      <Sfx name="stamp" at={cues[2]} volume={0.5} />
      <Sfx name="rise" at={cues[2] + 2 * BEAT} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[1, 2]} />
    </ObsFrame>
  );
};
