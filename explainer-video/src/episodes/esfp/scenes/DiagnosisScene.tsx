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
import { Bread, GOLD, LEAF, WARM } from "../stage";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FACTS = ["EPICURUS", "伊壁鸠鲁", "前341 — 前270 · 古希腊哲学家", "THE GARDEN · 雅典城外的花园"];

// Epicurus: curly hair, a full curly beard, a plain cloak over one shoulder
const Portrait: React.FC = () => (
  <svg width={300} height={360} viewBox="0 0 250 300" style={{ position: "absolute", left: 470, top: 200, overflow: "visible" }}>
    <rect x={0} y={0} width={250} height={300} rx={12} fill="rgba(14,20,28,0.9)" stroke={`rgba(${palette.halo},0.55)`} strokeWidth={2} />
    <g fill="#030405" stroke={`rgba(${palette.halo},0.85)`} strokeWidth={1.8}>
      <path d="M30 300 Q40 232 100 220 Q162 226 184 300 Z" />
      <path d="M60 300 Q120 240 190 260 L184 300 Z" fill="rgba(232,238,242,0.35)" />
      <path d="M86 84 Q90 54 124 52 Q158 54 162 86 L162 140 Q150 160 124 160 Q98 160 86 140 Z" />
      {[[86, 70], [100, 54], [124, 46], [148, 54], [162, 70], [80, 92], [168, 92]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r={13} fill="rgba(232,238,242,0.55)" />)}
      {[[90, 150], [106, 170], [124, 180], [142, 170], [158, 150], [100, 196], [124, 206], [148, 196]].map(([x, y]) => <circle key={`b${x}${y}`} cx={x} cy={y} r={14} fill="rgba(232,238,242,0.7)" />)}
    </g>
  </svg>
);

// 0 · a dossier: Epicurus, and his Garden outside Athens.
// 1 · the line as a card — 在智慧为一生幸福所准备的一切之中， / 最重要的是友谊。
//     — and under it a small table with a loaf on it, and two chairs drawn
//     up to it, side by side.
export const DiagnosisScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const file = useRamp(0, 10);
  const card = useRamp(cues[1], 8);
  const t1 = frame - cues[1];
  const en = useRamp(cues[1] + 5 * BEAT, 12);
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
              <Halo x={960} y={740} r={260} intensity={0.5} rgb={WARM} />
              <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
                <ellipse cx={960} cy={760} rx={150} ry={20} fill="#3a2c20" stroke={`rgba(${WARM},0.6)`} strokeWidth={2} />
                <rect x={952} y={778} width={16} height={110} fill="#2a2018" />
                {[-1, 1].map((d) => (
                  <path key={d} d={`M${960 + d * 210} 890 L${960 + d * 210} 800 L${960 + d * 170} 800 L${960 + d * 170} 890 M${960 + d * 210} 800 L${960 + d * 216} 700`} fill="none" stroke={`rgba(${LEAF},0.7)`} strokeWidth={5} />
                ))}
              </svg>
              <Bread x={960} y={752} s={0.9 + 0.05 * Math.sin(t1 / 10)} />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 5, color: palette.dim }}>EPICURUS ·《主要学说》</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", fontSize: 64, fontWeight: 900, letterSpacing: 4 }}>
              <KineticText text="在智慧为一生幸福所准备的一切之中，" t={t1} look={look} beat={BEAT} seed="q1" />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontSize: 96, fontWeight: 900, letterSpacing: 8 }}>
              <KineticText text="最重要的是【【友谊】】。" t={t1 - 3 * BEAT} look={look} beat={BEAT} seed="q2" />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 500, textAlign: "center", fontFamily: fonts.mono, fontSize: 16, letterSpacing: 2, color: palette.dim, opacity: en, padding: "0 120px" }}>“OF ALL THE MEANS WHICH WISDOM ACQUIRES TO ENSURE HAPPINESS THROUGHOUT THE WHOLE OF LIFE, BY FAR THE MOST IMPORTANT IS FRIENDSHIP.”</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} n={7} rgb={GOLD} opacity={0.3} />
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
