import React from "react";
import { random } from "remotion";
import { Halo } from "../../channels/backlit/parts";
import { Stander } from "../doubt/circles";

// 《ISFJ · 忍》's image: a glass jar in his chest. Every time he says 没关系 a
// small stone goes into it. It fills; cracks run across the glass. At the end
// he opens it and takes the stones out, one by one.

export const GLASS = "200, 225, 240";
export const STONE = "#6e6a66";
export const WARM = "255, 196, 150";
export const SOFT = "170, 190, 220";
export const RED = "255, 110, 110";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// slots for up to 24 stones, filled from the bottom up, in jar-local units
// (jar body is 160 × 220, origin at the bottom centre)
const SLOTS = Array.from({ length: 24 }, (_, i) => {
  const row = Math.floor(i / 4), col = i % 4;
  return { x: -54 + col * 36 + (row % 2 ? 10 : 0) + (random(`sx${i}`) - 0.5) * 6, y: -20 - row * 32 + (random(`sy${i}`) - 0.5) * 6, r: 16 + 4 * random(`sr${i}`), rot: random(`so${i}`) * 180 };
});

// the jar; `stones` (fractional: the last one is still dropping in), `crack`
// 0 → 1, `lid` 0 → 1 lifts the lid off, `glow` lights the inside
export const Jar: React.FC<{ x: number; y: number; size?: number; stones: number; crack?: number; lid?: number; glow?: number; shatter?: number; tint?: number }> = ({ x, y, size = 1, stones, crack = 0, lid = 0, glow = 0, shatter = 0, tint = 0 }) => {
  const s = size;
  const n = Math.floor(stones);
  const drop = stones - n;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {glow > 0 && <Halo x={x} y={y - 110 * s} r={200 * s} intensity={glow} rgb={WARM} />}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g transform={`translate(${x} ${y}) scale(${s})`} opacity={1 - shatter}>
          <path d="M-80 -200 Q-84 -110 -80 -16 Q-80 0 -64 0 L64 0 Q80 0 80 -16 Q84 -110 80 -200 Z" fill={`rgba(${GLASS},${0.08 + 0.1 * tint})`} />
          {SLOTS.slice(0, Math.min(24, n + (drop > 0 ? 1 : 0))).map((p, i) => {
            const falling = i === n && drop > 0;
            const yy = falling ? -230 + (p.y + 230) * drop * drop : p.y;
            return <ellipse key={i} cx={p.x} cy={yy} rx={p.r} ry={p.r * 0.75} transform={`rotate(${p.rot} ${p.x} ${yy})`} fill={STONE} stroke="rgba(30,28,26,0.9)" strokeWidth={1.5} />;
          })}
          <path d="M-80 -200 Q-84 -110 -80 -16 Q-80 0 -64 0 L64 0 Q80 0 80 -16 Q84 -110 80 -200" fill="none" stroke={`rgba(${GLASS},0.75)`} strokeWidth={3} />
          <path d="M-60 -180 Q-66 -110 -62 -40" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={5} strokeLinecap="round" />
          {crack > 0 && (
            <g stroke="rgba(255,255,255,0.85)" strokeWidth={2} fill="none">
              <path d={`M40 -190 L22 -150 L44 -120 L18 -80`} strokeDasharray="200" strokeDashoffset={200 * (1 - clamp01(crack * 2))} />
              <path d={`M-70 -120 L-40 -100 L-56 -70 L-24 -40`} strokeDasharray="160" strokeDashoffset={160 * (1 - clamp01(crack * 2 - 0.6))} />
              <path d={`M-20 -200 L-10 -176 L-30 -150`} strokeDasharray="80" strokeDashoffset={80 * (1 - clamp01(crack * 2 - 1))} />
            </g>
          )}
          <g transform={`translate(${lid * 60} ${-lid * 120}) rotate(${lid * 25} 0 -210)`}>
            <rect x={-88} y={-222} width={176} height={22} rx={6} fill="#5a4a3a" stroke="rgba(214,170,120,0.6)" strokeWidth={2} />
          </g>
        </g>
        {shatter > 0 &&
          Array.from({ length: 26 }, (_, i) => {
            const a = random(`ja${i}`) * 6.28, d = shatter * (120 + 260 * random(`jd${i}`));
            return <path key={i} d={`M0 0 l${10 + 16 * random(`jw${i}`)} 6 l-8 14 z`} transform={`translate(${x + Math.cos(a) * d} ${y - 110 * s + Math.sin(a) * d + 300 * shatter * shatter}) rotate(${shatter * 500 * random(`jr${i}`)})`} fill={i % 3 ? `rgba(${GLASS},${0.7 * (1 - shatter)})` : STONE} />;
          })}
      </svg>
    </div>
  );
};

// him, with the jar showing through his chest
export const Holder: React.FC<{ x: number; bottom?: number; height?: number; stones: number; crack?: number; lid?: number; glow?: number; jarGlow?: number; shatter?: number; grey?: number }> = ({ x, bottom = 940, height = 620, stones, crack, lid, glow = 0.6, jarGlow = 0, shatter, grey = 0 }) => {
  const s = height / 260;
  return (
    <div style={{ position: "absolute", inset: 0, filter: grey > 0 ? `grayscale(${grey}) brightness(${1 - 0.4 * grey})` : undefined }}>
      <Stander x={x} bottom={bottom} height={height} lift={0} glow={glow} rgb={SOFT} />
      <Jar x={x + 4 * s} y={bottom - 110 * s} size={0.36 * s} stones={stones} crack={crack} lid={lid} glow={jarGlow} shatter={shatter} />
    </div>
  );
};

// a speech bubble
export const Say: React.FC<{ x: number; y: number; text: string; k: number; color?: string; size?: number }> = ({ x, y, text, k, color = "232, 238, 242", size = 34 }) =>
  k <= 0 ? null : (
    <div style={{ position: "absolute", left: x, top: y, padding: "10px 22px", borderRadius: 18, border: `2px solid rgba(${color},0.8)`, background: "rgba(14,16,20,0.88)", fontSize: size, fontWeight: 900, color: `rgb(${color})`, opacity: Math.min(1, k), transform: `scale(${1.2 - 0.2 * Math.min(1, k)})`, whiteSpace: "nowrap" }}>{text}</div>
  );

// a stone in flight from (x0,y0) into (x1,y1)
export const Flying: React.FC<{ x0: number; y0: number; x1: number; y1: number; k: number }> = ({ x0, y0, x1, y1, k }) =>
  k <= 0 || k >= 1 ? null : (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <ellipse cx={x0 + (x1 - x0) * k} cy={y0 + (y1 - y0) * k - Math.sin(k * Math.PI) * 120} rx={14} ry={10} fill={STONE} stroke="#222" strokeWidth={1.5} />
    </svg>
  );
