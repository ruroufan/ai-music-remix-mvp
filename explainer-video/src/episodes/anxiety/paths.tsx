import React from "react";
import { random } from "remotion";
import { palette } from "../../channels/backlit/look";
import { FigureShape } from "../../channels/backlit/figure";
import { Halo } from "../../channels/backlit/parts";

// 《焦虑》's central image: countless glowing forking paths spreading out below
// a cliff, seen from above. Generated once, procedurally (seeded, so every
// render is identical); scenes reveal it, spin it, pick one path and let the
// others go dark.

type Seg = { d: string; depth: number; chosen: boolean; x: number; y: number; id: number };

const ROOTS = 9;
const DEPTH = 5;
// The path the person finally takes: root branch 4, then children 1,0,1,1,0.
const CHOICE = [4, 1, 0, 1, 1, 0];

const build = (): Seg[] => {
  const segs: Seg[] = [];
  let id = 0;
  const grow = (x: number, y: number, angle: number, len: number, depth: number, chosen: boolean, trail: number[]) => {
    if (depth > DEPTH) return;
    const bend = (random(`b-${trail.join("-")}`) - 0.5) * 0.5;
    const x2 = x + Math.cos(angle) * len;
    const y2 = y + Math.sin(angle) * len;
    const cx = x + Math.cos(angle + bend) * len * 0.55;
    const cy = y + Math.sin(angle + bend) * len * 0.55;
    segs.push({ d: `M${x.toFixed(1)} ${y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`, depth, chosen, x: x2, y: y2, id: id++ });
    const kids = random(`k-${trail.join("-")}`) > 0.75 ? 3 : 2;
    for (let k = 0; k < kids; k++) {
      const spread = 0.35 + random(`s-${trail.join("-")}-${k}`) * 0.35;
      const a = angle + (k - (kids - 1) / 2) * spread;
      grow(x2, y2, a, len * (0.72 + random(`l-${trail.join("-")}-${k}`) * 0.12), depth + 1, chosen && CHOICE[depth + 1] === k, [...trail, k]);
    }
  };
  for (let r = 0; r < ROOTS; r++) {
    const a = (r / ROOTS) * Math.PI * 2 + random(`r-${r}`) * 0.3;
    grow(Math.cos(a) * 30, Math.sin(a) * 30, a, 150 + random(`rl-${r}`) * 40, 0, r === CHOICE[0], [r]);
  }
  return segs;
};

const SEGS = build();
export const CHOSEN_END = (() => {
  const last = SEGS.filter((s) => s.chosen).sort((a, b) => b.depth - a.depth)[0];
  return { x: last.x, y: last.y };
})();
// The chosen route's first point, for placing the person on it.
export const CHOSEN_ROOT = (() => {
  const first = SEGS.find((s) => s.chosen && s.depth === 0)!;
  const m = first.d.match(/^M(-?[\d.]+) (-?[\d.]+)/)!;
  return { x: Number(m[1]), y: Number(m[2]), angle: Math.atan2(CHOSEN_END.y, CHOSEN_END.x) };
})();

export const PathField: React.FC<{
  cx: number;
  cy: number;
  scale?: number;
  rotate?: number; // degrees
  draw?: number; // 0 → 1: paths grow outward, depth by depth
  fade?: number; // 0 → 1: every path except the chosen one goes dark
  chosen?: number; // 0 → 1: the chosen path lights up brighter
  lost?: number; // 0 → 1: the unchosen paths flare red as they go (loss)
  pulse?: number; // brightness pulse, e.g. on the beat
  opacity?: number;
  tilt?: number; // degrees of rotateX, to see the field at an angle (side view)
}> = ({ cx, cy, scale = 1, rotate = 0, draw = 1, fade = 0, chosen = 0, lost = 0, pulse = 0, opacity = 1, tilt = 0 }) => (
  <div
    style={{
      position: "absolute",
      left: cx - 1000,
      top: cy - 1000,
      width: 2000,
      height: 2000,
      opacity,
      transform: `perspective(1400px) rotateX(${tilt}deg) rotate(${rotate}deg) scale(${scale})`,
    }}
  >
    <svg width={2000} height={2000} viewBox="-1000 -1000 2000 2000">
      {SEGS.map((s) => {
        const reveal = Math.max(0, Math.min(1, draw * (DEPTH + 1) - s.depth));
        if (reveal <= 0) return null;
        const isChosen = s.chosen;
        const dark = isChosen ? 0 : fade;
        const red = isChosen ? 0 : lost * (1 - fade * 0.5);
        const rgb = isChosen && chosen > 0 ? `${palette.halo}` : red > 0.05 ? "255,77,109" : palette.accentRgb;
        const alpha = (0.25 + 0.5 * (1 - s.depth / (DEPTH + 1)) + pulse * 0.2) * (1 - dark) + (isChosen ? chosen * 0.7 : 0);
        const width = (isChosen ? 2.6 + chosen * 3 : 2.2) * (1 - s.depth * 0.12);
        // glow = the same stroke again, wide and faint (much cheaper than a blur filter)
        const dash = { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - reveal };
        return (
          <g key={s.id}>
            {alpha > 0.15 && <path d={s.d} fill="none" stroke={`rgba(${rgb},${Math.min(0.35, alpha * 0.25 * (1 + pulse))})`} strokeWidth={width * 5} strokeLinecap="round" {...dash} />}
            <path d={s.d} fill="none" stroke={`rgba(${rgb},${Math.min(1, alpha)})`} strokeWidth={width} strokeLinecap="round" {...dash} />
          </g>
        );
      })}
      {SEGS.map((s) => {
        const on = Math.max(0, Math.min(1, draw * (DEPTH + 1) - s.depth - 0.8));
        const alpha = on * (s.chosen ? 1 : 1 - fade) * 0.9;
        if (alpha <= 0.02) return null;
        return <circle key={`n${s.id}`} cx={s.x} cy={s.y} r={s.chosen && chosen > 0 ? 6 : 3.5} fill={s.chosen && chosen > 0 ? `rgb(${palette.halo})` : `rgba(${palette.accentRgb},${alpha})`} />;
      })}
    </svg>
  </div>
);

