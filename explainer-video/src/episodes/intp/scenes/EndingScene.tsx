import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { Walker } from "../../nostalgia/road";
import { Seated } from "../../friction/tangle";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { DOOR, FLOOR, GREEN, HEAD, LifeTree, Reasoning, SEAT, Study } from "../study";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// The episode's picture. 0 · he gets up from the desk — the reasoning behind
//     him fades — walks to the door and pushes it open: green light floods the
//     grey room, and outside, a great tree glowing green. 1 · the camera goes
//     through the doorway after him; he walks up to the tree and puts his
//     hand on it: a ring of green light, leaves coming down — 常青.
// 2 · the channel card.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const up = BEAT;
  const walkIn = interpolate(frame, [up, 4 * BEAT], [0, 1], clamp);
  const door = interpolate(frame, [4 * BEAT, 5 * BEAT], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const thoughts = 1 - interpolate(frame, [up, 3 * BEAT], [0, 1], clamp);
  const through = interpolate(frame, [c1 - 2 * BEAT, c1], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const outWalk = interpolate(frame, [c1, c1 + 4 * BEAT], [0, 1], clamp);
  const touch = c1 + 4 * BEAT;
  const ring = frame >= touch ? (frame - touch) / 30 : -1;
  const card = useRamp(c2, 12);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} hits={[4 * BEAT, touch, ...keyHits(lines, cues, duration)]}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.92 * card }}>
          {/* inside */}
          {through < 1 && (
            <div style={{ position: "absolute", inset: 0, transformOrigin: `${DOOR.x + DOOR.w / 2}px ${DOOR.y + DOOR.h / 2}px`, transform: `scale(${1 + 5 * through * through})`, opacity: 1 - through }}>
              <Study frame={frame} door={door} spill={door} />
              <Reasoning frame={frame} ox={HEAD.x} oy={HEAD.y - 20} grow={1} opacity={thoughts} />
              {frame < up ? <Seated x={SEAT} floor={FLOOR} scale={1.25} glow={0.5} slump={0} /> : <Walker x={SEAT - 60 + (DOOR.x - 40 - SEAT + 60) * walkIn} bottom={FLOOR} height={300} face="right" walk={walkIn * 24} glow={0.7 + 0.3 * door} rgb={door > 0.5 ? GREEN : undefined} />}
            </div>
          )}
          {/* outside */}
          {through > 0 && (
            <div style={{ position: "absolute", inset: 0, opacity: through, background: `radial-gradient(ellipse at 50% 40%, rgba(${GREEN},0.12), transparent 70%)` }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR, height: 320, background: `linear-gradient(rgba(${GREEN},0.18), transparent)` }} />
              <LifeTree x={1100} floor={FLOOR} scale={1.15} frame={frame} glow={1} />
              <Walker x={500 + 470 * outWalk} bottom={FLOOR} height={300} face="right" walk={outWalk * 30} glow={1} rgb={GREEN} />
              {ring >= 0 && ring < 1 && <div style={{ position: "absolute", left: 1000 - 600 * ring, top: FLOOR - 200 - 600 * ring, width: 1200 * ring, height: 1200 * ring, borderRadius: "50%", border: `${8 * (1 - ring)}px solid rgba(${GREEN},${1 - ring})` }} />}
            </div>
          )}
        </div>
      </Cam>
      <Bokeh frame={frame} rgb={GREEN} opacity={(0.3 + 0.7 * door) * (1 - card)} />
      {card > 0 && <EndCard opacity={card} signoffAt={c2 + BEAT} />}
      <Sfx name="step" at={up} volume={0.3} />
      <Sfx name="whoosh" at={4 * BEAT} volume={0.45} />
      <Sfx name="glint" at={5 * BEAT} volume={0.4} />
      <Sfx name="rise" at={c1 - 2 * BEAT} volume={0.3} />
      <Sfx name="boom" at={touch} volume={0.4} />
      <Sfx name="boom" at={c2} volume={0.3} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
