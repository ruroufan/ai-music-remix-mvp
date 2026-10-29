import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Bench, FEEL, Feeling, Machine, Sparks, STEEL } from "../bench";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const ICE = "180, 220, 240";

// 0 · how the others see him: a frosted outline round him — 冷漠 — and him,
//     thumb up: 没事.
// 1 · the part he pushed aside overheats: it flickers faster and faster,
//     sparks, smoke, and the machines on the bench burst apart — gears
//     everywhere. 更难收拾.
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const ice = ramp(frame, BEAT, 12);
  const heat = interpolate(frame, [c1, c1 + 4 * BEAT], [0, 1], clamp);
  const burst = interpolate(frame, [c1 + 4 * BEAT, c1 + 4 * BEAT + 12], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1]} hits={[c1 + 4 * BEAT, ...keyHits(lines, cues, duration)]}>
        {frame < c1 ? (
          <div style={{ position: "absolute", inset: 0 }}>
            <Stander x={960} bottom={920} height={520} lift={0} glow={0.3} rgb={ICE} />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: ice }}>
              <rect x={760} y={330} width={400} height={600} rx={40} fill={`rgba(${ICE},0.08)`} stroke={`rgba(${ICE},0.7)`} strokeWidth={4} />
              {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${780 + i * 50} 340 l12 30 l-10 10`} fill="none" stroke={`rgba(${ICE},0.5)`} strokeWidth={2} />)}
            </svg>
            <div style={{ position: "absolute", left: 360, top: 400, fontSize: 52, fontWeight: 900, color: `rgb(${ICE})`, opacity: ice }}>冷漠？</div>
            <div style={{ position: "absolute", left: 1220, top: 420, padding: "10px 24px", borderRadius: 16, border: "2px solid rgba(232,238,242,0.6)", fontSize: 40, fontWeight: 900, color: palette.ink, opacity: ramp(frame, 4 * BEAT, 8) }}>没事</div>
          </div>
        ) : (
          <div style={{ position: "absolute", inset: 0 }}>
            <Bench x0={300} x1={1620} />
            {burst < 1 && <Machine x={760} open={burst * 1.6} frame={frame} />}
            {burst < 1 && <Machine x={1180} open={burst * 1.8} frame={frame} />}
            {burst > 0 && <Machine x={760} open={1.6} frame={0} />}
            {burst > 0 && <Machine x={1180} open={1.8} frame={0} />}
            <Feeling x={1480} y={660} size={1.3} frame={frame * (1 + 4 * heat)} k={1} />
            <Sparks x={1480} y={640} k={heat} frame={frame} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontSize: 54, fontWeight: 900, letterSpacing: 12, color: `rgb(${FEEL})`, opacity: ramp(frame, c1 + 4 * BEAT + 6, 8) }}>更 难 收 拾</div>
            <div style={{ position: "absolute", left: 1380, top: 760, fontFamily: fonts.mono, fontSize: 22, color: `rgba(${STEEL},0.7)`, opacity: 1 - burst }}>没说出口的</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={frame < c1 ? ICE : FEEL} opacity={0.3} />
      <Sfx name="glint" at={BEAT} volume={0.25} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.45} />
      <Sfx name="rise" at={c1} volume={0.35} />
      <Sfx name="boom" at={c1 + 4 * BEAT} volume={0.7} />
      <Sfx name="shatter" at={c1 + 4 * BEAT} volume={0.5} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
