import React from "react";
import { fonts, palette } from "../../channels/backlit/look";
import { FigureShape, type Pose } from "../../channels/backlit/figure";
import { Halo } from "../../channels/backlit/parts";

// 《谦虚》's images: a person wearing a mask of a lowered, smiling face while the
// head behind it is tipped back; and a balance scale with a weight of his own
// on one pan. When he takes the weight off, the mask falls.

const HEADS: Record<Pose, { cx: number; cy: number }> = { plain: { cx: 60, cy: 34 }, proud: { cx: 64, cy: 28 }, hunch: { cx: 70, cy: 52 } };
const PORCELAIN = "#ece6da";

// The mask, centred on (0, 0), in figure units: eyes closed and turned down,
// apologetic brows, a small polite smile.
const MaskFace: React.FC<{ strap?: number }> = ({ strap = 0 }) => (
  <g>
    {strap > 0 && <path d="M-24 -6 Q0 -40 24 -6" fill="none" stroke={`rgba(${palette.halo},${0.7 * strap})`} strokeWidth={1.4} strokeDasharray="3 3" />}
    <ellipse rx={24} ry={30} fill={PORCELAIN} stroke="#fffaf0" strokeWidth={1.2} />
    <ellipse rx={24} ry={30} fill="url(#maskShade)" />
    <path d="M-15 -12 L-6 -9 M15 -12 L6 -9" stroke="#6b5a48" strokeWidth={1.6} strokeLinecap="round" />
    <path d="M-15 -2 Q-10 3 -5 -2 M5 -2 Q10 3 15 -2" fill="none" stroke="#3b3128" strokeWidth={1.8} strokeLinecap="round" />
    <path d="M-7 13 Q0 19 7 13" fill="none" stroke="#8a4a40" strokeWidth={1.8} strokeLinecap="round" />
    <circle cx={-14} cy={7} r={3.5} fill="rgba(230,140,130,0.35)" />
    <circle cx={14} cy={7} r={3.5} fill="rgba(230,140,130,0.35)" />
  </g>
);

// The real face behind it, drawn as rim-lit lines inside the head: eyes open
// and looking up, brows raised, chin up.
const RealFace: React.FC<{ cx: number; cy: number; a: number }> = ({ cx, cy, a }) => (
  <g stroke={`rgba(${palette.halo},${a})`} strokeWidth={1.6} fill="none" strokeLinecap="round">
    <path d={`M${cx - 15} ${cy - 16} Q${cx - 9} ${cy - 21} ${cx - 3} ${cy - 17} M${cx + 3} ${cy - 17} Q${cx + 9} ${cy - 21} ${cx + 15} ${cy - 16}`} />
    <ellipse cx={cx - 9} cy={cy - 9} rx={4} ry={3} />
    <ellipse cx={cx + 9} cy={cy - 9} rx={4} ry={3} />
    <circle cx={cx - 9} cy={cy - 11} r={1.4} fill={`rgba(${palette.halo},${a})`} />
    <circle cx={cx + 9} cy={cy - 11} r={1.4} fill={`rgba(${palette.halo},${a})`} />
    <path d={`M${cx - 6} ${cy + 6} Q${cx} ${cy + 3} ${cx + 8} ${cy + 4}`} />
  </g>
);

// `mask` 0 → 1 puts the mask on; `xray` 0 → 1 makes it see-through so the face
// behind shows; `fall` 0 → 1 drops it to the floor (and he relaxes into a
// plain stance once it's off).
export const MaskedFigure: React.FC<{
  x: number;
  bottom: number;
  height?: number;
  pose?: Pose;
  mask?: number;
  xray?: number;
  fall?: number;
  glow?: number;
  opacity?: number;
}> = ({ x, bottom, height = 260, pose, mask = 1, xray = 0, fall = 0, glow = 1, opacity = 1 }) => {
  const s = height / 260;
  const p: Pose = pose ?? (fall > 0.5 ? "plain" : "proud");
  const h = HEADS[p];
  // the mask sits low and tips forward: a lowered head
  const mx = h.cx + 2, my = h.cy + 14;
  const drop = fall * fall * (244 - my);
  const maskT = `translate(${mx + fall * 34} ${my + drop}) rotate(${-8 + fall * 98}) scale(1 ${1 - fall * 0.45})`;
  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      <Halo x={x} y={bottom - height * 0.62} r={height * 0.95} intensity={glow} />
      <svg width={160 * s} height={300 * s} viewBox="-20 -30 160 300" style={{ position: "absolute", left: x - 80 * s, top: bottom - 290 * s, overflow: "visible" }}>
        <defs>
          <radialGradient id="maskShade" cx="0.5" cy="0.3" r="0.8">
            <stop offset="0.5" stopColor="rgba(0,0,0,0)" />
            <stop offset="1" stopColor="rgba(60,40,20,0.35)" />
          </radialGradient>
        </defs>
        <FigureShape pose={p} rim={`rgba(${palette.halo},${0.35 + 0.6 * glow})`} />
        {xray > 0.02 && fall < 0.3 && <RealFace cx={h.cx} cy={h.cy} a={xray} />}
        {mask > 0.01 && (
          <g transform={maskT} opacity={mask * (1 - xray * 0.7)}>
            <MaskFace strap={xray * (1 - fall)} />
          </g>
        )}
      </svg>
    </div>
  );
};

