import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { GOLD, GROUND, LEAF, Measurer, Ruler, SAPS, Sapling } from "../ruler";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const X = 180;

// The episode's picture.
// 0 · the row of identical boxes. He lowers the ruler — lets it fall to the
//     ground — and the saplings start to come out of their boxes.
// 1 · each one grows its own way: leaning, branching left, right, up, in its
//     own colour, no two alike. 彼此的自由.
// 2 · the channel card.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const down = interpolate(frame, [BEAT, 2 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t });
  const free = (i: number) => interpolate(frame, [3 * BEAT + i * 5, c1 + 4 * BEAT + i * 5], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) });
  const card = useRamp(c2, 12);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1.04, 1]} focus={{ x: 960, y: 600 }} hits={[2 * BEAT, 3 * BEAT, c1 + 4 * BEAT, ...keyHits(lines, cues, duration)]}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.92 * card }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: GROUND, bottom: 0, background: "#14120f" }} />
          {SAPS.map((sx, i) => (
            <Sapling key={i} x={sx + 60} seed={i + 20} trim={1 - free(i)} wild={free(i)} scale={1 + 0.3 * free(i)} hue={1} />
          ))}
          <Measurer x={X} ruler={frame < BEAT} rot={-10} glow={0.5 + 0.4 * free(0)} />
          {frame >= BEAT && <Ruler x={X + 80 + 40 * down} y={GROUND - 200 + 186 * down} len={260} rot={-10 + 10 * down} />}
          <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontSize: 52, fontWeight: 900, letterSpacing: 12, color: `rgb(${GOLD})`, textShadow: `0 0 24px rgba(${GOLD},0.6)`, opacity: interpolate(frame, [c1 + 4 * BEAT, c1 + 4 * BEAT + 10], [0, 1], clamp) * (1 - card) }}>彼此的自由</div>
        </div>
      </Cam>
      <Bokeh frame={frame} rgb={LEAF} opacity={(0.3 + 0.5 * free(5)) * (1 - card)} />
      {card > 0 && <EndCard opacity={card} signoffAt={c2 + BEAT} />}
      <Sfx name="whoosh" at={BEAT} volume={0.3} />
      <Sfx name="stamp" at={2 * BEAT} volume={0.35} />
      <Sfx name="rise" at={3 * BEAT} volume={0.35} />
      {SAPS.map((_, i) => (
        <Sfx key={i} name="glint" at={3 * BEAT + i * 5} volume={0.12} />
      ))}
      <Sfx name="glint" at={c1 + 4 * BEAT} volume={0.4} />
      <Sfx name="boom" at={c2} volume={0.3} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
