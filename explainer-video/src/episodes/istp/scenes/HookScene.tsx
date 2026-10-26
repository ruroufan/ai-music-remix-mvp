import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox } from "../../../channels/backlit/parts";
import { fonts } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Bench, FEEL, GREEN, FLOOR, Machine, Mechanic } from "../bench";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const JOBS = ["收音机", "闹钟", "车灯", "旧手表"];
const X = 520;

// At the bench: a machine comes apart — gears out across the bench — and goes
// back together, ✓; then the next one. 修好 ×4. And all the while, in his
// chest, a small part blinks. On the second line, the viewfinder finds it:
// 感受 · 说不出.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const P = (c1 - BEAT / 2) / JOBS.length;
  const k = Math.min(JOBS.length - 1, Math.floor(frame / P));
  const t = Math.min(1, (frame - k * P) / P);
  const open = interpolate(t, [0, 0.3, 0.55, 0.85], [0, 1, 1, 0], clamp);
  const fixed = JOBS.filter((_, i) => frame > i * P + 0.85 * P).length;
  const box = interpolate(frame, [c1, c1 + 10], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} focus={{ x: 800, y: 620 }} hits={[...JOBS.map((_, i) => Math.round(i * P + 0.85 * P)), c1, ...keyHits(lines, cues, duration)]}>
        <Bench />
        <Machine x={980} open={frame >= c1 - BEAT / 2 ? 0 : open} frame={frame} label={JOBS[k]} />
        <div style={{ position: "absolute", left: 1120, top: 520, fontSize: 44, fontWeight: 900, color: `rgb(${GREEN})`, opacity: t > 0.85 || frame >= c1 - BEAT / 2 ? 1 : 0 }}>✓</div>
        <Mechanic x={X} frame={frame} reach={frame >= c1 ? 0.3 : 1} />
        <FocusBox x={X - 118} y={FLOOR - 208} w={220} h={120} progress={box} label="感受 · 说不出" color={`rgb(${FEEL})`} />
        <div style={{ position: "absolute", left: 1300, top: 160, fontFamily: fonts.mono, fontSize: 28, letterSpacing: 4, color: "rgba(232,238,242,0.55)" }}>
          修好 <span style={{ fontSize: 46, color: `rgb(${GREEN})` }}>×{fixed}</span>
        </div>
      </Cam>
      <Bokeh frame={frame} rgb={FEEL} opacity={0.3} />
      {JOBS.map((_, i) => (
        <Sfx key={i} name="shutter" at={Math.round(i * P + 0.85 * P)} volume={0.3} />
      ))}
      {JOBS.map((_, i) => (
        <Sfx key={`o${i}`} name="glitch" at={Math.round(i * P + 2)} volume={0.12} />
      ))}
      <Sfx name="glint" at={c1} volume={0.4} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
