import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { SEPIA } from "../road";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// The title as an instant photo developing: it's shaken on the beat and the
// word comes up out of the grey into sepia; a light leak sweeps across.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const show = useRamp(0, 6);
  const dev = interpolate(frame, [BEAT, 6 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shake = Math.sin(((frame % BEAT) / BEAT) * Math.PI * 2) * 5 * Math.exp(-((frame % BEAT) / BEAT) * 3) * (1 - dev * 0.6);
  const leak = ((frame % (4 * BEAT)) / (4 * BEAT)) * 1.6 - 0.3;
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: show }}>
        <Halo x={960} y={470} r={460} intensity={0.7} rgb={SEPIA} />
        <div style={{ position: "absolute", left: 960 - 270, top: 170, width: 540, transform: `rotate(${-3 + shake}deg)`, background: "#f1ebdd", padding: "30px 30px 110px", boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}>
          <div style={{ position: "relative", height: 420, overflow: "hidden", background: `rgb(${Math.round(60 + 120 * dev)}, ${Math.round(62 + 80 * dev)}, ${Math.round(66 + 30 * dev)})` }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 190, fontWeight: 900, letterSpacing: 20, color: `rgba(60,36,14,${dev})`, filter: `blur(${(1 - dev) * 8}px)` }}>{brand.topic}</div>
            <div style={{ position: "absolute", top: 0, bottom: 0, left: `${leak * 100}%`, width: 160, background: "linear-gradient(90deg, transparent, rgba(255,190,120,0.45), transparent)", transform: "skewX(-15deg)" }} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, textAlign: "center", fontSize: 34, fontWeight: 700, color: "#5a4632" }}>{brand.series} · 旧时光</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 850, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>{brand.topicLatin}</div>
      </div>
      <Sfx name="shutter" at={0} volume={0.6} />
      <Sfx name="boom" at={0} volume={0.6} />
      {[1, 2, 3, 4, 5].map((k) => (
        <Sfx key={k} name="whoosh" at={k * BEAT} volume={0.1} />
      ))}
    </ObsFrame>
  );
};
