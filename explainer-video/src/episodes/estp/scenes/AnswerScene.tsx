import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { FLAME, Highway, Moto, SHADE, Shadow } from "../chase";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const QS = ["我想要什么", "这段关系", "以后怎么办", "我到底是谁"];
const V = 38;

// The bike slows. As the speed drains away, the shadow behind closes the gap
// — and out of it come the questions the speed had left behind: 我想要什么 ·
// 这段关系 · 以后怎么办 · 我到底是谁 — drifting forward until they hang all
// round him.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const T = 4 * BEAT;
  const tau = Math.min(Math.max(0, frame - c1), T);
  const dist = V * Math.min(frame, c1) + V * (tau - (tau * tau) / (2 * T));
  const slow = tau / T;
  const sx = 260 + 600 * interpolate(frame, [c1 + BEAT, c1 + 6 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const out = (i: number) => interpolate(frame, [c1 + 4 * BEAT + i * 6, c1 + 6 * BEAT + i * 6], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} focus={{ x: 1100, y: 560 }} hits={[c1 + T, c1 + 6 * BEAT, ...keyHits(lines, cues, duration)]}>
        <Highway dist={dist} blur={0.8 * (1 - slow)} />
        <Shadow x={sx} frame={frame} scale={1.2 + 0.2 * slow} />
        <Moto x={1240} spin={dist / 46} frame={frame} scale={1.35} light={1 - 0.4 * slow} />
        {QS.map((q, i) => {
          const k = out(i);
          const tx = 1240 + [-330, 280, -220, 260][i];
          const ty = [260, 300, 470, 520][i];
          const x = sx + (tx - sx) * k + Math.sin(frame / 12 + i) * 10 * k;
          const y = 560 + (ty - 560) * k + Math.cos(frame / 14 + i) * 8 * k;
          return (
            <div key={q} style={{ position: "absolute", left: x - 130, top: y - 28, width: 260, textAlign: "center", padding: "8px 0", borderRadius: 12, border: `2px solid rgba(${SHADE},${0.3 + 0.5 * k})`, background: "rgba(16,12,28,0.8)", fontSize: 32, fontWeight: 800, color: `rgba(220,210,255,${0.3 + 0.7 * k})`, opacity: frame >= c1 ? 1 : 0.3, transform: `scale(${0.5 + 0.5 * k})` }}>{q}</div>
          );
        })}
      </Cam>
      <Bokeh frame={frame} rgb={slow > 0.5 ? SHADE : FLAME} opacity={0.3} />
      <Sfx name="whoosh" at={0} volume={0.25} />
      <Sfx name="rise" at={c1} volume={0.25} />
      {QS.map((_, i) => (
        <Sfx key={i} name="glitch" at={c1 + 4 * BEAT + i * 6} volume={0.18} />
      ))}
      <Sfx name="boom" at={c1 + 6 * BEAT} volume={0.4} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
