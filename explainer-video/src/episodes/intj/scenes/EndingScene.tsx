import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { Halo } from "../../../channels/backlit/parts";
import { useEpisode } from "../../../EpisodeContext";
import { Stander } from "../../doubt/circles";
import { Walker } from "../../nostalgia/road";
import { Bokeh, Cam } from "../../glass/immersive";
import { BLANK, BP, Blueprint, GOLD, GlassBox } from "../blueprint";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FLOOR = 800;
const PLAN = { x: 560, y: 120, w: 1000 };

// The episode's picture. 0 · he steps out of the glass box (it cracks and
//     fades) and takes an eraser to one corner of his own blueprint: it wipes
//     back to bare, glowing paper — 留白.
// 1 · the outer wall opens a door there, and people walk in off the floor,
//     one per beat, into his plan.
// 2 · the channel card.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2] = cues;
  const crack = interpolate(frame, [0, BEAT], [0, 1], clamp);
  const box = interpolate(frame, [BEAT, 2 * BEAT], [1, 0], clamp);
  const blank = interpolate(frame, [2 * BEAT, 5 * BEAT], [0, 1], clamp);
  const door = interpolate(frame, [c1, c1 + BEAT], [0, 1], clamp);
  const card = useRamp(c2, 12);
  const u = PLAN.w / 100;
  // the eraser rubs back and forth across the corner
  const ex = PLAN.x + (BLANK.x + 4 + (BLANK.w - 8) * (0.5 + 0.5 * Math.sin(frame / 3))) * u;
  const ey = PLAN.y + (BLANK.y + 4 + (BLANK.h - 8) * blank) * u;
  const doorX = PLAN.x + 79 * u, doorY = PLAN.y + 56 * u;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1.06, 1]} hits={[...[0, c1], ...keyHits(lines, cues, duration)]}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.92 * card }}>
          <Halo x={doorX} y={PLAN.y + 43 * u} r={300} intensity={0.6 * blank} rgb={GOLD} />
          <Blueprint x={PLAN.x} y={PLAN.y} w={PLAN.w} frame={frame} draw={1} checks={1} blank={blank} door={door} />
          {blank > 0 && blank < 1 && (
            <div style={{ position: "absolute", left: ex - 40, top: ey - 24, width: 80, height: 48, borderRadius: 8, background: "#e8a0a8", border: "3px solid #3a2a2c", transform: "rotate(-20deg)" }} />
          )}
          <GlassBox x={330} bottom={FLOOR} w={280} h={400} k={box} crack={crack} text="" />
          <Stander x={330} bottom={FLOOR} height={300} lift={1} glow={0.9} rgb={BP} />
          {[0, 1, 2].map((i) => {
            const at = c1 + BEAT + i * BEAT;
            const p = interpolate(frame, [at, at + 2 * BEAT], [0, 1], clamp);
            if (p <= 0) return null;
            const x = 1900 - (1900 - doorX) * p;
            const y = FLOOR - (FLOOR - doorY) * p;
            return <Walker key={i} x={x} bottom={y} height={240 * (1 - 0.6 * p)} face="left" walk={p * 30} glow={0.8} rgb={GOLD} opacity={1 - Math.max(0, (p - 0.85) / 0.15)} />;
          })}
          <div style={{ position: "absolute", left: 120, top: FLOOR + 30, width: 420, textAlign: "center", fontSize: 26, fontWeight: 800, color: look.key, opacity: blank }}>承认自己的无知</div>
        </div>
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} opacity={(0.4 + 0.6 * blank) * (1 - card)} />
      {card > 0 && <EndCard opacity={card} signoffAt={c2 + BEAT} />}
      <Sfx name="shatter" at={0} volume={0.4} />
      <Sfx name="whoosh" at={2 * BEAT} volume={0.3} />
      <Sfx name="glint" at={5 * BEAT} volume={0.45} />
      <Sfx name="rise" at={c1} volume={0.25} />
      {[0, 1, 2].map((i) => (
        <Sfx key={i} name="step" at={c1 + BEAT + i * BEAT} volume={0.3} />
      ))}
      <Sfx name="boom" at={c2} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
