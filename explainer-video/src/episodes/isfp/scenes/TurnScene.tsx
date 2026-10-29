import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { ROSE, SKY, WARM } from "../crack";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// 你, lit, on the right. On the left 我 — only an outline. A beam of light
// travels from 你 across to 我, and 我 fills in from it. Under them, Buber's
// own words: Der Mensch wird am Du zum Ich.
export const TurnScene: React.FC<SceneProps> = ({ duration, lines, cues }) => {
  const frame = useCurrentFrame();
  const you = ramp(frame, 4, 10);
  const beam = interpolate(frame, [2 * BEAT, 4 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const fill = ramp(frame, 4 * BEAT, 12);
  const de = ramp(frame, 6 * BEAT, 12);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} hits={[4 * BEAT, ...keyHits(lines, cues, duration)]}>
        <Halo x={1300} y={420} r={300} intensity={0.7 * you} rgb={SKY} />
        <Halo x={620} y={420} r={300 * fill} intensity={0.8 * fill} rgb={ROSE} />
        <div style={{ position: "absolute", left: 1150, width: 300, top: 290, textAlign: "center", fontSize: 260, fontWeight: 900, lineHeight: 1, color: `rgb(${SKY})`, opacity: you, textShadow: `0 0 40px rgba(${SKY},0.6)` }}>你</div>
        <div style={{ position: "absolute", left: 470, width: 300, top: 290, textAlign: "center", fontSize: 260, fontWeight: 900, lineHeight: 1, color: `rgba(${ROSE},${fill})`, WebkitTextStroke: `3px rgba(${ROSE},0.8)`, opacity: you, textShadow: fill > 0.5 ? `0 0 40px rgba(${ROSE},0.6)` : undefined }}>我</div>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="isfp-beam" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0" stopColor={`rgb(${SKY})`} />
              <stop offset="1" stopColor={`rgb(${WARM})`} />
            </linearGradient>
          </defs>
          <line x1={1140} y1={420} x2={1140 - (1140 - 790) * beam} y2={420} stroke="url(#isfp-beam)" strokeWidth={6} strokeLinecap="round" opacity={beam * (1 - 0.6 * fill)} />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 8, color: palette.dim, opacity: you }}>通过「你」· 成为「我」</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: palette.dim, opacity: de }}>“DER MENSCH WIRD AM DU ZUM ICH.”</div>
      </Cam>
      <Bokeh frame={frame} rgb={WARM} opacity={0.3 + 0.3 * fill} />
      <Sfx name="whoosh" at={2 * BEAT} volume={0.3} />
      <Sfx name="glint" at={4 * BEAT} volume={0.45} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
