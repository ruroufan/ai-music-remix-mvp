import React from "react";
import { random } from "remotion";
import { Halo } from "../../channels/backlit/parts";
import { Stander } from "../doubt/circles";

// 《INFP · 理想》's image: he holds a glass dome, and under it a flower that
// glows; all round him the street is grey. At the end he lifts the glass off
// — the wind catches the flower, it sways hard — and it opens wider.

export const BLOOM = "255, 170, 200"; // the petals
export const GLOW = "255, 214, 150"; // the light it gives off
export const GREY = "150, 156, 166";
export const FLOOR = 860;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// the flower: `open` 0 → 1 (→ more) is the bloom's size; `sway` tilts the
// stem (degrees); `fade` 0 → 1 drains it to a dotted outline (a dream)
export const Flower: React.FC<{ x: number; y: number; size?: number; open?: number; sway?: number; glow?: number; fade?: number; dust?: number }> = ({ x, y, size = 1, open = 1, sway = 0, glow = 1, fade = 0, dust = 0 }) => {
  const s = size;
  const petals = 7;
  const r = 34 * (0.6 + 0.4 * open) * s;
  const stem = 150 * s;
  const head = { x: x + Math.sin((sway * Math.PI) / 180) * stem, y: y - Math.cos((sway * Math.PI) / 180) * stem };
  const alpha = 1 - 0.85 * fade;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Halo x={head.x} y={head.y} r={(150 + 120 * open) * s} intensity={glow * alpha} rgb={GLOW} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g opacity={alpha} strokeDasharray={fade > 0.5 ? "6 6" : undefined}>
          <path d={`M${x} ${y} Q${x + (head.x - x) * 0.2} ${y - stem * 0.5} ${head.x} ${head.y}`} fill="none" stroke="#7fbf8a" strokeWidth={5 * s} />
          <path d={`M${x + (head.x - x) * 0.15} ${y - stem * 0.35} q${24 * s} ${-26 * s} ${48 * s} ${-14 * s} q${-22 * s} ${18 * s} ${-48 * s} ${14 * s}`} fill="#7fbf8a" />
          <path d={`M${x + (head.x - x) * 0.1} ${y - stem * 0.22} q${-24 * s} ${-22 * s} ${-46 * s} ${-8 * s} q${22 * s} ${16 * s} ${46 * s} ${8 * s}`} fill="#6fae7a" />
          {Array.from({ length: petals }, (_, i) => {
            const a = (i / petals) * 2 * Math.PI + sway * 0.02;
            return <ellipse key={i} cx={head.x + Math.cos(a) * r * 0.9} cy={head.y + Math.sin(a) * r * 0.9} rx={r * 0.75} ry={r * 0.42} transform={`rotate(${(a * 180) / Math.PI} ${head.x + Math.cos(a) * r * 0.9} ${head.y + Math.sin(a) * r * 0.9})`} fill={fade > 0.5 ? "none" : `rgba(${BLOOM},0.92)`} stroke={`rgba(${GLOW},0.9)`} strokeWidth={1.5} />;
          })}
          <circle cx={head.x} cy={head.y} r={r * 0.45} fill={fade > 0.5 ? "none" : `rgb(${GLOW})`} stroke={`rgb(${GLOW})`} strokeWidth={1.5} />
        </g>
        {dust > 0 &&
          Array.from({ length: 30 }, (_, i) => {
            if (random(`d${i}`) > dust) return null;
            return <circle key={i} cx={head.x + (random(`dx${i}`) - 0.5) * 200 * s} cy={head.y + (random(`dy${i}`) - 0.3) * 220 * s} r={3 + random(`dr${i}`) * 5} fill={`rgba(${GREY},0.7)`} />;
          })}
      </svg>
    </div>
  );
};

// the glass dome over it, on a little wooden base; `lift` 0 → 1 raises it off
export const Cloche: React.FC<{ x: number; y: number; size?: number; lift?: number; thick?: number; smudge?: number; opacity?: number }> = ({ x, y, size = 1, lift = 0, thick = 0, smudge = 0, opacity = 1 }) => {
  const s = size;
  const w = 130 * s, h = 230 * s;
  const up = lift * 320 * s;
  const tilt = lift * 14;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible", opacity }}>
      <rect x={x - w - 14 * s} y={y} width={2 * w + 28 * s} height={18 * s} rx={6 * s} fill="#3a2b20" stroke="#6b5240" strokeWidth={2} />
      <g transform={`translate(0 ${-up}) rotate(${tilt} ${x} ${y})`} opacity={1 - 0.6 * clamp01(lift - 0.6) / 0.4}>
        <path d={`M${x - w} ${y} L${x - w} ${y - h + w} A${w} ${w} 0 0 1 ${x + w} ${y - h + w} L${x + w} ${y} Z`} fill="rgba(200,225,240,0.08)" stroke={`rgba(220,236,248,${0.55 + 0.35 * thick})`} strokeWidth={3 + 6 * thick} />
        {thick > 0 && <path d={`M${x - w - 10 * s} ${y} L${x - w - 10 * s} ${y - h + w} A${w + 10 * s} ${w + 10 * s} 0 0 1 ${x + w + 10 * s} ${y - h + w} L${x + w + 10 * s} ${y} Z`} fill="none" stroke={`rgba(220,236,248,${0.5 * thick})`} strokeWidth={3} />}
        <path d={`M${x - w * 0.6} ${y - h * 0.3} Q${x - w * 0.7} ${y - h * 0.75} ${x - w * 0.25} ${y - h * 0.92}`} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={5 * s} strokeLinecap="round" />
        <circle cx={x} cy={y - h - 8 * s} r={12 * s} fill="rgba(220,236,248,0.6)" />
        {smudge > 0 &&
          Array.from({ length: 22 }, (_, i) => {
            if (random(`s${i}`) > smudge) return null;
            return <ellipse key={i} cx={x + (random(`sx${i}`) - 0.5) * 1.8 * w} cy={y - random(`sy${i}`) * h * 0.95} rx={6 + random(`sr${i}`) * 14} ry={4 + random(`sq${i}`) * 8} fill={`rgba(${GREY},0.55)`} />;
          })}
      </g>
    </svg>
  );
};

