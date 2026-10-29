import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { GOLD, Mask, PINK } from "../stage";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const OTHERS = [320, 560, 1360, 1600];

// 0 · he hands out light: little glowing balls float from him to the people
//     round him, one after another, and they brighten — while his own glow
//     drains. Over his face the grin grows and grows. 不敢不快乐.
// 1 · close on the grin, huge: 开心果. Everyone has turned their back. Behind
//     the mask, a tear runs down — and nobody sees it.
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const give = (i: number) => interpolate(frame, [BEAT + i * BEAT * 1.5, BEAT + i * BEAT * 1.5 + 18], [0, 1], clamp);
  const drained = interpolate(frame, [BEAT, 7 * BEAT], [0, 1], clamp);
  const turn = ramp(frame, c1 + BEAT, 12);
  const tear = interpolate(frame, [c1 + 4 * BEAT, c1 + 8 * BEAT], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1]} hits={[...OTHERS.map((_, i) => Math.round(BEAT + i * BEAT * 1.5 + 18)), c1 + 4 * BEAT, ...keyHits(lines, cues, duration)]}>
        {frame < c1 ? (
          <div style={{ position: "absolute", inset: 0 }}>
            {OTHERS.map((x, i) => (
              <Stander key={x} x={x} bottom={860} height={300} lift={1 + give(i)} glow={0.2 + 0.7 * give(i)} rgb={i % 2 ? PINK : GOLD} />
            ))}
            <Stander x={960} bottom={860} height={380} lift={1.4} glow={0.9 * (1 - drained) + 0.1} rgb={GOLD} />
            <Mask x={960} y={860 - 226 * (380 / 260)} r={44 + 30 * drained} />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              {OTHERS.map((x, i) => {
                const p = give(i);
                if (p <= 0 || p >= 1) return null;
                const bx = 960 + (x - 960) * p, by = 520 - Math.sin(p * Math.PI) * 160;
                return <circle key={x} cx={bx} cy={by} r={18} fill={`rgb(${GOLD})`} />;
              })}
            </svg>
            <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 8, color: palette.dim }}>给出去的快乐 · <span style={{ color: `rgb(${GOLD})` }}>{OTHERS.filter((_, i) => give(i) >= 1).length}</span> / 自己的 · <span style={{ color: palette.alert }}>{Math.round(100 * (1 - drained))}%</span></div>
          </div>
        ) : (
          <div style={{ position: "absolute", inset: 0 }}>
            <Halo x={960} y={470} r={420} intensity={0.5} rgb={GOLD} />
            <Mask x={960} y={470} r={250} tear={tear} />
            {OTHERS.map((x, i) => (
              <div key={x} style={{ position: "absolute", inset: 0, opacity: 0.8 }}>
                <Stander x={x < 960 ? x - 160 : x + 160} bottom={1000} height={340} lift={1 - turn} glow={0.2} rgb={i % 2 ? PINK : GOLD} />
              </div>
            ))}
            <div style={{ position: "absolute", left: 0, right: 0, top: 130, textAlign: "center", fontSize: 54, fontWeight: 900, letterSpacing: 18, color: `rgb(${GOLD})`, opacity: ramp(frame, c1 + 4, 8) }}>开 心 果</div>
            <div style={{ position: "absolute", left: 1250, top: 520, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: "rgba(170,215,255,0.8)", opacity: tear }}>← 没有人看见</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} opacity={0.3 * (1 - 0.5 * drained)} />
      {OTHERS.map((_, i) => (
        <Sfx key={i} name="glint" at={Math.round(BEAT + i * BEAT * 1.5 + 18)} volume={0.2} />
      ))}
      <Sfx name="whoosh" at={c1 - 3} volume={0.45} />
      <Sfx name="rise" at={c1 + 3 * BEAT} volume={0.25} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
