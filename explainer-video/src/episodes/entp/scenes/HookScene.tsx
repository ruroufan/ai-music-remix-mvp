import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Boxer, Counter, FrontRopes, GOLD, Hit, Opponent, RED, Ring, RingLight, SEATS, Seats } from "../ring";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ROUND = 2 * BEAT; // one opponent per two beats
const WORDS = ["逻辑漏洞！", "偷换概念！", "以偏概全！", "反例！", "不成立！", "你错了！", "举证！", "双标！"];

// The ring. One opponent after another steps in from the right; he punches
// on the beat, they go down — 胜 ×N — and with every one that falls a seat
// round the ring empties: 朋友 16 → 8.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const n = Math.floor(frame / ROUND);
  const t = (frame % ROUND) / ROUND;
  const punch = interpolate(t, [0.35, 0.6], [0, 1], clamp);
  const fall = interpolate(t, [0.5, 0.85], [0, 1], clamp);
  const order = [3, 12, 6, 9, 0, 15, 5, 10];
  const gone = (i: number) => {
    const k = order.indexOf(i);
    if (k < 0) return 1;
    return 1 - interpolate(frame, [k * ROUND + 0.6 * ROUND, k * ROUND + 0.9 * ROUND], [0, 1], clamp);
  };
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.08]} focus={{ x: 960, y: 450 }} hits={[...Array.from({ length: 8 }, (_, k) => k * ROUND + Math.round(0.5 * ROUND)), ...keyHits(lines, cues, duration)]}>
        <RingLight />
        <Ring />
        <Opponent x={1110 + (1 - interpolate(t, [0, 0.3], [0, 1], clamp)) * 140} fall={fall} />
        <Boxer x={820} punch={punch} reach={180} />
        <Hit x={1080} y={300} text={WORDS[n % WORDS.length]} k={interpolate(t, [0.5, 1], [0, 1], clamp)} />
        <FrontRopes />
        <Seats occupied={gone} />
        <Counter x={1230} y={150} label="胜" value={`×${Math.min(99, n + (t > 0.6 ? 1 : 0))}`} />
        <Counter x={1230} y={200} label="朋友" value={SEATS.filter((_, i) => gone(i) > 0.5).length} color={`rgb(${RED})`} />
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} opacity={0.4} />
      {Array.from({ length: 8 }, (_, k) => (
        <Sfx key={k} name="stamp" at={k * ROUND + Math.round(0.5 * ROUND)} volume={0.35} />
      ))}
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
