import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { KineticText } from "../../../components/Kinetic";
import { Bokeh, Cam } from "../../glass/immersive";
import { GOLD } from "../ropes";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FACTS = ["EPICTETUS", "爱比克泰德", "约 50 — 135 · 斯多葛哲学家 · 奴隶出身", "ENCHIRIDION ·《手册》"];
const OUTSIDE = ["别人的想法", "天气", "结果", "命运", "时间", "评价"];

// A profile in a frame: a bearded man with a crutch.
const Portrait: React.FC = () => (
  <svg width={300} height={360} viewBox="0 0 250 300" style={{ position: "absolute", left: 470, top: 200, overflow: "visible" }}>
    <rect x={0} y={0} width={250} height={300} rx={12} fill="rgba(14,20,28,0.9)" stroke={`rgba(${palette.halo},0.55)`} strokeWidth={2} />
    <g fill="#030405" stroke={`rgba(${palette.halo},0.85)`} strokeWidth={1.8}>
      <path d="M40 300 Q48 232 104 222 Q160 226 180 300 Z" />
      <path d="M90 236 L88 196 L122 196 L124 236 Z" />
      <path d="M80 78 Q118 52 150 84 Q160 100 158 118 L170 138 L158 144 Q162 158 154 168 Q150 200 120 206 Q92 206 80 186 Q60 150 62 120 Q62 92 80 78 Z" />
    </g>
    <line x1={200} y1={150} x2={214} y2={300} stroke="rgba(232,238,242,0.75)" strokeWidth={6} strokeLinecap="round" />
    <line x1={186} y1={152} x2={214} y2={146} stroke="rgba(232,238,242,0.75)" strokeWidth={6} strokeLinecap="round" />
  </svg>
);

// 0 · a dossier: Epictetus, born a slave, a crutch; the handbook.
// 1 · the line as a card; under it a small circle — 掌控之内 — and outside it,
//     all the rest, floating: 有些不在.
export const DiagnosisScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const file = useRamp(0, 10);
  const card = useRamp(cues[1], 8);
  const t1 = frame - cues[1];
  const circle = useRamp(cues[1] + 3 * BEAT, 12);
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
                <div key={f} style={{ position: "absolute", left: 860, top: [230, 276, 380, 440][i], opacity: p, transform: `translateX(${(1 - p) * 30}px)`, fontFamily: name ? undefined : fonts.mono, fontSize: name ? 72 : 22, fontWeight: name ? 900 : 400, letterSpacing: name ? 6 : 4, color: i === 3 ? `rgb(${palette.halo})` : name ? palette.ink : palette.dim, padding: i === 3 ? "8px 16px" : 0, border: i === 3 ? `1px solid rgba(${palette.halo},0.6)` : undefined, whiteSpace: "nowrap" }}>
                  {f}
                </div>
              );
            })}
          </div>
        )}
        {t1 >= 0 && (
          <div style={{ position: "absolute", inset: 0, opacity: card }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 130, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 5, color: palette.dim }}>EPICTETUS ·《手册》第一句</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 180, textAlign: "center", fontSize: 66, fontWeight: 900, letterSpacing: 4 }}>
              <KineticText text="有些事在我们的【【掌控之内】】，" t={t1} look={look} beat={BEAT} seed="q1" />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontSize: 66, fontWeight: 900, letterSpacing: 4 }}>
              <KineticText text="有些【不在】。" t={t1 - 2 * BEAT} look={look} beat={BEAT} seed="q2" />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 410, textAlign: "center", fontFamily: fonts.mono, fontSize: 19, letterSpacing: 3, color: palette.dim, opacity: en }}>“SOME THINGS ARE UP TO US, AND SOME ARE NOT.”</div>
            <div style={{ position: "absolute", inset: 0, opacity: circle }}>
              <div style={{ position: "absolute", left: 960 - 110, top: 640 - 110, width: 220, height: 220, borderRadius: "50%", border: `3px solid rgba(${GOLD},0.9)`, background: `radial-gradient(circle, rgba(${GOLD},0.3), rgba(${GOLD},0.05))`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 900, color: `rgb(${GOLD})` }}>掌控之内</div>
              {OUTSIDE.map((o, i) => {
                const a = (i / OUTSIDE.length) * Math.PI * 2 + frame / 120;
                return <div key={o} style={{ position: "absolute", left: 960 + Math.cos(a) * 380, top: 640 + Math.sin(a) * 150, transform: "translate(-50%, -50%)", fontSize: 26, fontWeight: 700, color: palette.dim, opacity: 0.8 }}>{o}</div>;
              })}
            </div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} n={7} />
      <Sfx name="whoosh" at={0} volume={0.3} />
      {FACTS.map((_, i) => (
        <Sfx key={i} name="shutter" at={Math.round((i + 1) * BEAT * 0.75)} volume={0.14} />
      ))}
      <Sfx name="stamp" at={cues[1]} volume={0.45} />
      <Sfx name="stamp" at={cues[1] + 2 * BEAT} volume={0.45} />
      <Sfx name="rise" at={cues[1] + 3 * BEAT} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[1]} />
    </ObsFrame>
  );
};
