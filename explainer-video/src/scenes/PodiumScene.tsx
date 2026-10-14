import React from "react";
import { Frame } from "../components/Frame";
import { Silhouette, Spotlight } from "../components/Figures";
import { Subtitles } from "../components/Subtitles";
import { Sfx } from "../components/Sfx";
import { theme } from "../theme";
import { useRamp, type SceneProps } from "../timing";

const FLOOR = 900;
const CROWD = [380, 620, 1300, 1540];

export const PodiumScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const crowd = useRamp(0, 20);
  const rise = useRamp(cues[1], 40);       // "是比别人好" — the pedestal grows
  const gaze = useRamp(cues[1] + 25, 30);  // everyone looks up at them
  const label = useRamp(cues[2] + 10, 20); // "优越感" burns onto the pedestal

  const pedestalH = 30 + rise * 190;
  const top = FLOOR - pedestalH;
  const head = { x: 960, y: top - 230 };

  return (
    <Frame duration={duration}>
      <div style={{ position: "absolute", left: 0, top: FLOOR, width: 1920, height: 180, background: "linear-gradient(#1b1915, #0b0a09)" }} />
      <Spotlight x={960} floor={top + 10} width={460} intensity={0.6 + rise * 0.6} />

      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {CROWD.map((x) => {
          const from = { x, y: FLOOR - 225 };
          return (
            <line
              key={x}
              x1={from.x}
              y1={from.y}
              x2={from.x + (head.x - from.x) * gaze}
              y2={from.y + (head.y - from.y) * gaze}
              stroke="rgba(239,233,223,0.55)"
              strokeWidth={2}
              strokeDasharray="6 8"
            />
          );
        })}
      </svg>

      {CROWD.map((x, i) => (
        <Silhouette key={x} x={x} bottom={FLOOR} height={240} opacity={crowd * (0.55 + (i % 2) * 0.15)} rim="rgba(239,233,223,0.35)" />
      ))}

      <div
        style={{
          position: "absolute",
          left: 960 - 130,
          top,
          width: 260,
          height: pedestalH,
          background: "linear-gradient(#ece8e0, #a9a39a)",
          boxShadow: "0 0 60px rgba(255,240,215,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <span
          style={{
            fontSize: 64,
            fontWeight: 900,
            letterSpacing: 6,
            color: theme.accent,
            opacity: label,
            textShadow: `0 0 ${8 + label * 16}px rgba(224,83,63,0.8)`,
          }}
        >
          优越感
        </span>
      </div>
      <Silhouette x={960} bottom={top} height={260} />

      <Sfx name="rise" at={cues[1]} volume={0.55} />
      <Sfx name="boom" at={cues[2] + 10} volume={0.7} />

      <Subtitles lines={lines} cues={cues} duration={duration} position="top" />
    </Frame>
  );
};
