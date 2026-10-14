import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { theme } from "../../theme";
import { brand } from "./episode";

const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  // New noise seed every 2 frames gives a subtle, film-like flicker.
  const seed = Math.floor(frame / 2) % 50;
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.07, mixBlendMode: "screen" }}>
      <filter id={`grain-${seed}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
    </svg>
  );
};

export const Header: React.FC<{ showTopic: boolean }> = ({ showTopic }) => (
  <>
    <div style={{ position: "absolute", left: 56, top: 40, display: "flex", alignItems: "flex-start", gap: 56 }}>
      <div style={{ color: theme.accent, fontFamily: "Georgia, serif", fontSize: 64, lineHeight: 1 }}>P</div>
      {showTopic && (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: theme.font,
              fontWeight: 900,
              fontSize: 76,
              lineHeight: 1,
              color: "#f3d6cf",
              textShadow: `0 0 18px ${theme.accent}, 0 0 4px ${theme.accent}`,
            }}
          >
            {brand.topic}
          </div>
          <div style={{ color: theme.dim, fontSize: 15, letterSpacing: 6, fontStyle: "italic", marginTop: 6 }}>
            {brand.topicLatin}
          </div>
        </div>
      )}
    </div>
    <div
      style={{
        position: "absolute",
        right: 64,
        top: 48,
        border: `1.5px solid ${theme.dim}`,
        padding: "6px 14px",
        color: theme.dim,
        fontFamily: theme.font,
        fontSize: 24,
        letterSpacing: 8,
      }}
    >
      {brand.watermark}
    </div>
  </>
);

// Shared chrome for every scene: background, vignette, grain, header, fades.
export const Frame: React.FC<{ duration: number; showTopic?: boolean; children: React.ReactNode }> = ({
  duration,
  showTopic = true,
  children,
}) => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 12, duration - 12, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ background: theme.bg, fontFamily: theme.font, color: theme.ink }}>
      <AbsoluteFill style={{ opacity: fade }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.75) 100%)" }} />
      <Grain />
      <Header showTopic={showTopic} />
    </AbsoluteFill>
  );
};
