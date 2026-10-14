import React from "react";
import { Frame } from "../Frame";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { theme } from "../../../theme";
import { useRamp, onBeat, type SceneProps } from "../timing";

const TABLE = 740;

// Rows of empty seats fading into the dark: no audience.
const EmptySeats: React.FC<{ opacity: number }> = ({ opacity }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity }}>
    {[0, 1, 2, 3].map((r) => {
      const y = 70 + r * 44;
      const w = 34 + r * 6;
      const n = Math.floor(1920 / (w + 18));
      return Array.from({ length: n }, (_, i) => (
        <rect key={`${r}-${i}`} x={i * (w + 18) + (r % 2) * 20} y={y} width={w} height={12 + r * 2} rx={6} fill="none" stroke={`rgba(239,233,223,${0.08 + r * 0.04})`} strokeWidth={1.2} />
      ));
    })}
  </svg>
);

const Bowl: React.FC<{ x: number }> = ({ x }) => (
  <>
    <div style={{ position: "absolute", left: x - 50, top: TABLE - 34, width: 100, height: 34, borderRadius: "0 0 50px 50px", background: theme.stone }} />
    {[0, 1, 2].map((i) => (
      <div key={i} style={{ position: "absolute", left: x - 18 + i * 16, top: TABLE - 110, width: 3, height: 60, borderRadius: 3, background: "rgba(239,233,223,0.4)", transform: `skewX(${i % 2 ? 8 : -8}deg)` }} />
    ))}
  </>
);

// A night window — a good night's sleep.
const Moon: React.FC<{ x: number }> = ({ x }) => (
  <div style={{ position: "absolute", left: x - 60, top: TABLE - 150, width: 120, height: 150, background: "#101624", border: "3px solid #2c3446" }}>
    <div style={{ position: "absolute", left: 34, top: 40, width: 50, height: 50, borderRadius: "50%", boxShadow: "-12px 6px 0 0 #f2efe9" }} />
  </div>
);

// A paper crane — something you made and are happy with.
const Crane: React.FC<{ x: number }> = ({ x }) => (
  <svg width={200} height={140} style={{ position: "absolute", left: x - 100, top: TABLE - 120 }}>
    <polygon points="20,120 100,70 180,120" fill="#c9c4bb" />
    <polygon points="100,70 60,10 120,95" fill="#f2efe9" />
    <polygon points="100,70 175,30 140,110" fill="#e3ded5" />
    <polygon points="20,120 0,60 50,100" fill="#d8d4cc" />
  </svg>
);

export const AudienceScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const seats = useRamp(0, 30);
  const lamp = useRamp(cues[0] + 10, 30);
  const bowl = useRamp(cues[1], 14);
  const span = duration - cues[1];
  const moonAt = cues[1] + onBeat(span * 0.25);
  const craneAt = cues[1] + onBeat(span * 0.5);
  const moon = useRamp(moonAt, 14);
  const crane = useRamp(craneAt, 14);

  return (
    <Frame duration={duration}>
      <EmptySeats opacity={seats * (1 - lamp * 0.5)} />
      <div style={{ position: "absolute", left: 959, top: 0, width: 2, height: 520, background: "rgba(239,233,223,0.3)" }} />
      <div style={{ position: "absolute", left: 946, top: 516, width: 28, height: 28, borderRadius: "50%", background: "#ffe9c4", boxShadow: `0 0 ${40 * lamp}px ${12 * lamp}px rgba(255,200,130,0.7)` }} />
      <div style={{ position: "absolute", left: 460, top: 230, width: 1000, height: 800, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,196,120,${0.24 * lamp}), transparent 62%)` }} />
      <div style={{ position: "absolute", left: 560, top: TABLE, width: 800, height: 10, background: "#3a3128" }} />
      <div style={{ position: "absolute", left: 600, top: TABLE + 10, width: 8, height: 340, background: "#2a231c" }} />
      <div style={{ position: "absolute", left: 1312, top: TABLE + 10, width: 8, height: 340, background: "#2a231c" }} />
      <div style={{ opacity: bowl }}><Bowl x={720} /></div>
      <div style={{ opacity: moon }}><Moon x={960} /></div>
      <div style={{ opacity: crane }}><Crane x={1180} /></div>

      <Sfx name="glint" at={cues[1]} volume={0.22} />
      <Sfx name="glint" at={moonAt} volume={0.22} />
      <Sfx name="glint" at={craneAt} volume={0.22} />

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </Frame>
  );
};
