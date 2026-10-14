import React from "react";
import { Silhouette } from "../../components/Figures";
import { fonts, palette } from "./look";

// ---------- Backlit: a silhouette with the light source behind it ----------
// The channel's signature: no spotlight from above — the glow sits *behind* the
// person and rims their outline.

export const Halo: React.FC<{ x: number; y: number; r: number; intensity?: number; rgb?: string }> = ({ x, y, r, intensity = 1, rgb = palette.halo }) => (
  <div
    style={{
      position: "absolute",
      left: x - r,
      top: y - r,
      width: r * 2,
      height: r * 2,
      borderRadius: "50%",
      background: `radial-gradient(circle, rgba(${rgb},${0.55 * intensity}) 0%, rgba(${rgb},${0.18 * intensity}) 35%, transparent 70%)`,
    }}
  />
);

export const Backlit: React.FC<{
  x: number;
  bottom: number;
  height?: number;
  glow?: number;
  opacity?: number;
  rgb?: string;
}> = ({ x, bottom, height = 260, glow = 1, opacity = 1, rgb = palette.halo }) => (
  <div style={{ position: "absolute", inset: 0, opacity }}>
    <Halo x={x} y={bottom - height * 0.62} r={height * 0.95} intensity={glow} rgb={rgb} />
    <Silhouette x={x} bottom={bottom} height={height} fill="#030405" rim={`rgba(${rgb},${0.35 + 0.6 * glow})`} />
  </div>
);

// ---------- Eyes: a giant pair of eyes and brows ----------
//   frown 0→1  brows pull down toward the middle, lids narrow
//   mirror 0→1 the irises turn into mirrors holding a tiny backlit figure

const Eye: React.FC<{ cx: number; cy: number; side: -1 | 1; open: number; frown: number; mirror: number; id: string }> = ({
  cx,
  cy,
  side,
  open,
  frown,
  mirror,
  id,
}) => {
  const w = 150;
  const h = 70 * open * (1 - frown * 0.35);
  const inner = cx - side * w;
  const outer = cx + side * w;
  const lidUp = cy - h - frown * 8 * -1;
  const shape = `M${outer} ${cy} Q${cx} ${lidUp - h * 0.4} ${inner} ${cy} Q${cx} ${cy + h * 1.1} ${outer} ${cy} Z`;
  const r = 58;
  return (
    <g>
      <defs>
        <clipPath id={`${id}-clip`}>
          <path d={shape} />
        </clipPath>
        <radialGradient id={`${id}-glass`}>
          <stop offset="0" stopColor="#dfe8ee" />
          <stop offset="1" stopColor="#7d8b96" />
        </radialGradient>
      </defs>
      <path d={shape} fill="#0b0f15" stroke={palette.ink} strokeWidth={3} />
      <g clipPath={`url(#${id}-clip)`}>
        <circle cx={cx} cy={cy + 4} r={r} fill="none" stroke={palette.accent} strokeWidth={10} opacity={1 - mirror * 0.6} />
        <circle cx={cx} cy={cy + 4} r={r - 6} fill={mirror > 0 ? `url(#${id}-glass)` : "#0b0f15"} opacity={0.15 + mirror * 0.85} />
        <circle cx={cx} cy={cy + 4} r={24 * (1 - mirror)} fill={palette.ink} />
        {mirror > 0 && (
          <g opacity={mirror}>
            <circle cx={cx} cy={cy - 4} r={20} fill={`rgba(${palette.halo},0.6)`} />
            {/* a tiny you, reflected */}
            <circle cx={cx} cy={cy - 16} r={7} fill="#05070a" />
            <path d={`M${cx - 11} ${cy - 6} Q${cx} ${cy - 12} ${cx + 11} ${cy - 6} L${cx + 11} ${cy + 22} L${cx - 11} ${cy + 22} Z`} fill="#05070a" />
          </g>
        )}
        <circle cx={cx + 18} cy={cy - 14} r={7} fill="#fff" opacity={0.8} />
      </g>
      {/* brow: the inner end drops when frowning */}
      <path
        d={`M${outer + side * 10} ${cy - 112} Q${cx} ${cy - 140 + frown * 6} ${inner - side * 10} ${cy - 108 + frown * 52}`}
        fill="none"
        stroke={palette.ink}
        strokeWidth={14}
        strokeLinecap="round"
      />
    </g>
  );
};

