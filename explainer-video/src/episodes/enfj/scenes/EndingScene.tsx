import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { fonts } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Cup, FLOOR, Giver, Row, SEATS, TABLE, WARM, WarmAir } from "../kettle";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const MINE = 1620;

// The episode's picture.
// 0 · the row, all full. He sets his empty cup down on the table at the end
//     of the line — and for the first time, tips the kettle over his own cup.
//     It fills; it steams. 你自己 · 也是目的.
// 1 · he puts the kettle down and takes his place behind the table with the
//     others — one more in the row — and they all lift their cups together;
//     a gold line runs along the row: 同一行.
// 2 · the channel card.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const tilt = interpolate(frame, [2 * BEAT, 2 * BEAT + 8, 5 * BEAT, 5 * BEAT + 8], [0, 52, 52, 0], clamp);
  const mine = interpolate(frame, [2 * BEAT + 6, 5 * BEAT], [0, 1], clamp);
  const join = frame >= c1;
  const raise = interpolate(frame, [c1 + 2 * BEAT, c1 + 3 * BEAT], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const level = interpolate(frame, [c1 + 3 * BEAT, c1 + 5 * BEAT], [0, 1], clamp);
  const card = useRamp(c2, 12);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1.04, 1]} focus={{ x: join ? 960 : 1500, y: 640 }} hits={[2 * BEAT, 5 * BEAT, c1 + 2 * BEAT, ...keyHits(lines, cues, duration)]}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.92 * card }}>
          <WarmAir frame={frame} k={0.5 + 0.5 * raise} />
          {!join ? (
            <>
              <Row fills={() => 1} frame={frame} glow={() => 0.7} />
              <Cup x={MINE + 17} y={TABLE} size={0.8} fill={mine} frame={frame} />
              <Giver x={MINE + 17 - 117} tilt={tilt} pourTo={TABLE - 50} frame={frame} glow={0.5 + 0.4 * mine} />
              <div style={{ position: "absolute", left: MINE - 200, width: 400, top: 380, textAlign: "center", fontSize: 40, fontWeight: 900, color: `rgb(${WARM})`, textShadow: `0 0 20px rgba(${WARM},0.8)`, opacity: interpolate(frame, [5 * BEAT, 5 * BEAT + 10], [0, 1], clamp) }}>你自己 · 也是目的</div>
            </>
          ) : (
            <div style={{ position: "absolute", inset: 0, transform: `translateY(${-14 * raise}px)` }}>
              <Row fills={() => 1} frame={frame} glow={() => 0.8} />
              <Stander x={MINE} bottom={FLOOR} height={330} lift={1} glow={0.9} rgb={WARM} />
              <Cup x={MINE} y={TABLE} size={0.8} fill={1} frame={frame} />
            </div>
          )}
          {join && <div style={{ position: "absolute", left: SEATS[0] - 120, top: 520, width: (MINE - SEATS[0] + 240) * level, height: 4, background: `rgb(${WARM})`, boxShadow: `0 0 18px rgba(${WARM},0.8)` }} />}
          {join && <div style={{ position: "absolute", left: 0, right: 0, top: 440, textAlign: "center", fontFamily: fonts.mono, fontSize: 28, letterSpacing: 14, color: `rgb(${WARM})`, opacity: level * (1 - card) }}>同 一 行</div>}
        </div>
      </Cam>
      <Bokeh frame={frame} rgb={WARM} opacity={(0.4 + 0.5 * level) * (1 - card)} />
      {card > 0 && <EndCard opacity={card} signoffAt={c2 + BEAT} />}
      <Sfx name="whoosh" at={2 * BEAT} volume={0.3} />
      <Sfx name="rise" at={2 * BEAT + 6} volume={0.3} />
      <Sfx name="glint" at={5 * BEAT} volume={0.5} />
      <Sfx name="glint" at={c1 + 2 * BEAT} volume={0.4} />
      <Sfx name="boom" at={c2} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
