import React from "react";
import { random } from "remotion";
import { Halo } from "../../channels/backlit/parts";
import { Seated } from "../friction/tangle";

// 《ISTP · 沉默》's image: a man at a workbench, taking a machine apart and
// putting it back together without a second thought. In his chest a small
// glowing part keeps blinking; he glances at it and pushes it aside. At the
// end he picks it up and hands it across to the person opposite.

export const STEEL = "170, 186, 206";
export const OIL = "214, 170, 110";
export const FEEL = "255, 150, 120"; // the glowing part
export const GREEN = "130, 210, 150";
export const RED = "255, 110, 110";
export const FLOOR = 900;
export const BENCH = 700; // bench top

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const Gear: React.FC<{ x: number; y: number; r: number; teeth?: number; rot?: number; color?: string; broken?: boolean }> = ({ x, y, r, teeth = 10, rot = 0, color = STEEL, broken = false }) => {
  const pts: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * 2 * Math.PI + (rot * Math.PI) / 180;
    const rr = i % 2 ? r : r * 1.2;
    if (broken && i >= 2 && i <= 4) continue;
    pts.push(`${x + Math.cos(a) * rr},${y + Math.sin(a) * rr}`);
  }
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <polygon points={pts.join(" ")} fill="#2a2e36" stroke={`rgb(${broken ? RED : color})`} strokeWidth={2} />
      <circle cx={x} cy={y} r={r * 0.3} fill="#14161a" stroke={`rgb(${color})`} strokeWidth={2} />
    </svg>
  );
};

// the machine: a box with gears inside; `open` 0 → 1 lifts the lid and pulls
// the parts out across the bench
export const Machine: React.FC<{ x: number; y?: number; open?: number; frame?: number; label?: string; brokenAt?: number }> = ({ x, y = BENCH, open = 0, frame = 0, label, brokenAt = -1 }) => {
  const o = clamp01(open);
  const parts = [
    { dx: -50, dy: -60, r: 34, t: 10, ox: -150, oy: -170 },
    { dx: 30, dy: -70, r: 24, t: 8, ox: 40, oy: -220 },
    { dx: 60, dy: -36, r: 18, t: 7, ox: 170, oy: -130 },
    { dx: -10, dy: -30, r: 14, t: 6, ox: -40, oy: -110 },
  ];
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <rect x={x - 110} y={y - 120} width={220} height={120} rx={8} fill="#1d2027" stroke={`rgba(${STEEL},0.7)`} strokeWidth={3} />
        <rect x={x - 116 + o * 40} y={y - 134 - o * 180} width={232} height={16} rx={4} fill="#2a2e36" stroke={`rgba(${STEEL},0.7)`} strokeWidth={2} transform={`rotate(${-o * 25} ${x} ${y - 134})`} />
      </svg>
      {parts.map((p, i) => (
        <Gear key={i} x={x + p.dx + p.ox * o} y={y + p.dy + p.oy * o} r={p.r} teeth={p.t} rot={frame * (i % 2 ? -3 : 3) * (1 - o)} broken={i === brokenAt} />
      ))}
      {label && <div style={{ position: "absolute", left: x - 110, width: 220, top: y + 12, textAlign: "center", fontSize: 24, fontWeight: 800, color: `rgba(${STEEL},0.8)` }}>{label}</div>}
    </div>
  );
};

// the glowing part — a small crystal-bulb — blinking
export const Feeling: React.FC<{ x: number; y: number; size?: number; frame?: number; k?: number; still?: boolean }> = ({ x, y, size = 1, frame = 0, k = 1, still = false }) => {
  const blink = still ? 1 : 0.55 + 0.45 * Math.abs(Math.sin(frame / 9));
  const s = size;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Halo x={x} y={y} r={70 * s * (0.6 + 0.4 * blink)} intensity={k * blink} rgb={FEEL} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d={`M${x} ${y - 22 * s} L${x + 14 * s} ${y} L${x} ${y + 22 * s} L${x - 14 * s} ${y} Z`} fill={`rgba(${FEEL},${0.5 + 0.5 * blink * k})`} stroke="rgba(255,230,210,0.9)" strokeWidth={2} />
        <rect x={x - 8 * s} y={y + 22 * s} width={16 * s} height={8 * s} fill="#6a6f78" />
      </svg>
    </div>
  );
};

// the bench, with a few tools lying on it
export const Bench: React.FC<{ x0?: number; x1?: number }> = ({ x0 = 500, x1 = 1600 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
    <rect x={x0} y={BENCH} width={x1 - x0} height={24} fill="#3a2c20" stroke={`rgba(${OIL},0.5)`} strokeWidth={2} />
    <rect x={x0 + 30} y={BENCH + 24} width={20} height={FLOOR - BENCH - 24} fill="#2a2018" />
    <rect x={x1 - 50} y={BENCH + 24} width={20} height={FLOOR - BENCH - 24} fill="#2a2018" />
    <path d={`M${x1 - 220} ${BENCH - 8} l90 0 l14 -10 l12 10 l-12 10 l-14 -10`} fill="none" stroke={`rgb(${STEEL})`} strokeWidth={6} />
    <rect x={x1 - 360} y={BENCH - 10} width={70} height={10} rx={3} fill="#b4503c" />
    <line x1={x1 - 290} y1={BENCH - 5} x2={x1 - 240} y2={BENCH - 5} stroke={`rgb(${STEEL})`} strokeWidth={4} />
  </svg>
);

// him, seated at the bench facing right, hands reaching to the bench; the
// glowing part sits in his chest (`chest` 0 hides it, e.g. when it's out)
export const Mechanic: React.FC<{ x: number; frame: number; chest?: number; reach?: number; glow?: number; still?: boolean }> = ({ x, frame, chest = 1, reach = 1, glow = 0.6, still }) => {
  const s = 1.6;
  const sx = x - 60 * s, sy = FLOOR - 190 * s;
  const hand = { x: x + 40 * s + 60 * reach + Math.sin(frame / 5) * 6 * reach, y: BENCH - 20 };
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Seated x={x} floor={FLOOR} scale={s} glow={glow} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <line x1={sx + 30} y1={sy + 40} x2={hand.x} y2={hand.y} stroke="#030405" strokeWidth={14} strokeLinecap="round" />
      </svg>
      {chest > 0 && <Feeling x={x - 74 * s} y={FLOOR - 130 * s} size={0.8} frame={frame} k={chest} still={still} />}
    </div>
  );
};

// sparks/smoke from an overload
export const Sparks: React.FC<{ x: number; y: number; k: number; frame: number }> = ({ x, y, k, frame }) =>
  k <= 0 ? null : (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 16 }, (_, i) => {
        const p = ((frame / 12 + random(`s${i}`)) % 1);
        const a = random(`a${i}`) * Math.PI - Math.PI;
        return <line key={i} x1={x + Math.cos(a) * 20 * p} y1={y + Math.sin(a) * 20 * p} x2={x + Math.cos(a) * 90 * p} y2={y + Math.sin(a) * 90 * p + 60 * p * p} stroke={`rgba(255,${200 - 80 * p},120,${k * (1 - p)})`} strokeWidth={3} />;
      })}
      {Array.from({ length: 6 }, (_, i) => {
        const p = ((frame / 60 + i / 6) % 1);
        return <circle key={`m${i}`} cx={x + Math.sin(p * 6 + i) * 30} cy={y - p * 260} r={20 + 40 * p} fill={`rgba(90,90,96,${0.4 * k * (1 - p)})`} />;
      })}
    </svg>
  );
