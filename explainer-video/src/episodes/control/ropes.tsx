import React from "react";
import { fonts, palette } from "../../channels/backlit/look";
import { Stander } from "../doubt/circles";

// 《控制欲》's image: a man gripping a fistful of ropes; at their other ends a
// clock, the weather, other people, his plans, results, fate — and he pulls
// them tighter and tighter. In the end he lets almost all of them go and keeps
// only the one tied to himself.

export const FLOOR = 760;
const ROPE = [217, 201, 162];
const TAUT = [255, 77, 109];
export const GOLD = "255, 199, 122";

export type Target = { id: string; label: string; x: number; y: number };
export const TARGETS: Target[] = [
  { id: "clock", label: "时间", x: 360, y: 250 },
  { id: "weather", label: "天气", x: 700, y: 150 },
  { id: "person", label: "别人", x: 1250, y: 170 },
  { id: "phone", label: "他的回复", x: 1580, y: 290 },
  { id: "plan", label: "计划", x: 330, y: 560 },
  { id: "dice", label: "命运", x: 1600, y: 590 },
];

const Icon: React.FC<{ id: string; frame: number }> = ({ id, frame }) => {
  const s = { stroke: "rgba(232,238,242,0.9)", strokeWidth: 3, fill: "rgba(14,20,28,0.9)" };
  switch (id) {
    case "clock":
      return (
        <g>
          <circle r={42} {...s} />
          <line x1={0} y1={0} x2={Math.cos(frame / 6) * 30} y2={Math.sin(frame / 6) * 30} stroke="#fff" strokeWidth={3} />
          <line x1={0} y1={0} x2={Math.cos(frame / 70) * 20} y2={Math.sin(frame / 70) * 20} stroke="#fff" strokeWidth={4} />
        </g>
      );
    case "weather":
      return (
        <g>
          <path d="M-46 14 Q-50 -16 -22 -18 Q-14 -42 10 -36 Q34 -46 42 -18 Q60 -10 50 14 Z" {...s} />
          {[-24, 0, 24].map((x, i) => (
            <line key={i} x1={x} y1={22 + ((frame * 3 + i * 9) % 20)} x2={x - 4} y2={32 + ((frame * 3 + i * 9) % 20)} stroke={`rgba(${palette.accentRgb},0.9)`} strokeWidth={3} />
          ))}
        </g>
      );
    case "person":
      return (
        <g>
          <circle cy={-30} r={18} {...s} />
          <path d="M-26 40 Q-26 -6 0 -8 Q26 -6 26 40 Z" {...s} />
        </g>
      );
    case "phone":
      return (
        <g>
          <rect x={-24} y={-40} width={48} height={80} rx={8} {...s} />
          <rect x={-14} y={-24} width={28} height={12} rx={4} fill="#3fbf6a" />
          <text x={0} y={18} textAnchor="middle" fontSize={16} fill="rgba(232,238,242,0.8)" fontFamily={fonts.mono}>…</text>
        </g>
      );
    case "plan":
      return (
        <g>
          <rect x={-40} y={-44} width={80} height={88} rx={6} {...s} />
          {[0, 1, 2, 3].map((k) => (
            <line key={k} x1={-26} y1={-24 + k * 18} x2={26} y2={-24 + k * 18} stroke="rgba(232,238,242,0.6)" strokeWidth={3} />
          ))}
        </g>
      );
    default:
      return (
        <g transform={`rotate(${Math.sin(frame / 8) * 12})`}>
          <rect x={-34} y={-34} width={68} height={68} rx={10} {...s} />
          {[[-16, -16], [16, 16], [16, -16], [-16, 16], [0, 0]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={5} fill="#fff" />
          ))}
        </g>
      );
  }
};

