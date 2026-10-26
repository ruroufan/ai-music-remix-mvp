import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { SOFT, WARM } from "../jar";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// He keeps stepping back as the others come forward — 一直退让 — until on the
// beat a soft, warm line draws itself round him on the floor. The others walk
// up to it and stop there, and nod. 边界.
export const TurnScene: React.FC<SceneProps> = ({ duration, lines, cues }) => {
  const frame = useCurrentFrame();
  const draw = 4 * BEAT;
  const back = interpolate(frame, [0, draw], [0, 1], clamp);
  const ring = interpolate(frame, [draw, draw + 12], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const me = 960 + 120 * back;
  const come = (side: number) => interpolate(frame, [0, draw + 2 * BEAT], [side < 0 ? 300 : 1620, side < 0 ? 700 : 1220 + 120 * back], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} hits={[draw, ...keyHits(lines, cues, duration)]}>
        <Halo x={me} y={700} r={260} intensity={0.6 * ring} rgb={WARM} />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <ellipse cx={me} cy={900} rx={200} ry={44} fill="none" stroke={`rgb(${WARM})`} strokeWidth={5} strokeDasharray="1300" strokeDashoffset={1300 * (1 - ring)} />
        </svg>
        <Stander x={come(-1)} bottom={900} height={360} lift={1} glow={0.4} rgb={SOFT} />
        <Stander x={come(1)} bottom={900} height={360} lift={1} glow={0.4} rgb={SOFT} />
        <Stander x={me} bottom={900} height={380} lift={ring} glow={0.5 + 0.4 * ring} rgb={ring > 0.5 ? WARM : SOFT} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", fontSize: 44, fontWeight: 900, color: palette.dim, opacity: 1 - ring }}>温柔 ≠ 一直退让</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 160, textAlign: "center", fontSize: 64, fontWeight: 900, letterSpacing: 16, color: `rgb(${WARM})`, textShadow: `0 0 24px rgba(${WARM},0.7)`, opacity: ramp(frame, draw + 6, 10) }}>边 界</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 8, color: palette.dim, opacity: ramp(frame, draw + 2 * BEAT, 10) }}>让别人知道 · 在哪里</div>
      </Cam>
      <Bokeh frame={frame} rgb={WARM} opacity={0.2 + 0.4 * ring} />
      <Sfx name="step" at={BEAT} volume={0.2} />
      <Sfx name="step" at={3 * BEAT} volume={0.2} />
      <Sfx name="glint" at={draw} volume={0.55} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
