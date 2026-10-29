import React from "react";
import { random } from "remotion";
import { fonts, palette } from "../../channels/backlit/look";

// 《容貌焦虑》's images: a face on a phone screen being smoothed, brightened,
// slimmed layer by layer until it is a smooth plaster statue (the original
// video's plaster head); the same face in a mirror, with its texture — pores,
// freckles, a mole, a spot, fine lines; at the end the screen goes dark and
// only the mirror is left.

// the artificial colour: the beauty app's pink
export const FILTER = "#ff7eb3";
export const FILTER_RGB = "255, 126, 179";

// ---------- colour helpers ----------
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mixHex = (a: string, b: string, t: number) => {
  const [x, y] = [hex(a), hex(b)];
  const k = Math.max(0, Math.min(1, t));
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * k)).join(",")})`;
};
// real → filtered → plaster
const tone = (real: string, bright: string, plaster: string, b: number, s: number) => {
  const mid = mixHex(real, bright, b);
  const [r, g, bl] = mid.slice(4, -1).split(",").map(Number);
  const p = hex(plaster);
  const k = Math.max(0, Math.min(1, s));
  return `rgb(${[r, g, bl].map((v, i) => Math.round(v + (p[i] - v) * k)).join(",")})`;
};

// ---------- texture: placed once ----------
const inCheeks = (x: number, y: number) => ((x - 150) / 48) ** 2 + ((y - 292) / 40) ** 2 < 1 || ((x - 250) / 48) ** 2 + ((y - 292) / 40) ** 2 < 1;
const inNose = (x: number, y: number) => ((x - 200) / 20) ** 2 + ((y - 280) / 26) ** 2 < 1;
const inForehead = (x: number, y: number) => ((x - 200) / 70) ** 2 + ((y - 148) / 30) ** 2 < 1;
const PORES = (() => {
  const out: { x: number; y: number; r: number }[] = [];
  for (let i = 0; out.length < 170 && i < 3000; i++) {
    const x = 105 + random(`px-${i}`) * 190, y = 110 + random(`py-${i}`) * 270;
    if (inCheeks(x, y) || inNose(x, y) || inForehead(x, y)) out.push({ x, y, r: 0.6 + random(`pr-${i}`) * 0.5 });
  }
  return out;
})();
const FRECKLES = Array.from({ length: 18 }, (_, i) => {
  const side = i % 3 === 0 ? 0 : i % 3 === 1 ? -1 : 1;
  const cx = side === 0 ? 200 : 200 + side * 52;
  return { x: cx + (random(`fx-${i}`) - 0.5) * (side === 0 ? 26 : 50), y: 264 + (random(`fy-${i}`) - 0.5) * 28, r: 1.1 + random(`fr-${i}`) * 0.9 };
});
const SPOTS = [
  { x: 262, y: 332, r: 4.5 },
  { x: 150, y: 172, r: 3.4 },
];
const MOLE = { x: 238, y: 356 };

export type FaceProps = {
  x: number; // centre
  y: number;
  size?: number; // height in px of the whole portrait (420 × 520 box)
  id: string; // unique per instance (gradient ids)
  smooth?: number; // 0 → 1: the skin texture is smoothed away
  bright?: number; // 0 → 1: whiter, pinker, glossier (the filter)
  slim?: number; // 0 → 1: a narrower jaw, a pointier chin
  eyes?: number; // 0 → 1: eyes enlarged
  statue?: number; // 0 → 1: turns into a smooth plaster statue (blank eyes)
  smile?: number; // -1 (crying) … 0 … 1 (laughing)
  tear?: number; // 0 → 1: a tear running down
  gaze?: number; // 0 forward → 1 looking down
  age?: number; // 0 → 1: deeper lines
  tired?: number; // 0 → 1: dark circles
  pimple?: number; // 0 → 1: a new spot on the forehead
  rim?: number; // backlight rim on the outline
  opacity?: number;
  style?: React.CSSProperties;
};

export const Face: React.FC<FaceProps> = ({
  x,
  y,
  size = 420,
  id,
  smooth = 0,
  bright = 0,
  slim = 0,
  eyes = 0,
  statue = 0,
  smile = 0,
  tear = 0,
  gaze = 0,
  age = 0,
  tired = 0,
  pimple = 0,
  rim = 0.7,
  opacity = 1,
  style,
}) => {
  const k = size / 520;
  const tex = Math.max(0, 1 - smooth) * (1 - statue);
  const b = bright, s = statue;
  const skinL = tone("#e2b393", "#fff4ee", "#f2efe9", b, s);
  const skinM = tone("#bf8b6c", "#f7dccd", "#d3cdc3", b, s);
  const skinD = tone("#9a6a52", "#e6bca6", "#8f897f", b, s);
  const hair = tone("#15100d", "#1c1414", "#cfc9bf", b * 0.3, s);
  const hairRim = tone("#4a3428", "#6a4a46", "#f2efe9", b, s);
  const brow = tone("#3b2519", "#4a3030", "#a7a196", b * 0.4, s);
  const lips = tone("#a8565b", "#e46f86", "#c9c3b8", b, s);
  const lipsD = tone("#6f3236", "#b8475e", "#9d978c", b, s);
  const iris = tone("#4b2e20", "#2e2024", "#ddd8cf", b * 0.6, s);
  const white = tone("#efe8e2", "#ffffff", "#e6e1d8", b, s);
  const neck = tone("#9a6c53", "#ecc7b4", "#b9b3a9", b, s);
  // geometry
  const jx = 78 - 22 * slim;
  const cy = 404 + 16 * slim;
  const cw = 34 - 17 * slim;
  const FACE = `M200 92 C258 92 291 132 291 200 C291 262 ${200 + jx + 16} 300 ${200 + jx} 338 C${200 + jx - 14} 378 ${200 + cw} ${cy} 200 ${cy} C${200 - cw} ${cy} ${200 - jx + 14} 378 ${200 - jx} 338 C${200 - jx - 16} 300 109 262 109 200 C109 132 142 92 200 92 Z`;
  const es = 1 + 0.3 * eyes;
  const sm = Math.max(0, smile), cr = Math.max(0, -smile);
  const squint = sm * 0.45;
  const lid = gaze * 0.35;
  const eye = (cx: number, side: -1 | 1) => {
    const h = 12 * (1 - squint) * (1 - lid * 0.6);
    const top = `M${-26} 0 C${-14} ${-h - 4} ${14} ${-h - 4} ${26} 0`;
    const shape = `${top} C${14} ${10 - squint * 6} ${-14} ${10 - squint * 6} ${-26} 0 Z`;
    return (
      <g transform={`translate(${cx} 232) scale(${es * side} ${es})`}>
        <defs>
          <clipPath id={`${id}-eye${side}`}>
            <path d={shape} />
          </clipPath>
        </defs>
        <path d={shape} fill={white} />
        <g clipPath={`url(#${id}-eye${side})`}>
          <circle cx={side * 0} cy={-1 + gaze * 5} r={11} fill={iris} />
          <circle cx={0} cy={-1 + gaze * 5} r={4.6} fill={tone("#120a07", "#120a0c", "#ddd8cf", 0, s)} />
          {s < 0.5 && <circle cx={3.5 * side} cy={-5 + gaze * 5} r={2.6} fill="#fff" opacity={(1 - s * 2) * (0.85 + 0.15 * b)} />}
          {/* the upper lid's shadow, lowered when looking down */}
          <rect x={-30} y={-24} width={60} height={12 + lid * 26} fill={skinM} opacity={lid > 0.02 ? 1 : 0} />
        </g>
        <path d={top} fill="none" stroke={tone("#24140d", "#2a1416", "#9d978c", 0, s)} strokeWidth={3.2 - s * 1.6} strokeLinecap="round" transform={`translate(0 ${lid * 9})`} />
        <path d={`M-22 3 C-10 ${9 - squint * 8} 10 ${9 - squint * 8} 22 3`} fill="none" stroke={skinD} strokeWidth={1.2} opacity={0.6} />
      </g>
    );
  };
  // mouth: corners up when smiling, down when crying; open when laughing
  const mw = 32 + 8 * sm;
  const cyM = 356;
  const corner = -9 * sm + 7 * cr;
  const open = Math.max(0, sm - 0.5) * 2 * 12;
  const upper = `M${200 - mw} ${cyM + corner} C${200 - 16} ${cyM - 9} ${200 - 6} ${cyM - 10} 200 ${cyM - 6} C${200 + 6} ${cyM - 10} ${200 + 16} ${cyM - 9} ${200 + mw} ${cyM + corner} C${200 + 14} ${cyM + 2 - corner * 0.2} ${200 - 14} ${cyM + 2 - corner * 0.2} ${200 - mw} ${cyM + corner} Z`;
  const lower = `M${200 - mw} ${cyM + corner} C${200 - 14} ${cyM + 2 + open} ${200 + 14} ${cyM + 2 + open} ${200 + mw} ${cyM + corner} C${200 + 18} ${cyM + 16 + open} ${200 - 18} ${cyM + 16 + open} ${200 - mw} ${cyM + corner} Z`;
  const lines = Math.min(1, tex * (0.45 + 0.75 * age));
  return (
    <svg width={400 * k} height={520 * k} viewBox="0 0 400 520" style={{ position: "absolute", left: x - 200 * k, top: y - 260 * k, overflow: "visible", opacity, ...style }}>
      <defs>
        <radialGradient id={`${id}-skin`} cx="0.42" cy="0.38" r="0.8">
          <stop offset="0" stopColor={skinL} />
          <stop offset="0.6" stopColor={skinM} />
          <stop offset="1" stopColor={skinD} />
        </radialGradient>
        <radialGradient id={`${id}-gloss`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-plaster`} x1="0.85" y1="0.1" x2="0.1" y2="0.9">
          <stop offset="0" stopColor="#f2efe9" />
          <stop offset="0.55" stopColor="#c9c4bb" />
          <stop offset="1" stopColor="#6f6a62" />
        </linearGradient>
        <filter id={`${id}-soft`}>
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <clipPath id={`${id}-face`}>
          <path d={FACE} />
        </clipPath>
      </defs>
      {/* hair, behind */}
      <path d="M200 40 C294 40 340 108 340 206 C340 284 334 344 320 394 L80 394 C66 344 60 284 60 206 C60 108 106 40 200 40 Z" fill={hair} stroke={hairRim} strokeWidth={2} />
      <g fill="none" stroke={hairRim} strokeWidth={1.4} opacity={0.45} strokeLinecap="round">
        <path d="M92 150 C78 220 80 300 92 380" />
        <path d="M308 150 C322 220 320 300 308 380" />
        <path d="M76 230 C72 290 76 340 84 388" />
        <path d="M324 230 C328 290 324 340 316 388" />
      </g>
      {/* shoulders, neck */}
      <path d="M58 520 C70 468 122 446 172 442 L228 442 C278 446 330 468 342 520 Z" fill={tone("#0d1117", "#1a1420", "#bdb7ad", 0, s)} stroke={`rgba(${palette.halo},${0.5 * rim})`} strokeWidth={2} />
      <path d="M170 372 L170 448 C184 458 216 458 230 448 L230 372 Z" fill={neck} />
      {/* ears */}
      <path d="M114 222 C94 214 88 250 96 270 C101 283 112 286 118 278 Z" fill={skinM} />
      <path d="M286 222 C306 214 312 250 304 270 C299 283 288 286 282 278 Z" fill={skinM} />
      {/* the face */}
      <path d={FACE} fill={`url(#${id}-skin)`} />
      {s > 0.01 && <path d={FACE} fill={`url(#${id}-plaster)`} opacity={s * 0.55} />}
      <g clipPath={`url(#${id}-face)`}>
        {/* cheek colour: a natural flush → the filter's pink blush */}
        <ellipse cx={146} cy={300} rx={34} ry={20} fill={b > 0.3 ? FILTER : "#c0605a"} opacity={(0.18 + 0.12 * b) * (1 - s)} filter={`url(#${id}-soft)`} />
        <ellipse cx={254} cy={300} rx={34} ry={20} fill={b > 0.3 ? FILTER : "#c0605a"} opacity={(0.18 + 0.12 * b) * (1 - s)} filter={`url(#${id}-soft)`} />
        {/* the jaw's shadow */}
        <path d={`M${200 - jx} 338 C${200 - jx + 14} 378 ${200 - cw} ${cy} 200 ${cy} C${200 + cw} ${cy} ${200 + jx - 14} 378 ${200 + jx} 338`} fill="none" stroke={skinD} strokeWidth={22} opacity={0.18 * (1 - b * 0.7)} filter={`url(#${id}-soft)`} />
        {/* ---- texture ---- */}
        {tex > 0.01 && (
          <g opacity={tex}>
            <ellipse cx={200} cy={292} rx={30} ry={16} fill="#b8524a" opacity={0.18} filter={`url(#${id}-soft)`} />
            {PORES.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#5c3020" opacity={0.16} />
            ))}
            {FRECKLES.map((f, i) => (
              <circle key={i} cx={f.x} cy={f.y} r={f.r} fill="#8a4a2c" opacity={0.32} />
            ))}
            {SPOTS.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={p.r + 3} fill="#c0504a" opacity={0.35} filter={`url(#${id}-soft)`} />
                <circle cx={p.x} cy={p.y} r={p.r} fill="#b9443f" opacity={0.6} />
                <circle cx={p.x - 1} cy={p.y - 1} r={p.r * 0.35} fill="#f2c2a8" opacity={0.7} />
              </g>
            ))}
            <circle cx={MOLE.x} cy={MOLE.y} r={3.2} fill="#3a2117" />
            {/* the under-eye shadows */}
            <ellipse cx={158} cy={256} rx={22} ry={7} fill="#5a3445" opacity={0.08 + 0.45 * tired} filter={`url(#${id}-soft)`} />
            <ellipse cx={242} cy={256} rx={22} ry={7} fill="#5a3445" opacity={0.08 + 0.45 * tired} filter={`url(#${id}-soft)`} />
          </g>
        )}
        {lines > 0.01 && (
          <g fill="none" stroke="#5c3424" strokeLinecap="round" opacity={lines}>
            {/* forehead */}
            <path d="M150 150 C176 144 224 144 250 150" strokeWidth={1.1 + 0.9 * age} opacity={0.3 + 0.7 * age} />
            <path d="M158 164 C182 159 218 159 242 164" strokeWidth={1 + 0.9 * age} opacity={0.2 + 0.75 * age} />
            {age > 0.3 && <path d="M146 130 C176 124 224 124 254 130" strokeWidth={1 + age} opacity={age} />}
            {/* crow's feet */}
            {[-1, 1].map((sd) => (
              <g key={sd} opacity={0.3 + 0.7 * age}>
                <path d={`M${200 + sd * 72} 226 l${sd * 12} -5`} strokeWidth={1.2} />
                <path d={`M${200 + sd * 72} 234 l${sd * 13} 1`} strokeWidth={1.2} />
                <path d={`M${200 + sd * 71} 241 l${sd * 11} 6`} strokeWidth={1.2} />
                {/* under the eye */}
                <path d={`M${200 + sd * 22} 250 C${200 + sd * 34} 258 ${200 + sd * 56} 258 ${200 + sd * 66} 249`} strokeWidth={1 + 0.6 * age} opacity={0.5 + 0.4 * tired} />
                {/* nose to mouth */}
                <path d={`M${200 + sd * 25} 306 C${200 + sd * 34} 318 ${200 + sd * 38} 330 ${200 + sd * 38} 342`} strokeWidth={1.1 + 0.7 * age} opacity={0.35 + 0.4 * age} />
              </g>
            ))}
          </g>
        )}
        {/* a new spot, for 会长痘 */}
        {pimple > 0.01 && (
          <g opacity={pimple}>
            <circle cx={232} cy={168} r={9} fill="#c0504a" opacity={0.4} filter={`url(#${id}-soft)`} />
            <circle cx={232} cy={168} r={5.5} fill="#bf4440" />
            <circle cx={231} cy={166.5} r={2} fill="#f6cdb3" />
          </g>
        )}
        {/* the filter's gloss on the forehead, nose, cheekbones */}
        {b > 0.01 && (
          <g opacity={b * (1 - s * 0.6)}>
            <ellipse cx={186} cy={150} rx={44} ry={22} fill={`url(#${id}-gloss)`} />
            <ellipse cx={200} cy={274} rx={7} ry={24} fill={`url(#${id}-gloss)`} />
            <ellipse cx={140} cy={268} rx={22} ry={12} fill={`url(#${id}-gloss)`} />
            <ellipse cx={260} cy={268} rx={22} ry={12} fill={`url(#${id}-gloss)`} />
          </g>
        )}
      </g>
      {/* brows: inner ends up when crying */}
      <path d={`M130 ${200 - cr * 2} C146 ${188 - cr * 2} 168 ${184 - cr * 10} 186 ${192 - cr * 12}`} fill="none" stroke={brow} strokeWidth={6 - s * 2} strokeLinecap="round" />
      <path d={`M270 ${200 - cr * 2} C254 ${188 - cr * 2} 232 ${184 - cr * 10} 214 ${192 - cr * 12}`} fill="none" stroke={brow} strokeWidth={6 - s * 2} strokeLinecap="round" />
      {eye(158, 1)}
      {eye(242, -1)}
      {/* nose */}
      <path d="M194 236 C192 260 186 278 184 292" fill="none" stroke={skinD} strokeWidth={1.6} opacity={0.4} />
      <path d="M180 298 C186 310 214 310 220 298" fill="none" stroke={skinD} strokeWidth={2.2} opacity={0.75} />
      <path d="M186 300 C188 304 192 305 194 303" fill="none" stroke={tone("#4a2a1e", "#8a5a50", "#8f897f", b, s)} strokeWidth={2.4} />
      <path d="M214 300 C212 304 208 305 206 303" fill="none" stroke={tone("#4a2a1e", "#8a5a50", "#8f897f", b, s)} strokeWidth={2.4} />
      {/* mouth */}
      <path d={lower} fill={lips} />
      {open > 0.5 && <path d={`M${200 - mw + 8} ${cyM + corner * 0.7 + 1} C${200 - 12} ${cyM + 1} ${200 + 12} ${cyM + 1} ${200 + mw - 8} ${cyM + corner * 0.7 + 1} L${200 + mw - 14} ${cyM + open * 0.6} C${200 + 10} ${cyM + open * 0.75} ${200 - 10} ${cyM + open * 0.75} ${200 - mw + 14} ${cyM + open * 0.6} Z`} fill="#f4efe8" />}
      <path d={upper} fill={lips} />
      <path d={`M${200 - mw} ${cyM + corner} C${200 - 14} ${cyM + 2 - corner * 0.2} ${200 + 14} ${cyM + 2 - corner * 0.2} ${200 + mw} ${cyM + corner}`} fill="none" stroke={lipsD} strokeWidth={1.6} />
      {/* a tear */}
      {tear > 0.01 && tear < 0.99 && (
        <path d={`M${146 - tear * 4} ${248 + tear * 80} q-5 10 0 14 q5 -4 0 -14 Z`} fill="rgba(200,230,255,0.85)" stroke="rgba(255,255,255,0.9)" strokeWidth={1} />
      )}
      {tear > 0.05 && <path d={`M150 248 C148 ${248 + tear * 40} 146 ${248 + tear * 60} ${146 - tear * 4} ${248 + tear * 80}`} fill="none" stroke="rgba(200,230,255,0.45)" strokeWidth={2.4} />}
      {/* fringe */}
      <path d="M108 196 C104 120 148 84 202 84 C256 84 296 116 294 182 C276 150 240 128 204 134 C166 130 128 154 108 196 Z" fill={hair} stroke={hairRim} strokeWidth={1.5} />
      <g fill="none" stroke={hairRim} strokeWidth={1.3} opacity={0.5} strokeLinecap="round">
        <path d="M150 96 C136 112 124 140 118 176" />
        <path d="M196 88 C176 100 160 118 150 140" />
        <path d="M232 92 C252 104 272 128 284 160" />
      </g>
      {/* the backlight on the outline */}
      <path d={FACE} fill="none" stroke={`rgba(${palette.halo},${0.55 * rim * (1 - s * 0.5)})`} strokeWidth={2} />
    </svg>
  );
};

