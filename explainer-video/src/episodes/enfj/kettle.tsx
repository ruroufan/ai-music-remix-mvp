import React from "react";
import { random } from "remotion";
import { Halo } from "../../channels/backlit/parts";
import { Stander } from "../doubt/circles";

// 《ENFJ · 付出》's image: a long table, a row of people behind it, a cup in
// front of each. He goes down the row with a kettle of hot water and fills
// every cup to the brim; the cup in his own hand stays empty. At the end he
// pours one for himself.

export const WARM = "255, 186, 120"; // tea, warmth
export const STEAM = "232, 238, 242";
export const COOL = "160, 186, 220";
export const TABLE = 740; // the table top
export const FLOOR = 900; // where everyone stands, behind the table
export const SEATS = [300, 520, 740, 960, 1180, 1400];

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// a cup: `fill` 0 → 1; steam curls up when it's full enough
export const Cup: React.FC<{ x: number; y: number; size?: number; fill?: number; frame?: number; glow?: number; label?: string; labelColor?: string }> = ({ x, y, size = 1, fill = 0, frame = 0, glow = 1, label, labelColor }) => {
  const s = size;
  const w = 56 * s, h = 64 * s;
  const f = clamp01(fill);
  const steam = clamp01((f - 0.6) / 0.4);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {f > 0.5 && <Halo x={x} y={y - h / 2} r={90 * s} intensity={0.45 * glow * f} rgb={WARM} />}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <clipPath id={`cup-${Math.round(x)}-${Math.round(y)}`}>
            <path d={`M${x - w / 2} ${y - h} L${x + w / 2} ${y - h} L${x + w * 0.4} ${y} L${x - w * 0.4} ${y} Z`} />
          </clipPath>
        </defs>
        <rect x={x - w / 2} y={y - h * f} width={w} height={h * f} fill={`rgba(${WARM},0.9)`} clipPath={`url(#cup-${Math.round(x)}-${Math.round(y)})`} />
        <path d={`M${x - w / 2} ${y - h} L${x + w / 2} ${y - h} L${x + w * 0.4} ${y} L${x - w * 0.4} ${y} Z`} fill="none" stroke={`rgba(${STEAM},0.75)`} strokeWidth={2.5} />
        <path d={`M${x + w * 0.46} ${y - h * 0.75} q${18 * s} ${4 * s} ${10 * s} ${h * 0.4} l${-8 * s} ${2 * s}`} fill="none" stroke={`rgba(${STEAM},0.75)`} strokeWidth={2.5} />
        {steam > 0 &&
          [0, 1, 2].map((i) => {
            const p = ((frame / 40 + i / 3) % 1);
            const sx = x - 12 * s + i * 12 * s;
            return <path key={i} d={`M${sx} ${y - h - 6} q${8 * s} ${-14 * s} 0 ${-28 * s} q${-8 * s} ${-14 * s} 0 ${-28 * s}`} fill="none" stroke={`rgba(${STEAM},${0.5 * steam * Math.sin(p * Math.PI)})`} strokeWidth={2} transform={`translate(0 ${-p * 20 * s})`} />;
          })}
      </svg>
      {label && <div style={{ position: "absolute", left: x - 80, width: 160, top: y + 10, textAlign: "center", fontSize: 22, fontWeight: 800, color: labelColor ?? `rgba(${STEAM},0.7)` }}>{label}</div>}
    </div>
  );
};

