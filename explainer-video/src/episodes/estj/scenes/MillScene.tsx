import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { GOLD, GROUND, LEAF, RED, STEEL, Sapling } from "../ruler";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// Mill.
// 0 · two paths for one walker: 最好的方式 (straight, gold) and 他自己的方式
//     (winding, his) — the tick goes to the second.
// 1 · a machine stamps out identical figures from one mould onto a belt —
//     clunk, clunk — 人不是机器: the line is struck through.
// 2 · a tree, growing out from its own centre — branches every which way,
//     no two alike: 向各个方向生长.
export const MillScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : 2;
  const tick = ramp(frame, 6 * BEAT, 6);
  const belt = (frame - c1) * 5;
  const strike = interpolate(frame, [c1 + 5 * BEAT, c1 + 5 * BEAT + 6], [0, 1], clamp);
  const grow = interpolate(frame, [c2, c2 + 7 * BEAT], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) });
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} whips={[c1, c2]} hits={[6 * BEAT, ...[0, 1, 2, 3, 4].map((i) => c1 + i * BEAT), c1 + 5 * BEAT, ...keyHits(lines, cues, duration)]}>
        {seg === 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <line x1={400} y1={760} x2={1560} y2={340} stroke={`rgba(${GOLD},${0.4 + 0.3 * (1 - tick)})`} strokeWidth={10} />
              <path d="M400 760 C 600 900, 700 500, 900 640 S 1200 900, 1300 600 S 1500 300, 1560 340" fill="none" stroke={`rgb(${LEAF})`} strokeWidth={10} strokeDasharray="2400" strokeDashoffset={2400 * (1 - ramp(frame, BEAT, 3 * BEAT))} />
            </svg>
            <Stander x={400} bottom={760} height={200} lift={1} glow={0.6} rgb={LEAF} />
            <div style={{ position: "absolute", left: 1000, top: 380, fontSize: 36, fontWeight: 900, color: `rgba(${GOLD},0.8)` }}>最好的方式</div>
            <div style={{ position: "absolute", left: 1020, top: 800, fontSize: 40, fontWeight: 900, color: `rgb(${LEAF})` }}>他自己的方式 <span style={{ opacity: tick, fontSize: 56 }}>✓</span></div>
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 200, top: 720, width: 1520, height: 30, background: `repeating-linear-gradient(90deg, #2a2f38 0 40px, #1d2128 40px 80px)`, backgroundPosition: `${belt}px 0` }} />
            <div style={{ position: "absolute", left: 300, top: 300, width: 220, height: 260, background: "#2a2f38", border: `3px solid rgb(${STEEL})`, transform: `translateY(${Math.abs(Math.sin(((frame - c1) / BEAT) * Math.PI)) * 60}px)` }} />
            {Array.from({ length: 8 }, (_, i) => {
              const x = 420 + ((belt * 0.8 + i * 180) % 1440);
              return <Stander key={i} x={x} bottom={720} height={150} lift={0} glow={0.2} rgb={STEEL} />;
            })}
            <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontSize: 54, fontWeight: 900, letterSpacing: 10, color: palette.ink }}>
              <span style={{ position: "relative" }}>人 = 机器<span style={{ position: "absolute", left: -10, right: -10, top: "50%", height: 8, background: `rgb(${RED})`, transformOrigin: "0 50%", transform: `scaleX(${strike})` }} /></span>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 240, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 8, color: palette.dim }}>照着一个模子</div>
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: GROUND, bottom: 0, background: "#14120f" }} />
            <Sapling x={960} seed={11} wild={grow} scale={1 + 1.4 * grow} hue={1} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontSize: 50, fontWeight: 900, letterSpacing: 12, color: `rgb(${LEAF})`, opacity: ramp(frame, c2 + 5 * BEAT, 10) }}>向各个方向生长</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={LEAF} opacity={0.35} />
      <Sfx name="glint" at={6 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.45} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Sfx key={i} name="stamp" at={c1 + i * BEAT} volume={0.25} />
      ))}
      <Sfx name="glitch" at={c1 + 5 * BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.45} />
      <Sfx name="rise" at={c2} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
