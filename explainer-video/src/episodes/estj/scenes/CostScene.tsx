import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Walker } from "../../nostalgia/road";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { GOLD, LEAF, STEEL } from "../ruler";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// 0 · a road of big gold footprints — his — and someone small walking it, step
//     by step, landing exactly in each one: 不再是自己的人生.
// 1 · two outcomes: one person clinging to his sleeve, smaller and smaller —
//     依赖; another walking off the other way into the dark — 远离.
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const steps = Math.min(8, Math.floor(frame / (BEAT * 0.9)));
  const away = interpolate(frame, [c1 + 2 * BEAT, c1 + 8 * BEAT], [0, 1], clamp);
  const cling = ramp(frame, c1 + BEAT, 10);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} whips={[c1]} hits={[c1 + BEAT, ...keyHits(lines, cues, duration)]}>
        {frame < c1 ? (
          <div style={{ position: "absolute", inset: 0 }}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              {Array.from({ length: 8 }, (_, i) => <ellipse key={i} cx={260 + i * 200} cy={i % 2 ? 860 : 900} rx={60} ry={26} fill={`rgba(${GOLD},0.35)`} stroke={`rgb(${GOLD})`} strokeWidth={2} />)}
            </svg>
            <Walker x={260 + steps * 200} bottom={i2y(steps)} height={220} face="right" walk={frame / 3} glow={0.4} rgb={LEAF} />
            <div style={{ position: "absolute", left: 160, top: 180, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 6, color: palette.dim }}>你给的路</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontSize: 48, fontWeight: 900, color: palette.ink, opacity: ramp(frame, 5 * BEAT, 10) }}>走的 · 不再是自己的人生</div>
          </div>
        ) : (
          <div style={{ position: "absolute", inset: 0 }}>
            <Stander x={960} bottom={900} height={400} lift={1.5} glow={0.5} rgb={STEEL} />
            <Stander x={820} bottom={900} height={260 - 60 * cling} lift={0} glow={0.3} rgb={LEAF} />
            <div style={{ opacity: 1 - 0.7 * away }}>
              <Walker x={1140 + 600 * away} bottom={900} height={300 - 120 * away} face="right" walk={(frame - c1) / 4} glow={0.3} rgb={LEAF} />
            </div>
            <div style={{ position: "absolute", left: 560, top: 400, fontSize: 40, fontWeight: 900, color: palette.dim, opacity: cling }}>依赖</div>
            <div style={{ position: "absolute", left: 1460, top: 400, fontSize: 40, fontWeight: 900, color: palette.dim, opacity: ramp(frame, c1 + 4 * BEAT, 8) }}>远离</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} opacity={0.3} />
      {Array.from({ length: 8 }, (_, i) => (
        <Sfx key={i} name="step" at={Math.round(i * BEAT * 0.9)} volume={0.2} />
      ))}
      <Sfx name="whoosh" at={c1 - 3} volume={0.45} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};

function i2y(i: number) {
  return i % 2 ? 860 : 900;
}
