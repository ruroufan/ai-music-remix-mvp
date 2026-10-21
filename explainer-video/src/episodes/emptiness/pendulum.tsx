import React from "react";
import { fonts, palette } from "../../channels/backlit/look";
import { Halo } from "../../channels/backlit/parts";

// 《空虚》's image: a huge pendulum, a man sitting on its bob, swinging between
// 痛苦 (pain) and 无聊 (boredom). In the end he jumps off — and lands at a desk
// with a lamp lit and a book open.

export const PIVOT = { x: 960, y: 70 };
export const ROD = 600;
export const PAIN = "255, 77, 109";
export const BORE = "150, 170, 190";
export const WARM = "255, 199, 122";
export const BRASS = "201, 164, 106";

const rad = (d: number) => (d * Math.PI) / 180;
// where the bob is at angle `deg` (positive: swung to the right)
export const bobAt = (deg: number, pivot = PIVOT, rod = ROD) => ({ x: pivot.x + Math.sin(rad(deg)) * rod, y: pivot.y + Math.cos(rad(deg)) * rod });
// the swing: extremes on every downbeat, through the middle on beat 3
export const swing = (frame: number, bar: number, amp: number, phase = 0) => amp * Math.cos((Math.PI * frame) / bar + phase);

// The rider, in the bob's own frame: (0, 0) is the bob's centre, up is the rod.
export const Rider: React.FC<{ glow?: number; slump?: number; rgb?: string }> = ({ glow = 0.8, slump = 0, rgb = palette.halo }) => (
  <g fill="#030405" stroke={`rgba(${rgb},${0.4 + 0.55 * glow})`} strokeWidth={2} strokeLinejoin="round">
    {/* legs over the front of the bob */}
    <path d="M-6 -66 L40 -66 Q50 -66 50 -56 L52 0 L38 0 L36 -52 L-6 -50 Z" />
    {/* body leaning on the rod */}
    <g transform={`rotate(${-slump * 14} 0 -60)`}>
      <path d="M-26 -62 Q-30 -120 -6 -134 Q18 -140 22 -112 L20 -60 Z" />
      <circle cx={-2 + slump * 6} cy={-162 + slump * 8} r={24} />
      {/* an arm round the rod */}
      <path d="M12 -122 L4 -150" strokeWidth={2} />
      <rect x={-6} y={-156} width={14} height={40} rx={7} transform="rotate(-20 0 -136)" />
    </g>
  </g>
);

// The whole machine. `deg` the rod's angle; `rider` draws him on the bob;
// `pain`/`bore` 0 → 1 light up each end; `amp` how far the dashed arc runs.
export const Pendulum: React.FC<{ deg: number; rider?: boolean; riderGlow?: number; slump?: number; pain?: number; bore?: number; amp?: number; ends?: number; opacity?: number; trail?: number; pivot?: { x: number; y: number }; rod?: number; labels?: boolean }> = ({
  deg,
  rider = true,
  riderGlow = 0.8,
  slump = 0,
  pain = 0,
  bore = 0,
  amp = 50,
  ends = 1,
  opacity = 1,
  trail = 0,
  pivot = PIVOT,
  rod = ROD,
  labels = true,
}) => {
  const b = bobAt(deg, pivot, rod);
  const L = bobAt(-amp - 6, pivot, rod), R = bobAt(amp + 6, pivot, rod);
  const arc = `M${L.x} ${L.y} A${rod} ${rod} 0 0 0 ${R.x} ${R.y}`;
  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {/* the two ends */}
      <Halo x={L.x - 30} y={L.y} r={260} intensity={(0.15 + 0.7 * pain) * ends} rgb={PAIN} />
      <Halo x={R.x + 30} y={R.y} r={260} intensity={(0.1 + 0.5 * bore) * ends} rgb={BORE} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <path d={arc} fill="none" stroke="rgba(232,238,242,0.18)" strokeWidth={2} strokeDasharray="6 10" />
        {/* motion trail: faint ghost rods behind the swing */}
        {Math.abs(trail) > 0.2 &&
          [2, 4, 6].map((k, i) => {
            const g = bobAt(deg - trail * k, pivot, rod);
            return <line key={k} x1={pivot.x} y1={pivot.y} x2={g.x} y2={g.y} stroke={`rgba(${BRASS},${0.18 - i * 0.05})`} strokeWidth={6} strokeLinecap="round" />;
          })}
        <line x1={pivot.x} y1={pivot.y} x2={b.x} y2={b.y} stroke={`rgb(${BRASS})`} strokeWidth={8} strokeLinecap="round" />
        <line x1={pivot.x} y1={pivot.y} x2={b.x} y2={b.y} stroke="rgba(255,240,210,0.5)" strokeWidth={2} strokeLinecap="round" />
        {/* the housing at the top */}
        <circle cx={pivot.x} cy={pivot.y} r={34} fill="#141a24" stroke={`rgba(${BRASS},0.8)`} strokeWidth={3} />
        <circle cx={pivot.x} cy={pivot.y} r={8} fill={`rgb(${BRASS})`} />
        <rect x={pivot.x - 160} y={pivot.y - 70} width={320} height={26} rx={6} fill="#141a24" stroke={palette.faint} strokeWidth={2} />
        {/* the bob */}
        <defs>
          <radialGradient id="em-bob" cx="0.35" cy="0.35">
            <stop offset="0" stopColor="#f3dcae" />
            <stop offset="0.5" stopColor={`rgb(${BRASS})`} />
            <stop offset="1" stopColor="#5a4426" />
          </radialGradient>
        </defs>
        <g transform={`translate(${b.x} ${b.y}) rotate(${-deg})`}>
          <circle r={70} fill="url(#em-bob)" stroke="rgba(255,240,210,0.6)" strokeWidth={2} />
          <circle r={50} fill="none" stroke="rgba(90,68,38,0.6)" strokeWidth={2} />
          {rider && (
            <g transform="translate(0 -66)">
              <Rider glow={riderGlow} slump={slump} />
            </g>
          )}
        </g>
      </svg>
      {labels && (
        <>
          <div style={{ position: "absolute", left: L.x - 240, top: L.y - 40, width: 180, textAlign: "right", opacity: ends }}>
            <div style={{ fontSize: 56, fontWeight: 900, color: `rgba(${PAIN},${0.55 + 0.45 * pain})`, textShadow: pain > 0.2 ? `0 0 ${20 * pain}px rgba(${PAIN},0.9)` : undefined }}>痛苦</div>
            <div style={{ fontFamily: fonts.mono, fontSize: 18, letterSpacing: 4, color: palette.dim }}>PAIN</div>
          </div>
          <div style={{ position: "absolute", left: R.x + 60, top: R.y - 40, width: 180, opacity: ends }}>
            <div style={{ fontSize: 56, fontWeight: 900, color: `rgba(${BORE},${0.55 + 0.45 * bore})`, textShadow: bore > 0.2 ? `0 0 ${20 * bore}px rgba(${BORE},0.9)` : undefined }}>无聊</div>
            <div style={{ fontFamily: fonts.mono, fontSize: 18, letterSpacing: 4, color: palette.dim }}>BOREDOM</div>
          </div>
        </>
      )}
    </div>
  );
};

