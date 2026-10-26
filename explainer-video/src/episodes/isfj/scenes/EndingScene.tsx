import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Holder, Say, SOFT, WARM } from "../jar";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const TRUE = ["其实我有点累", "这次我做不了", "我有点难过", "你误会我了", "我也想被记得"];
const N0 = 22;

// The episode's picture.
// 0 · he lifts the lid off the jar in his chest, and takes the stones out, one
//     by one — and every stone he takes out becomes something said out loud:
//     其实我有点累 · 这次我做不了 · 我有点难过 …
// 1 · the jar nearly empty, the cracks gone dim, a warm light inside it; a
//     friend steps up beside him and stays. 有关系 · 才长久.
// 2 · the channel card.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const lid = interpolate(frame, [4, BEAT + 4], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const outAt = (i: number) => 2 * BEAT + i * ((c1 + 2 * BEAT - 2 * BEAT) / (N0 - 2));
  const taken = Array.from({ length: N0 - 2 }, (_, i) => interpolate(frame, [outAt(i), outAt(i) + 6], [0, 1], clamp)).reduce((a, b) => a + b, 0);
  const warm = interpolate(frame, [c1, c1 + 4 * BEAT], [0, 1], clamp);
  const friend = interpolate(frame, [c1 + BEAT, c1 + 4 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const card = useRamp(c2, 12);
  const said = (i: number) => {
    const at = 2 * BEAT + i * 1.6 * BEAT;
    return interpolate(frame, [at, at + 6, at + 2.4 * BEAT, at + 2.4 * BEAT + 8], [0, 1, 1, 0], clamp);
  };
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1.04, 1]} focus={{ x: 860, y: 560 }} hits={[BEAT, ...TRUE.map((_, i) => Math.round(2 * BEAT + i * 1.6 * BEAT)), c1 + 4 * BEAT, ...keyHits(lines, cues, duration)]}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.92 * card }}>
          <Holder x={760} stones={N0 - taken} crack={0.8 * (1 - warm)} lid={lid} jarGlow={0.8 * warm} glow={0.5 + 0.4 * warm} />
          {TRUE.map((t, i) => (
            <Say key={t} x={980 + (i % 2) * 120} y={220 + i * 90} text={t} k={said(i)} color={WARM} size={32} />
          ))}
          <Stander x={1260 + 400 * (1 - friend)} bottom={940} height={560} lift={1} glow={0.6} rgb={SOFT} opacity={friend} />
          <div style={{ position: "absolute", left: 1440, top: 300, fontSize: 48, fontWeight: 900, color: `rgb(${WARM})`, textShadow: `0 0 20px rgba(${WARM},0.7)`, opacity: interpolate(frame, [c1 + 4 * BEAT, c1 + 4 * BEAT + 10], [0, 1], clamp) * (1 - card) }}>有关系<br />才长久</div>
        </div>
      </Cam>
      <Bokeh frame={frame} rgb={WARM} opacity={(0.3 + 0.5 * warm) * (1 - card)} />
      {card > 0 && <EndCard opacity={card} signoffAt={c2 + BEAT} />}
      <Sfx name="glint" at={BEAT} volume={0.35} />
      {TRUE.map((_, i) => (
        <Sfx key={i} name="shutter" at={Math.round(2 * BEAT + i * 1.6 * BEAT)} volume={0.18} />
      ))}
      <Sfx name="rise" at={c1} volume={0.3} />
      <Sfx name="glint" at={c1 + 4 * BEAT} volume={0.4} />
      <Sfx name="boom" at={c2} volume={0.3} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
