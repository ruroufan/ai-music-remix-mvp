import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { Walker } from "../../nostalgia/road";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Checklist, Fading, GROUND, LEAF, OldTree, PALE, Rest, TODO, WARM } from "../checklist";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SIT = 1140;

// The episode's picture.
// 0 · him, almost see-through, the finished list in his hand. He lets it go —
//     it drops to the grass — and walks over to the great old tree, and sits
//     down in its shade.
// 1 · leaves drifting down, light coming through in spots; slowly his colour
//     comes back, warm, solid again. 不必有用.
// 2 · the channel card.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const drop = interpolate(frame, [BEAT, 2 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t });
  const walk = interpolate(frame, [2 * BEAT, 5 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const sat = frame >= 5 * BEAT;
  const back = interpolate(frame, [5 * BEAT, c1 + 6 * BEAT], [0, 1], clamp);
  const card = useRamp(c2, 12);
  const x = 460 + (SIT + 60 - 460) * walk;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1.05, 1]} focus={{ x: 1100, y: 600 }} hits={[2 * BEAT, 5 * BEAT, c1, ...keyHits(lines, cues, duration)]}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.92 * card }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: GROUND, bottom: 0, background: "#151a14" }} />
          <OldTree x={1300} size={1.15} shade={0.4 + 0.6 * back} frame={frame} glow={0.25 + 0.5 * back} />
          {/* sunlight through the leaves */}
          {back > 0 &&
            Array.from({ length: 14 }, (_, i) => (
              <div key={i} style={{ position: "absolute", left: 800 + random(`sp${i}`) * 1000, top: GROUND - 10 + random(`sy${i}`) * 60, width: 40 + 40 * random(`sw${i}`), height: 10, borderRadius: "50%", background: `rgba(${WARM},${0.35 * back * (0.6 + 0.4 * Math.sin(frame / 20 + i))})` }} />
            ))}
          <div style={{ position: "absolute", inset: 0, opacity: 1 - drop * 0.3, transform: `translateY(${drop * 470}px) rotate(${drop * 70}deg)`, transformOrigin: "560px 200px" }}>
            {frame < 5 * BEAT && <Checklist x={420} y={180} done={TODO.length} size={0.7} rot={-4} />}
          </div>
          {!sat ? (
            frame < 2 * BEAT ? <Fading x={460} bottom={GROUND} height={340} fade={0.9} /> : <div style={{ opacity: 0.25 }}><Walker x={x} bottom={GROUND} height={330} face="right" walk={frame / 4} glow={0.3} rgb={PALE} /></div>
          ) : (
            <Rest x={SIT} color={back} fade={0.9 * (1 - back)} />
          )}
          {/* falling leaves */}
          {Array.from({ length: 10 }, (_, i) => {
            const p = ((frame / 140 + random(`lf${i}`)) % 1);
            return <div key={i} style={{ position: "absolute", left: 900 + random(`lx${i}`) * 800 + Math.sin(p * 8 + i) * 40, top: 200 + p * 700, width: 18, height: 10, borderRadius: "50%", background: `rgba(${LEAF},${0.8 * Math.sin(p * Math.PI) * (0.3 + 0.7 * back)})`, transform: `rotate(${p * 500}deg)` }} />;
          })}
          <div style={{ position: "absolute", left: 160, top: 300, fontSize: 52, fontWeight: 900, letterSpacing: 12, color: `rgb(${WARM})`, textShadow: `0 0 20px rgba(${WARM},0.7)`, opacity: interpolate(frame, [c1 + 2 * BEAT, c1 + 2 * BEAT + 12], [0, 1], clamp) * (1 - card) }}>不必有用</div>
        </div>
      </Cam>
      <Bokeh frame={frame} rgb={WARM} opacity={(0.2 + 0.6 * back) * (1 - card)} />
      {card > 0 && <EndCard opacity={card} signoffAt={c2 + BEAT} />}
      <Sfx name="whoosh" at={BEAT} volume={0.3} />
      {[0, 1, 2].map((i) => (
        <Sfx key={i} name="step" at={2 * BEAT + i * BEAT + 4} volume={0.25} />
      ))}
      <Sfx name="rise" at={5 * BEAT} volume={0.3} />
      <Sfx name="glint" at={c1 + 2 * BEAT} volume={0.35} />
      <Sfx name="boom" at={c2} volume={0.3} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
