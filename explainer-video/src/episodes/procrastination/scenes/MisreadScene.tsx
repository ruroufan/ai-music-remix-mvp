import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox, Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const FLOOR = 760;

// A person lying on a sofa, seen side-on; `think` puts a thought bubble over
// them (empty = lazy, full of the task = procrastinating).
const Lying: React.FC<{ x: number; color: string; children?: React.ReactNode }> = ({ x, color, children }) => (
  <div style={{ position: "absolute", inset: 0 }}>
    <div style={{ position: "absolute", left: x - 180, top: FLOOR - 90, width: 360, height: 70, borderRadius: 16, background: "#1c2330", border: `1px solid ${palette.faint}` }} />
    <div style={{ position: "absolute", left: x - 180, top: FLOOR - 150, width: 50, height: 130, borderRadius: 14, background: "#1c2330", border: `1px solid ${palette.faint}` }} />
    <svg width={320} height={80} style={{ position: "absolute", left: x - 150, top: FLOOR - 150, overflow: "visible" }}>
      <circle cx={30} cy={40} r={24} fill="#030405" stroke={color} strokeWidth={2} />
      <rect x={56} y={22} width={170} height={40} rx={16} fill="#030405" stroke={color} strokeWidth={2} />
      <rect x={220} y={30} width={90} height={14} rx={6} fill="#030405" stroke={color} strokeWidth={2} />
      <rect x={220} y={46} width={90} height={14} rx={6} fill="#030405" stroke={color} strokeWidth={2} />
    </svg>
    {children}
  </div>
);

// 0 · re-read the word.
// 1 · "拖延 = 懒": someone lying on the sofa.
// 2 · two sofas. The lazy one's thought bubble: zzz. The procrastinator's: the
//     task, pulsing red, over and over. "= 懒" gets struck out.
export const MisreadScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const focus = useRamp(BEAT, 10);
  const word = interpolate(frame, [cues[1] - 6, cues[1]], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const stage = useRamp(cues[1], 8);
  const split = interpolate(frame, [cues[2], cues[2] + BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t * (3 - 2 * t) });
  const strike = interpolate(frame, [cues[2] + 3 * BEAT, cues[2] + 3 * BEAT + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const nag = Math.max(0, Math.floor((frame - cues[2] - BEAT) / (BEAT / 2)) + 1);
  return (
    <ObsFrame duration={duration}>
      <div style={{ opacity: word }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontSize: 140, fontWeight: 900, letterSpacing: 40, filter: `blur(${(1 - focus) * 10}px)` }}>拖延</div>
        <FocusBox x={960} y={450} w={560} h={220} progress={focus} label="RE-THINK" />
      </div>
      {frame >= cues[1] - 6 && (
        <div style={{ position: "absolute", inset: 0, opacity: stage }}>
          <Horizon y={FLOOR} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", fontSize: 60, fontWeight: 900, letterSpacing: 6 }}>
            拖延 <span style={{ position: "relative", color: strike ? palette.dim : palette.ink }}>
              = 懒
              <span style={{ position: "absolute", left: 0, top: "52%", height: 6, width: `${strike * 100}%`, background: palette.alert }} />
            </span>
            {strike > 0 && <span style={{ color: palette.accent, marginLeft: 24, opacity: strike }}>≠ 懒</span>}
          </div>
          <Lying x={960 - split * 420} color={`rgba(${palette.halo},0.8)`}>
            <div style={{ position: "absolute", left: 960 - split * 420 - 100, top: 450, fontFamily: fonts.mono, fontSize: 44, color: palette.dim, letterSpacing: 8 }}>z z z</div>
            <div style={{ position: "absolute", left: 960 - split * 420 - 80, top: FLOOR + 20, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 6, color: palette.dim, opacity: split }}>懒 · 什么都不想</div>
          </Lying>
          {split > 0 && (
            <div style={{ position: "absolute", inset: 0, opacity: split }}>
              <Lying x={1380} color={`rgba(${palette.halo},0.8)`}>
                <div style={{ position: "absolute", left: 1220, top: 330, width: 320, height: 170, borderRadius: 80, background: "rgba(232,238,242,0.92)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "#14181e" }}>
                  <div style={{ fontSize: 44, fontWeight: 900, color: palette.alert, transform: `scale(${1 + 0.08 * Math.sin((frame / BEAT) * Math.PI * 2)})` }}>那份报告！</div>
                  <div style={{ fontFamily: fonts.mono, fontSize: 20, marginTop: 6 }}>想起 ×{nag}</div>
                </div>
                <div style={{ position: "absolute", left: 1270, top: FLOOR + 20, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 6, color: palette.alert }}>拖延 · 一直惦记</div>
              </Lying>
            </div>
          )}
        </div>
      )}
      <Sfx name="shutter" at={BEAT} volume={0.4} />
      <Sfx name="whoosh" at={cues[2]} volume={0.35} />
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <Sfx key={k} name="glint" at={cues[2] + BEAT + k * (BEAT / 2)} volume={0.12} />
      ))}
      <Sfx name="stamp" at={cues[2] + 3 * BEAT} volume={0.55} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
