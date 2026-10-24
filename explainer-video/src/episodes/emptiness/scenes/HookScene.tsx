import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Seated } from "../../friction/tangle";
import { Bokeh, Cam } from "../../glass/immersive";
import { BRASS, PAIN, swing } from "../pendulum";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BAR, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const DAYS = ["一", "二", "三", "四", "五", "六", "日"];
const FLOOR = 720;

// 0 · a holiday. A man on a chair in a big empty room; on the wall the week —
//     five days crammed with blocks, the weekend blank — and a hollow ring
//     opening up behind him; the 空 gauge creeping up.
// 1 · a pendulum's shadow starts to swing across the wall; the gauge reads
//     heavier the emptier the day gets.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const ring = interpolate(frame, [0, duration], [120, 380], clamp);
  const gauge = interpolate(frame, [0, duration], [0.25, 0.92], clamp);
  const shadow = interpolate(frame, [c1, c1 + 12], [0, 1], clamp);
  const deg = swing(frame, BAR, 30);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.1]} focus={{ x: 760, y: 520 }}>
        {/* the pendulum's shadow on the back wall */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 0.5 * shadow }}>
          <g transform={`rotate(${-deg} 1150 40)`}>
            <line x1={1150} y1={40} x2={1150} y2={560} stroke="rgba(0,0,0,0.9)" strokeWidth={10} />
            <circle cx={1150} cy={600} r={60} fill="rgba(0,0,0,0.9)" stroke={`rgba(${BRASS},0.35)`} strokeWidth={2} />
          </g>
        </svg>
        {/* the void */}
        <div style={{ position: "absolute", left: 700 - ring, top: 470 - ring, width: ring * 2, height: ring * 2, borderRadius: "50%", border: `2px solid rgba(232,238,242,0.25)`, background: "radial-gradient(circle, rgba(0,0,0,0.85), rgba(0,0,0,0.5) 60%, transparent 72%)" }} />
        {/* the week */}
        <div style={{ position: "absolute", left: 1180, top: 170, display: "flex", gap: 10 }}>
          {DAYS.map((d, i) => (
            <div key={d} style={{ width: 70, textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: i > 4 ? palette.ink : palette.dim, marginBottom: 8 }}>{d}</div>
              <div style={{ height: 200, borderRadius: 8, border: `2px solid ${i > 4 ? "rgba(232,238,242,0.5)" : palette.faint}`, padding: 6, display: "flex", flexDirection: "column", gap: 5 }}>
                {i <= 4 && Array.from({ length: 6 }, (_, k) => <div key={k} style={{ height: 24, borderRadius: 4, background: `rgba(${palette.accentRgb},${0.25 + 0.1 * ((i + k) % 3)})` }} />)}
              </div>
            </div>
          ))}
        </div>
        <div style={{ position: "absolute", left: 1180, top: 420, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: palette.dim }}>上班 ████ · 放假 ░░</div>
        <Seated x={760} floor={FLOOR} scale={1.25} glow={0.5} slump={0.6} />
        {/* the gauge */}
        <div style={{ position: "absolute", left: 1180, top: 520, width: 520 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, fontWeight: 800 }}>
            <span>空</span>
            <span style={{ fontFamily: fonts.mono, color: gauge > 0.7 ? `rgb(${PAIN})` : palette.ink }}>{Math.round(gauge * 100)}%</span>
          </div>
          <div style={{ marginTop: 10, height: 16, borderRadius: 8, background: "rgba(255,255,255,0.08)" }}>
            <div style={{ width: `${gauge * 100}%`, height: "100%", borderRadius: 8, background: `linear-gradient(90deg, rgba(232,238,242,0.4), rgb(${PAIN}))` }} />
          </div>
          <div style={{ marginTop: 14, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim, opacity: shadow }}>越闲 ↑ · 越重 ↑</div>
        </div>
        <div style={{ position: "absolute", left: 240, top: 170, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 4, color: palette.dim }}>假期 · 第 {frame < c1 ? 1 : 3} 天</div>
        <div style={{ position: "absolute", left: 240, top: 214, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.faint }}>待办 0 · 消息 0 · 闹钟 关</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR, height: 2, background: "linear-gradient(90deg, transparent, rgba(232,238,242,0.15), transparent)" }} />
      </Cam>
      <Bokeh frame={frame} n={6} opacity={0.6} />
      <Sfx name="rise" at={0} volume={0.2} />
      <Sfx name="whoosh" at={c1} volume={0.35} />
      {[0, 1, 2].map((k) => (
        <Sfx key={k} name="step" at={c1 + BEAT + k * 2 * BEAT} volume={0.15} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
