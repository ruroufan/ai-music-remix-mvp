import React from "react";
import { palette } from "../../channels/backlit/look";
import { Halo } from "../../channels/backlit/parts";

// The episode's central image: a person covered in gold labels — 名校, 名表,
// 精修照, 名牌 — with cracks underneath. The cracks are lit from behind (the
// channel's backlight leaking through), so they read as wounds showing through
// a polished surface.
//
// All shapes live in the same 120×260 box as components/Figures' Silhouette.

export type Pose = "plain" | "proud" | "hunch";

const HEAD: Record<Pose, { cx: number; cy: number }> = {
  plain: { cx: 60, cy: 34 },
  proud: { cx: 64, cy: 28 }, // chin up
  hunch: { cx: 70, cy: 52 }, // head down and forward
};
const BODY: Record<Pose, string> = {
  plain: "M22 100 Q22 66 60 66 Q98 66 98 100 L98 170 Q98 178 90 178 L30 178 Q22 178 22 170 Z",
  proud: "M20 98 Q22 62 60 62 Q100 62 100 98 L98 170 Q98 178 90 178 L30 178 Q22 178 22 170 Z",
  hunch: "M28 112 Q30 78 70 84 Q100 92 96 120 L92 172 Q92 178 84 178 L36 178 Q28 178 30 170 Z",
};

export const LABELS = [
  { text: "精修照", x: 60, y: 30, w: 80, h: 26, rot: -6 },
  { text: "名校", x: 54, y: 104, w: 64, h: 27, rot: 4 },
  { text: "名表", x: 90, y: 150, w: 58, h: 24, rot: -10 },
  { text: "名牌", x: 48, y: 208, w: 62, h: 24, rot: 8 },
];
const CRACKS = [
  "M44 16 L54 28 L48 38 L60 50 L56 58",
  "M36 88 L50 102 L44 114 L60 126 L54 140",
  "M78 136 L88 148 L80 158 L96 170",
  "M40 192 L50 206 L42 216 L52 232",
];
const CRACK_LEN = 70;

export const FigureShape: React.FC<{ pose?: Pose; fill?: string; rim?: string; rimWidth?: number }> = ({
  pose = "plain",
  fill = "#030405",
  rim = `rgba(${palette.halo},0.9)`,
  rimWidth = 1.8,
}) => {
  const h = HEAD[pose];
  return (
    <g fill={fill} stroke={rim} strokeWidth={rimWidth}>
      <rect x={38} y={150} width={16} height={110} rx={4} />
      <rect x={66} y={150} width={16} height={110} rx={4} />
      <path d={BODY[pose]} />
      <circle cx={h.cx} cy={h.cy} r={28} />
    </g>
  );
};

