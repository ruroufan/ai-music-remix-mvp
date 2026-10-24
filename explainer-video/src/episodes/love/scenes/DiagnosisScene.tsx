import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { KineticText } from "../../../components/Kinetic";
import { Bokeh, Cam } from "../../glass/immersive";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FACTS = ["SIMONE DE BEAUVOIR", "西蒙娜 · 德 · 波伏娃", "1908 — 1986 · 法国哲学家", "LE DEUXIÈME SEXE · 1949 ·《第二性》"];

// A profile in a frame: hair wrapped up high, a pen.
const Portrait: React.FC = () => (
  <svg width={300} height={360} viewBox="0 0 250 300" style={{ position: "absolute", left: 470, top: 200, overflow: "visible" }}>
    <rect x={0} y={0} width={250} height={300} rx={12} fill="rgba(14,20,28,0.9)" stroke={`rgba(${palette.halo},0.55)`} strokeWidth={2} />
    <g fill="#030405" stroke={`rgba(${palette.halo},0.85)`} strokeWidth={1.8}>
      <path d="M40 300 Q48 232 104 222 Q160 226 180 300 Z" />
      <path d="M90 236 L88 196 L122 196 L124 236 Z" />
      <path d="M80 80 Q118 56 150 86 Q160 102 158 120 L170 140 L158 146 Q162 160 154 170 Q150 186 126 188 L100 198 Q66 194 62 146 Q58 100 80 80 Z" />
      {/* the turban */}
      <path d="M70 96 Q60 40 110 34 Q160 30 160 82 Q140 66 110 70 Q86 74 70 96 Z" fill={`rgba(${palette.halo},0.35)`} />
    </g>
    <line x1={186} y1={250} x2={226} y2={200} stroke="rgba(232,238,242,0.8)" strokeWidth={4} strokeLinecap="round" />
  </svg>
);

// 0 · a dossier: Beauvoir, her dates, the 1949 book.
// 1 · the line as a card — 强大 lands gold — with the English under it.
export const DiagnosisScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const file = useRamp(0, 10);
  const card = useRamp(cues[1], 8);
  const t1 = frame - cues[1];
  const en = useRamp(cues[1] + 6 * BEAT, 12);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.08]}>
        {card < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: file * (1 - card) }}>
            <Halo x={620} y={380} r={360} intensity={0.5} />
            <Portrait />
            {FACTS.map((f, i) => {
              const p = interpolate(frame, [(i + 1) * BEAT * 0.75, (i + 1) * BEAT * 0.75 + 8], [0, 1], clamp);
              const name = i === 1;
              return (
                <div key={f} style={{ position: "absolute", left: 860, top: [230, 276, 380, 440][i], opacity: p, transform: `translateX(${(1 - p) * 30}px)`, fontFamily: name ? undefined : fonts.mono, fontSize: name ? 66 : 22, fontWeight: name ? 900 : 400, letterSpacing: name ? 4 : 4, color: i === 3 ? `rgb(${palette.halo})` : name ? palette.ink : palette.dim, padding: i === 3 ? "8px 16px" : 0, border: i === 3 ? `1px solid rgba(${palette.halo},0.6)` : undefined, whiteSpace: "nowrap" }}>
                  {f}
                </div>
              );
            })}
          </div>
        )}
        {t1 >= 0 && (
          <div style={{ position: "absolute", inset: 0, opacity: card }}>
            <Halo x={960} y={340} r={560} intensity={0.3} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 5, color: palette.dim }}>SIMONE DE BEAUVOIR ·《第二性》1949</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", fontSize: 66, fontWeight: 900, letterSpacing: 4 }}>
              <KineticText text="总有一天，女人可以用她的【【强大】】，" t={t1} look={look} beat={BEAT} seed="q1" />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 370, textAlign: "center", fontSize: 66, fontWeight: 900, letterSpacing: 4 }}>
              <KineticText text="而不是她的【软弱】去爱。" t={t1 - 3 * BEAT} look={look} beat={BEAT} seed="q2" />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 520, textAlign: "center", fontFamily: fonts.mono, fontSize: 19, letterSpacing: 3, color: palette.dim, opacity: en }}>“…TO LOVE NOT IN HER WEAKNESS BUT IN HER STRENGTH.”</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} n={7} rgb="255, 170, 190" />
      <Sfx name="whoosh" at={0} volume={0.3} />
      {FACTS.map((_, i) => (
        <Sfx key={i} name="shutter" at={Math.round((i + 1) * BEAT * 0.75)} volume={0.14} />
      ))}
      <Sfx name="stamp" at={cues[1]} volume={0.45} />
      <Sfx name="stamp" at={cues[1] + 3 * BEAT} volume={0.45} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[1]} />
    </ObsFrame>
  );
};
