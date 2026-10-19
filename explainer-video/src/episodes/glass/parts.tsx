import React from "react";
import { palette } from "../../channels/backlit/look";

// 《玻璃心》's objects: a glass heart that cracks (and heals), a sentence that
// is an arrow, a glass door that appears between them, and the emperor.

export const GLASS = "190, 225, 255";
export const STING = "#ff5a72";

// A heart of glass at (x, y), `size` wide. `crack` 0 → 1 draws the cracks out
// from the point of impact; `pain` glows them red; `heal` closes them again.
const HEART = "M0 -28 C-10 -52 -50 -52 -50 -18 C-50 12 -18 34 0 52 C18 34 50 12 50 -18 C50 -52 10 -52 0 -28 Z";
const CRACKS = ["M8 -6 L-6 6 L2 18 L-10 32", "M8 -6 L22 -14 L30 -30", "M8 -6 L26 8 L36 4", "M-6 6 L-24 2 L-34 -10", "M2 18 L14 30"];
export const GlassHeart: React.FC<{ x: number; y: number; size?: number; crack?: number; pain?: number; heal?: number; glow?: number; children?: React.ReactNode }> = ({ x, y, size = 120, crack = 0, pain = 0, heal = 0, glow = 1, children }) => {
  const c = crack * (1 - heal);
  return (
    <svg width={size * 1.6} height={size * 1.6} viewBox="-80 -80 160 160" style={{ position: "absolute", left: x - size * 0.8, top: y - size * 0.8, overflow: "visible" }}>
      <defs>
        <radialGradient id={`gh-${x}-${y}`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="rgba(255,255,255,0.75)" />
          <stop offset="0.4" stopColor={`rgba(${GLASS},0.35)`} />
          <stop offset="1" stopColor={`rgba(${GLASS},0.12)`} />
        </radialGradient>
      </defs>
      <circle r={70} fill={`rgba(${pain > 0.05 ? "255, 90, 114" : GLASS},${0.12 * glow + 0.25 * pain})`} style={{ filter: "blur(14px)" }} />
      <g>
        <path d={HEART} fill={`url(#gh-${x}-${y})`} stroke="rgba(255,255,255,0.85)" strokeWidth={2} />
        <path d="M-30 -30 C-38 -20 -38 -8 -32 2" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth={3} strokeLinecap="round" />
        {children}
        {c > 0.01 &&
          CRACKS.map((d, i) => (
            <path key={i} d={d} fill="none" stroke={pain > 0.05 ? `rgba(255,${200 - 120 * pain},${210 - 100 * pain},0.95)` : "rgba(255,255,255,0.95)"} strokeWidth={1.8 + pain} strokeLinejoin="bevel" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, c * 1.4 - i * 0.08)} style={{ filter: pain > 0.05 ? `drop-shadow(0 0 ${4 + 6 * pain}px ${STING})` : undefined }} />
          ))}
      </g>
    </svg>
  );
};

// A sentence that is an arrow: the words are the shaft, a glass-steel head at
// the front, fletching at the back. Points along `angle` (deg, 0 = right).
export const WordArrow: React.FC<{ x: number; y: number; angle?: number; text: string; size?: number; glow?: number; opacity?: number; head?: number }> = ({ x, y, angle = 180, text, size = 40, glow = 1, opacity = 1, head = 1 }) => {
  const len = [...text].length * size * 1.05;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, transform: `rotate(${angle}deg)`, opacity }}>
      {/* the tip sits at (0, 0); the shaft runs back along −x */}
      <div style={{ position: "absolute", right: size * 0.9 * head, top: -size * 0.62, whiteSpace: "nowrap", fontSize: size, fontWeight: 900, color: palette.ink, letterSpacing: size * 0.05, textShadow: `0 0 ${12 * glow}px rgba(${GLASS},0.8)`, transform: angle > 90 && angle < 270 ? "rotate(180deg)" : undefined, transformOrigin: "50% 50%" }}>
        {text}
      </div>
      <div style={{ position: "absolute", right: size * 0.9 * head, top: -2, width: len, height: 4, background: `linear-gradient(90deg, transparent, rgba(${GLASS},0.7))` }} />
      <svg width={size * 2} height={size * 2} viewBox="-60 -30 60 60" style={{ position: "absolute", left: -size * 2, top: -size, overflow: "visible", transform: `scale(${head})`, transformOrigin: "100% 50%" }}>
        <path d="M0 0 L-46 -20 L-36 0 L-46 20 Z" fill={`rgba(${GLASS},0.85)`} stroke="#fff" strokeWidth={2} style={{ filter: `drop-shadow(0 0 ${8 * glow}px rgba(${GLASS},0.9))` }} />
      </svg>
      <svg width={60} height={60} viewBox="0 -30 60 60" style={{ position: "absolute", left: -(len + size * 0.9 * head) - 50, top: -30, overflow: "visible" }}>
        <path d="M50 0 L20 -18 L10 -18 L34 0 L10 18 L20 18 Z" fill="rgba(255,255,255,0.35)" stroke="rgba(255,255,255,0.7)" strokeWidth={1.5} />
      </svg>
    </div>
  );
};

