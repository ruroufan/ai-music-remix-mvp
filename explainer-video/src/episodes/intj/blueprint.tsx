import React from "react";
import { fonts, palette } from "../../channels/backlit/look";

// 《INTJ · 正确》's image: the architect's blueprint — complete, every room
// ticked ✓ correct — and him alone inside a glass box of certainty, everyone
// else outside it. In the end he takes an eraser to one corner of the plan
// and leaves it blank; a door opens in the wall, and people walk in.

export const BP = "110, 200, 255"; // blueprint line
export const PAPER = "#0c1d33";
export const GOLD = "255, 199, 122";
export const RED = "255, 77, 109";

// the plan, in sheet units (0–100 × 0–62)
const WALLS: [number, number, number, number][] = [
  [6, 6, 94, 6], [94, 6, 94, 56], [94, 56, 6, 56], [6, 56, 6, 6],
  [40, 6, 40, 34], [40, 34, 6, 34], [64, 6, 64, 56], [64, 30, 94, 30], [40, 44, 64, 44], [22, 34, 22, 56],
];
const ROOMS = [
  { x: 23, y: 20, t: "研究" }, { x: 52, y: 22, t: "决策" }, { x: 79, y: 18, t: "执行" }, { x: 14, y: 45, t: "预案" },
  { x: 43, y: 50, t: "推演" }, { x: 79, y: 43, t: "" },
];
export const BLANK = { x: 64, y: 30, w: 30, h: 26 }; // the corner he leaves empty

// The sheet at (x, y), `w` wide. `draw` 0 → 1 strokes the walls on; `checks`
// 0 → 1 stamps ✓ on the rooms; `blank` 0 → 1 erases the bottom-right room to
// a glowing empty space; `door` 0 → 1 opens the outer wall there; `q` turns
// the ticks into question marks (being examined).
export const Blueprint: React.FC<{ x: number; y: number; w: number; frame: number; draw?: number; checks?: number; blank?: number; door?: number; q?: number; opacity?: number; label?: string }> = ({
  x,
  y,
  w,
  frame,
  draw = 1,
  checks = 0,
  blank = 0,
  door = 0,
  q = 0,
  opacity = 1,
  label = "A-01 · 总平面 · INTJ",
}) => {
  const u = w / 100;
  const h = 62 * u;
  const total = WALLS.reduce((a, [x1, y1, x2, y2]) => a + Math.hypot(x2 - x1, y2 - y1), 0);
  let acc = 0;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, opacity }}>
      <svg width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <pattern id={`bp-grid-${w}`} width={u * 2} height={u * 2} patternUnits="userSpaceOnUse">
            <path d={`M${u * 2} 0 L0 0 0 ${u * 2}`} fill="none" stroke={`rgba(${BP},0.09)`} strokeWidth={1} />
          </pattern>
        </defs>
        <rect width={w} height={h} rx={6} fill={PAPER} stroke={`rgba(${BP},0.5)`} strokeWidth={2} />
        <rect width={w} height={h} rx={6} fill={`url(#bp-grid-${w})`} />
        {/* dimension lines */}
        <g stroke={`rgba(${BP},${0.45 * Math.min(1, draw * 2)})`} strokeWidth={1}>
          <line x1={6 * u} y1={3 * u} x2={94 * u} y2={3 * u} />
          <line x1={6 * u} y1={2 * u} x2={6 * u} y2={4 * u} />
          <line x1={94 * u} y1={2 * u} x2={94 * u} y2={4 * u} />
          <line x1={97 * u} y1={6 * u} x2={97 * u} y2={56 * u} />
        </g>
        <text x={50 * u} y={2.2 * u} textAnchor="middle" fontSize={1.8 * u} fill={`rgba(${BP},0.7)`} fontFamily={fonts.mono} opacity={Math.min(1, draw * 2)}>
          24 000
        </text>
        {/* the blank: erased to empty paper, glowing */}
        {blank > 0 && (
          <g>
            <rect x={BLANK.x * u} y={BLANK.y * u} width={BLANK.w * u} height={BLANK.h * u} fill={`rgba(232,226,212,${0.9 * blank})`} />
            <rect x={BLANK.x * u} y={BLANK.y * u} width={BLANK.w * u} height={BLANK.h * u} fill="none" stroke={`rgba(${GOLD},${blank})`} strokeWidth={3} strokeDasharray="10 8" style={{ filter: `drop-shadow(0 0 ${12 * blank}px rgba(${GOLD},0.9))` }} />
          </g>
        )}
        {/* walls, stroked on in order */}
        {WALLS.map(([x1, y1, x2, y2], i) => {
          const L = Math.hypot(x2 - x1, y2 - y1);
          const start = acc / total;
          acc += L;
          const k = Math.max(0, Math.min(1, (draw - start) / (L / total)));
          if (k <= 0) return null;
          // the erased room loses its inner walls; the door opens in the outer wall
          const inBlank = (px: number, py: number) => px >= BLANK.x - 0.1 && py >= BLANK.y - 0.1;
          const erased = blank > 0.5 && inBlank(x1, y1) && inBlank(x2, y2) && !(x1 === 94 && x2 === 94) && !(y1 === 56 && y2 === 56);
          if (erased) return null;
          const ex = x1 + (x2 - x1) * k, ey = y1 + (y2 - y1) * k;
          if (door > 0 && y1 === 56 && y2 === 56) {
            // bottom wall, right to left: leave a gap at 72–86
            const gap0 = 86, gap1 = 86 - 14 * door;
            return (
              <g key={i} stroke={`rgb(${BP})`} strokeWidth={0.7 * u} strokeLinecap="square">
                <line x1={x1 * u} y1={y1 * u} x2={gap0 * u} y2={y1 * u} />
                <line x1={gap1 * u} y1={y1 * u} x2={ex * u} y2={ey * u} />
                <path d={`M${gap0 * u} ${y1 * u} A${(gap0 - gap1) * u} ${(gap0 - gap1) * u} 0 0 1 ${gap1 * u} ${(y1 - (gap0 - gap1)) * u}`} fill="none" stroke={`rgba(${GOLD},0.8)`} strokeWidth={1.5} strokeDasharray="4 4" />
              </g>
            );
          }
          return <line key={i} x1={x1 * u} y1={y1 * u} x2={ex * u} y2={ey * u} stroke={`rgb(${BP})`} strokeWidth={0.7 * u} strokeLinecap="square" style={{ filter: `drop-shadow(0 0 4px rgba(${BP},0.6))` }} />;
        })}
      </svg>
      {/* rooms: labels, ticks */}
      {ROOMS.map((r, i) => {
        const inBlank = r.x >= BLANK.x && r.y >= BLANK.y;
        if (inBlank && blank > 0.3) return null;
        const show = Math.max(0, Math.min(1, (draw - 0.5 - i * 0.06) * 4));
        const tick = Math.max(0, Math.min(1, checks * ROOMS.length - i));
        return (
          <div key={i} style={{ position: "absolute", left: r.x * u - 60, top: r.y * u - 30, width: 120, textAlign: "center", opacity: show }}>
            <div style={{ fontSize: 2.3 * u, fontWeight: 800, color: `rgba(${BP},0.9)` }}>{r.t}</div>
            {tick > 0 && (
              <div style={{ fontSize: 3.4 * u, fontWeight: 900, lineHeight: 1, color: q > 0.5 ? `rgb(${GOLD})` : "#7fe0a0", transform: `scale(${1.6 - 0.6 * tick})`, opacity: tick }}>
                {q > 0.5 ? "？" : "✓"}
              </div>
            )}
          </div>
        );
      })}
      {blank > 0.4 && (
        <div style={{ position: "absolute", left: (BLANK.x + BLANK.w / 2) * u - 100, top: (BLANK.y + BLANK.h / 2) * u - 40, width: 200, textAlign: "center", fontSize: 4.4 * u, fontWeight: 900, color: `rgba(150,96,20,${blank})` }}>
          留白
        </div>
      )}
      {/* title block */}
      <div style={{ position: "absolute", right: 0, bottom: -3.4 * u, fontFamily: fonts.mono, fontSize: 1.7 * u, letterSpacing: 2, color: `rgba(${BP},0.75)`, opacity: Math.min(1, draw * 2) }}>{label}</div>
      {void frame}
    </div>
  );
};

