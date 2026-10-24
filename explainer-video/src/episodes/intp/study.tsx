import React from "react";
import { random } from "remotion";
import { fonts } from "../../channels/backlit/look";
import { Halo } from "../../channels/backlit/parts";

// 《INTP · 想太多》's image: a man sitting in a grey study piled with books and
// drawings, countless lines of reasoning branching out behind his head; he
// pushes the door open, and outside is a big tree glowing green.

export const FLOOR = 760;
export const GREEN = "120, 235, 150";
export const GREY = "170, 176, 184";
export const DOOR = { x: 1440, y: 290, w: 220, h: FLOOR - 290 };
export const SEAT = 720; // his chair's front edge (he faces right, at the desk)
export const HEAD = { x: SEAT - 70 * 1.25, y: FLOOR - 204 * 1.25 };

// ── the room ────────────────────────────────────────────────────────────────
// `tint` 0 → 1 drains what little colour there is; `door` 0 → 1 opens it;
// `spill` how much green light comes in.
export const Study: React.FC<{ frame: number; door?: number; spill?: number; tint?: number; papers?: number }> = ({ frame, door = 0, spill = 0, tint = 0, papers = 1 }) => {
  const g = (a: number) => `rgba(${GREY},${a})`;
  return (
    <div style={{ position: "absolute", inset: 0, filter: tint > 0 ? `saturate(${1 - tint}) brightness(${1 - 0.25 * tint})` : undefined }}>
      {/* back wall, floor */}
      <div style={{ position: "absolute", left: 80, top: 120, width: 1760, height: FLOOR - 120, background: "linear-gradient(#1a1d22, #121418)", border: `1px solid ${g(0.12)}` }} />
      <div style={{ position: "absolute", left: 0, top: FLOOR, width: 1920, height: 320, background: "linear-gradient(#16181c, #0b0c0f)" }} />
      {/* shelves crammed with books */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {[0, 1, 2, 3, 4].map((row) => {
          const y = 200 + row * 108;
          let x = 120;
          const books: React.ReactNode[] = [];
          for (let i = 0; x < 470; i++) {
            const w = 12 + random(`bw-${row}-${i}`) * 16, h = 60 + random(`bh-${row}-${i}`) * 34;
            books.push(<rect key={i} x={x} y={y + 96 - h} width={w} height={h} fill={g(0.12 + random(`bc-${row}-${i}`) * 0.18)} stroke={g(0.25)} strokeWidth={1} />);
            x += w + 2;
          }
          return (
            <g key={row}>
              {books}
              <rect x={110} y={y + 96} width={380} height={8} fill={g(0.3)} />
            </g>
          );
        })}
        {/* piles on the floor */}
        {papers > 0 &&
          [[260, 4], [360, 7], [1180, 5], [1290, 3]].map(([px, n], k) => (
            <g key={k} opacity={papers}>
              {Array.from({ length: n }, (_, i) => (
                <rect key={i} x={px + (random(`pp-${k}-${i}`) - 0.5) * 16} y={FLOOR - (i + 1) * 16} width={90} height={14} fill={g(0.18 + 0.05 * (i % 3))} stroke={g(0.3)} strokeWidth={1} transform={`rotate(${(random(`pr-${k}-${i}`) - 0.5) * 6} ${px + 45} ${FLOOR - i * 16})`} />
              ))}
            </g>
          ))}
        {/* drawings pinned on the wall */}
        {[[560, 170, -4], [700, 210, 3], [1040, 160, -2], [1200, 220, 5]].map(([x, y, r], i) => (
          <g key={i} transform={`rotate(${r} ${x + 60} ${y + 40})`}>
            <rect x={x} y={y} width={120} height={84} fill={g(0.1)} stroke={g(0.35)} strokeWidth={1.5} />
            <path d={`M${x + 12} ${y + 60} L${x + 40} ${y + 30} L${x + 70} ${y + 50} L${x + 108} ${y + 18}`} fill="none" stroke={g(0.45)} strokeWidth={1.5} />
            <line x1={x + 12} y1={y + 72} x2={x + 100} y2={y + 72} stroke={g(0.3)} />
          </g>
        ))}
        {/* desk */}
        <rect x={720} y={FLOOR - 160} width={360} height={14} fill={g(0.3)} />
        <rect x={740} y={FLOOR - 146} width={12} height={146} fill={g(0.2)} />
        <rect x={1048} y={FLOOR - 146} width={12} height={146} fill={g(0.2)} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={900 + i * 6} y={FLOOR - 160 - (i + 1) * 18} width={120} height={16} fill={g(0.2 + 0.05 * i)} stroke={g(0.35)} strokeWidth={1} />)}
        <rect x={780} y={FLOOR - 166} width={100} height={6} fill={g(0.45)} />
      </svg>
      {/* the door, and what's outside it */}
      <Outside frame={frame} open={door} spill={spill} />
    </div>
  );
};

