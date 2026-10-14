import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { Frame } from "../components/Frame";
import { Spotlight } from "../components/Figures";
import { Bust } from "../components/Bust";
import { GazeField } from "../components/Stage";
import { ShatterTitle } from "../components/ShatterTitle";
import { Subtitles } from "../components/Subtitles";
import { Sfx } from "../components/Sfx";
import { brand } from "../theme";
import { useRamp, type SceneProps } from "../timing";

// Line 0: someone points out a mistake (a red beam) and the plaster face cracks.
// Line 1: the bust sits on top of a crowd's gaze; the title assembles from shards.
export const TitleScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const laser = useRamp(cues[0] + 15, 30);
  const crack = useRamp(cues[0] + 45, 25);
  const close = interpolate(frame, [cues[1] - 10, cues[1] + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const wide = useRamp(cues[1], 14);
  const gaze = useRamp(cues[1], 50);
  const titleIn = useRamp(cues[1] + 20, 45);
  const dim = interpolate(frame, [cues[1] + 15, cues[1] + 40], [1, 0.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <Frame duration={duration} showTopic={false}>
      <div style={{ opacity: close }}>
        <Bust x={620} y={560} scale={1.9} laser={laser} crack={crack} id="title-close" />
      </div>

      <div style={{ position: "absolute", inset: 0, opacity: wide * dim }}>
        <Spotlight x={960} floor={340} width={300} intensity={0.8} />
        <GazeField target={{ x: 960, y: 330 }} progress={gaze} open={Math.min(1, gaze * 3)} />
        <Bust x={960} y={215} scale={0.6} id="title-wide" />
      </div>

      <div style={{ position: "absolute", left: 580, top: 230, opacity: titleIn > 0 ? 1 : 0 }}>
        <ShatterTitle text={brand.topic} progress={titleIn} />
      </div>

      <Sfx name="whoosh" at={cues[0] + 12} volume={0.3} />
      <Sfx name="boom" at={cues[0] + 45} volume={0.35} />
      {/* shards fly in, then land with a crack */}
      <Sfx name="whoosh" at={cues[1] + 12} volume={0.3} />
      <Sfx name="boom" at={cues[1] + 48} volume={0.6} />
      <Sfx name="shatter" at={cues[1] + 48} volume={0.45} />

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </Frame>
  );
};
