import React from "react";
import { Halo } from "../../channels/backlit/parts";
import { Walker } from "../nostalgia/road";

// 《INFJ · 不被懂》's image: a street of rooms seen in cutaway, like a doll's
// house. He walks along it with a lamp, and every room he passes lights up —
// he can see right into everyone's. His own room, at the end, is the only one
// left dark: the door shut, the shutters nailed. At the end he opens his own
// door, and the lamp goes in for the first time.

export const LAMP = "255, 196, 110";
export const COOL = "150, 180, 220";
export const FLOOR = 820; // the rooms stand on this
export const STREET = 930; // he walks in front of them, on this
export const ROOMS = [
  { x: 90, w: 250, h: 300 },
  { x: 380, w: 250, h: 300 },
  { x: 670, w: 250, h: 300 },
  { x: 960, w: 250, h: 300 },
];
export const OWN = { x: 1300, w: 500, h: 420 };
export const roomCx = (i: number) => (i < 0 ? OWN.x + OWN.w / 2 : ROOMS[i].x + ROOMS[i].w / 2);

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// a little seated person at a table, inside a room
const Occupant: React.FC<{ cx: number; bottom: number; lit: number; mood?: "ok" | "sad" }> = ({ cx, bottom, lit, mood = "ok" }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: 0.25 + 0.75 * lit }}>
    <g fill="#030405" stroke={`rgba(${LAMP},${0.25 + 0.6 * lit})`} strokeWidth={1.5}>
      <rect x={cx + 10} y={bottom - 70} width={70} height={8} />
      <rect x={cx + 40} y={bottom - 62} width={6} height={62} />
      <path d={`M${cx - 40} ${bottom} L${cx - 38} ${bottom - 40} L${cx - 2} ${bottom - 40} L${cx} ${bottom} Z`} />
      <path d={`M${cx - 44} ${bottom - 40} Q${cx - 48} ${bottom - 100} ${cx - 22} ${bottom - 104} Q${cx + 2} ${bottom - 100} ${cx} ${bottom - 40} Z`} />
      <circle cx={cx - 20 + (mood === "sad" ? 4 : 0)} cy={bottom - 124 + (mood === "sad" ? 6 : 0)} r={17} />
    </g>
  </svg>
);

// A room. `lit` 0 → 1 is the lamp's light reaching it; `door` 0 → 1 swings
// its door open; `shut` 0 → 1 boards the window up.
export const Room: React.FC<{ x: number; w: number; h: number; bottom?: number; lit?: number; door?: number; shut?: number; who?: boolean; mood?: "ok" | "sad"; children?: React.ReactNode; opacity?: number }> = ({
  x, w, h, bottom = FLOOR, lit = 0, door = 0, shut = 0, who = true, mood, children, opacity = 1,
}) => {
  const top = bottom - h;
  const l = clamp01(lit);
  const dw = Math.min(90, w * 0.22), dh = Math.min(170, h * 0.56);
  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {l > 0 && <Halo x={x + w / 2} y={top + h * 0.55} r={w * 0.9} intensity={0.55 * l} rgb={LAMP} />}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <radialGradient id={`in-${x}`} cx="50%" cy="60%" r="70%">
            <stop offset="0%" stopColor={`rgba(${LAMP},${0.75 * l})`} />
            <stop offset="100%" stopColor={`rgba(${LAMP},${0.12 * l})`} />
          </radialGradient>
        </defs>
        {/* roof */}
        <path d={`M${x - 14} ${top} L${x + w / 2} ${top - h * 0.28} L${x + w + 14} ${top} Z`} fill="#0b0d11" stroke={`rgba(${COOL},0.35)`} strokeWidth={2} />
        {/* the room */}
        <rect x={x} y={top} width={w} height={h} fill="#06080b" stroke={`rgba(${l > 0.3 ? LAMP : COOL},${0.35 + 0.4 * l})`} strokeWidth={3} />
        <rect x={x} y={top} width={w} height={h} fill={`url(#in-${x})`} />
        {/* window */}
        <rect x={x + w - 26 - w * 0.26} y={top + 34} width={w * 0.26} height={h * 0.24} fill={l > 0 ? `rgba(${LAMP},${0.25 + 0.6 * l})` : "#0d1016"} stroke={`rgba(${COOL},0.4)`} strokeWidth={2} />
        {shut > 0 && (
          <g opacity={shut} stroke="#2a2f38" strokeWidth={9}>
            <line x1={x + w - 32 - w * 0.26} y1={top + 40} x2={x + w - 20} y2={top + 28 + h * 0.24} />
            <line x1={x + w - 32 - w * 0.26} y1={top + 28 + h * 0.24} x2={x + w - 20} y2={top + 40} />
          </g>
        )}
        {/* the doorway: light spills out of it when the door opens */}
        <rect x={x + 22} y={bottom - dh} width={dw} height={dh} fill={door > 0 ? `rgba(${LAMP},${0.2 + 0.7 * door})` : "#0a0c10"} />
      </svg>
      {who && <Occupant cx={x + w * 0.6} bottom={bottom - 6} lit={l} mood={mood} />}
      {children}
      {/* the door leaf, swinging open towards us */}
      <div style={{ position: "absolute", left: x + 22, top: bottom - dh, width: dw, height: dh, perspective: 600 }}>
        <div style={{ position: "absolute", inset: 0, background: "#1a1d24", border: `2px solid rgba(${COOL},0.45)`, transformOrigin: "0 50%", transform: `rotateY(${-80 * clamp01(door)}deg)` }}>
          <div style={{ position: "absolute", right: 10, top: dh * 0.52, width: 8, height: 8, borderRadius: 4, background: `rgba(${LAMP},0.7)` }} />
        </div>
      </div>
    </div>
  );
};

