import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { TearCalendar } from "../calendar";
import { Person } from "../../solitude/porcupine";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const FLOOR = 780;
const GYM = { words: ["明天", "明天", "下周一", "下周一", "下个月"], subs: ["开始健身", "开始健身", "开始健身", "一定开始", "再说吧"] };

const Laptop: React.FC<{ x: number; y: number; title: string; words: number; glow?: number }> = ({ x, y, title, words, glow = 0.2 }) => (
  <div style={{ position: "absolute", left: x, top: y }}>
    <div style={{ width: 300, height: 190, borderRadius: 10, border: "6px solid #2a3242", background: `rgba(160,200,230,${0.12 + glow * 0.4})`, boxShadow: `0 0 ${60 * glow}px rgba(160,210,255,${glow})`, padding: 16, boxSizing: "border-box", fontFamily: fonts.mono, color: palette.ink }}>
      <div style={{ fontSize: 18 }}>{title}</div>
      <div style={{ fontSize: 40, fontWeight: 700, marginTop: 30 }}>{words.toLocaleString("en-US")} 字</div>
    </div>
    <div style={{ width: 360, height: 14, marginLeft: -30, borderRadius: 4, background: "#2a3242" }} />
  </div>
);

// 1 · the report is due next week; meanwhile the shelf straightens itself one
//     book per beat. Room 100% · report 0 words.
// 2 · "明天开始健身" — torn off — "明天" — "下周一" — "下个月". The dumbbell gathers dust.
// 3 · the night before: the clock spins to dawn and the word count rockets.
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const seg = (i: number) => frame >= cues[i] && (i + 1 >= cues.length || frame < cues[i + 1]);
  const segIn = (i: number) => interpolate(frame, [cues[i], cues[i] + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t0 = frame - cues[0], t2 = frame - cues[2];
  const tidy = Math.max(0, Math.min(8, Math.floor((t0 - BEAT) / (BEAT * 0.8)) + 1));
  const night = interpolate(t2, [BEAT, 9 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t });
  const minutes = 23 * 60 + Math.round(night * 7 * 60) - 0;
  const clock = `${String(Math.floor(minutes / 60) % 24).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

  return (
    <ObsFrame duration={duration}>
      {seg(0) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(0) }}>
          <Horizon y={FLOOR} />
          {/* the shelf */}
          <div style={{ position: "absolute", left: 300, top: 420, width: 620, height: 12, background: "#3a2a1e" }} />
          {Array.from({ length: 8 }, (_, i) => {
            const done = i < tidy;
            const rot = done ? 0 : (random(`bk-${i}`) - 0.5) * 50;
            return <div key={i} style={{ position: "absolute", left: 330 + i * 70, top: 300, width: 48, height: 120, borderRadius: 3, transformOrigin: "50% 100%", transform: `rotate(${rot}deg)`, background: `hsl(${(i * 47) % 360} 30% ${done ? 40 : 25}%)`, border: "1px solid rgba(255,255,255,0.15)" }} />;
          })}
          {Array.from({ length: tidy }, (_, i) => (
            <div key={i} style={{ position: "absolute", left: 340 + i * 70, top: 260 - (i % 2) * 20, color: "#fff7d6", fontSize: 26, opacity: 0.5 + 0.5 * Math.abs(Math.sin(frame / 5 + i)) }}>✦</div>
          ))}
          <Person x={620} bottom={FLOOR} height={230} glow={0.6} />
          <Laptop x={1220} y={430} title="报告.docx · 下周交" words={0} />
          <div style={{ position: "absolute", left: 300, top: 200, fontFamily: fonts.mono, fontSize: 24, letterSpacing: 4, color: palette.accent }}>房间整洁度 {Math.round((tidy / 8) * 100)}%</div>
          <div style={{ position: "absolute", left: 1220, top: 380, fontFamily: fonts.mono, fontSize: 24, letterSpacing: 4, color: palette.alert }}>报告进度 0%</div>
        </div>
      )}

      {seg(1) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(1) }}>
          <Horizon y={FLOOR} />
          <TearCalendar x={1000} y={150} w={340} frame={frame - cues[1]} tears={[2, 4, 6, 8].map((b) => b * BEAT)} words={(i) => GYM.words[i] ?? "下个月"} subs={(i) => GYM.subs[i]} />
          <Person x={600} bottom={FLOOR} height={230} glow={0.5} />
          {/* the dumbbell, getting dusty */}
          <svg width={240} height={80} style={{ position: "absolute", left: 700, top: FLOOR - 70 }}>
            <rect x={20} y={20} width={30} height={50} rx={6} fill="#2a3242" />
            <rect x={190} y={20} width={30} height={50} rx={6} fill="#2a3242" />
            <rect x={50} y={38} width={140} height={14} fill="#3a4456" />
            {Array.from({ length: Math.floor(interpolate(frame - cues[1], [0, 9 * BEAT], [0, 30], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })) }, (_, i) => (
              <circle key={i} cx={20 + random(`du-${i}`) * 200} cy={20 + random(`dv-${i}`) * 40} r={1.6} fill="rgba(232,238,242,0.5)" />
            ))}
          </svg>
        </div>
      )}

      {seg(2) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(2) }}>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 62% 55%, rgba(160,210,255,${0.12 + night * 0.15}), transparent 55%)` }} />
          <Horizon y={FLOOR} />
          <div style={{ position: "absolute", left: 960, top: 640, width: 520, height: 16, background: "#2a3242" }} />
          <Laptop x={1060} y={436} title="报告.docx · 明早 9:00 交" words={Math.round(night * 8000)} glow={0.3 + night * 0.7} />
          <Person x={860} bottom={FLOOR} height={230} pose="hunch" glow={0.5 + night * 0.5} />
          <div style={{ position: "absolute", left: 300, top: 260, fontFamily: fonts.mono, fontSize: 110, fontWeight: 700, color: palette.alert }}>{clock}</div>
          <div style={{ position: "absolute", left: 300, top: 410, fontFamily: fonts.mono, fontSize: 28, letterSpacing: 6, color: palette.accent, opacity: night > 0.3 ? 1 : 0 }}>效率 ×{Math.max(1, Math.round(night * 10))}</div>
          {night > 0.2 &&
            Array.from({ length: 12 }, (_, i) => (
              <div key={i} style={{ position: "absolute", left: 1000 + random(`sl-${i}`) * 500, top: 200 + random(`st-${i}`) * 300, width: 120 + random(`sw-${i}`) * 160, height: 2, background: `rgba(${palette.accentRgb},0.5)`, transform: `translateX(${-((frame * 30 + i * 70) % 400)}px)` }} />
            ))}
        </div>
      )}

      {Array.from({ length: 8 }, (_, i) => (
        <Sfx key={i} name="glint" at={cues[0] + BEAT + Math.round(i * BEAT * 0.8)} volume={0.14} />
      ))}
      {[2, 4, 6, 8].map((b) => (
        <Sfx key={`g${b}`} name="shutter" at={cues[1] + b * BEAT} volume={0.35} />
      ))}
      <Sfx name="rise" at={cues[2] + BEAT} volume={0.35} />
      <Sfx name="boom" at={cues[2] + 9 * BEAT} volume={0.5} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
