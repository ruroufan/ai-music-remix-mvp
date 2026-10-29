import React from "react";
import { random } from "remotion";
import { Halo } from "../../channels/backlit/parts";

// 《ESTP · 停不下来》's image: a man on a motorbike tearing down a highway,
// and behind him a dark mass of shadow that never falls back. He brakes; the
// shadow catches up — and it's his own silhouette. At the end he sits in an
// empty room, side by side with it.

export const FLAME = "255, 150, 70"; // him, the bike's light
export const SHADE = "150, 130, 210"; // the shadow
export const DAWN = "255, 215, 160"; // the room's window light
export const ROAD = 760; // the road surface

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// The highway, side-on: the road, a scrolling centre line, posts and far
// hills passing. `dist` is how far we've travelled (px), so speed is in the
// caller's hands.
export const Highway: React.FC<{ dist: number; opacity?: number; blur?: number }> = ({ dist, opacity = 1, blur = 0 }) => {
  const mod = (v: number, m: number) => ((v % m) + m) % m;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity }}>
      <defs>
        <linearGradient id="estp-road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1c22" />
          <stop offset="1" stopColor="#0b0c10" />
        </linearGradient>
      </defs>
      {/* far hills, slow */}
      <path d={Array.from({ length: 14 }, (_, i) => {
        const x = i * 180 - mod(dist * 0.08, 180);
        return `${i ? "L" : "M"}${x} ${560 - 60 * random(`h${(i + Math.floor(dist * 0.08 / 180)) % 40}`)}`;
      }).join(" ") + " L2400 760 L-200 760 Z"} fill="rgba(30,30,44,0.8)" />
      <rect x={0} y={ROAD} width={1920} height={1080 - ROAD} fill="url(#estp-road)" />
      <line x1={0} y1={ROAD} x2={1920} y2={ROAD} stroke="rgba(232,238,242,0.35)" strokeWidth={3} />
      {Array.from({ length: 9 }, (_, i) => {
        const x = mod(i * 260 - dist, 2340) - 200;
        return <rect key={i} x={x} y={ROAD + 70} width={140 + blur * 120} height={8} fill="rgba(232,238,242,0.45)" />;
      })}
      {Array.from({ length: 6 }, (_, i) => {
        const x = mod(i * 420 - dist * 1.2, 2520) - 300;
        return <rect key={`p${i}`} x={x} y={ROAD - 150} width={10 + blur * 40} height={150} fill="rgba(232,238,242,0.18)" />;
      })}
      {blur > 0 &&
        Array.from({ length: 10 }, (_, i) => {
          const x = mod(random(`sl${i}`) * 1920 - dist * 2, 2200) - 200;
          const y = 260 + random(`sy${i}`) * 440;
          return <line key={`s${i}`} x1={x} y1={y} x2={x + 200 * blur} y2={y} stroke={`rgba(232,238,242,${0.18 * blur})`} strokeWidth={2} />;
        })}
    </svg>
  );
};

