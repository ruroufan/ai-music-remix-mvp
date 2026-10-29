import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox, Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { BLOOM, GLOW, GreyStreet, Holder } from "../cloche";
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

// 0 · 「INFP」 in the viewfinder, flipped over on the beat.
// 1 · what we usually think: INFP = 太天真 · 看不清现实 — struck out.
// 2 · the grey street, in perfect focus — 看得清清楚楚 — and him at the edge
//     of it, toes on the line, not stepping over. 看不清 (dimming) → 看清了，
//     才不敢走进去.
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
  const focus = interpolate(frame, [c2 + 6, c2 + 18], [0, 1], clamp);
  const truth = useRamp(c2 + 5 * BEAT, 8);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.08]} hits={[4 * BEAT, c1 + 4 * BEAT, c2 + 5 * BEAT, ...keyHits(lines, cues, duration)]} whips={[c1, c2]}>
        {cardOut < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: card * (1 - cardOut) }}>
            <Halo x={960} y={400} r={420} intensity={0.45} rgb={GLOW} />
            <div style={{ position: "absolute", left: 960 - 330, top: 290, width: 660, height: 220, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid rgba(${GLOW},0.6)`, borderRadius: 18, background: "rgba(12,16,22,0.9)", fontSize: 130, fontWeight: 900, letterSpacing: 30, paddingLeft: 30, transform: `rotate(${flip * 180}deg)` }}>INFP</div>
            <FocusBox x={960} y={400} w={760} h={300} progress={interpolate(frame, [6, 16], [0, 1], clamp)} label="认知 · COGNITION" />
            <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.alert, opacity: flip }}>颠 覆</div>
          </div>
        )}
        {frame >= c1 && frame < c2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: left }}>我们通常以为</div>
            <Node x={520} y={400} w={260} p={left}>INFP</Node>
            <div style={{ position: "absolute", left: 660, width: 140, top: 340, textAlign: "center", fontSize: 80, fontWeight: 900, color: palette.accent, opacity: eq }}>=</div>
            <Node x={1220} y={400} w={620} p={right}>
              太天真 · 看不清现实
              <div style={{ position: "absolute", left: 40, right: 40, top: 46, height: 6, background: palette.alert, transformOrigin: "0 50%", transform: `scaleX(${strike})` }} />
            </Node>
          </div>
        )}
        {frame >= c2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", inset: 0, filter: `blur(${(1 - focus) * 8}px)` }}>
              <GreyStreet frame={frame} />
            </div>
            <div style={{ position: "absolute", left: 0, width: 560, top: 0, bottom: 0, background: "linear-gradient(90deg, rgba(6,8,10,0.95) 70%, transparent)" }} />
            <Holder x={360} height={300} />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <line x1={500} y1={300} x2={500} y2={900} stroke={`rgba(${BLOOM},0.8)`} strokeWidth={3} strokeDasharray="10 10" />
            </svg>
            <div style={{ position: "absolute", left: 520, top: 300, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: `rgb(${BLOOM})` }}>现实 →</div>
            <FocusBox x={1240} y={580} w={1100} h={560} progress={focus} label="看得清清楚楚" />
            <div style={{ position: "absolute", left: 900, top: 180, width: 680, padding: "30px 0", textAlign: "center", borderRadius: 18, border: `3px solid rgb(${GLOW})`, background: "rgba(14,12,10,0.92)", opacity: truth, transform: `scale(${1.25 - 0.25 * truth})`, boxShadow: `0 0 ${60 * truth}px rgba(${GLOW},0.45)` }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, textDecoration: "line-through" }}>以为的 · 看不清</div>
              <div style={{ marginTop: 16, fontSize: 60, fontWeight: 900, color: palette.ink, textShadow: `0 0 24px rgba(${GLOW},0.8)` }}>看清了，才不敢走进去</div>
            </div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={GLOW} />
      <Sfx name="shutter" at={6} volume={0.2} />
      <Sfx name="whoosh" at={4 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.4} />
      <Sfx name="glitch" at={c1 + 4 * BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.4} />
      <Sfx name="shutter" at={c2 + 18} volume={0.35} />
      <Sfx name="boom" at={c2 + 5 * BEAT} volume={0.45} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
