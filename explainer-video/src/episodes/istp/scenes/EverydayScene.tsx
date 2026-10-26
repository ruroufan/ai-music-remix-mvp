import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Walker } from "../../nostalgia/road";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { FEEL, STEEL } from "../bench";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const PLAN = ["1. 问题在哪", "2. 三个方案", "3. 明天就做"];

// Three moments, full screen, a whip-pan between each.
// 1 · a friend crying, tears falling — and he holds up a clipboard: 1. 问题在哪
//     2. 三个方案 3. 明天就做. Her bubble, small: 我只是想有人听.
// 2 · 你爱我吗？ — and he's up a ladder screwing in a bulb; it comes on. Fixed.
// 3 · him alone on a bike, riding into the dark, a controller beside — and an
//     empty speech bubble: ……
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : 2;
  const bulb = ramp(frame, c1 + 5 * BEAT, 4);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1, c2]} hits={[...PLAN.map((_, i) => 2 * BEAT + i * BEAT), c1 + 5 * BEAT, ...keyHits(lines, cues, duration)]}>
        {seg === 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Stander x={520} bottom={900} height={380} lift={0} glow={0.4} rgb={FEEL} />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              {[0, 1, 2].map((i) => {
                const p = ((frame / 25 + i / 3) % 1);
                return <ellipse key={i} cx={505 + i * 14} cy={600 + p * 120} rx={4} ry={7} fill="rgba(170,210,240,0.8)" opacity={1 - p} />;
              })}
            </svg>
            <Stander x={1300} bottom={900} height={400} lift={1} glow={0.5} rgb={STEEL} />
            <div style={{ position: "absolute", left: 1000, top: 330, width: 260, padding: "20px 22px", background: "#efe8d8", color: "#262019", borderRadius: 6, boxShadow: "0 12px 30px rgba(0,0,0,0.5)" }}>
              {PLAN.map((p, i) => <div key={p} style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.7, opacity: ramp(frame, 2 * BEAT + i * BEAT, 5) }}>{p}</div>)}
            </div>
            <div style={{ position: "absolute", left: 360, top: 350, padding: "8px 16px", borderRadius: 14, border: `2px solid rgba(${FEEL},0.6)`, fontSize: 24, color: `rgb(${FEEL})`, opacity: ramp(frame, 6 * BEAT, 8) }}>我只是想有人听</div>
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Stander x={480} bottom={900} height={380} lift={1} glow={0.5} rgb={FEEL} />
            <div style={{ position: "absolute", left: 380, top: 380, padding: "12px 22px", borderRadius: 16, border: `2px solid rgb(${FEEL})`, fontSize: 36, fontWeight: 900, color: palette.ink, opacity: ramp(frame, c1 + 4, 6) }}>你爱我吗？</div>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <line x1={1180} y1={900} x2={1260} y2={420} stroke="#8a6a4a" strokeWidth={8} />
              <line x1={1340} y1={900} x2={1300} y2={420} stroke="#8a6a4a" strokeWidth={8} />
              {Array.from({ length: 6 }, (_, i) => <line key={i} x1={1190 + i * 12} y1={840 - i * 80} x2={1336 - i * 6} y2={840 - i * 80} stroke="#8a6a4a" strokeWidth={6} />)}
              <line x1={1300} y1={140} x2={1300} y2={200} stroke="#666" strokeWidth={4} />
            </svg>
            <Halo x={1300} y={230} r={260} intensity={bulb} rgb="255, 230, 170" />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <circle cx={1300} cy={230} r={30} fill={bulb > 0.5 ? "rgb(255,240,200)" : "#444"} stroke="#999" strokeWidth={2} />
            </svg>
            <Stander x={1270} bottom={600} height={300} lift={1} glow={0.4} rgb={STEEL} />
            <div style={{ position: "absolute", left: 1380, top: 280, fontSize: 36, fontWeight: 900, color: "rgb(130,210,150)", opacity: bulb }}>修好了 ✓</div>
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <line x1={0} y1={860} x2={1920} y2={860} stroke="rgba(232,238,242,0.2)" strokeWidth={2} />
              {Array.from({ length: 8 }, (_, i) => <line key={i} x1={((i * 300 - (frame - c2) * 12) % 2400 + 2400) % 2400 - 200} y1={880} x2={((i * 300 - (frame - c2) * 12) % 2400 + 2400) % 2400 - 100} y2={880} stroke="rgba(232,238,242,0.3)" strokeWidth={4} />)}
              <circle cx={820} cy={820} r={44} fill="none" stroke={`rgb(${STEEL})`} strokeWidth={5} />
              <circle cx={1040} cy={820} r={44} fill="none" stroke={`rgb(${STEEL})`} strokeWidth={5} />
              <path d="M820 820 L900 740 L1000 740 L1040 820 M900 740 L940 820 L820 820" fill="none" stroke={`rgb(${STEEL})`} strokeWidth={5} />
            </svg>
            <Walker x={930} bottom={760} height={210} face="right" walk={0} lean={-12} glow={0.4} rgb={STEEL} />
            <div style={{ position: "absolute", left: 1100, top: 470, padding: "12px 28px", borderRadius: 18, border: "2px dashed rgba(232,238,242,0.5)", fontSize: 40, color: palette.dim, opacity: ramp(frame, c2 + 4 * BEAT, 8) }}>……</div>
            <div style={{ position: "absolute", left: 120, top: 150, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 6, color: palette.dim }}>一个人 · 骑车 · 打游戏</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={FEEL} opacity={0.35} />
      {PLAN.map((_, i) => (
        <Sfx key={i} name="shutter" at={2 * BEAT + i * BEAT} volume={0.2} />
      ))}
      <Sfx name="whoosh" at={c1 - 3} volume={0.5} />
      <Sfx name="glint" at={c1 + 5 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.5} />
      <Sfx name="whoosh" at={c2 + BEAT} volume={0.2} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
