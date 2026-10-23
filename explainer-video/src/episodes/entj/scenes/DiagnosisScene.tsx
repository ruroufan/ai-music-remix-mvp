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
import { Bower, Leader } from "../podium";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FACTS = ["G. W. F. HEGEL", "黑格尔", "1770 — 1831 · 德国哲学家", "PHÄNOMENOLOGIE DES GEISTES · 1807"];

const Portrait: React.FC = () => (
  <svg width={300} height={360} viewBox="0 0 250 300" style={{ position: "absolute", left: 470, top: 200, overflow: "visible" }}>
    <rect x={0} y={0} width={250} height={300} rx={12} fill="rgba(14,20,28,0.9)" stroke={`rgba(${palette.halo},0.55)`} strokeWidth={2} />
    <g fill="#030405" stroke={`rgba(${palette.halo},0.85)`} strokeWidth={1.8}>
      <path d="M30 300 Q40 226 104 214 Q168 222 190 300 Z" />
      <path d="M86 236 L82 212 Q104 228 130 212 L126 236 Z" fill="rgba(232,238,242,0.55)" />
      <path d="M92 222 L90 192 L122 192 L124 222 Z" />
      <path d="M80 90 Q110 62 146 78 Q160 96 158 118 L170 138 L158 144 Q162 158 154 168 Q150 186 126 188 L100 196 Q68 192 64 146 Q60 108 80 90 Z" />
      <path d="M74 112 Q66 76 92 66 Q78 92 82 110 Z M150 84 Q172 92 166 120 Q160 100 150 84 Z" fill="rgba(232,238,242,0.5)" />
      <path d="M96 172 Q126 182 150 168" fill="none" strokeWidth={4} stroke="rgba(232,238,242,0.4)" />
    </g>
  </svg>
);

// 0 · a dossier: Hegel, the Phenomenology of Spirit.
// 1 · the story as a card — 主人与奴隶 — and under it the two of them: one
//     standing tall in gold light, one bowed low in front of him.
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
            <div style={{ position: "absolute", inset: 0, opacity: Math.min(1, Math.max(0, (t1 - 2 * BEAT) / 15)) }}>
              <Leader x={860} bottom={800} height={260} halo={0.4} />
              <Bower x={1080} bottom={800} height={230} bow={1} face={-1} glow={0.4} />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 5, color: palette.dim }}>HEGEL ·《精神现象学》</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", fontSize: 96, fontWeight: 900, letterSpacing: 10 }}>
              <KineticText text="【主人】" t={t1} look={look} beat={BEAT} seed="q1" />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", fontSize: 96, fontWeight: 900, letterSpacing: 10 }}>
              <KineticText text="与【【奴隶】】。" t={t1 - 3 * BEAT} look={look} beat={BEAT} seed="q2" />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 450, textAlign: "center", fontFamily: fonts.mono, fontSize: 19, letterSpacing: 3, color: palette.dim, opacity: en }}>“LORDSHIP AND BONDAGE.”</div>
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