// the lamp: a little hurricane lantern; `k` is how bright it burns
export const Lantern: React.FC<{ x: number; y: number; k?: number; size?: number; sway?: number }> = ({ x, y, k = 1, size = 1, sway = 0 }) => (
  <div style={{ position: "absolute", inset: 0 }}>
    <Halo x={x} y={y + 40 * size} r={200 * size * (0.6 + 0.4 * k)} intensity={0.9 * k} rgb={LAMP} />
    <svg width={80 * size} height={110 * size} viewBox="0 0 80 110" style={{ position: "absolute", left: x - 40 * size, top: y, overflow: "visible", transform: `rotate(${sway}deg)`, transformOrigin: "50% 0" }}>
      <path d="M22 18 Q40 -6 58 18" fill="none" stroke="#c9b08a" strokeWidth={3} />
      <rect x={20} y={18} width={40} height={10} rx={3} fill="#2a2620" stroke="#c9b08a" strokeWidth={2} />
      <path d="M22 28 L58 28 L62 86 L18 86 Z" fill={`rgba(${LAMP},${0.25 + 0.55 * k})`} stroke="#c9b08a" strokeWidth={2} />
      <ellipse cx={40} cy={62} rx={7} ry={13} fill={`rgba(255,240,200,${0.4 + 0.6 * k})`} />
      <rect x={16} y={86} width={48} height={10} rx={3} fill="#2a2620" stroke="#c9b08a" strokeWidth={2} />
    </svg>
  </div>
);

// him, walking with the lamp held out in front
export const Carrier: React.FC<{ x: number; bottom?: number; height?: number; face?: "left" | "right"; walk?: number; lamp?: number; glow?: number }> = ({ x, bottom = STREET, height = 250, face = "right", walk = 0, lamp = 1, glow = 0.8 }) => {
  const s = height / 260;
  const d = face === "right" ? 1 : -1;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Walker x={x} bottom={bottom} height={height} face={face} walk={walk} glow={glow} rgb={LAMP} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <line x1={x + d * 4 * s} y1={bottom - 180 * s} x2={x + d * 48 * s} y2={bottom - 128 * s} stroke="#030405" strokeWidth={13 * s} strokeLinecap="round" />
      </svg>
      {lamp > 0 && <Lantern x={x + d * 50 * s} y={bottom - 132 * s} k={lamp} size={0.8 * s} sway={Math.sin(walk) * 6} />}
    </div>
  );
};

// a key, drawn flat
export const Key: React.FC<{ x: number; y: number; size?: number; glow?: number; rot?: number; opacity?: number }> = ({ x, y, size = 1, glow = 1, rot = 0, opacity = 1 }) => (
  <div style={{ position: "absolute", inset: 0, opacity }}>
    <Halo x={x} y={y} r={120 * size} intensity={0.6 * glow} rgb={LAMP} />
    <svg width={200 * size} height={80 * size} viewBox="0 0 200 80" style={{ position: "absolute", left: x - 100 * size, top: y - 40 * size, overflow: "visible", transform: `rotate(${rot}deg)` }}>
      <g fill="none" stroke={`rgb(${LAMP})`} strokeWidth={7}>
        <circle cx={34} cy={40} r={24} />
        <path d="M58 40 L186 40 M150 40 L150 64 M172 40 L172 58" />
      </g>
    </svg>
  </div>
);

// "a quiet, polite wall": bricks laid course by course; `k` 0 → 1 builds it
export const PoliteWall: React.FC<{ x: number; w: number; bottom: number; rows?: number; k: number }> = ({ x, w, bottom, rows = 7, k }) => {
  const bw = 90, bh = 44;
  const cols = Math.ceil(w / bw) + 1;
  const done = k * rows;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {Array.from({ length: rows }, (_, r) => {
        const p = clamp01(done - r);
        if (p <= 0) return null;
        return Array.from({ length: cols }, (_, c) => {
          const bx = x + c * bw - (r % 2 ? bw / 2 : 0);
          if (bx + bw <= x || bx >= x + w) return null;
          const left = Math.max(x, bx), right = Math.min(x + w, bx + bw - 4);
          const q = clamp01(p * cols - c);
          return <rect key={`${r}-${c}`} x={left} y={bottom - (r + 1) * bh - (1 - q) * 30} width={right - left} height={bh - 4} rx={3} fill="#1b1f27" stroke={`rgba(${COOL},0.35)`} strokeWidth={1.5} opacity={q} />;
        });
      })}
    </svg>
  );
};
