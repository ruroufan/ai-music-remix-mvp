import React from "react";
import { random } from "remotion";

// A plaster phrenology bust in profile (facing right) — the original video's
// recurring "proud self". Drawn in a 300×400 box; position/scale from outside.
//
//   crack  0→1  draws a crack down from the crown across the face
//   laser  0→1  a red beam shoots out of the eye to the right edge
//   lying  true rotates it onto its back (face up)

const HEAD =
  "M150 30 C200 26 236 52 240 100 C242 118 238 128 241 138 C246 150 258 170 268 188 " +
  "C270 194 262 198 250 199 C252 205 254 209 251 213 C255 218 252 222 247 224 " +
  "C251 229 250 236 243 241 C247 252 248 262 240 272 C232 280 222 282 214 286 " +
  "C214 306 218 326 232 344 C248 356 262 366 266 384 L266 400 L48 400 " +
  "C50 374 76 352 102 334 C104 316 100 296 92 280 C72 256 62 226 62 190 " +
  "C62 96 96 34 150 30 Z";

// Little "phrenology" glyph rows across the cranium.
const GLYPHS = Array.from({ length: 22 }, (_, i) => {
  const row = Math.floor(i / 6), col = i % 6;
  return { x: 100 + col * 20 + (row % 2) * 10, y: 70 + row * 22 + Math.abs(col - 2.5) * 4, r: random(`gl-${i}`) };
}).filter((g) => g.x < 200 - g.y * 0.15 + 30);

export const Bust: React.FC<{
  x: number;
  y: number;
  scale?: number;
  crack?: number;
  laser?: number;
  lying?: boolean;
  opacity?: number;
  // Where the bottom fade-out starts (0–1 of the height); lower hides the shoulders.
  fadeFrom?: number;
  id?: string;
}> = ({ x, y, scale = 1, crack = 0, laser = 0, lying = false, opacity = 1, fadeFrom = 0.72, id = "bust" }) => {
  const crackLen = 420;
  return (
    <svg
      width={300 * scale}
      height={400 * scale}
      viewBox="0 0 300 400"
      style={{
        position: "absolute",
        left: x - 150 * scale,
        top: y - 200 * scale,
        overflow: "visible",
        opacity,
        transform: lying ? "rotate(-90deg)" : undefined,
      }}
    >
      <defs>
        <linearGradient id={`${id}-plaster`} x1="0.85" y1="0.1" x2="0.1" y2="0.9">
          <stop offset="0" stopColor="#f2efe9" />
          <stop offset="0.55" stopColor="#c9c4bb" />
          <stop offset="1" stopColor="#6f6a62" />
        </linearGradient>
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset={fadeFrom} stopColor="#fff" stopOpacity="1" />
          <stop offset={Math.min(1, fadeFrom + 0.2)} stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`${id}-mask`}>
          <rect x="0" y="0" width="300" height="400" fill={`url(#${id}-fade)`} />
        </mask>
        <filter id={`${id}-glow`}>
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      <g mask={`url(#${id}-mask)`}>
        <path d={HEAD} fill={`url(#${id}-plaster)`} stroke="rgba(40,36,32,0.5)" strokeWidth={1.5} />
        {/* ear */}
        <path d="M128 168 C116 168 112 190 118 206 C122 216 134 214 136 204" fill="none" stroke="#7d776e" strokeWidth={2.5} />
        <circle cx={127} cy={190} r={9} fill="none" stroke="#8d877e" strokeWidth={2} />
        {/* phrenology map: a dividing line and rows of glyphs */}
        <path d="M150 34 C142 70 150 110 140 150 C134 176 120 214 108 252" fill="none" stroke="#8d877e" strokeWidth={2} />
        {GLYPHS.map((g, i) => (
          <path
            key={i}
            d={`M${g.x} ${g.y} q4 -6 8 0 q2 4 -2 5`}
            fill="none"
            stroke="#9a948a"
            strokeWidth={1.6}
            opacity={0.5 + g.r * 0.4}
          />
        ))}
        {/* brow, closed eye */}
        <path d="M200 124 C214 116 228 118 238 126" fill="none" stroke="#5f5a53" strokeWidth={3} />
        <path d="M206 140 C214 146 226 146 234 140" fill="none" stroke="#4f4a44" strokeWidth={2.5} />
        {crack > 0 && (
          <path
            d="M176 32 L182 70 L172 98 L190 128 L182 150 L204 176 L198 206 L214 232 L206 262 L220 300"
            fill="none"
            stroke="#2b2722"
            strokeWidth={2.4}
            strokeLinejoin="bevel"
            strokeDasharray={crackLen}
            strokeDashoffset={crackLen * (1 - crack)}
          />
        )}
      </g>

      {laser > 0 && (
        <g>
          <line x1={238} y1={142} x2={238 + 1600 * laser} y2={142 + 260 * laser} stroke="#ff3b2f" strokeWidth={6} filter={`url(#${id}-glow)`} opacity={0.6} />
          <line x1={238} y1={142} x2={238 + 1600 * laser} y2={142 + 260 * laser} stroke="#ff6b5c" strokeWidth={1.6} />
          <circle cx={238} cy={142} r={5} fill="#ff4b3e" filter={`url(#${id}-glow)`} />
        </g>
      )}
    </svg>
  );
};