// The doorway: green light and, through it, the tree; the door panel swings in.
const Outside: React.FC<{ frame: number; open: number; spill: number }> = ({ frame, open, spill }) => (
  <>
    {open > 0 && (
      <div style={{ position: "absolute", left: DOOR.x, top: DOOR.y, width: DOOR.w, height: DOOR.h, overflow: "hidden", background: `linear-gradient(rgba(${GREEN},0.35), rgba(${GREEN},0.15))` }}>
        <div style={{ position: "absolute", left: -DOOR.x, top: -DOOR.y, width: 1920, height: 1080 }}>
          <LifeTree x={DOOR.x + DOOR.w / 2} floor={FLOOR} scale={0.8} frame={frame} glow={1} />
        </div>
      </div>
    )}
    {spill > 0 && (
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <defs>
          <linearGradient id="ip-spill" x1="1" x2="0">
            <stop offset="0" stopColor={`rgba(${GREEN},${0.5 * spill})`} />
            <stop offset="1" stopColor={`rgba(${GREEN},0)`} />
          </linearGradient>
        </defs>
        <path d={`M${DOOR.x} ${DOOR.y} L${DOOR.x} ${FLOOR} L${DOOR.x - 900 * spill} ${FLOOR + 300} L${DOOR.x - 300 * spill} ${FLOOR} Z`} fill="url(#ip-spill)" />
        <path d={`M${DOOR.x} ${FLOOR} L${DOOR.x + DOOR.w} ${FLOOR} L${DOOR.x + DOOR.w - 200} ${FLOOR + 320} L${DOOR.x - 700 * spill} ${FLOOR + 320} Z`} fill={`rgba(${GREEN},${0.18 * spill})`} />
      </svg>
    )}
    {/* frame and panel */}
    <div style={{ position: "absolute", left: DOOR.x - 10, top: DOOR.y - 10, width: DOOR.w + 20, height: DOOR.h + 10, border: `6px solid rgba(${GREY},0.45)`, borderBottom: "none" }} />
    <div style={{ position: "absolute", left: DOOR.x, top: DOOR.y, width: DOOR.w * (1 - 0.82 * open), height: DOOR.h, background: "linear-gradient(90deg, #2a2d33, #22252a)", border: `2px solid rgba(${GREY},0.4)`, boxShadow: open > 0 ? `0 0 ${40 * open}px rgba(${GREEN},${0.6 * open})` : undefined }}>
      <div style={{ position: "absolute", right: 18 * (1 - 0.8 * open), top: DOOR.h / 2, width: 12, height: 12, borderRadius: 6, background: `rgba(${GREY},0.8)` }} />
    </div>
  </>
);

// ── the tree ────────────────────────────────────────────────────────────────
export const LifeTree: React.FC<{ x: number; floor: number; scale?: number; frame: number; glow?: number }> = ({ x, floor, scale = 1, frame, glow = 1 }) => {
  const s = scale;
  const blobs = Array.from({ length: 14 }, (_, i) => ({
    cx: x + (random(`lt-x-${i}`) - 0.5) * 420 * s,
    cy: floor - 420 * s - random(`lt-y-${i}`) * 220 * s,
    r: (70 + random(`lt-r-${i}`) * 70) * s,
  }));
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Halo x={x} y={floor - 480 * s} r={520 * s} intensity={0.9 * glow} rgb={GREEN} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d={`M${x - 26 * s} ${floor} Q${x - 10 * s} ${floor - 200 * s} ${x - 30 * s} ${floor - 380 * s} M${x + 26 * s} ${floor} Q${x + 14 * s} ${floor - 220 * s} ${x + 40 * s} ${floor - 400 * s}`} stroke="#3a2c1e" strokeWidth={24 * s} fill="none" strokeLinecap="round" />
        <path d={`M${x} ${floor - 300 * s} Q${x - 100 * s} ${floor - 380 * s} ${x - 160 * s} ${floor - 470 * s} M${x} ${floor - 320 * s} Q${x + 110 * s} ${floor - 390 * s} ${x + 170 * s} ${floor - 480 * s}`} stroke="#3a2c1e" strokeWidth={12 * s} fill="none" strokeLinecap="round" />
        {blobs.map((b, i) => (
          <circle key={i} cx={b.cx + Math.sin(frame / 30 + i) * 4 * s} cy={b.cy} r={b.r} fill={`rgba(${GREEN},${0.35 + 0.15 * random(`lt-a-${i}`)})`} style={{ filter: `drop-shadow(0 0 ${18 * glow}px rgba(${GREEN},0.7))` }} />
        ))}
        {/* drifting leaves */}
        {Array.from({ length: 16 }, (_, i) => {
          const t = ((frame / 90 + random(`lf-${i}`)) % 1);
          const lx = x + (random(`lfx-${i}`) - 0.5) * 600 * s + Math.sin(t * 8 + i) * 30;
          const ly = floor - 520 * s + t * 560 * s;
          return <ellipse key={`l${i}`} cx={lx} cy={ly} rx={6 * s} ry={3 * s} fill={`rgba(${GREEN},${0.9 * (1 - t)})`} transform={`rotate(${t * 360 + i * 40} ${lx} ${ly})`} />;
        })}
      </svg>
    </div>
  );
};

