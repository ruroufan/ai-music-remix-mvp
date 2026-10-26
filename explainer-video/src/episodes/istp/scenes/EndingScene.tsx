import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { Seated } from "../../friction/tangle";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { BENCH, Bench, FEEL, FLOOR, Feeling, Mechanic } from "../bench";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const X = 680;
const S = 1.6;

// The episode's picture.
// 0 · at the bench, the machine finished and closed. The small part blinks
//     in his chest. He looks at it — and takes it out.
// 1 · he holds it out across the bench to the person sitting opposite; it
//     passes from his hand to theirs, and its light warms both of them. A
//     bubble: 我今天有点难过.
// 2 · the channel card.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const take = interpolate(frame, [3 * BEAT, 5 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const give = interpolate(frame, [c1, c1 + 4 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const warm = interpolate(frame, [c1 + 3 * BEAT, c1 + 6 * BEAT], [0, 1], clamp);
  const card = useRamp(c2, 12);
  const chest = { x: X - 74 * S, y: FLOOR - 130 * S };
  const hand = { x: 880, y: BENCH - 60 };
  const px = chest.x + (hand.x - chest.x) * take + (1080 - hand.x) * give;
  const py = chest.y + (hand.y - chest.y) * take;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1.04, 1]} focus={{ x: 960, y: 620 }} hits={[5 * BEAT, c1 + 4 * BEAT, ...keyHits(lines, cues, duration)]}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.92 * card }}>
          <Bench x0={740} x1={1180} />
          <Mechanic x={X} frame={frame} chest={take > 0 ? 0 : 1} reach={take > 0 ? Math.max(0.4, (px - (X + 64)) / 60) : 0.4} glow={0.5 + 0.4 * warm} />
          <div style={{ position: "absolute", inset: 0, transform: "scaleX(-1)", transformOrigin: "960px 0" }}>
            <Seated x={X} floor={FLOOR} scale={S} glow={0.3 + 0.6 * warm} />
          </div>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: give }}>
            <line x1={1920 - (X - 60 * S) - 30} y1={FLOOR - 190 * S + 40} x2={1920 - (X - 60 * S) - 30 - (1920 - (X - 60 * S) - 30 - px - 24) * give} y2={FLOOR - 190 * S + 40 + (py + 10 - (FLOOR - 190 * S + 40)) * give} stroke="#030405" strokeWidth={14} strokeLinecap="round" />
          </svg>
          {take > 0 && <Feeling x={px} y={py} size={1.1} frame={frame} k={1} still={give > 0.95} />}
          <div style={{ position: "absolute", left: 700, top: 300, padding: "12px 24px", borderRadius: 18, border: `2px solid rgb(${FEEL})`, background: "rgba(20,14,12,0.85)", fontSize: 38, fontWeight: 900, color: `rgb(${FEEL})`, opacity: interpolate(frame, [c1 + 4 * BEAT, c1 + 4 * BEAT + 8], [0, 1], clamp) * (1 - card) }}>我今天有点难过</div>
        </div>
      </Cam>
      <Bokeh frame={frame} rgb={FEEL} opacity={(0.3 + 0.6 * warm) * (1 - card)} />
      {card > 0 && <EndCard opacity={card} signoffAt={c2 + BEAT} />}
      <Sfx name="glint" at={3 * BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c1} volume={0.3} />
      <Sfx name="rise" at={c1 + 2 * BEAT} volume={0.3} />
      <Sfx name="glint" at={c1 + 4 * BEAT} volume={0.45} />
      <Sfx name="boom" at={c2} volume={0.3} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
