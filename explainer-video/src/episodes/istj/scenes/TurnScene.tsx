import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { GROUND, INK, LEAF, WARM } from "../checklist";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// Zhuangzi's two pictures, side by side.
// Left, 山木自寇: a straight, fine tree — and the axe already biting into it,
// notch after notch. Right, 膏火自煎: a lamp burning its own oil, the level
// in the dish going down. 越有用 · 越消耗.
export const TurnScene: React.FC<SceneProps> = ({ duration, lines, cues }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const notches = Math.min(5, Math.floor(Math.max(0, frame - BEAT) / BEAT));
  const oil = interpolate(frame, [0, c1 + 5 * BEAT], [1, 0.08], clamp);
  const flick = 0.9 + 0.1 * Math.sin(frame * 0.8) * Math.sin(frame * 0.31);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} hits={[...Array.from({ length: 5 }, (_, i) => (i + 1) * BEAT + BEAT), c1, ...keyHits(lines, cues, duration)]}>
        <div style={{ position: "absolute", left: 0, right: 0, top: GROUND, bottom: 0, background: "#14110e" }} />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <rect x={560} y={GROUND - 600} width={40} height={600} fill="#6a5038" />
          <ellipse cx={580} cy={GROUND - 620} rx={110} ry={150} fill={`rgba(${LEAF},0.65)`} />
          {Array.from({ length: notches }, (_, i) => <path key={i} d={`M600 ${GROUND - 140 - i * 2} l-22 10 l22 10 z`} fill="#1a120c" />)}
          <g transform={`rotate(${-20 + 10 * Math.sin((frame / BEAT) * Math.PI)} 680 ${GROUND - 140})`}>
            <line x1={600} y1={GROUND - 140} x2={720} y2={GROUND - 220} stroke="#8a6a4a" strokeWidth={8} />
            <path d={`M594 ${GROUND - 160} l20 0 l0 38 l-28 -6 z`} fill="#c9ced4" />
          </g>
          <ellipse cx={1340} cy={GROUND - 120} rx={120} ry={30} fill="#3a2c20" stroke="#c9b08a" strokeWidth={3} />
          <ellipse cx={1340} cy={GROUND - 124} rx={110 * (0.3 + 0.7 * oil)} ry={22 * (0.3 + 0.7 * oil)} fill={`rgba(${WARM},0.75)`} />
          <path d={`M1340 ${GROUND - 220 * flick} Q1366 ${GROUND - 170} 1340 ${GROUND - 140} Q1314 ${GROUND - 170} 1340 ${GROUND - 220 * flick} Z`} fill="rgba(255,236,190,0.95)" />
        </svg>
        <Halo x={1340} y={GROUND - 180} r={220} intensity={0.8 * flick * (0.5 + 0.5 * oil)} rgb={WARM} />
        <div style={{ position: "absolute", left: 460, width: 240, top: GROUND + 30, textAlign: "center", fontSize: 40, fontWeight: 900, color: palette.ink, opacity: ramp(frame, 4, 8) }}>山木自寇</div>
        <div style={{ position: "absolute", left: 1220, width: 240, top: GROUND + 30, textAlign: "center", fontSize: 40, fontWeight: 900, color: palette.ink, opacity: ramp(frame, 2 * BEAT, 8) }}>膏火自煎</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", fontSize: 56, fontWeight: 900, letterSpacing: 12, color: `rgb(${WARM})`, textShadow: `0 0 20px rgba(${WARM},0.6)`, opacity: ramp(frame, c1, 10) }}>越有用 · 越消耗</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: `rgba(${INK},0.5)`, opacity: 1 - ramp(frame, c1, 10) }}>ZHUANGZI ·《人间世》</div>
      </Cam>
      <Bokeh frame={frame} rgb={WARM} opacity={0.3} />
      {Array.from({ length: 5 }, (_, i) => (
        <Sfx key={i} name="stamp" at={(i + 2) * BEAT} volume={0.25} />
      ))}
      <Sfx name="boom" at={c1} volume={0.3} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
