import React from "react";
import { random } from "remotion";
import { Halo } from "../../channels/backlit/parts";
import { Stander } from "../doubt/circles";

// 《ESTJ · 标准》's image: a man with a ruler, trimming a row of saplings into
// one identical shape. He puts the ruler down, and each sapling grows out its
// own way, branches going every which direction.

export const LEAF = "130, 200, 140";
export const GOLD = "255, 206, 110";
export const STEEL = "170, 186, 206";
export const RED = "255, 110, 110";
export const GROUND = 860;
export const SAPS = [380, 610, 840, 1070, 1300, 1530];

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// one sapling. `trim` 0 → 1 clips it into the standard box; `wild` 0 → 1
// grows it out its own way (seeded by `seed`); `scale` sizes it
export const Sapling: React.FC<{ x: number; y?: number; seed: number; trim?: number; wild?: number; scale?: number; hue?: number }> = ({ x, y = GROUND, seed, trim = 0, wild = 0, scale = 1, hue = 0 }) => {
  const s = scale;
  const tr = clamp01(trim), w = clamp01(wild);
  const lean = (random(`l${seed}`) - 0.5) * 30 * (1 - tr) + (random(`lw${seed}`) - 0.5) * 50 * w;
  const H = 150 * s;
  const top = { x: x + Math.sin((lean * Math.PI) / 180) * H, y: y - H };
  // natural blobs (its own shape) vs the box
  const n = 5 + Math.floor(random(`n${seed}`) * 3);
  const blobs = Array.from({ length: n }, (_, i) => {
    const a = random(`a${seed}-${i}`) * 6.28;
    const d = (20 + 40 * random(`d${seed}-${i}`)) * s;
    return { x: top.x + Math.cos(a) * d * (1 - tr), y: top.y - 20 * s + Math.sin(a) * d * 0.7 * (1 - tr), r: (26 + 16 * random(`r${seed}-${i}`)) * s * (1 - 0.3 * tr) };
  });
  const branches = Array.from({ length: 5 }, (_, i) => {
    const a = (random(`ba${seed}-${i}`) * 1.6 - 0.8) * Math.PI + (random(`bs${seed}`) > 0.5 ? 0.3 : -0.3) - Math.PI / 2;
    const L = (90 + 120 * random(`bl${seed}-${i}`)) * s * w;
    const sx = x + (top.x - x) * (0.4 + 0.12 * i), sy = y - H * (0.4 + 0.12 * i);
    return { sx, sy, ex: sx + Math.cos(a) * L, ey: sy + Math.sin(a) * L };
  });
  const leafRgb = hue > 0 ? [LEAF, "255, 180, 120", "180, 160, 255", "120, 210, 220", "255, 150, 190", "220, 220, 120"][seed % 6] : LEAF;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {w > 0 && <Halo x={top.x} y={top.y} r={160 * s * (0.5 + w)} intensity={0.4 * w} rgb={leafRgb} />}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d={`M${x - 6 * s} ${y} Q${x + (top.x - x) * 0.3} ${y - H * 0.5} ${top.x} ${top.y} L${top.x + 4} ${top.y} Q${x + (top.x - x) * 0.3 + 6} ${y - H * 0.5} ${x + 6 * s} ${y} Z`} fill="#4a3826" />
        {branches.map((b, i) => (w > 0.02 ? <path key={i} d={`M${b.sx} ${b.sy} Q${(b.sx + b.ex) / 2 + 10} ${(b.sy + b.ey) / 2 - 10} ${b.ex} ${b.ey}`} fill="none" stroke="#4a3826" strokeWidth={5 * s} strokeLinecap="round" /> : null))}
        {branches.map((b, i) => (w > 0.2 ? <circle key={`bl${i}`} cx={b.ex} cy={b.ey} r={(18 + 14 * random(`bb${seed}-${i}`)) * s * w} fill={`rgba(${leafRgb},0.8)`} /> : null))}
        {tr < 1 && blobs.map((b, i) => <circle key={i} cx={b.x} cy={b.y} r={b.r} fill={`rgba(${leafRgb},${0.75 * (1 - tr)})`} />)}
        {tr > 0 && <rect x={x - 60 * s} y={y - H - 80 * s} width={120 * s} height={110 * s} rx={8 * s} fill={`rgba(${LEAF},${0.85 * tr})`} stroke={`rgba(${STEEL},${0.6 * tr})`} strokeWidth={2} />}
      </svg>
    </div>
  );
};

// the ruler: yellow, with tick marks; `rot` degrees about its left end
export const Ruler: React.FC<{ x: number; y: number; len?: number; rot?: number; opacity?: number }> = ({ x, y, len = 300, rot = 0, opacity = 1 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible", opacity }}>
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={0} y={-16} width={len} height={32} rx={3} fill={`rgb(${GOLD})`} stroke="#6a5020" strokeWidth={2} />
      {Array.from({ length: Math.floor(len / 10) + 1 }, (_, i) => <line key={i} x1={i * 10} y1={-16} x2={i * 10} y2={i % 5 ? -8 : -2} stroke="#3a2a10" strokeWidth={1.5} />)}
    </g>
  </svg>
);

// him, holding the ruler out in his right hand
export const Measurer: React.FC<{ x: number; bottom?: number; height?: number; rot?: number; ruler?: boolean; glow?: number }> = ({ x, bottom = GROUND, height = 330, rot = -10, ruler = true, glow = 0.7 }) => {
  const s = height / 260;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Stander x={x} bottom={bottom} height={height} lift={1.5} glow={glow} rgb={STEEL} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <line x1={x + 18 * s} y1={bottom - 190 * s} x2={x + 64 * s} y2={bottom - 160 * s} stroke="#030405" strokeWidth={13 * s} strokeLinecap="round" />
      </svg>
      {ruler && <Ruler x={x + 60 * s} y={bottom - 160 * s} len={220 * s} rot={rot} />}
    </div>
  );
};

// leaf clippings falling from a cut
export const Clippings: React.FC<{ x: number; y: number; k: number; seed: number }> = ({ x, y, k, seed }) =>
  k <= 0 || k >= 1 ? null : (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 10 }, (_, i) => <ellipse key={i} cx={x + (random(`c${seed}-${i}`) - 0.5) * 140 + Math.sin(k * 6 + i) * 10} cy={y + k * 240 * (0.6 + 0.4 * random(`cy${seed}-${i}`))} rx={7} ry={4} fill={`rgba(${LEAF},${1 - k})`} />)}
    </svg>
  );