// The bike and its rider, facing right. (x, ROAD) is the ground between the
// wheels. `spin` turns the wheels; `ghost` draws it as the shadow's
// silhouette instead (no light, a violet rim); `lean` tips the rider forward.
export const Moto: React.FC<{ x: number; spin?: number; scale?: number; ghost?: number; light?: number; frame?: number; lean?: number; opacity?: number }> = ({ x, spin = 0, scale = 1, ghost = 0, light = 1, frame = 0, lean = 1, opacity = 1 }) => {
  const s = scale;
  const rim = ghost > 0.5 ? SHADE : FLAME;
  const fill = ghost > 0.5 ? "rgba(16,12,28,0.92)" : "#030405";
  const wheel = (cx: number) => (
    <g>
      <circle cx={cx} cy={-46} r={46} fill={fill} stroke={`rgba(${rim},0.85)`} strokeWidth={3} />
      <circle cx={cx} cy={-46} r={10} fill={`rgba(${rim},0.6)`} />
      {[0, 1, 2].map((k) => {
        const a = spin + (k * Math.PI) / 3;
        return <line key={k} x1={cx + Math.cos(a) * 40} y1={-46 + Math.sin(a) * 40} x2={cx - Math.cos(a) * 40} y2={-46 - Math.sin(a) * 40} stroke={`rgba(${rim},0.35)`} strokeWidth={2} />;
      })}
    </g>
  );
  const fl = 0.7 + 0.3 * Math.sin(frame * 1.7);
  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {ghost < 0.5 && light > 0 && <Halo x={x + 220 * s} y={ROAD - 110 * s} r={260 * s} intensity={0.5 * light} rgb={FLAME} />}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g transform={`translate(${x} ${ROAD}) scale(${s})`}>
          {ghost < 0.5 && light > 0 && <path d="M105 -118 L520 -190 L520 -40 Z" fill={`rgba(${DAWN},${0.12 * light})`} />}
          {ghost < 0.5 && light > 0 && <path d={`M-118 -64 L${-150 - 40 * fl} -70 L-118 -76 Z`} fill={`rgba(${FLAME},${0.8 * light})`} />}
          {wheel(-95)}
          {wheel(95)}
          <g fill={fill} stroke={`rgba(${rim},0.85)`} strokeWidth={2.5} strokeLinejoin="round">
            {/* frame, tank, seat, fork */}
            <path d="M-95 -46 L-40 -96 L60 -100 L95 -46 L70 -46 L40 -70 L-30 -66 Z" />
            <path d="M-60 -108 L-10 -112 Q30 -140 66 -118 L60 -100 L-50 -96 Z" />
            <path d="M60 -110 L104 -150 L112 -144 L72 -104 Z" />
            <path d="M-118 -70 L-60 -72 L-58 -62 L-118 -60 Z" />
            {/* rider: leg, torso (leaning), arm, helmet */}
            <path d="M-24 -112 L20 -74 L4 -46 L16 -42 L36 -76 L-6 -118 Z" />
            <g transform={`rotate(${(1 - lean) * -30} -30 -112)`}>
              <path d="M-44 -108 Q-50 -150 -10 -188 L22 -178 Q4 -140 -6 -106 Z" />
              <path d="M2 -176 L70 -150 L102 -150 L102 -140 L66 -138 L-2 -160 Z" />
              <circle cx={14} cy={-206} r={26} />
              <path d="M22 -212 L42 -206 L40 -196 L24 -196 Z" fill={`rgba(${rim},0.6)`} stroke="none" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};

// The shadow: a churning dark mass with a violet rim, sitting on the road at
// x. `reveal` 0 → 1 thins it out (the silhouette is drawn by the caller).
export const Shadow: React.FC<{ x: number; frame: number; k?: number; reveal?: number; scale?: number }> = ({ x, frame, k = 1, reveal = 0, scale = 1 }) => {
  const s = scale * (1 - 0.3 * reveal);
  const o = k * (1 - reveal);
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <Halo x={x} y={ROAD - 140 * s} r={300 * s} intensity={0.45} rgb={SHADE} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {Array.from({ length: 11 }, (_, i) => {
          const a = (i / 11) * Math.PI * 2;
          const w = Math.sin(frame / 7 + i * 1.3);
          const cx = x + Math.cos(a) * 80 * s + w * 14;
          const cy = ROAD - 140 * s + Math.sin(a) * 70 * s + Math.cos(frame / 9 + i) * 10;
          return <circle key={i} cx={cx} cy={Math.min(cy, ROAD - 40 * s)} r={(60 + 25 * random(`r${i}`)) * s} fill="rgba(12,9,22,0.85)" stroke={`rgba(${SHADE},0.5)`} strokeWidth={2} />;
        })}
        <circle cx={x} cy={ROAD - 140 * s} r={90 * s} fill="rgba(8,6,16,0.95)" />
        {/* trailing wisps */}
        {Array.from({ length: 6 }, (_, i) => {
          const p = ((frame / 20 + i / 6) % 1);
          return <circle key={`w${i}`} cx={x - 120 * s - p * 260 * s} cy={ROAD - 120 * s - Math.sin(i * 2) * 60 * s} r={(30 - 18 * p) * s} fill={`rgba(${SHADE},${0.25 * (1 - p)})`} />;
        })}
        {/* two dim eyes */}
        <circle cx={x + 30 * s} cy={ROAD - 170 * s} r={5 * s} fill={`rgba(${SHADE},0.9)`} />
        <circle cx={x + 56 * s} cy={ROAD - 170 * s} r={5 * s} fill={`rgba(${SHADE},0.9)`} />
      </svg>
    </div>
  );
};

