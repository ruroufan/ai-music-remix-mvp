import React from "react";
import { random } from "remotion";
import { Halo } from "../../channels/backlit/parts";
import { Stander } from "../doubt/circles";
import { Seated } from "../friction/tangle";

// 《ISTJ · 有用》's image: a man with a long list in his hands. Every item he
// strikes off makes him a little more see-through. At the end he puts the
// list down and sits under a huge old tree — and in its shade his colour
// slowly comes back.

export const INK = "232, 238, 242";
export const PAPER = "#efe8d8";
export const LEAF = "130, 196, 140";
export const WARM = "255, 200, 140";
export const PALE = "150, 160, 172";
export const GROUND = 880;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const TODO = ["回复邮件", "交周报", "缴水电费", "买牙膏", "改方案", "对账", "健身 30 分钟", "预约体检", "整理文件", "23:00 前睡觉"];

// a long paper list; `done` items (can be fractional) are struck through and ticked
export const Checklist: React.FC<{ x: number; y: number; w?: number; items?: string[]; done: number; size?: number; rot?: number; opacity?: number; labels?: (i: number) => string | undefined }> = ({ x, y, w = 360, items = TODO, done, size = 1, rot = 0, opacity = 1, labels }) => {
  const row = 52 * size;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, padding: `${20 * size}px ${24 * size}px`, background: PAPER, color: "#262019", boxShadow: "0 18px 40px rgba(0,0,0,0.55)", transform: `rotate(${rot}deg)`, transformOrigin: "50% 0", opacity, borderRadius: 4 }}>
      {items.map((it, i) => {
        const k = clamp01(done - i);
        return (
          <div key={it + i} style={{ position: "relative", height: row, display: "flex", alignItems: "center", fontSize: 28 * size, fontWeight: 700, color: k > 0.5 ? "rgba(38,32,25,0.45)" : "#262019" }}>
            <span style={{ display: "inline-block", width: 34 * size, height: 34 * size, border: `${2.5 * size}px solid #262019`, borderRadius: 4, marginRight: 14 * size, textAlign: "center", lineHeight: `${30 * size}px`, color: "#2e7d4f", fontWeight: 900, fontSize: 30 * size }}>{k > 0.5 ? "✓" : ""}</span>
            {it}
            {labels?.(i) && <span style={{ marginLeft: "auto", fontSize: 20 * size, color: "rgba(38,32,25,0.6)" }}>{labels(i)}</span>}
            <div style={{ position: "absolute", left: 48 * size, top: row / 2, height: 3 * size, width: `${(w - 90) * k}px`, background: "#262019" }} />
          </div>
        );
      })}
    </div>
  );
};

// a person who fades: `fade` 0 → 1 goes from solid to a faint dashed outline;
// `color` 0 → 1 warms them back up
export const Fading: React.FC<{ x: number; bottom?: number; height?: number; fade: number; color?: number; lift?: number }> = ({ x, bottom = GROUND, height = 340, fade, color = 0, lift = 0 }) => {
  const f = clamp01(fade);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.88 * f }}>
        <Stander x={x} bottom={bottom} height={height} lift={lift} glow={0.3 + 0.6 * color} rgb={color > 0.5 ? WARM : PALE} />
      </div>
      {f > 0.3 && (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: (f - 0.3) / 0.7 }}>
          <circle cx={x + 2 * (height / 260)} cy={bottom - 204 * (height / 260)} r={28 * (height / 260)} fill="none" stroke={`rgba(${PALE},0.6)`} strokeWidth={2} strokeDasharray="6 6" />
          <rect x={x - 42 * (height / 260)} y={bottom - 172 * (height / 260)} width={84 * (height / 260)} height={172 * (height / 260)} rx={14} fill="none" stroke={`rgba(${PALE},0.5)`} strokeWidth={2} strokeDasharray="6 6" />
        </svg>
      )}
    </div>
  );
};

// the old tree: gnarled, twisted, crown spread wide; `size` scales it, `shade`
// lays its shadow on the ground
export const OldTree: React.FC<{ x: number; y?: number; size?: number; shade?: number; frame?: number; glow?: number; opacity?: number }> = ({ x, y = GROUND, size = 1, shade = 0, frame = 0, glow = 0.4, opacity = 1 }) => {
  const s = size;
  const sway = Math.sin(frame / 40) * 2;
  const blobs = Array.from({ length: 11 }, (_, i) => ({ dx: (random(`ob${i}`) - 0.5) * 2, dy: (random(`oy${i}`) - 0.6) * 0.9, r: 0.35 + 0.3 * random(`or${i}`) }));
  const cx = x + sway, cy = y - 420 * s, W = 420 * s;
  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {shade > 0 && <div style={{ position: "absolute", left: x - 700 * s, top: y - 30 * s, width: 1400 * s, height: 80 * s, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(0,0,0,${0.55 * shade}), transparent 70%)` }} />}
      <Halo x={cx} y={cy} r={W * 1.4} intensity={glow} rgb={LEAF} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d={`M${x - 70 * s} ${y} C${x - 40 * s} ${y - 120 * s} ${x - 90 * s} ${y - 200 * s} ${x - 30 * s} ${y - 300 * s} C${x - 60 * s} ${y - 340 * s} ${x - 20 * s} ${y - 380 * s} ${cx} ${cy} C${x + 20 * s} ${y - 380 * s} ${x + 70 * s} ${y - 330 * s} ${x + 30 * s} ${y - 300 * s} C${x + 90 * s} ${y - 210 * s} ${x + 40 * s} ${y - 110 * s} ${x + 80 * s} ${y} Z`} fill="#3a2c20" stroke="rgba(214,170,120,0.5)" strokeWidth={2} />
        {[[-1, 0.62], [1, 0.7], [-1, 0.82], [1, 0.86], [-1, 0.95]].map(([d, h], k) => (
          <path key={k} d={`M${x + d * 10 * s} ${y - 420 * s * h} Q${x + d * 140 * s} ${y - 420 * s * h - 50 * s} ${x + d * (220 + 40 * k) * s} ${y - 420 * s * h - (30 + 20 * k) * s}`} fill="none" stroke="#3a2c20" strokeWidth={(16 - k * 2) * s} strokeLinecap="round" />
        ))}
        {blobs.map((b, k) => <circle key={k} cx={cx + b.dx * W * 0.9} cy={cy + b.dy * W * 0.6} r={W * b.r} fill={`rgba(${LEAF},${0.55 + 0.04 * (k % 4)})`} stroke="rgba(214,240,200,0.25)" strokeWidth={2} />)}
      </svg>
    </div>
  );
};

// him, sitting on the ground against something, as a seated silhouette
export const Rest: React.FC<{ x: number; floor?: number; color: number; fade?: number }> = ({ x, floor = GROUND, color, fade = 0 }) => (
  <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.85 * fade }}>
    <Seated x={x} floor={floor} scale={1.7} glow={0.2 + 0.8 * color} />
  </div>
);

// a little ox, side-on, for the herd in the shade
export const Ox: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 1 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: o, overflow: "visible" }}>
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="#1a1612" stroke="rgba(214,170,120,0.45)" strokeWidth={1.2}>
      <rect x={-22} y={-20} width={40} height={18} rx={7} />
      <rect x={14} y={-26} width={14} height={12} rx={4} />
      <path d="M18 -26 l-4 -6 M26 -26 l4 -6" fill="none" />
      {[-18, -8, 6, 14].map((lx) => <rect key={lx} x={lx} y={-4} width={4} height={10} />)}
    </g>
  </svg>
);
