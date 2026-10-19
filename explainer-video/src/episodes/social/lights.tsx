import React from "react";
import { random } from "remotion";
import { palette } from "../../channels/backlit/look";
import { Stander } from "../doubt/circles";

// 《社恐》's image: a person under a glaring stage light, a ring of blurred
// people around — pull back, and every one of those people has a light of
// their own over their head, and every one of them is looking down. In the
// end the lights go out and it's just ordinary daylight.

export const FLOOR = 720;
export const GLARE = "255, 246, 226";

// A stage light hanging from the top edge, aimed at (aimX, floor).
export const Lamp: React.FC<{ x: number; y?: number; aimX?: number; floor?: number; on?: number; size?: number; flicker?: number; frame?: number }> = ({ x, y = 70, aimX = x, floor = FLOOR, on = 1, size = 1, flicker = 0, frame = 0 }) => {
  const ang = (Math.atan2(aimX - x, floor - y) * 180) / Math.PI;
  const f = on * (1 - flicker * (random(`fl-${Math.floor(frame / 2)}-${x}`) > 0.55 ? 0.8 : 0));
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <line x1={x} y1={0} x2={x} y2={y - 10 * size} stroke="#2a3140" strokeWidth={3 * size} />
      <g transform={`translate(${x} ${y}) rotate(${-ang}) scale(${size})`}>
        <path d="M-16 -14 L16 -14 L22 18 L-22 18 Z" fill="#141922" stroke="#3a4352" strokeWidth={2} />
        <ellipse cx={0} cy={18} rx={22} ry={5} fill={`rgba(${GLARE},${0.2 + 0.8 * f})`} />
        {f > 0.05 && <ellipse cx={0} cy={20} rx={34} ry={10} fill={`rgba(${GLARE},${0.35 * f})`} style={{ filter: "blur(6px)" }} />}
      </g>
    </svg>
  );
};

// Its beam: from the lamp's lens down to a pool of light on the floor.
export const Cone: React.FC<{ x: number; y?: number; aimX?: number; floor?: number; spread?: number; on?: number; rgb?: string; id: string }> = ({ x, y = 70, aimX = x, floor = FLOOR, spread = 170, on = 1, rgb = GLARE, id }) => {
  if (on <= 0.01) return null;
  const top = 18;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={`rgba(${rgb},${0.55 * on})`} />
          <stop offset="1" stopColor={`rgba(${rgb},${0.12 * on})`} />
        </linearGradient>
        <radialGradient id={`${id}-pool`}>
          <stop offset="0" stopColor={`rgba(${rgb},${0.65 * on})`} />
          <stop offset="0.7" stopColor={`rgba(${rgb},${0.2 * on})`} />
          <stop offset="1" stopColor={`rgba(${rgb},0)`} />
        </radialGradient>
      </defs>
      <polygon points={`${x - top},${y + 16} ${x + top},${y + 16} ${aimX + spread},${floor} ${aimX - spread},${floor}`} fill={`url(#${id}-beam)`} />
      <ellipse cx={aimX} cy={floor} rx={spread * 1.25} ry={spread * 0.3} fill={`url(#${id}-pool)`} />
    </svg>
  );
};

// A ring of out-of-focus people around the middle: the ones he thinks are watching.
export const BLUR_RING = [
  { x: 330, b: 760, h: 300 },
  { x: 560, b: 690, h: 250 },
  { x: 1360, b: 690, h: 250 },
  { x: 1590, b: 760, h: 300 },
  { x: 180, b: 700, h: 240 },
  { x: 1740, b: 700, h: 240 },
  { x: 760, b: 640, h: 200 },
  { x: 1160, b: 640, h: 200 },
];
export const BlurCrowd: React.FC<{ opacity?: number; blur?: number; lift?: number }> = ({ opacity = 1, blur = 7, lift = 1 }) => (
  <div style={{ position: "absolute", inset: 0, opacity, filter: `blur(${blur}px)` }}>
    {BLUR_RING.map((p, i) => (
      <Stander key={i} x={p.x} bottom={p.b} height={p.h} lift={lift} glow={0.25} rgb={palette.accentRgb} />
    ))}
  </div>
);

// Ordinary daylight, washing in over the dark.
export const Daylight: React.FC<{ k: number }> = ({ k }) =>
  k <= 0 ? null : <div style={{ position: "absolute", inset: 0, opacity: k, background: "linear-gradient(#55687d, #7d8a93 55%, #8f8879)" }} />;

// The field of people, each under a light of their own, every one looking down.
export const FIELD = [
  { x: 210, b: 700, h: 210 },
  { x: 470, b: 790, h: 250 },
  { x: 720, b: 680, h: 200 },
  { x: 960, b: 800, h: 260 }, // him
  { x: 1200, b: 680, h: 200 },
  { x: 1450, b: 790, h: 250 },
  { x: 1710, b: 700, h: 210 },
  { x: 590, b: 560, h: 150 },
  { x: 1330, b: 560, h: 150 },
  { x: 960, b: 540, h: 140 },
];

// The whole field: everyone under a light of their own. Back rows first.
// `on(i)` / `lift(i)` per person; `aim(i)` shifts where a light lands; `hide`
// leaves a person out (so a scene can draw him itself).
export const Field: React.FC<{ frame: number; on?: (i: number) => number; lift?: (i: number) => number; aim?: (i: number) => number; flicker?: number; hide?: number }> = ({ frame, on = () => 1, lift = () => 0, aim = () => 0, flicker = 0, hide = -1 }) => (
  <>
    {FIELD.map((p, i) => ({ ...p, i }))
      .sort((a, z) => a.b - z.b)
      .map((p) => {
        const s = p.h / 260;
        const ly = p.b - p.h - 150 * s;
        const o = on(p.i);
        return (
          <React.Fragment key={p.i}>
            <Cone id={`fd-${p.i}`} x={p.x} y={ly} aimX={p.x + aim(p.i)} floor={p.b} spread={95 * s} on={o} />
            <Lamp x={p.x} y={ly} aimX={p.x + aim(p.i)} floor={p.b} on={o} size={0.75 * s} flicker={flicker} frame={frame} />
            {p.i !== hide && <Stander x={p.x} bottom={p.b} height={p.h} lift={lift(p.i)} glow={0.3 + 0.6 * o} rgb={o > 0.4 ? GLARE : palette.halo} />}
          </React.Fragment>
        );
      })}
  </>
);
