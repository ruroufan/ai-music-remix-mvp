import React from "react";
import { random } from "remotion";
import { theme } from "../theme";

const COLS = 6;
const ROWS = 3;

// The title is cut into triangles (a grid, each cell split along a diagonal).
// Every shard is the same text clipped to its triangle, starting scattered and
// flying home as `progress` goes 0 → 1.
export const ShatterTitle: React.FC<{ text: string; progress: number; width?: number; height?: number }> = ({
  text,
  progress,
  width = 760,
  height = 300,
}) => {
  const cw = 100 / COLS;
  const ch = 100 / ROWS;
  const shards: string[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x0 = c * cw, x1 = x0 + cw, y0 = r * ch, y1 = y0 + ch;
      shards.push(`${x0}% ${y0}%, ${x1}% ${y0}%, ${x0}% ${y1}%`);
      shards.push(`${x1}% ${y0}%, ${x1}% ${y1}%, ${x0}% ${y1}%`);
    }
  }
  const glow = Math.max(0, (progress - 0.85) / 0.15);

  return (
    <div style={{ position: "relative", width, height }}>
      {shards.map((poly, i) => {
        // Shards land at slightly different times so the assembly ripples.
        const delay = random(`d-${i}`) * 0.35;
        const p = Math.min(1, Math.max(0, (progress - delay) / (1 - delay)));
        const ease = 1 - Math.pow(1 - p, 4);
        const k = 1 - ease;
        const dx = (random(`x-${i}`) - 0.5) * 900 * k;
        const dy = (random(`y-${i}`) * 0.6 + 0.4) * 500 * k;
        const rot = (random(`r-${i}`) - 0.5) * 140 * k;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: 0,
              clipPath: `polygon(${poly})`,
              transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`,
              opacity: Math.min(1, p * 2),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: theme.font,
              fontWeight: 900,
              fontSize: height * 0.8,
              letterSpacing: height * 0.08,
              color: "#efe6e2",
              textShadow: `0 0 ${10 + glow * 30}px rgba(224,83,63,${0.35 + glow * 0.5})`,
            }}
          >
            {text}
          </div>
        );
      })}
    </div>
  );
};
