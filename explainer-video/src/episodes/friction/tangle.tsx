import React from "react";
import { random } from "remotion";
import { fonts, palette } from "../../channels/backlit/look";
import { Halo } from "../../channels/backlit/parts";

// 《内耗》's image: a person sitting still while, above their head, black
// threads churn in tangled loops — every imagined scene, replayed. When they
// stand up and reach out to do the thing, the threads are pulled straight one
// by one and lie neat and lit.

const K = 44; // points per thread

const ease = (t: number) => t * t * (3 - 2 * t);

// `straight(i)` 0 → 1: thread i is pulled straight onto the row at `rows.y`.
export const Tangle: React.FC<{
  cx: number;
  cy: number;
  r: number;
  frame: number;
  threads?: number;
  churn?: number;
  straight?: (i: number) => number;
  rows?: { x0: number; x1: number; y: number; gap: number };
  opacity?: number;
}> = ({ cx, cy, r, frame, threads = 14, churn = 1, straight = () => 0, rows = { x0: 360, x1: 1560, y: 300, gap: 18 }, opacity = 1 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity, overflow: "visible" }}>
    {Array.from({ length: threads }, (_, i) => {
      const s = ease(Math.max(0, Math.min(1, straight(i))));
      const dir = i % 2 ? 1 : -1;
      const ph = random(`tp-${i}`) * 6;
      const pts = Array.from({ length: K }, (_, j) => {
        const a = j * (0.42 + random(`ta-${i}`) * 0.2) + ph + frame * 0.035 * churn * dir;
        const rad = r * (0.08 + 0.62 * Math.abs(Math.sin(j * 0.33 + i * 0.9 + frame * 0.021 * churn)) + 0.3 * Math.abs(Math.sin(j * 0.71 + i * 2.3 - frame * 0.013 * churn)));
        const tx = cx + Math.cos(a) * rad * 0.85 + r * 0.28 * Math.sin(j * 0.19 + i * 1.7 + frame * 0.017 * churn) + Math.sin(frame / 23 + i) * 8 * churn;
        const ty = cy + Math.sin(a * 1.3) * rad * 0.62 + r * 0.18 * Math.cos(j * 0.27 + i * 0.6 - frame * 0.015 * churn);
        const sx = rows.x0 + ((rows.x1 - rows.x0) * j) / (K - 1);
        const sy = rows.y + (i - (threads - 1) / 2) * rows.gap + Math.sin(j * 0.5 + i) * 2 * (1 - s);
        return [tx + (sx - tx) * s, ty + (sy - ty) * s];
      });
      const d = pts.reduce((acc, [x, y], j) => {
        if (j === 0) return `M${x.toFixed(1)} ${y.toFixed(1)}`;
        const [px, py] = pts[j - 1];
        return `${acc} Q${px.toFixed(1)} ${py.toFixed(1)} ${((px + x) / 2).toFixed(1)} ${((py + y) / 2).toFixed(1)}`;
      }, "");
      const lit = s;
      return (
        <g key={i}>
          <path d={d} fill="none" stroke={lit > 0.05 ? `rgba(${palette.halo},${0.25 * lit})` : "rgba(232,238,242,0.16)"} strokeWidth={lit > 0.05 ? 9 : 7} strokeLinecap="round" />
          <path d={d} fill="none" stroke={lit > 0.5 ? `rgba(${palette.halo},${0.6 + 0.4 * lit})` : "#05070a"} strokeWidth={3.4} strokeLinecap="round" />
        </g>
      );
    })}
  </svg>
);

const THOUGHTS = ["万一他不回呢…", "会不会很尴尬", "被拒绝怎么办", "他是不是生气了", "我是不是说错了", "要不再等等", "这样写行吗", "肯定会搞砸"];

