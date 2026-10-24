import React from "react";
import { fonts } from "../../channels/backlit/look";
import { Halo } from "../../channels/backlit/parts";
import { Stander } from "../doubt/circles";

// 《ENTP · 抬杠》's image: a boxing ring between two people; he knocks his
// opponents down one by one, and the seats round the ring empty one by one;
// in the end he climbs down, sits in an empty seat, face to face with the
// other person.

export const MAT = 600; // the ring's canvas
export const RING = { x0: 560, x1: 1360 };
export const GOLD = "255, 199, 122";
export const COLD = "170, 200, 230";
export const RED = "255, 77, 109";

export const Ring: React.FC<{ glow?: number; opacity?: number }> = ({ glow = 1, opacity = 1 }) => {
  const { x0, x1 } = RING;
  const bx0 = x0 + 70, bx1 = x1 - 70, back = MAT - 70;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity }}>
      {/* mat and apron */}
      <path d={`M${x0} ${MAT} L${bx0} ${back} L${bx1} ${back} L${x1} ${MAT} Z`} fill="#1c1a20" />
      <rect x={x0 - 20} y={MAT} width={x1 - x0 + 40} height={70} fill="#141218" stroke={`rgba(${GOLD},${0.3 * glow})`} strokeWidth={1.5} />
      {/* posts */}
      {[[x0, MAT], [x1, MAT], [bx0, back], [bx1, back]].map(([x, y], i) => (
        <rect key={i} x={x - 7} y={y - 190} width={14} height={190} fill={i % 2 ? `rgba(${COLD},0.6)` : `rgba(${RED},0.75)`} />
      ))}
      {/* ropes: back, then front */}
      {[0, 1, 2].map((k) => (
        <g key={k}>
          <line x1={bx0} y1={back - 60 - k * 50} x2={bx1} y2={back - 60 - k * 50} stroke="rgba(232,238,242,0.35)" strokeWidth={3} />
          <line x1={x0} y1={MAT - 60 - k * 50} x2={bx0} y2={back - 60 - k * 50} stroke="rgba(232,238,242,0.35)" strokeWidth={3} />
          <line x1={x1} y1={MAT - 60 - k * 50} x2={bx1} y2={back - 60 - k * 50} stroke="rgba(232,238,242,0.35)" strokeWidth={3} />
        </g>
      ))}
    </svg>
  );
};
export const FrontRopes: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity }}>
    {[0, 1, 2].map((k) => (
      <line key={k} x1={RING.x0} y1={MAT - 60 - k * 50} x2={RING.x1} y2={MAT - 60 - k * 50} stroke={`rgba(${k === 1 ? RED : "232,238,242"},0.7)`} strokeWidth={4} />
    ))}
  </svg>
);

// him, on the mat; `punch` 0 → 1 throws a straight right at `target` x
export const Boxer: React.FC<{ x: number; bottom?: number; punch?: number; reach?: number; glow?: number; height?: number }> = ({ x, bottom = MAT, punch = 0, reach = 150, glow = 0.9, height = 250 }) => {
  const sh = { x: x + 14, y: bottom - height * 0.7 };
  const p = Math.sin(Math.min(1, punch) * Math.PI);
  const hx = sh.x + 40 + reach * p, hy = sh.y + 30 - 10 * p;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Stander x={x} bottom={bottom} height={height} lift={1.5} glow={glow} rgb={GOLD} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <line x1={sh.x} y1={sh.y} x2={hx} y2={hy} stroke="#030405" strokeWidth={14} strokeLinecap="round" />
        <circle cx={hx} cy={hy} r={18} fill={`rgb(${RED})`} stroke={`rgba(${GOLD},0.8)`} strokeWidth={2} />
      </svg>
    </div>
  );
};

// an opponent: `fall` 0 → 1 goes down backwards, flat on the mat
export const Opponent: React.FC<{ x: number; bottom?: number; fall?: number; height?: number; opacity?: number }> = ({ x, bottom = MAT, fall = 0, height = 240, opacity = 1 }) => (
  <div style={{ position: "absolute", inset: 0, transformOrigin: `${x}px ${bottom}px`, transform: `rotate(${86 * Math.pow(Math.min(1, fall), 1.6)}deg)`, opacity }}>
    <Stander x={x} bottom={bottom} height={height} lift={1} glow={0.5} rgb={COLD} />
  </div>
);

// the word that lands with a punch
export const Hit: React.FC<{ x: number; y: number; text: string; k: number }> = ({ x, y, text, k }) =>
  k <= 0 || k >= 1 ? null : (
    <div style={{ position: "absolute", left: x - 160, width: 320, top: y - 30, textAlign: "center", fontSize: 40, fontWeight: 900, color: `rgb(${RED})`, opacity: 1 - k, transform: `scale(${1.4 - 0.4 * Math.min(1, k * 4)}) rotate(-6deg)`, textShadow: `0 0 18px rgba(${RED},0.9)` }}>{text}</div>
  );

// the seats round the ring: two blocks of eight, two rows each
export const SEATS = [...[130, 235, 340, 445].flatMap((x) => [{ x, y: 700 }, { x: x + 40, y: 800 }]), ...[1475, 1580, 1685, 1790].flatMap((x) => [{ x, y: 700 }, { x: x - 40, y: 800 }])];
export const Seats: React.FC<{ occupied?: (i: number) => number; glow?: number }> = ({ occupied = () => 1, glow = 0.5 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
    {SEATS.map((s, i) => {
      const o = Math.max(0, Math.min(1, occupied(i)));
      return (
        <g key={i}>
          <rect x={s.x - 32} y={s.y - 70} width={64} height={70} rx={6} fill="#141218" stroke={`rgba(${GOLD},0.25)`} strokeWidth={1.5} />
          <rect x={s.x - 38} y={s.y - 8} width={76} height={10} rx={3} fill="#1c1a20" />
          {o > 0 && (
            <g opacity={o}>
              <path d={`M${s.x - 26} ${s.y - 8} Q${s.x - 26} ${s.y - 64} ${s.x} ${s.y - 66} Q${s.x + 26} ${s.y - 64} ${s.x + 26} ${s.y - 8} Z`} fill="#030405" stroke={`rgba(${COLD},${0.4 + 0.4 * glow})`} strokeWidth={1.5} />
              <circle cx={s.x} cy={s.y - 86} r={18} fill="#030405" stroke={`rgba(${COLD},${0.4 + 0.4 * glow})`} strokeWidth={1.5} />
            </g>
          )}
        </g>
      );
    })}
  </svg>
);

export const Counter: React.FC<{ x: number; y: number; label: string; value: string | number; color?: string }> = ({ x, y, label, value, color = `rgb(${GOLD})` }) => (
  <div style={{ position: "absolute", left: x, top: y, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 4, color: "rgba(232,238,242,0.55)" }}>
    {label} <span style={{ color, fontSize: 40 }}>{value}</span>
  </div>
);

export const RingLight: React.FC<{ k?: number }> = ({ k = 1 }) => <Halo x={960} y={MAT - 120} r={520} intensity={0.55 * k} rgb={GOLD} />;
