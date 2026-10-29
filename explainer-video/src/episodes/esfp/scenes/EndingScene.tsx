import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { Seated } from "../../friction/tangle";
import { Walker } from "../../nostalgia/road";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Sitter } from "../../estp/chase";
import { Bread, GARDEN_FLOOR, GOLD, Garden, STAGE, Stage, WARM } from "../stage";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const SIT = STAGE + 150; // where he sits on the steps

// The episode's picture, second half.
// 0 · the dark stage, him alone on the steps. Someone walks in from the right
//     with a loaf, stops, and holds it out; it passes into his hands.
//     Dissolve: a small round table in a garden, a lantern, the two of them
//     sitting down to it, the bread between them.
// 1 · the lantern brightens; warm light on both: 朋友.
// 2 · the channel card.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const walkIn = interpolate(frame, [BEAT, 4 * BEAT], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) });
  const fx = 1700 - (1700 - 1150) * walkIn;
  const hand = interpolate(frame, [5 * BEAT, 6 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const garden = ramp(frame, 7 * BEAT, 2 * BEAT);
  const lamp = interpolate(frame, [c1, c1 + 4 * BEAT], [0.5, 1], clamp);
  const card = useRamp(c2, 12);
  const bx = 1110 - (1110 - 1000) * hand, by = SIT - 150 + 40 * hand;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1.04, 1]} focus={{ x: 960, y: 640 }} hits={[6 * BEAT, 9 * BEAT, c1 + 2 * BEAT, ...keyHits(lines, cues, duration)]}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.92 * card }}>
          {garden < 1 && (
            <div style={{ position: "absolute", inset: 0, opacity: 1 - garden }}>
              <Stage lights={0.12} spot={0} frame={frame} />
              <Sitter x={960} bottom={SIT} scale={1.2} glow={0.3 + 0.3 * hand} rgb={GOLD} />
              <Walker x={fx} bottom={SIT} height={330} face="left" walk={walkIn < 1 ? (1700 - fx) / 26 : 0} glow={0.6} rgb={WARM} />
              {walkIn > 0.6 && <Bread x={bx} y={by} s={0.8} />}
            </div>
          )}
          {garden > 0 && (
            <div style={{ position: "absolute", inset: 0, opacity: garden }}>
              <Garden k={1} frame={frame} lamp={lamp} />
              <Seated x={770} floor={GARDEN_FLOOR} scale={1.4} glow={0.4 + 0.4 * lamp} />
              <div style={{ position: "absolute", inset: 0, transform: "scaleX(-1)", transformOrigin: "960px 0" }}>
                <Seated x={770} floor={GARDEN_FLOOR} scale={1.4} glow={0.4 + 0.4 * lamp} />
              </div>
            </div>
          )}
          <div style={{ position: "absolute", left: 0, right: 0, top: 410, textAlign: "center", fontSize: 50, fontWeight: 900, letterSpacing: 20, color: `rgb(${WARM})`, opacity: ramp(frame, c1 + 2 * BEAT, 12) * (1 - card) }}>朋 友</div>
        </div>
      </Cam>
      <Bokeh frame={frame} rgb={WARM} opacity={(0.2 + 0.4 * garden) * (1 - card)} />
      {card > 0 && <EndCard opacity={card} signoffAt={c2 + BEAT} />}
      {[0, 1, 2, 3].map((i) => (
        <Sfx key={i} name="step" at={BEAT + 4 + i * 9} volume={0.2} />
      ))}
      <Sfx name="glint" at={6 * BEAT} volume={0.35} />
      <Sfx name="whoosh" at={7 * BEAT} volume={0.25} />
      <Sfx name="glint" at={c1 + 2 * BEAT} volume={0.4} />
      <Sfx name="boom" at={c2} volume={0.3} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
