import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox, Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { WARM } from "../kettle";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const PARTS = ["永远把人，", "无论是你自己", "还是任何他人，", "当作目的，而不仅仅当作手段。"];

const Node: React.FC<{ x: number; y: number; w: number; p: number; children: React.ReactNode }> = ({ x, y, w, p, children }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - 50, width: w, height: 100, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${palette.faint}`, borderRadius: 14, background: "rgba(10,14,20,0.88)", fontSize: 46, fontWeight: 900, letterSpacing: 4, color: palette.ink, opacity: p, transform: `scale(${0.85 + 0.15 * p})` }}>
    {children}
  </div>
);

// 0 · 「ENFJ」 in the viewfinder, flipped over on the beat.
// 1 · what we usually think: ENFJ 的问题 = 太热心 — struck out.
// 2 · Kant's sentence laid out in one line; everything dims but the middle,
//     and a viewfinder closes on it: 无论是你自己 — 盲点.
export const MisreadScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const card = useRamp(0, 8);
  const flip = interpolate(frame, [4 * BEAT, 4 * BEAT + 10], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const cardOut = useRamp(c1 - 4, 6);
  const left = useRamp(c1, 8);
  const eq = useRamp(c1 + BEAT, 8);
  const right = useRamp(c1 + 2 * BEAT, 8);
  const strike = interpolate(frame, [c1 + 4 * BEAT, c1 + 4 * BEAT + 6], [0, 1], clamp);
  const line = useRamp(c2, 10);
  const dim = interpolate(frame, [c2 + 4 * BEAT, c2 + 5 * BEAT], [0, 1], clamp);
  const box = interpolate(frame, [c2 + 5 * BEAT, c2 + 5 * BEAT + 10], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.08]} hits={[4 * BEAT, c1 + 4 * BEAT, c2 + 5 * BEAT, ...keyHits(lines, cues, duration)]} whips={[c1, c2]}>
        {cardOut < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: card * (1 - cardOut) }}>
            <Halo x={960} y={400} r={420} intensity={0.45} rgb={WARM} />
            <div style={{ position: "absolute", left: 960 - 330, top: 290, width: 660, height: 220, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid rgba(${WARM},0.6)`, borderRadius: 18, background: "rgba(12,16,22,0.9)", fontSize: 130, fontWeight: 900, letterSpacing: 30, paddingLeft: 30, transform: `rotate(${flip * 180}deg)` }}>ENFJ</div>
            <FocusBox x={960} y={400} w={760} h={300} progress={interpolate(frame, [6, 16], [0, 1], clamp)} label="认知 · COGNITION" />
            <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.alert, opacity: flip }}>颠 覆</div>
          </div>
        )}
        {frame >= c1 && frame < c2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: left }}>我们通常以为</div>
            <Node x={600} y={400} w={420} p={left}>ENFJ 的问题</Node>
            <div style={{ position: "absolute", left: 830, width: 140, top: 340, textAlign: "center", fontSize: 80, fontWeight: 900, color: palette.accent, opacity: eq }}>=</div>
            <Node x={1220} y={400} w={360} p={right}>
              太热心
              <div style={{ position: "absolute", left: 40, right: 40, top: 46, height: 6, background: palette.alert, transformOrigin: "0 50%", transform: `scaleX(${strike})` }} />
            </Node>
          </div>
        )}
        {frame >= c2 && (
          <div style={{ position: "absolute", inset: 0, opacity: line }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim }}>KANT · 这句话的中间</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 380, display: "flex", justifyContent: "center", fontSize: 54, fontWeight: 900, whiteSpace: "nowrap" }}>
              {PARTS.map((p, i) => (
                <span key={p} style={{ color: i === 1 ? `rgb(${WARM})` : palette.ink, opacity: i === 1 ? 1 : 1 - 0.8 * dim, textShadow: i === 1 ? `0 0 ${24 * dim}px rgba(${WARM},0.9)` : undefined, transform: i === 1 ? `scale(${1 + 0.15 * box})` : undefined, display: "inline-block", margin: i === 1 ? "0 14px" : 0 }}>{p}</span>
              ))}
            </div>
            <FocusBox x={694} y={414} w={400} h={120} progress={box} label="盲点 · BLIND SPOT" />
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={WARM} />
      <Sfx name="shutter" at={6} volume={0.2} />
      <Sfx name="whoosh" at={4 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.4} />
      <Sfx name="glitch" at={c1 + 4 * BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.4} />
      <Sfx name="shutter" at={c2 + 5 * BEAT} volume={0.4} />
      <Sfx name="boom" at={c2 + 5 * BEAT} volume={0.4} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
