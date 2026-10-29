import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Field, GROUND, LEAF, PLOTS, Plot, Runner, SUN, Throw, plotCx } from "../field";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const RED = "255, 110, 110";

// The field. He runs in, flings a handful of seed into the first plot and is
// already running for the next — every plot, one after another; 开始 climbs to
// ×100. Behind him nothing gets past a sprout. 完成 0.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const P = (c1 - BEAT) / PLOTS.length;
  const k = Math.min(PLOTS.length - 1, Math.floor(frame / P));
  const t = (frame - k * P) / P;
  const from = k === 0 ? -100 : plotCx(k - 1) + 60;
  const after = frame >= c1 - BEAT;
  const x = after ? plotCx(5) + 60 + (frame - (c1 - BEAT)) * 14 : t < 0.45 ? from + (plotCx(k) - 40 - from) * (t / 0.45) : t < 0.6 ? plotCx(k) - 40 : plotCx(k) - 40 + 100 * ((t - 0.6) / 0.4);
  const throwAt = (i: number) => i * P + 0.45 * P;
  const g = (i: number) => interpolate(frame, [throwAt(i) + 8, throwAt(i) + 28], [0, 0.45], clamp);
  const started = Math.min(100, Math.round(Math.pow(Math.min(1, frame / (c1 - BEAT)), 1.4) * 100));
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} focus={{ x: 960, y: 700 }} hits={[...PLOTS.map((_, i) => Math.round(throwAt(i))), c1, ...keyHits(lines, cues, duration)]}>
        <Field />
        {PLOTS.map((_, i) => (
          <Plot key={i} i={i} g={g(i)} seeded={frame > throwAt(i) + 6 ? 1 : 0} />
        ))}
        <Runner x={x} walk={frame / 2.2} run={t >= 0.45 && t < 0.6 && !after ? 0.3 : 1} />
        <Throw x={plotCx(k) - 20} y={GROUND - 140} to={plotCx(k)} k={after ? 0 : (t - 0.45) / 0.15} />
        <div style={{ position: "absolute", left: 120, top: 130, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 4, color: "rgba(232,238,242,0.55)", lineHeight: 1.8 }}>
          <div>
            开始 <span style={{ color: `rgb(${SUN})`, fontSize: 40 }}>×{started}</span>
          </div>
          <div>
            完成 <span style={{ color: `rgb(${RED})`, fontSize: 40 }}>0</span>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontSize: 40, fontWeight: 900, letterSpacing: 10, color: `rgb(${LEAF})`, opacity: interpolate(frame, [c1, c1 + 10], [0, 1], clamp) }}>全 是 嫩 芽</div>
      </Cam>
      <Bokeh frame={frame} rgb={SUN} opacity={0.35} />
      {PLOTS.map((_, i) => (
        <Sfx key={i} name="whoosh" at={Math.round(throwAt(i))} volume={0.25} />
      ))}
      {PLOTS.map((_, i) => (
        <Sfx key={`g${i}`} name="glint" at={Math.round(throwAt(i) + 20)} volume={0.15} />
      ))}
      <Sfx name="boom" at={c1} volume={0.3} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
