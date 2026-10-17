import React from "react";
import { random } from "remotion";
import { fonts, palette } from "../../channels/backlit/look";
import { Halo } from "../../channels/backlit/parts";

// 《自我怀疑》's image: people standing in pools of light on a dark floor. The
// pool is what you know; its rim is where you touch what you don't — and out
// there in the dark, question marks. A small pool has a short rim and few
// question marks: its owner stands chin-up. A big pool has a long rim and
// many: its owner looks down. At the end, he looks up and walks on out.

export const FLOOR_Y = 650;

// A pool of light seen at an angle: beam from above, the lit floor, a glowing
// rim, and question marks just outside it, more of them the bigger it is.
export const LightPool: React.FC<{
  cx: number;
  cy?: number;
  rx: number;
  frame: number;
  glow?: number;
  qs?: number; // 0 → 1: how visible the question marks are
  stars?: number; // 0 → 1: the question marks turn into small lights
  rgb?: string;
  beam?: boolean;
  seed?: string;
  density?: number; // question marks per length of rim (1 = one per 70px)
  starAt?: (x: number, y: number) => number; // per mark, overrides `stars`
}> = ({ cx, cy = FLOOR_Y, rx, frame, glow = 1, qs = 1, stars = 0, rgb = palette.halo, beam = true, seed = "p", density = 1, starAt }) => {
  const ry = rx * 0.26;
  const n = Math.max(3, Math.round(((2 * Math.PI * rx) / 70) * density));
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {beam && (
        <div style={{ position: "absolute", left: cx - rx, top: 0, width: rx * 2, height: cy, background: `linear-gradient(rgba(${rgb},0), rgba(${rgb},${0.07 * glow}) 70%, rgba(${rgb},${0.12 * glow}))`, clipPath: `polygon(${50 - 8}% 0, ${50 + 8}% 0, 100% 100%, 0 100%)` }} />
      )}
      <div style={{ position: "absolute", left: cx - rx * 1.15, top: cy - ry * 1.15, width: rx * 2.3, height: ry * 2.3, borderRadius: "50%", background: `radial-gradient(ellipse at center, rgba(${rgb},${0.5 * glow}) 0%, rgba(${rgb},${0.22 * glow}) 55%, rgba(${rgb},0) 72%)` }} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={`rgba(${rgb},${0.18 * glow})`} strokeWidth={14} />
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={`rgba(255,226,180,${0.75 * glow})`} strokeWidth={2.5} />
      </svg>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + random(`qa-${seed}-${i}`) * 0.2;
        const d = 1.1 + random(`qd-${seed}-${i}`) * 0.25;
        const x = cx + Math.cos(a) * rx * d;
        const y = cy + Math.sin(a) * ry * d - 14 - random(`qy-${seed}-${i}`) * 40 * (Math.sin(a) < 0 ? 1 : 0.3);
        const flick = 0.45 + 0.55 * Math.abs(Math.sin(frame / (11 + (i % 5)) + i));
        const size = 22 + random(`qs-${seed}-${i}`) * 16;
        const st = starAt ? starAt(x, y) : stars;
        return st > 0.5 ? (
          <div key={i} style={{ position: "absolute", left: x - 4, top: y - 4, width: 8, height: 8, borderRadius: 4, background: palette.accent, boxShadow: `0 0 12px ${palette.accent}`, opacity: qs * flick * Math.min(1, (st - 0.5) * 4), transform: `scale(${1 + 1.5 * Math.max(0, 1 - (st - 0.5) * 4)})` }} />
        ) : (
          <div key={i} style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)", fontFamily: fonts.mono, fontSize: size, fontWeight: 700, color: `rgba(232,238,242,${0.55 * qs * flick})`, opacity: 1 - st * 2 }}>?</div>
        );
      })}
    </div>
  );
};