// ---------- the phone ----------
// `on` 1 → 0 switches the screen off like an old tube: the picture squeezes to
// a bright line, the line to a dot, then black.
export const Phone: React.FC<{ x: number; y: number; w?: number; h?: number; on?: number; glow?: number; rot?: number; opacity?: number; time?: string; children?: React.ReactNode }> = ({
  x,
  y,
  w = 320,
  h = 640,
  on = 1,
  glow = 1,
  rot = 0,
  opacity = 1,
  time = "23:47",
  children,
}) => {
  const r = w * 0.13;
  const sy = on >= 0.4 ? Math.max(0.004, (on - 0.4) / 0.6) : 0.004;
  const lineW = on >= 0.4 ? 1 : on >= 0.12 ? (on - 0.12) / 0.28 : 0;
  const dot = on < 0.12 ? on / 0.12 : 0;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `rotate(${rot}deg)`, opacity }}>
      <div style={{ position: "absolute", left: -w * 0.5, top: -h * 0.2, width: w * 2, height: h * 1.4, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(200,220,255,${0.22 * glow * on}) 0%, transparent 65%)` }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: r, background: "linear-gradient(160deg, #1b2230, #07090d)", border: `2px solid rgba(${palette.accentRgb},${0.25 + 0.3 * on})`, boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }} />
      <div style={{ position: "absolute", left: -4, top: h * 0.2, width: 4, height: h * 0.08, borderRadius: 2, background: "#2a3242" }} />
      <div style={{ position: "absolute", right: -4, top: h * 0.26, width: 4, height: h * 0.12, borderRadius: 2, background: "#2a3242" }} />
      <div style={{ position: "absolute", left: 10, top: 10, right: 10, bottom: 10, borderRadius: r - 8, overflow: "hidden", background: "#000" }}>
        {on > 0.12 && (
          <div style={{ position: "absolute", inset: 0, transform: `scale(${lineW}, ${sy})`, filter: on < 0.6 ? `brightness(${1 + (0.6 - on) * 6})` : undefined }}>
            {children}
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 40, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 26px", fontFamily: fonts.mono, fontSize: 14, color: "rgba(255,255,255,0.85)" }}>
              <span>{time}</span>
              <span style={{ letterSpacing: 2 }}>5G ▮▮▮</span>
            </div>
          </div>
        )}
        {dot > 0 && <div style={{ position: "absolute", left: "50%", top: "50%", width: 10, height: 10, marginLeft: -5, marginTop: -5, borderRadius: 5, background: "#fff", opacity: dot, boxShadow: "0 0 16px #fff" }} />}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(118deg, transparent 38%, rgba(255,255,255,0.07) 47%, transparent 56%)" }} />
        <div style={{ position: "absolute", left: "50%", top: 12, width: w * 0.28, height: 24, marginLeft: -w * 0.14, borderRadius: 12, background: "#000" }} />
      </div>
    </div>
  );
};

// ---------- the mirror ----------
export const MirrorGlass: React.FC<{ x: number; y: number; w?: number; h?: number; light?: number; opacity?: number; children?: React.ReactNode }> = ({ x, y, w = 400, h = 540, light = 0.5, opacity = 1, children }) => (
  <div style={{ position: "absolute", left: x - w / 2 - 16, top: y - h / 2 - 16, width: w + 32, height: h + 32, opacity }}>
    <div style={{ position: "absolute", left: -w * 0.3, top: -h * 0.2, width: w * 1.6 + 32, height: h * 1.4 + 32, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(${palette.halo},${0.2 * light}) 0%, transparent 65%)` }} />
    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(150deg, #c9a66b, #6b5236 45%, #a88654 70%, #4a3826)", boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }} />
    <div style={{ position: "absolute", inset: 16, borderRadius: "50%", overflow: "hidden", background: "radial-gradient(ellipse at 40% 35%, #26313c, #0b1016 75%)" }}>
      {children}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 45% 40%, rgba(${palette.halo},${0.16 * light}), transparent 70%)`, mixBlendMode: "screen" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(125deg, transparent 30%, rgba(255,255,255,0.1) 40%, transparent 48%)" }} />
    </div>
    <div style={{ position: "absolute", inset: 14, borderRadius: "50%", border: "2px solid rgba(255,230,180,0.35)" }} />
  </div>
);

// ---------- the beauty app's sliders ----------
export const Sliders: React.FC<{ x: number; y: number; w?: number; values: [string, number][]; opacity?: number }> = ({ x, y, w = 280, values, opacity = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, opacity, padding: "14px 18px", borderRadius: 16, background: "rgba(10,10,16,0.72)", border: `1px solid rgba(${FILTER_RGB},0.35)` }}>
    {values.map(([label, v]) => (
      <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, height: 34 }}>
        <span style={{ width: 44, fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.88)" }}>{label}</span>
        <div style={{ position: "relative", flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.18)" }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${v * 100}%`, borderRadius: 2, background: FILTER, boxShadow: v > 0 ? `0 0 8px ${FILTER}` : undefined }} />
          <div style={{ position: "absolute", left: `calc(${v * 100}% - 8px)`, top: -6, width: 16, height: 16, borderRadius: 8, background: "#fff" }} />
        </div>
        <span style={{ width: 34, textAlign: "right", fontFamily: fonts.mono, fontSize: 15, color: v > 0 ? FILTER : "rgba(255,255,255,0.5)" }}>{Math.round(v * 100)}</span>
      </div>
    ))}
  </div>
);

