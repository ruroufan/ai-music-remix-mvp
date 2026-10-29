import React from "react";
import { random } from "remotion";
import { Halo } from "../../channels/backlit/parts";
import { Walker } from "../nostalgia/road";

// 《ENFP · 新鲜感》's image: a field of plots. He runs across it, throws a
// handful of seed into each plot and is off to the next before anything comes
// up — behind him, nothing but sprouts. At the end he stops in one plot; the
// film fast-forwards, and that plot grows a great tree.

export const LEAF = "140, 214, 140";
export const SUN = "255, 210, 120";
export const SOIL = "#2b1f17";
export const GROUND = 840;
export const PLOTS = [120, 420, 720, 1020, 1320, 1620].map((x) => ({ x, w: 240 }));
export const plotCx = (i: number) => PLOTS[i].x + PLOTS[i].w / 2;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// a sprout: `g` 0 → 1 pushes it up out of the soil and unfolds two leaves
export const Sprout: React.FC<{ x: number; y?: number; g: number; size?: number }> = ({ x, y = GROUND, g, size = 1 }) => {
  if (g <= 0) return null;
  const s = size * (0.4 + 0.6 * clamp01(g));
  const h = 34 * s;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <path d={`M${x} ${y} Q${x + 3 * s} ${y - h * 0.6} ${x} ${y - h}`} fill="none" stroke={`rgb(${LEAF})`} strokeWidth={3 * s} />
      <path d={`M${x} ${y - h} q${-16 * s} ${-4 * s} ${-20 * s} ${-14 * s} q${12 * s} ${-2 * s} ${20 * s} ${14 * s}`} fill={`rgb(${LEAF})`} />
      <path d={`M${x} ${y - h} q${16 * s} ${-6 * s} ${20 * s} ${-16 * s} q${-12 * s} 0 ${-20 * s} ${16 * s}`} fill={`rgb(${LEAF})`} />
    </svg>
  );
};

// one plot of soil, with up to five sprouts in it
export const Plot: React.FC<{ i: number; g?: number; seeded?: number; glow?: number; label?: string; dim?: number }> = ({ i, g = 0, seeded = 0, glow = 0, label, dim = 0 }) => {
  const { x, w } = PLOTS[i];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.7 * dim }}>
      {glow > 0 && <Halo x={x + w / 2} y={GROUND - 20} r={180} intensity={glow} rgb={SUN} />}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <path d={`M${x} ${GROUND + 6} Q${x + w / 2} ${GROUND - 26} ${x + w} ${GROUND + 6} Z`} fill={SOIL} stroke="rgba(214,170,120,0.35)" strokeWidth={2} />
        {seeded > 0 && Array.from({ length: 9 }, (_, k) => <circle key={k} cx={x + 30 + random(`sd${i}-${k}`) * (w - 60)} cy={GROUND - 4 - random(`sy${i}-${k}`) * 10} r={2.5} fill="#e6c79a" opacity={seeded * (1 - clamp01(g * 2))} />)}
      </svg>
      {[0.2, 0.36, 0.5, 0.64, 0.8].map((f, k) => (
        <Sprout key={k} x={x + w * f} y={GROUND - 8 - Math.sin(f * Math.PI) * 10} g={g - k * 0.05} size={0.8} />
      ))}
      {label && <div style={{ position: "absolute", left: x, width: w, top: GROUND + 24, textAlign: "center", fontSize: 24, fontWeight: 800, color: "rgba(232,238,242,0.6)" }}>{label}</div>}
    </div>
  );
};

