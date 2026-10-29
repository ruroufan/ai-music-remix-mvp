import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { GLOW, GREY } from "../cloche";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// Rolland's hero. Black fog, rolling; a figure stands in it — 见过黑暗. Then
// he strikes a light: a small flame, and the dark draws back round it —
// 还愿意点灯.
export const TurnScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const strike = 6 * BEAT;
  const light = interpolate(frame, [strike, strike + 3 * BEAT], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) });
  const spark = frame >= strike ? Math.exp(-(frame - strike) / 3) : 0;
  const flick = 0.92 + 0.08 * Math.sin(frame * 0.9) * Math.sin(frame * 0.37);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} focus={{ x: 960, y: 560 }} hits={[strike, ...keyHits(lines, cues, duration)]}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 16 }, (_, i) => {
            const x = ((random(`f${i}`) * 2200 + frame * (0.6 + random(`fv${i}`))) % 2200) - 140;
            return <ellipse key={i} cx={x} cy={200 + random(`fy${i}`) * 700} rx={220 + 120 * random(`fr${i}`)} ry={90} fill={`rgba(${GREY},${0.05 * (1 - 0.7 * light)})`} />;
          })}
        </svg>
        <Halo x={1010} y={560} r={180 + 520 * light} intensity={light * flick} rgb={GLOW} />
        <Stander x={940} bottom={860} height={330} lift={1} glow={0.2 + 0.6 * light} rgb={light > 0 ? GLOW : GREY} />
        {light > 0 && (
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <path d={`M1010 ${560 - 40 * flick} Q1026 540 1010 520 Q994 540 1010 ${560 - 40 * flick} Z`} transform="translate(0 30)" fill={`rgba(255,240,200,${light})`} />
            <circle cx={1010} cy={580} r={6} fill="#fff4d6" />
          </svg>
        )}
        {spark > 0.05 &&
          Array.from({ length: 10 }, (_, i) => {
            const a = random(`s${i}`) * 6.28, d = (1 - spark) * 80;
            return <div key={i} style={{ position: "absolute", left: 1010 + Math.cos(a) * d, top: 580 + Math.sin(a) * d, width: 4, height: 4, background: "#fff2c8", opacity: spark }} />;
          })}
        <div style={{ position: "absolute", left: 220, top: 260, fontSize: 44, fontWeight: 900, color: palette.dim, opacity: ramp(frame, BEAT, 10) * (1 - 0.5 * light) }}>见过黑暗</div>
        <div style={{ position: "absolute", left: 1220, top: 360, fontSize: 56, fontWeight: 900, color: `rgb(${GLOW})`, textShadow: `0 0 24px rgba(${GLOW},0.8)`, opacity: ramp(frame, strike + BEAT, 10) }}>还愿意点灯</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 10, color: palette.dim, opacity: ramp(frame, 4, 10) }}>ROMAIN ROLLAND · 英雄</div>
      </Cam>
      <Bokeh frame={frame} rgb={GLOW} opacity={0.15 + 0.5 * light} />
      <Sfx name="glitch" at={strike - 2} volume={0.15} />
      <Sfx name="glint" at={strike} volume={0.6} />
      <Sfx name="rise" at={strike} volume={0.3} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
