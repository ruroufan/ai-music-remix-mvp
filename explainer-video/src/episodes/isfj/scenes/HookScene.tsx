import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Flying, Holder, RED, Say, SOFT } from "../jar";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const X = 760;
const N = 16;

// On every beat he says it — 没关系 — and a small stone drops into the glass
// jar in his chest. 没关系 ×16. The jar fills. On the second line the glass
// gives a tiny tick, and a crack runs up it: 很有关系.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const P = (c1 - BEAT) / N;
  const at = (i: number) => BEAT / 2 + i * P;
  const stones = Array.from({ length: N }, (_, i) => interpolate(frame, [at(i) + 6, at(i) + 14], [0, 1], clamp)).reduce((a, b) => a + b, 0);
  const said = Math.min(N, Math.max(0, Math.floor((frame - BEAT / 2) / P) + 1));
  const k = Math.min(N - 1, Math.max(0, Math.floor((frame - BEAT / 2) / P)));
  const crack = interpolate(frame, [c1 + 4, c1 + 3 * BEAT], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} focus={{ x: X, y: 560 }} hits={[...Array.from({ length: N }, (_, i) => Math.round(at(i) + 14)), c1 + 4, ...keyHits(lines, cues, duration)]}>
        <Holder x={X} stones={stones} crack={crack} />
        {frame < c1 && <Say x={X + 180 + (k % 2) * 60} y={240 + (k % 3) * 70} text="没关系" k={interpolate(frame, [at(k), at(k) + 4], [0, 1], clamp) * (1 - interpolate(frame, [at(k) + P - 4, at(k) + P], [0, 1], clamp))} color={SOFT} />}
        {frame < c1 && <Flying x0={X + 260} y0={300 + (k % 3) * 70} x1={X + 10} y1={520} k={(frame - at(k) - 4) / 10} />}
        <div style={{ position: "absolute", left: 1320, top: 200, fontFamily: fonts.mono, fontSize: 28, letterSpacing: 4, color: "rgba(232,238,242,0.55)" }}>
          “没关系” <span style={{ fontSize: 46, color: `rgb(${SOFT})` }}>×{said}</span>
        </div>
        <div style={{ position: "absolute", left: 1000, top: 520, fontSize: 52, fontWeight: 900, color: `rgb(${RED})`, textShadow: `0 0 20px rgba(${RED},0.6)`, opacity: interpolate(frame, [c1 + BEAT, c1 + BEAT + 10], [0, 1], clamp) }}>很有关系</div>
      </Cam>
      <Bokeh frame={frame} rgb={SOFT} opacity={0.3} />
      {Array.from({ length: N }, (_, i) => (
        <Sfx key={i} name="step" at={Math.round(at(i) + 14)} volume={0.2} />
      ))}
      <Sfx name="glitch" at={c1 + 4} volume={0.3} />
      <Sfx name="shatter" at={c1 + 6} volume={0.12} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
