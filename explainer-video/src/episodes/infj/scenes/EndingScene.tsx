import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { Walker } from "../../nostalgia/road";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { COOL, Carrier, LAMP, Room } from "../lantern";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ROOM = { x: 760, w: 640, h: 460 };
const FLOOR = 860;
const WORDS = ["其实我……", "那天我很难过", "嗯……就是……", "我也需要你"];

// The episode's picture.
// 0 · his own room, the lamp in his hand. He pushes the door open — and for
//     the first time the light goes in: the room fills, warm; the boards come
//     off the window; his words, clumsy and half-finished, hang in the air.
// 1 · someone comes down the street and walks in through the open door.
// 2 · the channel card.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const walkIn = interpolate(frame, [0, 2 * BEAT], [0, 1], clamp);
  const door = interpolate(frame, [2 * BEAT, 2 * BEAT + 12], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const lit = interpolate(frame, [2 * BEAT + 4, 5 * BEAT], [0, 1], clamp);
  const inside = interpolate(frame, [3 * BEAT, 5 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const myX = 520 + 120 * walkIn + 360 * inside;
  const vis = interpolate(frame, [c1, c1 + 4 * BEAT], [0, 1], clamp);
  const vX = -120 + (ROOM.x + 60 + 120) * vis;
  const card = useRamp(c2, 12);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1.06, 1]} focus={{ x: 1000, y: 620 }} hits={[2 * BEAT, c1 + 4 * BEAT, ...keyHits(lines, cues, duration)]}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.92 * card }}>
          <Room {...ROOM} bottom={FLOOR} lit={lit} door={door} shut={1 - lit} who={false}>
            {WORDS.map((w, i) => {
              const p = interpolate(frame, [3 * BEAT + i * 8, 3 * BEAT + i * 8 + 10], [0, 1], clamp);
              const jx = (random(`w${i}`) - 0.5) * 6 * Math.sin(frame / 7 + i);
              return <div key={w} style={{ position: "absolute", left: ROOM.x + 200 + (i % 2) * 150 + jx, top: FLOOR - ROOM.h + 70 + i * 70, fontSize: 30, fontWeight: 800, color: "#fff2d8", opacity: p * (i === 2 ? 0.7 : 1), transform: `rotate(${(random(`r${i}`) - 0.5) * 8}deg)`, textShadow: `0 0 14px rgba(${LAMP},0.9)` }}>{w}</div>;
            })}
          </Room>
          {inside < 1 ? (
            <Carrier x={myX} bottom={FLOOR} height={240} walk={frame / 4} lamp={1} />
          ) : (
            <Carrier x={myX} bottom={FLOOR} height={240} face="left" walk={0} lamp={1} />
          )}
          {vis > 0 && <Walker x={vX} bottom={FLOOR} height={230} face="right" walk={vis < 1 ? frame / 4 : 0} glow={0.5 + 0.4 * vis} rgb={vis < 1 ? COOL : LAMP} />}
          <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", fontSize: 30, fontWeight: 800, letterSpacing: 10, color: `rgba(${LAMP},0.9)`, opacity: interpolate(frame, [c1 + 4 * BEAT, c1 + 4 * BEAT + 10], [0, 1], clamp) * (1 - card) }}>第一次 · 有人走进来</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 960, height: 2, background: `linear-gradient(90deg, transparent, rgba(${LAMP},${0.3 + 0.5 * lit}), transparent)` }} />
        </div>
      </Cam>
      <Bokeh frame={frame} rgb={LAMP} opacity={(0.4 + 0.6 * lit) * (1 - card)} />
      {card > 0 && <EndCard opacity={card} signoffAt={c2 + BEAT} />}
      <Sfx name="step" at={4} volume={0.25} />
      <Sfx name="step" at={BEAT + 4} volume={0.25} />
      <Sfx name="whoosh" at={2 * BEAT} volume={0.35} />
      <Sfx name="rise" at={2 * BEAT + 4} volume={0.35} />
      {WORDS.map((_, i) => (
        <Sfx key={i} name="glint" at={3 * BEAT + i * 8} volume={0.15} />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <Sfx key={`v${i}`} name="step" at={c1 + i * BEAT} volume={0.2} />
      ))}
      <Sfx name="boom" at={c2} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
