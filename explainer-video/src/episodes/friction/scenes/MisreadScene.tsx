import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// 0 · re-read the word.
// 1 · "内耗 = 事情太多": a tall stack of to-dos.
// 2 · struck out. Two bars instead: 想 — off the scale; 做 — a sliver.
export const MisreadScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const focus = useRamp(BEAT, 10);
  const word = interpolate(frame, [cues[1] - 6, cues[1]], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const stage = useRamp(cues[1], 8);
  const t2 = frame - cues[2];
  const strike = interpolate(t2, [0, 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const think = interpolate(t2, [BEAT, 4 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => 1 - (1 - t) ** 3 });
  const stack = Math.max(0, Math.min(9, Math.floor((frame - cues[1]) / 6) + 1));
  return (
    <ObsFrame duration={duration}>
      <div style={{ opacity: word }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontSize: 140, fontWeight: 900, letterSpacing: 40, filter: `blur(${(1 - focus) * 10}px)` }}>内耗</div>
        <FocusBox x={960} y={450} w={560} h={220} progress={focus} label="RE-THINK" />
      </div>
      {frame >= cues[1] - 6 && (
        <div style={{ position: "absolute", inset: 0, opacity: stage }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 180, textAlign: "center", fontSize: 64, fontWeight: 900, letterSpacing: 4 }}>
            内耗 = <span style={{ position: "relative", color: strike ? palette.dim : palette.ink }}>
              事情太多
              <span style={{ position: "absolute", left: 0, top: "52%", height: 6, width: `${strike * 100}%`, background: palette.alert }} />
            </span>
          </div>
          {t2 < 0 &&
            Array.from({ length: stack }, (_, i) => (
              <div key={i} style={{ position: "absolute", left: 960 - 160 + ((i * 13) % 20) - 10, top: 720 - i * 40, width: 320, height: 34, borderRadius: 4, background: "#1c2330", border: `1px solid ${palette.faint}` }} />
            ))}
          {t2 >= 0 && (
            <>
              <div style={{ position: "absolute", left: 420, top: 360, fontSize: 48, fontWeight: 900, color: palette.alert }}>想</div>
              <div style={{ position: "absolute", left: 500, top: 362, width: 1100 * think, height: 56, background: `linear-gradient(90deg, rgba(255,77,109,0.5), ${palette.alert})`, boxShadow: "0 0 30px rgba(255,77,109,0.5)" }} />
              <div style={{ position: "absolute", left: 500 + 1100 * think + 16, top: 368, fontFamily: fonts.mono, fontSize: 30, color: palette.alert, opacity: think }}>∞</div>
              <div style={{ position: "absolute", left: 420, top: 480, fontSize: 48, fontWeight: 900, color: palette.accent }}>做</div>
              <div style={{ position: "absolute", left: 500, top: 482, width: 40 * think, height: 56, background: palette.accent }} />
              <div style={{ position: "absolute", left: 560, top: 488, fontFamily: fonts.mono, fontSize: 30, color: palette.accent, opacity: think }}>3%</div>
            </>
          )}
        </div>
      )}
      <Sfx name="shutter" at={BEAT} volume={0.4} />
      <Sfx name="stamp" at={cues[2]} volume={0.5} />
      <Sfx name="rise" at={cues[2] + BEAT} volume={0.35} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