// the flower under its dome, as one piece
export const Kept: React.FC<{ x: number; y: number; size?: number; lift?: number; open?: number; sway?: number; glow?: number; fade?: number; thick?: number; smudge?: number; dust?: number }> = ({ x, y, size = 1, lift = 0, thick = 0, smudge = 0, ...f }) => (
  <div style={{ position: "absolute", inset: 0 }}>
    <Flower x={x} y={y} size={size} {...f} />
    <Cloche x={x} y={y} size={size} lift={lift} thick={thick} smudge={smudge} />
  </div>
);

// him, holding it in both hands at his chest
export const Holder: React.FC<{ x: number; bottom?: number; height?: number; glow?: number; lift?: number; open?: number; sway?: number; fade?: number; thick?: number; smudge?: number; dust?: number }> = ({ x, bottom = FLOOR, height = 300, glow = 0.7, ...k }) => {
  const s = height / 260;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Stander x={x} bottom={bottom} height={height} lift={0} glow={glow} rgb={GLOW} />
      <Kept x={x + 70 * s} y={bottom - 120 * s} size={0.42 * s} {...k} />
    </div>
  );
};

// the grey street: buildings in silhouette, grey grit drifting; `warm` 0 → 1
// lights its windows at the end
export const GreyStreet: React.FC<{ frame: number; warm?: number; opacity?: number; floor?: number }> = ({ frame, warm = 0, opacity = 1, floor = FLOOR }) => {
  const B = [[0, 260, 420], [250, 200, 300], [440, 240, 520], [670, 180, 360], [1240, 220, 480], [1450, 200, 340], [1640, 280, 460]];
  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {B.map(([bx, bw, bh], i) => (
          <g key={i}>
            <rect x={bx} y={floor - bh} width={bw} height={bh} fill="#15171b" stroke={`rgba(${GREY},0.3)`} strokeWidth={1.5} />
            {Array.from({ length: Math.floor(bh / 70) * Math.floor(bw / 60) }, (_, j) => {
              const cols = Math.floor(bw / 60);
              const wx = bx + 20 + (j % cols) * 60, wy = floor - bh + 30 + Math.floor(j / cols) * 70;
              const on = warm > 0 && random(`win${i}-${j}`) < warm;
              return <rect key={j} x={wx} y={wy} width={26} height={34} fill={on ? `rgba(${GLOW},${0.5 + 0.4 * random(`wl${i}-${j}`)})` : "#1d2026"} />;
            })}
          </g>
        ))}
        <rect x={0} y={floor} width={1920} height={1080 - floor} fill="#101114" />
        <line x1={0} y1={floor} x2={1920} y2={floor} stroke={`rgba(${warm > 0.3 ? GLOW : GREY},0.35)`} strokeWidth={2} />
        {Array.from({ length: 50 }, (_, i) => {
          const x = (random(`g${i}`) * 1920 + frame * (1 + random(`gv${i}`) * 2)) % 1920;
          const y = 120 + random(`gy${i}`) * 760;
          return <circle key={i} cx={x} cy={y} r={1.5 + random(`gr${i}`) * 2} fill={`rgba(${GREY},${0.25 * (1 - warm)})`} />;
        })}
      </svg>
    </div>
  );
};

// wind: streaks across the frame; `k` is how hard it blows
export const Wind: React.FC<{ frame: number; k: number }> = ({ frame, k }) =>
  k <= 0 ? null : (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 24 }, (_, i) => {
        const y = 200 + random(`w${i}`) * 650;
        const x = ((random(`wx${i}`) * 2400 + frame * (30 + 20 * random(`wv${i}`))) % 2400) - 300;
        return <path key={i} d={`M${x} ${y} q120 ${-10} 240 0`} fill="none" stroke={`rgba(232,238,242,${0.35 * k})`} strokeWidth={2} strokeLinecap="round" />;
      })}
    </svg>
  );
