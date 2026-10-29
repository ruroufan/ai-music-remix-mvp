import React from "react";
import { random } from "remotion";
import { Halo } from "../../channels/backlit/parts";

// 《ESFP · 热闹》's image: a performer centre stage, the crowd below roaring.
// The lights go out, the crowd drains away, and he sits alone on the steps.
// Someone walks over and hands him a piece of bread; the two of them sit down
// at a small table in a garden.

export const GOLD = "255, 200, 90"; // the stage lights, him
export const PINK = "255, 120, 170"; // party
export const LEAF = "140, 200, 130"; // the garden
export const WARM = "255, 205, 150"; // the friend, lamplight
export const STAGE = 640; // stage floor
export const FRONT = 1080; // bottom of the frame — the crowd stands below the stage

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// The stage: a deck, a back curtain, and a spotlight cone onto centre stage.
// `lights` 0 → 1 is how lit it is; `spot` the spotlight.
export const Stage: React.FC<{ lights: number; spot?: number; frame: number }> = ({ lights, spot = lights, frame }) => {
  const l = clamp01(lights);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="esfp-curtain" x1="0" y1="0" x2="1" y2="0">
            {Array.from({ length: 12 }, (_, i) => (
              <stop key={i} offset={i / 11} stopColor={i % 2 ? `rgb(${60 + 50 * l},${16 + 10 * l},${30 + 14 * l})` : `rgb(${40 + 34 * l},${10 + 6 * l},${20 + 10 * l})`} />
            ))}
          </linearGradient>
        </defs>
        <rect x={180} y={80} width={1560} height={STAGE - 80} fill="url(#esfp-curtain)" />
        <rect x={120} y={STAGE} width={1680} height={40} fill={`rgb(${40 + 40 * l},${30 + 30 * l},${26 + 22 * l})`} />
        <rect x={120} y={STAGE + 40} width={1680} height={30} fill="#110e0e" />
        {/* the steps down from the stage, centre front */}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={820 - i * 30} y={STAGE + 70 + i * 34} width={280 + i * 60} height={34} fill={`rgb(${30 + 10 * i},${26 + 8 * i},${24 + 8 * i})`} stroke="rgba(232,238,242,0.12)" strokeWidth={1} />
        ))}
        {spot > 0 && <path d={`M900 0 L1020 0 L1180 ${STAGE} L740 ${STAGE} Z`} fill={`rgba(${GOLD},${0.12 * spot})`} />}
        {spot > 0 && <ellipse cx={960} cy={STAGE + 4} rx={230} ry={22} fill={`rgba(${GOLD},${0.35 * spot})`} />}
      </svg>
      {l > 0 && (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: l }}>
          {Array.from({ length: 8 }, (_, i) => {
            const on = 0.4 + 0.6 * Math.abs(Math.sin(frame / 6 + i));
            return <circle key={i} cx={260 + i * 200} cy={60} r={14} fill={`rgba(${i % 2 ? PINK : GOLD},${on})`} />;
          })}
        </svg>
      )}
      <Halo x={960} y={STAGE - 200} r={420} intensity={0.6 * spot} rgb={GOLD} />
    </div>
  );
};

// The crowd: rows of heads and raised arms below the stage. `cheer` 0 → 1
// sets how wildly they wave; `left` 0 → 1 is how many have gone home.
export const Crowd: React.FC<{ frame: number; cheer?: number; left?: number; n?: number }> = ({ frame, cheer = 1, left = 0, n = 26 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: n }, (_, i) => {
      const gone = random(`g${i}`) < left;
      if (gone) return null;
      const row = i % 2;
      const x = 60 + (i / n) * 1800 + row * 40 + random(`x${i}`) * 30;
      const y = FRONT - 40 - row * 70;
      const bob = Math.abs(Math.sin(frame / 5 + i * 1.7)) * 16 * cheer;
      const up = random(`u${i}`) < 0.6 * cheer + 0.1;
      const wave = Math.sin(frame / 4 + i) * 14 * cheer;
      const glow = row ? "rgba(232,238,242,0.25)" : `rgba(${GOLD},0.5)`;
      return (
        <g key={i} transform={`translate(${x} ${y - bob})`}>
          {up && <line x1={-18} y1={-40} x2={-30 + wave} y2={-120} stroke="#050608" strokeWidth={12} strokeLinecap="round" />}
          {up && random(`l${i}`) < 0.35 && <circle cx={-30 + wave} cy={-128} r={8} fill={`rgba(${i % 3 ? GOLD : PINK},${0.6 + 0.4 * cheer})`} />}
          <path d="M-46 60 Q-46 -10 0 -10 Q46 -10 46 60 Z" fill="#050608" stroke={glow} strokeWidth={1.5} />
          <circle cx={0} cy={-40} r={28} fill="#050608" stroke={glow} strokeWidth={1.5} />
        </g>
      );
    })}
  </svg>
);

