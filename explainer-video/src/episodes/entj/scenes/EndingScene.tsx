import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { fonts } from "../../../channels/backlit/look";
import { Walker } from "../../nostalgia/road";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { CROWD_X, Crowd, FLOOR, GOLD, Level, Spot, Stage, STEP, stageTop, stepAt } from "../podium";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ORDER = [3, 4, 2, 5, 1, 6, 0, 7]; // heads come up from the middle outwards

// The episode's picture. 0 · he walks down off the stage, one step per beat;
//     the spotlight lets go of him; as he reaches the floor the stage sinks
//     away, and one by one, from the middle out, the people raise their heads.
// 1 · everyone upright on the same gold line; the nearest one steps over to
//     stand beside him.
// 2 · the channel card.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  // walking down: four steps, one per beat, from the top
  const k = interpolate(frame, [BEAT, (STEP.n + 1) * BEAT], [STEP.n, 0], clamp);
  const kf = Math.floor(k), kc = Math.ceil(k);
  const a = stepAt(kc, 1), b = stepAt(kf, 1);
  const f = kc - k;
  const pos = frame < BEAT ? { x: 960, y: stageTop(1) } : { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f - Math.sin(f * Math.PI) * 18 };
  const down = frame >= (STEP.n + 1) * BEAT;
  const sink = interpolate(frame, [(STEP.n + 1) * BEAT, (STEP.n + 3) * BEAT], [1, 0], { ...clamp, easing: (t) => t * t });
  const walkIn = interpolate(frame, [(STEP.n + 1) * BEAT, (STEP.n + 3) * BEAT], [0, 1], clamp);
  const liftAt = (i: number) => (STEP.n + 1) * BEAT + ORDER.indexOf(i) * HALF_BEAT;
  const lift = (i: number) => interpolate(frame, [liftAt(i), liftAt(i) + 10], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const level = interpolate(frame, [c1, c1 + 2 * BEAT], [0, 1], clamp);
  const beside = interpolate(frame, [c1 + BEAT, c1 + 3 * BEAT], [0, 1], clamp);
  const card = useRamp(c2, 12);
  const meX = down ? b.x + (1050 - b.x) * walkIn : pos.x;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1.06, 1]} focus={{ x: 960, y: 520 }} hits={[(STEP.n + 1) * BEAT, c1, ...keyHits(lines, cues, duration)]}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.92 * card }}>
          <Spot x={960} y={stageTop(sink)} k={(1 - interpolate(frame, [BEAT, 3 * BEAT], [0, 1], clamp)) * sink} />
          {sink > 0.01 && <Stage rise={sink} glow={sink} />}
          <Crowd frame={frame} lift={lift} at={(i) => (i === 4 ? CROWD_X[4] + (1180 - CROWD_X[4]) * beside : CROWD_X[i])} glow={(i) => 0.4 + 0.5 * lift(i)} />
          {down ? <Stander x={meX} bottom={FLOOR} height={250} lift={1} glow={0.9} rgb={GOLD} /> : <Walker x={pos.x} bottom={pos.y} height={270} face="right" walk={k * 3} glow={0.9} rgb={GOLD} />}
          <Level k={level} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", fontFamily: fonts.mono, fontSize: 28, letterSpacing: 12, color: `rgb(${GOLD})`, opacity: level * (1 - card) }}>同一个高度</div>
        </div>
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} opacity={(0.4 + 0.6 * level) * (1 - card)} />
      {card > 0 && <EndCard opacity={card} signoffAt={c2 + BEAT} />}
      {[0, 1, 2, 3].map((i) => (
        <Sfx key={i} name="step" at={BEAT + (i + 1) * BEAT - 4} volume={0.35} />
      ))}
      <Sfx name="whoosh" at={(STEP.n + 1) * BEAT} volume={0.35} />
      {ORDER.map((i) => (
        <Sfx key={`l${i}`} name="glint" at={liftAt(i)} volume={0.15} />
      ))}
      <Sfx name="rise" at={c1} volume={0.3} />
      <Sfx name="boom" at={c2} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
