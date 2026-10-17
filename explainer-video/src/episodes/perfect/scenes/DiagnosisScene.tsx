import React from "react";
import { useCurrentFrame } from "remotion";
import { BoardFrame } from "../../../channels/whiteboard/BoardFrame";
import { ink, hand } from "../../../channels/whiteboard/look";
import { Sketch, Write, rr } from "../../../channels/whiteboard/sketch";
import { arrow, check, crown, cross } from "../drawings";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";
import { ramp } from "./util";

// a quick portrait: wig curls, a profile, a smile
const VOLTAIRE = [
  ...rr.circle(960, 360, 170, { seed: 21, width: 4 }),
  ...[0, 1, 2, 3].flatMap((i) => rr.circle(880 - (i % 2) * 14, 320 + i * 40, 54, { seed: 22 + i, width: 4 })),
  ...[0, 1, 2, 3].flatMap((i) => rr.circle(1040 + (i % 2) * 14, 320 + i * 40, 54, { seed: 26 + i, width: 4 })),
  ...rr.curve([[1000, 360], [1030, 385], [1004, 395]], { seed: 30, width: 4 }),
  ...rr.curve([[940, 420], [965, 432], [990, 420]], { seed: 31, width: 4 }),
  ...rr.circle(980, 340, 12, { seed: 32, width: 4, fill: ink.black, gap: 3 }),
];
const CROWN = crown(700, 470, 46, 33);
const GOOD = check(1260, 480, 70, 34);
const ATTACK = arrow(820, 540, 1150, 540, 35, ink.red);
const X = cross(1260, 480, 110, 36);

// 0 · a quick portrait of Voltaire, and his name.
// 1 · the line, written out — then 完美 (with its crown) goes for 好 (with its
//     tick) and crosses it out.
export const DiagnosisScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const t1 = frame - cues[1];
  const card = frame >= cues[1];
  return (
    <BoardFrame duration={duration}>
      {!card ? (
        <>
          <Sketch strokes={VOLTAIRE} progress={ramp(frame, 0, 4 * BEAT)} />
          <Write text="伏尔泰" x={960} y={590} size={64} align="center" progress={ramp(frame, 4 * BEAT, 5 * BEAT)} />
          <Write text="Voltaire · 1694—1778" x={960} y={680} size={44} align="center" progress={1} hand={false} font={hand.latin} color={ink.grey} />
        </>
      ) : (
        <>
          <Write text="完美是好的敌人" x={960} y={220} size={100} align="center" progress={ramp(t1, 0, 2 * BEAT)} spacing={0.1} />
          <Write text="Le mieux est l'ennemi du bien." x={960} y={350} size={46} align="center" progress={1} hand={false} font={hand.latin} color={ink.grey} />
          <Write text="完美" x={700} y={500} size={72} align="center" progress={ramp(t1, 2 * BEAT, 3 * BEAT)} color={ink.orange} />
          <Sketch strokes={CROWN} progress={ramp(t1, 3 * BEAT, 3.5 * BEAT)} />
          <Write text="好" x={1260} y={500} size={72} align="center" progress={ramp(t1, 3.5 * BEAT, 4 * BEAT)} />
          <Sketch strokes={GOOD} progress={ramp(t1, 4 * BEAT, 4.5 * BEAT)} />
          <Sketch strokes={ATTACK} progress={ramp(t1, 5 * BEAT, 6 * BEAT)} />
          <Sketch strokes={X} progress={ramp(t1, 6 * BEAT, 7 * BEAT)} />
        </>
      )}
      <Sfx name="glint" at={4 * BEAT} volume={0.2} />
      <Sfx name="stamp" at={cues[1]} volume={0.4} />
      <Sfx name="whoosh" at={cues[1] + 5 * BEAT} volume={0.3} />
      <Sfx name="stamp" at={cues[1] + 6 * BEAT} volume={0.5} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[1]} />
    </BoardFrame>
  );
};
