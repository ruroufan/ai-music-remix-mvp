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
import { LEAF, RED } from "../ruler";
import { Stander } from "../../doubt/circles";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FACTS = ["JOHN STUART MILL", "密尔", "1806 — 1873 · 英国哲学家", "ON LIBERTY · 1859"];

const Portrait: React.FC = () => (
  <svg width={300} height={360} viewBox="0 0 250 300" style={{ position: "absolute", left: 470, top: 200, overflow: "visible" }}>
    <rect x={0} y={0} width={250} height={300} rx={12} fill="rgba(14,20,28,0.9)" stroke={`rgba(${palette.halo},0.55)`} strokeWidth={2} />
    <g fill="#030405" stroke={`rgba(${palette.halo},0.85)`} strokeWidth={1.8}>
      <path d="M36 300 Q44 228 104 216 Q164 222 184 300 Z" />
      <path d="M84 238 L80 214 Q104 230 132 214 L128 238 Z" fill="rgba(232,238,242,0.5)" />
      <path d="M92 222 L90 192 L122 192 L124 222 Z" />
      <path d="M78 96 Q88 58 122 60 Q154 62 160 96 L170 132 L160 138 Q164 156 156 166 Q150 184 126 186 L100 194 Q68 190 64 146 Q60 112 78 96 Z" />
      <path d="M78 104 Q52 96 54 126 Q48 150 72 156 Q64 130 78 104 Z" fill="rgba(232,238,242,0.75)" />
      <path d="M156 100 Q182 96 182 124 Q186 146 164 150 Q172 126 156 100 Z" fill="rgba(232,238,242,0.75)" />
    </g>
  </svg>
);

// 0 · a dossier: John Stuart Mill, On Liberty.
// 1 · the line as a card — 即使全人类 / 只有一个人持不同意见， / 人类也没有
//     理由让他沉默。 — and under it, a row of grey figures and one in colour,
//     standing a little apart.
export const DiagnosisScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const file = useRamp(0, 10);
  const card = useRamp(cues[1], 8);
  const t1 = frame - cues[1];
  const en = useRamp(cues[1] + 8 * BEAT, 12);
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
            <div style={{ position: "absolute", inset: 0, opacity: Math.min(1, Math.max(0, (t1 - 6 * BEAT) / 15)) }}>
              {[700, 760, 820, 880, 940, 1000, 1060].map((x) => <Stander key={x} x={x} bottom={980} height={130} lift={1} glow={0.2} rgb="150, 156, 166" />)}
              <Stander x={1180} bottom={980} height={130} lift={1.5} glow={0.9} rgb={LEAF} />
              <div style={{ position: "absolute", left: 1210, top: 830, padding: "2px 10px", borderRadius: 8, border: `2px solid rgb(${RED})`, fontSize: 18, fontWeight: 800, color: `rgb(${RED})` }}>我不同意</div>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 5, color: palette.dim }}>MILL ·《论自由》</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", fontSize: 72, fontWeight: 900, letterSpacing: 4 }}>
              <KineticText text="即使全人类" t={t1} look={look} beat={BEAT} seed="q1" />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 310, textAlign: "center", fontSize: 72, fontWeight: 900, letterSpacing: 4 }}>
              <KineticText text="只有一个人持不同意见，" t={t1 - 3 * BEAT} look={look} beat={BEAT} seed="q2" />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center", fontSize: 92, fontWeight: 900, letterSpacing: 8 }}>
              <KineticText text="人类也没有理由【【让他沉默】】。" t={t1 - 6 * BEAT} look={look} beat={BEAT} seed="q3" />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: fonts.mono, fontSize: 19, letterSpacing: 3, color: palette.dim, opacity: en }}>“IF ALL MANKIND MINUS ONE WERE OF ONE OPINION … MANKIND WOULD BE NO MORE JUSTIFIED IN SILENCING THAT ONE PERSON.”</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} n={7} />
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
