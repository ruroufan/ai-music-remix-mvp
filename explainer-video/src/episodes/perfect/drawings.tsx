import React from "react";
import { ink } from "../../channels/whiteboard/look";
import { rr, type Stroke } from "../../channels/whiteboard/sketch";

// 《完美主义》's drawings, all hand-drawn (roughjs) and built once.

export const PAPER = { x: 560, y: 170, w: 600, h: 560 };

// A sheet of paper on the board: white, a soft shadow, a rough outline.
export const PAPER_EDGE = rr.rect(PAPER.x, PAPER.y, PAPER.w, PAPER.h, { seed: 3, rough: 0.8, width: 3 });
export const Paper: React.FC<{ x?: number; y?: number; w?: number; h?: number; opacity?: number; tilt?: number }> = ({ x = PAPER.x, y = PAPER.y, w = PAPER.w, h = PAPER.h, opacity = 1, tilt = 0 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, background: "#ffffff", boxShadow: "6px 8px 0 rgba(31,32,35,0.08)", opacity, transform: `rotate(${tilt}deg)` }} />
);

// The first stroke he keeps trying (and erasing): attempt k is a slightly different curve.
export const firstStroke = (k: number): Stroke[] =>
  rr.curve(
    [
      [PAPER.x + 120, PAPER.y + 300 + (k % 3) * 20],
      [PAPER.x + 230, PAPER.y + 230 - (k % 2) * 30],
      [PAPER.x + 340, PAPER.y + 320],
      [PAPER.x + 470, PAPER.y + 250 + (k % 2) * 25],
    ],
    { seed: 40 + k, rough: 0.6, width: 6, single: true },
  );

// The stroke that finally stays: wobbly, imperfect.
export const WOBBLY = rr.curve(
  [
    [PAPER.x + 80, PAPER.y + 330],
    [PAPER.x + 140, PAPER.y + 285],
    [PAPER.x + 195, PAPER.y + 350],
    [PAPER.x + 250, PAPER.y + 268],
    [PAPER.x + 300, PAPER.y + 332],
    [PAPER.x + 365, PAPER.y + 250],
    [PAPER.x + 410, PAPER.y + 345],
    [PAPER.x + 470, PAPER.y + 285],
    [PAPER.x + 530, PAPER.y + 305],
  ],
  { seed: 77, rough: 2.4, bow: 4, width: 7 },
);

// A stick figure standing at (x, y = feet), h tall.
export const stick = (x: number, y: number, h: number, seed: number, color = ink.black, arms: "down" | "up" | "run" = "down"): Stroke[] => {
  const head = h * 0.22;
  const neck = y - h + head;
  const hip = y - h * 0.38;
  const o = { seed, rough: 1, width: 4, color };
  const armL: [number, number] = arms === "up" ? [x - h * 0.28, neck - h * 0.1] : arms === "run" ? [x - h * 0.25, neck + h * 0.25] : [x - h * 0.2, neck + h * 0.32];
  const armR: [number, number] = arms === "up" ? [x + h * 0.28, neck - h * 0.1] : arms === "run" ? [x + h * 0.28, neck + h * 0.05] : [x + h * 0.2, neck + h * 0.32];
  return [
    ...rr.circle(x, y - h + head / 2, head, o),
    ...rr.line(x, neck, x, hip, o),
    ...rr.line(x, neck + h * 0.1, ...armL, o),
    ...rr.line(x, neck + h * 0.1, ...armR, o),
    ...rr.line(x, hip, arms === "run" ? x - h * 0.2 : x - h * 0.14, y, o),
    ...rr.line(x, hip, arms === "run" ? x + h * 0.24 : x + h * 0.14, y, o),
  ];
};

