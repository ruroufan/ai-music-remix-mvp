import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Person } from "../../solitude/porcupine";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const NODES = ["白天被拿走", "深夜不肯睡", "明天更累", "更不甘心"];

// 0 · the loop: day taken → won't sleep → more tired → more resentful → …,
//     each node lighting on the beat, the battery dropping a notch per lap.
// 1 · the hours he "took back" are cut out of his own silhouette: a glowing
//     slab floating away from his chest, tagged 来自：你自己.
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const step = Math.floor(frame / BEAT);
  const lit = step % NODES.length;
  const laps = Math.floor(step / NODES.length);
  const battery = Math.max(0.08, 0.9 - laps * 0.28 - (lit / NODES.length) * 0.07);
  const t1 = frame - cues[1];
  const out = interpolate(t1, [BEAT, 4 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * (2 - t) });
  const C = { x: 820, y: 470, r: 240 };
  return (
    <ObsFrame duration={duration}>
      {frame < cues[1] && (
        <>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <circle cx={C.x} cy={C.y} r={C.r} fill="none" stroke={palette.faint} strokeWidth={3} strokeDasharray="10 10" strokeDashoffset={-frame * 2} />
          </svg>
          {NODES.map((n, i) => {
            const a = (i / NODES.length) * Math.PI * 2 - Math.PI / 2;
            const on = i === lit;
            return (
              <div key={n} style={{ position: "absolute", left: C.x + Math.cos(a) * C.r, top: C.y + Math.sin(a) * C.r, transform: `translate(-50%, -50%) scale(${on ? 1.12 : 1})`, padding: "12px 22px", borderRadius: 12, background: on ? "rgba(255,77,109,0.2)" : "rgba(6,8,12,0.9)", border: `2px solid ${on ? palette.alert : palette.faint}`, fontSize: 30, fontWeight: 700, whiteSpace: "nowrap" }}>
                {n}
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 1360, top: 380, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim }}>
            第 {laps + 1} 圈
            <div style={{ marginTop: 10, width: 240, height: 40, border: `2px solid ${palette.dim}`, borderRadius: 6, padding: 3, boxSizing: "border-box" }}>
              <div style={{ width: `${battery * 100}%`, height: "100%", borderRadius: 3, background: battery < 0.3 ? palette.alert : palette.accent }} />
            </div>
          </div>
        </>
      )}
      {frame >= cues[1] && (
        <>
          <Horizon y={800} />
          <Person x={760} bottom={800} height={300} glow={0.5} />
          {/* the hole and the slab */}
          <div style={{ position: "absolute", left: 760 - 30, top: 800 - 300 + 100, width: 60, height: 80, background: "#06080c", border: `2px dashed ${palette.alert}`, opacity: out }} />
          <div style={{ position: "absolute", left: 760 - 30 + out * 420, top: 800 - 300 + 100 - out * 120, width: 60, height: 80, background: palette.accent, boxShadow: `0 0 30px rgba(${palette.accentRgb},0.6)`, transform: `rotate(${out * 14}deg)` }} />
          <div style={{ position: "absolute", left: 1240, top: 430, fontSize: 32, fontWeight: 900, opacity: out }}>
            抢回来的 3 小时
            <div style={{ fontFamily: fonts.mono, fontSize: 22, color: palette.alert, marginTop: 10, fontWeight: 400 }}>来自：你自己</div>
            <div style={{ fontFamily: fonts.mono, fontSize: 20, color: palette.dim, marginTop: 8, fontWeight: 400 }}>−睡眠 −健康 −明天的精力</div>
          </div>
        </>
      )}
      {Array.from({ length: 10 }, (_, k) => (
        <Sfx key={k} name="glint" at={k * BEAT} volume={0.12} />
      ))}
      <Sfx name="shatter" at={cues[1] + BEAT} volume={0.4} />
      <Sfx name="whoosh" at={cues[1] + 2 * BEAT} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
