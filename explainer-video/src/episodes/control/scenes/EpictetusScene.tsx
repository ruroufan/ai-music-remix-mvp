import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { FLOOR, GOLD } from "../ropes";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const OWNED = [
  { t: "去哪里", x: 520, y: 260 },
  { t: "做什么", x: 1400, y: 260 },
  { t: "吃什么", x: 460, y: 520 },
  { t: "身体", x: 1460, y: 520 },
];
const INSIDE = ["判断", "选择", "行动"];
const OUTSIDE = [
  { t: "别人的想法", x: 360, y: 240 },
  { t: "天气", x: 1560, y: 220 },
  { t: "结果", x: 300, y: 560 },
  { t: "命运", x: 1620, y: 560 },
];

// 0 · a slave in chains; everything around him decided by someone else —
//     去哪里, 做什么, 吃什么, even 身体 — each one locked: 不由己.
// 1 · a light comes on in him.
// 2 · a gold circle draws itself round his feet, and into it, one per beat:
//     判断 · 选择 · 行动.
// 3 · and outside it, drifting off: 别人的想法, 天气, 结果, 命运 — 不在手里.
export const EpictetusScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2, c3] = cues;
  const chainsOff = ramp(frame, c2, 10);
  const light = ramp(frame, c1 + BEAT, 20);
  const ring = interpolate(frame, [c2, c2 + 2 * BEAT], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.1]} focus={{ x: 960, y: 520 }} hits={[c1 + BEAT]}>
        <Halo x={960} y={FLOOR - 200} r={260 + 200 * light} intensity={0.4 + 0.6 * light} rgb={GOLD} />
        <Stander x={960} bottom={FLOOR} height={320} lift={0.2 + 0.9 * light} glow={0.7 + 0.5 * light} />
        {/* chains */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 1 - chainsOff }}>
          {[-1, 1].map((s) => (
            <path key={s} d={`M${960 + s * 30} ${FLOOR - 10} Q${960 + s * 160} ${FLOOR + 30} ${960 + s * 300} ${FLOOR - 4}`} fill="none" stroke="#8a95a0" strokeWidth={6} strokeDasharray="12 6" />
          ))}
        </svg>
        {frame < c2 &&
          OWNED.map((o, i) => (
            <div key={o.t} style={{ position: "absolute", left: o.x, top: o.y, transform: "translate(-50%, -50%)", opacity: ramp(frame, BEAT + i * HALF_BEAT, 6) * (1 - ramp(frame, c2 - 6, 6)), padding: "10px 20px", borderRadius: 12, background: "rgba(14,20,28,0.9)", border: `2px solid ${palette.faint}`, fontSize: 30, fontWeight: 800, color: palette.dim, whiteSpace: "nowrap" }}>
              {o.t} <span style={{ fontSize: 18, color: palette.alert, marginLeft: 10 }}>不由己</span>
            </div>
          ))}
        {/* the circle of what's his */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <ellipse cx={960} cy={FLOOR + 6} rx={300} ry={70} fill={`rgba(${GOLD},${0.1 * ring})`} stroke={`rgba(${GOLD},0.95)`} strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring} style={{ filter: `drop-shadow(0 0 10px rgba(${GOLD},0.8))` }} />
        </svg>
        {INSIDE.map((t, i) => {
          const p = ramp(frame, c2 + (2 + i) * BEAT, 6);
          return (
            <div key={t} style={{ position: "absolute", left: 960 + (i - 1) * 190, top: 300, transform: `translate(-50%, -50%) scale(${1.5 - 0.5 * p})`, opacity: p, padding: "10px 24px", borderRadius: 26, background: `rgba(${GOLD},0.18)`, border: `2px solid rgba(${GOLD},0.9)`, fontSize: 36, fontWeight: 900, color: `rgb(${GOLD})`, boxShadow: `0 0 24px rgba(${GOLD},0.4)` }}>
              {t}
            </div>
          );
        })}
        {OUTSIDE.map((o, i) => {
          const p = ramp(frame, c3 + i * HALF_BEAT, 8);
          const drift = interpolate(frame, [c3 + 3 * BEAT, duration], [0, 1], clamp);
          return (
            <div key={o.t} style={{ position: "absolute", left: o.x + (o.x - 960) * 0.2 * drift, top: o.y - 40 * drift, transform: "translate(-50%, -50%)", opacity: p * (1 - 0.5 * drift), padding: "10px 20px", borderRadius: 12, border: "2px dashed rgba(232,238,242,0.4)", fontSize: 30, fontWeight: 800, color: palette.dim, whiteSpace: "nowrap" }}>
              {o.t}
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 960 - 200, width: 400, top: 160, textAlign: "center", fontSize: 30, fontWeight: 900, color: look.key, opacity: ramp(frame, c3 + 3 * BEAT, 8) }}>不在手里</div>
      </Cam>
      <Bokeh frame={frame} />
      {OWNED.map((_, i) => (
        <Sfx key={i} name="stamp" at={BEAT + i * HALF_BEAT} volume={0.25} />
      ))}
      <Sfx name="rise" at={c1 + BEAT} volume={0.35} />
      <Sfx name="shatter" at={c2} volume={0.35} />
      {INSIDE.map((_, i) => (
        <Sfx key={i} name="glint" at={c2 + (2 + i) * BEAT} volume={0.35} />
      ))}
      <Sfx name="whoosh" at={c3} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
