import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { fonts } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Field, GROUND, LEAF, PLOTS, Plot, Runner, SUN, Tree, plotCx } from "../field";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ME = 2;

// The episode's picture.
// 0 · the field of sprouts. He runs in — and stops, in one plot, and stays.
//     ▶▶ 快进: the days flicker by over him, and his plot pushes up a trunk.
// 1 · it keeps going — a crown, branches, fruit: a great tree, the only one in
//     the field. He stands under it. 到达.
// 2 · the channel card.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const arrive = interpolate(frame, [0, 2 * BEAT], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) });
  const ff = frame >= 3 * BEAT && frame < c1 + 4 * BEAT;
  const grow = interpolate(frame, [3 * BEAT, c1 + 4 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const day = ff ? 0.5 + 0.5 * Math.sin(frame * 0.9) : 0.6;
  const card = useRamp(c2, 12);
  const x = -100 + (plotCx(ME) - 120 + 100) * arrive;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1.06, 1]} focus={{ x: plotCx(ME), y: 560 }} hits={[2 * BEAT, 3 * BEAT, c1 + 4 * BEAT, ...keyHits(lines, cues, duration)]}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.92 * card }}>
          <Field day={day} />
          {PLOTS.map((_, i) => (
            <Plot key={i} i={i} g={i === ME ? 0 : 0.35} seeded={1} glow={i === ME ? 0.4 * grow : 0} />
          ))}
          <Tree x={plotCx(ME)} grow={grow} frame={frame} />
          {frame < 2 * BEAT ? <Runner x={x} walk={frame / 2.2} run={1 - arrive} /> : <Stander x={plotCx(ME) - 120} bottom={GROUND} height={250} lift={1} glow={0.7 + 0.3 * grow} rgb={SUN} />}
          {ff && (
            <div style={{ position: "absolute", left: 1500, top: 130, fontFamily: fonts.mono, fontSize: 34, letterSpacing: 6, color: `rgb(${SUN})` }}>
              ▶▶ 快进 <span style={{ fontSize: 26 }}>第 {Math.round(1 + grow * 3650)} 天</span>
            </div>
          )}
          <div style={{ position: "absolute", left: plotCx(ME) + 260, top: 360, fontSize: 52, fontWeight: 900, letterSpacing: 10, color: `rgb(${LEAF})`, textShadow: `0 0 24px rgba(${LEAF},0.6)`, opacity: interpolate(frame, [c1 + 4 * BEAT, c1 + 4 * BEAT + 10], [0, 1], clamp) * (1 - card) }}>到达</div>
        </div>
      </Cam>
      <Bokeh frame={frame} rgb={SUN} opacity={(0.3 + 0.5 * grow) * (1 - card)} />
      {card > 0 && <EndCard opacity={card} signoffAt={c2 + BEAT} />}
      <Sfx name="step" at={4} volume={0.3} />
      <Sfx name="step" at={BEAT + 4} volume={0.3} />
      <Sfx name="stamp" at={2 * BEAT} volume={0.35} />
      <Sfx name="rise" at={3 * BEAT} volume={0.35} />
      <Sfx name="glint" at={c1 + 4 * BEAT} volume={0.5} />
      <Sfx name="boom" at={c2} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
