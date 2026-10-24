import React from "react";
import { Halo } from "../../channels/backlit/parts";
import { Stander } from "../doubt/circles";

// 《ENTJ · 赢》's image: a man on a high stage, a row of bowed silhouettes
// below; he walks down off it, and the people below raise their heads one by
// one until they're all standing at the same height as him.

export const FLOOR = 800;
export const GOLD = "255, 199, 122";
export const COLD = "170, 200, 230";
export const STEP = { n: 4, h: 70, w0: 620, dw: 120 }; // four steps, 70 px each
export const CROWD_X = [190, 330, 470, 600, 1320, 1450, 1590, 1730];

// the top of the stage at `rise` 0 → 1
export const stageTop = (rise: number) => FLOOR - STEP.n * STEP.h * rise;
// where a foot lands on step k (0 = floor) going down the right-hand side
export const stepAt = (k: number, rise: number, cx = 960) => ({ x: cx + (STEP.w0 - STEP.dw * (STEP.n - k)) / 2 + 30, y: FLOOR - k * STEP.h * rise });

export const Stage: React.FC<{ cx?: number; rise?: number; glow?: number; opacity?: number }> = ({ cx = 960, rise = 1, glow = 1, opacity = 1 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity }}>
    {Array.from({ length: STEP.n }, (_, i) => {
      const w = STEP.w0 - i * STEP.dw;
      const y = FLOOR - (i + 1) * STEP.h * rise;
      return (
        <g key={i}>
          <rect x={cx - w / 2} y={y} width={w} height={STEP.h * rise + 1} fill={`rgb(${18 + i * 4},${17 + i * 4},${16 + i * 3})`} />
          <line x1={cx - w / 2} y1={y} x2={cx + w / 2} y2={y} stroke={`rgba(${GOLD},${0.35 + 0.45 * glow})`} strokeWidth={2} />
        </g>
      );
    })}
  </svg>
);

// the cone of light on whoever is on top
export const Spot: React.FC<{ x: number; y: number; k?: number; rgb?: string }> = ({ x, y, k = 1, rgb = GOLD }) =>
  k <= 0.01 ? null : (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <defs>
        <linearGradient id={`en-spot-${Math.round(x)}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={`rgba(${rgb},${0.4 * k})`} />
          <stop offset="1" stopColor={`rgba(${rgb},${0.05 * k})`} />
        </linearGradient>
      </defs>
      <path d={`M${x - 40} 0 L${x + 40} 0 L${x + 200} ${y} L${x - 200} ${y} Z`} fill={`url(#en-spot-${Math.round(x)})`} />
      <ellipse cx={x} cy={y} rx={200} ry={26} fill={`rgba(${rgb},${0.25 * k})`} />
    </svg>
  );

// One person side-on, facing `face`: `bow` 0 → 1 tips the torso forward from
// the hips and drops the head below the shoulders.
export const Bower: React.FC<{ x: number; bottom: number; height?: number; bow?: number; glow?: number; rgb?: string; face?: 1 | -1 }> = ({ x, bottom, height = 250, bow = 1, glow = 0.5, rgb = COLD, face = 1 }) => {
  const s = height / 250;
  const st = { fill: "#030405", stroke: `rgba(${rgb},${0.35 + 0.6 * glow})`, strokeWidth: 1.8 };
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Halo x={x} y={bottom - height * 0.6} r={height * 0.9} intensity={glow * 0.8} rgb={rgb} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g transform={`translate(${x} ${bottom}) scale(${face * s} ${s})`}>
          {/* legs */}
          <rect x={-14} y={-118} width={13} height={118} rx={5} {...st} />
          <rect x={2} y={-118} width={13} height={118} rx={5} {...st} />
          {/* torso + head, hinged at the hips */}
          <g transform={`rotate(${30 * bow} 0 -112)`}>
            <path d="M-20 -110 L-22 -190 Q-20 -214 0 -216 Q22 -214 22 -190 L20 -110 Z" {...st} />
            <rect x={-6} y={-200} width={12} height={92} rx={6} transform={`rotate(${-10 - 30 * bow} 0 -200)`} {...st} />
            <g transform={`rotate(${30 * bow} 0 -216)`}>
              <circle cx={4} cy={-240} r={22} {...st} />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};

// the row below: `lift(i)` 0 = head bowed, 1 = upright; `nod` bobs the bowed
// heads; `at(i)` overrides a figure's x
export const Crowd: React.FC<{ frame: number; lift?: (i: number) => number; nod?: number; opacity?: number; height?: number; glow?: (i: number) => number; at?: (i: number) => number; rgb?: string }> = ({
  frame,
  lift = () => 0,
  nod = 0,
  opacity = 1,
  height = 250,
  glow = () => 0.45,
  at = (i) => CROWD_X[i],
  rgb = COLD,
}) => (
  <div style={{ position: "absolute", inset: 0, opacity }}>
    {CROWD_X.map((_, i) => {
      const l = Math.max(0, Math.min(1.2, lift(i)));
      const bob = nod > 0 && l < 0.5 ? Math.max(0, Math.sin(frame / 6 + i * 1.3)) * 6 * nod : 0;
      const x = at(i);
      return (
        <div key={i} style={{ position: "absolute", inset: 0, transform: `translateY(${bob}px)` }}>
          <Bower x={x} bottom={FLOOR} height={height} bow={1 - Math.min(1, l)} glow={glow(i)} rgb={l > 0.6 ? GOLD : rgb} face={x < 960 ? 1 : -1} />
        </div>
      );
    })}
  </div>
);

// the man on top (or anywhere): a proud stance by default
export const Leader: React.FC<{ x: number; bottom: number; lift?: number; glow?: number; height?: number; halo?: number }> = ({ x, bottom, lift = 1.8, glow = 0.9, height = 290, halo = 0.5 }) => (
  <>
    <Halo x={x} y={bottom - height * 0.6} r={height} intensity={halo} rgb={GOLD} />
    <Stander x={x} bottom={bottom} height={height} lift={lift} glow={glow} rgb={GOLD} />
  </>
);

// the gold line everyone ends up standing on
export const Level: React.FC<{ k: number; y?: number }> = ({ k, y = FLOOR }) =>
  k <= 0.01 ? null : <div style={{ position: "absolute", left: 960 - 860 * k, top: y - 1, width: 1720 * k, height: 3, background: `rgba(${GOLD},0.85)`, boxShadow: `0 0 18px rgba(${GOLD},0.9)` }} />;