// A cat, drawn at quality q (0 = a toddler's scrawl → 1 = rather good): the
// lines get steadier, the proportions settle, the details arrive.
export const cat = (cx: number, cy: number, s: number, q: number, seed: number): Stroke[] => {
  const r = 3.2 - 2.7 * q;
  const j = (1 - q) * 0.35;
  const o = (k: number, color = ink.black, width = 3) => ({ seed: seed * 10 + k, rough: r, width, color });
  const hw = s * (0.5 + j * 0.4), hh = s * (0.42 - j * 0.1);
  const out: Stroke[] = [
    ...rr.ellipse(cx, cy, hw * 2, hh * 2, o(1)),
    ...rr.poly([[cx - hw * 0.8, cy - hh * 0.5], [cx - hw * (0.6 + j), cy - hh * (1.5 + j)], [cx - hw * 0.25, cy - hh * 0.9]], o(2)),
    ...rr.poly([[cx + hw * 0.8, cy - hh * 0.5], [cx + hw * (0.6 - j * 0.5), cy - hh * 1.5], [cx + hw * 0.25, cy - hh * 0.9]], o(3)),
    ...rr.circle(cx - hw * 0.35, cy - hh * (0.1 + j * 0.3), s * 0.1, o(4)),
    ...rr.circle(cx + hw * 0.35, cy - hh * 0.1, s * (0.1 + j * 0.06), o(5)),
  ];
  if (q > 0.3) out.push(...rr.poly([[cx - s * 0.05, cy + hh * 0.2], [cx, cy + hh * 0.3], [cx + s * 0.05, cy + hh * 0.2]], o(6, ink.red)));
  if (q > 0.45) out.push(...rr.curve([[cx - s * 0.12, cy + hh * 0.42], [cx, cy + hh * 0.52], [cx + s * 0.12, cy + hh * 0.42]], o(7)));
  if (q > 0.6)
    for (const d of [-1, 1]) {
      out.push(...rr.line(cx + d * hw * 0.3, cy + hh * 0.3, cx + d * hw * 1.15, cy + hh * 0.15, o(8 + d, ink.black, 2)));
      out.push(...rr.line(cx + d * hw * 0.3, cy + hh * 0.42, cx + d * hw * 1.15, cy + hh * 0.5, o(10 + d, ink.black, 2)));
    }
  if (q > 0.8) {
    out.push(...rr.circle(cx - hw * 0.35, cy - hh * 0.1, s * 0.04, { ...o(12), width: 4, fill: ink.black, gap: 2 }));
    out.push(...rr.circle(cx + hw * 0.35, cy - hh * 0.1, s * 0.04, { ...o(13), width: 4, fill: ink.black, gap: 2 }));
  }
  return out;
};

// A wall of cats, rows × cols, improving from first to last.
export const WALL = { x: 1210, y: 170, cols: 5, rows: 4, cell: 120 };
export const WALL_CATS = Array.from({ length: WALL.cols * WALL.rows }, (_, i) => {
  const c = i % WALL.cols, r = Math.floor(i / WALL.cols);
  return cat(WALL.x + c * WALL.cell + WALL.cell / 2, WALL.y + r * WALL.cell * 1.05 + WALL.cell / 2 + 6, WALL.cell * 0.72, i / (WALL.cols * WALL.rows - 1), 100 + i);
});

// A crown (for 完美), a check, a cross, an arrow.
export const crown = (x: number, y: number, s: number, seed = 5) => rr.poly([[x - s, y], [x - s, y - s * 0.8], [x - s * 0.45, y - s * 0.35], [x, y - s], [x + s * 0.45, y - s * 0.35], [x + s, y - s * 0.8], [x + s, y], [x - s, y]], { seed, color: ink.orange, width: 5, rough: 1 });
export const check = (x: number, y: number, s: number, seed = 6, color = ink.green) => rr.poly([[x - s * 0.5, y], [x - s * 0.1, y + s * 0.4], [x + s * 0.6, y - s * 0.5]], { seed, color, width: 7, rough: 1 });
export const cross = (x: number, y: number, s: number, seed = 7, color = ink.red) => [...rr.line(x - s / 2, y - s / 2, x + s / 2, y + s / 2, { seed, color, width: 7 }), ...rr.line(x + s / 2, y - s / 2, x - s / 2, y + s / 2, { seed: seed + 1, color, width: 7 })];
export const arrow = (x1: number, y1: number, x2: number, y2: number, seed = 8, color = ink.black) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = 26;
  return [
    ...rr.line(x1, y1, x2, y2, { seed, color, width: 5 }),
    ...rr.poly([[x2 - h * Math.cos(a - 0.45), y2 - h * Math.sin(a - 0.45)], [x2, y2], [x2 - h * Math.cos(a + 0.45), y2 - h * Math.sin(a + 0.45)]], { seed: seed + 1, color, width: 5 }),
  ];
};
// A loose hand-drawn circle around a box (for "this one").
export const ring = (x: number, y: number, w: number, h: number, seed = 9, color = ink.red) => rr.ellipse(x, y, w, h, { seed, color, width: 5, rough: 1.6 });
