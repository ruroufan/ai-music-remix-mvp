import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { GOLD, Measurer, STEEL } from "../ruler";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
// a grid maze seen from above: many ways through
const PATHS = [
  "M200 900 L200 700 L500 700 L500 400 L900 400 L900 160",
  "M200 900 L700 900 L700 600 L1200 600 L1200 160",
  "M200 900 L200 300 L600 300 L600 160",
  "M200 900 L1000 900 L1000 750 L1500 750 L1500 160",
  "M200 900 L400 900 L400 550 L1300 550 L1300 300 L1700 300 L1700 160",
];

// 0 · a maze from above, and many ways through it, all faint.
// 1 · every way but one goes dark; one lights up gold — and he stands at its
//     start, ruler out, pointing down it: 这条. 正确的路 · 只有一条？
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const draw = (i: number) => ramp(frame, 4 + i * 6, 20);
  const one = ramp(frame, c1 + BEAT, 10);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} hits={[c1 + BEAT, ...keyHits(lines, cues, duration)]}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {PATHS.map((d, i) => {
            const mine = i === 1;
            return <path key={i} d={d} fill="none" stroke={mine && one > 0 ? `rgb(${GOLD})` : `rgba(${STEEL},${0.5 * (1 - 0.8 * one)})`} strokeWidth={mine ? 10 + 6 * one : 8} strokeLinejoin="round" strokeDasharray="3000" strokeDashoffset={3000 * (1 - draw(i))} />;
          })}
        </svg>
        <Measurer x={140} bottom={940} height={240} rot={-20} glow={0.6 * one} />
        <div style={{ position: "absolute", left: 1240, top: 470, fontSize: 40, fontWeight: 900, color: `rgb(${GOLD})`, opacity: one }}>这条</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontFamily: fonts.mono, fontSize: 26, letterSpacing: 8, color: palette.dim, opacity: 1 - one }}>很多条路</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 110, textAlign: "center", fontSize: 48, fontWeight: 900, letterSpacing: 8, color: palette.ink, opacity: ramp(frame, c1 + 3 * BEAT, 10) }}>正确的路 · 只有一条？</div>
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} opacity={0.3} />
      {PATHS.map((_, i) => (
        <Sfx key={i} name="shutter" at={4 + i * 6} volume={0.12} />
      ))}
      <Sfx name="glint" at={c1 + BEAT} volume={0.5} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