// The desk at the end: a lamp (on 0 → 1), an open book, a bowl with a little
// steam, a chair. `x` is the desk's left edge, `floor` the floor line.
export const Desk: React.FC<{ x: number; floor: number; on?: number; frame: number; opacity?: number }> = ({ x, floor, on = 1, frame, opacity = 1 }) => {
  const top = floor - 200;
  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      <Halo x={x + 230} y={top - 40} r={420} intensity={0.9 * on} rgb={WARM} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {/* the lamp's light on the desk */}
        <path d={`M${x + 330} ${top - 170} L${x + 120} ${top} L${x + 470} ${top} Z`} fill={`rgba(${WARM},${0.22 * on})`} />
        {/* desk */}
        <rect x={x} y={top} width={520} height={18} rx={4} fill="#2a2118" stroke={`rgba(${WARM},${0.3 + 0.4 * on})`} strokeWidth={1.5} />
        <rect x={x + 20} y={top + 18} width={14} height={182} fill="#1b1410" />
        <rect x={x + 486} y={top + 18} width={14} height={182} fill="#1b1410" />
        {/* lamp */}
        <path d={`M${x + 420} ${top} L${x + 420} ${top - 120} L${x + 350} ${top - 170}`} fill="none" stroke="#3a3428" strokeWidth={8} strokeLinecap="round" />
        <path d={`M${x + 300} ${top - 180} L${x + 370} ${top - 200} L${x + 380} ${top - 160} Z`} fill="#3a3428" />
        <circle cx={x + 336} cy={top - 168} r={9} fill={on > 0.05 ? `rgba(255,236,190,${on})` : "#2a2118"} style={{ filter: on > 0.05 ? `drop-shadow(0 0 ${16 * on}px rgba(${WARM},1))` : undefined }} />
        <rect x={x + 390} y={top - 8} width={60} height={8} rx={3} fill="#3a3428" />
        {/* open book */}
        <path d={`M${x + 160} ${top - 4} Q${x + 210} ${top - 22} ${x + 260} ${top - 6} Q${x + 310} ${top - 22} ${x + 360} ${top - 4} L${x + 360} ${top} L${x + 160} ${top} Z`} fill="#e8e2d4" opacity={0.6 + 0.4 * on} />
        <line x1={x + 260} y1={top - 6} x2={x + 260} y2={top} stroke="#8a7a60" strokeWidth={1.5} />
        {/* a bowl, with steam */}
        <path d={`M${x + 50} ${top - 30} Q${x + 90} ${top + 4} ${x + 130} ${top - 30} Z`} fill="#d9d2c4" />
        {[0, 1].map((k) => (
          <path key={k} d={`M${x + 80 + k * 20} ${top - 36} q${6 * Math.sin(frame / 10 + k)} -14 0 -28 q${-6 * Math.sin(frame / 10 + k)} -14 0 -28`} fill="none" stroke={`rgba(232,238,242,${0.25 * on})`} strokeWidth={2} strokeLinecap="round" />
        ))}
      </svg>
    </div>
  );
};
