import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { KineticText } from "../../../components/Kinetic";
import { Bokeh, Cam } from "../../glass/immersive";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { Stander } from "../../doubt/circles";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FACTS = ["LUCIUS ANNAEUS SENECA", "塞涅卡", "约前 4 — 65 · 古罗马斯多葛哲学家", "EPISTULAE MORALES AD LUCILIUM · 书信 II"];

const Portrait: React.FC = () => (
  <svg width={300} height={360} viewBox="0 0 250 300" style={{ position: "absolute", left: 470, top: 200, overflow: "visible" }}>
    <rect x={0} y={0} width={250} height={300} rx={12} fill="rgba(14,20,28,0.9)" stroke={`rgba(${palette.halo},0.55)`} strokeWidth={2} />
    <g fill="#030405" stroke={`rgba(${palette.halo},0.85)`} strokeWidth={1.8}>
      <path d="M30 300 Q40 226 104 214 Q168 222 190 300 Z" />
      <path d="M56 260 Q90 236 128 250 L170 300 L120 300 Z" fill="rgba(232,238,242,0.35)" />
      <path d="M92 222 L90 192 L122 192 L124 222 Z" />
      <path d="M80 82 Q114 56 148 80 Q160 98 158 118 L170 138 L158 144 Q162 158 154 168 Q150 186 126 188 L100 196 Q66 192 62 146 Q58 100 80 82 Z" />
      <path d="M100 196 Q84 184 76 160 Q96 176 126 188 Q150 186 154 168 Q158 196 126 208 Q108 210 100 196 Z" fill="rgba(232,238,242,0.55)" />
      <path d="M78 92 Q76 64 110 58 Q140 56 154 82 Q132 72 108 76 Q90 80 78 92 Z" fill="rgba(232,238,242,0.45)" />
    </g>
  </svg>
);

// 0 · a dossier: Seneca, his letters to Lucilius.
// 1 · the line as a card; behind it one figure scattered into a dozen faint
//     copies of himself, all over the frame — everywhere, so nowhere.
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
                <div key={f} style={{ position: "absolute", left: 860, top: [230, 276, 380, 440][i], opacity: p, transform: `translateX(${(1 - p) * 30}px)`, fontFamily: name ? undefined : fonts.mono, fontSize: name ? 72 : i === 3 ? 19 : 22, fontWeight: name ? 900 : 400, letterSpacing: name ? 8 : 4, color: i === 3 ? `rgb(${palette.halo})` : name ? palette.ink : palette.dim, padding: i === 3 ? "8px 16px" : 0, border: i === 3 ? `1px solid rgba(${palette.halo},0.6)` : undefined, whiteSpace: "nowrap" }}>
                  {f}
                </div>
              );
            })}
          </div>
        )}
        {t1 >= 0 && (
          <div style={{ position: "absolute", inset: 0, opacity: card }}>
            {Array.from({ length: 12 }, (_, i) => {
              const x = 200 + random(`cp-x-${i}`) * 1520, y = 600 + random(`cp-y-${i}`) * 120;
              const sc = 0.5 + random(`cp-s-${i}`) * 0.4;
              return (
                <div key={i} style={{ position: "absolute", inset: 0, opacity: 0.32 + 0.12 * Math.sin(frame / 9 + i) }}>
                  <Stander x={x} bottom={y + 120 * sc} height={240 * sc} lift={0.6} glow={0.6} />
                </div>
              );
            })}
            <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 5, color: palette.dim }}>SENECA · 《道德书简》第二封</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", fontSize: 66, fontWeight: 900, letterSpacing: 4 }}>
              <KineticText text="处处都在的人，" t={t1} look={look} beat={BEAT} seed="q1" />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", fontSize: 58, fontWeight: 900, letterSpacing: 4 }}>
              <KineticText text="【【哪里都不在】】。" t={t1 - 3 * BEAT} look={look} beat={BEAT} seed="q2" />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 450, textAlign: "center", fontFamily: fonts.mono, fontSize: 19, letterSpacing: 3, color: palette.dim, opacity: en }}>“NUSQUAM EST QUI UBIQUE EST.”</div>
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
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[1]} />
    </ObsFrame>
  );
};