// A mask lying on the floor on its own (after it has fallen), in px.
export const FallenMask: React.FC<{ x: number; floor: number; size?: number; opacity?: number }> = ({ x, floor, size = 1.2, opacity = 1 }) => (
  <svg width={80 * size} height={60 * size} viewBox="-40 -30 80 60" style={{ position: "absolute", left: x - 40 * size, top: floor - 40 * size, opacity, overflow: "visible" }}>
    <defs>
      <radialGradient id="maskShade" cx="0.5" cy="0.3" r="0.8">
        <stop offset="0.5" stopColor="rgba(0,0,0,0)" />
        <stop offset="1" stopColor="rgba(60,40,20,0.35)" />
      </radialGradient>
    </defs>
    <g transform="rotate(90) scale(1 0.55)">
      <MaskFace />
    </g>
  </svg>
);

// The shadow the person throws on the back wall when lit from the front:
// bigger, and in whatever pose is really underneath.
export const WallShadow: React.FC<{ x: number; bottom: number; height: number; pose?: Pose; opacity?: number }> = ({ x, bottom, height, pose = "proud", opacity = 1 }) => {
  const s = height / 260;
  return (
    <svg width={120 * s} height={height} viewBox="0 0 120 260" style={{ position: "absolute", left: x - 60 * s, top: bottom - height, opacity, filter: "blur(3px)" }}>
      <FigureShape pose={pose} fill="rgba(0,0,0,0.75)" rim="none" rimWidth={0} />
    </svg>
  );
};

// ---------- the scale ----------

const W = { w: 74, h: 46 };
// A cast-iron weight with a label, centred at (0, 0), in px.
const Weight: React.FC<{ label: string; mine?: boolean }> = ({ label, mine = false }) => (
  <g>
    <path d={`M${-W.w / 2 + 8} ${-W.h / 2} L${W.w / 2 - 8} ${-W.h / 2} L${W.w / 2} ${W.h / 2} L${-W.w / 2} ${W.h / 2} Z`} fill={mine ? "#2a2116" : "#1c2330"} stroke={mine ? `rgb(${palette.halo})` : "rgba(232,238,242,0.5)"} strokeWidth={2} />
    <rect x={-10} y={-W.h / 2 - 10} width={20} height={10} rx={4} fill="none" stroke={mine ? `rgb(${palette.halo})` : "rgba(232,238,242,0.5)"} strokeWidth={2} />
    <text y={8} textAnchor="middle" fontSize={22} fontWeight={700} fill={mine ? `rgb(${palette.halo})` : palette.ink} fontFamily={fonts.sans}>
      {label}
    </text>
  </g>
);

