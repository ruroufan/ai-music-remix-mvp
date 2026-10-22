import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox, Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { BP, GOLD } from "../blueprint";
import { Bokeh, Cam } from "../../glass/immersive";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Node: React.FC<{ x: number; y: number; w: number; p: number; children: React.ReactNode; color?: string; border?: string; style?: React.CSSProperties }> = ({ x, y, w, p, children, color = palette.ink, border = palette.faint, style }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - 50, width: w, height: 100, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${border}`, borderRadius: 14, background: "rgba(10,14,20,0.88)", fontSize: 50, fontWeight: 900, letterSpacing: 4, color, opacity: p, transform: `scale(${0.85 + 0.15 * p})`, ...style }}>
    {children}
  </div>
);

// 0 · 「INTJ」 in the viewfinder, flipped over on the beat.
// 1 · what we usually think: INTJ 的问题 ← 因为 ← 太冷、太独 — struck out.
// 2 · his conclusion in a box: the lid slams, a padlock — 已想清楚 · 不再打开 —
//     and new information bounces off it, one per beat.
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
  const lid = interpolate(frame, [c2 + BEAT, c2 + BEAT + 8], [0, 1], { ...clamp, easing: (t) => t * t });
  const lock = useRamp(c2 + 2 * BEAT, 6);
  const strike = interpolate(frame, [c1 + 4 * BEAT, c1 + 4 * BEAT + 6], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.08]} hits={[4 * BEAT, c1 + 4 * BEAT, c2 + BEAT + 8]} whips={[c1, c2]}>
        {cardOut < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: card * (1 - cardOut) }}>
            <Halo x={960} y={400} r={420} intensity={0.45} />
            <div style={{ position: "absolute", left: 960 - 330, top: 290, width: 660, height: 220, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid rgba(${palette.halo},0.6)`, borderRadius: 18, background: "rgba(12,16,22,0.9)", fontSize: 130, fontWeight: 900, letterSpacing: 30, paddingLeft: 30, transform: `rotate(${flip * 180}deg)` }}>INTJ</div>
            <FocusBox x={960} y={400} w={760} h={300} progress={interpolate(frame, [6, 16], [0, 1], clamp)} label="认知 · COGNITION" />
            <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.alert, opacity: flip }}>颠 覆</div>
          </div>
        )}
        {frame >= c1 && out1 < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: 1 - out1 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: left }}>我们通常以为</div>
            <Node x={440} y={400} w={320} p={left}>INTJ 的问题</Node>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: arrow }}>
              <line x1={980} y1={400} x2={980 - 380 * arrow} y2={400} stroke={palette.accent} strokeWidth={4} />
              <path d={`M${980 - 380 * arrow + 18} 386 L${980 - 380 * arrow} 400 L${980 - 380 * arrow + 18} 414`} fill="none" stroke={palette.accent} strokeWidth={4} />
            </svg>
            <div style={{ position: "absolute", left: 640, width: 300, top: 346, textAlign: "center", fontSize: 30, fontWeight: 700, color: palette.accent, opacity: arrow }}>因为</div>
            <Node x={1320} y={400} w={360} p={right}>
              太冷、太独
              <div style={{ position: "absolute", left: 40, right: 40, top: 46, height: 6, background: palette.alert, transformOrigin: "0 50%", transform: `scaleX(${strike})` }} />
            </Node>
          </div>
        )}
        {frame >= c2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            {/* his conclusion, in a box; the lid shuts and locks */}
            <div style={{ position: "absolute", left: 960 - 260, top: 260, width: 520, height: 300, opacity: busy }}>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 220, borderRadius: 14, background: "rgba(12,29,51,0.95)", border: `3px solid rgb(${BP})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, fontWeight: 900 }}>我的结论 ✓</div>
              <div style={{ position: "absolute", left: -10, right: -10, top: 50, height: 34, borderRadius: 10, background: `rgb(${BP})`, transformOrigin: "0 100%", transform: `rotate(${-70 * (1 - lid)}deg)` }} />
              {lid > 0.95 && (
                <div style={{ position: "absolute", left: 220, top: 40, width: 80, height: 70, borderRadius: 10, background: `rgb(${GOLD})`, transform: `scale(${1.4 - 0.4 * lock})`, opacity: lock, display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 8, fontFamily: fonts.mono, fontSize: 16, fontWeight: 700, color: "#2a2118" }}>
                  <div style={{ position: "absolute", left: 18, top: -30, width: 44, height: 44, borderRadius: "22px 22px 0 0", border: `8px solid rgb(${GOLD})`, borderBottom: "none" }} />
                  LOCK
                </div>
              )}
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 600, textAlign: "center", fontFamily: fonts.mono, fontSize: 26, letterSpacing: 8, color: look.key, opacity: lock }}>已想清楚 · 不再打开</div>
            {/* new information, bouncing off */}
            {["新信息", "反例", "别人的看法"].map((t, i) => {
              const at = c2 + 4 * BEAT + i * BEAT;
              const p = interpolate(frame, [at - 10, at, at + 14], [0, 1, 0], clamp);
              if (frame < at - 10 || frame > at + 14) return null;
              const fromLeft = i % 2 === 0;
              const bx = fromLeft ? 680 - 260 * (1 - p) : 1240 + 260 * (1 - p);
              return <div key={t} style={{ position: "absolute", left: bx - 70, top: 340 + i * 60, width: 140, padding: "6px 0", textAlign: "center", borderRadius: 10, border: `2px solid ${palette.faint}`, fontSize: 22, fontWeight: 800, color: palette.dim, opacity: Math.min(1, p * 2) }}>{t}</div>;
            })}
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} />
      <Sfx name="shutter" at={6} volume={0.2} />
      <Sfx name="whoosh" at={4 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.4} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.4} />
      <Sfx name="glitch" at={c1 + 4 * BEAT} volume={0.3} />
      <Sfx name="stamp" at={c2 + BEAT + 8} volume={0.5} />
      <Sfx name="glint" at={c2 + 2 * BEAT} volume={0.35} />
      {[0, 1, 2].map((i) => (
        <Sfx key={i} name="shatter" at={c2 + 4 * BEAT + i * BEAT} volume={0.15} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
