import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { Walker } from "../../nostalgia/road";
import { Stander } from "../../doubt/circles";
import { Daylight, FIELD, Field } from "../lights";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const smooth = (frame: number, a: number, b: number) => interpolate(frame, [a, b], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
const OFF_ORDER = [3, 1, 5, 7, 0, 9, 4, 6, 2, 8];

// 0 · close on him: his light slides off him — it was landing on the empty
//     floor beside him all along. Then, one after another, every light goes
//     out.
// 1 · ordinary daylight comes up. Everyone's head is up; he walks off to the
//     right, in among them.
// 2 · the channel card.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const me = FIELD[3];
  const zoom = 1.7 - 0.7 * smooth(frame, 4 * BEAT, 7 * BEAT);
  const slide = smooth(frame, BEAT, 3 * BEAT);
  const offAt = (i: number) => 4 * BEAT + OFF_ORDER.indexOf(i) * 4;
  const day = smooth(frame, c1, c1 + 3 * BEAT);
  const walkT = Math.max(0, frame - c1 - BEAT);
  const wx = me.x + Math.min(walkT * 2.6, 300);
  const walking = walkT > 0 && walkT * 2.6 < 300;
  const card = useRamp(c2, 12);
  return (
    <ObsFrame duration={duration}>
      <Daylight k={day * 0.9 * (1 - 0.7 * card)} />
      <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.75 * card, transform: `scale(${zoom})`, transformOrigin: `${me.x}px ${me.b - me.h / 2}px` }}>
        <Field
          frame={frame}
          hide={3}
          on={(i) => interpolate(frame, [offAt(i), offAt(i) + 3], [1, 0], clamp)}
          aim={(i) => (i === 3 ? 230 * slide : 0)}
          lift={(i) => (frame < c1 ? 0.2 : 0.2 + 0.9 * smooth(frame, c1 + i * 3, c1 + i * 3 + 24))}
        />
        {walking ? (
          <Walker x={wx} bottom={me.b} height={me.h} face="right" walk={(walkT / BEAT) * Math.PI + Math.PI / 2} glow={0.6} />
        ) : (
          <Stander x={wx} bottom={me.b} height={me.h} lift={frame < c1 ? 0.2 + 0.6 * slide : 1.1} glow={0.7} />
        )}
      </div>
      {card > 0 && <EndCard opacity={card} signoffAt={c2 + BEAT} />}
      <Sfx name="whoosh" at={BEAT} volume={0.3} />
      {OFF_ORDER.map((i, k) => (
        <Sfx key={i} name="shutter" at={4 * BEAT + k * 4} volume={0.22} />
      ))}
      <Sfx name="rise" at={c1} volume={0.3} />
      {[2, 3, 4, 5].map((k) => (
        <Sfx key={k} name="step" at={c1 + k * BEAT} volume={0.15} />
      ))}
      <Sfx name="boom" at={c2} volume={0.35} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
