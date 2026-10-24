import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { KineticText } from "../../../components/Kinetic";
import { Bokeh, Cam } from "../immersive";
import { Emperor } from "../parts";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FACTS = ["MARCUS AURELIUS", "马可 · 奥勒留", "121 — 180 · 罗马皇帝 · 斯多葛哲学家", "MEDITATIONS ·《沉思录》"];

// 0 · a dossier: the emperor at his field desk by lamplight, writing; his
//     dates; the book. The camera drifts in.
// 1 · the line, in two halves, as a card; under it the English.
export const DiagnosisScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const file = useRamp(0, 10);
  const card = useRamp(cues[1], 8);
  const t1 = frame - cues[1];
  const en = useRamp(cues[1] + 7 * BEAT, 12);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.1]}>
        {card < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: file * (1 - card) }}>
            <Halo x={560} y={500} r={380} intensity={0.6} />
            <Emperor x={560} floor={720} scale={1.25} write={frame / 30} />
            {FACTS.map((f, i) => {
              const p = interpolate(frame, [(i + 1) * BEAT * 0.75, (i + 1) * BEAT * 0.75 + 8], [0, 1], clamp);
              const name = i === 1;
              return (
                <div key={f} style={{ position: "absolute", left: 900, top: [250, 296, 400, 460][i], opacity: p, transform: `translateX(${(1 - p) * 30}px)`, fontFamily: name ? undefined : fonts.mono, fontSize: name ? 72 : 22, fontWeight: name ? 900 : 400, letterSpacing: name ? 6 : 4, color: i === 3 ? `rgb(${palette.halo})` : name ? palette.ink : palette.dim, padding: i === 3 ? "8px 16px" : 0, border: i === 3 ? `1px solid rgba(${palette.halo},0.6)` : undefined, whiteSpace: "nowrap" }}>
                  {f}
                </div>
              );
            })}
          </div>
        )}
        {t1 >= 0 && (
          <div style={{ position: "absolute", inset: 0, opacity: card }}>
            <Halo x={960} y={360} r={560} intensity={0.3} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 5, color: palette.dim }}>MARCUS AURELIUS ·《沉思录》</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 220, textAlign: "center", fontSize: 60, fontWeight: 900, letterSpacing: 4 }}>
              <KineticText text="选择【不受伤害】，你就不会觉得受了伤害；" t={t1} look={look} beat={BEAT} seed="q1" />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 350, textAlign: "center", fontSize: 60, fontWeight: 900, letterSpacing: 4 }}>
              <KineticText text="不觉得受伤害，你就【【没有受伤害】】。" t={t1 - 3 * BEAT} look={look} beat={BEAT} seed="q2" />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 520, textAlign: "center", fontFamily: fonts.mono, fontSize: 19, letterSpacing: 3, color: palette.dim, opacity: en, lineHeight: 1.8 }}>
              “CHOOSE NOT TO BE HARMED — AND YOU WON’T FEEL HARMED.
              <br />
              DON’T FEEL HARMED — AND YOU HAVEN’T BEEN.”
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
      <Sfx name="stamp" at={cues[1] + 3 * BEAT} volume={0.5} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[1]} />
    </ObsFrame>
  );
};