// A gold sticker. In SVG units of the figure box.
const Tag: React.FC<{ text: string; w: number; h: number; shine: number; xray: number }> = ({ text, w, h, shine, xray }) => (
  <g>
    <defs>
      <linearGradient id={`gold-${text}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#f6dc8a" />
        <stop offset="0.5" stopColor="#c99a35" />
        <stop offset="1" stopColor="#8a6216" />
      </linearGradient>
    </defs>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={3} fill={`url(#gold-${text})`} stroke="#fff3c4" strokeWidth={0.8} opacity={1 - xray * 0.85} />
    <rect x={-w / 2 + (shine % 1) * (w + 20) - 10} y={-h / 2} width={6} height={h} fill="#fffbe8" opacity={0.35 * (1 - xray)} />
    <text x={0} y={h * 0.3} textAnchor="middle" fontSize={h * 0.62} fontWeight={900} fill="#3a2608" opacity={1 - xray * 0.6} letterSpacing={1}>
      {text}
    </text>
    {xray > 0 && <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={3} fill="none" stroke={palette.accent} strokeWidth={0.8} strokeDasharray="2 2" opacity={xray} />}
  </g>
);

export const Gilded: React.FC<{
  x: number;
  bottom: number;
  height: number;
  pose?: Pose;
  glow?: number;
  labels?: number[]; // per label: 0 hidden → 1 stuck on
  peel?: number[]; // per label: 0 stuck → 1 fallen off
  crack?: number; // 0 → 1: cracks drawn in
  crackGlow?: number; // extra glow on the cracks (they "show through")
  heal?: number; // 0 → 1: cracks close up and fade
  shake?: number; // labels jitter (straining to prove something)
  xray?: number; // see-through view: labels go transparent, cracks blaze
  frame?: number;
}> = ({ x, bottom, height, pose = "proud", glow = 1, labels = [1, 1, 1, 1], peel = [0, 0, 0, 0], crack = 1, crackGlow = 0, heal = 0, shake = 0, xray = 0, frame = 0 }) => {
  const s = height / 260;
  const crackAlpha = (0.45 + 0.55 * Math.max(crackGlow, xray)) * (1 - heal);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Halo x={x} y={bottom - height * 0.62} r={height * 0.95} intensity={glow} />
      <svg
        width={220 * s}
        height={290 * s}
        viewBox="-50 -20 220 290"
        style={{ position: "absolute", left: x - 110 * s, top: bottom - 270 * s, overflow: "visible" }}
      >
        <FigureShape pose={pose} rim={`rgba(${palette.halo},${0.4 + 0.5 * glow})`} />
        {/* cracks: backlight leaking through */}
        {CRACKS.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={`rgba(${palette.halo},${crackAlpha})`}
            strokeWidth={2 + xray * 1.5}
            strokeLinejoin="bevel"
            strokeDasharray={CRACK_LEN}
            strokeDashoffset={CRACK_LEN * (1 - crack * (1 - heal))}
            style={{ filter: `drop-shadow(0 0 ${2 + 4 * Math.max(crackGlow, xray)}px rgba(${palette.halo},0.9))` }}
          />
        ))}
        {LABELS.map((l, i) => {
          const a = labels[i] ?? 0;
          const p = peel[i] ?? 0;
          if (a <= 0 || p >= 1) return null;
          const jitter = shake * Math.sin(frame * 2.3 + i * 1.7) * 2.5;
          const pop = 1 + (1 - a) * 0.6;
          const fallX = p * 30 * (i % 2 ? 1 : -1);
          const fallY = p * p * 160;
          const spin = p * 70 * (i % 2 ? 1 : -1);
          return (
            <g key={l.text} transform={`translate(${l.x + jitter + fallX} ${l.y + fallY}) rotate(${l.rot + spin}) scale(${pop})`} opacity={Math.min(1, a * 2) * (1 - p)}>
              <Tag text={l.text} w={l.w} h={l.h} shine={frame / 40 + i * 0.3} xray={xray} />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// A hunched shape cast on the floor in front of the figure (the backlight puts
// the shadow toward the camera) — the small, bent self under the proud one.
export const FloorShadow: React.FC<{ x: number; floor: number; height: number; opacity?: number; pose?: Pose }> = ({ x, floor, height, opacity = 1, pose = "hunch" }) => {
  const s = height / 260;
  return (
    <svg
      width={120 * s}
      height={260 * s}
      viewBox="0 0 120 260"
      style={{ position: "absolute", left: x - 60 * s, top: floor, opacity, transform: "scaleY(-0.42) skewX(-24deg)", transformOrigin: "50% 0%", filter: "blur(1.5px)" }}
    >
      <FigureShape pose={pose} fill="rgba(0,0,0,0.9)" rim="none" rimWidth={0} />
    </svg>
  );
};

// A free-standing gold tag (HTML), for scenes that show the labels on their own.
export const GoldTag: React.FC<{ text: string; x: number; y: number; size?: number; rot?: number; opacity?: number }> = ({ text, x, y, size = 40, rot = 0, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `translate(-50%, -50%) rotate(${rot}deg)`,
      opacity,
      padding: `${size * 0.18}px ${size * 0.45}px`,
      borderRadius: size * 0.12,
      background: "linear-gradient(135deg, #f6dc8a, #c99a35 55%, #8a6216)",
      border: "1px solid #fff3c4",
      color: "#3a2608",
      fontSize: size,
      fontWeight: 900,
      letterSpacing: size * 0.1,
      boxShadow: "0 6px 24px rgba(201,154,53,0.35)",
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </div>
);
