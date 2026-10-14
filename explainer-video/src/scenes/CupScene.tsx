import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { Frame } from "../components/Frame";
import { Silhouette, Spotlight } from "../components/Figures";
import { Floor } from "../components/Stage";
import { Subtitles } from "../components/Subtitles";
import { Sfx } from "../components/Sfx";
import { useRamp, type SceneProps } from "../timing";

const FLOOR = 820;
const CUP = { x: 960, rim: 560 };

// A plaster goblet with a crack: light keeps pouring in and keeps leaking out.
const Goblet: React.FC<{ frame: number }> = ({ frame }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <linearGradient id="goblet" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#8d877e" />
        <stop offset="0.45" stopColor="#ece8e0" />
        <stop offset="1" stopColor="#9a948a" />
      </linearGradient>
    </defs>
    {/* pouring particles */}
    {Array.from({ length: 90 }, (_, i) => {
      const speed = 0.012 + random(`pour-s-${i}`) * 0.01;
      const t = (frame * speed + random(`pour-o-${i}`)) % 1;
      const x0 = CUP.x + (random(`pour-x-${i}`) - 0.5) * 520;
      const x = x0 + (CUP.x + (random(`pour-t-${i}`) - 0.5) * 120 - x0) * t;
      const y = -20 + (CUP.rim + 10) * t;
      return <circle key={i} cx={x} cy={y} r={1.4} fill={`rgba(239,233,223,${0.25 + 0.5 * t})`} />;
    })}
    <path
      d={`M${CUP.x - 110} ${CUP.rim} C ${CUP.x - 110} ${CUP.rim + 120}, ${CUP.x - 50} ${CUP.rim + 170}, ${CUP.x - 12} ${CUP.rim + 176} L ${CUP.x - 12} ${FLOOR - 16} L ${CUP.x - 70} ${FLOOR - 4} L ${CUP.x + 70} ${FLOOR - 4} L ${CUP.x + 12} ${FLOOR - 16} L ${CUP.x + 12} ${CUP.rim + 176} C ${CUP.x + 50} ${CUP.rim + 170}, ${CUP.x + 110} ${CUP.rim + 120}, ${CUP.x + 110} ${CUP.rim} Z`}
      fill="url(#goblet)"
      stroke="rgba(30,26,22,0.6)"
      strokeWidth={1.5}
    />
    <ellipse cx={CUP.x} cy={CUP.rim} rx={110} ry={18} fill="#1a1714" stroke="#d8d4cc" strokeWidth={2} />
    <path d={`M${CUP.x - 4} ${CUP.rim + 70} l8 18 l-10 16 l9 18 l-6 14`} fill="none" stroke="#2b2722" strokeWidth={2.4} />
    {/* leaking drips below the crack */}
    {Array.from({ length: 12 }, (_, i) => {
      const t = (frame * 0.02 + i / 12) % 1;
      return <circle key={`d${i}`} cx={CUP.x + 2 + Math.sin(i) * 4} cy={CUP.rim + 160 + t * (FLOOR - CUP.rim - 170)} r={1.8} fill={`rgba(239,233,223,${0.7 * (1 - t)})`} />;
    })}
  </svg>
);

const ROW = [360, 560, 760, 960, 1160, 1360, 1560];

// Lines 1–2: everyone wants to be put first by everyone else — impossible.
export const CupScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const cupOut = interpolate(frame, [cues[1] - 10, cues[1] + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const row = useRamp(cues[1], 18);
  const links = useRamp(cues[1] + 20, 30);
  const impossible = useRamp(cues[2] + 4, 24);

  return (
    <Frame duration={duration}>
      <div style={{ opacity: cupOut }}>
        <Floor y={FLOOR} />
        <Spotlight x={CUP.x} floor={FLOOR} width={560} intensity={0.7} />
        <Goblet frame={frame} />
      </div>

      <div style={{ position: "absolute", inset: 0, opacity: row }}>
        <Floor y={FLOOR} />
        {ROW.map((x) => (
          <Spotlight key={x} x={x} floor={FLOOR} width={190} intensity={0.55} />
        ))}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {ROW.slice(0, -1).map((x, i) => (
            <line
              key={x}
              x1={x}
              y1={FLOOR - 210}
              x2={x + 200 * links}
              y2={FLOOR - 210 + (i % 2 ? 6 : -6) * links}
              stroke={impossible > 0 ? `rgba(224,83,63,${0.3 + impossible * 0.5})` : "rgba(239,233,223,0.4)"}
              strokeWidth={1.5}
            />
          ))}
        </svg>
        {ROW.map((x, i) => {
          // Each one leans forward in turn, trying to get in front.
          const t = (frame - cues[1] - 20 - i * 6) / 30;
          const lean = t > 0 && t < 2 ? Math.sin(Math.min(t, 1) * Math.PI) * 0.08 : 0;
          return (
            <div key={x} style={{ position: "absolute", inset: 0, transform: `scale(${1 + lean})`, transformOrigin: `${x}px ${FLOOR}px` }}>
              <Silhouette x={x} bottom={FLOOR} height={220} opacity={i === 3 ? 1 - impossible * 0.6 : 1} />
            </div>
          );
        })}
      </div>

      <Sfx name="glint" at={10} volume={0.2} />
      <Sfx name="whoosh" at={cues[1]} volume={0.3} />
      <Sfx name="boom" at={cues[2] + 4} volume={0.45} />

      <Subtitles lines={lines} cues={cues} duration={duration} position={frame >= cues[2] ? "top" : "bottom"} />
    </Frame>
  );
};
