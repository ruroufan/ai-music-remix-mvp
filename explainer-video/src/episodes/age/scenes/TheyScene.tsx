import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Walker } from "../../nostalgia/road";
import { Axis, SpeedLines } from "../timeline";
import { Runner } from "./HookScene";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const TABLE = [
  ["26 岁", "结婚"],
  ["28 岁", "买房"],
  ["29 岁", "升职"],
  ["30 岁", "生娃"],
];

// 0 · das Man: rows of identical runners in lockstep, stride for stride.
// 1 · the timetable they all run to, stamped line by line: 统一时间表.
// 2 · on the axis: a "标准进度" flag pulling ahead, him behind it, every pin
//     he hasn't reached turning red — 落后 2 年.
export const TheyScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const seg = (i: number) => frame >= cues[i] && (i + 1 >= cues.length || frame < cues[i + 1]);
  const segIn = (i: number) => interpolate(frame, [cues[i], cues[i] + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t1 = frame - cues[1], t2 = frame - cues[2];
  const rows = Math.max(0, Math.min(TABLE.length, Math.floor((t1 - BEAT) / BEAT) + 1));
  const age = 26 + t2 * 0.01;
  const gap = interpolate(t2, [BEAT, 5 * BEAT], [0.2, 2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <ObsFrame duration={duration}>
      {seg(0) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(0) }}>
          {Array.from({ length: 3 }, (_, r) => (
            <React.Fragment key={r}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 360 + r * 170, height: 3, background: palette.faint }} />
              {Array.from({ length: 7 }, (_, c) => (
                <Walker key={c} x={260 + c * 230 + (r % 2) * 110} bottom={360 + r * 170} height={130} face="right" walk={(frame / HALF_BEAT) * Math.PI} lean={8} glow={0.25} opacity={0.55 + r * 0.15} />
              ))}
            </React.Fragment>
          ))}
          <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", fontSize: 54, fontWeight: 900, letterSpacing: 8 }}>
            常人 <span style={{ fontFamily: fonts.mono, fontSize: 28, color: palette.dim, letterSpacing: 4 }}>das Man</span>
          </div>
        </div>
      )}
      {seg(1) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(1) }}>
          <div style={{ position: "absolute", left: 660, top: 150, width: 600, height: 620, background: "#ece8e0", color: "#1a1714", padding: "36px 56px", boxSizing: "border-box", boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ fontSize: 40, fontWeight: 900, textAlign: "center", marginBottom: 30, letterSpacing: 6 }}>统一时间表</div>
            {TABLE.map(([a, what], i) => (
              <div key={a} style={{ display: "flex", justifyContent: "space-between", fontSize: 40, fontWeight: 800, height: 90, alignItems: "center", borderBottom: "2px dashed rgba(26,23,20,0.25)", opacity: i < rows ? 1 : 0.15 }}>
                <span style={{ fontFamily: fonts.mono }}>{a}</span>
                <span>{what}</span>
              </div>
            ))}
          </div>
          {rows >= TABLE.length && <div style={{ position: "absolute", left: 1090, top: 590, padding: "8px 20px", border: `5px solid ${palette.alert}`, color: palette.alert, fontSize: 40, fontWeight: 900, transform: "rotate(-12deg)" }}>人人适用</div>}
        </div>
      )}
      {seg(2) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(2) }}>
          <SpeedLines frame={frame} speed={16} />
          <Axis age={age} behind={age + 0.5} />
          {/* the "standard pace" marker, pulling ahead */}
          <div style={{ position: "absolute", left: 760 + gap * 300 - 3, top: 300, width: 6, height: 340, background: palette.accent }} />
          <div style={{ position: "absolute", left: 760 + gap * 300 + 12, top: 300, fontFamily: fonts.mono, fontSize: 22, color: palette.accent }}>标准进度 ▶</div>
          <Runner frame={frame} speed={1.6} />
          <div style={{ position: "absolute", left: 760, top: 720, width: gap * 300, height: 8, background: palette.alert }} />
          <div style={{ position: "absolute", left: 760, top: 740, fontFamily: fonts.mono, fontSize: 34, color: palette.alert, opacity: 0.6 + 0.4 * Math.abs(Math.sin(frame / 5)) }}>落后 {gap.toFixed(1)} 年</div>
        </div>
      )}
      {Array.from({ length: 10 }, (_, k) => (
        <Sfx key={k} name="step" at={k * BEAT} volume={0.14} />
      ))}
      {TABLE.map((_, i) => (
        <Sfx key={`t${i}`} name="stamp" at={cues[1] + (i + 1) * BEAT} volume={0.35} />
      ))}
      <Sfx name="glitch" at={cues[2] + BEAT} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
