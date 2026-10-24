import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { CliffSide } from "../paths";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

// Standing on the edge, safe and still — while the days run past.
export const EdgeScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const days = Math.round(interpolate(frame, [cues[1], duration - BEAT], [1, 365], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t }));
  // day/night flicker speeds up with the counter
  const sky = frame >= cues[1] ? 0.5 + 0.5 * Math.sin((days / 365) * Math.PI * 40) : 0;

  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, background: `rgba(120,150,200,${0.08 * sky})` }} />
      <CliffSide edge={{ x: 820, y: 560 }} frame={frame} glow={0.7} />
      <div style={{ position: "absolute", right: 140, top: 180, fontFamily: fonts.mono, textAlign: "right", opacity: frame >= cues[1] ? 1 : 0 }}>
        <div style={{ fontSize: 18, letterSpacing: 6, color: palette.dim }}>STILL STANDING</div>
        <div style={{ fontSize: 72, letterSpacing: 6, color: palette.ink }}>DAY {String(days).padStart(3, "0")}</div>
        <div style={{ fontSize: 18, letterSpacing: 4, color: palette.alert }}>STEPS TAKEN: 0</div>
      </div>
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <Sfx key={k} name="shutter" at={cues[1] + k * BEAT} volume={0.15} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
