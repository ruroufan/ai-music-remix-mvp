import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { KineticText } from "../../../components/Kinetic";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BP, GOLD } from "../blueprint";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FACTS = ["SOCRATES", "苏格拉底", "约前 470 — 前 399 · 古希腊哲学家", "PLATO · APOLOGY ·《申辩篇》"];

const Portrait: React.FC = () => (
  <svg width={300} height={360} viewBox="0 0 250 300" style={{ position: "absolute", left: 470, top: 200, overflow: "visible" }}>
    <rect x={0} y={0} width={250} height={300} rx={12} fill="rgba(14,20,28,0.9)" stroke={`rgba(${palette.halo},0.55)`} strokeWidth={2} />
    <g fill="#030405" stroke={`rgba(${palette.halo},0.85)`} strokeWidth={1.8}>
      <path d="M30 300 Q40 230 104 218 Q168 226 190 300 Z" />
      <path d="M40 300 Q70 250 120 246 L176 300 Z" fill="rgba(232,238,242,0.3)" />
      <path d="M92 226 L90 196 L122 196 L124 226 Z" />
      <path d="M76 92 Q100 58 140 66 Q160 82 160 112 L172 134 L160 140 Q164 154 156 162 L150 172 Q118 176 98 170 Q66 160 64 126 Q62 104 76 92 Z" />
      <path d="M66 120 Q58 150 70 170 Q92 214 126 216 Q156 212 162 172 Q150 180 120 182 Q90 180 76 156 Q66 140 66 120 Z" fill="rgba(232,238,242,0.6)" />
      <path d="M72 100 Q60 86 72 70 Q86 54 104 60 Q90 64 84 78 Q78 90 72 100 Z" fill="rgba(232,238,242,0.55)" />
    </g>
  </svg>
);

// 0 · a dossier: Socrates, as Plato tells it in the Apology.
// 1 · the line as a card; behind it an outline of a head with nothing drawn
//     inside it — and a single question mark, glowing.
export const DiagnosisScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const file = useRamp(0, 10);
  const card = useRamp(cues[1], 8);
  const t1 = frame - cues[1];
  const en = useRamp(cues[1] + 6 * BEAT, 12);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.08]} hits={keyHits(lines, cues, duration)}>
        {card < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: file * (1 - card) }}>
            <Halo x={620} y={380} r={360} intensity={0.5} />
            <Portrait />
            {FACTS.map((f, i) => {
              const p = interpolate(frame, [(i + 1) * BEAT * 0.75, (i + 1) * BEAT * 0.75 + 8], [0, 1], clamp);
              const name = i === 1;
              return (
                <div key={f} style={{ position: "absolute", left: 860, top: [230, 276, 380, 440][i], opacity: p, transform: `translateX(${(1 - p) * 30}px)`, fontFamily: name ? undefined : fonts.mono, fontSize: name ? 72 : i === 3 ? 19 : 22, fontWeight: name ? 900 : 400, letterSpacing: name ? 8 : 4, color: i === 3 ? `rgb(${palette.halo})` : name ? palette.ink : palette.dim, padding: i === 3 ? "8px 16px" : 0, border: i === 3 ? `1px solid rgba(${palette.halo},0.6)` : undefined, whiteSpace: "nowrap" }}>
                  {f}
                </div>
              );
            })}
          </div>
        )}
        {t1 >= 0 && (
          <div style={{ position: "absolute", inset: 0, opacity: card }}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 0.5 }}>
              <path d="M860 760 Q860 600 960 590 Q1060 600 1060 760" fill="none" stroke={`rgba(${BP},0.5)`} strokeWidth={2} />
              <circle cx={960} cy={560} r={70} fill="none" stroke={`rgba(${BP},0.5)`} strokeWidth={2} strokeDasharray="6 6" />
              <text x={960} y={590} textAnchor="middle" fontSize={84} fontWeight={900} fill={`rgba(${GOLD},${0.6 + 0.3 * Math.sin(frame / 8)})`}>？</text>
            </svg>
            <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 5, color: palette.dim }}>PLATO ·《申辩篇》</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", fontSize: 58, fontWeight: 900, letterSpacing: 4 }}>
              <KineticText text="我比别人多知道的只有一件事，" t={t1} look={look} beat={BEAT} seed="q1" />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", fontSize: 58, fontWeight: 900, letterSpacing: 4 }}>
              <KineticText text="那就是我知道【【自己无知】】。" t={t1 - 3 * BEAT} look={look} beat={BEAT} seed="q2" />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 450, textAlign: "center", fontFamily: fonts.mono, fontSize: 19, letterSpacing: 3, color: palette.dim, opacity: en }}>“I KNOW THAT I KNOW NOTHING.”</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} n={7} />
      <Sfx name="whoosh" at={0} volume={0.3} />
      {FACTS.map((_, i) => (
        <Sfx key={i} name="shutter" at={Math.round((i + 1) * BEAT * 0.75)} volume={0.14} />
      ))}
      <Sfx name="stamp" at={cues[1]} volume={0.45} />
      <Sfx name="stamp" at={cues[1] + 3 * BEAT} volume={0.45} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[1]} />
    </ObsFrame>
  );
};
