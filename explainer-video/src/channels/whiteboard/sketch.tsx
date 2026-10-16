import React, { useMemo } from "react";
import rough from "roughjs";
import { getLength, getPointAtLength } from "@remotion/paths";
import { ink, hand } from "./look";

// Hand-drawn shapes (roughjs, seeded so every render is identical) that draw
// themselves stroke by stroke, with a hand holding a marker at the pen tip.

export type Stroke = { d: string; stroke: string; strokeWidth: number };
type Opt = { seed?: number; rough?: number; bow?: number; color?: string; width?: number; fill?: string; gap?: number; single?: boolean };

const gen = rough.generator();
const opts = (o: Opt = {}) => ({
  seed: o.seed ?? 1,
  roughness: o.rough ?? 1.2,
  bowing: o.bow ?? 1,
  stroke: o.color ?? ink.black,
  strokeWidth: o.width ?? 4,
  fill: o.fill,
  fillStyle: "hachure" as const,
  hachureGap: o.gap ?? 10,
  fillWeight: (o.width ?? 4) * 0.6,
  disableMultiStroke: o.single ?? false,
});
const paths = (drawable: ReturnType<typeof gen.line>): Stroke[] =>
  gen.toPaths(drawable).map((p) => ({ d: p.d, stroke: p.stroke === "none" ? (p.fill as string) : p.stroke, strokeWidth: p.strokeWidth || 3 }));

export const rr = {
  line: (x1: number, y1: number, x2: number, y2: number, o?: Opt) => paths(gen.line(x1, y1, x2, y2, opts(o))),
  rect: (x: number, y: number, w: number, h: number, o?: Opt) => paths(gen.rectangle(x, y, w, h, opts(o))),
  circle: (x: number, y: number, d: number, o?: Opt) => paths(gen.circle(x, y, d, opts(o))),
  ellipse: (x: number, y: number, w: number, h: number, o?: Opt) => paths(gen.ellipse(x, y, w, h, opts(o))),
  poly: (pts: [number, number][], o?: Opt) => paths(gen.linearPath(pts, opts(o))),
  curve: (pts: [number, number][], o?: Opt) => paths(gen.curve(pts, opts(o))),
  path: (d: string, o?: Opt) => paths(gen.path(d, opts(o))),
};

// The hand: a sleeve, a fist round a marker, the marker's tip at (x, y).
export const Hand: React.FC<{ x: number; y: number; color?: string; opacity?: number }> = ({ x, y, color = ink.black, opacity = 1 }) => (
  <svg width={1} height={1} style={{ position: "absolute", left: x, top: y, overflow: "visible", opacity, pointerEvents: "none" }}>
    <g transform="rotate(48)">
      <path d="M0 0 L20 -8 L20 8 Z" fill={color} />
      <rect x={20} y={-12} width={120} height={24} rx={5} fill="#2b2c30" stroke={ink.black} strokeWidth={2.5} />
      <rect x={34} y={-12} width={18} height={24} fill={color} />
      <path d="M78 -30 Q76 -40 96 -40 L150 -38 Q182 -36 184 -6 L186 30 Q184 44 160 44 L96 42 Q72 40 74 26 Z" fill="#f3ccaa" stroke={ink.black} strokeWidth={3} />
      <path d="M92 -40 Q86 -54 104 -56 L136 -50 Q146 -44 140 -36" fill="#f3ccaa" stroke={ink.black} strokeWidth={3} />
      <path d="M100 -6 L150 -6 M100 12 L150 12 M100 28 L148 28" stroke="rgba(31,32,35,0.35)" strokeWidth={2.5} />
      <rect x={176} y={-52} width={260} height={104} rx={14} fill="#3b6fd8" stroke={ink.black} strokeWidth={3} />
      <path d="M176 -40 L176 40" stroke="#fff" strokeWidth={4} opacity={0.5} />
    </g>
  </svg>
);

// A set of strokes that draws itself as `progress` goes 0 → 1, in order, each
// stroke taking time in proportion to its length. Shows the hand at the pen
// tip while drawing.
export const Sketch: React.FC<{ strokes: Stroke[]; progress: number; hand?: boolean; opacity?: number; dx?: number; dy?: number }> = ({ strokes, progress, hand: showHand = true, opacity = 1, dx = 0, dy = 0 }) => {
  const lens = useMemo(() => strokes.map((s) => Math.max(1, getLength(s.d))), [strokes]);
  const total = lens.reduce((a, b) => a + b, 0);
  let drawn = Math.max(0, Math.min(1, progress)) * total;
  let tip: { x: number; y: number } | null = null;
  const els = strokes.map((s, i) => {
    const take = Math.min(lens[i], drawn);
    drawn -= take;
    if (take <= 0) return null;
    if (take < lens[i] && !tip) tip = getPointAtLength(s.d, take);
    return <path key={i} d={s.d} fill="none" stroke={s.stroke} strokeWidth={s.strokeWidth} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={lens[i]} strokeDashoffset={lens[i] - take} />;
  });
  const t = tip as { x: number; y: number } | null;
  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", left: dx, top: dy, overflow: "visible", opacity }}>
        {els}
      </svg>
      {showHand && t && progress > 0 && progress < 1 && <Hand x={t.x + dx} y={t.y + dy} color={strokes[0]?.stroke} />}
    </>
  );
};

// Handwritten text that writes itself, character by character, with the hand
// following along. `align` center: x is the centre.
export const Write: React.FC<{
  text: string;
  x: number;
  y: number;
  size?: number;
  color?: string;
  progress: number;
  align?: "left" | "center";
  hand?: boolean;
  font?: string;
  spacing?: number;
  weight?: number;
}> = ({ text, x, y, size = 48, color = ink.black, progress, align = "left", hand: showHand = true, font = hand.font, spacing = 0.04, weight = 400 }) => {
  const chars = [...text];
  const n = chars.length;
  const shown = Math.max(0, Math.min(n, progress * n));
  const cw = size * (1 + spacing);
  const x0 = align === "center" ? x - (n * cw) / 2 : x;
  const k = Math.floor(shown);
  return (
    <>
      <div style={{ position: "absolute", left: x0, top: y, fontFamily: font, fontSize: size, fontWeight: weight, color, whiteSpace: "nowrap", letterSpacing: size * spacing, lineHeight: 1.2 }}>
        {chars.map((c, i) => (
          <span key={i} style={{ opacity: i < k ? 1 : i === k ? shown - k : 0 }}>
            {c}
          </span>
        ))}
      </div>
      {showHand && progress > 0 && progress < 1 && <Hand x={x0 + shown * cw} y={y + size * 0.95} color={color} />}
    </>
  );
};

// A felt eraser scrubbing back and forth across a box as `progress` goes 0 → 1.
export const Eraser: React.FC<{ x: number; y: number; w: number; h: number; progress: number }> = ({ x, y, w, h, progress }) => {
  if (progress <= 0 || progress >= 1) return null;
  const rows = 3;
  const p = progress * rows;
  const r = Math.min(rows - 1, Math.floor(p));
  const f = p - r;
  const ex = x + (r % 2 ? 1 - f : f) * w;
  const ey = y + (r + 0.5) * (h / rows);
  return (
    <div style={{ position: "absolute", left: ex - 70, top: ey - 34, width: 140, height: 68, transform: "rotate(-8deg)" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 10, background: "#3a3d44", border: `3px solid ${ink.black}` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 20, borderRadius: "0 0 10px 10px", background: "#d9d3c4", borderTop: `3px solid ${ink.black}` }} />
    </div>
  );
};
