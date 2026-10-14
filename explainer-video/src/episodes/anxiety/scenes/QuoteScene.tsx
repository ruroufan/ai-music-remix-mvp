import React from "react";
import { useCurrentFrame } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { PathField } from "../paths";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, type SceneProps } from "../timing";

// Kierkegaard again — the field has stopped spinning and lies quiet behind.
export const QuoteScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const show = useRamp(0, 10);
  return (
    <ObsFrame duration={duration}>
      <PathField cx={960} cy={560} scale={1.2} rotate={20} opacity={0.22} pulse={0.2 + 0.2 * Math.sin(frame / 20)} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", opacity: show, transform: `scale(${1.06 - show * 0.06})` }}>
        <div style={{ fontSize: 76, fontWeight: 900, letterSpacing: 10, lineHeight: 1.5, textShadow: `0 0 40px rgba(${palette.halo},0.4)` }}>
          学会正确地<span style={{ color: palette.accent }}>焦虑</span>，
          <br />
          就是学会了最重要的事。
        </div>
        <div style={{ fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim, marginTop: 22 }}>SØREN KIERKEGAARD ·《焦虑的概念》</div>
      </div>
      <Sfx name="glint" at={0} volume={0.35} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[0]} />
    </ObsFrame>
  );
};