// the field: sky, low hills, the ground
export const Field: React.FC<{ day?: number }> = ({ day = 0 }) => (
  <div style={{ position: "absolute", inset: 0 }}>
    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(rgba(${SUN},${0.02 + 0.12 * day}), transparent 60%)` }} />
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <path d={`M0 ${GROUND - 120} Q400 ${GROUND - 220} 800 ${GROUND - 140} Q1200 ${GROUND - 60} 1500 ${GROUND - 170} Q1750 ${GROUND - 230} 1920 ${GROUND - 150} L1920 ${GROUND} L0 ${GROUND} Z`} fill="#11161a" />
      <rect x={0} y={GROUND} width={1920} height={1080 - GROUND} fill="#14110e" />
      <line x1={0} y1={GROUND} x2={1920} y2={GROUND} stroke="rgba(214,170,120,0.3)" strokeWidth={2} />
    </svg>
  </div>
);

// the tree: `grow` 0 → 1 from a sprout to a full crown
export const Tree: React.FC<{ x: number; y?: number; grow: number; frame?: number }> = ({ x, y = GROUND, grow, frame = 0 }) => {
  const g = clamp01(grow);
  const trunk = 40 + 380 * g;
  const crown = 30 + 300 * Math.max(0, (g - 0.15) / 0.85);
  const sway = Math.sin(frame / 30) * 3 * g;
  const top = { x: x + sway, y: y - trunk };
  const blobs = [[0, 0, 1], [-0.7, 0.25, 0.75], [0.7, 0.25, 0.75], [-0.4, -0.45, 0.7], [0.45, -0.4, 0.7], [0, 0.45, 0.6]];
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Halo x={top.x} y={top.y} r={crown * 1.6} intensity={0.5 * g} rgb={SUN} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d={`M${x - 8 - 22 * g} ${y} Q${x - 6 * g} ${y - trunk * 0.5} ${top.x - 4} ${top.y} L${top.x + 4} ${top.y} Q${x + 6 * g} ${y - trunk * 0.5} ${x + 8 + 22 * g} ${y} Z`} fill="#3a2a1e" stroke="rgba(214,170,120,0.5)" strokeWidth={2} />
        {g > 0.3 &&
          [[-1, 0.55], [1, 0.45], [-1, 0.75], [1, 0.7]].map(([d, h], k) => (
            <path key={k} d={`M${x + sway * h} ${y - trunk * h} Q${x + d * crown * 0.35} ${y - trunk * h - 30} ${x + d * crown * 0.6} ${y - trunk * h - 60 * g}`} fill="none" stroke="#3a2a1e" strokeWidth={6 + 6 * g} strokeLinecap="round" />
          ))}
        {g > 0.05 &&
          blobs.map(([dx, dy, r], k) => <circle key={k} cx={top.x + dx * crown * 0.7} cy={top.y + dy * crown * 0.7} r={crown * 0.55 * r} fill={`rgba(${LEAF},${0.75 - k * 0.05})`} stroke={`rgba(${SUN},0.35)`} strokeWidth={2} />)}
        {g > 0.85 &&
          Array.from({ length: 10 }, (_, k) => <circle key={`f${k}`} cx={top.x + (random(`fr${k}`) - 0.5) * crown * 1.4} cy={top.y + (random(`fy${k}`) - 0.4) * crown} r={7} fill={`rgb(${SUN})`} opacity={(g - 0.85) / 0.15} />)}
      </svg>
    </div>
  );
};

// him, running (leaning into it) or walking
export const Runner: React.FC<{ x: number; bottom?: number; height?: number; run?: number; walk: number; glow?: number; face?: "left" | "right" }> = ({ x, bottom = GROUND, height = 250, run = 1, walk, glow = 0.8, face = "right" }) => (
  <Walker x={x} bottom={bottom} height={height} face={face} walk={walk} lean={(face === "right" ? -1 : 1) * 10 * run} glow={glow} rgb={SUN} />
);

// a handful of seed flung in an arc from (x, y) down into the plot
export const Throw: React.FC<{ x: number; y: number; to: number; k: number }> = ({ x, y, to, k }) =>
  k <= 0 || k >= 1 ? null : (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 10 }, (_, i) => {
        const dx = (to - x) * (0.6 + 0.8 * random(`t${i}`)) * k;
        const dy = -120 * Math.sin(k * Math.PI) * (0.6 + 0.4 * random(`ty${i}`)) + (GROUND - y) * k * k;
        return <circle key={i} cx={x + dx} cy={y + dy} r={3} fill="#e6c79a" />;
      })}
    </svg>
  );
