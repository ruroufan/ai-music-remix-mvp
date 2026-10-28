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
import { Walker } from "../../nostalgia/road";
import { DAWN, FLAME } from "../chase";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FACTS = ["BLAISE PASCAL", "帕斯卡", "1623 — 1662 · 法国哲学家", "PENSÉES ·《思想录》· 1670"];

// Pascal: long hair falling to the shoulders, a white collar
const Portrait: React.FC = () => (
  <svg width={300} height={360} viewBox="0 0 250 300" style={{ position: "absolute", left: 470, top: 200, overflow: "visible" }}>
    <rect x={0} y={0} width={250} height={300} rx={12} fill="rgba(14,20,28,0.9)" stroke={`rgba(${palette.halo},0.55)`} strokeWidth={2} />
    <g fill="#030405" stroke={`rgba(${palette.halo},0.85)`} strokeWidth={1.8}>
      <path d="M30 300 Q40 232 100 220 Q162 226 184 300 Z" />
      <path d="M86 226 L124 252 L162 226 L150 216 L124 236 L98 216 Z" fill="rgba(232,238,242,0.75)" />
      <path d="M62 120 Q56 50 120 46 Q184 50 178 120 Q190 170 172 216 L150 210 Q160 160 150 130 L92 130 Q80 160 92 210 L70 216 Q50 170 62 120 Z" fill="rgba(232,238,242,0.55)" />
      <path d="M90 100 Q96 70 124 70 Q150 72 154 102 L154 150 Q150 184 122 188 Q94 184 90 150 Z" />
    </g>
  </svg>
);

// 0 · a dossier: Blaise Pascal, Pensées.
// 1 · the line as a card — 人类所有的不幸，都源于一件事： / 不能安静地待在一个
//     房间里。 — and under it a small room with an empty chair, and someone
//     who can't sit in it: pacing, back and forth, wall to wall.
export const DiagnosisScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const file = useRamp(0, 10);
  const card = useRamp(cues[1], 8);
  const t1 = frame - cues[1];
  const en = useRamp(cues[1] + 5 * BEAT, 12);
  // pacing: wall to wall and back, every two beats
  const ph = (Math.max(0, t1) / (4 * BEAT)) % 1;
  const pace = { x: 760 + 400 * (ph < 0.5 ? ph * 2 : 2 - ph * 2), face: (ph < 0.5 ? "right" : "left") as "left" | "right", walk: Math.max(0, t1) / 3 };
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.08]} hits={[...keyHits(lines, cues, duration)]}>
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
              <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
                <rect x={700} y={600} width={520} height={300} fill="rgba(20,22,30,0.8)" stroke="rgba(232,238,242,0.35)" strokeWidth={3} />
                <rect x={1080} y={640} width={80} height={90} fill={`rgba(${DAWN},0.3)`} stroke="rgba(232,238,242,0.3)" strokeWidth={2} />
                <path d="M940 870 L940 800 L990 800 L990 830 M940 830 L990 830 L990 870 M940 800 L940 760" fill="none" stroke="rgba(232,238,242,0.6)" strokeWidth={5} />
              </svg>
              <Walker x={pace.x} bottom={890} height={170} face={pace.face} walk={pace.walk} glow={0.5} rgb={FLAME} />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 5, color: palette.dim }}>PASCAL ·《思想录》</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", fontSize: 64, fontWeight: 900, letterSpacing: 4 }}>
              <KineticText text="人类所有的不幸，都源于一件事：" t={t1} look={look} beat={BEAT} seed="q1" />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontSize: 76, fontWeight: 900, letterSpacing: 4 }}>
              <KineticText text="【【不能安静地待在一个房间里】】。" t={t1 - 3 * BEAT} look={look} beat={BEAT} seed="q2" />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 500, textAlign: "center", fontFamily: fonts.mono, fontSize: 19, letterSpacing: 3, color: palette.dim, opacity: en }}>“ALL OF HUMANITY’S PROBLEMS STEM FROM MAN’S INABILITY TO SIT QUIETLY IN A ROOM ALONE.”</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} n={7} rgb={FLAME} opacity={0.3} />
      <Sfx name="whoosh" at={0} volume={0.3} />
      {FACTS.map((_, i) => (
        <Sfx key={i} name="shutter" at={Math.round((i + 1) * BEAT * 0.75)} volume={0.14} />
      ))}
      <Sfx name="stamp" at={cues[1]} volume={0.45} />
      <Sfx name="stamp" at={cues[1] + 3 * BEAT} volume={0.4} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[1]} />
    </ObsFrame>
  );
};
