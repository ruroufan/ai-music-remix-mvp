import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox, Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Walker } from "../../nostalgia/road";
import { RIFT, ROSE, SKY } from "../crack";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Node: React.FC<{ x: number; y: number; w: number; p: number; children: React.ReactNode }> = ({ x, y, w, p, children }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - 50, width: w, height: 100, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${palette.faint}`, borderRadius: 14, background: "rgba(10,14,20,0.88)", fontSize: 44, fontWeight: 900, letterSpacing: 4, color: palette.ink, opacity: p, transform: `scale(${0.85 + 0.15 * p})` }}>
    {children}
  </div>
);
const CROWD = [380, 620, 1300, 1540];

// 0 · 「ISFP」 in the viewfinder, flipped over on the beat.
// 1 · what we usually think: ISFP = 温和 · 随性 · 和谁都处得来.
// 2 · him among friends, smiling, easy — and the light behind him throws his
//     shadow on the wall: not standing with them but turned away, mid-stride,
//     already going. 随时准备离开.
export const MisreadScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const card = useRamp(0, 8);
  const flip = interpolate(frame, [4 * BEAT, 4 * BEAT + 10], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const cardOut = useRamp(c1 - 4, 6);
  const left = useRamp(c1, 8);
  const eq = useRamp(c1 + BEAT, 8);
  const right = useRamp(c1 + 2 * BEAT, 8);
  const crowd = useRamp(c2, 10);
  const shadow = interpolate(frame, [c2 + 3 * BEAT, c2 + 5 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const box = interpolate(frame, [c2 + 5 * BEAT, c2 + 5 * BEAT + 10], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.08]} hits={[4 * BEAT, c2 + 5 * BEAT, ...keyHits(lines, cues, duration)]} whips={[c1, c2]}>
        {cardOut < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: card * (1 - cardOut) }}>
            <Halo x={960} y={400} r={420} intensity={0.45} rgb={ROSE} />
            <div style={{ position: "absolute", left: 960 - 330, top: 290, width: 660, height: 220, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid rgba(${ROSE},0.6)`, borderRadius: 18, background: "rgba(12,16,22,0.9)", fontSize: 130, fontWeight: 900, letterSpacing: 30, paddingLeft: 30, transform: `rotate(${flip * 180}deg)` }}>ISFP</div>
            <FocusBox x={960} y={400} w={760} h={300} progress={interpolate(frame, [6, 16], [0, 1], clamp)} label="认知 · COGNITION" />
            <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.alert, opacity: flip }}>颠 覆</div>
          </div>
        )}
        {frame >= c1 && frame < c2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: left }}>我们通常以为</div>
            <Node x={400} y={400} w={240} p={left}>ISFP</Node>
            <div style={{ position: "absolute", left: 530, width: 120, top: 340, textAlign: "center", fontSize: 80, fontWeight: 900, color: palette.accent, opacity: eq }}>=</div>
            <Node x={1130} y={400} w={820} p={right}>温和 · 随性 · 和谁都处得来</Node>
          </div>
        )}
        {frame >= c2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            {/* the wall, and his shadow on it: turned away, mid-stride */}
            <div style={{ position: "absolute", left: 160, top: 120, width: 1600, height: 640, background: "linear-gradient(180deg, rgba(40,36,44,0.6), rgba(20,18,24,0.4))", border: "1px solid rgba(232,238,242,0.08)", opacity: crowd }} />
            <Halo x={960} y={360} r={360} intensity={0.6 * shadow} rgb={RIFT} />
            <div style={{ position: "absolute", inset: 0, opacity: 0.9 * shadow }}>
              <Walker x={1020} bottom={760} height={560} face="left" walk={0.9} lean={6} glow={0.2} rgb={RIFT} />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 760, height: 2, background: "rgba(232,238,242,0.2)" }} />
            {CROWD.map((x) => (
              <Stander key={x} x={x} bottom={900} height={300} lift={1} glow={0.35} rgb={SKY} opacity={crowd * (1 - 0.4 * shadow)} />
            ))}
            <Stander x={960} bottom={900} height={320} lift={1.4} glow={0.6} rgb={ROSE} opacity={crowd} />
            <FocusBox x={960} y={430} w={520} h={600} progress={box} label="随时准备离开" color={`rgb(${RIFT})`} />
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={ROSE} />
      <Sfx name="shutter" at={6} volume={0.2} />
      <Sfx name="whoosh" at={4 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.4} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.4} />
      <Sfx name="rise" at={c2 + 3 * BEAT} volume={0.3} />
      <Sfx name="glitch" at={c2 + 5 * BEAT} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