// A balance: pivot at (x, y); `tilt` in degrees, positive = right pan down.
// `left` / `right` are the weights' labels; the first left weight is his own
// ("我"): `lift` 0 → 1 carries it off the pan to `liftTo`.
export const Scale: React.FC<{
  x: number;
  y: number;
  tilt: number;
  left: string[];
  right: string[];
  lift?: number;
  liftTo?: { x: number; y: number };
  opacity?: number;
  half?: number;
}> = ({ x, y, tilt, left, right, lift = 0, liftTo, opacity = 1, half = 300 }) => {
  const th = (tilt * Math.PI) / 180;
  const ends = [
    { x: x - half * Math.cos(th), y: y - half * Math.sin(th) },
    { x: x + half * Math.cos(th), y: y + half * Math.sin(th) },
  ];
  const DROP = 170;
  const pans = ends.map((e) => ({ x: e.x, y: e.y + DROP }));
  const place = (pan: { x: number; y: number }, i: number, n: number) => ({ x: pan.x + (i - (n - 1) / 2) * (W.w + 6), y: pan.y - W.h / 2 - 4 });
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity, overflow: "visible" }}>
      {/* post and base */}
      <rect x={x - 7} y={y} width={14} height={340} fill="#1a212d" stroke={palette.faint} />
      <path d={`M${x - 120} ${y + 360} L${x + 120} ${y + 360} L${x + 80} ${y + 330} L${x - 80} ${y + 330} Z`} fill="#1a212d" stroke={palette.faint} />
      {/* beam */}
      <line x1={ends[0].x} y1={ends[0].y} x2={ends[1].x} y2={ends[1].y} stroke="#c9b48a" strokeWidth={8} strokeLinecap="round" />
      <path d={`M${x - 10} ${y - 40} L${x + 10} ${y - 40} L${x} ${y - 4} Z`} fill="#c9b48a" transform={`rotate(${tilt} ${x} ${y})`} />
      <circle cx={x} cy={y} r={11} fill="#0b0f15" stroke="#c9b48a" strokeWidth={3} />
      {/* strings and pans */}
      {ends.map((e, i) => (
        <g key={i}>
          <line x1={e.x} y1={e.y} x2={pans[i].x - 90} y2={pans[i].y} stroke="rgba(201,180,138,0.7)" strokeWidth={2} />
          <line x1={e.x} y1={e.y} x2={pans[i].x + 90} y2={pans[i].y} stroke="rgba(201,180,138,0.7)" strokeWidth={2} />
          <path d={`M${pans[i].x - 100} ${pans[i].y} Q${pans[i].x} ${pans[i].y + 46} ${pans[i].x + 100} ${pans[i].y} Z`} fill="#1c1a16" stroke="#c9b48a" strokeWidth={3} />
        </g>
      ))}
      {left.map((l, i) => {
        const p = place(pans[0], i, left.length);
        const mine = i === 0;
        const t = mine ? lift : 0;
        const at = mine && liftTo ? { x: p.x + (liftTo.x - p.x) * t, y: p.y + (liftTo.y - p.y) * t - Math.sin(t * Math.PI) * 80 } : p;
        return (
          <g key={`l${i}`} transform={`translate(${at.x} ${at.y})`}>
            <Weight label={l} mine={mine} />
          </g>
        );
      })}
      {right.map((l, i) => {
        const p = place(pans[1], i, right.length);
        return (
          <g key={`r${i}`} transform={`translate(${p.x} ${p.y})`}>
            <Weight label={l} />
          </g>
        );
      })}
    </svg>
  );
};

// ---------- speech ----------

const TONES = {
  humble: { bg: "rgba(236,230,218,0.95)", fg: "#2a231c" },
  praise: { bg: palette.accent, fg: "#06080c" },
  reply: { bg: `rgb(${palette.halo})`, fg: "#1a1208" },
  plain: { bg: "rgba(232,238,242,0.92)", fg: "#14181e" },
};

// A speech bubble whose tail points down at (x, y).
export const Bubble: React.FC<{ x: number; y: number; text: string; tone?: keyof typeof TONES; size?: number; opacity?: number; pop?: number; flip?: boolean }> = ({
  x,
  y,
  text,
  tone = "plain",
  size = 34,
  opacity = 1,
  pop = 1,
  flip = false,
}) => {
  const c = TONES[tone];
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity, transform: `translate(${flip ? "-100%" : "0"}, -100%) scale(${0.6 + 0.4 * pop})`, transformOrigin: flip ? "100% 100%" : "0% 100%" }}>
      <div style={{ padding: `${size * 0.3}px ${size * 0.55}px`, borderRadius: size * 0.5, background: c.bg, color: c.fg, fontSize: size, fontWeight: 800, whiteSpace: "nowrap", marginBottom: 14 }}>{text}</div>
      <div style={{ position: "absolute", [flip ? "right" : "left"]: 18, bottom: 2, width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: `14px solid ${c.bg}` }} />
    </div>
  );
};
