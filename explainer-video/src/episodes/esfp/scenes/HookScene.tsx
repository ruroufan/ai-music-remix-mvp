import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox } from "../../../channels/backlit/parts";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Sitter } from "../../estp/chase";
import { Crowd, GOLD, PINK, STAGE, Stage } from "../stage";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// The picture, first half. Centre stage, the spotlight on him, the crowd
// below roaring, arms up, lights waving. Then — click — the lights go out.
// The crowd thins away to nothing, and he's sitting alone on the steps at the
// front of the stage. The viewfinder finds him: 散场 · 一个人.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const off = 7 * BEAT;
  const lights = interpolate(frame, [off, off + 3], [1, 0.12], clamp);
  const left = interpolate(frame, [off + 6, c1], [0, 1], clamp);
  const sit = interpolate(frame, [c1 - BEAT, c1], [0, 1], clamp);
  const box = interpolate(frame, [c1 + 4, c1 + 14], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} focus={{ x: 960, y: 640 }} hits={[2 * BEAT, 4 * BEAT, off, c1, ...keyHits(lines, cues, duration)]}>
        <Stage lights={lights} spot={frame < off ? 1 : 0} frame={frame} />
        {sit < 1 && <Stander x={960} bottom={STAGE} height={340} lift={2} glow={frame < off ? 0.9 : 0.3} rgb={GOLD} opacity={1 - sit} />}
        {sit > 0 && (
          <div style={{ position: "absolute", inset: 0, opacity: sit }}>
            <Sitter x={960} bottom={STAGE + 150} scale={1.2} glow={0.3} rgb={GOLD} />
          </div>
        )}
        <Crowd frame={frame} cheer={frame < off ? 1 : 0.1} left={left} />
        <FocusBox x={960} y={STAGE + 2} w={300} h={320} progress={box} label="散场 · 一个人" color={`rgb(${GOLD})`} />
      </Cam>
      <Bokeh frame={frame} rgb={frame < off ? PINK : GOLD} opacity={frame < off ? 0.45 : 0.15} />
      <Sfx name="boom" at={0} volume={0.3} />
      {[2, 4, 6].map((b) => (
        <Sfx key={b} name="whoosh" at={b * BEAT} volume={0.2} />
      ))}
      <Sfx name="shutter" at={off} volume={0.6} />
      <Sfx name="glint" at={c1 + 4} volume={0.3} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