export const Eyes: React.FC<{ x: number; y: number; scale?: number; open?: number; frown?: number; mirror?: number; opacity?: number; id?: string }> = ({
  x,
  y,
  scale = 1,
  open = 1,
  frown = 0,
  mirror = 0,
  opacity = 1,
  id = "eyes",
}) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity, overflow: "visible" }}>
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <Eye cx={-230} cy={0} side={-1} open={open} frown={frown} mirror={mirror} id={`${id}-l`} />
      <Eye cx={230} cy={0} side={1} open={open} frown={frown} mirror={mirror} id={`${id}-r`} />
      {/* the crease between the brows */}
      <path d="M-14 -96 L-6 -60 M14 -96 L6 -60" stroke={palette.ink} strokeWidth={4} strokeLinecap="round" opacity={frown} />
    </g>
  </svg>
);

// ---------- FocusBox: viewfinder brackets that snap onto a subject ----------

export const FocusBox: React.FC<{ x: number; y: number; w: number; h: number; progress: number; label?: string; color?: string }> = ({
  x,
  y,
  w,
  h,
  progress,
  label,
  color = palette.accent,
}) => {
  if (progress <= 0) return null;
  const k = 1 + (1 - progress) * 0.35;
  const L = Math.min(w, h) * 0.22;
  const box = { left: x - (w * k) / 2, top: y - (h * k) / 2, width: w * k, height: h * k };
  const c = (s: React.CSSProperties) => <div style={{ position: "absolute", width: L, height: L, borderColor: color, borderStyle: "solid", borderWidth: 0, ...s }} />;
  return (
    <div style={{ position: "absolute", ...box, opacity: Math.min(1, progress * 2) }}>
      {c({ left: 0, top: 0, borderLeftWidth: 3, borderTopWidth: 3 })}
      {c({ right: 0, top: 0, borderRightWidth: 3, borderTopWidth: 3 })}
      {c({ left: 0, bottom: 0, borderLeftWidth: 3, borderBottomWidth: 3 })}
      {c({ right: 0, bottom: 0, borderRightWidth: 3, borderBottomWidth: 3 })}
      {label && (
        <div style={{ position: "absolute", left: 0, top: -34, fontFamily: fonts.mono, fontSize: 18, letterSpacing: 3, color }}>{label}</div>
      )}
    </div>
  );
};

// ---------- Mirror: a tall glass panel; children are what it reflects ----------

export const Mirror: React.FC<{ x: number; y: number; w: number; h: number; tilt?: number; opacity?: number; dim?: number; crack?: number; children?: React.ReactNode }> = ({
  x,
  y,
  w,
  h,
  tilt = 0,
  opacity = 1,
  dim = 0,
  crack = 0,
  children,
}) => (
  <div
    style={{
      position: "absolute",
      left: x - w / 2,
      top: y - h / 2,
      width: w,
      height: h,
      opacity,
      transform: `perspective(900px) rotateY(${tilt}deg)`,
      border: `2px solid rgba(${palette.accentRgb},0.45)`,
      borderRadius: w / 2,
      overflow: "hidden",
      background: "linear-gradient(160deg, rgba(150,180,200,0.22), rgba(14,21,34,0.85) 60%)",
      boxShadow: `0 0 30px rgba(${palette.accentRgb},0.12)`,
    }}
  >
    {children}
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.12) 45%, transparent 60%)" }} />
    <div style={{ position: "absolute", inset: 0, background: "#000", opacity: dim }} />
    {crack > 0 && (
      <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
        <path
          d={`M${w * 0.55} 0 L${w * 0.45} ${h * 0.25} L${w * 0.62} ${h * 0.42} L${w * 0.38} ${h * 0.63} L${w * 0.58} ${h}`}
          stroke="rgba(255,255,255,0.8)"
          strokeWidth={2}
          fill="none"
          strokeDasharray={h * 1.4}
          strokeDashoffset={h * 1.4 * (1 - crack)}
        />
      </svg>
    )}
  </div>
);

// ---------- Beam: a line of sight from one point to another ----------

export const Beam: React.FC<{ from: { x: number; y: number }; to: { x: number; y: number }; progress: number; color?: string; width?: number; dashed?: boolean }> = ({
  from,
  to,
  progress,
  color = palette.accent,
  width = 3,
  dashed = false,
}) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
    <line
      x1={from.x}
      y1={from.y}
      x2={from.x + (to.x - from.x) * progress}
      y2={from.y + (to.y - from.y) * progress}
      stroke={color}
      strokeWidth={width}
      strokeDasharray={dashed ? "10 10" : undefined}
      style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      opacity={progress > 0 ? 1 : 0}
    />
  </svg>
);

// ---------- Floor line ----------

export const Horizon: React.FC<{ y: number; opacity?: number }> = ({ y, opacity = 1 }) => (
  <div style={{ position: "absolute", left: 0, top: y, width: 1920, height: 1080 - y, opacity, background: `linear-gradient(rgba(${palette.accentRgb},0.10), transparent 40%)`, borderTop: `1px solid rgba(${palette.accentRgb},0.35)` }} />
);
