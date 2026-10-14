import React from "react";
import { random } from "remotion";
import { Frame } from "../Frame";
import { Bust } from "../../../components/Bust";
import { Floor } from "../../../components/Stage";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { theme } from "../../../theme";
import { useRamp, BEAT, HALF_BEAT, type SceneProps } from "../timing";

const FLOOR = 720;
const HEAD = { x: 900, y: 600 };

// Broken plaster: seeded polygons that drop onto the floor at the start.
const shards = Array.from({ length: 16 }, (_, i) => {
  const cx = 520 + random(`sh-x-${i}`) * 900;
  const cy = FLOOR + 30 + random(`sh-y-${i}`) * 300;
  const r = 18 + random(`sh-r-${i}`) * 46 * (cy > FLOOR + 150 ? 1.4 : 0.8);
  const pts = Array.from({ length: 5 }, (_, k) => {
    const a = (k / 5) * Math.PI * 2 + random(`sh-a-${i}-${k}`) * 0.8;
    const rr = r * (0.6 + random(`sh-rr-${i}-${k}`) * 0.5);
    return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr * 0.7).toFixed(1)}`;
  });
  return { pts: pts.join(" "), cy, delay: random(`sh-d-${i}`) * 14 };
});

// Line 0: the proud bust lies broken on the floor. Line 1: Rousseau's diagnosis
// lands on it as a beam of lines.
export const DiagnosisScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const fall = useRamp(0, BEAT);
  const quote = useRamp(cues[1], 18);
  const rays = useRamp(cues[1] + HALF_BEAT, BEAT);

  return (
    <Frame duration={duration}>
      <Floor y={FLOOR} color="#2a241d" />
      <div style={{ position: "absolute", left: 360, top: FLOOR - 120, width: 1200, height: 300, background: "radial-gradient(ellipse, rgba(255,214,160,0.18), transparent 70%)" }} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="shard" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c9c4bb" />
            <stop offset="1" stopColor="#6f6a62" />
          </linearGradient>
        </defs>
        {shards.map((s, i) => {
          const p = Math.min(1, Math.max(0, fall * 1.3 - s.delay / 30));
          return (
            <polygon
              key={i}
              points={s.pts}
              fill="url(#shard)"
              stroke="rgba(30,26,22,0.6)"
              transform={`translate(0 ${(1 - p) * -(s.cy - 520)})`}
              opacity={p}
            />
          );
        })}
        {Array.from({ length: 11 }, (_, i) => {
          const tx = 780 + i * 36;
          return (
            <line
              key={i}
              x1={HEAD.x}
              y1={HEAD.y - 60}
              x2={HEAD.x + (tx - HEAD.x) * rays}
              y2={HEAD.y - 60 + (330 - HEAD.y + 60) * rays}
              stroke="rgba(239,233,223,0.55)"
              strokeWidth={1.4}
            />
          );
        })}
      </svg>
      <Bust x={1000} y={630} scale={1.05} lying crack={1} fadeFrom={0.6} id="diag" />

      <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", opacity: quote, transform: `translateY(${(1 - quote) * 10}px)` }}>
        <div style={{ fontSize: 68, fontWeight: 700, letterSpacing: 4 }}>傲慢的人，最离不开别人。</div>
        <div style={{ fontSize: 26, fontStyle: "italic", color: theme.dim, marginTop: 18, fontFamily: "Georgia, serif", letterSpacing: 1 }}>
          Jean-Jacques Rousseau，1712—1778
        </div>
      </div>

      <Sfx name="boom" at={0} volume={0.45} />
      <Sfx name="shatter" at={0} volume={0.3} />
      <Sfx name="glint" at={cues[1] + HALF_BEAT} volume={0.3} />

      <Subtitles lines={lines} cues={cues} duration={duration} position="top" hide={[1]} />
    </Frame>
  );
};
