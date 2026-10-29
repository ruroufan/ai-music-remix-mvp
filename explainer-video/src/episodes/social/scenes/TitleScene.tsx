import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Cone, Lamp } from "../lights";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// A stage light swings across the dark and lands on the title on the second
// beat; then it breathes with the beat.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const show = useRamp(0, 6);
  const swing = interpolate(frame, [0, 2 * BEAT], [-700, 0], { extrapolateRight: "clamp", easing: (t) => 1 - Math.pow(1 - t, 3) });
  const landed = frame >= 2 * BEAT;
  const pulse = landed ? 0.85 + 0.15 * Math.exp(-((frame - 2 * BEAT) % BEAT) / 5) : 0.7;
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: show }}>
        <Cone id="tt" x={960} aimX={960 + swing} floor={720} spread={300} on={pulse} />
        <Lamp x={960} aimX={960 + swing} floor={720} on={1} size={1.4} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center", fontSize: 170, fontWeight: 900, letterSpacing: 40, paddingLeft: 40, color: landed ? "#fff" : palette.faint, textShadow: landed ? "0 0 30px rgba(255,246,226,0.8), 0 4px 18px rgba(0,0,0,0.6)" : undefined, transform: `scale(${landed ? 1 + 0.04 * Math.exp(-(frame - 2 * BEAT) / 6) : 1})` }}>
          {brand.topic}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>
          {brand.series} · {brand.topicLatin}
        </div>
      </div>
      <Sfx name="whoosh" at={0} volume={0.4} />
      <Sfx name="boom" at={2 * BEAT} volume={0.8} />
      {[3, 4, 5, 6, 7].map((k) => (
        <Sfx key={k} name="shutter" at={k * BEAT} volume={0.14} />
      ))}
    </ObsFrame>
  );
};
