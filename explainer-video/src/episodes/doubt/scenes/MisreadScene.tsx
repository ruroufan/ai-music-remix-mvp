import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox, Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Stander } from "../circles";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const BOOKS = ["心理学", "历史", "经济学", "哲学", "编程", "艺术"];
const BASE = 790;
const BOOK_H = 34;
const QS = 32;

const Node: React.FC<{ x: number; y: number; w: number; p: number; children: React.ReactNode; color?: string; border?: string; style?: React.CSSProperties }> = ({ x, y, w, p, children, color = palette.ink, border = palette.faint, style }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - 52, width: w, height: 104, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${border}`, borderRadius: 14, background: "rgba(10,14,20,0.85)", fontSize: 54, fontWeight: 900, letterSpacing: 4, color, opacity: p, transform: `scale(${0.85 + 0.15 * p})`, ...style }}>
    {children}
  </div>
);

// 0 · the notion itself, 「自我怀疑」, in the viewfinder — and on the beat it
//     flips upside down.
// 1 · what we usually think: 怀疑自己 ← 因为 ← 不够好.
// 2 · 不够好 is struck out and falls; 知道得够多 slams in. Underneath, a man
//     standing on a stack of books that grows by one per beat — the higher he
//     stands, the more question marks he can see around him, and the lower
//     his head goes.
export const MisreadScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const card = useRamp(0, 8);
  const flip = interpolate(frame, [4 * BEAT, 4 * BEAT + 9], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const cardOut = useRamp(cues[1] - 4, 6);
  const left = useRamp(cues[1], 8);
  const arrow = useRamp(cues[1] + BEAT, 8);
  const right = useRamp(cues[1] + 2 * BEAT, 8);
  const strike = interpolate(frame, [cues[2], cues[2] + 7], [0, 1], clamp);
  const fall = interpolate(frame, [cues[2] + BEAT, cues[2] + BEAT + 14], [0, 1], { ...clamp, easing: (t) => t * t });
  const swap = useRamp(cues[2] + 2 * BEAT, 8);
  const up = useRamp(cues[2] + 2 * BEAT, 12);
  const rowY = 420 - 240 * up;
  const books = Math.max(0, Math.min(BOOKS.length, Math.floor((frame - cues[2] - 2 * BEAT) / BEAT) + 1));
  const rise = interpolate(frame, [cues[2] + 2 * BEAT, cues[2] + (2 + BOOKS.length) * BEAT], [0, BOOKS.length], clamp);
  const feet = BASE - rise * BOOK_H;
  const qn = Math.round(interpolate(frame, [cues[2] + 2 * BEAT, cues[2] + (3 + BOOKS.length) * BEAT], [0, QS], clamp));
  return (
    <ObsFrame duration={duration}>
      {cardOut < 1 && (
        <div style={{ position: "absolute", inset: 0, opacity: card * (1 - cardOut) }}>
          <Halo x={960} y={400} r={420} intensity={0.45} />
          <div style={{ position: "absolute", left: 960 - 330, top: 290, width: 660, height: 220, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid rgba(${palette.halo},0.6)`, borderRadius: 18, background: "rgba(12,16,22,0.9)", fontSize: 120, fontWeight: 900, letterSpacing: 20, paddingLeft: 20, transform: `rotate(${flip * 180}deg) scale(${1 + Math.sin(flip * Math.PI) * 0.12})`, boxShadow: `0 0 60px rgba(${palette.halo},0.18)` }}>
            自我怀疑
          </div>
          <FocusBox x={960} y={400} w={760} h={300} progress={interpolate(frame, [6, 16], [0, 1], clamp)} label="认知 · COGNITION" />
          <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.alert, opacity: flip }}>颠 覆</div>
        </div>
      )}
      {frame >= cues[1] && (
        <div style={{ position: "absolute", inset: 0 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: rowY - 120, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: left * (1 - swap) }}>我们通常以为</div>
          <Node x={480} y={rowY} w={330} p={left}>怀疑自己</Node>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: arrow }}>
            <line x1={1030} y1={rowY} x2={1030 - 360 * arrow} y2={rowY} stroke={palette.accent} strokeWidth={4} />
            <path d={`M${1030 - 360 * arrow + 18} ${rowY - 14} L${1030 - 360 * arrow} ${rowY} L${1030 - 360 * arrow + 18} ${rowY + 14}`} fill="none" stroke={palette.accent} strokeWidth={4} />
          </svg>
          <div style={{ position: "absolute", left: 700, width: 300, top: rowY - 56, textAlign: "center", fontSize: 30, fontWeight: 700, color: palette.accent, opacity: arrow }}>因为</div>
          <Node
            x={1300}
            y={rowY}
            w={360}
            p={right * (1 - fall)}
            color={strike > 0 ? palette.dim : palette.ink}
            style={{ transform: `translateY(${fall * 260}px) rotate(${fall * 24}deg) scale(${0.85 + 0.15 * right})` }}
          >
            不够好
            <div style={{ position: "absolute", left: 30, top: 50, height: 6, width: 300 * strike, background: palette.alert, boxShadow: `0 0 12px ${palette.alert}` }} />
          </Node>
          {swap > 0 && (
            <Node x={1300} y={rowY} w={420} p={swap} color={look.key} border={look.key} style={{ boxShadow: `0 0 40px ${look.keyGlow}`, textShadow: `0 0 18px ${look.keyGlow}` }}>
              知道得够多
            </Node>
          )}
          {swap > 0 && frame - cues[2] - 2 * BEAT < 24 && (
            <div style={{ position: "absolute", left: 1300, top: rowY, width: 60 + (frame - cues[2] - 2 * BEAT) * 26, height: 60 + (frame - cues[2] - 2 * BEAT) * 26, transform: "translate(-50%, -50%)", borderRadius: "50%", border: `2px solid ${look.key}`, opacity: 0.7 * (1 - (frame - cues[2] - 2 * BEAT) / 24) }} />
          )}
        </div>
      )}
      {frame >= cues[2] + 2 * BEAT && (
        <div style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: qn }, (_, i) => {
            const a = random(`mq-${i}`) * Math.PI * 2;
            const d = 0.45 + random(`md-${i}`) * 0.55;
            const x = 960 + Math.cos(a) * 640 * d;
            const y = Math.max(320, 560 + Math.sin(a) * 250 * d);
            return (
              <div key={i} style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)", fontFamily: fonts.mono, fontSize: 24 + random(`mz-${i}`) * 18, fontWeight: 700, color: "rgba(232,238,242,0.55)", opacity: 0.4 + 0.6 * Math.abs(Math.sin(frame / 9 + i)) }}>
                ?
              </div>
            );
          })}
          {BOOKS.slice(0, books).map((b, i) => {
            const w = 260 - i * 12 + (random(`bw-${i}`) - 0.5) * 30;
            const land = interpolate(frame, [cues[2] + (2 + i) * BEAT, cues[2] + (2 + i) * BEAT + 6], [-60, 0], clamp);
            return (
              <div key={b} style={{ position: "absolute", left: 960 - w / 2 + (random(`bx-${i}`) - 0.5) * 24, top: BASE - (i + 1) * BOOK_H + land, width: w, height: BOOK_H - 3, borderRadius: 4, background: ["#1d3b44", "#43341c", "#2a2f3a", "#3b2230", "#20402e", "#3a3a24"][i], border: `1px solid rgba(${palette.halo},0.5)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, letterSpacing: 6, color: "rgba(232,238,242,0.8)" }}>
                {b}
              </div>
            );
          })}
          <Stander x={960} bottom={feet} height={190} lift={1 - 0.15 * rise} glow={0.8} />
          <div style={{ position: "absolute", left: 250, top: 640, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: palette.dim }}>
            知道的 <span style={{ color: palette.ink, fontSize: 30 }}>{books}</span>
          </div>
          <div style={{ position: "absolute", right: 250, top: 640, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: palette.dim }}>
            看见的未知 <span style={{ color: look.key, fontSize: 30 }}>{qn}</span>
          </div>
        </div>
      )}
      <Sfx name="shutter" at={6} volume={0.2} />
      <Sfx name="whoosh" at={4 * BEAT} volume={0.4} />
      <Sfx name="stamp" at={cues[1]} volume={0.45} />
      <Sfx name="stamp" at={cues[1] + 2 * BEAT} volume={0.45} />
      <Sfx name="glitch" at={cues[2]} volume={0.3} />
      <Sfx name="boom" at={cues[2] + 2 * BEAT} volume={0.45} />
      {BOOKS.map((_, i) => (
        <Sfx key={i} name="step" at={cues[2] + (2 + i) * BEAT} volume={0.3} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