// A person standing, facing us. `lift` 0 = head down (as Person's "hunch") →
// 1 = level ("plain") → 2 = chin up ("proud"); in between, the outline morphs.
const POSES = [
  { head: [70, 52], body: [28, 112, 30, 78, 70, 84, 100, 92, 96, 120, 92, 172, 92, 178, 84, 178, 36, 178, 28, 178, 30, 170] },
  { head: [60, 34], body: [22, 100, 22, 66, 60, 66, 98, 66, 98, 100, 98, 170, 98, 178, 90, 178, 30, 178, 22, 178, 22, 170] },
  { head: [64, 28], body: [20, 98, 22, 62, 60, 62, 100, 62, 100, 98, 98, 170, 98, 178, 90, 178, 30, 178, 22, 178, 22, 170] },
];
const poseAt = (lift: number) => {
  const k = Math.max(0, Math.min(2, lift));
  const i = Math.min(1, Math.floor(k));
  const f = k - i;
  const mix = (a: number[], b: number[]) => a.map((v, j) => v + (b[j] - v) * f);
  const p = mix(POSES[i].body, POSES[i + 1].body).map((v) => v.toFixed(1));
  return {
    head: mix(POSES[i].head, POSES[i + 1].head),
    body: `M${p[0]} ${p[1]} Q${p[2]} ${p[3]} ${p[4]} ${p[5]} Q${p[6]} ${p[7]} ${p[8]} ${p[9]} L${p[10]} ${p[11]} Q${p[12]} ${p[13]} ${p[14]} ${p[15]} L${p[16]} ${p[17]} Q${p[18]} ${p[19]} ${p[20]} ${p[21]} Z`,
  };
};

export const Stander: React.FC<{ x: number; bottom?: number; height?: number; lift?: number; glow?: number; rgb?: string; opacity?: number }> = ({
  x,
  bottom = FLOOR_Y,
  height = 260,
  lift = 0,
  glow = 0.8,
  rgb = palette.halo,
  opacity = 1,
}) => {
  const s = height / 260;
  const { head, body } = poseAt(lift);
  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      <Halo x={x} y={bottom - height * 0.62} r={height * 0.95} intensity={glow} rgb={rgb} />
      <svg width={160 * s} height={300 * s} viewBox="-20 -30 160 300" style={{ position: "absolute", left: x - 80 * s, top: bottom - 290 * s, overflow: "visible" }}>
        <g fill="#030405" stroke={`rgba(${rgb},${0.35 + 0.6 * glow})`} strokeWidth={1.8}>
          <rect x={38} y={150} width={16} height={110} rx={4} />
          <rect x={66} y={150} width={16} height={110} rx={4} />
          <path d={body} />
          <circle cx={head[0]} cy={head[1]} r={28} />
        </g>
      </svg>
    </div>
  );
};

// The knowledge circle, seen from above: the known (lit), its boundary (the
// part that touches the unknown), and the unknown all around.
export const KnowledgeCircle: React.FC<{ cx: number; cy: number; r: number; frame: number; label?: boolean }> = ({ cx, cy, r, frame, label = true }) => {
  const n = Math.max(6, Math.round((2 * Math.PI * r) / 46));
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: "50%", background: `radial-gradient(circle, rgba(${palette.halo},0.45), rgba(${palette.halo},0.18) 70%, rgba(${palette.halo},0.08))` }} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={`rgba(${palette.accentRgb},0.25)`} strokeWidth={14} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={palette.accent} strokeWidth={3} strokeDasharray="10 8" strokeDashoffset={-frame} />
      </svg>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        return (
          <div key={i} style={{ position: "absolute", left: cx + Math.cos(a) * (r + 30), top: cy + Math.sin(a) * (r + 30), transform: "translate(-50%, -50%)", fontFamily: fonts.mono, fontSize: 24, fontWeight: 700, color: "rgba(232,238,242,0.6)", opacity: 0.4 + 0.6 * Math.abs(Math.sin(frame / 9 + i)) }}>?</div>
        );
      })}
      {label && <div style={{ position: "absolute", left: cx - 100, width: 200, top: cy - 16, textAlign: "center", fontSize: 30, fontWeight: 800, color: "#1a1208" }}>已知</div>}
    </div>
  );
};