// The vertigo camera: spin, a slow push/pull (dolly) and colour fringing,
// all scaled by `strength` (0 = steady, 1 = sick).
export const Vertigo: React.FC<{ strength: number; frame: number; spin?: number; children: React.ReactNode; origin?: string }> = ({
  strength,
  frame,
  spin = 0,
  children,
  origin = "960px 540px",
}) => {
  const wobble = Math.sin(frame / 9) * 3 * strength;
  const dolly = 1 + Math.sin(frame / 17) * 0.06 * strength;
  const fringe = 5 * strength;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `rotate(${spin + wobble}deg) scale(${dolly})`,
        transformOrigin: origin,
        filter: strength > 0.05 ? `drop-shadow(${fringe}px 0 0 rgba(255,60,110,0.45)) drop-shadow(${-fringe}px 0 0 rgba(60,240,220,0.45))` : undefined,
      }}
    >
      {children}
    </div>
  );
};

// Side view: a cliff on the left, the edge at `edge.x`, a person standing on
// it, and the glowing paths far below in the chasm.
export const CliffSide: React.FC<{ edge: { x: number; y: number }; lean?: number; draw?: number; frame: number; glow?: number }> = ({ edge, lean = 0, draw = 1, frame, glow = 1 }) => (
  <div style={{ position: "absolute", inset: 0 }}>
    {/* the chasm and the paths deep down, seen at a steep angle */}
    <div style={{ position: "absolute", left: 0, top: edge.y, width: 1920, height: 1080 - edge.y, background: "linear-gradient(#070a10, #020305)" }} />
    <PathField cx={1300} cy={900} scale={0.95} tilt={66} draw={draw} pulse={0.4 + 0.4 * Math.sin(frame / 8)} />
    {/* the cliff */}
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <path
        d={`M0 ${edge.y} L${edge.x - 40} ${edge.y} L${edge.x} ${edge.y + 6} L${edge.x - 20} ${edge.y + 120} L${edge.x - 70} ${edge.y + 260} L${edge.x - 40} ${edge.y + 420} L${edge.x - 120} 1080 L0 1080 Z`}
        fill="#0c1018"
        stroke={`rgba(${palette.halo},0.35)`}
        strokeWidth={2}
      />
    </svg>
    <Halo x={edge.x - 40} y={edge.y - 170} r={260} intensity={glow} />
    <svg width={120} height={260} viewBox="0 0 120 260" style={{ position: "absolute", left: edge.x - 100, top: edge.y - 260, transform: `rotate(${lean}deg)`, transformOrigin: "60px 260px" }}>
      <FigureShape pose={lean > 3 ? "hunch" : "plain"} />
    </svg>
  </div>
);

// Top-down: the person seen from above (head and shoulders) on a ledge.
export const PersonFromAbove: React.FC<{ x: number; y: number; size?: number; angle?: number; glow?: number }> = ({ x, y, size = 90, angle = 0, glow = 1 }) => (
  <div style={{ position: "absolute", left: x - size, top: y - size, width: size * 2, height: size * 2, transform: `rotate(${angle}deg)` }}>
    <Halo x={size} y={size} r={size * 1.6} intensity={glow} />
    <svg width={size * 2} height={size * 2} viewBox="-50 -50 100 100" style={{ position: "absolute", inset: 0 }}>
      <ellipse cx={0} cy={4} rx={34} ry={16} fill="#030405" stroke={`rgba(${palette.halo},0.8)`} strokeWidth={1.5} />
      <circle cx={0} cy={0} r={13} fill="#030405" stroke={`rgba(${palette.halo},0.9)`} strokeWidth={1.5} />
    </svg>
  </div>
);
