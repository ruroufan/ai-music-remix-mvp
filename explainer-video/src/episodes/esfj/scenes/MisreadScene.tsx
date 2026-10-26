import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox, Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { GREEN, GREY, WARM } from "../ring";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const NET = [[460, 520], [700, 340], [1220, 340], [1460, 520], [700, 760], [1220, 760]];

const Node: React.FC<{ x: number; y: number; w: number; p: number; children: React.ReactNode }> = ({ x, y, w, p, children }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - 50, width: w, height: 100, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${palette.faint}`, borderRadius: 14, background: "rgba(10,14,20,0.88)", fontSize: 46, fontWeight: 900, letterSpacing: 4, color: palette.ink, opacity: p, transform: `scale(${0.85 + 0.15 * p})` }}>
    {children}
  </div>
);

// 0 · 「ESFJ」 in the viewfinder, flipped over on the beat.
// 1 · what we usually think: ESFJ 在意看法 = 虚荣 — struck out.
// 2 · a web of people with him at the centre, threads running to each; one by
//     one the others light up — and only when they're all lit does he light
//     too: 大家好 · 自己才好.
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
  const on = (i: number) => interpolate(frame, [c2 + BEAT + i * 6, c2 + BEAT + i * 6 + 6], [0, 1], clamp);
  const rel = useRamp(c2 + 4, 10);
  const me = interpolate(frame, [c2 + BEAT + NET.length * 6, c2 + BEAT + NET.length * 6 + 10], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.08]} hits={[4 * BEAT, c1 + 4 * BEAT, c2 + BEAT + NET.length * 6, ...keyHits(lines, cues, duration)]} whips={[c1, c2]}>
        {cardOut < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: card * (1 - cardOut) }}>
            <Halo x={960} y={400} r={420} intensity={0.45} rgb={WARM} />
            <div style={{ position: "absolute", left: 960 - 330, top: 290, width: 660, height: 220, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid rgba(${WARM},0.6)`, borderRadius: 18, background: "rgba(12,16,22,0.9)", fontSize: 130, fontWeight: 900, letterSpacing: 30, paddingLeft: 30, transform: `rotate(${flip * 180}deg)` }}>ESFJ</div>
            <FocusBox x={960} y={400} w={760} h={300} progress={interpolate(frame, [6, 16], [0, 1], clamp)} label="认知 · COGNITION" />
            <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.alert, opacity: flip }}>颠 覆</div>
          </div>
        )}
        {frame >= c1 && frame < c2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: left }}>我们通常以为</div>
            <Node x={580} y={400} w={480} p={left}>ESFJ 在意看法</Node>
            <div style={{ position: "absolute", left: 830, width: 140, top: 340, textAlign: "center", fontSize: 80, fontWeight: 900, color: palette.accent, opacity: eq }}>=</div>
            <Node x={1220} y={400} w={300} p={right}>
              虚荣
              <div style={{ position: "absolute", left: 40, right: 40, top: 46, height: 6, background: palette.alert, transformOrigin: "0 50%", transform: `scaleX(${strike})` }} />
            </Node>
          </div>
        )}
        {frame >= c2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              {NET.map(([x, y], i) => <line key={i} x1={960} y1={560} x2={x} y2={y} stroke={`rgba(${on(i) > 0.5 ? GREEN : GREY},0.6)`} strokeWidth={3} />)}
            </svg>
            {NET.map(([x, y], i) => <Stander key={i} x={x} bottom={y + 90} height={180} lift={1} glow={0.2 + 0.7 * on(i)} rgb={on(i) > 0.5 ? GREEN : GREY} />)}
            <Stander x={960} bottom={680} height={240} lift={me} glow={0.2 + 0.8 * me} rgb={me > 0.5 ? WARM : GREY} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 130, textAlign: "center", fontSize: 44, fontWeight: 900, letterSpacing: 8, color: `rgb(${WARM})`, opacity: me }}>大家好 · 自己才好</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 900, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 8, color: palette.dim, opacity: rel }}>在意的是 · 关系本身</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={WARM} />
      <Sfx name="shutter" at={6} volume={0.2} />
      <Sfx name="whoosh" at={4 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.4} />
      <Sfx name="glitch" at={c1 + 4 * BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.4} />
      {NET.map((_, i) => (
        <Sfx key={i} name="glint" at={c2 + BEAT + i * 6} volume={0.12} />
      ))}
      <Sfx name="rise" at={c2 + BEAT + NET.length * 6} volume={0.3} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
