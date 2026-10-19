import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox, Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Stander } from "../../doubt/circles";
import { BlurCrowd, Cone, Lamp } from "../lights";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Node: React.FC<{ x: number; y: number; w: number; p: number; children: React.ReactNode; color?: string; border?: string; style?: React.CSSProperties }> = ({ x, y, w, p, children, color = palette.ink, border = palette.faint, style }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - 50, width: w, height: 100, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${border}`, borderRadius: 14, background: "rgba(10,14,20,0.88)", fontSize: 52, fontWeight: 900, letterSpacing: 4, color, opacity: p, transform: `scale(${0.85 + 0.15 * p})`, ...style }}>
    {children}
  </div>
);

// 0 · the label itself, 「社恐」, in the viewfinder — peeled off on the beat.
// 1 · what we usually think: 社恐 ← 因为 ← 害怕别人 (and there they are, blurred,
//     behind).
// 2 · 害怕别人 is struck out and drops; 被看见 slams in — and a light snaps on
//     over a small figure under it.
export const MisreadScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const card = useRamp(0, 8);
  const peel = interpolate(frame, [4 * BEAT, 4 * BEAT + 12], [0, 1], { ...clamp, easing: (t) => t * t });
  const cardOut = useRamp(cues[1] - 4, 6);
  const left = useRamp(cues[1], 8);
  const arrow = useRamp(cues[1] + BEAT, 8);
  const right = useRamp(cues[1] + 2 * BEAT, 8);
  const strike = interpolate(frame, [cues[2], cues[2] + 7], [0, 1], clamp);
  const fall = interpolate(frame, [cues[2] + BEAT, cues[2] + BEAT + 14], [0, 1], { ...clamp, easing: (t) => t * t });
  const seen = useRamp(cues[2] + 2 * BEAT, 8);
  const lamp = interpolate(frame, [cues[2] + 3 * BEAT, cues[2] + 3 * BEAT + 3], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      {cardOut < 1 && (
        <div style={{ position: "absolute", inset: 0, opacity: card * (1 - cardOut) }}>
          <Halo x={960} y={400} r={420} intensity={0.45} />
          <div style={{ position: "absolute", left: 960 - 220, top: 290, width: 440, height: 220, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 14, background: "#f3efe6", color: "#c02a3f", fontSize: 130, fontWeight: 900, letterSpacing: 20, paddingLeft: 20, transformOrigin: "0% 0%", transform: `rotate(${-6 + peel * 50}deg) translateY(${peel * 260}px)`, opacity: 1 - peel * 0.8, boxShadow: "0 12px 30px rgba(0,0,0,0.5)" }}>
            社恐
          </div>
          <FocusBox x={960} y={400} w={620} h={300} progress={interpolate(frame, [6, 16], [0, 1], clamp)} label="标签 · LABEL" />
          <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.alert, opacity: peel }}>颠 覆</div>
        </div>
      )}
      {frame >= cues[1] && (
        <div style={{ position: "absolute", inset: 0 }}>
          <BlurCrowd opacity={left * 0.6 * (1 - seen)} blur={9} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 160, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: left * (1 - seen) }}>我们通常以为</div>
          <Node x={480} y={300} w={260} p={left}>社恐</Node>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: arrow }}>
            <line x1={1010} y1={300} x2={1010 - 380 * arrow} y2={300} stroke={palette.accent} strokeWidth={4} />
            <path d={`M${1010 - 380 * arrow + 18} 286 L${1010 - 380 * arrow} 300 L${1010 - 380 * arrow + 18} 314`} fill="none" stroke={palette.accent} strokeWidth={4} />
          </svg>
          <div style={{ position: "absolute", left: 670, width: 300, top: 246, textAlign: "center", fontSize: 30, fontWeight: 700, color: palette.accent, opacity: arrow }}>因为</div>
          <Node x={1300} y={300} w={360} p={right * (1 - fall)} color={strike > 0 ? palette.dim : palette.ink} style={{ transform: `translateY(${fall * 260}px) rotate(${fall * 24}deg) scale(${0.85 + 0.15 * right})` }}>
            害怕别人
            <div style={{ position: "absolute", left: 30, top: 48, height: 6, width: 300 * strike, background: palette.alert, boxShadow: `0 0 12px ${palette.alert}` }} />
          </Node>
          {seen > 0 && (
            <Node x={1300} y={300} w={360} p={seen} color={look.key} border={look.key} style={{ boxShadow: `0 0 40px ${look.keyGlow}`, textShadow: `0 0 18px ${look.keyGlow}` }}>
              被看见
            </Node>
          )}
          {seen > 0 && (
            <div style={{ position: "absolute", inset: 0, opacity: seen }}>
              <Cone id="ms" x={1300} y={420} aimX={1300} floor={760} spread={110} on={lamp} />
              <Lamp x={1300} y={420} floor={760} on={lamp} size={0.8} />
              <Stander x={1300} bottom={760} height={200} lift={1 - lamp} glow={0.5 + 0.7 * lamp} rgb="255, 246, 226" />
            </div>
          )}
        </div>
      )}
      <Sfx name="shutter" at={6} volume={0.2} />
      <Sfx name="whoosh" at={4 * BEAT} volume={0.4} />
      <Sfx name="stamp" at={cues[1]} volume={0.45} />
      <Sfx name="stamp" at={cues[1] + 2 * BEAT} volume={0.45} />
      <Sfx name="glitch" at={cues[2]} volume={0.3} />
      <Sfx name="boom" at={cues[2] + 2 * BEAT} volume={0.45} />
      <Sfx name="shutter" at={cues[2] + 3 * BEAT} volume={0.4} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
