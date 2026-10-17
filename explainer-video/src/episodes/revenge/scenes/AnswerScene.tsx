import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { DayBar } from "../puppet";
import { Person } from "../../solitude/porcupine";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const GRAY = "#3a4456", WORK = "#5a6a86", MSG = "#7a6a8a";
export const DAY: [number, number, string, string][] = [
  [0, 7, "睡眠", GRAY],
  [7, 9, "通勤", "#4a5468"],
  [9, 19, "工作", WORK],
  [19, 20.5, "通勤", "#4a5468"],
  [20.5, 23, "消息·家务", MSG],
];

// 0 · the day as a 24-hour bar: sleep, commute, work, commute, chores. 属于自己: 0.
// 1 · a "sleep" button at the end of the bar: press it and the day is over.
//     He holds his hand back.
// 2 · so he grabs the hours after midnight and paints them his: 抢回来的 3 小时.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const reveal = interpolate(frame, [BEAT, 4 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t1 = frame - cues[1], t2 = frame - cues[2];
  const grab = interpolate(t2, [BEAT, 4 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * (2 - t) });
  const blocks: [number, number, string, string][] = [...DAY, ...(grab > 0 ? ([[23, 23 + grab * 1, "我的", palette.accent]] as [number, number, string, string][]) : [])];
  const X = 260, W = 1400;
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", left: X, top: 220, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: palette.dim }}>你的一天 · 24h</div>
      <DayBar x={X} y={270} w={W} blocks={blocks} reveal={reveal} />
      {/* the after-midnight hours, wrapped round to the right of 24:00 */}
      {grab > 0 && (
        <div style={{ position: "absolute", left: X + W + 8, top: 270, width: 200 * grab, height: 70, background: palette.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: "#06080c", whiteSpace: "nowrap", overflow: "hidden", boxShadow: `0 0 30px rgba(${palette.accentRgb},0.5)` }}>
          00:00—02:00
        </div>
      )}
      <div style={{ position: "absolute", left: X, top: 400, fontSize: 44, fontWeight: 900 }}>
        属于自己：<span style={{ fontFamily: fonts.mono, color: grab > 0 ? palette.accent : palette.alert, opacity: grab > 0 || Math.floor(frame / 8) % 2 ? 1 : 0.4 }}>{grab > 0 ? `${(grab * 3).toFixed(1)} 小时（抢回来的）` : "0 分钟"}</span>
      </div>
      {t1 >= 0 && frame < cues[2] && (
        <div style={{ position: "absolute", inset: 0 }}>
          <div style={{ position: "absolute", left: 1200, top: 480, padding: "20px 36px", borderRadius: 14, background: "#2a3242", border: `2px solid ${palette.alert}`, fontSize: 36, fontWeight: 900, color: palette.alert }}>睡觉 = 今天结束</div>
          <Person x={980} bottom={820} height={230} pose="hunch" glow={0.4} />
          <div style={{ position: "absolute", left: 1060, top: 560 + Math.sin(t1 / 6) * 6, width: 120, height: 26, borderRadius: 13, background: "#141a24", border: `1px solid ${palette.faint}` }} />
          <div style={{ position: "absolute", left: 1080, top: 610, fontFamily: fonts.mono, fontSize: 22, color: palette.dim }}>…再等等</div>
        </div>
      )}
      {[1, 2, 3, 4, 5].map((k) => (
        <Sfx key={k} name="glint" at={Math.round(k * 0.6 * BEAT) + BEAT} volume={0.15} />
      ))}
      <Sfx name="stamp" at={cues[1] + BEAT} volume={0.5} />
      <Sfx name="rise" at={cues[2]} volume={0.3} />
      <Sfx name="glint" at={cues[2] + 4 * BEAT} volume={0.45} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
