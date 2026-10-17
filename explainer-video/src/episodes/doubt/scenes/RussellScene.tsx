import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { keyLandsAt } from "../../../components/Kinetic";
import { FLOOR_Y, Stander } from "../circles";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ME = 620;
const LAMP = { x: ME + 78, y: FLOOR_Y - 112 };
const SIGN = 1180;

// A lantern hanging from his hand.
const Lantern: React.FC<{ glow: number }> = ({ glow }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
    <line x1={LAMP.x} y1={LAMP.y - 40} x2={LAMP.x} y2={LAMP.y - 18} stroke="#8a95a0" strokeWidth={3} />
    <rect x={LAMP.x - 18} y={LAMP.y - 20} width={36} height={8} rx={2} fill="#2a2f36" />
    <rect x={LAMP.x - 15} y={LAMP.y - 12} width={30} height={40} rx={6} fill={`rgba(255,214,150,${0.6 + 0.4 * glow})`} stroke="#2a2f36" strokeWidth={3} />
    <rect x={LAMP.x - 18} y={LAMP.y + 28} width={36} height={8} rx={2} fill="#2a2f36" />
  </svg>
);

// 0 · the quote card comes back, small — and turns over: 另一层意思.
// 1 · he holds a lantern: doubt. Its light is what shows him the dark —
//     怀疑 = 清醒的代价. A stop sign drops in front of him (停); after
//     停下的理由 has landed, it's struck through and falls flat, he lifts his
//     head a little, and the road ahead lights up, dash by dash.
export const RussellScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const card = useRamp(0, 8);
  const turn = interpolate(frame, [2 * BEAT, 2 * BEAT + 10], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const cardOut = useRamp(cues[1] - 4, 6);
  const scene = useRamp(cues[1], 10);
  const pulse = 0.75 + 0.25 * Math.exp(-((frame - cues[1]) % BEAT) / 5);
  const price = useRamp(cues[1] + HALF_BEAT, 8);
  const signAt = cues[1] + 2 * BEAT;
  const signIn = interpolate(frame, [signAt, signAt + 6], [0, 1], { ...clamp, easing: (t) => t * t });
  // struck out a little after 停下的理由 has landed in the subtitle
  const strikeAt = Math.max(cues[1] + keyLandsAt(lines[1].text, BEAT) + 2 * BEAT, cues[1] + 4 * BEAT);
  const strike = interpolate(frame, [strikeAt, strikeAt + 6], [0, 1], clamp);
  const fall = interpolate(frame, [strikeAt + 6, strikeAt + 16], [0, 1], { ...clamp, easing: (t) => t * t });
  const road = interpolate(frame, [strikeAt + BEAT, strikeAt + 4 * BEAT], [0, 1], clamp);
  const lift = interpolate(frame, [strikeAt + BEAT, strikeAt + BEAT + 12], [0.4, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      {cardOut < 1 && (
        <div style={{ position: "absolute", inset: 0, opacity: card * (1 - cardOut), perspective: 1400 }}>
          <div style={{ position: "absolute", left: 960 - 520, top: 260, width: 1040, height: 300, transformStyle: "preserve-3d", transform: `rotateY(${turn * 180}deg)` }}>
            <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", border: `2px solid ${palette.faint}`, borderRadius: 18, background: "rgba(12,16,22,0.92)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 }}>
              <div style={{ fontSize: 50, fontWeight: 900, letterSpacing: 4 }}>
                愚蠢的人总是很<span style={{ color: palette.accent }}>确信</span>，
              </div>
              <div style={{ fontSize: 50, fontWeight: 900, letterSpacing: 4 }}>
                聪明的人却满是<span style={{ color: look.key }}>怀疑</span>。
              </div>
              <div style={{ fontFamily: fonts.mono, fontSize: 18, letterSpacing: 5, color: palette.dim }}>BERTRAND RUSSELL · 1933</div>
            </div>
            <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", border: `2px solid ${look.key}`, borderRadius: 18, background: `rgba(${palette.halo},0.12)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, boxShadow: `0 0 50px rgba(${palette.halo},0.2)` }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 20, letterSpacing: 8, color: palette.dim }}>THE OTHER SIDE</div>
              <div style={{ fontSize: 76, fontWeight: 900, letterSpacing: 12, color: look.key, textShadow: `0 0 20px ${look.keyGlow}` }}>另一层意思</div>
            </div>
          </div>
        </div>
      )}
      {frame >= cues[1] && (
        <div style={{ position: "absolute", inset: 0, opacity: scene }}>
          {/* what the lantern lets him see: the dark, full of question marks */}
          {Array.from({ length: 18 }, (_, i) => {
            const a = random(`rq-${i}`) * Math.PI * 2;
            const d = 160 + random(`rd-${i}`) * 260;
            const x = LAMP.x + Math.cos(a) * d * 1.3;
            const y = Math.min(FLOOR_Y + 90, LAMP.y + Math.sin(a) * d * 0.7);
            return (
              <div key={i} style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)", fontFamily: fonts.mono, fontSize: 22 + random(`rz-${i}`) * 14, fontWeight: 700, color: "rgba(232,238,242,0.55)", opacity: (0.3 + 0.7 * Math.abs(Math.sin(frame / 10 + i))) * pulse }}>
                ?
              </div>
            );
          })}
          {/* the road ahead */}
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <line x1={0} y1={FLOOR_Y} x2={1920} y2={FLOOR_Y} stroke={`rgba(${palette.accentRgb},0.25)`} strokeWidth={1} />
            {road > 0 &&
              Array.from({ length: 12 }, (_, i) => {
                const x = 760 + i * 95;
                const p = Math.max(0, Math.min(1, road * 12 - i));
                return <line key={i} x1={x} y1={FLOOR_Y + 30} x2={x + 55 * p} y2={FLOOR_Y + 30} stroke={palette.accent} strokeWidth={5} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${palette.accent})` }} />;
              })}
          </svg>
          {road > 0 && <div style={{ position: "absolute", left: 760, top: FLOOR_Y + 30, width: 1160 * road, height: 120, background: `linear-gradient(rgba(${palette.accentRgb},0.12), transparent)` }} />}
          <Halo x={LAMP.x} y={LAMP.y} r={420} intensity={0.75 * pulse} />
          <Stander x={ME} height={250} lift={lift} glow={0.9} />
          <Lantern glow={pulse} />
          {/* 怀疑 = 清醒的代价 */}
          <div style={{ position: "absolute", left: LAMP.x - 300, width: 600, top: 260, textAlign: "center", opacity: price, transform: `translateY(${(1 - price) * 14}px)` }}>
            <span style={{ fontSize: 40, fontWeight: 900, color: look.key, textShadow: `0 0 16px ${look.keyGlow}` }}>怀疑</span>
            <span style={{ fontFamily: fonts.mono, fontSize: 36, color: palette.dim, margin: "0 18px" }}>=</span>
            <span style={{ fontSize: 40, fontWeight: 900, color: palette.ink }}>清醒的代价</span>
          </div>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: price }}>
            <line x1={LAMP.x} y1={320} x2={LAMP.x} y2={LAMP.y - 44} stroke="rgba(232,238,242,0.35)" strokeWidth={2} strokeDasharray="4 6" />
          </svg>
          {/* the stop sign */}
          {signIn > 0 && (
            <div style={{ position: "absolute", left: SIGN - 80, top: FLOOR_Y - 330 - (1 - signIn) * 300, width: 160, height: 330, transformOrigin: "50% 100%", transform: `rotate(${fall * 84}deg)`, opacity: 1 - fall * 0.5 }}>
              <div style={{ position: "absolute", left: 74, top: 140, width: 12, height: 190, background: "#8a95a0" }} />
              <svg width={160} height={160} viewBox="-80 -80 160 160" style={{ position: "absolute", left: 0, top: 0 }}>
                <polygon points={Array.from({ length: 8 }, (_, i) => { const a = Math.PI / 8 + (i * Math.PI) / 4; return `${Math.cos(a) * 76},${Math.sin(a) * 76}`; }).join(" ")} fill={palette.alert} stroke="#fff" strokeWidth={5} />
              </svg>
              <div style={{ position: "absolute", left: 0, top: 0, width: 160, height: 160, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 76, fontWeight: 900, color: "#fff" }}>停</div>
              {strike > 0 && (
                <svg width={160} height={160} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
                  <line x1={0} y1={0} x2={160 * strike} y2={160 * strike} stroke={look.key} strokeWidth={12} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${look.key})` }} />
                </svg>
              )}
            </div>
          )}
        </div>
      )}
      <Sfx name="whoosh" at={2 * BEAT} volume={0.35} />
      <Sfx name="glint" at={cues[1]} volume={0.35} />
      <Sfx name="stamp" at={signAt} volume={0.55} />
      <Sfx name="shatter" at={strikeAt} volume={0.4} />
      <Sfx name="rise" at={strikeAt + BEAT} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
