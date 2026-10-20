import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { Halo } from "../../../channels/backlit/parts";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam } from "../../glass/immersive";
import { FLOOR, GOLD, Grip, TARGETS } from "../ropes";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ORDER = [3, 0, 5, 2, 1, 4];

// The episode's picture. 0 · he opens his hands: one per half beat the ropes
//     fall slack and drop away, and what they were tied to drifts off. 1 · only
//     the short rope tied to himself is left in his hand — it lights up gold;
//     he stands up straight, holding it. 2 · the channel card.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2] = cues;
  const freeAt = (i: number) => BEAT + ORDER.indexOf(i) * HALF_BEAT;
  const free = (i: number) => interpolate(frame, [freeAt(i), freeAt(i) + 20], [0, 1], { ...clamp, easing: (t) => t * t });
  const allFree = interpolate(frame, [BEAT, BEAT + TARGETS.length * HALF_BEAT + 20], [0, 1], clamp);
  const self = interpolate(frame, [c1, c1 + 2 * BEAT], [0, 1], clamp);
  const card = useRamp(c2, 12);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.1, 1]} hits={[c1]}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.75 * card }}>
          <Halo x={960} y={FLOOR - 200} r={300 + 160 * self} intensity={0.3 + 0.6 * self} rgb={GOLD} />
          <Grip frame={frame} tension={0.5 * (1 - allFree)} free={free} self={self} lift={0.5 + 0.7 * allFree} />
          <div style={{ position: "absolute", left: 1060, top: FLOOR - 120, fontSize: 30, fontWeight: 900, color: `rgb(${GOLD})`, opacity: self, textShadow: `0 0 14px ${look.keyGlow}` }}>自己</div>
        </div>
      </Cam>
      <Bokeh frame={frame} opacity={1 - card} />
      {card > 0 && <EndCard opacity={card} signoffAt={c2 + BEAT} />}
      {TARGETS.map((_, i) => (
        <Sfx key={i} name="whoosh" at={BEAT + i * HALF_BEAT} volume={0.18} />
      ))}
      <Sfx name="glint" at={c1} volume={0.45} />
      <Sfx name="boom" at={c2} volume={0.35} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
