import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// The title inside a circle of light; on every beat the circle widens a step —
// and its rim picks up more question marks.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const show = useRamp(0, 6);
  const step = Math.floor(frame / BEAT);
  const ph = (frame % BEAT) / BEAT;
  const r = 170 + step * 18 + 18 * (1 - Math.exp(-ph * 6));
  const n = 6 + step * 4;
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: show }}>
        <div style={{ position: "absolute", left: 960 - r, top: 470 - r, width: r * 2, height: r * 2, borderRadius: "50%", background: `radial-gradient(circle, rgba(${palette.halo},0.32), rgba(${palette.halo},0.08) 70%, transparent)`, boxShadow: `0 0 0 2px rgba(255,226,180,0.6)` }} />
        {Array.from({ length: n }, (_, i) => {
          const a = (i / n) * Math.PI * 2 + random(`ta-${i}`) * 0.3;
          return <div key={i} style={{ position: "absolute", left: 960 + Math.cos(a) * (r + 36), top: 470 + Math.sin(a) * (r + 36), transform: "translate(-50%, -50%)", fontFamily: fonts.mono, fontSize: 30, fontWeight: 700, color: "rgba(232,238,242,0.6)", opacity: 0.4 + 0.6 * Math.abs(Math.sin(frame / 7 + i)) }}>?</div>;
        })}
        <div style={{ position: "absolute", left: 0, right: 0, top: 390, textAlign: "center", fontSize: 150, fontWeight: 900, letterSpacing: 28, paddingLeft: 28, transform: `scale(${interpolate(frame, [0, 10], [1.15, 1], { extrapolateRight: "clamp" })})`, textShadow: `0 0 40px rgba(${palette.halo},0.5)` }}>{brand.topic}</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 900, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>{brand.series} · {brand.topicLatin}</div>
      </div>
      <Sfx name="boom" at={0} volume={0.8} />
      {[1, 2, 3, 4, 5, 6, 7].map((k) => (
        <Sfx key={k} name="shutter" at={k * BEAT} volume={0.16} />
      ))}
    </ObsFrame>
  );
};
