import React from "react";
import { random } from "remotion";
import { Halo } from "../../channels/backlit/parts";
import { Walker } from "../nostalgia/road";

// 《ISFP · 回避》's image: two people standing face to face. Between them a
// crack opens — up through the air and across the ground. One of them turns
// and quietly walks away, leaving a line of footprints. Then the tape rewinds:
// this time he stops, turns round, and steps across the crack.

export const ROSE = "240, 160, 180"; // him (ISFP)
export const SKY = "150, 190, 235"; // the person opposite
export const RIFT = "255, 120, 100"; // the crack
export const WARM = "255, 205, 150"; // meeting
export const FLOOR = 760;
export const A_X = 700; // where he stands
export const B_X = 1220; // where the other stands
export const MID = 960; // the crack
export const H = 340; // figure height

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// the ground: a floor line and a dark band below it
export const Ground: React.FC<{ x0?: number; x1?: number; opacity?: number }> = ({ x0 = 0, x1 = 1920, opacity = 1 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity }}>
    <defs>
      <linearGradient id="isfp-ground" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="rgba(232,238,242,0.08)" />
        <stop offset="1" stopColor="rgba(232,238,242,0)" />
      </linearGradient>
    </defs>
    <rect x={x0} y={FLOOR} width={x1 - x0} height={1080 - FLOOR} fill="url(#isfp-ground)" />
    <line x1={x0} y1={FLOOR} x2={x1} y2={FLOOR} stroke="rgba(232,238,242,0.3)" strokeWidth={2} />
  </svg>
);

// a jagged polyline from (x, y0) to (x, y1); `seed` keeps it the same each frame
const jag = (x: number, y0: number, y1: number, n: number, amp: number, seed: string) =>
  Array.from({ length: n + 1 }, (_, i) => {
    const y = y0 + ((y1 - y0) * i) / n;
    const dx = i === 0 || i === n ? 0 : (random(`${seed}${i}`) - 0.5) * 2 * amp;
    return [x + dx, y] as const;
  });

// The crack. `open` 0 → 1 runs it up from the floor into the air and down
// across the ground, widening; `heal` 0 → 1 turns it into a warm seam that
// fades out.
export const Rift: React.FC<{ x?: number; open: number; heal?: number; frame: number; top?: number }> = ({ x = MID, open, heal = 0, frame, top = 220 }) => {
  const o = clamp01(open);
  if (o <= 0) return null;
  const up = jag(x, FLOOR, FLOOR - (FLOOR - top) * o, 12, 18, "up");
  const down = jag(x, FLOOR, FLOOR + 300 * o, 6, 30, "dn");
  const w = (2 + 14 * o) * (1 - heal);
  const flicker = 0.8 + 0.2 * Math.sin(frame / 3);
  const col = heal > 0 ? WARM : RIFT;
  const line = (pts: (readonly [number, number])[]) => pts.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)}`).join(" ");
  const wedge = (pts: (readonly [number, number])[], ww: number) =>
    `${pts.map(([px, py], i) => `${i ? "L" : "M"}${(px - ww * (1 - i / pts.length)).toFixed(1)} ${py.toFixed(1)}`).join(" ")} ${pts
      .slice()
      .reverse()
      .map(([px, py], i) => `L${(px + ww * (i / pts.length)).toFixed(1)} ${py.toFixed(1)}`)
      .join(" ")} Z`;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - heal * clamp01((heal - 0.6) / 0.4) }}>
      <Halo x={x} y={FLOOR - 120} r={260 * o} intensity={(0.35 + 0.25 * heal) * flicker} rgb={col} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <path d={wedge(down, w * 2.2)} fill="#010203" stroke={`rgba(${col},0.7)`} strokeWidth={2} />
        <path d={line(up)} fill="none" stroke={`rgba(${col},${0.35 * flicker})`} strokeWidth={w + 10} strokeLinejoin="round" />
        <path d={line(up)} fill="none" stroke="#010203" strokeWidth={Math.max(1, w)} strokeLinejoin="round" />
        <path d={line(up)} fill="none" stroke={`rgba(${col},0.95)`} strokeWidth={heal > 0 ? 3 + 4 * heal : 2} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

// a line of footprints on the floor from x0 towards x1; `shown` 0 → 1 is how
// far along they've appeared (they appear behind a walker)
export const Footprints: React.FC<{ x0: number; x1: number; shown: number; rgb?: string; opacity?: number }> = ({ x0, x1, shown, rgb = ROSE, opacity = 1 }) => {
  const step = 44;
  const n = Math.floor(Math.abs(x1 - x0) / step);
  const dir = Math.sign(x1 - x0) || 1;
  const k = Math.floor(n * clamp01(shown));
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity }}>
      {Array.from({ length: k }, (_, i) => {
        const px = x0 + dir * (i + 0.5) * step;
        const py = FLOOR + 18 + (i % 2 ? 10 : 0);
        return <ellipse key={i} cx={px} cy={py} rx={14} ry={5} fill={`rgba(${rgb},${0.25 + 0.35 * ((i + 1) / Math.max(1, k))})`} />;
      })}
    </svg>
  );
};

// him: a walker in profile at `x`; `face` the way he looks; `walk` the stride
// phase (0 = standing)
export const Him: React.FC<{ x: number; face?: "left" | "right"; walk?: number; glow?: number; opacity?: number; height?: number; bottom?: number }> = ({ x, face = "right", walk = 0, glow = 0.6, opacity = 1, height = H, bottom = FLOOR }) => (
  <Walker x={x} bottom={bottom} height={height} face={face} walk={walk} glow={glow} rgb={ROSE} opacity={opacity} />
);

// the person opposite, facing him
export const Other: React.FC<{ x?: number; face?: "left" | "right"; glow?: number; opacity?: number; height?: number; bottom?: number }> = ({ x = B_X, face = "left", glow = 0.5, opacity = 1, height = H, bottom = FLOOR }) => (
  <Walker x={x} bottom={bottom} height={height} face={face} walk={0} glow={glow} rgb={SKY} opacity={opacity} />
);

// Walking away. Between `at` (he turns) and `at + len` (gone off the left
// edge) — returns his x, the way he faces, the stride phase and how far the
// footprints reach. `turnLen` frames of standing before he sets off.
export const leaving = (frame: number, at: number, len: number, from = A_X, to = -120, turnLen = 8) => {
  const t = clamp01((frame - at - turnLen) / (len - turnLen));
  const e = t * t * (3 - 2 * t) * 0.3 + t * 0.7;
  const x = from + (to - from) * e;
  const face: "left" | "right" = frame >= at ? "left" : "right";
  const walk = t > 0 && t < 1 ? (Math.abs(x - from) / 26) : 0;
  return { x, face, walk, prints: e };
};

// a soft bloom between two people: the meeting
export const Meeting: React.FC<{ x: number; y: number; k: number; frame: number }> = ({ x, y, k, frame }) =>
  k <= 0 ? null : (
    <div style={{ position: "absolute", inset: 0 }}>
      <Halo x={x} y={y} r={340 * k} intensity={0.9 * k} rgb={WARM} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 10 }, (_, i) => {
          const p = (frame / 50 + random(`m${i}`)) % 1;
          const a = random(`ma${i}`) * Math.PI * 2;
          return <circle key={i} cx={x + Math.cos(a) * 60 * p * 3} cy={y + Math.sin(a) * 40 * p * 3 - 40 * p} r={3 + 3 * (1 - p)} fill={`rgba(${WARM},${k * (1 - p)})`} />;
        })}
      </svg>
    </div>
  );
