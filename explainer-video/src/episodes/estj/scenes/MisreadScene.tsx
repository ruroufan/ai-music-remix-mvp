import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox, Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { GOLD, LEAF, STEEL } from "../ruler";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Node: React.FC<{ x: number; y: number; w: number; p: number; children: React.ReactNode }> = ({ x, y, w, p, children }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - 50, width: w, height: 100, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${palette.faint}`, borderRadius: 14, background: "rgba(10,14,20,0.88)", fontSize: 46, fontWeight: 900, letterSpacing: 4, color: palette.ink, opacity: p, transform: `scale(${0.85 + 0.15 * p})` }}>
    {children}
  </div>
);

// 0 · 「ESTJ」 in the viewfinder, flipped over on the beat.
// 1 · what we usually think: ESTJ = 控制欲强 · 爱管人 — struck out.
// 2 · his reason: a map — the long, winding way round (弯路) in grey, and his
//     straight gold arrow through it: 少走弯路. Tag: 出发点 · 好的.
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
  const wind = interpolate(frame, [c2 + 4, c2 + 3 * BEAT], [0, 1], clamp);
  const arrow = interpolate(frame, [c2 + 4 * BEAT, c2 + 5 * BEAT], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const good = useRamp(c2 + 2 * BEAT, 8);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.08]} hits={[4 * BEAT, c1 + 4 * BEAT, c2 + 2 * BEAT, c2 + 5 * BEAT, ...keyHits(lines, cues, duration)]} whips={[c1, c2]}>
        {cardOut < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: card * (1 - cardOut) }}>
            <Halo x={960} y={400} r={420} intensity={0.45} rgb={GOLD} />
            <div style={{ position: "absolute", left: 960 - 330, top: 290, width: 660, height: 220, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid rgba(${GOLD},0.6)`, borderRadius: 18, background: "rgba(12,16,22,0.9)", fontSize: 130, fontWeight: 900, letterSpacing: 30, paddingLeft: 30, transform: `rotate(${flip * 180}deg)` }}>ESTJ</div>
            <FocusBox x={960} y={400} w={760} h={300} progress={interpolate(frame, [6, 16], [0, 1], clamp)} label="认知 · COGNITION" />
            <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.alert, opacity: flip }}>颠 覆</div>
          </div>
        )}
        {frame >= c1 && frame < c2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: left }}>我们通常以为</div>
            <Node x={520} y={400} w={260} p={left}>ESTJ</Node>
            <div style={{ position: "absolute", left: 660, width: 140, top: 340, textAlign: "center", fontSize: 80, fontWeight: 900, color: palette.accent, opacity: eq }}>=</div>
            <Node x={1200} y={400} w={600} p={right}>
              控制欲强 · 爱管人
              <div style={{ position: "absolute", left: 40, right: 40, top: 46, height: 6, background: palette.alert, transformOrigin: "0 50%", transform: `scaleX(${strike})` }} />
            </Node>
          </div>
        )}
        {frame >= c2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <path d="M300 760 C 360 300, 620 300, 700 600 S 1000 900, 1100 520 S 1400 200, 1620 340" fill="none" stroke={`rgba(${STEEL},0.6)`} strokeWidth={6} strokeDasharray="2600" strokeDashoffset={2600 * (1 - wind)} />
              <line x1={300} y1={760} x2={300 + (1620 - 300) * arrow} y2={760 + (340 - 760) * arrow} stroke={`rgb(${GOLD})`} strokeWidth={12} strokeLinecap="round" />
              {arrow > 0.95 && <path d="M1590 330 L1624 338 L1606 368" fill="none" stroke={`rgb(${GOLD})`} strokeWidth={12} strokeLinecap="round" />}
              <circle cx={300} cy={760} r={16} fill={`rgb(${LEAF})`} />
              <circle cx={1620} cy={340} r={16} fill={`rgb(${LEAF})`} />
            </svg>
            <div style={{ position: "absolute", left: 640, top: 300, fontFamily: fonts.mono, fontSize: 24, letterSpacing: 6, color: palette.dim, opacity: wind }}>弯路</div>
            <div style={{ position: "absolute", left: 1000, top: 600, fontSize: 40, fontWeight: 900, color: `rgb(${GOLD})`, opacity: arrow }}>少走弯路</div>
            <div style={{ position: "absolute", left: 220, top: 160, padding: "10px 24px", borderRadius: 12, border: `3px solid rgb(${LEAF})`, fontSize: 40, fontWeight: 900, color: `rgb(${LEAF})`, opacity: good }}>出发点 · 好的</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} />
      <Sfx name="shutter" at={6} volume={0.2} />
      <Sfx name="whoosh" at={4 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.4} />
      <Sfx name="glitch" at={c1 + 4 * BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.4} />
      <Sfx name="glint" at={c2 + 2 * BEAT} volume={0.35} />
      <Sfx name="whoosh" at={c2 + 4 * BEAT} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
