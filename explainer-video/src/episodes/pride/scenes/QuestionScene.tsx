import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { Frame } from "../Frame";
import { Subtitles } from "../../../components/Subtitles";
import { type SceneProps } from "../timing";

// Nothing but the question, slowly pushing in.
export const QuestionScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const push = interpolate(frame, [0, duration], [1, 1.06]);
  return (
    <Frame duration={duration}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${push})` }}>
        <Subtitles lines={lines} cues={cues} duration={duration} position="center" size={66} />
      </div>
    </Frame>
  );
};
