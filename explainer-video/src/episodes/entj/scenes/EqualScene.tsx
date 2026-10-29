import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { FLOOR, GOLD, Level } from "../podium";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// A balance, tipped, coming level — and under it two people standing on the
// same gold line, face to face, the same height: 平等.
export const EqualScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const tilt = interpolate(frame, [0, 4 * BEAT], [18, 0], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const line = interpolate(frame, [3 * BEAT, 5 * BEAT], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} hits={[4 * BEAT, ...keyHits(lines, cues, duration)]}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <line x1={960} y1={170} x2={960} y2={320} stroke={`rgb(${GOLD})`} strokeWidth={6} />
          <g transform={`rotate(${tilt} 960 170)`}>
            <line x1={660} y1={170} x2={1260} y2={170} stroke={`rgb(${GOLD})`} strokeWidth={6} strokeLinecap="round" />
            <path d="M600 260 Q660 300 720 260 Z M1200 260 Q1260 300 1320 260 Z" fill={`rgba(${GOLD},0.6)`} />
            <line x1={660} y1={170} x2={630} y2={260} stroke={`rgba(${GOLD},0.6)`} strokeWidth={2} />
            <line x1={660} y1={170} x2={690} y2={260} stroke={`rgba(${GOLD},0.6)`} strokeWidth={2} />
            <line x1={1260} y1={170} x2={1230} y2={260} stroke={`rgba(${GOLD},0.6)`} strokeWidth={2} />
            <line x1={1260} y1={170} x2={1290} y2={260} stroke={`rgba(${GOLD},0.6)`} strokeWidth={2} />
          </g>
        </svg>
        <Halo x={960} y={FLOOR - 200} r={460} intensity={0.3 + 0.4 * line} rgb={GOLD} />
        <Stander x={800} bottom={FLOOR} height={280} lift={1} glow={0.8} rgb={GOLD} />
        <Stander x={1120} bottom={FLOOR} height={280} lift={1} glow={0.8} rgb={GOLD} />
        <Level k={line} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontSize: 54, fontWeight: 900, letterSpacing: 20, color: `rgb(${GOLD})`, opacity: line, textShadow: `0 0 20px rgba(${GOLD},0.8)` }}>平等</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontFamily: fonts.mono, fontSize: 20, letterSpacing: 8, color: palette.dim }}>HEGEL · ANERKENNUNG</div>
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} opacity={0.6} />
      <Sfx name="glint" at={4 * BEAT} volume={0.45} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
