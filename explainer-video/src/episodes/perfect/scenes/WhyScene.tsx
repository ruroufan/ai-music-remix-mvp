import React from "react";
import { useCurrentFrame } from "remotion";
import { BoardFrame } from "../../../channels/whiteboard/BoardFrame";
import { ink } from "../../../channels/whiteboard/look";
import { Sketch, Write, rr } from "../../../channels/whiteboard/sketch";
import { Paper, cat, ring, stick } from "../drawings";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";
import { ramp } from "./util";

const THINKER = stick(420, 760, 220, 140);
const CLOUD = [...rr.ellipse(900, 360, 640, 380, { seed: 141, width: 5 }), ...rr.circle(560, 560, 40, { seed: 142, width: 4 }), ...rr.circle(510, 620, 24, { seed: 143, width: 4 })];
const DREAM = cat(900, 380, 220, 1, 144);
const FRAME = rr.rect(740, 230, 320, 300, { seed: 145, color: ink.orange, width: 6 });
const STARS = [0, 1, 2, 3].flatMap((i) => rr.poly([[700 + i * 140, 210 - (i % 2) * 30], [712 + i * 140, 240 - (i % 2) * 30], [690 + i * 140, 222 - (i % 2) * 30], [722 + i * 140, 222 - (i % 2) * 30], [700 + i * 140, 240 - (i % 2) * 30], [700 + i * 140, 210 - (i % 2) * 30]], { seed: 146 + i, color: ink.orange, width: 4 }));
// the real attempt
const REAL = cat(860, 420, 260, 0.15, 150);
const FLAW1 = ring(780, 330, 130, 110, 151);
const FLAW2 = ring(980, 520, 160, 120, 152);
const RULER = [...rr.rect(560, 640, 600, 60, { seed: 153, width: 4, color: ink.blue }), ...Array.from({ length: 11 }, (_, i) => rr.line(570 + i * 58, 640, 570 + i * 58, i % 5 ? 662 : 676, { seed: 154 + i, width: 3, color: ink.blue })).flat()];

// 0 · in his head, the work is perfect: a fine cat in a gold frame, stars around it.
// 1 · on paper it's this: wobbly, circled flaws — 瑕疵, 局限 — and a ruler: 真正的水平.
export const WhyScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const t1 = frame - cues[1];
  return (
    <BoardFrame duration={duration}>
      {t1 < 0 ? (
        <>
          <Sketch strokes={THINKER} progress={ramp(frame, 0, BEAT)} />
          <Sketch strokes={CLOUD} progress={ramp(frame, BEAT, 3 * BEAT)} />
          <Sketch strokes={DREAM} progress={ramp(frame, 3 * BEAT, 6 * BEAT)} />
          <Sketch strokes={FRAME} progress={ramp(frame, 6 * BEAT, 7 * BEAT)} />
          <Sketch strokes={STARS} progress={ramp(frame, 7 * BEAT, 8 * BEAT)} />
          <Write text="想象里 · 完美" x={1300} y={300} size={52} progress={ramp(frame, 8 * BEAT, 9 * BEAT)} color={ink.orange} />
        </>
      ) : (
        <>
          <Paper x={560} y={170} w={600} h={460} />
          <Sketch strokes={REAL} progress={ramp(t1, 0, 3 * BEAT)} />
          <Sketch strokes={FLAW1} progress={ramp(t1, 3 * BEAT, 4 * BEAT)} />
          <Write text="瑕疵" x={1220} y={250} size={48} progress={ramp(t1, 4 * BEAT, 4.5 * BEAT)} color={ink.red} />
          <Sketch strokes={FLAW2} progress={ramp(t1, 4.5 * BEAT, 5.5 * BEAT)} />
          <Write text="局限" x={1220} y={470} size={48} progress={ramp(t1, 5.5 * BEAT, 6 * BEAT)} color={ink.red} />
          <Sketch strokes={RULER} progress={ramp(t1, 6 * BEAT, 7.5 * BEAT)} />
          <Write text="真正的水平" x={1200} y={640} size={48} progress={ramp(t1, 7.5 * BEAT, 8.5 * BEAT)} color={ink.blue} />
        </>
      )}
      <Sfx name="rise" at={3 * BEAT} volume={0.25} />
      <Sfx name="glint" at={7 * BEAT} volume={0.35} />
      <Sfx name="glitch" at={cues[1] + 3 * BEAT} volume={0.25} />
      <Sfx name="glitch" at={cues[1] + Math.round(4.5 * BEAT)} volume={0.25} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </BoardFrame>
  );
};
