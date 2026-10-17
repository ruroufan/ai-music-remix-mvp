import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { PathField, PersonFromAbove, Vertigo, CHOSEN_ROOT } from "../paths";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const CENTER = { x: 960, y: 560 };

// Line 0: the dizziness doesn't go away — the view still sways.
// Line 1: the first step. The chosen path turns to face forward and lights up,
//         the person walks onto it, and every other path goes out.
// Line 2: end card with the channel sign-off.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const chosenAngle = (CHOSEN_ROOT.angle * 180) / Math.PI;
  // turn the world so the chosen path points straight up (forward)
  const turn = interpolate(frame, [cues[1], cues[1] + 2 * BEAT], [chosenAngle * 0.3, -90 - chosenAngle], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => 1 - Math.pow(1 - t, 3) });
  const rotate = frame < cues[1] ? chosenAngle * 0.3 + Math.sin(frame / 14) * 6 : turn;
  const strength = interpolate(frame, [0, cues[1], cues[1] + 2 * BEAT], [0.3, 0.3, 0], { extrapolateRight: "clamp" });
  const stepAt = cues[1] + 2 * BEAT;
  const chosen = useRamp(stepAt, BEAT);
  const fade = interpolate(frame, [stepAt + BEAT, cues[2]], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const walk = interpolate(frame, [stepAt, cues[2]], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * (2 - t) });
  const stageOut = interpolate(frame, [cues[2] - 6, cues[2] + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const card = useRamp(cues[2], 12);

  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: stageOut }}>
        <Vertigo strength={strength} frame={frame}>
          <PathField cx={CENTER.x} cy={CENTER.y} scale={1.15} rotate={rotate} chosen={chosen} fade={fade} />
        </Vertigo>
        <PersonFromAbove x={CENTER.x} y={CENTER.y - walk * 300} size={60} glow={0.8 + chosen * 0.5} />
      </div>
      <EndCard opacity={card} signoffAt={cues[2] + BEAT} />

      <Sfx name="step" at={stepAt} volume={0.7} />
      <Sfx name="boom" at={stepAt} volume={0.4} />
      <Sfx name="step" at={stepAt + 2 * BEAT} volume={0.5} />
      <Sfx name="step" at={stepAt + 4 * BEAT} volume={0.4} />
      <Sfx name="glint" at={cues[2]} volume={0.3} />

      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
