import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Bokeh, Cam } from "../../glass/immersive";
import { HER, HIM, Leaner } from "../lovers";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// pairs of every kind: who leans on whom varies, and so do the colours
const PAIRS = [
  { x: 360, y: 430, a: HER, b: HIM, h: 1 },
  { x: 960, y: 400, a: HIM, b: HER, h: 0.95 },
  { x: 1560, y: 430, a: HER, b: HER, h: 1 },
  { x: 360, y: 720, a: HIM, b: HIM, h: 1.05 },
  { x: 960, y: 740, a: HER, b: HIM, h: 1.1 },
  { x: 1560, y: 720, a: HIM, b: HER, h: 1 },
];

// Not just one pair: a whole field of them, every kind of pair, and in each
// one of the two leaning their whole weight, losing their outline.
export const NoteScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.15, 1]}>
        {PAIRS.map((p, i) => {
          const on = interpolate(frame, [i * HALF_BEAT, i * HALF_BEAT + 8], [0, 1], clamp);
          const rock = Math.sin(frame / 9 + i) * 3;
          const h = 200 * p.h;
          return (
            <div key={i} style={{ position: "absolute", inset: 0, opacity: on }}>
              <Leaner x={p.x + 50} floor={p.y} h={h * 1.05} lean={-5 + rock * 0.7} lift={1.1} glow={0.6} rgb={p.b} />
              <Leaner x={p.x - 50} floor={p.y} h={h} lean={16 + rock} lift={0.4} glow={0.6} ghost={interpolate(frame, [2 * BEAT + i * 4, 4 * BEAT + i * 4], [0, 0.6], clamp)} rgb={p.a} />
            </div>
          );
        })}
      </Cam>
      <Bokeh frame={frame} rgb="255, 170, 190" />
      {PAIRS.map((_, i) => (
        <Sfx key={i} name="step" at={i * HALF_BEAT} volume={0.15} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
