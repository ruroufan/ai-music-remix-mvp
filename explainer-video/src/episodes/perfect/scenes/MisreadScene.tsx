import React from "react";
import { useCurrentFrame } from "remotion";
import { BoardFrame } from "../../../channels/whiteboard/BoardFrame";
import { ink } from "../../../channels/whiteboard/look";
import { Sketch, Write, rr } from "../../../channels/whiteboard/sketch";
import { arrow, ring, stick } from "../drawings";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";
import { ramp } from "./util";

const RING = ring(960, 430, 720, 230, 41);
// 1 · a high-jump bar set absurdly high
const BAR = [...rr.line(700, 760, 700, 220, { seed: 42, width: 5 }), ...rr.line(1220, 760, 1220, 220, { seed: 43, width: 5 }), ...rr.line(700, 240, 1220, 240, { seed: 44, width: 6, color: ink.red })];
const UP = arrow(1300, 600, 1300, 260, 45, ink.red);
const JUMPER = stick(960, 760, 170, 46, ink.black, "up");
// 2 · the best at it, already past the flag — and the one still at the start line
const LINE = rr.line(200, 760, 1720, 760, { seed: 47, width: 4 });
const FLAG = [...rr.line(1500, 760, 1500, 540, { seed: 48, width: 5 }), ...rr.poly([[1500, 540], [1600, 570], [1500, 600]], { seed: 49, width: 5, color: ink.green, fill: ink.green, gap: 8 })];
const RUNNER = stick(1640, 760, 160, 50, ink.black, "run");
const START = rr.line(420, 600, 420, 760, { seed: 51, width: 6, color: ink.red });
const STILL = stick(360, 760, 160, 52);
const RING2 = ring(360, 660, 260, 280, 53);

// 0 · write the word, ring it.
// 1 · "标准高、要求严": a bar set impossibly high, a little figure under it.
// 2 · the race: the best already past the flag — and, circled in red, the
//     one still standing at the start line.
export const MisreadScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const t1 = frame - cues[1], t2 = frame - cues[2];
  return (
    <BoardFrame duration={duration}>
      {frame < cues[1] && (
        <>
          <Write text="完美主义 = ?" x={960} y={360} size={110} align="center" progress={ramp(frame, 0, 2 * BEAT)} />
          <Sketch strokes={RING} progress={ramp(frame, 2.5 * BEAT, 4 * BEAT)} />
        </>
      )}
      {t1 >= 0 && t2 < 0 && (
        <>
          <Sketch strokes={BAR} progress={ramp(t1, 0, 2 * BEAT)} />
          <Sketch strokes={JUMPER} progress={ramp(t1, 2 * BEAT, 3 * BEAT)} />
          <Sketch strokes={UP} progress={ramp(t1, 3 * BEAT, 4 * BEAT)} />
          <Write text="标准高" x={1340} y={300} size={56} color={ink.red} progress={ramp(t1, 4 * BEAT, 5 * BEAT)} />
          <Write text="要求严" x={1340} y={380} size={56} color={ink.red} progress={ramp(t1, 5 * BEAT, 6 * BEAT)} />
        </>
      )}
      {t2 >= 0 && (
        <>
          <Sketch strokes={LINE} progress={ramp(t2, 0, BEAT)} hand={false} />
          <Sketch strokes={FLAG} progress={ramp(t2, BEAT, 2 * BEAT)} />
          <Sketch strokes={RUNNER} progress={ramp(t2, 2 * BEAT, 3 * BEAT)} />
          <Write text="做得最好的人" x={1560} y={440} size={40} align="center" progress={ramp(t2, 3 * BEAT, 4 * BEAT)} color={ink.green} />
          <Sketch strokes={START} progress={ramp(t2, 4 * BEAT, 4.5 * BEAT)} />
          <Sketch strokes={STILL} progress={ramp(t2, 4.5 * BEAT, 5.5 * BEAT)} />
          <Write text="迟迟不肯动手的人" x={360} y={420} size={40} align="center" progress={ramp(t2, 5.5 * BEAT, 6.5 * BEAT)} color={ink.red} />
          <Sketch strokes={RING2} progress={ramp(t2, 7 * BEAT, 8 * BEAT)} />
        </>
      )}
      <Sfx name="glint" at={2.5 * BEAT} volume={0.2} />
      <Sfx name="rise" at={cues[1] + 3 * BEAT} volume={0.25} />
      <Sfx name="step" at={cues[2] + 2 * BEAT} volume={0.3} />
      <Sfx name="stamp" at={cues[2] + 7 * BEAT} volume={0.45} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </BoardFrame>
  );
};
