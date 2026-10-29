import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox, Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { SUN } from "../field";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const RED = "255, 110, 110";

const Node: React.FC<{ x: number; y: number; w: number; p: number; children: React.ReactNode }> = ({ x, y, w, p, children }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - 50, width: w, height: 100, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${palette.faint}`, borderRadius: 14, background: "rgba(10,14,20,0.88)", fontSize: 46, fontWeight: 900, letterSpacing: 4, color: palette.ink, opacity: p, transform: `scale(${0.85 + 0.15 * p})` }}>
    {children}
  </div>
);

const Meter: React.FC<{ x: number; label: string; value: number; color: string; p: number }> = ({ x, label, value, color, p }) => (
  <div style={{ position: "absolute", left: x - 140, top: 220, width: 280, opacity: p }}>
    <div style={{ height: 420, border: "3px solid rgba(232,238,242,0.4)", borderRadius: 18, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${value * 100}%`, background: `rgba(${color},0.85)` }} />
    </div>
    <div style={{ marginTop: 18, textAlign: "center", fontSize: 50, fontWeight: 900, color: palette.ink }}>{label}</div>
    <div style={{ textAlign: "center", fontFamily: fonts.mono, fontSize: 30, color: `rgb(${color})` }}>{Math.round(value * 100)}%</div>
  </div>
);

// 0 · 「ENFP」 in the viewfinder, flipped over on the beat.
// 1 · what we usually think: ENFP = 三分钟热度 · 不够自律 — struck out.
// 2 · two gauges side by side: 热情, filled to the top — 100% — and 承诺,
//     empty: 0%. The empty one is what's missing.
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
  const passion = interpolate(frame, [c2 + 4, c2 + 2 * BEAT], [0, 1], clamp);
  const commit = useRamp(c2 + 3 * BEAT, 8);
  const box = interpolate(frame, [c2 + 4 * BEAT, c2 + 4 * BEAT + 10], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.08]} hits={[4 * BEAT, c1 + 4 * BEAT, c2 + 4 * BEAT, ...keyHits(lines, cues, duration)]} whips={[c1, c2]}>
        {cardOut < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: card * (1 - cardOut) }}>
            <Halo x={960} y={400} r={420} intensity={0.45} rgb={SUN} />
            <div style={{ position: "absolute", left: 960 - 330, top: 290, width: 660, height: 220, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid rgba(${SUN},0.6)`, borderRadius: 18, background: "rgba(12,16,22,0.9)", fontSize: 130, fontWeight: 900, letterSpacing: 30, paddingLeft: 30, transform: `rotate(${flip * 180}deg)` }}>ENFP</div>
            <FocusBox x={960} y={400} w={760} h={300} progress={interpolate(frame, [6, 16], [0, 1], clamp)} label="认知 · COGNITION" />
            <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.alert, opacity: flip }}>颠 覆</div>
          </div>
        )}
        {frame >= c1 && frame < c2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: left }}>我们通常以为</div>
            <Node x={480} y={400} w={260} p={left}>ENFP</Node>
            <div style={{ position: "absolute", left: 620, width: 140, top: 340, textAlign: "center", fontSize: 80, fontWeight: 900, color: palette.accent, opacity: eq }}>=</div>
            <Node x={1200} y={400} w={640} p={right}>
              三分钟热度 · 不够自律
              <div style={{ position: "absolute", left: 40, right: 40, top: 46, height: 6, background: palette.alert, transformOrigin: "0 50%", transform: `scaleX(${strike})` }} />
            </Node>
          </div>
        )}
        {frame >= c2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Halo x={640} y={420} r={300} intensity={0.5 * passion} rgb={SUN} />
            <Meter x={640} label="热情" value={passion} color={SUN} p={1} />
            <Meter x={1280} label="承诺" value={0} color={RED} p={commit} />
            <FocusBox x={1280} y={480} w={360} h={560} progress={box} label="缺的是这个" />
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={SUN} />
      <Sfx name="shutter" at={6} volume={0.2} />
      <Sfx name="whoosh" at={4 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.4} />
      <Sfx name="glitch" at={c1 + 4 * BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.4} />
      <Sfx name="rise" at={c2 + 4} volume={0.3} />
      <Sfx name="boom" at={c2 + 4 * BEAT} volume={0.45} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
