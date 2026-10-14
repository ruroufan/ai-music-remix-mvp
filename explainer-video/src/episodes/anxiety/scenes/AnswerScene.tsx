import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { PathField, PersonFromAbove, CHOSEN_ROOT } from "../paths";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// Line 0: from above again, every path lit.
// Line 1: one path is chosen — and, beat by beat, every other one flares red and dies.
// Line 2: what's left is mostly dark. Not a wrong choice: a loss.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const chosen = useRamp(cues[1], BEAT);
  const lost = useRamp(cues[1] + BEAT, BEAT);
  // the dying happens in steps, one per beat
  const steps = Math.max(0, Math.min(6, Math.floor((frame - cues[1] - 2 * BEAT) / BEAT) + 1));
  const fade = Math.min(0.9, steps * 0.15 + interpolate(frame % BEAT, [0, 6], [0, 0.03]));
  const embers = frame >= cues[2];
  const angle = (CHOSEN_ROOT.angle * 180) / Math.PI;

  return (
    <ObsFrame duration={duration}>
      <PathField cx={960} cy={500} scale={1.1} rotate={frame * 0.1} chosen={chosen} lost={lost} fade={fade} />
      <PersonFromAbove x={960} y={500} size={60} angle={angle + 90} glow={0.8} />
      {embers && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 180, textAlign: "center", fontSize: 30, letterSpacing: 20, color: `rgba(255,77,109,${0.5 + 0.2 * Math.sin(frame / 5)})` }}>
          ✕ ✕ ✕ ✕ ✕ ✕ ✕ ✕
        </div>
      )}

      <Sfx name="glint" at={cues[1]} volume={0.4} />
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <Sfx key={k} name="glitch" at={cues[1] + (2 + k) * BEAT} volume={0.12} />
      ))}
      <Sfx name="boom" at={cues[2]} volume={0.55} />

      <Subtitles lines={lines} cues={cues} duration={duration} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: embers ? `inset 0 0 200px rgba(255,77,109,0.15)` : undefined }} />
    </ObsFrame>
  );
};
