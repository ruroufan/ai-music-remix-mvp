import React from "react";
import { useCurrentFrame } from "remotion";
import { BoardFrame } from "../../../channels/whiteboard/BoardFrame";
import { ink } from "../../../channels/whiteboard/look";
import { Sketch, Write, rr } from "../../../channels/whiteboard/sketch";
import { Paper, arrow, cross } from "../drawings";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";
import { ramp } from "./util";

// 1 · the essay: line one written, struck through, rewritten — a week of tally marks.
const DOC = { x: 520, y: 170, w: 560, h: 600 };
const LINE1 = (k: number) => rr.curve([[DOC.x + 50, DOC.y + 150 + k * 3], [DOC.x + 250, DOC.y + 140], [DOC.x + 480, DOC.y + 152]], { seed: 60 + k, width: 4, rough: 1.5 });
const STRIKE = (k: number) => rr.line(DOC.x + 40, DOC.y + 148 + k * 3, DOC.x + 500, DOC.y + 140, { seed: 70 + k, width: 6, color: ink.red });
const L1 = Array.from({ length: 7 }, (_, k) => LINE1(k));
const S1 = Array.from({ length: 7 }, (_, k) => STRIKE(k));
const TALLY = Array.from({ length: 7 }, (_, k) => (k === 4 ? rr.line(1180, 330, 1340, 250, { seed: 80, width: 5 }) : rr.line(1190 + (k > 4 ? k - 1 : k) * 32, 220, 1190 + (k > 4 ? k - 1 : k) * 32, 360, { seed: 81 + k, width: 5 })));
// 2 · the art supplies, bought before a single drawing
const TOOLS = [
  { s: [...rr.line(260, 700, 340, 380, { seed: 90 }), ...rr.line(420, 700, 340, 380, { seed: 91 }), ...rr.rect(270, 420, 140, 170, { seed: 92 })], label: "画架 ¥680", x: 340 },
  { s: [...rr.rect(560, 560, 160, 110, { seed: 93 }), ...[0, 1, 2, 3].flatMap((i) => rr.circle(590 + i * 34, 600, 22, { seed: 94 + i, color: [ink.red, ink.blue, ink.green, ink.orange][i], fill: [ink.red, ink.blue, ink.green, ink.orange][i], gap: 5 }))], label: "颜料 ¥420", x: 640 },
  { s: [...rr.line(860, 690, 920, 420, { seed: 100, width: 6 }), ...rr.line(900, 700, 960, 430, { seed: 101, width: 6 }), ...rr.line(940, 700, 1000, 440, { seed: 102, width: 6 })], label: "画笔 ¥260", x: 930 },
  { s: [...rr.rect(1080, 420, 260, 190, { seed: 103 }), ...rr.circle(1210, 640, 16, { seed: 104 })], label: "数位板 ¥1920", x: 1210 },
];
const CANVAS = rr.rect(1440, 300, 260, 320, { seed: 105, width: 4 });
// 3 · the résumé, adjusted forever
const CV = { x: 600, y: 170, w: 460, h: 600 };
const CV_LINES = [0, 1, 2, 3, 4, 5, 6].flatMap((i) => rr.line(CV.x + 50, CV.y + 160 + i * 52, CV.x + 380 - (i % 3) * 40, CV.y + 160 + i * 52, { seed: 110 + i, width: 4 }));
const CV_ARROWS = [...arrow(CV.x - 120, CV.y + 200, CV.x - 20, CV.y + 200, 120, ink.blue), ...arrow(CV.x + CV.w + 120, CV.y + 300, CV.x + CV.w + 20, CV.y + 300, 122, ink.blue), ...arrow(CV.x + 230, CV.y - 60, CV.x + 230, CV.y + 30, 124, ink.blue)];
const ENVELOPE = [...rr.rect(1300, 420, 300, 190, { seed: 130, width: 5 }), ...rr.poly([[1300, 420], [1450, 530], [1600, 420]], { seed: 131, width: 5 })];
const NOT_SENT = cross(1450, 515, 90, 132);

