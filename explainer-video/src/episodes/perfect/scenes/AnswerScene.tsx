import React from "react";
import { useCurrentFrame } from "remotion";
import { BoardFrame } from "../../../channels/whiteboard/BoardFrame";
import { ink } from "../../../channels/whiteboard/look";
import { Sketch, Write, rr } from "../../../channels/whiteboard/sketch";
import { stick } from "../drawings";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";
import { ramp } from "./util";

const BOX = rr.rect(340, 520, 220, 160, { seed: 160, width: 4 });
const DUST = [0, 1, 2, 3, 4].flatMap((i) => rr.line(350 + i * 44, 500, 370 + i * 44, 488, { seed: 161 + i, width: 3, color: ink.grey }));
const ME = stick(1180, 720, 240, 170);
const BUBBLE = rr.ellipse(1180, 560, 440, 460, { seed: 171, width: 6, color: ink.blue });
const SHIELD = rr.path("M1180 330 L1290 370 L1280 500 Q1260 600 1180 640 Q1100 600 1080 500 L1070 370 Z", { seed: 172, width: 5, color: ink.blue, fill: "rgba(45,108,223,0.25)", gap: 14 });

// 0 · "what are we really preparing?" — the task itself, in a box, gathering dust.
// 1 · what we're actually building: a self that can never fail — wrapped in a
//     bubble and a shield, untouchable.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const t1 = frame - cues[1];
  return (
    <BoardFrame duration={duration}>
      <Write text="我们在准备什么？" x={960} y={170} size={64} align="center" progress={ramp(frame, 0, 2 * BEAT)} />
      <Sketch strokes={BOX} progress={ramp(frame, 2 * BEAT, 3 * BEAT)} />
      <Write text="那件事" x={450} y={570} size={44} align="center" progress={ramp(frame, 3 * BEAT, 3.6 * BEAT)} hand={false} />
      <Sketch strokes={DUST} progress={ramp(frame, 3.6 * BEAT, 4.6 * BEAT)} hand={false} />
      {t1 >= 0 && (
        <>
          <Sketch strokes={ME} progress={ramp(t1, 0, BEAT)} />
          <Sketch strokes={SHIELD} progress={ramp(t1, BEAT, 3 * BEAT)} />
          <Sketch strokes={BUBBLE} progress={ramp(t1, 3 * BEAT, 4.5 * BEAT)} />
          <Write text="永远不会失败的自己" x={1180} y={790 - 40} size={40} align="center" progress={ramp(t1, 5 * BEAT, 7 * BEAT)} color={ink.blue} />
        </>
      )}
      <Sfx name="glint" at={2 * BEAT} volume={0.2} />
      <Sfx name="rise" at={cues[1] + BEAT} volume={0.3} />
      <Sfx name="glint" at={cues[1] + 5 * BEAT} volume={0.35} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </BoardFrame>
  );
};
