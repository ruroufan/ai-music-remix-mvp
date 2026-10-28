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
import { ROSE, SKY, WARM } from "../crack";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FACTS = ["MARTIN BUBER", "马丁·布伯", "1878 — 1965 · 犹太哲学家", "ICH UND DU · 1923"];

// Buber: a long beard, a high forehead, round glasses
const Portrait: React.FC = () => (
  <svg width={300} height={360} viewBox="0 0 250 300" style={{ position: "absolute", left: 470, top: 200, overflow: "visible" }}>
    <rect x={0} y={0} width={250} height={300} rx={12} fill="rgba(14,20,28,0.9)" stroke={`rgba(${palette.halo},0.55)`} strokeWidth={2} />
    <g fill="#030405" stroke={`rgba(${palette.halo},0.85)`} strokeWidth={1.8}>
      <path d="M30 300 Q40 232 100 220 Q162 226 184 300 Z" />
      <path d="M82 70 Q90 40 124 40 Q158 42 164 76 L168 120 Q170 140 160 150 L90 150 Q78 140 80 120 Z" />
      <path d="M84 132 Q80 170 96 210 Q110 250 124 254 Q140 250 152 210 Q168 170 162 132 Q150 150 124 152 Q98 150 84 132 Z" fill="rgba(232,238,242,0.8)" />
      <circle cx={106} cy={108} r={12} fill="none" stroke="rgba(232,238,242,0.85)" strokeWidth={2.5} />
      <circle cx={142} cy={108} r={12} fill="none" stroke="rgba(232,238,242,0.85)" strokeWidth={2.5} />
      <path d="M118 108 L130 108" stroke="rgba(232,238,242,0.85)" strokeWidth={2.5} />
    </g>
  </svg>
);

// 0 · a dossier: Martin Buber, Ich und Du.
// 1 · the line as a card — 一切真实的生活， / 都是相遇。 — and under it two
//     small lights drifting towards each other until they touch and bloom.
export const DiagnosisScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const file = useRamp(0, 10);
  const card = useRamp(cues[1], 8);
  const t1 = frame - cues[1];
  const en = useRamp(cues[1] + 5 * BEAT, 12);
  const meet = interpolate(t1, [3 * BEAT, 6 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const bloom = interpolate(t1, [6 * BEAT, 6 * BEAT + 10], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.08]} hits={[cues[1] + 6 * BEAT, ...keyHits(lines, cues, duration)]}>
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
            <div style={{ position: "absolute", inset: 0, opacity: Math.min(1, Math.max(0, (t1 - 3 * BEAT) / 15)) }}>
              <Halo x={960 - 260 * (1 - meet)} y={720} r={90} intensity={0.8} rgb={ROSE} />
              <Halo x={960 + 260 * (1 - meet)} y={720} r={90} intensity={0.8} rgb={SKY} />
              <Halo x={960} y={720} r={260 * bloom} intensity={bloom} rgb={WARM} />
              <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
                <circle cx={960 - 22 - 238 * (1 - meet)} cy={720} r={16} fill={`rgb(${ROSE})`} />
                <circle cx={960 + 22 + 238 * (1 - meet)} cy={720} r={16} fill={`rgb(${SKY})`} />
              </svg>
              <div style={{ position: "absolute", left: 600, width: 120, top: 760, textAlign: "center", fontSize: 26, fontWeight: 800, color: `rgb(${ROSE})`, opacity: 1 - meet }}>我</div>
              <div style={{ position: "absolute", left: 1200, width: 120, top: 760, textAlign: "center", fontSize: 26, fontWeight: 800, color: `rgb(${SKY})`, opacity: 1 - meet }}>你</div>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 5, color: palette.dim }}>BUBER ·《我与你》</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", fontSize: 84, fontWeight: 900, letterSpacing: 6 }}>
              <KineticText text="一切真实的生活，" t={t1} look={look} beat={BEAT} seed="q1" />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontSize: 96, fontWeight: 900, letterSpacing: 8 }}>
              <KineticText text="都是【【相遇】】。" t={t1 - 3 * BEAT} look={look} beat={BEAT} seed="q2" />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 500, textAlign: "center", fontFamily: fonts.mono, fontSize: 19, letterSpacing: 3, color: palette.dim, opacity: en }}>“ALL REAL LIVING IS MEETING.”</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} n={7} rgb={WARM} opacity={0.3} />
      <Sfx name="whoosh" at={0} volume={0.3} />
      {FACTS.map((_, i) => (
        <Sfx key={i} name="shutter" at={Math.round((i + 1) * BEAT * 0.75)} volume={0.14} />
      ))}
      <Sfx name="stamp" at={cues[1]} volume={0.45} />
      <Sfx name="stamp" at={cues[1] + 3 * BEAT} volume={0.4} />
      <Sfx name="glint" at={cues[1] + 6 * BEAT} volume={0.4} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[1]} />
    </ObsFrame>
  );
};
