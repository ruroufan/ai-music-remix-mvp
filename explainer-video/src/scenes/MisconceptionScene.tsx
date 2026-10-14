import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { Frame } from "../components/Frame";
import { Spotlight } from "../components/Figures";
import { Bust } from "../components/Bust";
import { GazeField } from "../components/Stage";
import { Subtitles } from "../components/Subtitles";
import { Sfx } from "../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const SCALE = 0.95;

const Stars: React.FC = () => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: 70 }, (_, i) => (
      <circle key={i} cx={random(`st-x-${i}`) * 1920} cy={random(`st-y-${i}`) * 1080} r={0.6 + random(`st-r-${i}`) * 1.2} fill={`rgba(239,233,223,${0.15 + random(`st-o-${i}`) * 0.35})`} />
    ))}
  </svg>
);

// Line 0: a bust on a plinth. Line 1: "nobody is needed" — the column shoots up.
// Line 2: the column vanishes; what actually holds the bust up is everyone's gaze.
export const MisconceptionScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const grow = useRamp(cues[1], 2 * BEAT);
  const swap = useRamp(cues[2], 24);
  const gaze = useRamp(cues[2], 2 * BEAT);
  const pillarTop = interpolate(grow, [0, 1], [720, 520]);
  const bustY = pillarTop - 200 * SCALE + 40;
  const drift = interpolate(frame, [0, duration], [0, -14]);

  return (
    <Frame duration={duration}>
      <Stars />
      <Spotlight x={960} floor={1080} width={520} intensity={0.5 + grow * 0.3} />
      <div style={{ opacity: 1 - swap }}>
        <div
          style={{
            position: "absolute",
            left: 960 - 56,
            top: pillarTop,
            width: 112,
            height: 1080 - pillarTop,
            background: "linear-gradient(90deg, #a9a39a, #ece8e0 45%, #c9c4bb)",
          }}
        >
          <svg width={112} height={600} style={{ position: "absolute", inset: 0 }}>
            <path d="M30 40 L44 90 L36 140 L58 210 M70 260 L62 320 L80 380" stroke="rgba(90,84,76,0.45)" fill="none" strokeWidth={1.4} />
          </svg>
        </div>
        <div style={{ position: "absolute", left: 960 - 70, top: pillarTop - 8, width: 140, height: 14, background: "#f2efe9" }} />
      </div>
      <GazeField target={{ x: 960, y: 560 }} progress={gaze} open={swap} horizon={640} depth={440} opacity={swap} />
      <Bust x={960} y={interpolate(swap, [0, 1], [bustY, 560 - 200 * SCALE + 40]) + drift} scale={SCALE} id="mis" />

      <Sfx name="rise" at={cues[1]} volume={0.4} />
      <Sfx name="whoosh" at={cues[2]} volume={0.3} />

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </Frame>
  );
};
