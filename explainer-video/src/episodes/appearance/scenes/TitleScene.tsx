import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { FILTER, FILTER_RGB } from "../faces";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// The title, scanned like a face: viewfinder brackets lock onto it and a scan
// line runs down it on every beat. Under it, its reflection on glossy glass.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const show = useRamp(0, 6);
  const ph = (frame % BEAT) / BEAT;
  const lock = interpolate(frame, [0, 10], [1.25, 1], { extrapolateRight: "clamp" });
  const title = (
    <div style={{ fontSize: 150, fontWeight: 900, letterSpacing: 28, paddingLeft: 28, whiteSpace: "nowrap" }}>{brand.topic}</div>
  );
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: show }}>
        <div style={{ position: "absolute", left: 960 - 440, top: 300, width: 880, height: 220, transform: `scale(${lock})` }}>
          {[
            { left: 0, top: 0, borderLeftWidth: 4, borderTopWidth: 4 },
            { right: 0, top: 0, borderRightWidth: 4, borderTopWidth: 4 },
            { left: 0, bottom: 0, borderLeftWidth: 4, borderBottomWidth: 4 },
            { right: 0, bottom: 0, borderRightWidth: 4, borderBottomWidth: 4 },
          ].map((st, i) => (
            <div key={i} style={{ position: "absolute", width: 60, height: 60, borderColor: FILTER, borderStyle: "solid", borderWidth: 0, ...st }} />
          ))}
          <div style={{ position: "absolute", left: 0, right: 0, top: 22, display: "flex", justifyContent: "center", textShadow: `0 0 40px rgba(${palette.halo},0.45)` }}>{title}</div>
          {/* the scan line */}
          <div style={{ position: "absolute", left: 10, right: 10, top: 10 + ph * 200, height: 3, background: FILTER, boxShadow: `0 0 18px ${FILTER}, 0 0 4px #fff`, opacity: 1 - ph * 0.6 }} />
          <div style={{ position: "absolute", left: 10, right: 10, top: 10, height: ph * 200, background: `linear-gradient(rgba(${FILTER_RGB},0), rgba(${FILTER_RGB},0.12))` }} />
        </div>
        {/* reflection */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 540, display: "flex", justifyContent: "center", transform: "scaleY(-1)", opacity: 0.18, maskImage: "linear-gradient(transparent 30%, #000)", WebkitMaskImage: "linear-gradient(transparent 30%, #000)", filter: "blur(1.5px)" }}>
          {title}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 780, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>
          {brand.series} · {brand.topicLatin}
        </div>
        <div style={{ position: "absolute", left: 960 + 330, top: 268, fontFamily: fonts.mono, fontSize: 16, letterSpacing: 4, color: FILTER, opacity: (Math.floor(frame / 8) % 2) * 0.5 + 0.5 }}>SCANNING…</div>
      </div>
      <Sfx name="boom" at={0} volume={0.8} />
      {[1, 2, 3, 4, 5, 6, 7].map((k) => (
        <Sfx key={k} name="shutter" at={k * BEAT} volume={0.15} />
      ))}
    </ObsFrame>
  );
};
