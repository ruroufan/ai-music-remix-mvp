import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Sitter } from "../../estp/chase";
import { Crowd, GOLD, Mask, PINK, WARM } from "../stage";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// Two panels.
// 0 · left only: him up on a box with his grin on, a sea of heads in front —
//     观众 ×100 · 要的是你的笑.
// 1 · on 热闹需要的是观众 the left holds; then the right lights: him sitting on
//     a step, the grin taken off and held in his hand, face down — and one
//     person sitting next to him, looking at him. 朋友 ×1 · 看见你不快乐.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const L = ramp(frame, 4, 10);
  const R = ramp(frame, c1 + 3 * BEAT, 12);
  const look = ramp(frame, c1 + 6 * BEAT, 12);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} hits={[c1 + 3 * BEAT, c1 + 6 * BEAT, ...keyHits(lines, cues, duration)]}>
        <div style={{ position: "absolute", left: 100, top: 130, width: 840, height: 680, borderRadius: 18, overflow: "hidden", border: `2px solid rgba(${PINK},0.35)`, background: "rgba(24,12,20,0.85)", opacity: L }}>
          <div style={{ position: "absolute", inset: 0, transform: "translate(-540px, -330px) scale(1)" }}>
            <Halo x={960} y={520} r={360} intensity={0.6} rgb={GOLD} />
            <Stander x={960} bottom={720} height={300} lift={2} glow={0.8} rgb={GOLD} />
            <Mask x={960} y={720 - 226 * (300 / 260)} r={34} />
            <Crowd frame={frame} cheer={1} n={30} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 24, textAlign: "center", fontSize: 40, fontWeight: 900, letterSpacing: 6, color: `rgb(${PINK})` }}>观众 ×100</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 80, textAlign: "center", fontFamily: fonts.mono, fontSize: 20, letterSpacing: 6, color: palette.dim }}>要的是 · 你的笑</div>
        </div>
        <div style={{ position: "absolute", left: 980, top: 130, width: 840, height: 680, borderRadius: 18, overflow: "hidden", border: `2px solid rgba(${WARM},${0.2 + 0.3 * R})`, background: "rgba(16,14,12,0.85)", opacity: 0.25 + 0.75 * R }}>
          <Halo x={420} y={440} r={300} intensity={0.5 * R} rgb={WARM} />
          <svg width={840} height={680} style={{ position: "absolute", inset: 0 }}>
            <rect x={120} y={560} width={600} height={40} fill="#2a2420" />
            <rect x={90} y={600} width={660} height={80} fill="#1e1a18" />
          </svg>
          <div style={{ position: "absolute", inset: 0, transform: "translate(-640px, -240px)" }}>
            <Sitter x={960} bottom={800} scale={1.2} glow={0.3 + 0.3 * look} rgb={GOLD} />
            <Mask x={1030} y={740} r={22} k={R} sad={0} />
            <Sitter x={1180} bottom={800} scale={1.2} glow={0.4 + 0.3 * look} rgb={WARM} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 24, textAlign: "center", fontSize: 40, fontWeight: 900, letterSpacing: 6, color: `rgb(${WARM})`, opacity: R }}>朋友 ×1</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 80, textAlign: "center", fontFamily: fonts.mono, fontSize: 20, letterSpacing: 6, color: palette.dim, opacity: look }}>看见 · 你不快乐</div>
        </div>
      </Cam>
      <Bokeh frame={frame} rgb={R > 0.5 ? WARM : PINK} opacity={0.3} />
      <Sfx name="whoosh" at={4} volume={0.3} />
      <Sfx name="shutter" at={c1 + 3 * BEAT} volume={0.35} />
      <Sfx name="glint" at={c1 + 6 * BEAT} volume={0.4} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