// Someone else, head and shoulders: a plain little figure (a real person in a
// photo, a passer-by). `tone` varies the skin, `hair` the hair.
export const Friend: React.FC<{ x: number; y: number; s?: number; tone?: number; hair?: number; opacity?: number }> = ({ x, y, s = 1, tone: t = 0, hair = 0, opacity = 1 }) => (
  <svg width={70 * s} height={90 * s} viewBox="0 0 70 90" style={{ position: "absolute", left: x - 35 * s, top: y - 45 * s, opacity }}>
    <path d="M4 90 C6 66 20 58 35 58 C50 58 64 66 66 90 Z" fill={["#2a3240", "#3a2c2c", "#26352e"][t % 3]} />
    <circle cx={35} cy={34} r={20} fill={["#c99b7d", "#a87458", "#e0b89a", "#8a5c44"][t % 4]} />
    {hair % 3 === 0 && <path d="M15 32 C15 12 55 12 55 32 C50 22 22 20 15 32 Z" fill="#1a1410" />}
    {hair % 3 === 1 && <path d="M13 40 C10 10 60 10 57 40 C57 26 50 20 35 20 C20 20 14 26 13 40 Z" fill="#3a2a1e" />}
    {hair % 3 === 2 && <path d="M17 26 C20 14 50 14 53 26 C46 22 24 22 17 26 Z" fill="#6a6560" />}
  </svg>
);

// Hearts floating up from (x, y): `n` of them, each rising over `life` frames.
export const Hearts: React.FC<{ x: number; y: number; frame: number; start: number; n: number; every?: number; life?: number; spread?: number }> = ({ x, y, frame, start, n, every = 3, life = 40, spread = 120 }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const t = (frame - start - i * every) / life;
      if (t < 0 || t > 1) return null;
      const dx = (random(`hx-${i}`) - 0.5) * spread + Math.sin(t * 6 + i) * 10;
      return (
        <div key={i} style={{ position: "absolute", left: x + dx, top: y - t * 260, fontSize: 22 + random(`hs-${i}`) * 18, color: FILTER, opacity: Math.min(1, (1 - t) * 2), transform: `scale(${0.6 + Math.min(1, t * 5) * 0.5})`, textShadow: `0 0 10px rgba(${FILTER_RGB},0.8)` }}>
          ♥
        </div>
      );
    })}
  </>
);