// The empty room: a back wall with a window, the floor, a shaft of light.
export const ROOM_FLOOR = 860;
export const Room: React.FC<{ k: number; light?: number }> = ({ k, light = 0.5 }) => (
  <div style={{ position: "absolute", inset: 0, opacity: k }}>
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <rect x={0} y={0} width={1920} height={1080} fill="#0c0d12" />
      <rect x={360} y={140} width={1200} height={560} fill="#15161d" stroke="rgba(232,238,242,0.1)" strokeWidth={2} />
      <path d="M0 1080 L360 700 L1560 700 L1920 1080 Z" fill="#101118" />
      <path d="M0 0 L360 140 M1920 0 L1560 140 M0 1080 L360 700 M1920 1080 L1560 700" stroke="rgba(232,238,242,0.1)" strokeWidth={2} />
      <rect x={1180} y={250} width={240} height={250} fill={`rgba(${DAWN},${0.25 + 0.5 * light})`} stroke="rgba(232,238,242,0.3)" strokeWidth={4} />
      <path d="M1300 250 L1300 500 M1180 375 L1420 375" stroke="#15161d" strokeWidth={8} />
      <path d={`M1180 500 L1420 500 L1180 ${ROOM_FLOOR + 140} L700 ${ROOM_FLOOR + 140} Z`} fill={`rgba(${DAWN},${0.06 + 0.12 * light})`} />
    </svg>
    <Halo x={1300} y={375} r={300} intensity={0.3 + 0.5 * light} rgb={DAWN} />
  </div>
);

// Someone sitting on the floor facing us, arms round their knees. `ghost`
// draws the shadow-self (violet, a little translucent).
export const Sitter: React.FC<{ x: number; bottom?: number; scale?: number; ghost?: number; glow?: number; rgb?: string }> = ({ x, bottom = ROOM_FLOOR, scale = 1.6, ghost = 0, glow = 0.5, rgb = FLAME }) => {
  const s = scale;
  const col = ghost > 0.5 ? SHADE : rgb;
  const fill = ghost > 0.5 ? "rgba(18,14,32,0.9)" : "#030405";
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Halo x={x} y={bottom - 120 * s} r={200 * s} intensity={glow} rgb={col} />
      <svg width={200 * s} height={240 * s} viewBox="0 0 200 240" style={{ position: "absolute", left: x - 100 * s, top: bottom - 240 * s, overflow: "visible" }}>
        <g fill={fill} stroke={`rgba(${col},${0.4 + 0.5 * glow})`} strokeWidth={1.8}>
          <path d="M58 92 Q100 76 142 92 L150 200 L50 200 Z" />
          <ellipse cx={72} cy={190} rx={32} ry={40} />
          <ellipse cx={128} cy={190} rx={32} ry={40} />
          <path d="M40 228 L96 228 L96 240 L36 240 Z M104 228 L160 228 L164 240 L104 240 Z" />
          <path d="M58 104 Q30 160 70 196 L80 186 Q52 156 70 110 Z M142 104 Q170 160 130 196 L120 186 Q148 156 130 110 Z" />
          <circle cx={100} cy={52} r={32} />
        </g>
      </svg>
    </div>
  );
};

export { clamp01 };
