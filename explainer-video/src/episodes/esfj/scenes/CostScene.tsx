import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { CALM, Centre, GREY, RED, WARM } from "../ring";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const VOICES = ["太热情了", "有点冷淡", "话太多", "怎么不说话", "太在意别人", "不够体贴", "好会照顾人", "有点假", "人真好", "太累了吧"];

// 0 · voices pour in from every side, contradicting each other — 太热情了 ·
//     有点冷淡 · 话太多 · 怎么不说话 … — and a tally that never reaches the
//     top: 满意 7/12 → 5/12 → 9/12 …
// 1 · the noise turns up; inside his chest the small figure is saying
//     something, but its bubble is tiny, faint, and swallowed by the rest:
//     two level meters — 外面 ████ · 心里 ▏ — 听不见.
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const n = Math.min(VOICES.length, Math.floor(frame / 8));
  const sat = 5 + Math.round(4 * random(`sat${Math.floor(frame / 15)}`));
  const loud = interpolate(frame, [c1, c1 + 4 * BEAT], [0.6, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} whips={[c1]} hits={keyHits(lines, cues, duration)}>
        <Centre window={frame >= c1 ? 1 : 0} nod={frame >= c1 ? Math.abs(Math.sin(frame / 6)) * 0.3 : 0} glow={0.3} rgb={GREY} />
        {VOICES.slice(0, frame >= c1 ? VOICES.length : n).map((v, i) => {
          const a = random(`va${i}`) * 6.28;
          const x = 960 + Math.cos(a) * (480 + 160 * random(`vr${i}`));
          const y = 480 + Math.sin(a) * 300;
          const jit = frame >= c1 ? Math.sin(frame * 1.7 + i) * 6 * loud : 0;
          return <div key={v} style={{ position: "absolute", left: x - 100 + jit, top: y - 30, padding: "8px 18px", borderRadius: 16, border: `2px solid rgba(232,238,242,${0.4 + 0.4 * loud})`, background: "rgba(14,16,20,0.85)", fontSize: 28 + (frame >= c1 ? 8 * loud : 0), fontWeight: 900, color: i % 3 === 0 ? `rgb(${RED})` : palette.ink, whiteSpace: "nowrap" }}>{v}</div>;
        })}
        {frame < c1 && (
          <div style={{ position: "absolute", left: 120, top: 130, fontFamily: fonts.mono, fontSize: 28, letterSpacing: 4, color: "rgba(232,238,242,0.55)" }}>
            满意 <span style={{ fontSize: 46, color: `rgb(${WARM})` }}>{sat}/12</span>
          </div>
        )}
        {frame >= c1 && (
          <>
            <div style={{ position: "absolute", left: 1040, top: 560, padding: "2px 8px", borderRadius: 8, border: `1px solid rgba(${CALM},0.5)`, fontSize: 14, color: `rgba(${CALM},0.6)` }}>……</div>
            <div style={{ position: "absolute", left: 120, top: 140, fontFamily: fonts.mono, fontSize: 24, color: palette.dim, lineHeight: 2 }}>
              <div>外面 <span style={{ display: "inline-block", width: 360 * loud, height: 16, background: `rgb(${RED})`, verticalAlign: "middle" }} /></div>
              <div>心里 <span style={{ display: "inline-block", width: 10, height: 16, background: `rgb(${CALM})`, verticalAlign: "middle" }} /></div>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 880, textAlign: "center", fontSize: 40, fontWeight: 900, letterSpacing: 12, color: `rgb(${CALM})`, opacity: ramp(frame, c1 + 5 * BEAT, 10) }}>听 不 见</div>
          </>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={WARM} opacity={0.25} />
      {VOICES.map((_, i) => (
        <Sfx key={i} name="shutter" at={i * 8} volume={0.1} />
      ))}
      <Sfx name="whoosh" at={c1 - 3} volume={0.45} />
      <Sfx name="glitch" at={c1 + BEAT} volume={0.3} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
