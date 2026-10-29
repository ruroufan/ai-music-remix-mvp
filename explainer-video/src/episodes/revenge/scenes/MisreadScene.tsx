import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// 0 · re-read the word.
// 1 · "熬夜 = 自制力差".
// 2 · struck out: 不甘心. The day's progress bar reaches 23:59 and a hand keeps
//     dragging it back — he won't let the day end.
export const MisreadScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const focus = useRamp(BEAT, 10);
  const word = interpolate(frame, [cues[1] - 6, cues[1]], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const eq = useRamp(cues[1], 8);
  const strike = interpolate(frame, [cues[2] + BEAT, cues[2] + BEAT + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t2 = frame - cues[2];
  // the bar creeps toward the end and gets dragged back, once per two beats
  const cyc = ((t2 - 2 * BEAT) % (2 * BEAT) + 2 * BEAT) % (2 * BEAT);
  const pos = t2 < 2 * BEAT ? 0.9 + 0.09 * (t2 / (2 * BEAT)) : cyc < 1.5 * BEAT ? 0.93 + 0.065 * (cyc / (1.5 * BEAT)) : 0.995 - 0.065 * ((cyc - 1.5 * BEAT) / (0.5 * BEAT));
  const W = 1100, X = 410;
  return (
    <ObsFrame duration={duration}>
      <div style={{ opacity: word }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontSize: 140, fontWeight: 900, letterSpacing: 40, filter: `blur(${(1 - focus) * 10}px)` }}>熬夜</div>
        <FocusBox x={960} y={450} w={560} h={220} progress={focus} label="RE-THINK" />
      </div>
      {frame >= cues[1] - 6 && (
        <div style={{ position: "absolute", inset: 0, opacity: eq }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", fontSize: 72, fontWeight: 900, letterSpacing: 6 }}>
            熬夜 = <span style={{ position: "relative", color: strike ? palette.dim : palette.ink }}>
              自制力差
              <span style={{ position: "absolute", left: 0, top: "52%", height: 6, width: `${strike * 100}%`, background: palette.alert }} />
            </span>
            {strike > 0 && <span style={{ color: palette.accent, marginLeft: 26, opacity: strike }}>不甘心</span>}
          </div>
          {t2 >= 0 && (
            <div style={{ position: "absolute", inset: 0, opacity: Math.min(1, t2 / 6) }}>
              <div style={{ position: "absolute", left: X, top: 500, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim }}>今天 · 剩余</div>
              <div style={{ position: "absolute", left: X, top: 540, width: W, height: 40, border: `1px solid ${palette.faint}` }}>
                <div style={{ width: `${pos * 100}%`, height: "100%", background: `linear-gradient(90deg, rgba(${palette.halo},0.3), rgba(${palette.halo},0.8))` }} />
              </div>
              <div style={{ position: "absolute", left: X + W - 80, top: 590, fontFamily: fonts.mono, fontSize: 28, color: palette.alert }}>23:59</div>
              {/* the hand holding it back */}
              <div style={{ position: "absolute", left: X + pos * W - 20, top: 500, width: 40, height: 120, borderRadius: 20, background: "#141a24", border: `2px solid ${palette.accent}` }} />
              <div style={{ position: "absolute", left: X + pos * W - 120, top: 640, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: palette.accent }}>← 再等等</div>
            </div>
          )}
        </div>
      )}
      <Sfx name="shutter" at={BEAT} volume={0.4} />
      <Sfx name="stamp" at={cues[2] + BEAT} volume={0.55} />
      {[2, 4, 6].map((b) => (
        <Sfx key={b} name="whoosh" at={cues[2] + b * BEAT + Math.round(1.5 * BEAT)} volume={0.2} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
