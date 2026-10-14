import React from "react";
import { interpolateColors } from "remotion";
import { Frame } from "../components/Frame";
import { Subtitles } from "../components/Subtitles";
import { Sfx } from "../components/Sfx";
import { theme } from "../theme";
import { useRamp, BEAT, onBeat, type SceneProps } from "../timing";

const ROWS = [98, 95, 92, 90, 87, 85, 81];
const ME = 2;
const ROW_H = 56;
const TOP = 96;

// A report card: you came third, and your eyes go straight to the two above you.
export const ScoresScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const enter = useRamp(0, 22);
  const lookAt = cues[0] + onBeat(duration * 0.3);
  const look = useRamp(lookAt, BEAT);
  const red = useRamp(lookAt + BEAT, 16);
  const pathLen = 420;

  return (
    <Frame duration={duration}>
      <div
        style={{
          position: "absolute",
          left: 960 - 290,
          top: 150,
          width: 580,
          height: 540,
          background: "linear-gradient(#efeadf, #ddd6c8)",
          boxShadow: "0 30px 90px rgba(0,0,0,0.7)",
          transform: `rotate(-2.5deg) translateY(${(1 - enter) * 60}px)`,
          opacity: enter,
          color: "#2a2520",
        }}
      >
        <div style={{ textAlign: "center", fontSize: 30, fontWeight: 700, letterSpacing: 14, paddingTop: 34 }}>成绩单</div>
        {ROWS.map((score, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 30,
              right: 30,
              top: TOP + i * ROW_H,
              height: ROW_H - 10,
              display: "flex",
              alignItems: "center",
              gap: 20,
              background: i === ME ? "rgba(224,83,63,0.16)" : undefined,
              borderBottom: "1px solid rgba(42,37,32,0.15)",
              fontSize: 26,
            }}
          >
            <span style={{ width: 24, textAlign: "center", fontFamily: "Georgia, serif" }}>{i + 1}</span>
            {i === ME ? <span style={{ width: 300, fontWeight: 700 }}>我</span> : <span style={{ width: 300, height: 10, borderRadius: 5, background: "rgba(42,37,32,0.35)" }} />}
            <span
              style={{
                marginLeft: "auto",
                fontFamily: "Georgia, serif",
                fontSize: i < ME ? 30 : 26,
                fontWeight: i < ME ? 700 : 400,
                color: i < ME ? interpolateColors(red, [0, 1], ["#2a2520", theme.accent]) : undefined,
              }}
            >
              {score}
            </span>
          </div>
        ))}
        {/* your gaze: from your row up to the scores above */}
        <svg width={580} height={540} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <path
            d={`M110 ${TOP + ME * ROW_H + 22} C 260 ${TOP + ME * ROW_H + 30}, 380 ${TOP + 60}, 470 ${TOP + 22}`}
            fill="none"
            stroke={theme.gold}
            strokeWidth={3}
            strokeDasharray={pathLen}
            strokeDashoffset={pathLen * (1 - look)}
          />
        </svg>
      </div>

      <Sfx name="whoosh" at={0} volume={0.3} />
      <Sfx name="glint" at={lookAt + BEAT} volume={0.3} />

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </Frame>
  );
};
