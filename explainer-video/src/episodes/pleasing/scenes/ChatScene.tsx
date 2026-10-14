import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../ObsFrame";
import { Backlit, Beam, Horizon } from "../parts";
import { Silhouette } from "../../../components/Figures";
import { fonts, palette } from "../look";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, HALF_BEAT, type SceneProps } from "../timing";

const MESSAGE = ["我觉得", "那个方案", "还可以", "再改改，", "你方便的话", "看看？"];

// A balance scale — the right to judge yourself.
const Scale: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <svg width={120 * s} height={100 * s} viewBox="0 0 120 100" style={{ position: "absolute", left: x - 60 * s, top: y - 50 * s, filter: `drop-shadow(0 0 8px rgba(${palette.accentRgb},0.7))` }}>
    <g stroke={palette.accent} strokeWidth="3" fill="none" strokeLinecap="round">
      <path d="M60 10 L60 90 M40 90 L80 90 M15 25 L105 25" />
      <path d="M15 25 L5 55 L25 55 Z M105 25 L95 55 L115 55 Z" />
    </g>
  </svg>
);

// Line 0: you sent a thoughtful message; they replied "哦". You check it word by word.
// Line 1: the boss looked over once — and your light goes down.
// Line 2: what you hand over is not a feeling but the right to judge yourself.
export const ChatScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const phone = useRamp(0, 10);
  const reply = useRamp(cues[0] + 2 * BEAT, 6);
  // the inspection box hops one word per half beat
  const scanStart = cues[0] + 4 * BEAT;
  const scanIdx = Math.floor((frame - scanStart) / HALF_BEAT);
  const phoneOut = interpolate(frame, [cues[1] - 6, cues[1]], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const office = useRamp(cues[1], 10);
  const glance = useRamp(cues[1] + 2 * BEAT, BEAT);
  const handover = interpolate(frame, [cues[2] + 2 * BEAT, cues[2] + 4 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ease = 1 - Math.pow(1 - handover, 3);

  const you = { x: 760, bottom: 820 };
  const scaleFrom = { x: you.x + 70, y: you.bottom - 150 };
  const scaleTo = { x: 1420, y: 420 };

  return (
    <ObsFrame duration={duration}>
      {/* phone */}
      <div style={{ position: "absolute", left: 960 - 230, top: 140, width: 460, height: 660, borderRadius: 40, border: `2px solid ${palette.faint}`, background: "#0a0e15", opacity: phone * phoneOut, padding: 36, boxSizing: "border-box" }}>
        <div style={{ fontFamily: fonts.mono, fontSize: 16, letterSpacing: 2, color: palette.dim, textAlign: "center", marginBottom: 40 }}>— 对话 —</div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ background: `rgba(${palette.accentRgb},0.18)`, border: `1px solid rgba(${palette.accentRgb},0.5)`, borderRadius: 16, padding: "14px 18px", maxWidth: 330, fontSize: 26, lineHeight: 1.6, display: "flex", flexWrap: "wrap" }}>
            {MESSAGE.map((w, i) => (
              <span
                key={i}
                style={{
                  outline: scanIdx === i % MESSAGE.length && frame >= scanStart && scanIdx < MESSAGE.length * 2 ? `2px solid ${palette.alert}` : "none",
                  background: scanIdx >= 0 && i <= scanIdx % MESSAGE.length && frame >= scanStart ? "rgba(255,77,109,0.12)" : undefined,
                }}
              >
                {w}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", marginTop: 34, opacity: reply, transform: `translateY(${(1 - reply) * 10}px)` }}>
          <div style={{ background: "#1a212d", borderRadius: 16, padding: "14px 22px", fontSize: 30 }}>哦</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 36, textAlign: "center", fontFamily: fonts.mono, fontSize: 14, letterSpacing: 2, color: palette.alert, opacity: frame >= scanStart ? 1 : 0 }}>
          CHECKING… {Math.max(0, Math.min(MESSAGE.length, scanIdx + 1))}/{MESSAGE.length}
        </div>
      </div>

      {/* office */}
      <div style={{ position: "absolute", inset: 0, opacity: office }}>
        <Horizon y={820} />
        {/* frosted glass partition with the boss behind it */}
        <div style={{ position: "absolute", left: 1180, top: 300, width: 460, height: 520, background: "rgba(140,170,200,0.08)", border: `1px solid ${palette.faint}`, backdropFilter: "blur(2px)" }} />
        <Silhouette x={1410} bottom={820} height={360} fill="#0a0d12" rim="rgba(232,238,242,0.25)" opacity={0.85} />
        <Beam from={{ x: 1400, y: 500 }} to={{ x: you.x + 10, y: you.bottom - 200 }} progress={glance} color={palette.alert} width={2} dashed />
        {/* desk */}
        <div style={{ position: "absolute", left: you.x - 160, top: you.bottom - 110, width: 320, height: 8, background: palette.faint }} />
        <Backlit x={you.x} bottom={you.bottom} height={210} glow={1 - glance * 0.6 - ease * 0.3} />
        {/* the scale leaves your hands */}
        <div style={{ opacity: frame >= cues[2] ? 1 : 0 }}>
          <Scale x={scaleFrom.x + (scaleTo.x - scaleFrom.x) * ease} y={scaleFrom.y + (scaleTo.y - scaleFrom.y) * ease - Math.sin(ease * Math.PI) * 120} s={1 + ease * 0.3} />
        </div>
      </div>

      <Sfx name="glint" at={0} volume={0.25} />
      <Sfx name="shutter" at={cues[0] + 2 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={cues[1]} volume={0.3} />
      <Sfx name="stamp" at={cues[1] + 2 * BEAT} volume={0.45} />
      <Sfx name="whoosh" at={cues[2] + 2 * BEAT} volume={0.35} />
      <Sfx name="boom" at={cues[2] + 4 * BEAT} volume={0.55} />

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
