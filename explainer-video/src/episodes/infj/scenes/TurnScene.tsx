import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { COOL, LAMP } from "../lantern";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// Two ways to be understood. Left: an eye, a beam going through someone —
// 被看穿 — struck out. Right: a speech bubble, lit from inside — 被告诉.
export const TurnScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const eye = ramp(frame, 4, 10);
  const strike = interpolate(frame, [3 * BEAT, 3 * BEAT + 6], [0, 1], clamp);
  const told = ramp(frame, 5 * BEAT, 10);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} hits={[3 * BEAT, 5 * BEAT, ...keyHits(lines, cues, duration)]}>
        <div style={{ position: "absolute", inset: 0, opacity: eye * (1 - 0.6 * strike) }}>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <path d="M380 420 Q540 300 700 420 Q540 540 380 420 Z" fill="none" stroke={`rgb(${COOL})`} strokeWidth={5} />
            <circle cx={540} cy={420} r={44} fill={`rgba(${COOL},0.6)`} />
            <path d="M600 420 L860 380 L860 460 Z" fill={`rgba(${COOL},0.18)`} />
          </svg>
          <div style={{ position: "absolute", left: 340, width: 400, top: 580, textAlign: "center", fontSize: 72, fontWeight: 900, color: palette.dim }}>
            被看穿
            <div style={{ position: "absolute", left: 20, right: 20, top: 46, height: 8, background: palette.alert, transformOrigin: "0 50%", transform: `scaleX(${strike})` }} />
          </div>
        </div>
        <div style={{ position: "absolute", inset: 0, opacity: told }}>
          <Halo x={1380} y={420} r={300} intensity={0.8} rgb={LAMP} />
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <path d="M1180 320 Q1180 270 1230 270 L1530 270 Q1580 270 1580 320 L1580 480 Q1580 530 1530 530 L1320 530 L1250 600 L1260 530 L1230 530 Q1180 530 1180 480 Z" fill={`rgba(${LAMP},0.25)`} stroke={`rgb(${LAMP})`} strokeWidth={5} />
          </svg>
          <div style={{ position: "absolute", left: 1180, width: 400, top: 360, textAlign: "center", fontSize: 50, fontWeight: 900, color: palette.ink }}>“其实我……”</div>
          <div style={{ position: "absolute", left: 1180, width: 400, top: 620, textAlign: "center", fontSize: 72, fontWeight: 900, color: `rgb(${LAMP})`, textShadow: `0 0 30px rgba(${LAMP},0.8)` }}>被告诉</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 160, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim, opacity: eye }}>被理解 =</div>
      </Cam>
      <Bokeh frame={frame} rgb={LAMP} opacity={0.4 + 0.4 * told} />
      <Sfx name="glitch" at={3 * BEAT} volume={0.3} />
      <Sfx name="glint" at={5 * BEAT} volume={0.5} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
