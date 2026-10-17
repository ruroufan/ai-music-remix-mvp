import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { PagePile } from "../calendar";
import { Person } from "../../solitude/porcupine";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const FLOOR = 780;
const TASKS = [
  { t: "回消息", imp: 0.12, delay: 0.08 },
  { t: "取快递", imp: 0.28, delay: 0.18 },
  { t: "年度报告", imp: 0.55, delay: 0.5 },
  { t: "毕业论文", imp: 0.78, delay: 0.76 },
  { t: "人生规划", imp: 0.95, delay: 0.96 },
];

// 0 · a chart: the more important the task, the longer it waits.
// 1 · a blank page looming as big as its importance; he shrinks from it.
// 2 · as long as he never starts, the score stays "?" — start, and it might
//     read 68: "我只能做到这样". He steps back.
// 3 · what the delay protects: an ideal self in a glass case, walled in by 明天.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const seg = (i: number) => frame >= cues[i] && (i + 1 >= cues.length || frame < cues[i + 1]);
  const segIn = (i: number) => interpolate(frame, [cues[i], cues[i] + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shown = Math.max(0, Math.min(TASKS.length, Math.floor((frame - BEAT) / BEAT) + 1));
  const t1 = frame - cues[1], t2 = frame - cues[2], t3 = frame - cues[3];
  const loom = interpolate(t1, [0, 5 * BEAT], [0.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t });
  const preview = interpolate(t2, [2 * BEAT, 3 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const back = interpolate(t2, [5 * BEAT, 6 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const wall = Math.max(0, Math.min(46, Math.floor(t3 / 3)));
  const C = { x: 360, y: 220, w: 1200, h: 520 };
  return (
    <ObsFrame duration={duration}>
      {seg(0) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(0) }}>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <line x1={C.x} y1={C.y + C.h} x2={C.x + C.w} y2={C.y + C.h} stroke={palette.dim} strokeWidth={2} />
            <line x1={C.x} y1={C.y} x2={C.x} y2={C.y + C.h} stroke={palette.dim} strokeWidth={2} />
            {shown > 1 && (
              <polyline
                points={TASKS.slice(0, shown).map((p) => `${C.x + p.imp * C.w},${C.y + C.h - p.delay * C.h}`).join(" ")}
                fill="none"
                stroke={palette.alert}
                strokeWidth={3}
              />
            )}
            {TASKS.slice(0, shown).map((p) => (
              <circle key={p.t} cx={C.x + p.imp * C.w} cy={C.y + C.h - p.delay * C.h} r={9} fill={palette.alert} />
            ))}
          </svg>
          {TASKS.slice(0, shown).map((p) => (
            <div key={p.t} style={{ position: "absolute", left: C.x + p.imp * C.w - 130, top: C.y + C.h - p.delay * C.h - 50, fontSize: 26, fontWeight: 700 }}>{p.t}</div>
          ))}
          <div style={{ position: "absolute", left: C.x + C.w - 160, top: C.y + C.h + 14, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim }}>重要程度 →</div>
          <div style={{ position: "absolute", left: C.x - 10, top: C.y - 40, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim }}>↑ 拖延时长</div>
        </div>
      )}
      {seg(1) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(1) }}>
          <Horizon y={FLOOR} />
          <div style={{ position: "absolute", left: 1150 - 260 * loom, top: FLOOR - 640 * loom, width: 520 * loom, height: 640 * loom, background: "#ece8e0", boxShadow: "0 0 80px rgba(236,232,224,0.25)" }}>
            <div style={{ position: "absolute", left: 30 * loom, top: 24 * loom, fontFamily: fonts.mono, fontSize: 28 * loom, color: "#6b625a" }}>毕业论文.docx</div>
            <div style={{ position: "absolute", left: 30 * loom, top: 80 * loom, width: 4, height: 50 * loom, background: palette.alert, opacity: Math.floor(frame / 8) % 2 }} />
          </div>
          <Person x={560 - loom * 60} bottom={FLOOR} height={250 * (1.1 - loom * 0.3)} pose="hunch" glow={0.5} />
          <div style={{ position: "absolute", left: 300, top: 260, fontFamily: fonts.mono, fontSize: 24, letterSpacing: 4, color: palette.alert }}>怕做不好 {Math.round(loom * 100)}%</div>
        </div>
      )}
      {seg(2) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(2) }}>
          <Horizon y={FLOOR} />
          {/* the closed door marked 开始 */}
          <div style={{ position: "absolute", left: 1120, top: 330, width: 240, height: FLOOR - 330, border: `3px solid ${palette.accent}`, background: "rgba(63,224,207,0.06)" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 30, textAlign: "center", fontSize: 40, fontWeight: 900, color: palette.accent }}>开始</div>
            <div style={{ position: "absolute", right: 24, top: 220, width: 18, height: 18, borderRadius: 9, background: palette.accent }} />
          </div>
          <Person x={980 - back * 380} bottom={FLOOR} height={240} pose={back > 0.5 ? "hunch" : "plain"} glow={0.5} />
          {/* the score */}
          <div style={{ position: "absolute", left: 300, top: 220, width: 380, padding: 24, border: `1px solid ${palette.faint}`, background: "rgba(6,8,12,0.85)" }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim }}>我的真实水平</div>
            <div style={{ fontFamily: fonts.mono, fontSize: 120, fontWeight: 700, color: back > 0.5 ? palette.ink : palette.dim }}>{back > 0.5 || preview === 0 ? "?" : "68"}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: palette.alert, opacity: preview * (1 - back) }}>“我只能做到这样”</div>
            <div style={{ fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.accent, opacity: back }}>不开始 = 永远不打分</div>
          </div>
        </div>
      )}
      {seg(3) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(3) }}>
          <Horizon y={FLOOR} />
          <PagePile cx={1150} floor={FLOOR} count={wall} spread={560} layer="back" />
          <div style={{ position: "absolute", left: 1000, top: 250, width: 300, height: FLOOR - 250, border: "2px solid rgba(200,230,255,0.5)", background: "linear-gradient(115deg, rgba(200,230,255,0.08), rgba(200,230,255,0.02) 40%, rgba(255,255,255,0.12) 50%, rgba(200,230,255,0.03) 60%)" }} />
          <Person x={1150} bottom={FLOOR - 10} height={280} pose="proud" glow={1.4} />
          <PagePile cx={1150} floor={FLOOR} count={wall} spread={560} layer="front" />
          <div style={{ position: "absolute", left: 1000, width: 300, top: 200, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: `rgb(${palette.halo})` }}>想象中的我 · 100 分</div>
          <Person x={500} bottom={FLOOR} height={230} glow={0.25} />
          <div style={{ position: "absolute", left: 440, top: FLOOR + 20, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim }}>真实的我</div>
        </div>
      )}
      {TASKS.map((_, i) => (
        <Sfx key={i} name="glint" at={(i + 1) * BEAT} volume={0.18} />
      ))}
      <Sfx name="rise" at={cues[1]} volume={0.3} />
      <Sfx name="stamp" at={cues[2] + 2 * BEAT} volume={0.5} />
      <Sfx name="whoosh" at={cues[2] + 5 * BEAT} volume={0.3} />
      <Sfx name="glint" at={cues[3]} volume={0.4} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