// the kettle; `tilt` in degrees (0 upright, ~50 pouring); the stream falls to
// `pourTo` y when it's tipped far enough
export const Kettle: React.FC<{ x: number; y: number; size?: number; tilt?: number; pourTo?: number; frame?: number }> = ({ x, y, size = 1, tilt = 0, pourTo, frame = 0 }) => {
  const s = size;
  const a = (tilt * Math.PI) / 180;
  // spout tip in kettle space (0,0 = handle grip), rotated
  const tip = { x: 74 * s, y: 10 * s };
  const tx = x + tip.x * Math.cos(a) - tip.y * Math.sin(a), ty = y + tip.x * Math.sin(a) + tip.y * Math.cos(a);
  const pouring = tilt > 28 && pourTo !== undefined;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {pouring && <path d={`M${tx} ${ty} Q${tx + 10 * s} ${(ty + pourTo!) / 2} ${tx + 6 * s} ${pourTo}`} fill="none" stroke={`rgba(${WARM},0.9)`} strokeWidth={5 * s} strokeDasharray={`${12 * s} ${3 * s}`} strokeDashoffset={-frame * 4} />}
        <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
          <path d={`M${-10 * s} ${-30 * s} Q${-34 * s} ${-30 * s} ${-34 * s} ${-4 * s} Q${-34 * s} ${20 * s} ${-12 * s} ${24 * s}`} fill="none" stroke="#b9a58a" strokeWidth={6 * s} />
          <path d={`M${-12 * s} ${-26 * s} L${46 * s} ${-26 * s} Q${58 * s} ${20 * s} ${44 * s} ${44 * s} L${-8 * s} ${44 * s} Q${-22 * s} ${20 * s} ${-12 * s} ${-26 * s} Z`} fill="#2b2620" stroke="#c9b08a" strokeWidth={2.5} />
          <path d={`M${44 * s} ${10 * s} L${76 * s} ${4 * s} L${74 * s} ${14 * s} L${46 * s} ${24 * s} Z`} fill="#2b2620" stroke="#c9b08a" strokeWidth={2} />
          <ellipse cx={17 * s} cy={-30 * s} rx={20 * s} ry={6 * s} fill="#3a332a" stroke="#c9b08a" strokeWidth={2} />
          <circle cx={17 * s} cy={-38 * s} r={5 * s} fill="#c9b08a" />
        </g>
      </svg>
    </div>
  );
};

// him: standing, kettle in his right hand, his own cup in his left
export const Giver: React.FC<{ x: number; bottom?: number; height?: number; tilt?: number; pourTo?: number; frame?: number; cup?: number; glow?: number; kettle?: boolean }> = ({ x, bottom = FLOOR, height = 330, tilt = 0, pourTo, frame = 0, cup = 0, glow = 0.8, kettle = true }) => {
  const s = height / 260;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Stander x={x} bottom={bottom} height={height} lift={1} glow={glow} rgb={WARM} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <line x1={x + 18 * s} y1={bottom - 190 * s} x2={x + 62 * s} y2={bottom - 222 * s} stroke="#030405" strokeWidth={13 * s} strokeLinecap="round" />
        <line x1={x - 18 * s} y1={bottom - 190 * s} x2={x - 52 * s} y2={bottom - 160 * s} stroke="#030405" strokeWidth={13 * s} strokeLinecap="round" />
      </svg>
      {kettle && <Kettle x={x + 66 * s} y={bottom - 232 * s} size={0.7 * s} tilt={tilt} pourTo={pourTo} frame={frame} />}
      <Cup x={x - 58 * s} y={bottom - 150 * s} size={0.5 * s} fill={cup} frame={frame} />
    </div>
  );
};

// the row of people behind the table, each with their cup in front
export const Row: React.FC<{ fills: (i: number) => number; frame: number; glow?: (i: number) => number; skip?: number[]; heights?: number }> = ({ fills, frame, glow = () => 0.5, skip = [], heights = 340 }) => (
  <div style={{ position: "absolute", inset: 0 }}>
    {SEATS.map((x, i) => (skip.includes(i) ? null : <Stander key={i} x={x} bottom={FLOOR} height={heights - (i % 2) * 14} lift={1} glow={glow(i)} rgb={fills(i) > 0.5 ? WARM : COOL} />))}
    <div style={{ position: "absolute", left: 140, top: TABLE, width: 1640, height: FLOOR - TABLE + 10, background: "linear-gradient(#2a221b, #15110d)", borderTop: `3px solid rgba(${WARM},0.45)` }} />
    {SEATS.map((x, i) => (skip.includes(i) ? null : <Cup key={`c${i}`} x={x} y={TABLE} size={0.8} fill={fills(i)} frame={frame} />))}
  </div>
);

// steam drifting up everywhere (warm air)
export const WarmAir: React.FC<{ frame: number; k: number }> = ({ frame, k }) =>
  k <= 0 ? null : (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 30 }, (_, i) => {
        const p = ((frame / 120 + random(`a${i}`)) % 1);
        return <circle key={i} cx={random(`ax${i}`) * 1920 + Math.sin(p * 6 + i) * 20} cy={900 - p * 700} r={2 + 3 * random(`ar${i}`)} fill={`rgba(${WARM},${0.35 * k * Math.sin(p * Math.PI)})`} />;
      })}
    </svg>
  );
