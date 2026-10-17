import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// Title card: the word as a projected film frame — it flickers, and on every
// beat it leaves a fading after-image behind it, like a replay that won't stop.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const show = useRamp(0, 6);
  const punch = interpolate(frame, [0, BEAT], [1.12, 1], { extrapolateRight: "clamp" });
  const flicker = 0.85 + random(`tf-${Math.floor(frame / 2)}`) * 0.15;
  const beats = Math.floor(frame / BEAT);

  const word = (style: React.CSSProperties) => (
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
        ...style,
      }}
    >
      {brand.topic}
    </div>
  );

  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: show }}>
        <Halo x={960} y={470} r={460} intensity={0.9 * flicker} />
        {/* the film frame */}
        <div style={{ position: "absolute", left: 560, top: 280, width: 800, height: 380, border: `3px solid rgba(${palette.halo},0.35)`, borderRadius: 10 }}>
          {Array.from({ length: 12 }, (_, i) => (
            <React.Fragment key={i}>
              <div style={{ position: "absolute", left: 20 + i * 64, top: -22, width: 24, height: 12, borderRadius: 3, background: "#1e2632" }} />
              <div style={{ position: "absolute", left: 20 + i * 64, bottom: -22, width: 24, height: 12, borderRadius: 3, background: "#1e2632" }} />
            </React.Fragment>
          ))}
        </div>
        {/* after-images of earlier beats */}
        {[1, 2, 3].map((k) =>
          beats - k >= 0
            ? word({ color: "transparent", WebkitTextStroke: `2px rgba(${palette.halo},${0.4 / k})`, transform: `translate(${-k * 26}px, ${k * 8}px) scale(${1 - k * 0.04})` })
            : null,
        )}
        {word({ color: "#030405", transform: `scale(${punch})`, opacity: flicker, textShadow: `0 0 2px rgba(${palette.halo},0.95), 0 0 26px rgba(${palette.halo},0.6)` })}
        <div style={{ position: "absolute", left: 0, right: 0, top: 690, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>
          {brand.series} · {brand.topicLatin} · REPLAY ×{beats + 1}
        </div>
      </div>
      <Sfx name="boom" at={0} volume={0.8} />
      {[1, 2, 3, 4, 5, 6].map((k) => (
        <Sfx key={k} name="shutter" at={k * BEAT} volume={0.18} />
      ))}
    </ObsFrame>
  );
};
