import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// Title card: rings turning behind the word, and the word itself won't hold
// still — it sways and splits into colour fringes on every beat.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const show = useRamp(0, 6);
  const punch = interpolate(frame, [0, BEAT], [1.15, 1], { extrapolateRight: "clamp" });
  const kick = Math.max(0, 1 - (frame % BEAT) / 6);
  const sway = Math.sin(frame / 7) * 2.5;
  const fringe = 3 + kick * 9;

  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: show }}>
        <Halo x={960} y={470} r={460} intensity={1} />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {[140, 220, 300, 380, 460].map((r, i) => (
            <circle
              key={r}
              cx={960}
              cy={470}
              r={r}
              fill="none"
              stroke={`rgba(${palette.accentRgb},${0.35 - i * 0.05})`}
              strokeWidth={2}
              strokeDasharray={`${12 + i * 6} ${18 + i * 4}`}
              transform={`rotate(${frame * (i % 2 ? -1.6 : 1.2) * (1 + i * 0.3)} 960 470)`}
            />
          ))}
        </svg>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 330,
            textAlign: "center",
            fontSize: 230,
            fontWeight: 900,
            letterSpacing: 60,
            color: "#030405",
            transform: `scale(${punch}) rotate(${sway}deg)`,
            textShadow: `0 0 2px rgba(${palette.halo},0.95), 0 0 26px rgba(${palette.halo},0.6), ${fringe}px 0 0 rgba(255,60,110,0.55), ${-fringe}px 0 0 rgba(60,240,220,0.55)`,
          }}
        >
          {brand.topic}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 660, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>
          {brand.series} · {brand.topicLatin}
        </div>
      </div>
      <Sfx name="boom" at={0} volume={0.8} />
      <Sfx name="whoosh" at={4 * BEAT} volume={0.3} />
    </ObsFrame>
  );
};
