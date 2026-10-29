import React from "react";
import { useCurrentFrame } from "remotion";
import { BoardFrame } from "../../../channels/whiteboard/BoardFrame";
import { ink } from "../../../channels/whiteboard/look";
import { Eraser, Sketch, Write } from "../../../channels/whiteboard/sketch";
import { PAPER, PAPER_EDGE, Paper, firstStroke } from "../drawings";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";
import { ramp } from "./util";

const ATTEMPTS = Array.from({ length: 8 }, (_, k) => firstStroke(k));

// A blank sheet. The first stroke goes down — and is scrubbed out. Again.
// And again. Every two beats: draw, erase.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const cycle = 2 * BEAT;
  const k = Math.min(ATTEMPTS.length - 1, Math.floor(frame / cycle));
  const ph = frame - k * cycle;
  const draw = ramp(ph, 2, BEAT - 2);
  const erase = ramp(ph, BEAT + 2, cycle - 1);
  return (
    <BoardFrame duration={duration}>
      <Paper />
      <Sketch strokes={PAPER_EDGE} progress={ramp(frame, 0, 8)} hand={false} />
      <div style={{ position: "absolute", inset: 0, opacity: 1 - erase }}>
        <Sketch strokes={ATTEMPTS[k]} progress={draw} hand={erase === 0} />
      </div>
      <Eraser x={PAPER.x + 100} y={PAPER.y + 200} w={400} h={180} progress={erase} />
      <Write text={`重来 ×${k + 1}`} x={PAPER.x + PAPER.w + 80} y={PAPER.y + 40} size={58} color={ink.red} progress={1} hand={false} />
      <Write text="还没准备好…" x={PAPER.x + PAPER.w + 80} y={PAPER.y + 130} size={40} color={ink.grey} progress={ramp(frame, cues[1], cues[1] + 12)} />
      {ATTEMPTS.map((_, i) => (
        <React.Fragment key={i}>
          <Sfx name="glint" at={i * cycle + 2} volume={0.12} />
          <Sfx name="whoosh" at={i * cycle + BEAT + 2} volume={0.18} />
        </React.Fragment>
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </BoardFrame>
  );
};
