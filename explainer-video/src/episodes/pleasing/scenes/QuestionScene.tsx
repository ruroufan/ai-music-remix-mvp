import React from "react";
import { useCurrentFrame } from "remotion";
import { ObsFrame } from "../ObsFrame";
import { palette } from "../look";
import { HALF_BEAT, type SceneProps } from "../timing";

// The music drops out; the question types itself, one character per half beat.
export const QuestionScene: React.FC<SceneProps> = ({ lines, duration }) => {
  const frame = useCurrentFrame();
  const text = lines[0].text;
  const shown = Math.min(text.length, Math.floor(frame / HALF_BEAT) + 1);
  const cursorOn = Math.floor(frame / HALF_BEAT) % 2 === 0;
  return (
    <ObsFrame duration={duration} flash={false}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center", fontSize: 72, fontWeight: 700, letterSpacing: 6 }}>
        {text.slice(0, shown)}
        <span style={{ display: "inline-block", width: 6, height: 70, marginLeft: 10, verticalAlign: "-8px", background: palette.accent, opacity: cursorOn ? 1 : 0 }} />
      </div>
    </ObsFrame>
  );
};