// ── the reasoning ───────────────────────────────────────────────────────────
const NOTES = ["方案 A", "如果…", "那么…", "但是", "假设", "∴", "概率 37%", "反例?", "方案 B", "→ 第 3 年", "变量 x", "如果不…", "方案 C", "∵", "再想想"];
type Seg = { x1: number; y1: number; x2: number; y2: number; cx: number; cy: number; at: number; label?: string };
// a deterministic branching tree of curves from (ox, oy), growing up and back
const branches = (ox: number, oy: number, seed: string) => {
  const segs: Seg[] = [];
  let n = 0;
  const grow = (x: number, y: number, ang: number, len: number, depth: number, at: number) => {
    if (depth > 5) return;
    const k = 2 + (random(`${seed}-k-${x | 0}-${y | 0}`) > 0.6 ? 1 : 0);
    for (let i = 0; i < k; i++) {
      const a = ang + (i - (k - 1) / 2) * 0.9 + (random(`${seed}-a-${n}`) - 0.5) * 0.35;
      const L = len * (0.75 + random(`${seed}-l-${n}`) * 0.4);
      const x2 = x + Math.cos(a) * L * 1.35, y2 = Math.max(150, y + Math.sin(a) * L * 0.8);
      const cx = (x + x2) / 2 + Math.cos(a + Math.PI / 2) * L * 0.2, cy = (y + y2) / 2 + Math.sin(a + Math.PI / 2) * L * 0.2;
      const label = depth >= 2 && random(`${seed}-n-${n}`) > 0.72 ? NOTES[n % NOTES.length] : undefined;
      segs.push({ x1: x, y1: y, x2, y2, cx, cy, at: at + depth * 0.16 + random(`${seed}-t-${n}`) * 0.06, label });
      n++;
      grow(x2, y2, a, L * 0.78, depth + 1, at);
    }
  };
  grow(ox, oy, -Math.PI * 0.56, 120, 0, 0);
  return segs;
};

// `grow` 0 → 1 draws the lines out; `pulse` makes signals run along them.
export const Reasoning: React.FC<{ frame: number; ox: number; oy: number; grow: number; opacity?: number; color?: string; seed?: string }> = ({ frame, ox, oy, grow, opacity = 1, color = "232, 238, 242", seed = "rs" }) => {
  const segs = React.useMemo(() => branches(ox, oy, seed), [ox, oy, seed]);
  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {segs.map((s, i) => {
          const k = Math.max(0, Math.min(1, (grow - s.at) / 0.16));
          if (k <= 0) return null;
          const L = Math.hypot(s.x2 - s.x1, s.y2 - s.y1) * 1.1;
          const t = ((frame / 25 + i * 0.13) % 1);
          const px = (1 - t) * (1 - t) * s.x1 + 2 * (1 - t) * t * s.cx + t * t * s.x2;
          const py = (1 - t) * (1 - t) * s.y1 + 2 * (1 - t) * t * s.cy + t * t * s.y2;
          return (
            <g key={i}>
              <path d={`M${s.x1} ${s.y1} Q${s.cx} ${s.cy} ${s.x2} ${s.y2}`} fill="none" stroke={`rgba(${color},${0.25 + 0.2 * (i % 3)})`} strokeWidth={2} strokeDasharray={L} strokeDashoffset={L * (1 - k)} />
              {k >= 1 && <circle cx={s.x2} cy={s.y2} r={3} fill={`rgba(${color},0.8)`} />}
              {k >= 1 && <circle cx={px} cy={py} r={2.5} fill={`rgba(${color},0.9)`} style={{ filter: `drop-shadow(0 0 4px rgba(${color},1))` }} />}
            </g>
          );
        })}
      </svg>
      {segs.map((s, i) => {
        const k = Math.max(0, Math.min(1, (grow - s.at) / 0.16));
        if (!s.label || k < 1) return null;
        return <div key={i} style={{ position: "absolute", left: s.x2 + 6, top: s.y2 - 22, fontFamily: fonts.mono, fontSize: 16, color: `rgba(${color},0.75)`, whiteSpace: "nowrap" }}>{s.label}</div>;
      })}
    </div>
  );
};
