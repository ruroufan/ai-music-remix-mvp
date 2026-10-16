import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// 0 · re-read the word.
// 1 · "时间有限 = 悲观": a finite line, grey; an endless dotted one beside it.
// 2 · flipped: the finite line lights up gold — 才能真正地活 — and the endless
//     one fades: "∞ → 无所谓".
export const MisreadScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const focus = useRamp(BEAT, 10);
  const word = interpolate(frame, [cues[1] - 6, cues[1]], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const stage = useRamp(cues[1], 8);
  const flip = interpolate(frame, [cues[2] + 2 * BEAT, cues[2] + 4 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const strike = interpolate(frame, [cues[2] + BEAT, cues[2] + BEAT + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <ObsFrame duration={duration}>
      <div style={{ opacity: word }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontSize: 140, fontWeight: 900, letterSpacing: 40, filter: `blur(${(1 - focus) * 10}px)` }}>衰老</div>
        <FocusBox x={960} y={450} w={560} h={220} progress={focus} label="RE-THINK" />
      </div>
      {frame >= cues[1] - 6 && (
        <div style={{ position: "absolute", inset: 0, opacity: stage }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", fontSize: 64, fontWeight: 900, letterSpacing: 4 }}>
            时间有限 = <span style={{ position: "relative", color: strike ? palette.dim : palette.ink }}>
              悲观
              <span style={{ position: "absolute", left: 0, top: "52%", height: 6, width: `${strike * 100}%`, background: palette.alert }} />
            </span>
          </div>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <line x1={420} y1={460} x2={1100} y2={460} stroke={flip > 0 ? `rgba(${palette.halo},${0.4 + 0.6 * flip})` : palette.dim} strokeWidth={8 + 4 * flip} strokeLinecap="round" style={{ filter: flip > 0 ? `drop-shadow(0 0 ${16 * flip}px rgb(${palette.halo}))` : undefined }} />
            <line x1={1100} y1={430} x2={1100} y2={490} stroke={palette.alert} strokeWidth={6} />
            <line x1={420} y1={580} x2={1500} y2={580} stroke="rgba(232,238,242,0.4)" strokeWidth={4} strokeDasharray="4 14" opacity={1 - flip * 0.75} />
          </svg>
          <div style={{ position: "absolute", left: 1140, top: 438, fontFamily: fonts.mono, fontSize: 24, color: `rgb(${palette.halo})`, opacity: flip }}>有限 → 每一刻都算数</div>
          <div style={{ position: "absolute", left: 1520, top: 560, fontFamily: fonts.mono, fontSize: 24, color: palette.dim, opacity: 0.4 + 0.6 * flip }}>∞ → 无所谓</div>
        </div>
      )}
      <Sfx name="shutter" at={BEAT} volume={0.4} />
      <Sfx name="stamp" at={cues[2] + BEAT} volume={0.5} />
      <Sfx name="rise" at={cues[2] + 2 * BEAT} volume={0.35} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
