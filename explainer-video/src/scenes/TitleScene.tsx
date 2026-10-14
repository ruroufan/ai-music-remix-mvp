import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { Frame } from "../components/Frame";
import { Silhouette, Spotlight } from "../components/Figures";
import { ShatterTitle } from "../components/ShatterTitle";
import { Subtitles } from "../components/Subtitles";
import { brand } from "../theme";
import { useRamp, type SceneProps } from "../timing";

const TARGET = { x: 960, y: 300 };

// Rows of eyes on a perspective floor, every one staring at the figure.
const eyes = (() => {
  const out: { x: number; y: number; s: number; id: number }[] = [];
  let id = 0;
  for (let r = 0; r < 7; r++) {
    const t = r / 6;
    const y = 560 + Math.pow(t, 1.6) * 480;
    const s = 0.7 + t * 1.6;
    const n = 9 + r * 3;
    const spread = 500 + t * 1500;
    for (let i = 0; i < n; i++) {
      const jitter = (random(`eye-${r}-${i}`) - 0.5) * (spread / n);
      out.push({ x: 960 - spread / 2 + (i + 0.5) * (spread / n) + jitter, y, s, id: id++ });
    }
  }
  return out;
})();

const Eye: React.FC<{ x: number; y: number; s: number; open: number }> = ({ x, y, s, open }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={`M-14 0 Q0 ${-10 * open} 14 0 Q0 ${10 * open} -14 0 Z`} fill="#1c1a17" stroke="rgba(239,233,223,0.45)" strokeWidth={1.2} />
    <circle cx={0} cy={-1} r={3.6 * open} fill="rgba(239,233,223,0.85)" />
  </g>
);

export const TitleScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const gaze = useRamp(10, 50);
  const titleIn = useRamp(cues[1] + 20, 45);
  const sceneDim = interpolate(frame, [cues[1], cues[1] + 25], [1, 0.25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Frame duration={duration} showTopic={false}>
      <div style={{ position: "absolute", inset: 0, opacity: sceneDim }}>
        <Spotlight x={TARGET.x} floor={TARGET.y + 40} width={300} intensity={0.8} />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {eyes.map((e) => {
            const p = Math.min(1, Math.max(0, gaze * 1.4 - random(`g-${e.id}`) * 0.4));
            return (
              <line
                key={`l${e.id}`}
                x1={e.x}
                y1={e.y}
                x2={e.x + (TARGET.x - e.x) * p}
                y2={e.y + (TARGET.y - e.y) * p}
                stroke="rgba(217,184,120,0.16)"
                strokeWidth={1}
              />
            );
          })}
          {eyes.map((e) => (
            <Eye key={e.id} x={e.x} y={e.y} s={e.s} open={Math.min(1, gaze * 3)} />
          ))}
        </svg>
        <div style={{ position: "absolute", left: TARGET.x - 70, top: TARGET.y, width: 140, height: 40, background: "linear-gradient(#d8d4cc,#8d887f)" }} />
        <Silhouette x={TARGET.x} bottom={TARGET.y} height={200} />
      </div>

      <div style={{ position: "absolute", left: 580, top: 230, opacity: titleIn > 0 ? 1 : 0 }}>
        <ShatterTitle text={brand.topic} progress={titleIn} />
      </div>

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </Frame>
  );
};
