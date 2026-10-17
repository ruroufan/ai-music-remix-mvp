import React from "react";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Porcupine } from "../porcupine";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// Line 0: the book the fable comes from, Parerga und Paralipomena (1851).
// Line 1: the name of the fable as a title card, a lone porcupine bristling.
export const DiagnosisScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const book = useRamp(0, 10);
  const card = useRamp(cues[1], 10);
  const bristle = useRamp(cues[1] + BEAT, 6);
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: book * (1 - card) }}>
        <Halo x={960} y={480} r={400} intensity={0.6} />
        <div style={{ position: "absolute", left: 960 - 200, top: 220, width: 400, height: 520, transform: `rotate(-4deg) translateY(${(1 - book) * 30}px)`, background: "linear-gradient(135deg, #3b2a1e, #1d140e)", border: "2px solid #6b5236", borderRadius: "4px 10px 10px 4px", boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 110, textAlign: "center", fontFamily: "Georgia, serif", color: "#d9b77a", fontSize: 40, lineHeight: 1.3, letterSpacing: 2 }}>
            Parerga
            <div style={{ fontSize: 22 }}>und</div>
            Paralipomena
          </div>
          <div style={{ position: "absolute", left: 60, right: 60, top: 330, height: 1, background: "#6b5236" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontFamily: "Georgia, serif", color: "#b39463", fontSize: 18, letterSpacing: 6 }}>SCHOPENHAUER · 1851</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 160, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 6, color: palette.dim }}>ARTHUR SCHOPENHAUER · 1788—1860</div>
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: card }}>
        <Halo x={960} y={430} r={420} intensity={0.7} />
        <Porcupine x={960} ground={380} size={1.6 + bristle * 0.1} bristle={0.3 + bristle * 0.7} hurt={0} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center", fontSize: 120, fontWeight: 900, letterSpacing: 30, transform: `scale(${1.08 - card * 0.08})`, textShadow: `0 0 40px rgba(${palette.halo},0.45)` }}>豪猪困境</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.dim }}>THE PORCUPINE DILEMMA</div>
      </div>
      <Sfx name="whoosh" at={0} volume={0.3} />
      <Sfx name="stamp" at={cues[1]} volume={0.7} />
      <Sfx name="shatter" at={cues[1] + BEAT} volume={0.2} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[1]} />
    </ObsFrame>
  );
};