// The man and his ropes. `tension` 0 → 1 pulls them all straight and red,
// shaking; `free(i)` 0 → 1 lets rope i go (it drops, its thing drifts away);
// `self` 0 → 1 lights the one rope that runs to himself; `clench` reddens his
// fists; `only` limits which targets are drawn.
export const Grip: React.FC<{ frame: number; x?: number; h?: number; tension?: number; free?: (i: number) => number; self?: number; clench?: number; lift?: number; only?: string[]; showSelf?: boolean }> = ({
  frame,
  x = 960,
  h = 320,
  tension = 0.3,
  free = () => 0,
  self = 0,
  clench = 0,
  lift = 0.6,
  only,
  showSelf = true,
}) => {
  const shoulderY = FLOOR - h * 0.72;
  const hands = [
    { x: x - 70 - 20 * tension, y: FLOOR - h * 0.6 },
    { x: x + 70 + 20 * tension, y: FLOOR - h * 0.6 },
  ];
  const col = (t: number) => `rgb(${ROPE.map((v, i) => Math.round(v + (TAUT[i] - v) * t)).join(",")})`;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {TARGETS.map((tg, i) => {
          if (only && !only.includes(tg.id)) return null;
          const f = Math.max(0, Math.min(1, free(i)));
          const hand = hands[tg.x < x ? 0 : 1];
          const shake = tension > 0.6 ? Math.sin(frame * 3.1 + i * 2) * 5 * (tension - 0.6) * 2.5 : 0;
          const hx = hand.x + (tg.x < x ? -1 : 1) * 60 * f;
          const hy = hand.y + 320 * f * f;
          const tx = tg.x + (tg.x - x) * 0.4 * f, ty = tg.y - 120 * f;
          const sag = 110 * (1 - tension) + 160 * f;
          const mx = (hx + tx) / 2 + shake, my = (hy + ty) / 2 + sag + shake;
          return (
            <g key={tg.id} opacity={1 - f * 0.85}>
              <path d={`M${hx} ${hy} Q${mx} ${my} ${tx} ${ty}`} fill="none" stroke={col(tension * (1 - f))} strokeWidth={3 + 2 * tension} strokeLinecap="round" style={{ filter: tension > 0.7 && f < 0.5 ? `drop-shadow(0 0 6px rgba(255,77,109,${tension - 0.5}))` : undefined }} />
              <g transform={`translate(${tx + shake * 0.6} ${ty}) scale(${1 - 0.4 * f})`}>
                <Icon id={tg.id} frame={frame} />
              </g>
              <text x={tx} y={ty + 72} textAnchor="middle" fontSize={26} fontWeight={800} fill="rgba(232,238,242,0.85)">{tg.label}</text>
            </g>
          );
        })}
      </svg>
      <Stander x={x} bottom={FLOOR} height={h} lift={lift} glow={0.8} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {/* arms and fists */}
        {hands.map((hd, k) => (
          <g key={k}>
            <line x1={x + (k ? 26 : -26)} y1={shoulderY} x2={hd.x} y2={hd.y} stroke="#030405" strokeWidth={14} strokeLinecap="round" />
            <line x1={x + (k ? 26 : -26)} y1={shoulderY} x2={hd.x} y2={hd.y} stroke={`rgba(${palette.halo},0.6)`} strokeWidth={1.5} strokeLinecap="round" />
            <circle cx={hd.x} cy={hd.y} r={13} fill={clench > 0.05 ? `rgba(255,77,109,${0.3 + 0.6 * clench})` : "#030405"} stroke={`rgba(${palette.halo},0.8)`} strokeWidth={1.5} style={{ filter: clench > 0.3 ? `drop-shadow(0 0 ${10 * clench}px rgba(255,77,109,0.9))` : undefined }} />
          </g>
        ))}
        {/* the one rope that's his own: from his hand to his own waist */}
        {showSelf && (
          <path d={`M${hands[1].x} ${hands[1].y} C${hands[1].x + 40} ${hands[1].y + 70} ${x + 40} ${FLOOR - h * 0.4} ${x + 6} ${FLOOR - h * 0.42}`} fill="none" stroke={self > 0.05 ? `rgba(${GOLD},${0.6 + 0.4 * self})` : col(0.1)} strokeWidth={3 + 3 * self} strokeLinecap="round" style={{ filter: self > 0.05 ? `drop-shadow(0 0 ${12 * self}px rgba(${GOLD},0.9))` : undefined }} />
        )}
      </svg>
    </div>
  );
};
