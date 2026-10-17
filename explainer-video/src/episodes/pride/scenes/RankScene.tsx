import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { Frame } from "../Frame";
import { Silhouette, Spotlight } from "../../../components/Figures";
import { Dust, Floor, GlowWord } from "../../../components/Stage";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, onBeat, type SceneProps } from "../timing";

const FLOOR = 780;
const STEPS = [
  { x: 760, h: 130, n: "II" },
  { x: 960, h: 200, n: "I" },
  { x: 1160, h: 80, n: "III" },
];

// Line 0: first place — and already watching second. Line 1: "满足" crumbles to dust.
export const RankScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const enter = useRamp(0, 18);
  const waryAt = cues[0] + onBeat((cues[1] - cues[0]) * 0.45);
  const wary = useRamp(waryAt, 18);
  const out = interpolate(frame, [cues[1] - 10, cues[1] + 8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const word = useRamp(cues[1] + 4, 18);
  const crumbleAt = cues[1] + onBeat((duration - cues[1]) * 0.45);
  const crumble = interpolate(frame, [crumbleAt, duration - 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const first = { x: 960, y: FLOOR - 200 - 225 };
  const second = { x: 760, y: FLOOR - 130 - 225 };

  return (
    <Frame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: enter * out }}>
        <Floor y={FLOOR} />
        <Spotlight x={960} floor={FLOOR - 200} width={360} intensity={0.9} />
        {STEPS.map((s) => (
          <div
            key={s.n}
            style={{
              position: "absolute",
              left: s.x - 100,
              top: FLOOR - s.h,
              width: 200,
              height: s.h,
              background: "linear-gradient(#ece8e0, #a9a39a)",
              color: "#6f6a62",
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              fontSize: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {s.n}
          </div>
        ))}
        {STEPS.map((s, i) => (
          <Silhouette key={s.n} x={s.x} bottom={FLOOR - s.h} height={230} opacity={i === 1 ? 1 : 0.6} rim={i === 1 ? undefined : "rgba(239,233,223,0.3)"} />
        ))}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <line
            x1={first.x - 10}
            y1={first.y + 30}
            x2={first.x - 10 + (second.x + 10 - first.x + 10) * wary}
            y2={first.y + 30 + (second.y + 30 - first.y - 30) * wary}
            stroke="#e0533f"
            strokeWidth={2.5}
            strokeDasharray="7 7"
          />
        </svg>
      </div>

      <div style={{ opacity: word }}>
        <GlowWord text="满足" y={300} size={150} opacity={1 - crumble} />
        <Dust box={{ x: 780, y: 225, w: 360, h: 150 }} progress={crumble} />
      </div>

      <Sfx name="glint" at={waryAt} volume={0.3} />
      <Sfx name="whoosh" at={crumbleAt} volume={0.35} />

      <Subtitles lines={lines} cues={cues} duration={duration} y={frame >= cues[1] ? 470 : undefined} />
    </Frame>
  );
};
