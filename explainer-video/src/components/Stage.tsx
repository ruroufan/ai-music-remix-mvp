import React from "react";
import { random } from "remotion";
import { theme } from "../theme";

// ---------- GazeField: rows of eyes on a perspective floor, all staring at one point ----------

type EyeSpec = { x: number; y: number; s: number; id: number };

const makeEyes = (horizon: number, depth: number): EyeSpec[] => {
  const out: EyeSpec[] = [];
  let id = 0;
  for (let r = 0; r < 7; r++) {
    const t = r / 6;
    const y = horizon + Math.pow(t, 1.6) * depth;
    const s = 0.7 + t * 1.6;
    const n = 9 + r * 3;
    const spread = 500 + t * 1500;
    for (let i = 0; i < n; i++) {
      const jitter = (random(`eye-${r}-${i}`) - 0.5) * (spread / n);
      out.push({ x: 960 - spread / 2 + (i + 0.5) * (spread / n) + jitter, y, s, id: id++ });
    }
  }
  return out;
};

const Eye: React.FC<{ e: EyeSpec; open: number }> = ({ e, open }) => (
  <g transform={`translate(${e.x} ${e.y}) scale(${e.s})`}>
    <path d={`M-14 0 Q0 ${-10 * open} 14 0 Q0 ${10 * open} -14 0 Z`} fill="#1c1a17" stroke="rgba(239,233,223,0.45)" strokeWidth={1.2} />
    <circle cx={0} cy={-1} r={3.6 * open} fill="rgba(239,233,223,0.85)" />
  </g>
);

export const GazeField: React.FC<{
  target: { x: number; y: number };
  progress: number; // lines growing towards the target
  open?: number; // eyelids
  horizon?: number;
  depth?: number;
  opacity?: number;
}> = ({ target, progress, open = 1, horizon = 560, depth = 480, opacity = 1 }) => {
  const eyes = makeEyes(horizon, depth);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity }}>
      {eyes.map((e) => {
        const p = Math.min(1, Math.max(0, progress * 1.4 - random(`g-${e.id}`) * 0.4));
        return (
          <line
            key={`l${e.id}`}
            x1={e.x}
            y1={e.y}
            x2={e.x + (target.x - e.x) * p}
            y2={e.y + (target.y - e.y) * p}
            stroke="rgba(217,184,120,0.16)"
            strokeWidth={1}
          />
        );
      })}
      {eyes.map((e) => (
        <Eye key={e.id} e={e} open={open} />
      ))}
    </svg>
  );
};

// Closed eyes (lash arcs) floating in the dark — "someone might be watching".
export const WatchingEyes: React.FC<{ count?: number; opacity?: number }> = ({ count = 26, opacity = 1 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity }}>
    {Array.from({ length: count }, (_, i) => {
      const x = 180 + random(`we-x-${i}`) * 1560;
      const y = 130 + random(`we-y-${i}`) * 800;
      if (x > 640 && x < 1280 && y > 180 && y < 760) return null; // keep the centre clear
      return (
        <g key={i} transform={`translate(${x} ${y})`} stroke="rgba(217,184,120,0.5)" strokeWidth={1.5} fill="none">
          <path d="M-12 0 Q0 7 12 0" />
          <path d="M-8 3 l-2 4 M0 5 l0 4 M8 3 l2 4" />
        </g>
      );
    })}
  </svg>
);

// ---------- Pedestal: a white plinth, optionally branded ----------

export const Pedestal: React.FC<{
  x: number;
  bottom: number;
  width?: number;
  height: number;
  label?: string;
  labelOpacity?: number;
  fontSize?: number;
}> = ({ x, bottom, width = 260, height, label, labelOpacity = 1, fontSize = 64 }) => (
  <div
    style={{
      position: "absolute",
      left: x - width / 2,
      top: bottom - height,
      width,
      height,
      background: "linear-gradient(#ece8e0, #a9a39a)",
      boxShadow: "0 0 60px rgba(255,240,215,0.15)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    }}
  >
    {label && (
      <span
        style={{
          fontSize,
          fontWeight: 900,
          letterSpacing: fontSize * 0.1,
          color: theme.accent,
          opacity: labelOpacity,
          textShadow: `0 0 ${8 + labelOpacity * 16}px rgba(224,83,63,0.8)`,
        }}
      >
        {label}
      </span>
    )}
  </div>
);

// ---------- Floor: the stage floor band ----------

export const Floor: React.FC<{ y: number; color?: string }> = ({ y, color = "#1b1915" }) => (
  <div style={{ position: "absolute", left: 0, top: y, width: 1920, height: 1080 - y, background: `linear-gradient(${color}, #0b0a09)` }} />
);

// ---------- GlowWord: big gold keyword ----------

export const GlowWord: React.FC<{ text: string; x?: number; y: number; size?: number; opacity?: number; color?: string }> = ({
  text,
  x = 960,
  y,
  size = 150,
  opacity = 1,
  color = theme.gold,
}) => (
  <div
    style={{
      position: "absolute",
      left: x - 600,
      width: 1200,
      top: y - size / 2,
      textAlign: "center",
      fontSize: size,
      fontWeight: 900,
      letterSpacing: size * 0.12,
      lineHeight: 1,
      color,
      opacity,
      textShadow: `0 0 30px rgba(217,184,120,0.45), 0 2px 0 rgba(0,0,0,0.6)`,
    }}
  >
    {text}
  </div>
);

// ---------- Dust: particles that leave a rectangle and fall away ----------
// Used to dissolve a word: render GlowWord with opacity (1 - progress) and Dust
// over the same box.

export const Dust: React.FC<{
  box: { x: number; y: number; w: number; h: number };
  progress: number;
  count?: number;
  color?: string;
  direction?: 1 | -1; // 1 = fall, -1 = rise
}> = ({ box, progress, count = 260, color = "217,184,120", direction = 1 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: count }, (_, i) => {
      const px = box.x + random(`du-x-${i}`) * box.w;
      const py = box.y + random(`du-y-${i}`) * box.h;
      // Particles near the top of the word go first, like it is crumbling.
      const start = ((py - box.y) / box.h) * 0.5 + random(`du-d-${i}`) * 0.2;
      const p = Math.max(0, Math.min(1, (progress - start) / 0.5));
      if (p <= 0) return null;
      const dx = (random(`du-vx-${i}`) - 0.5) * 160 * p;
      const dy = direction * (40 + random(`du-vy-${i}`) * 260) * p * p;
      return (
        <circle
          key={i}
          cx={px + dx}
          cy={py + dy}
          r={1 + random(`du-r-${i}`) * 1.8}
          fill={`rgba(${color},${(1 - p) * 0.9})`}
        />
      );
    })}
  </svg>
);
