import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox, Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Node: React.FC<{ x: number; y: number; w: number; p: number; children: React.ReactNode; color?: string; border?: string; style?: React.CSSProperties }> = ({ x, y, w, p, children, color = palette.ink, border = palette.faint, style }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - 50, width: w, height: 100, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${border}`, borderRadius: 14, background: "rgba(10,14,20,0.88)", fontSize: 52, fontWeight: 900, letterSpacing: 4, color, opacity: p, transform: `scale(${0.85 + 0.15 * p})`, ...style }}>
    {children}
  </div>
);

// 0 · 「控制欲」 in the viewfinder, flipped over on the beat.
// 1 · what we usually think: 控制欲 ← 因为 ← 能力强 — and a big, upright
//     figure, sure of itself.
// 2 · 能力强 is struck out; 内心不安 slams in — and the big figure goes see-
//     through: inside, a small one, hunched and shaking.
export const MisreadScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2] = cues;
  const card = useRamp(0, 8);
  const flip = interpolate(frame, [4 * BEAT, 4 * BEAT + 10], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const cardOut = useRamp(c1 - 4, 6);
  const left = useRamp(c1, 8);
  const arrow = useRamp(c1 + BEAT, 8);
  const right = useRamp(c1 + 2 * BEAT, 8);
  const strike = interpolate(frame, [c2, c2 + 7], [0, 1], clamp);
  const fall = interpolate(frame, [c2 + BEAT, c2 + BEAT + 14], [0, 1], { ...clamp, easing: (t) => t * t });
  const swap = useRamp(c2 + 2 * BEAT, 8);
  const seeThrough = useRamp(c2 + 3 * BEAT, 12);
  const big = useRamp(c1 + 3 * BEAT, 10);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.06]} hits={[4 * BEAT, c2 + 2 * BEAT]} whips={[c1]}>
        {cardOut < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: card * (1 - cardOut) }}>
            <Halo x={960} y={400} r={420} intensity={0.45} />
            <div style={{ position: "absolute", left: 960 - 330, top: 290, width: 660, height: 220, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid rgba(${palette.halo},0.6)`, borderRadius: 18, background: "rgba(12,16,22,0.9)", fontSize: 120, fontWeight: 900, letterSpacing: 20, paddingLeft: 20, transform: `rotate(${flip * 180}deg)` }}>控制欲</div>
            <FocusBox x={960} y={400} w={760} h={300} progress={interpolate(frame, [6, 16], [0, 1], clamp)} label="认知 · COGNITION" />
            <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.alert, opacity: flip }}>颠 覆</div>
          </div>
        )}
        {frame >= c1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: left * (1 - swap) }}>我们通常以为</div>
            <Node x={460} y={290} w={300} p={left}>控制欲</Node>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: arrow }}>
              <line x1={1010} y1={290} x2={1010 - 380 * arrow} y2={290} stroke={palette.accent} strokeWidth={4} />
              <path d={`M${1010 - 380 * arrow + 18} 276 L${1010 - 380 * arrow} 290 L${1010 - 380 * arrow + 18} 304`} fill="none" stroke={palette.accent} strokeWidth={4} />
            </svg>
            <div style={{ position: "absolute", left: 670, width: 300, top: 236, textAlign: "center", fontSize: 30, fontWeight: 700, color: palette.accent, opacity: arrow }}>因为</div>
            <Node x={1320} y={290} w={340} p={right * (1 - fall)} color={strike > 0 ? palette.dim : palette.ink} style={{ transform: `translateY(${fall * 260}px) rotate(${fall * 24}deg) scale(${0.85 + 0.15 * right})` }}>
              能力强
              <div style={{ position: "absolute", left: 30, top: 48, height: 6, width: 280 * strike, background: palette.alert, boxShadow: `0 0 12px ${palette.alert}` }} />
            </Node>
            {swap > 0 && <Node x={1320} y={290} w={340} p={swap} color={look.key} border={look.key} style={{ boxShadow: `0 0 40px ${look.keyGlow}`, textShadow: `0 0 18px ${look.keyGlow}` }}>内心不安</Node>}
            <div style={{ position: "absolute", inset: 0, opacity: big * (1 - 0.65 * seeThrough) }}>
              <Stander x={960} bottom={780} height={360} lift={2} glow={0.9} />
            </div>
            {seeThrough > 0 && (
              <div style={{ position: "absolute", inset: 0, opacity: seeThrough }}>
                <Stander x={960 + Math.sin(frame * 2.3) * 3} bottom={740} height={150} lift={0} glow={1.2} rgb="255, 77, 109" />
              </div>
            )}
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} />
      <Sfx name="shutter" at={6} volume={0.2} />
      <Sfx name="whoosh" at={4 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c1} volume={0.4} />
      <Sfx name="stamp" at={c1 + 2 * BEAT} volume={0.45} />
      <Sfx name="glitch" at={c2} volume={0.3} />
      <Sfx name="boom" at={c2 + 2 * BEAT} volume={0.45} />
      <Sfx name="glitch" at={c2 + 3 * BEAT} volume={0.25} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
