import React from "react";
import { useCurrentFrame } from "remotion";
import { BoardFrame } from "../../../channels/whiteboard/BoardFrame";
import { ink } from "../../../channels/whiteboard/look";
import { Sketch, Write, rr } from "../../../channels/whiteboard/sketch";
import { check } from "../drawings";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";
import { ramp } from "./util";

// the scale, tipped left: one finished thing outweighs a hundred perfect ones in the head
const POST = [...rr.line(960, 330, 960, 720, { seed: 220, width: 6 }), ...rr.line(860, 720, 1060, 720, { seed: 221, width: 6 })];
const BEAM = rr.line(660, 420, 1260, 280, { seed: 222, width: 7 });
const PAN_L = [...rr.line(660, 420, 590, 560, { seed: 223, width: 3 }), ...rr.line(660, 420, 730, 560, { seed: 224, width: 3 }), ...rr.curve([[560, 560], [660, 600], [760, 560]], { seed: 225, width: 5 })];
const PAN_R = [...rr.line(1260, 280, 1190, 420, { seed: 226, width: 3 }), ...rr.line(1260, 280, 1330, 420, { seed: 227, width: 3 }), ...rr.curve([[1160, 420], [1260, 460], [1360, 420]], { seed: 228, width: 5 })];
const PAGE = rr.rect(600, 470, 120, 90, { seed: 229, width: 4 });
const TICK = check(660, 515, 50, 230);
const BUBBLES = Array.from({ length: 9 }, (_, i) => rr.circle(1190 + (i % 3) * 36, 330 - Math.floor(i / 3) * 34 + (i % 2) * 8, 30, { seed: 231 + i, width: 3, color: ink.grey })).flat();

// 0 · the line again, written big.
// 1 · a scale: on one pan, one finished page with a tick (还不错 ×1); on the
//     other, a cloud of little perfect bubbles (完美 ×100). The finished page wins.
export const QuoteScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const t1 = frame - cues[1];
  return (
    <BoardFrame duration={duration}>
      {t1 < 0 ? (
        <Write text="完美是好的敌人。" x={960} y={400} size={110} align="center" progress={ramp(frame, 0, 3 * BEAT)} spacing={0.08} />
      ) : (
        <>
          <Sketch strokes={POST} progress={ramp(t1, 0, BEAT)} />
          <Sketch strokes={BEAM} progress={ramp(t1, BEAT, 2 * BEAT)} />
          <Sketch strokes={[...PAN_L, ...PAN_R]} progress={ramp(t1, 2 * BEAT, 3 * BEAT)} />
          <Sketch strokes={PAGE} progress={ramp(t1, 3 * BEAT, 3.6 * BEAT)} />
          <Sketch strokes={TICK} progress={ramp(t1, 3.6 * BEAT, 4 * BEAT)} />
          <Write text="做完的「还不错」×1" x={660} y={630} size={40} align="center" progress={ramp(t1, 4 * BEAT, 5 * BEAT)} color={ink.green} />
          <Sketch strokes={BUBBLES} progress={ramp(t1, 5 * BEAT, 6.5 * BEAT)} hand={false} />
          <Write text="脑子里的「完美」×100" x={1260} y={490} size={40} align="center" progress={ramp(t1, 6.5 * BEAT, 7.5 * BEAT)} color={ink.grey} />
        </>
      )}
      <Sfx name="stamp" at={0} volume={0.3} />
      <Sfx name="stamp" at={cues[1] + 2 * BEAT} volume={0.4} />
      <Sfx name="glint" at={cues[1] + Math.round(3.6 * BEAT)} volume={0.4} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </BoardFrame>
  );
};
