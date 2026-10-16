import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { useEpisode } from "../EpisodeContext";
import type { Line } from "../types";
import { KineticText, keyLandsAt } from "./Kinetic";

// "第一种，叫作【自爱心】" → plain text with the bracketed part in accent colour.
export const RichText: React.FC<{ text: string }> = ({ text }) => {
  const { look } = useEpisode();
  // 【【key】】 reads as a plain highlight outside the kinetic layer
  const parts = text.replace(/【【/g, "【").replace(/】】/g, "】").split(/(【[^】]*】)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("【") ? (
          <span key={i} style={{ color: look.accent, textShadow: `0 0 12px ${look.accentGlow}` }}>
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
  const { look, timeline } = useEpisode();
  const idx = cues.findLastIndex((c) => frame >= c);
  if (idx < 0 || hide.includes(idx)) return null;
  const start = cues[idx];
  const end = idx + 1 < cues.length ? cues[idx + 1] : duration;
  const opacity = interpolate(frame, [start, start + 8, end - 6, end], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const lift = interpolate(frame, [start, start + 10], [10, 0], { extrapolateRight: "clamp" });
  const keyAt = look.fx ? keyLandsAt(lines[idx].text, timeline.BEAT) : -1;
  const kick = keyAt >= 0 && frame - start >= keyAt ? Math.exp(-(frame - start - keyAt) / 4) * Math.cos((frame - start - keyAt) * 1.3) : 0;

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
        transform: `translateY(${lift}px) scale(${1 + 0.035 * kick})`,
        textShadow: look.board ? "none" : "0 2px 10px rgba(0,0,0,0.9)",
        ...(look.board ? { fontWeight: 400, fontSize: size * 1.12, color: "#1f2023" } : {}),
      }}
    >
      <span
        style={{
          display: "inline-block",
          padding: "18px 90px",
          background: look.board
            ? "radial-gradient(ellipse at center, rgba(250,249,245,0.95) 35%, rgba(250,249,245,0) 72%)"
            : "radial-gradient(ellipse at center, rgba(8,7,6,0.85) 30%, rgba(8,7,6,0) 72%)",
        }}
      >
        {look.fx ? <KineticText text={lines[idx].text} t={frame - start} look={look} beat={timeline.BEAT} seed={`l${idx}`} /> : <RichText text={lines[idx].text} />}
      </span>
    </div>
  );
};
