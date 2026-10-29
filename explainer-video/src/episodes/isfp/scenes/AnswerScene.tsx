import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { FLOOR, Ground, Him, Meeting, Other, RIFT, ROSE, SKY, WARM } from "../crack";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const LINE = 760; // the line on the floor between the two zones

// The floor split in two: on the left, dim, 我与它; on the right, lit, 我与你 —
// where the other person stands.
// 0 · he stands on the line between them.
// 1 · in 我与你 the air crackles — conflict, little bolts — and he takes one
//     step back across the line. 一步就够.
// 2 · a dashed circle closes round him — 边界 — and over in 我与你 the warm
//     light that was waiting there fades out: 错过.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const zones = ramp(frame, 4, 12);
  const spark = interpolate(frame, [c1 + BEAT, c1 + 2 * BEAT, c2, c2 + 8], [0, 1, 1, 0], clamp);
  const step = interpolate(frame, [c1 + 4 * BEAT, c1 + 6 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const x = LINE + 20 - 300 * step;
  const ring = ramp(frame, c2 + BEAT, 14);
  const glow = frame < c2 ? ramp(frame, 8, 14) * 0.6 : 0.6 * (1 - ramp(frame, c2 + 3 * BEAT, 20));
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} hits={[c1 + 2 * BEAT, c1 + 6 * BEAT, c2 + 2 * BEAT, ...keyHits(lines, cues, duration)]}>
        <div style={{ position: "absolute", left: 0, top: 0, width: LINE, height: 1080, background: "rgba(8,10,14,0.6)", opacity: zones }} />
        <Halo x={1380} y={500} r={600} intensity={0.25 * zones} rgb={WARM} />
        <Ground />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: zones }}>
          <line x1={LINE} y1={180} x2={LINE} y2={FLOOR + 60} stroke="rgba(232,238,242,0.35)" strokeWidth={2} strokeDasharray="10 10" />
        </svg>
        <div style={{ position: "absolute", left: 0, width: LINE, top: 150, textAlign: "center", fontSize: 48, fontWeight: 900, letterSpacing: 10, color: palette.dim, opacity: zones }}>我与它</div>
        <div style={{ position: "absolute", left: LINE, right: 0, top: 150, textAlign: "center", fontSize: 48, fontWeight: 900, letterSpacing: 10, color: `rgb(${WARM})`, opacity: zones }}>我与你</div>
        <Meeting x={1180} y={FLOOR - 200} k={glow} frame={frame} />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: spark }}>
          {Array.from({ length: 6 }, (_, i) => {
            const flick = random(`b${i}${Math.floor(frame / 3)}`);
            const bx = 900 + random(`bx${i}`) * 560, by = 300 + random(`by${i}`) * 280;
            return flick > 0.4 ? <path key={i} d={`M${bx} ${by} l-14 30 l20 0 l-16 34`} fill="none" stroke={`rgb(${RIFT})`} strokeWidth={4} /> : null;
          })}
        </svg>
        <div style={{ position: "absolute", left: 1220, top: 240, fontFamily: fonts.mono, fontSize: 24, letterSpacing: 6, color: `rgb(${RIFT})`, opacity: spark }}>冲突</div>
        <Other x={1460} glow={0.4} />
        <Him x={x} face="right" walk={step > 0 && step < 1 ? (300 * step) / 26 : 0} glow={0.6} />
        <div style={{ position: "absolute", left: 420, top: 300, fontFamily: fonts.mono, fontSize: 24, letterSpacing: 6, color: palette.dim, opacity: ramp(frame, c1 + 6 * BEAT, 8) * (1 - ring) }}>一步就够</div>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: ring }}>
          <ellipse cx={x} cy={FLOOR - 160} rx={190} ry={250} fill="none" stroke={`rgb(${ROSE})`} strokeWidth={4} strokeDasharray={`${1400 * ring} 2000`} />
        </svg>
        <div style={{ position: "absolute", left: x - 200, width: 400, top: 230, textAlign: "center", fontSize: 34, fontWeight: 900, letterSpacing: 8, color: `rgb(${ROSE})`, opacity: ring }}>边界</div>
        <div style={{ position: "absolute", left: 1100, width: 160, top: FLOOR - 390, textAlign: "center", fontSize: 34, fontWeight: 900, letterSpacing: 8, color: `rgba(${SKY},0.8)`, opacity: ramp(frame, c2 + 5 * BEAT, 10) }}>错过</div>
      </Cam>
      <Bokeh frame={frame} rgb={ROSE} opacity={0.3} />
      <Sfx name="glitch" at={c1 + BEAT} volume={0.3} />
      <Sfx name="glitch" at={c1 + 2 * BEAT} volume={0.25} />
      <Sfx name="step" at={c1 + 5 * BEAT} volume={0.3} />
      <Sfx name="stamp" at={c1 + 6 * BEAT} volume={0.35} />
      <Sfx name="whoosh" at={c2 + BEAT} volume={0.3} />
      <Sfx name="glint" at={c2 + 5 * BEAT} volume={0.3} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
