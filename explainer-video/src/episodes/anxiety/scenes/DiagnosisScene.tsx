import React from "react";
import { useCurrentFrame } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { CliffSide, PathField } from "../paths";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// Line 0: the first look at the cliff, the person small on its edge.
// Line 1: the diagnosis as a quote, over the field slowly turning.
export const DiagnosisScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const intro = useRamp(0, BEAT);
  const draw = useRamp(BEAT, 4 * BEAT);
  const quote = useRamp(cues[1], 10);

  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: intro * (1 - quote) }}>
        <CliffSide edge={{ x: 760, y: 560 }} draw={draw} frame={frame} />
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: quote }}>
        <PathField cx={960} cy={560} scale={1.1} rotate={frame * 0.15} opacity={0.35} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", transform: `scale(${1.08 - quote * 0.08})` }}>
          <div style={{ fontSize: 104, fontWeight: 900, letterSpacing: 16, textShadow: `0 0 40px rgba(${palette.halo},0.45)` }}>
            焦虑，是自由的<span style={{ color: palette.accent }}>眩晕</span>。
          </div>
          <div style={{ fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim, marginTop: 18 }}>SØREN KIERKEGAARD · 1813—1855 ·《焦虑的概念》1844</div>
        </div>
      </div>

      <Sfx name="whoosh" at={0} volume={0.3} />
      <Sfx name="stamp" at={cues[1]} volume={0.7} />

      <Subtitles lines={lines} cues={cues} duration={duration} hide={[1]} />
    </ObsFrame>
  );
};
