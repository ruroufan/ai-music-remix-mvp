import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { Frame } from "../components/Frame";
import { Silhouette, Spotlight } from "../components/Figures";
import { Bust } from "../components/Bust";
import { Floor, Pedestal } from "../components/Stage";
import { Subtitles } from "../components/Subtitles";
import { Sfx } from "../components/Sfx";
import { useRamp, BEAT, HALF_BEAT, type SceneProps } from "../timing";

const FLOOR = 780;
const HIM = { x: 700, plinth: 300 }; // the one who is right — higher up
const US = { x: 1240, plinth: 110 }; // us, standing on our superiority

export const RebuttalScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const laser = useRamp(cues[0] + HALF_BEAT, BEAT);
  const crack = useRamp(cues[0] + 2 * BEAT, BEAT);
  const close = interpolate(frame, [cues[1] - 10, cues[1] + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const stage = useRamp(cues[1], 16);
  const waves = interpolate(frame, [cues[2], cues[3]], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const retort = useRamp(cues[2] + BEAT, 14);
  const zoom = useRamp(cues[3], 2 * BEAT);

  const himHead = { x: HIM.x, y: FLOOR - HIM.plinth - 225 };
  const usMouth = { x: US.x - 8, y: FLOOR - US.plinth - 222 };

  return (
    <Frame duration={duration}>
      <div style={{ opacity: close }}>
        <Bust x={620} y={560} scale={1.9} laser={laser} crack={crack} id="reb-close" />
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: stage,
          transform: `scale(${1 + zoom * 0.4})`,
          transformOrigin: `${US.x}px ${FLOOR - US.plinth - 120}px`,
        }}
      >
        <Floor y={FLOOR} />
        <Spotlight x={HIM.x} floor={FLOOR - HIM.plinth + 10} width={380} intensity={0.8} />
        <Spotlight x={US.x} floor={FLOOR - US.plinth + 10} width={340} intensity={0.6} />
        <Pedestal x={HIM.x} bottom={FLOOR} width={170} height={HIM.plinth} />
        <Silhouette x={HIM.x} bottom={FLOOR - HIM.plinth} height={240} />
        <Pedestal x={US.x} bottom={FLOOR} width={170} height={US.plinth} label="优越感" fontSize={36} />
        <Silhouette x={US.x} bottom={FLOOR - US.plinth} height={240} />

        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 1 - zoom }}>
          {/* his words travelling towards us... */}
          {[0, 1, 2, 3].map((k) => {
            const r = 60 + ((waves * 3 + k * 0.25) % 1) * 420;
            return (
              <path
                key={k}
                d={`M${himHead.x + r * Math.cos(-0.6)} ${himHead.y + r * Math.sin(-0.6)} A ${r} ${r} 0 0 1 ${himHead.x + r * Math.cos(0.6)} ${himHead.y + r * Math.sin(0.6)}`}
                fill="none"
                stroke={`rgba(239,233,223,${waves > 0 ? 0.5 * (1 - r / 480) : 0})`}
                strokeWidth={2}
              />
            );
          })}
          {/* ...and our retort cutting straight back */}
          <line
            x1={usMouth.x}
            y1={usMouth.y}
            x2={usMouth.x + (himHead.x + 30 - usMouth.x) * retort}
            y2={usMouth.y + (himHead.y + 20 - usMouth.y) * retort}
            stroke="#ff4b3e"
            strokeWidth={3}
            style={{ filter: "drop-shadow(0 0 6px rgba(255,75,62,0.9))" }}
          />
        </svg>
      </div>

      <Sfx name="whoosh" at={cues[0] + HALF_BEAT} volume={0.3} />
      <Sfx name="boom" at={cues[0] + 2 * BEAT} volume={0.35} />
      <Sfx name="whoosh" at={cues[2] + BEAT} volume={0.4} />
      <Sfx name="rise" at={cues[3]} volume={0.3} />

      <Subtitles lines={lines} cues={cues} duration={duration} position={zoom > 0 ? "top" : "bottom"} />
    </Frame>
  );
};
