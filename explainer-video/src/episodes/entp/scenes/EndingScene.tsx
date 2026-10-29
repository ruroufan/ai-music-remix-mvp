import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { Halo } from "../../../channels/backlit/parts";
import { fonts } from "../../../channels/backlit/look";
import { Walker } from "../../nostalgia/road";
import { Seated } from "../../friction/tangle";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { GOLD, MAT, Ring, RingLight } from "../ring";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FLOOR = 880;

// The episode's picture.
// 0 · the ring is empty. He climbs out between the ropes and walks down,
//     the ring sinking into the dark behind him, to an empty chair — and
//     sits. Across from him, in the other chair, the one he knocked down.
// 1 · face to face. A gold bubble from him: 你说得有道理. Between the two
//     chairs, a light starts to grow — 真理 — closer to both of them.
// 2 · the channel card.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const walk = interpolate(frame, [BEAT, 5 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const sat = frame >= 5 * BEAT;
  const sink = interpolate(frame, [2 * BEAT, 6 * BEAT], [1, 0], clamp);
  const other = interpolate(frame, [4 * BEAT, 6 * BEAT], [0, 1], clamp);
  const bubble = interpolate(frame, [2 * BEAT, 2 * BEAT + 8], [0, 1], clamp) * (sat ? 1 : 0);
  const light = interpolate(frame, [c1, c1 + 4 * BEAT], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) });
  const card = useRamp(c2, 12);
  // the walk: from the ring's centre down to the chair at x 800
  const x = 960 - 160 * walk;
  const y = MAT + (FLOOR - MAT) * walk - Math.sin(walk * Math.PI) * 40;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1.06, 1]} focus={{ x: 960, y: 620 }} hits={[5 * BEAT, c1, ...keyHits(lines, cues, duration)]}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.92 * card }}>
          {sink > 0.01 && (
            <div style={{ position: "absolute", inset: 0, opacity: sink, transform: `translateY(${(1 - sink) * 200}px) scale(${0.85 + 0.15 * sink})`, transformOrigin: "960px 600px" }}>
              <RingLight k={sink} />
              <Ring />
            </div>
          )}
          <Halo x={960} y={640} r={180 + 260 * light} intensity={0.8 * light} rgb={GOLD} />
          <div style={{ position: "absolute", left: 860, width: 200, top: 600, textAlign: "center", fontSize: 40, fontWeight: 900, color: `rgba(${GOLD},${light})`, textShadow: `0 0 24px rgba(${GOLD},0.9)` }}>真理</div>
          {/* his chair (facing right) and the other one's (mirrored, facing left) */}
          {sat ? <Seated x={800} floor={FLOOR} scale={1.3} glow={0.7} /> : <Walker x={x} bottom={y} height={260} face="left" walk={walk * 6} glow={0.9} rgb={GOLD} />}
          <div style={{ position: "absolute", inset: 0, opacity: other, transform: "scaleX(-1)", transformOrigin: "960px 0" }}>
            <Seated x={800} floor={FLOOR} scale={1.3} glow={0.5} />
          </div>
          {/* empty seats behind */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: "rgba(232,238,242,0.45)", opacity: other * (1 - light) }}>面对面</div>
          <div style={{ position: "absolute", left: 520, top: 470, padding: "12px 24px", borderRadius: 18, background: `rgba(${GOLD},0.14)`, border: `2px solid rgb(${GOLD})`, fontSize: 34, fontWeight: 800, color: `rgb(${GOLD})`, opacity: bubble * (1 - card) }}>你说得有道理</div>
        </div>
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} opacity={(0.4 + 0.6 * light) * (1 - card)} />
      {card > 0 && <EndCard opacity={card} signoffAt={c2 + BEAT} />}
      {[0, 1, 2, 3].map((i) => (
        <Sfx key={i} name="step" at={BEAT + i * BEAT} volume={0.3} />
      ))}
      <Sfx name="whoosh" at={5 * BEAT} volume={0.3} />
      <Sfx name="glint" at={2 * BEAT} volume={0.3} />
      <Sfx name="rise" at={c1} volume={0.3} />
      <Sfx name="boom" at={c2} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
