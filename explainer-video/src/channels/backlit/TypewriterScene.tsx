import React from "react";
import { useCurrentFrame } from "remotion";
import { ObsFrame } from "./ObsFrame";
import { palette } from "./look";
import { useEpisode } from "../../EpisodeContext";
import type { SceneProps } from "../../types";

// A one-line scene: the text types itself, one character per half beat
// (pair it with an energy-0 mood so the music drops out underneath).
export const TypewriterScene: React.FC<SceneProps> = ({ lines, duration }) => {
  const frame = useCurrentFrame();
  const { HALF_BEAT } = useEpisode().timeline;
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
