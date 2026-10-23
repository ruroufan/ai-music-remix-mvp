import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox, Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { COOL, LAMP, Room } from "../lantern";
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

// 0 · 「INFJ」 in the viewfinder, flipped over on the beat.
// 1 · what we usually think: INFJ 不被懂 ← 因为 ← 太复杂、太深 — struck out.
// 2 · his room, close: the window boarded from the inside, the door locked
//     from the inside — the bolt is on his side. 看不懂 (dimming) → 没让人看.
export const MisreadScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const card = useRamp(0, 8);
  const flip = interpolate(frame, [4 * BEAT, 4 * BEAT + 10], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const cardOut = useRamp(c1 - 4, 6);
  const left = useRamp(c1, 8);
  const arrow = useRamp(c1 + BEAT, 8);
  const right = useRamp(c1 + 2 * BEAT, 8);
  const strike = interpolate(frame, [c1 + 4 * BEAT, c1 + 4 * BEAT + 6], [0, 1], clamp);
  const bolt = interpolate(frame, [c2 + 2 * BEAT, c2 + 2 * BEAT + 6], [0, 1], clamp);
  const truth = useRamp(c2 + 4 * BEAT, 8);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.08]} hits={[4 * BEAT, c1 + 4 * BEAT, c2 + 2 * BEAT, c2 + 4 * BEAT, ...keyHits(lines, cues, duration)]} whips={[c1, c2]}>
        {cardOut < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: card * (1 - cardOut) }}>
            <Halo x={960} y={400} r={420} intensity={0.45} rgb={LAMP} />
            <div style={{ position: "absolute", left: 960 - 330, top: 290, width: 660, height: 220, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid rgba(${LAMP},0.6)`, borderRadius: 18, background: "rgba(12,16,22,0.9)", fontSize: 130, fontWeight: 900, letterSpacing: 30, paddingLeft: 30, transform: `rotate(${flip * 180}deg)` }}>INFJ</div>
            <FocusBox x={960} y={400} w={760} h={300} progress={interpolate(frame, [6, 16], [0, 1], clamp)} label="认知 · COGNITION" />
            <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.alert, opacity: flip }}>颠 覆</div>
          </div>
        )}
        {frame >= c1 && frame < c2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: left }}>我们通常以为</div>
            <Node x={440} y={400} w={340} p={left}>INFJ 不被懂</Node>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: arrow }}>
              <line x1={1000} y1={400} x2={1000 - 400 * arrow} y2={400} stroke={palette.accent} strokeWidth={4} />
              <path d={`M${1000 - 400 * arrow + 18} 386 L${1000 - 400 * arrow} 400 L${1000 - 400 * arrow + 18} 414`} fill="none" stroke={palette.accent} strokeWidth={4} />
            </svg>
            <div style={{ position: "absolute", left: 650, width: 300, top: 346, textAlign: "center", fontSize: 30, fontWeight: 700, color: palette.accent, opacity: arrow }}>因为</div>
            <Node x={1340} y={400} w={400} p={right}>
              太复杂、太深
              <div style={{ position: "absolute", left: 40, right: 40, top: 46, height: 6, background: palette.alert, transformOrigin: "0 50%", transform: `scaleX(${strike})` }} />
            </Node>
          </div>
        )}
        {frame >= c2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Room x={300} w={560} h={460} bottom={860} shut={1} who />
            {/* the bolt, on the inside */}
            <div style={{ position: "absolute", left: 386, top: 740, width: 60, height: 16, borderRadius: 4, background: `rgb(${LAMP})`, transform: `translateX(${-50 + 50 * bolt}px)`, boxShadow: `0 0 16px rgba(${LAMP},0.8)` }} />
            <div style={{ position: "absolute", left: 300, width: 560, top: 230, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: `rgb(${LAMP})`, opacity: bolt }}>锁 · 在里面</div>
            <div style={{ position: "absolute", left: 1040, top: 250, width: 560, padding: "26px 0", textAlign: "center", borderRadius: 16, border: `2px solid rgba(${COOL},0.4)`, background: "rgba(16,20,26,0.9)", opacity: 1 - 0.65 * truth }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim }}>以为的</div>
              <div style={{ marginTop: 14, fontSize: 58, fontWeight: 900, color: palette.dim, textDecoration: truth > 0.5 ? "line-through" : undefined }}>别人看不懂</div>
            </div>
            <div style={{ position: "absolute", left: 1000, top: 520, width: 640, padding: "36px 0", textAlign: "center", borderRadius: 18, border: `3px solid rgb(${LAMP})`, background: `rgba(${LAMP},0.12)`, opacity: truth, transform: `scale(${1.25 - 0.25 * truth})`, boxShadow: `0 0 ${60 * truth}px rgba(${LAMP},0.45)` }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: `rgb(${LAMP})` }}>其实是</div>
              <div style={{ marginTop: 16, fontSize: 74, fontWeight: 900, color: palette.ink, textShadow: `0 0 24px rgba(${LAMP},0.8)` }}>没让别人看</div>
            </div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={LAMP} />
      <Sfx name="shutter" at={6} volume={0.2} />
      <Sfx name="whoosh" at={4 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.4} />
      <Sfx name="glitch" at={c1 + 4 * BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.4} />
      <Sfx name="stamp" at={c2 + 2 * BEAT} volume={0.5} />
      <Sfx name="boom" at={c2 + 4 * BEAT} volume={0.45} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