// Fragments of imagined scenes flickering inside the tangle.
export const Thoughts: React.FC<{ cx: number; cy: number; r: number; frame: number; opacity?: number; beat: number }> = ({ cx, cy, r, frame, opacity = 1, beat }) => (
  <>
    {THOUGHTS.map((t, i) => {
      const slot = Math.floor(frame / beat + i * 0.5) % THOUGHTS.length;
      const on = slot === i || slot === (i + 3) % THOUGHTS.length;
      const a = random(`th-${i}`) * Math.PI * 2;
      const d = r * (0.3 + random(`td-${i}`) * 0.55);
      return (
        <div key={t} style={{ position: "absolute", left: cx + Math.cos(a) * d, top: cy + Math.sin(a) * d * 0.7, transform: "translate(-50%, -50%)", fontSize: 24, fontWeight: 700, color: "rgba(232,238,242,0.75)", opacity: opacity * (on ? 0.9 : 0.12), whiteSpace: "nowrap", textShadow: "0 0 8px #000, 0 0 3px #000" }}>
          {t}
        </div>
      );
    })}
  </>
);

// Sitting on a chair, side-on, facing right. (x = the chair's front edge.)
export const Seated: React.FC<{ x: number; floor: number; scale?: number; glow?: number; slump?: number }> = ({ x, floor, scale = 1.3, glow = 0.6, slump = 0 }) => {
  const s = scale;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Halo x={x - 40 * s} y={floor - 170 * s} r={220 * s} intensity={glow} />
      <div style={{ position: "absolute", left: x - 120 * s, top: floor - 100 * s, width: 130 * s, height: 14, background: "#1c2330", border: `1px solid ${palette.faint}` }} />
      <div style={{ position: "absolute", left: x - 120 * s, top: floor - 210 * s, width: 12, height: 110 * s, background: "#1c2330" }} />
      <div style={{ position: "absolute", left: x - 110 * s, top: floor - 86 * s, width: 10, height: 86 * s, background: "#141a24" }} />
      <div style={{ position: "absolute", left: x - 6, top: floor - 86 * s, width: 10, height: 86 * s, background: "#141a24" }} />
      <svg width={160 * s} height={260 * s} viewBox="0 0 160 260" style={{ position: "absolute", left: x - 140 * s, top: floor - 260 * s, overflow: "visible" }}>
        <g fill="#030405" stroke={`rgba(${palette.halo},${0.4 + 0.5 * glow})`} strokeWidth={1.8} transform={`rotate(${slump * 8} 60 160)`}>
          <path d="M120 180 L140 180 L142 258 L120 258 Z" />
          <path d="M40 152 L132 152 Q140 152 140 162 L140 184 L40 184 Z" />
          <path d="M36 150 Q30 96 62 88 Q92 86 96 124 L98 168 L38 168 Z" />
          <circle cx={70 + slump * 6} cy={56 + slump * 10} r={28} />
        </g>
      </svg>
    </div>
  );
};

// Standing side-on, facing right, one arm reaching forward by `reach` (0 → 1).
export const Doer: React.FC<{ x: number; floor: number; height?: number; reach?: number; glow?: number }> = ({ x, floor, height = 270, reach = 1, glow = 1 }) => {
  const s = height / 260;
  const armDeg = -reach * 80; // 0 = hanging, -80 = straight out ahead
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Halo x={x} y={floor - height * 0.6} r={height * 0.95} intensity={glow} />
      <svg width={120 * s} height={260 * s} viewBox="0 0 120 260" style={{ position: "absolute", left: x - 60 * s, top: floor - 260 * s, overflow: "visible", transform: "scaleX(-1)" }}>
        <g fill="#030405" stroke={`rgba(${palette.halo},${0.4 + 0.55 * glow})`} strokeWidth={1.8}>
          <rect x={44} y={146} width={18} height={112} rx={8} />
          <rect x={58} y={146} width={18} height={112} rx={8} />
          <path d="M38 150 L36 90 Q36 64 62 62 Q86 64 84 92 L82 150 Z" />
          <rect x={-7} y={0} width={14} height={84} rx={7} transform={`translate(58 78) rotate(${-armDeg})`} />
          <path d="M60 6 A26 26 0 1 1 60 58 Q48 58 40 48 L34 40 L38 36 Q34 20 44 12 Q51 6 60 6 Z" />
        </g>
      </svg>
    </div>
  );
};

export const Label: React.FC<{ x: number; y: number; children: React.ReactNode; color?: string; size?: number; opacity?: number }> = ({ x, y, children, color = palette.dim, size = 22, opacity = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, fontFamily: fonts.mono, fontSize: size, letterSpacing: 4, color, opacity, whiteSpace: "nowrap" }}>{children}</div>
);
