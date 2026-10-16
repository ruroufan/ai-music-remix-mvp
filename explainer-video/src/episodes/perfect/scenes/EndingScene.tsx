import React from "react";
import { useCurrentFrame } from "remotion";
import { BoardFrame } from "../../../channels/whiteboard/BoardFrame";
import { BoardEndCard } from "../../../channels/whiteboard/BoardEndCard";
import { ink } from "../../../channels/whiteboard/look";
import { Sketch, Write } from "../../../channels/whiteboard/sketch";
import { PAPER, PAPER_EDGE, Paper, WOBBLY, arrow, cat, check } from "../drawings";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";
import { ramp } from "./util";

const OK = check(PAPER.x + PAPER.w - 70, PAPER.y + 70, 70, 240);
const NEXT = [cat(1380, 640, 120, 0.3, 241), cat(1530, 500, 130, 0.6, 242), cat(1680, 340, 140, 0.95, 243)];
const UP = arrow(1300, 720, 1720, 220, 244, ink.green);

// 0 · the blank sheet again. This time the line goes down — wobbly, crooked —
//     and nobody erases it. ✓ 第一笔.
// 1 · and from there: the next one, and the next, climbing.
// 2 · end card, drawn by hand, with the channel sign-off.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const t1 = frame - cues[1];
  return (
    <BoardFrame duration={duration}>
      <Paper />
      <Sketch strokes={PAPER_EDGE} progress={1} hand={false} />
      <Sketch strokes={WOBBLY} progress={ramp(frame, 2 * BEAT, 5 * BEAT)} />
      <Sketch strokes={OK} progress={ramp(frame, 5.5 * BEAT, 6 * BEAT)} />
      <Write text="第一笔" x={PAPER.x + PAPER.w - 70} y={PAPER.y + 130} size={44} align="center" progress={ramp(frame, 6 * BEAT, 7 * BEAT)} color={ink.green} hand={false} />
      {t1 >= 0 && (
        <>
          {NEXT.map((c, i) => (
            <Sketch key={i} strokes={c} progress={ramp(t1, i * 2 * BEAT, i * 2 * BEAT + 1.6 * BEAT)} />
          ))}
          <Sketch strokes={UP} progress={ramp(t1, 6 * BEAT, 7 * BEAT)} hand={false} />
          <Write text="越做越好" x={1480} y={760} size={48} align="center" progress={ramp(t1, 7 * BEAT, 8 * BEAT)} color={ink.green} hand={false} />
        </>
      )}
      <BoardEndCard opacity={frame >= cues[2] ? 1 : 0} start={cues[2]} signoffAt={cues[2] + BEAT} />
      <Sfx name="glint" at={2 * BEAT} volume={0.3} />
      <Sfx name="stamp" at={Math.round(5.5 * BEAT)} volume={0.45} />
      {[0, 1, 2].map((i) => (
        <Sfx key={i} name="glint" at={cues[1] + i * 2 * BEAT} volume={0.2} />
      ))}
      <Sfx name="glint" at={cues[2]} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </BoardFrame>
  );
};
