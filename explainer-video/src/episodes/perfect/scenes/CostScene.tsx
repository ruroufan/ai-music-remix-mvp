import React from "react";
import { useCurrentFrame } from "remotion";
import { BoardFrame } from "../../../channels/whiteboard/BoardFrame";
import { ink } from "../../../channels/whiteboard/look";
import { Eraser, Sketch, Write, rr } from "../../../channels/whiteboard/sketch";
import { Paper, WALL, WALL_CATS, arrow, stick } from "../drawings";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";
import { ramp } from "./util";

const CLOCK = rr.circle(620, 450, 360, { seed: 180, width: 6 });
const TICKS = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  return rr.line(620 + Math.sin(a) * 150, 450 - Math.cos(a) * 150, 620 + Math.sin(a) * 170, 450 - Math.cos(a) * 170, { seed: 181 + i, width: 4 });
}).flat();
const GHOST = stick(1450, 720, 260, 195, "rgba(31,32,35,0.35)", "up");
const SMALL = { x: 150, y: 260, w: 420, h: 380 };
const MINI = Array.from({ length: 6 }, (_, k) => rr.curve([[SMALL.x + 80, SMALL.y + 200 + (k % 3) * 10], [SMALL.x + 180, SMALL.y + 150], [SMALL.x + 260, SMALL.y + 210], [SMALL.x + 340, SMALL.y + 170]], { seed: 200 + k, width: 5, single: true }));
const BETTER = arrow(WALL.x - 20, WALL.y + 4 * WALL.cell * 1.05 + 30, WALL.x + WALL.cols * WALL.cell, WALL.y + 4 * WALL.cell * 1.05 + 30, 210, ink.green);

// 0 · the clock keeps turning; "完美" is a dotted figure on the horizon that never arrives.
// 1 · side by side: you, still erasing the first stroke — and someone else's
//     wall, drawing after drawing, each one a bit better than the last.
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const t1 = frame - cues[1];
  const cyc = 2 * BEAT;
  const k = Math.max(0, Math.floor(t1 / cyc)) % MINI.length;
  const ph = t1 - Math.floor(t1 / cyc) * cyc;
  const shown = Math.max(0, Math.min(WALL_CATS.length, Math.floor(t1 / (HALF_BEAT * 0.9))));
  return (
    <BoardFrame duration={duration}>
      {t1 < 0 ? (
        <>
          <Sketch strokes={CLOCK} progress={ramp(frame, 0, BEAT)} />
          <Sketch strokes={TICKS} progress={ramp(frame, BEAT, 2 * BEAT)} hand={false} />
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <line x1={620} y1={450} x2={620 + Math.sin(frame / 6) * 140} y2={450 - Math.cos(frame / 6) * 140} stroke={ink.red} strokeWidth={7} strokeLinecap="round" />
            <line x1={620} y1={450} x2={620 + Math.sin(frame / 72) * 90} y2={450 - Math.cos(frame / 72) * 90} stroke={ink.black} strokeWidth={10} strokeLinecap="round" />
          </svg>
          <div style={{ position: "absolute", inset: 0, opacity: 0.5 + 0.2 * Math.sin(frame / 8) }}>
            <Sketch strokes={GHOST} progress={ramp(frame, 2 * BEAT, 4 * BEAT)} />
          </div>
          <Write text="完美 · 还没来…" x={1450} y={330} size={48} align="center" progress={ramp(frame, 4 * BEAT, 5 * BEAT)} color={ink.grey} />
        </>
      ) : (
        <>
          <Paper x={SMALL.x} y={SMALL.y} w={SMALL.w} h={SMALL.h} />
          <div style={{ position: "absolute", inset: 0, opacity: 1 - ramp(ph, BEAT + 2, cyc - 1) }}>
            <Sketch strokes={MINI[k]} progress={ramp(ph, 2, BEAT - 2)} hand={false} />
          </div>
          <Eraser x={SMALL.x + 80} y={SMALL.y + 120} w={260} h={140} progress={ramp(ph, BEAT + 2, cyc - 1)} />
          <Write text="你：还在等" x={SMALL.x + SMALL.w / 2} y={SMALL.y - 80} size={44} align="center" progress={1} hand={false} color={ink.red} />
          <Write text="别人：" x={WALL.x} y={WALL.y - 80} size={44} progress={1} hand={false} color={ink.green} />
          {WALL_CATS.slice(0, shown + 1).map((c, i) => (
            <Sketch key={i} strokes={c} progress={i < shown ? 1 : ramp(t1 - i * HALF_BEAT * 0.9, 0, HALF_BEAT * 0.9)} hand={i === shown} />
          ))}
          <Sketch strokes={BETTER} progress={ramp(t1, 10 * BEAT, 11 * BEAT)} hand={false} />
          <Write text="越往后越好" x={WALL.x + 120} y={WALL.y + 4 * WALL.cell * 1.05 + 46} size={40} progress={ramp(t1, 11 * BEAT, 12 * BEAT)} color={ink.green} hand={false} />
        </>
      )}
      {Array.from({ length: 8 }, (_, i) => (
        <Sfx key={i} name="shutter" at={i * BEAT} volume={0.08} />
      ))}
      {Array.from({ length: 20 }, (_, i) => (
        <Sfx key={`c${i}`} name="glint" at={cues[1] + Math.round(i * HALF_BEAT * 0.9)} volume={0.08} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </BoardFrame>
  );
};
