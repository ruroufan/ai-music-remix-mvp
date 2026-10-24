import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bubble, MaskedFigure } from "../mask";
import { Person } from "../../solitude/porcupine";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const FLOOR = 780;
const YOU = 520, HIM = 1340;

// 0 · you, and him across from you, being modest at you.
// 1 · the modesty's path: it heads toward you, then hooks round and goes back
//     into him. It was never addressed to you.
// 2 · and it hangs there, waiting: three dots, an empty reply box.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const path = interpolate(frame, [cues[1] + BEAT, cues[1] + 5 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t * (3 - 2 * t) });
  const t2 = frame - cues[2];
  const D = `M${HIM - 60} 460 C ${HIM - 400} 300, ${YOU + 120} 300, ${YOU + 90} 470 C ${YOU + 60} 640, ${HIM - 360} 700, ${HIM - 30} 560`;
  return (
    <ObsFrame duration={duration}>
      <Horizon y={FLOOR} />
      <Person x={YOU} bottom={FLOOR} height={250} glow={0.45} />
      <div style={{ position: "absolute", left: YOU - 30, top: FLOOR + 14, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim }}>你</div>
      <MaskedFigure x={HIM} bottom={FLOOR} height={250} xray={path * 0.6} glow={0.6} />
      {frame < cues[1] + BEAT && <Bubble x={HIM - 40} y={470} text="我真的很一般…" tone="humble" size={32} flip />}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <path d={D} fill="none" stroke={`rgba(${palette.halo},0.9)`} strokeWidth={4} strokeDasharray="1" pathLength={1} strokeDashoffset={1 - path} style={{ strokeDasharray: 1 }} />
        <path d={D} fill="none" stroke={`rgba(${palette.halo},0.25)`} strokeWidth={14} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - path} />
      </svg>
      <div style={{ position: "absolute", left: 820, top: 300, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: `rgb(${palette.halo})`, opacity: Math.min(1, path * 3) }}>谦虚 → 你？</div>
      <div style={{ position: "absolute", left: 960, top: 650, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.alert, opacity: path > 0.85 ? 1 : 0 }}>→ 他自己</div>
      {t2 >= 0 && (
        <div style={{ position: "absolute", left: HIM + 100, top: 360, opacity: Math.min(1, t2 / 6) }}>
          <div style={{ display: "flex", gap: 10, padding: "16px 22px", borderRadius: 22, background: "rgba(232,238,242,0.9)", width: "fit-content" }}>
            {[0, 1, 2].map((k) => (
              <div key={k} style={{ width: 14, height: 14, borderRadius: 7, background: "#14181e", opacity: 0.3 + 0.7 * (Math.floor(frame / 6) % 3 === k ? 1 : 0) }} />
            ))}
          </div>
          <div style={{ marginTop: 18, width: 260, height: 54, border: `2px dashed ${palette.accent}`, borderRadius: 10, fontFamily: fonts.mono, fontSize: 18, color: palette.accent, display: "flex", alignItems: "center", padding: "0 14px", letterSpacing: 2 }}>
            等待回应{Math.floor(frame / 8) % 2 ? "▍" : ""}
          </div>
        </div>
      )}
      <Sfx name="whoosh" at={cues[1] + BEAT} volume={0.35} />
      <Sfx name="whoosh" at={cues[1] + 3 * BEAT} volume={0.35} />
      <Sfx name="stamp" at={cues[1] + 5 * BEAT} volume={0.5} />
      {[0, 1, 2, 3].map((k) => (
        <Sfx key={k} name="step" at={cues[2] + (k + 1) * BEAT} volume={0.15} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