// A door of glass: a pane with reflections in a thin bright frame, standing on
// the floor at x. `appear` draws it in from the edges; `handle` lights the
// handle; `ripple` rings out from (rx, ry) in pane coordinates.
export const GlassDoor: React.FC<{ x: number; floor: number; w?: number; h?: number; appear: number; handle?: number; ripple?: number; ry?: number }> = ({ x, floor, w = 220, h = 460, appear, handle = 0, ripple = 0, ry = 0.5 }) => {
  if (appear <= 0) return null;
  const per = 2 * (w + h);
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: floor - h, width: w, height: h }}>
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(115deg, rgba(${GLASS},0.04) 20%, rgba(255,255,255,0.18) 38%, rgba(${GLASS},0.05) 46%, rgba(${GLASS},0.1) 70%, rgba(255,255,255,0.12) 76%, rgba(${GLASS},0.03) 84%)`, opacity: Math.min(1, appear * 1.5), backdropFilter: "blur(1px)" }} />
      <svg width={w} height={h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <rect x={1} y={1} width={w - 2} height={h - 2} fill="none" stroke="rgba(235,245,255,0.95)" strokeWidth={3} pathLength={per} strokeDasharray={per} strokeDashoffset={per * (1 - appear)} style={{ filter: `drop-shadow(0 0 8px rgba(${GLASS},0.9))` }} />
        {ripple > 0 && ripple < 1 && [0, 0.25, 0.5].map((d, i) => {
          const r = Math.max(0, ripple - d) * 260;
          return r > 0 ? <ellipse key={i} cx={w / 2} cy={h * ry} rx={r * 0.5} ry={r} fill="none" stroke={`rgba(235,245,255,${0.7 * (1 - ripple)})`} strokeWidth={2} /> : null;
        })}
      </svg>
      {/* the handle */}
      <div style={{ position: "absolute", left: 18, top: h * 0.52, width: 10, height: 60, borderRadius: 5, background: handle > 0.05 ? `rgba(255,199,122,${0.5 + 0.5 * handle})` : "rgba(235,245,255,0.7)", boxShadow: handle > 0.05 ? `0 0 ${20 * handle}px rgba(255,176,104,0.9)` : undefined, opacity: appear }} />
    </div>
  );
};

// The emperor, in profile, laurel and beard; seated at a field desk, writing.
export const Emperor: React.FC<{ x: number; floor: number; scale?: number; write?: number; glow?: number }> = ({ x, floor, scale = 1, write = 0, glow = 1 }) => (
  <svg width={360 * scale} height={360 * scale} viewBox="0 0 360 360" style={{ position: "absolute", left: x - 180 * scale, top: floor - 360 * scale, overflow: "visible" }}>
    <g fill="#030405" stroke={`rgba(${palette.halo},${0.5 + 0.4 * glow})`} strokeWidth={2}>
      {/* desk */}
      <rect x={170} y={220} width={180} height={14} />
      <rect x={180} y={234} width={10} height={126} />
      <rect x={330} y={234} width={10} height={126} />
      {/* body, seated, leaning over the desk */}
      <path d="M70 360 L80 250 Q86 170 150 160 Q196 160 206 206 L214 226 L150 236 L140 300 L150 360 Z" />
      {/* arm to the page, moving as he writes */}
      <path d={`M170 196 Q206 200 ${224 + 10 * Math.sin(write * 20)} ${214 + 2 * Math.cos(write * 23)}`} fill="none" strokeWidth={14} stroke="#030405" />
      {/* head, bearded, bowed */}
      <path d="M128 90 Q160 66 192 92 Q204 104 202 122 L212 134 L202 140 Q206 152 196 162 Q186 182 160 180 Q132 178 124 150 Q114 112 128 90 Z" />
    </g>
    {/* laurel */}
    <g stroke="rgba(255,199,122,0.9)" strokeWidth={3} fill="none">
      <path d="M126 104 Q150 82 190 92" />
      {[0, 1, 2, 3, 4].map((k) => (
        <ellipse key={k} cx={134 + k * 12} cy={98 - k * 2.5} rx={6} ry={3} transform={`rotate(-30 ${134 + k * 12} ${98 - k * 2.5})`} />
      ))}
    </g>
    {/* the page */}
    <rect x={212} y={208} width={70} height={10} fill="#e8dcc0" transform="rotate(-4 212 208)" />
  </svg>
);
