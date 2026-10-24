import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { COOL, Cup, WARM } from "../kettle";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const RED = "255, 110, 110";
const BLAME = ["是我不够好", "我应该再多做一点", "是不是我太矫情了"];

// 0 · him, seen through: the warmth inside him is the kettle's water. Cups
//     ring round him and fill one by one — and with each, the level inside
//     him drops: 100% → 6%.
// 1 · empty. He goes grey and hollow, and the blame comes in red, in his
//     own voice: 是我不够好 · 我应该再多做一点 · 是不是我太矫情了.
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const N = 8;
  const at = (i: number) => BEAT + i * ((c1 - 2 * BEAT) / N);
  const filled = (i: number) => interpolate(frame, [at(i), at(i) + 8], [0, 1], clamp);
  const level = Math.max(0.06, 1 - 0.94 * Array.from({ length: N }, (_, i) => filled(i)).reduce((a, b) => a + b, 0) / N);
  const empty = frame >= c1 ? 1 : 0;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} hits={[c1, ...BLAME.map((_, i) => c1 + (2 + i) * BEAT), ...keyHits(lines, cues, duration)]}>
        <Halo x={960} y={560} r={300} intensity={0.8 * level * (1 - empty)} rgb={WARM} />
        <Stander x={960} bottom={920} height={560} lift={0} glow={0.3 + 0.5 * level * (1 - empty)} rgb={empty ? COOL : WARM} />
        {/* the level inside his body */}
        <div style={{ position: "absolute", left: 905, top: 520, width: 110, height: 240, borderRadius: 18, overflow: "hidden", border: "2px solid rgba(232,238,242,0.3)" }}>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${(empty ? 0 : level) * 100}%`, background: `rgba(${WARM},0.85)` }} />
        </div>
        <div style={{ position: "absolute", left: 1040, top: 620, fontFamily: fonts.mono, fontSize: 30, color: empty || level < 0.3 ? `rgb(${RED})` : `rgb(${WARM})` }}>{Math.round((empty ? 0 : level) * 100)}%</div>
        {frame < c1 &&
          Array.from({ length: N }, (_, i) => {
            const a = (i / N) * 2 * Math.PI - Math.PI / 2;
            return <Cup key={i} x={960 + Math.cos(a) * 520} y={560 + Math.sin(a) * 300} size={1} fill={filled(i)} frame={frame} />;
          })}
        <div style={{ position: "absolute", left: 120, top: 140, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 6, color: palette.dim, opacity: frame < c1 ? 1 : 0 }}>每一份温暖 · 从自己身上取</div>
        {empty > 0 && (
          <>
            <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontSize: 56, fontWeight: 900, letterSpacing: 12, color: palette.dim }}>掏 空</div>
            {BLAME.map((b, i) => (
              <div key={b} style={{ position: "absolute", left: [380, 1180, 300][i] + (random(`b${i}`) - 0.5) * 40, top: [380, 460, 640][i], fontSize: 38, fontWeight: 900, color: `rgb(${RED})`, opacity: ramp(frame, c1 + (2 + i) * BEAT, 5), textShadow: `0 0 16px rgba(${RED},0.5)` }}>{b}</div>
            ))}
          </>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={WARM} opacity={0.4 * (1 - empty) + 0.1} />
      {Array.from({ length: N }, (_, i) => (
        <Sfx key={i} name="glint" at={Math.round(at(i))} volume={0.12} />
      ))}
      <Sfx name="boom" at={c1} volume={0.4} />
      {BLAME.map((_, i) => (
        <Sfx key={`b${i}`} name="stamp" at={c1 + (2 + i) * BEAT} volume={0.3} />
      ))}
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
