import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox, Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam } from "../../glass/immersive";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SLOTS = ["09:00", "11:00", "14:00", "16:00", "19:00", "22:00"];
const FILL = ["刷手机", "补觉", "刷视频", "逛购物车", "外卖", "再刷一会"];

const Node: React.FC<{ x: number; y: number; w: number; p: number; children: React.ReactNode; color?: string; border?: string; style?: React.CSSProperties }> = ({ x, y, w, p, children, color = palette.ink, border = palette.faint, style }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - 50, width: w, height: 100, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${border}`, borderRadius: 14, background: "rgba(10,14,20,0.88)", fontSize: 50, fontWeight: 900, letterSpacing: 4, color, opacity: p, transform: `scale(${0.85 + 0.15 * p})`, ...style }}>
    {children}
  </div>
);

// 0 · 「空虚」 in the viewfinder, flipped over on the beat.
// 1 · what we usually think: 空虚 ← 因为 ← 太闲 — and 太闲 is struck out.
// 2 · a day that's crammed full — and next to it, the one line that's blank:
//     真正想做的事：___, a cursor blinking.
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
  const busy = useRamp(c2, 8);
  const want = useRamp(c2 + 4 * BEAT, 10);
  const strike = interpolate(frame, [c1 + 4 * BEAT, c1 + 4 * BEAT + 6], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.08]} hits={[4 * BEAT, c1 + 4 * BEAT, c2 + 4 * BEAT]} whips={[c1, c2]}>
        {cardOut < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: card * (1 - cardOut) }}>
            <Halo x={960} y={400} r={420} intensity={0.45} />
            <div style={{ position: "absolute", left: 960 - 330, top: 290, width: 660, height: 220, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid rgba(${palette.halo},0.6)`, borderRadius: 18, background: "rgba(12,16,22,0.9)", fontSize: 130, fontWeight: 900, letterSpacing: 30, paddingLeft: 30, transform: `rotate(${flip * 180}deg)` }}>空虚</div>
            <FocusBox x={960} y={400} w={760} h={300} progress={interpolate(frame, [6, 16], [0, 1], clamp)} label="认知 · COGNITION" />
            <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.alert, opacity: flip }}>颠 覆</div>
          </div>
        )}
        {frame >= c1 && out1 < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: 1 - out1 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: left }}>我们通常以为</div>
            <Node x={460} y={400} w={260} p={left}>空虚</Node>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: arrow }}>
              <line x1={980} y1={400} x2={980 - 380 * arrow} y2={400} stroke={palette.accent} strokeWidth={4} />
              <path d={`M${980 - 380 * arrow + 18} 386 L${980 - 380 * arrow} 400 L${980 - 380 * arrow + 18} 414`} fill="none" stroke={palette.accent} strokeWidth={4} />
            </svg>
            <div style={{ position: "absolute", left: 640, width: 300, top: 346, textAlign: "center", fontSize: 30, fontWeight: 700, color: palette.accent, opacity: arrow }}>因为</div>
            <Node x={1300} y={400} w={300} p={right}>
              太闲
              <div style={{ position: "absolute", left: 40, right: 40, top: 46, height: 6, background: palette.alert, transformOrigin: "0 50%", transform: `scaleX(${strike})` }} />
            </Node>
          </div>
        )}
        {frame >= c2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            {/* not idle at all: a timetable crammed full */}
            <div style={{ position: "absolute", left: 300, top: 200, width: 520, opacity: busy, transform: `translateY(${(1 - busy) * 30}px)` }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, fontWeight: 900, marginBottom: 14 }}>
                <span>今天</span>
                <span style={{ fontFamily: fonts.mono, fontSize: 22, color: palette.dim }}>并不闲</span>
              </div>
              {SLOTS.map((t, i) => (
                <div key={t} style={{ display: "flex", gap: 14, alignItems: "center", height: 46, marginBottom: 8, opacity: interpolate(frame, [c2 + i * 3, c2 + i * 3 + 6], [0, 1], clamp) }}>
                  <span style={{ width: 70, fontFamily: fonts.mono, fontSize: 18, color: palette.dim }}>{t}</span>
                  <div style={{ flex: 1, height: 38, borderRadius: 8, background: `rgba(${palette.accentRgb},${0.18 + 0.08 * (i % 3)})`, display: "flex", alignItems: "center", paddingLeft: 14, fontSize: 20, fontWeight: 700, color: palette.dim }}>{FILL[i]}</div>
                </div>
              ))}
            </div>
            {/* …and one line that's blank */}
            <div style={{ position: "absolute", left: 1000, top: 300, width: 620, padding: "30px 36px", borderRadius: 16, background: "rgba(14,20,28,0.92)", border: `2px dashed ${look.key}`, opacity: want, transform: `scale(${1.15 - 0.15 * want})`, boxShadow: `0 0 ${40 * want}px ${look.keyGlow}` }}>
              <div style={{ fontSize: 40, fontWeight: 900, color: look.key }}>真正想做的事：</div>
              <div style={{ marginTop: 26, height: 60, borderBottom: `3px solid rgba(232,238,242,0.4)`, display: "flex", alignItems: "flex-end", paddingBottom: 6 }}>
                <div style={{ width: 4, height: 46, background: palette.ink, opacity: Math.floor(frame / 8) % 2 ? 1 : 0 }} />
              </div>
              <div style={{ marginTop: 16, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim }}>（空）</div>
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
      {SLOTS.map((_, i) => (
        <Sfx key={i} name="shutter" at={c2 + i * 3} volume={0.12} />
      ))}
      <Sfx name="boom" at={c2 + 4 * BEAT} volume={0.45} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
