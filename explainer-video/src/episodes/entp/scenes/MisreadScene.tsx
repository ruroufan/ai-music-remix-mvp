import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox, Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { COLD, RED } from "../ring";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Node: React.FC<{ x: number; y: number; w: number; p: number; children: React.ReactNode; color?: string; border?: string; style?: React.CSSProperties }> = ({ x, y, w, p, children, color = palette.ink, border = palette.faint, style }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - 50, width: w, height: 100, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${border}`, borderRadius: 14, background: "rgba(10,14,20,0.88)", fontSize: 50, fontWeight: 900, letterSpacing: 4, color, opacity: p, transform: `scale(${0.85 + 0.15 * p})`, ...style }}>
    {children}
  </div>
);

// 0 · 「ENTP」 in the viewfinder, flipped over on the beat.
// 1 · what we usually think: ENTP 爱辩论 ← 因为 ← 追求真理 — struck out.
// 2 · Schopenhauer's needle: a pin stabs down into 追求真理 — 一针见血.
// 3 · two cards: 以为关心的 · 真理 (dimming) — and, slamming in red, 真正关心的
//     · 我是对的.
export const MisreadScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2, c3] = cues;
  const card = useRamp(0, 8);
  const flip = interpolate(frame, [4 * BEAT, 4 * BEAT + 10], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const cardOut = useRamp(c1 - 4, 6);
  const left = useRamp(c1, 8);
  const arrow = useRamp(c1 + BEAT, 8);
  const right = useRamp(c1 + 2 * BEAT, 8);
  const out1 = useRamp(c2 - 4, 6);
  const busy = useRamp(c3, 8);
  const pin = interpolate(frame, [c2 + BEAT, c2 + BEAT + 5], [0, 1], { ...clamp, easing: (t) => t * t });
  const want = useRamp(c3 + 4 * BEAT, 8);
  const strike = interpolate(frame, [c1 + 4 * BEAT, c1 + 4 * BEAT + 6], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.08]} hits={[...[4 * BEAT, c1 + 4 * BEAT, c3 + 4 * BEAT], ...keyHits(lines, cues, duration)]} whips={[c1, c3]}>
        {cardOut < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: card * (1 - cardOut) }}>
            <Halo x={960} y={400} r={420} intensity={0.45} />
            <div style={{ position: "absolute", left: 960 - 330, top: 290, width: 660, height: 220, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid rgba(${palette.halo},0.6)`, borderRadius: 18, background: "rgba(12,16,22,0.9)", fontSize: 130, fontWeight: 900, letterSpacing: 30, paddingLeft: 30, transform: `rotate(${flip * 180}deg)` }}>ENTP</div>
            <FocusBox x={960} y={400} w={760} h={300} progress={interpolate(frame, [6, 16], [0, 1], clamp)} label="认知 · COGNITION" />
            <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.alert, opacity: flip }}>颠 覆</div>
          </div>
        )}
        {frame >= c1 && out1 < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: 1 - out1 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: left }}>我们通常以为</div>
            <Node x={440} y={400} w={340} p={left}>ENTP 爱辩论</Node>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: arrow }}>
              <line x1={980} y1={400} x2={980 - 380 * arrow} y2={400} stroke={palette.accent} strokeWidth={4} />
              <path d={`M${980 - 380 * arrow + 18} 386 L${980 - 380 * arrow} 400 L${980 - 380 * arrow + 18} 414`} fill="none" stroke={palette.accent} strokeWidth={4} />
            </svg>
            <div style={{ position: "absolute", left: 640, width: 300, top: 346, textAlign: "center", fontSize: 30, fontWeight: 700, color: palette.accent, opacity: arrow }}>因为</div>
            <Node x={1320} y={400} w={320} p={right}>
              追求真理
              <div style={{ position: "absolute", left: 40, right: 40, top: 46, height: 6, background: palette.alert, transformOrigin: "0 50%", transform: `scaleX(${strike})` }} />
            </Node>
          </div>
        )}
        {frame >= c2 && frame < c3 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Node x={1320} y={400} w={320} p={1}>追求真理</Node>
            <div style={{ position: "absolute", left: 1320 - 4, top: 400 - 260 + 220 * pin, width: 8, height: 230, background: `linear-gradient(rgba(232,238,242,0.9), rgb(${RED}))`, transform: "rotate(18deg)", transformOrigin: "50% 100%" }} />
            <div style={{ position: "absolute", left: 1320 - 170, width: 340, top: 480, textAlign: "center", fontSize: 30, fontWeight: 900, color: `rgb(${RED})`, opacity: pin > 0.95 ? 1 : 0 }}>一针见血</div>
            <div style={{ position: "absolute", left: 300, top: 260, fontFamily: fonts.mono, fontSize: 24, letterSpacing: 6, color: palette.dim }}>SCHOPENHAUER ·《辩论的艺术》</div>
          </div>
        )}
        {frame >= c3 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 300, top: 260, width: 520, padding: "30px 0", textAlign: "center", borderRadius: 16, border: `2px solid rgba(${COLD},0.4)`, background: "rgba(16,20,26,0.9)", opacity: busy * (1 - 0.65 * want) }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim }}>以为关心的</div>
              <div style={{ marginTop: 16, fontSize: 64, fontWeight: 900, color: palette.dim }}>真理</div>
            </div>
            <div style={{ position: "absolute", left: 1040, top: 220, width: 600, padding: "40px 0", textAlign: "center", borderRadius: 18, border: `3px solid rgb(${RED})`, background: `rgba(${RED},0.12)`, opacity: want, transform: `scale(${1.25 - 0.25 * want})`, boxShadow: `0 0 ${60 * want}px rgba(${RED},0.5)` }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: `rgb(${RED})` }}>真正关心的</div>
              <div style={{ marginTop: 18, fontSize: 80, fontWeight: 900, color: palette.ink, textShadow: `0 0 24px rgba(${RED},0.8)` }}>我是对的</div>
            </div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} />
      <Sfx name="shutter" at={6} volume={0.2} />
      <Sfx name="whoosh" at={4 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.4} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.4} />
      <Sfx name="glitch" at={c1 + 4 * BEAT} volume={0.3} />
      <Sfx name="stamp" at={c2 + BEAT + 5} volume={0.5} />
      <Sfx name="shutter" at={c3} volume={0.3} />
      <Sfx name="boom" at={c3 + 4 * BEAT} volume={0.45} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
