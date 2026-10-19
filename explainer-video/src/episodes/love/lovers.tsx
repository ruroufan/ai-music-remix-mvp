import React from "react";
import { palette } from "../../channels/backlit/look";
import { Stander } from "../doubt/circles";

// 《恋爱脑》's image: two people, one leaning her whole weight on the other,
// both of them swaying; slowly she straightens up, they stand side by side,
// steady — and the shadow on the floor goes from one blob to two.

export const FLOOR = 700;
export const HER = "255, 176, 104"; // warm
export const HIM = "63, 224, 207"; // cool

// One figure that can lean (deg, around its feet) and fade out (ghost).
export const Leaner: React.FC<{ x: number; floor?: number; h?: number; lean?: number; lift?: number; glow?: number; ghost?: number; rgb?: string }> = ({ x, floor = FLOOR, h = 300, lean = 0, lift = 1, glow = 0.8, ghost = 0, rgb = HER }) => (
  <div style={{ position: "absolute", inset: 0, transformOrigin: `${x}px ${floor}px`, transform: `rotate(${lean}deg)`, opacity: 1 - ghost * 0.75 }}>
    <div style={{ position: "absolute", inset: 0, filter: ghost > 0.05 ? `blur(${ghost * 2}px)` : undefined }}>
      <Stander x={x} bottom={floor} height={h} lift={lift} glow={glow * (1 - ghost * 0.6)} rgb={rgb} />
    </div>
    {ghost > 0.05 && (
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <rect x={x - h * 0.17} y={floor - h * 0.98} width={h * 0.34} height={h * 0.98} rx={h * 0.1} fill="none" stroke={`rgba(232,238,242,${0.5 * ghost})`} strokeWidth={2} strokeDasharray="8 7" />
      </svg>
    )}
  </div>
);

// The pair. `lean` 0 → 1: how much of her weight is on him; `sway` how much
// they rock; `gap` pushes them apart when she stands on her own.
export const Couple: React.FC<{ cx: number; floor?: number; h?: number; frame: number; lean?: number; sway?: number; gap?: number; ghost?: number; herGlow?: number; split?: number; himX?: number }> = ({ cx, floor = FLOOR, h = 300, frame, lean = 1, sway = 1, gap = 0, ghost = 0, herGlow = 0.8, split = 0, himX }) => {
  const rock = Math.sin(frame / 9) * 4 * sway + Math.sin(frame / 4.3) * 1.2 * sway;
  const bx = himX ?? cx + 60 + gap * 90;
  const ax = cx - 95 - gap * 90;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <FloorLight x={cx} floor={floor} />
      <Shadows ax={ax} bx={bx} floor={floor} split={split} />
      <Leaner x={bx} floor={floor} h={h * 1.06} lean={-6 * lean + rock * 0.8} lift={1.1 - 0.3 * lean} glow={0.7} rgb={HIM} />
      <Leaner x={ax} floor={floor} h={h} lean={16 * lean + rock} lift={1 - 0.6 * lean} glow={herGlow} ghost={ghost} />
    </div>
  );
};

// A warm pool of light on the floor (so the shadows have somewhere to fall).
export const FloorLight: React.FC<{ x: number; floor?: number; w?: number; k?: number }> = ({ x, floor = FLOOR, w = 520, k = 1 }) => (
  <div style={{ position: "absolute", left: x - w, top: floor - w * 0.12, width: w * 2, height: w * 0.5, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(${palette.halo},${0.32 * k}), rgba(${palette.halo},${0.1 * k}) 55%, transparent 72%)` }} />
);

// Their shadows, cast toward us: one blob when `split` is 0, two apart at 1.
export const Shadows: React.FC<{ ax: number; bx: number; floor?: number; split: number }> = ({ ax, bx, floor = FLOOR, split }) => {
  const mid = (ax + bx) / 2;
  const s = Math.max(0, Math.min(1, split));
  const pinch = Math.sin(s * Math.PI) * 0.4;
  const w1 = 110 * (1 - s) + 70 * s;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <radialGradient id="lv-sh">
          <stop offset="0" stopColor="rgba(0,0,0,0.85)" />
          <stop offset="1" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>
      {s < 0.05 ? (
        <ellipse cx={mid} cy={floor + 26} rx={170} ry={34} fill="url(#lv-sh)" />
      ) : (
        <>
          <ellipse cx={mid + (ax - mid) * s} cy={floor + 26} rx={w1 * (1 - pinch)} ry={30} fill="url(#lv-sh)" />
          <ellipse cx={mid + (bx - mid) * s} cy={floor + 26} rx={w1 * (1 - pinch)} ry={30} fill="url(#lv-sh)" />
        </>
      )}
    </svg>
  );
};
