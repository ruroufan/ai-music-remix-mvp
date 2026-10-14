import React from "react";
import { useCurrentFrame } from "remotion";
import { ApertureMark } from "./ObsFrame";
import { fonts, palette } from "./look";
import { useEpisode } from "../../EpisodeContext";

// Channel outro: aperture mark, channel name, series + topic, and the sign-off
// line, which types itself in (three characters per beat) starting at `signoffAt`
// (scene-local frame).
export const EndCard: React.FC<{ opacity: number; signoffAt: number }> = ({ opacity, signoffAt }) => {
  const frame = useCurrentFrame();
  const { brand, timeline } = useEpisode();
  const text = brand.signoff ?? "";
  const shown = Math.max(0, Math.min(text.length, Math.floor(((frame - signoffAt) / timeline.BEAT) * 3)));
  return (
    <div style={{ position: "absolute", inset: 0, opacity, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
      <ApertureMark size={110} />
      <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: 24 }}>{brand.channel}</div>
      <div style={{ fontFamily: fonts.mono, fontSize: 20, letterSpacing: 8, color: palette.dim }}>
        {brand.channelLatin} · {brand.series} {brand.topic}
      </div>
      <div style={{ marginTop: 36, height: 50, fontSize: 38, fontWeight: 700, letterSpacing: 4 }}>
        {text.slice(0, shown)}
        <span style={{ color: palette.accent, opacity: shown < text.length && shown > 0 ? 1 : 0 }}>▍</span>
      </div>
    </div>
  );
};
