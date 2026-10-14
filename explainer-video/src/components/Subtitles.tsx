import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { theme } from "../theme";
import type { Line } from "../script";

// "第一种，叫作【自爱心】" → plain text with the bracketed part in accent colour.
export const RichText: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(【[^】]*】)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("【") ? (
          <span key={i} style={{ color: theme.accent, textShadow: `0 0 12px rgba(224,83,63,0.6)` }}>
            {p.slice(1, -1)}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
};

type Props = {
  lines: Line[];
  cues: number[];
  duration: number;
  position?: "bottom" | "top" | "center";
  // Explicit top offset in px, overrides `position`.
  y?: number;
  size?: number;
  // Line indices the scene renders itself (e.g. a big quote) — no subtitle for them.
  hide?: number[];
};

export const Subtitles: React.FC<Props> = ({ lines, cues, duration, position = "bottom", y, size = 46, hide = [] }) => {
  const frame = useCurrentFrame();
  const idx = cues.findLastIndex((c) => frame >= c);
  if (idx < 0 || hide.includes(idx)) return null;
  const start = cues[idx];
  const end = idx + 1 < cues.length ? cues[idx + 1] : duration;
  const opacity = interpolate(frame, [start, start + 8, end - 6, end], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lift = interpolate(frame, [start, start + 10], [10, 0], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        ...(y !== undefined
          ? { top: y }
          : position === "bottom"
            ? { bottom: 110 }
            : position === "top"
              ? { top: 150 }
              : { top: "50%", marginTop: -size }),
        textAlign: "center",
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.55,
        letterSpacing: 2,
        whiteSpace: "pre-line",
        opacity,
        transform: `translateY(${lift}px)`,
        textShadow: "0 2px 10px rgba(0,0,0,0.9)",
      }}
    >
      <span
        style={{
          display: "inline-block",
          padding: "18px 90px",
          background: "radial-gradient(ellipse at center, rgba(8,7,6,0.85) 30%, rgba(8,7,6,0) 72%)",
        }}
      >
        <RichText text={lines[idx].text} />
      </span>
    </div>
  );
};
