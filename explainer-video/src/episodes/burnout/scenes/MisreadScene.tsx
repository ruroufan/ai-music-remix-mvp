import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox, Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam } from "../../glass/immersive";
import { SCREEN } from "../treadmill";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Node: React.FC<{ x: number; y: number; w: number; p: number; children: React.ReactNode; color?: string; border?: string; style?: React.CSSProperties }> = ({ x, y, w, p, children, color = palette.ink, border = palette.faint, style }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - 50, width: w, height: 100, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${border}`, borderRadius: 14, background: "rgba(10,14,20,0.88)", fontSize: 50, fontWeight: 900, letterSpacing: 4, color, opacity: p, transform: `scale(${0.85 + 0.15 * p})`, ...style }}>
    {children}
  </div>
);

// 0 · 「倦怠」 in the viewfinder, flipped over on the beat.
// 1 · what we usually think: 倦怠 ← 因为 ← 别人逼得太紧.
// 2 · two signs: 你必须, struck out — and 你可以, glowing, repeating off into
//     the distance with no end.
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
  const out1 = useRamp(c2 - 4, 6);
  const must = useRamp(c2, 8);
  const strike = interpolate(frame, [c2 + 2 * BEAT, c2 + 2 * BEAT + 6], [0, 1], clamp);
  const can = useRamp(c2 + 3 * BEAT, 8);
  const tunnel = interpolate(frame, [c2 + 4 * BEAT, duration], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.08]} hits={[4 * BEAT, c2 + 3 * BEAT]} whips={[c1, c2]}>
        {cardOut < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: card * (1 - cardOut) }}>
            <Halo x={960} y={400} r={420} intensity={0.45} />
            <div style={{ position: "absolute", left: 960 - 330, top: 290, width: 660, height: 220, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid rgba(${palette.halo},0.6)`, borderRadius: 18, background: "rgba(12,16,22,0.9)", fontSize: 130, fontWeight: 900, letterSpacing: 30, paddingLeft: 30, transform: `rotate(${flip * 180}deg)` }}>倦怠</div>
            <FocusBox x={960} y={400} w={760} h={300} progress={interpolate(frame, [6, 16], [0, 1], clamp)} label="认知 · COGNITION" />
            <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.alert, opacity: flip }}>颠 覆</div>
          </div>
        )}
        {frame >= c1 && out1 < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: 1 - out1 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: left }}>我们通常以为</div>
            <Node x={460} y={400} w={260} p={left}>倦怠</Node>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: arrow }}>
              <line x1={980} y1={400} x2={980 - 380 * arrow} y2={400} stroke={palette.accent} strokeWidth={4} />
              <path d={`M${980 - 380 * arrow + 18} 386 L${980 - 380 * arrow} 400 L${980 - 380 * arrow + 18} 414`} fill="none" stroke={palette.accent} strokeWidth={4} />
            </svg>
            <div style={{ position: "absolute", left: 640, width: 300, top: 346, textAlign: "center", fontSize: 30, fontWeight: 700, color: palette.accent, opacity: arrow }}>因为</div>
            <Node x={1300} y={400} w={440} p={right}>别人逼得太紧</Node>
          </div>
        )}
        {frame >= c2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 360, top: 300, width: 400, height: 180, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 16, background: "rgba(60,10,20,0.9)", border: `3px solid ${palette.alert}`, fontSize: 70, fontWeight: 900, color: palette.alert, opacity: must * (1 - 0.6 * strike), transform: `scale(${1.2 - 0.2 * must})` }}>
              你必须
              <div style={{ position: "absolute", left: 30, right: 30, top: 86, height: 8, background: palette.ink, transformOrigin: "0 50%", transform: `scaleX(${strike})` }} />
            </div>
            {/* 你可以, again and again into the distance */}
            {Array.from({ length: 8 }, (_, k) => {
              const s = Math.pow(0.72, k) * (1 + 0.15 * tunnel);
              const p = can * Math.max(0, Math.min(1, tunnel * 8 - k + 1));
              if (p <= 0) return null;
              return (
                <div key={k} style={{ position: "absolute", left: 1340 - 220 * s, top: 390 - 90 * s - k * 6, width: 440 * s, height: 180 * s, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 16 * s, background: "rgba(8,18,26,0.9)", border: `${Math.max(1, 3 * s)}px solid rgba(${SCREEN},0.9)`, fontSize: 76 * s, fontWeight: 900, color: `rgb(${SCREEN})`, textShadow: `0 0 ${16 * s}px rgba(${SCREEN},0.8)`, opacity: (k === 0 ? 1 : p) * (1 - k * 0.08), zIndex: 10 - k }}>你可以</div>
              );
            })}
            <div style={{ position: "absolute", left: 1520, top: 560, fontFamily: fonts.mono, fontSize: 40, color: look.key, opacity: tunnel > 0.6 ? 1 : 0 }}>∞</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} />
      <Sfx name="shutter" at={6} volume={0.2} />
      <Sfx name="whoosh" at={4 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.4} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.4} />
      <Sfx name="stamp" at={c2} volume={0.45} />
      <Sfx name="glitch" at={c2 + 2 * BEAT} volume={0.3} />
      <Sfx name="boom" at={c2 + 3 * BEAT} volume={0.45} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
