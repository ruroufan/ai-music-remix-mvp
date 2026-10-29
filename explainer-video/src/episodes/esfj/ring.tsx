import React from "react";
import { random } from "remotion";
import { Halo } from "../../channels/backlit/parts";
import { Stander } from "../doubt/circles";
import { Seated } from "../friction/tangle";

// 《ESFJ · 被喜欢》's image: a man standing in the middle of a ring of people,
// every one of them holding up a score card, the numbers never still. The
// camera pushes into his chest: there, a small figure sits quietly — it nods,
// and one by one the score cards fade.

export const WARM = "255, 190, 150";
export const CALM = "190, 220, 200";
export const GREY = "150, 156, 166";
export const RED = "255, 110, 110";
export const GREEN = "130, 210, 150";
export const CX = 960, FLOOR = 900;

// nine spectators round him on an arc
export const SEATS = Array.from({ length: 9 }, (_, i) => {
  const a = Math.PI + (i / 8) * Math.PI;
  return { x: CX + Math.cos(a) * 780, y: FLOOR - 60 + Math.sin(a) * 120 + 120, s: 0.85 + 0.15 * Math.abs(Math.cos(a)) };
});

// the score a spectator holds at a given frame: changes every few beats, seeded
export const scoreAt = (i: number, frame: number, every = 22) => {
  const k = Math.floor((frame + i * 7) / every);
  return Math.round(2 + 8 * random(`sc${i}-${k}`));
};

export const ScoreCard: React.FC<{ x: number; y: number; value: number | string; size?: number; opacity?: number }> = ({ x, y, value, size = 1, opacity = 1 }) => (
  <div style={{ position: "absolute", left: x - 34 * size, top: y - 30 * size, width: 68 * size, height: 56 * size, background: "#f2efe8", borderRadius: 6, border: "2px solid #333", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 32 * size, color: typeof value === "number" ? (value >= 8 ? "#2e8a4f" : value <= 4 ? "#c43a3a" : "#333") : "#333", opacity, boxShadow: "0 6px 14px rgba(0,0,0,0.5)" }}>{value}</div>
);

// the ring: each spectator, a stick up to their card; `fade(i)` dims one out
export const Crowd: React.FC<{ frame: number; fade?: (i: number) => number; every?: number; glow?: number }> = ({ frame, fade = () => 0, every = 22, glow = 0.35 }) => (
  <div style={{ position: "absolute", inset: 0 }}>
    {SEATS.map((p, i) => {
      const f = fade(i);
      const h = 240 * p.s;
      return (
        <div key={i} style={{ position: "absolute", inset: 0, opacity: 1 - 0.9 * f }}>
          <Stander x={p.x} bottom={p.y} height={h} lift={1} glow={glow} rgb={GREY} />
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <line x1={p.x + (p.x < CX ? 26 : -26)} y1={p.y - h * 0.62} x2={p.x + (p.x < CX ? 40 : -40)} y2={p.y - h - 40} stroke="#030405" strokeWidth={8} />
          </svg>
          <ScoreCard x={p.x + (p.x < CX ? 40 : -40)} y={p.y - h - 70} value={scoreAt(i, frame, every)} size={0.9 * p.s} />
        </div>
      );
    })}
  </div>
);

// the small figure that sits in his chest: the impartial spectator. `nod` is
// a head bob 0 → 1 → 0; `glow` lights it
export const Inner: React.FC<{ x: number; y: number; scale?: number; nod?: number; glow?: number; empty?: number }> = ({ x, y, scale = 1, nod = 0, glow = 0.6, empty = 0 }) => (
  <div style={{ position: "absolute", inset: 0 }}>
    <Halo x={x - 30 * scale} y={y - 140 * scale} r={180 * scale} intensity={glow * (1 - empty)} rgb={CALM} />
    <div style={{ position: "absolute", inset: 0, opacity: 1 - empty, transform: `translateY(${nod * 10 * scale}px)`, transformOrigin: `${x}px ${y}px` }}>
      <Seated x={x} floor={y} scale={scale} glow={glow} slump={-0.3 + 0.6 * nod} />
    </div>
    {empty > 0 && (
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: empty }}>
        <rect x={x - 120 * scale} y={y - 100 * scale} width={130 * scale} height={10} fill="none" stroke={`rgba(${GREY},0.6)`} strokeDasharray="6 6" />
        <rect x={x - 120 * scale} y={y - 210 * scale} width={10} height={110 * scale} fill="none" stroke={`rgba(${GREY},0.6)`} strokeDasharray="6 6" />
      </svg>
    )}
  </div>
);

// him, in the middle, with a window into his chest when `window` > 0
export const Centre: React.FC<{ height?: number; glow?: number; window?: number; nod?: number; empty?: number; rgb?: string }> = ({ height = 420, glow = 0.6, window = 0, nod = 0, empty = 0, rgb = WARM }) => {
  const s = height / 260;
  const wy = FLOOR - 110 * s;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Stander x={CX} bottom={FLOOR} height={height} lift={1} glow={glow} rgb={rgb} />
      {window > 0 && (
        <div style={{ position: "absolute", left: CX - 60 * s + 6, top: wy - 80 * s, width: 120 * s, height: 110 * s, borderRadius: 14 * s, overflow: "hidden", opacity: window, border: `2px solid rgba(${CALM},0.5)`, background: "rgba(20,30,28,0.9)" }}>
          <div style={{ position: "absolute", left: -(CX - 60 * s + 6), top: -(wy - 80 * s), width: 1920, height: 1080 }}>
            <Inner x={CX + 30 * s * 0.4} y={wy + 25 * s} scale={0.38 * s} nod={nod} empty={empty} />
          </div>
        </div>
      )}
    </div>
  );
};
