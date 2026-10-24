import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { SUN } from "../field";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const CHOICES = ["选了这个", "留下来", "不换了", "为它负责", "再试一次"];

// An empty outline of a person. Choice cards drop in one per beat — 选了这个 ·
// 留下来 · 不换了 · 为它负责 · 再试一次 — and each one fills him a little
// higher, feet first, until the whole figure glows: 成为自己.
export const TurnScene: React.FC<SceneProps> = ({ duration, lines, cues }) => {
  const frame = useCurrentFrame();
  const at = (i: number) => BEAT + i * BEAT;
  const fill = interpolate(frame, [at(0), at(CHOICES.length - 1) + 10], [0, 1], clamp);
  const done = ramp(frame, at(CHOICES.length - 1) + 12, 10);
  const H = 560, top = 260;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} hits={[...CHOICES.map((_, i) => at(i)), at(CHOICES.length - 1) + 12, ...keyHits(lines, cues, duration)]}>
        <Halo x={960} y={540} r={360} intensity={0.9 * done} rgb={SUN} />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <clipPath id="enfp-me">
              <circle cx={960} cy={top + 60} r={56} />
              <path d={`M890 ${top + 130} Q960 ${top + 110} 1030 ${top + 130} L1040 ${top + 340} L1000 ${top + 340} L995 ${top + H} L965 ${top + H} L960 ${top + 380} L955 ${top + H} L925 ${top + H} L920 ${top + 340} L880 ${top + 340} Z`} />
            </clipPath>
          </defs>
          <rect x={860} y={top + H - H * fill} width={200} height={H * fill} fill={`rgba(${SUN},0.85)`} clipPath="url(#enfp-me)" />
          <circle cx={960} cy={top + 60} r={56} fill="none" stroke={`rgba(${SUN},0.7)`} strokeWidth={3} strokeDasharray={done > 0 ? undefined : "8 6"} />
          <path d={`M890 ${top + 130} Q960 ${top + 110} 1030 ${top + 130} L1040 ${top + 340} L1000 ${top + 340} L995 ${top + H} L965 ${top + H} L960 ${top + 380} L955 ${top + H} L925 ${top + H} L920 ${top + 340} L880 ${top + 340} Z`} fill="none" stroke={`rgba(${SUN},0.7)`} strokeWidth={3} strokeDasharray={done > 0 ? undefined : "8 6"} />
        </svg>
        {CHOICES.map((c, i) => {
          const p = ramp(frame, at(i), 6);
          const side = i % 2 ? 1 : -1;
          return <div key={c} style={{ position: "absolute", left: 960 + side * 260 - (side < 0 ? 240 : 0), width: 240, top: 300 + i * 90, textAlign: "center", padding: "10px 0", borderRadius: 12, border: `2px solid rgb(${SUN})`, background: `rgba(${SUN},0.12)`, fontSize: 30, fontWeight: 900, color: palette.ink, opacity: p, transform: `translateX(${side * (1 - p) * 80}px)` }}>✓ {c}</div>;
        })}
        <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 10, color: palette.dim }}>KIERKEGAARD · 选择</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 860, textAlign: "center", fontSize: 50, fontWeight: 900, letterSpacing: 14, color: `rgb(${SUN})`, textShadow: `0 0 24px rgba(${SUN},0.8)`, opacity: done }}>成为自己</div>
      </Cam>
      <Bokeh frame={frame} rgb={SUN} opacity={0.3 + 0.4 * done} />
      {CHOICES.map((_, i) => (
        <Sfx key={i} name="stamp" at={at(i)} volume={0.3} />
      ))}
      <Sfx name="glint" at={at(CHOICES.length - 1) + 12} volume={0.6} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
