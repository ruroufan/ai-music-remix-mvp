import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { Frame } from "../components/Frame";
import { Silhouette, Spotlight } from "../components/Figures";
import { GazeField } from "../components/Stage";
import { Subtitles } from "../components/Subtitles";
import { Sfx } from "../components/Sfx";
import { theme } from "../theme";
import { useRamp, type SceneProps } from "../timing";

const GROUND = 820;
const PERCH = 540;

// Line 0: standing on other people's gaze… which closes and falls away.
// Line 1: real ground under your feet.
export const StandFirmScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const gazeIn = useRamp(0, 30);
  const letGo = interpolate(frame, [cues[1] - 40, cues[1] + 6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const stone = useRamp(cues[1] - 16, 22);
  const word = useRamp(cues[1] + 10, 22);
  const feet = interpolate(letGo, [0, 1], [PERCH, GROUND]);

  return (
    <Frame duration={duration}>
      <GazeField target={{ x: 960, y: PERCH }} progress={gazeIn} open={1 - letGo} horizon={620} depth={460} opacity={1 - letGo} />
      <div style={{ position: "absolute", left: 0, top: GROUND, width: 1920, height: 1080 - GROUND, opacity: stone, background: "linear-gradient(#c9c4bb, #8d877e)" }}>
        <svg width={1920} height={260} style={{ position: "absolute", inset: 0 }}>
          <path d="M120 0 L150 70 L130 140 M520 0 L500 90 L540 200 M1380 0 L1410 60 L1390 150 L1420 260 M1760 0 L1730 110" stroke="rgba(60,55,50,0.45)" fill="none" strokeWidth={2} />
        </svg>
      </div>
      <Spotlight x={960} floor={feet + 10} width={360} intensity={0.9} />
      <Silhouette x={960} bottom={feet} height={240} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: GROUND + 70,
          textAlign: "center",
          fontSize: 110,
          fontWeight: 900,
          letterSpacing: 40,
          color: theme.accent,
          opacity: word,
          textShadow: "0 0 24px rgba(224,83,63,0.8)",
        }}
      >
        站稳
      </div>

      <Sfx name="whoosh" at={cues[1] - 40} volume={0.35} />
      <Sfx name="boom" at={cues[1] + 6} volume={0.7} />

      <Subtitles lines={lines} cues={cues} duration={duration} position="top" />
    </Frame>
  );
};
