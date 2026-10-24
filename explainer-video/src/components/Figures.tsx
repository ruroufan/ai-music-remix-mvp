import React from "react";
import { random } from "remotion";

// A flat silhouette built from a circle and two rounded rects, with an optional
// rim light — the whole cast of the video is this one component.
export const Silhouette: React.FC<{
  x: number;
  bottom: number;
  height?: number;
  rim?: string;
  opacity?: number;
  fill?: string;
}> = ({ x, bottom, height = 260, rim = "rgba(255,230,190,0.85)", opacity = 1, fill = "#0a0908" }) => {
  const s = height / 260;
  return (
    <svg
      width={120 * s}
      height={height}
      viewBox="0 0 120 260"
      style={{ position: "absolute", left: x - 60 * s, top: bottom - height, opacity, overflow: "visible" }}
    >
      <g fill={fill} stroke={rim} strokeWidth={1.6}>
        <rect x={38} y={150} width={16} height={110} rx={4} />
        <rect x={66} y={150} width={16} height={110} rx={4} />
        <path d="M22 100 Q22 66 60 66 Q98 66 98 100 L98 170 Q98 178 90 178 L30 178 Q22 178 22 170 Z" />
        <circle cx={60} cy={34} r={28} />
      </g>
    </svg>
  );
};

// A soft cone of light from above, aimed at `x`.
export const Spotlight: React.FC<{ x: number; floor: number; width?: number; intensity?: number; color?: string }> = ({
  x,
  floor,
  width = 420,
  intensity = 1,
  color = "255,240,215",
}) => (
  <>
    <div
      style={{
        position: "absolute",
        left: x - width / 2,
        top: 0,
        width,
        height: floor,
        clipPath: `polygon(${width * 0.4}px 0, ${width * 0.6}px 0, 100% 100%, 0 100%)`,
        background: `linear-gradient(to bottom, rgba(${color},${0.32 * intensity}), rgba(${color},${0.1 * intensity}))`,
        filter: "blur(6px)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: x - width * 0.6,
        top: floor - 40,
        width: width * 1.2,
        height: 80,
        borderRadius: "50%",
        background: `radial-gradient(ellipse, rgba(${color},${0.35 * intensity}), transparent 70%)`,
      }}
    />
  </>
);

// Lines radiating from (cx, cy). Generated, not drawn: count/length are seeded.
export const Rays: React.FC<{ cx: number; cy: number; count?: number; progress: number; color?: string }> = ({
  cx,
  cy,
  count = 90,
  progress,
  color = "217,184,120",
}) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: count }, (_, i) => {
      const a = random(`ray-a-${i}`) * Math.PI * 2;
      const len = (500 + random(`ray-l-${i}`) * 900) * progress;
      return (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={cx + Math.cos(a) * len}
          y2={cy + Math.sin(a) * len}
          stroke={`rgba(${color},${0.08 + random(`ray-o-${i}`) * 0.25})`}
          strokeWidth={1}
        />
      );
    })}
  </svg>
);
