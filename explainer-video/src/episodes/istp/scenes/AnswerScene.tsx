import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { FEEL, Feeling, GREEN, RED, STEEL } from "../bench";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const TOOLS = ["扳手", "螺丝刀", "万用表", "焊枪"];

// The glowing part in the middle. His tools line up against it one after
// another — 扳手 ✕ 螺丝刀 ✕ 万用表 ✕ 焊枪 ✕ — none of them fit. Then the two
// things that do: 说出来 ✓ · 被听见 ✓. 而你只擅长修.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const no = (i: number) => ramp(frame, c1 + i * BEAT * 0.75, 5);
  const yes = (i: number) => ramp(frame, c1 + 5 * BEAT + i * BEAT, 6);
  const only = ramp(frame, c1 + 9 * BEAT, 8);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} hits={[...TOOLS.map((_, i) => Math.round(c1 + i * BEAT * 0.75)), c1 + 5 * BEAT, c1 + 6 * BEAT, ...keyHits(lines, cues, duration)]}>
        <Feeling x={960} y={520} size={2.4} frame={frame} />
        {TOOLS.map((t, i) => (
          <div key={t} style={{ position: "absolute", left: 220, top: 260 + i * 110, padding: "8px 20px", borderRadius: 10, border: `2px solid rgba(${STEEL},0.6)`, fontSize: 32, fontWeight: 900, color: palette.dim, opacity: frame >= c1 ? 1 : ramp(frame, 4 + i * 4, 6) }}>
            {t} <span style={{ color: `rgb(${RED})`, opacity: no(i) }}>✕</span>
          </div>
        ))}
        {["说出来", "被听见"].map((t, i) => (
          <div key={t} style={{ position: "absolute", left: 1380, top: 380 + i * 130, padding: "10px 26px", borderRadius: 12, border: `3px solid rgb(${GREEN})`, fontSize: 44, fontWeight: 900, color: palette.ink, opacity: yes(i), transform: `scale(${1.3 - 0.3 * yes(i)})` }}>{t} <span style={{ color: `rgb(${GREEN})` }}>✓</span></div>
        ))}
        <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: fonts.mono, fontSize: 26, letterSpacing: 8, color: palette.dim, opacity: 1 - only }}>感受 · 不是用来修的</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontSize: 46, fontWeight: 900, letterSpacing: 10, color: `rgb(${FEEL})`, opacity: only }}>而你 · 只擅长修</div>
      </Cam>
      <Bokeh frame={frame} rgb={FEEL} opacity={0.35} />
      {TOOLS.map((_, i) => (
        <Sfx key={i} name="glitch" at={Math.round(c1 + i * BEAT * 0.75)} volume={0.15} />
      ))}
      {[0, 1].map((i) => (
        <Sfx key={`y${i}`} name="glint" at={c1 + 5 * BEAT + i * BEAT} volume={0.35} />
      ))}
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