export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const t0 = frame, t1 = frame - cues[1], t2 = frame - cues[2];
  const day = Math.min(6, Math.floor(t0 / BEAT));
  const ver = Math.max(1, Math.min(37, Math.round(1 + (t2 / (6 * BEAT)) * 36)));
  return (
    <BoardFrame duration={duration}>
      {t1 < 0 && (
        <>
          <Paper x={DOC.x} y={DOC.y} w={DOC.w} h={DOC.h} />
          <Write text="开头" x={DOC.x + 40} y={DOC.y + 40} size={50} progress={1} hand={false} />
          {Array.from({ length: day + 1 }, (_, k) => (
            <div key={k} style={{ position: "absolute", inset: 0, opacity: k < day ? 0.25 : 1 }}>
              <Sketch strokes={L1[k]} progress={ramp(t0 - k * BEAT, 0, 8)} hand={k === day} dy={(k - day) * 0} />
              {k < day && <Sketch strokes={S1[k]} progress={1} hand={false} />}
            </div>
          ))}
          <Write text="第二段：" x={DOC.x + 40} y={DOC.y + 280} size={44} progress={1} hand={false} color={ink.grey} />
          {TALLY.slice(0, day + 1).map((s, k) => (
            <Sketch key={k} strokes={s} progress={ramp(t0 - k * BEAT, 4, 10)} hand={false} />
          ))}
          <Write text={`第 ${day + 1} 天`} x={1190} y={400} size={56} progress={1} hand={false} color={ink.red} />
        </>
      )}
      {t1 >= 0 && t2 < 0 && (
        <>
          {TOOLS.map((tool, i) => (
            <React.Fragment key={tool.label}>
              <Sketch strokes={tool.s} progress={ramp(t1, i * 1.5 * BEAT, i * 1.5 * BEAT + BEAT)} />
              <Write text={tool.label} x={tool.x} y={720} size={34} align="center" progress={ramp(t1, i * 1.5 * BEAT + BEAT, i * 1.5 * BEAT + 1.4 * BEAT)} hand={false} color={ink.blue} />
            </React.Fragment>
          ))}
          <Sketch strokes={CANVAS} progress={ramp(t1, 6 * BEAT, 7 * BEAT)} />
          <Write text="画了：0 张" x={1570} y={650} size={40} align="center" progress={ramp(t1, 7 * BEAT, 8 * BEAT)} color={ink.red} />
        </>
      )}
      {t2 >= 0 && (
        <>
          <Paper x={CV.x} y={CV.y} w={CV.w} h={CV.h} />
          <Write text="简历" x={CV.x + 50} y={CV.y + 50} size={56} progress={1} hand={false} />
          <Sketch strokes={CV_LINES} progress={ramp(t2, 0, 2 * BEAT)} />
          <Sketch strokes={CV_ARROWS} progress={ramp(t2, 2 * BEAT, 4 * BEAT)} />
          <Write text={`格式 v${ver}`} x={CV.x + CV.w + 40} y={CV.y + 40} size={52} progress={1} hand={false} color={ink.blue} />
          <Sketch strokes={ENVELOPE} progress={ramp(t2, 5 * BEAT, 6.5 * BEAT)} />
          <Write text="投递" x={1450} y={630} size={44} align="center" progress={ramp(t2, 6.5 * BEAT, 7 * BEAT)} hand={false} />
          <Sketch strokes={NOT_SENT} progress={ramp(t2, 7.5 * BEAT, 8.5 * BEAT)} />
        </>
      )}
      {Array.from({ length: 7 }, (_, k) => (
        <Sfx key={k} name="glint" at={k * BEAT + 2} volume={0.12} />
      ))}
      {TOOLS.map((_, i) => (
        <Sfx key={`t${i}`} name="stamp" at={cues[1] + Math.round(i * 1.5 * BEAT + BEAT)} volume={0.2} />
      ))}
      {Array.from({ length: 8 }, (_, k) => (
        <Sfx key={`v${k}`} name="shutter" at={cues[2] + k * HALF_BEAT} volume={0.1} />
      ))}
      <Sfx name="stamp" at={cues[2] + Math.round(7.5 * BEAT)} volume={0.45} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </BoardFrame>
  );
};
