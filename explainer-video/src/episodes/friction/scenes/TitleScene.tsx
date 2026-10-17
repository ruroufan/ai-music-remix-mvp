import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Tangle } from "../tangle";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// The title caught in a knot of black thread that tightens on every beat.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const show = useRamp(0, 6);
  const ph = (frame % BEAT) / BEAT;
  const squeeze = 1 - 0.08 * Math.exp(-ph * 6);
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: show }}>
        <Halo x={960} y={470} r={460} intensity={0.7} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 350, textAlign: "center", fontSize: 230, fontWeight: 900, letterSpacing: 60, paddingLeft: 60, transform: `scale(${squeeze})`, color: palette.ink, textShadow: `0 0 30px rgba(${palette.halo},0.5)` }}>{brand.topic}</div>
        <div style={{ position: "absolute", inset: 0, transform: `scale(${squeeze * (1 - 0.15 * interpolate(frame, [0, duration], [0, 1]))})`, transformOrigin: "960px 470px" }}>
          <Tangle cx={960} cy={470} r={340} frame={frame * 1.5} threads={12} churn={1.4} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 740, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>
          {brand.series} · {brand.topicLatin}
        </div>
      </div>
      <Sfx name="boom" at={0} volume={0.8} />
      {[1, 2, 3, 4, 5, 6, 7].map((k) => (
        <Sfx key={k} name="glitch" at={k * BEAT} volume={0.12} />
      ))}
    </ObsFrame>
  );
};
