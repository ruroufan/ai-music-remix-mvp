import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox } from "../../../channels/backlit/parts";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { A_X, FLOOR, Footprints, Ground, Him, Other, RIFT, ROSE, Rift, leaving } from "../crack";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// The picture, first half. Two people face to face. Between them a crack runs
// up out of the floor. He looks at it — turns — and walks away without a
// word, out of the left of the frame, leaving a line of footprints. On the
// second line the viewfinder finds what's left: 离开 · 一声不响.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const crack = 2 * BEAT;
  const turn = 4 * BEAT;
  const open = interpolate(frame, [crack, crack + BEAT], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const go = leaving(frame, turn, c1 - turn - BEAT / 2);
  const box = interpolate(frame, [c1, c1 + 10], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} focus={{ x: 960, y: 560 }} hits={[crack, turn, c1, ...keyHits(lines, cues, duration)]}>
        <Ground />
        <Footprints x0={A_X} x1={-120} shown={go.prints} />
        <Rift open={open} frame={frame} />
        <Other glow={0.5 - 0.2 * go.prints} />
        <Him x={go.x} face={go.face} walk={go.walk} glow={0.6} />
        <FocusBox x={A_X} y={FLOOR - 160} w={280} h={400} progress={box} label="离开 · 一声不响" color={`rgb(${ROSE})`} />
      </Cam>
      <Bokeh frame={frame} rgb={frame < crack ? ROSE : RIFT} opacity={0.3} />
      <Sfx name="glitch" at={crack - 2} volume={0.25} />
      <Sfx name="shatter" at={crack} volume={0.35} />
      <Sfx name="whoosh" at={turn} volume={0.25} />
      {Array.from({ length: 6 }, (_, i) => (
        <Sfx key={i} name="step" at={turn + 10 + i * 9} volume={0.18} />
      ))}
      <Sfx name="glint" at={c1} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