// A smile — the mask he wears. A plain arc of a grin on a round face plate.
export const Mask: React.FC<{ x: number; y: number; r?: number; k?: number; tear?: number; sad?: number }> = ({ x, y, r = 40, k = 1, tear = 0, sad = 0 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: k, overflow: "visible" }}>
    <circle cx={x} cy={y} r={r} fill={`rgba(${GOLD},0.92)`} stroke="#fff3c4" strokeWidth={2} />
    <circle cx={x - r * 0.35} cy={y - r * 0.2} r={r * 0.09} fill="#3a2a10" />
    <circle cx={x + r * 0.35} cy={y - r * 0.2} r={r * 0.09} fill="#3a2a10" />
    <path d={`M${x - r * 0.5} ${y + r * 0.2} Q${x} ${y + r * (0.75 - 1.2 * sad)} ${x + r * 0.5} ${y + r * 0.2}`} fill="none" stroke="#3a2a10" strokeWidth={r * 0.1} strokeLinecap="round" />
    {tear > 0 && <path d={`M${x + r * 0.35} ${y - r * 0.05 + tear * r * 0.9} q${r * 0.08} ${r * 0.14} 0 ${r * 0.2} q${-r * 0.08} ${-r * 0.06} 0 ${-r * 0.2}`} fill="rgba(170,215,255,0.95)" opacity={Math.min(1, tear * 3)} />}
  </svg>
);

// A small round loaf.
export const Bread: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-34 10 Q-38 -26 0 -28 Q38 -26 34 10 Z" fill="#c98a46" stroke="#f3cf96" strokeWidth={2} />
      <path d="M-16 -16 l8 10 M0 -20 l8 10 M14 -16 l8 10" stroke="#8a5420" strokeWidth={3} strokeLinecap="round" />
    </g>
  </svg>
);

// The garden at night: a trellis with leaves, a lantern, a small round table
// with bread, water and a little pot of cheese.
export const GARDEN_FLOOR = 880;
export const Garden: React.FC<{ k: number; frame: number; lamp?: number }> = ({ k, frame, lamp = 1 }) => (
  <div style={{ position: "absolute", inset: 0, opacity: k }}>
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <rect x={0} y={GARDEN_FLOOR} width={1920} height={200} fill="#0f140f" />
      <line x1={0} y1={GARDEN_FLOOR} x2={1920} y2={GARDEN_FLOOR} stroke={`rgba(${LEAF},0.3)`} strokeWidth={2} />
      <path d={`M560 ${GARDEN_FLOOR} L560 200 Q960 60 1360 200 L1360 ${GARDEN_FLOOR}`} fill="none" stroke="rgba(120,96,70,0.8)" strokeWidth={10} />
      {Array.from({ length: 28 }, (_, i) => {
        const t = i / 27;
        const x = 560 + 800 * t;
        const y = 200 - Math.sin(t * Math.PI) * 120 + 10 + Math.sin(frame / 20 + i) * 3;
        return <ellipse key={i} cx={x + (random(`lx${i}`) - 0.5) * 40} cy={y + random(`ly${i}`) * 40} rx={18} ry={9} transform={`rotate(${random(`lr${i}`) * 180} ${x} ${y})`} fill={`rgba(${LEAF},${0.35 + 0.35 * random(`la${i}`)})`} />;
      })}
      {/* the table */}
      <ellipse cx={960} cy={700} rx={190} ry={26} fill="#3a2c20" stroke={`rgba(${WARM},0.5)`} strokeWidth={2} />
      <rect x={950} y={724} width={20} height={GARDEN_FLOOR - 724} fill="#2a2018" />
      <path d={`M900 ${GARDEN_FLOOR} L1020 ${GARDEN_FLOOR}`} stroke="#2a2018" strokeWidth={10} />
      <rect x={1010} y={652} width={26} height={44} rx={4} fill="rgba(180,215,240,0.4)" stroke="rgba(220,235,245,0.7)" strokeWidth={2} />
      <path d="M1060 696 L1064 670 L1094 670 L1098 696 Z" fill="#d8cfbf" stroke="#fff6e0" strokeWidth={2} />
      {/* the lantern */}
      <line x1={960} y1={140} x2={960} y2={300} stroke="rgba(160,140,120,0.7)" strokeWidth={3} />
      <rect x={940} y={300} width={40} height={54} rx={8} fill={`rgba(${WARM},${0.4 + 0.5 * lamp})`} stroke="#8a6a4a" strokeWidth={3} />
    </svg>
    <Bread x={920} y={694} s={0.9} />
    <Halo x={960} y={330} r={420} intensity={0.55 * lamp} rgb={WARM} />
  </div>
);

export { clamp01 };