// A glass box round (x, bottom): edges, a faint sheen, and words etched in it.
export const GlassBox: React.FC<{ x: number; bottom: number; w?: number; h?: number; k?: number; text?: string; crack?: number }> = ({ x, bottom, w = 300, h = 420, k = 1, text = "我早就想清楚了", crack = 0 }) => {
  if (k <= 0.01) return null;
  const d = 40; // depth offset
  return (
    <div style={{ position: "absolute", inset: 0, opacity: k }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <rect x={x - w / 2} y={bottom - h} width={w} height={h} fill="rgba(170,215,255,0.06)" stroke="rgba(200,230,255,0.65)" strokeWidth={2} />
        <path d={`M${x - w / 2} ${bottom - h} l${d} ${-d} h${w} v${h} l${-d} ${d}`} fill="none" stroke="rgba(200,230,255,0.35)" strokeWidth={1.5} />
        <line x1={x + w / 2} y1={bottom - h} x2={x + w / 2 + d} y2={bottom - h - d} stroke="rgba(200,230,255,0.35)" strokeWidth={1.5} />
        <path d={`M${x - w / 2 + 20} ${bottom - h + 30} L${x - w / 2 + 70} ${bottom - h + 30} L${x - w / 2 + 20} ${bottom - h + 120} Z`} fill="rgba(255,255,255,0.08)" />
        {crack > 0 &&
          [0, 1, 2, 3].map((i) => (
            <path key={i} d={`M${x} ${bottom - h / 2} l${Math.cos(i * 1.7) * 160 * crack} ${Math.sin(i * 1.7) * 160 * crack} l${Math.cos(i * 1.7 + 0.5) * 60 * crack} ${Math.sin(i * 1.7 + 0.5) * 60 * crack}`} stroke="rgba(255,255,255,0.7)" strokeWidth={1.5} fill="none" />
          ))}
      </svg>
      <div style={{ position: "absolute", left: x - w / 2, width: w, top: bottom - h - 2 - 34, textAlign: "center", fontSize: 24, fontWeight: 800, letterSpacing: 4, color: "rgba(200,230,255,0.55)" }}>{text}</div>
      <div style={{ position: "absolute", left: x - w / 2, width: w, top: bottom + 8, textAlign: "center", fontFamily: fonts.mono, fontSize: 16, letterSpacing: 4, color: palette.dim }}>CERTAINTY</div>
    </div>
  );
};
