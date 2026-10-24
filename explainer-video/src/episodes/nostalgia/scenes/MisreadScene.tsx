import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Polaroid } from "../road";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const EDITS = [
  { name: "暖色", v: "+80" },
  { name: "柔光", v: "+60" },
  { name: "烦恼", v: "−100" },
  { name: "无聊", v: "−90" },
  { name: "遗憾", v: "−70" },
];

// 0 · re-read the word.
// 1 · a photo of the past, as it was: grey, ordinary. "原片".
// 2 · memory edits it, one slider per beat: warmth up, softness up,
//     worries down… until it glows. "已修饰".
export const MisreadScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const focus = useRamp(BEAT, 10);
  const word = interpolate(frame, [cues[1] - 6, cues[1]], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const stage = useRamp(cues[1], 8);
  const t2 = frame - cues[2];
  const applied = Math.max(0, Math.min(EDITS.length, Math.floor((t2 - BEAT) / BEAT) + 1));
  const k = applied / EDITS.length;
  return (
    <ObsFrame duration={duration}>
      <div style={{ opacity: word }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontSize: 140, fontWeight: 900, letterSpacing: 40, filter: `blur(${(1 - focus) * 10}px)` }}>怀旧</div>
        <FocusBox x={960} y={450} w={560} h={220} progress={focus} label="RE-THINK" />
      </div>
      {frame >= cues[1] - 6 && (
        <div style={{ position: "absolute", inset: 0, opacity: stage }}>
          <div style={{ position: "absolute", left: 420, top: 180, filter: `saturate(${0.1 + 1.2 * k}) brightness(${0.75 + 0.45 * k}) blur(${k * 0.8}px)`, boxShadow: `0 0 ${120 * k}px rgba(255,190,110,${0.5 * k})` }}>
            <Polaroid x={260} y={0} w={520} kind="desk" caption={k > 0 ? "最好的时光" : "高三 · 某个周二"} tone={k} />
          </div>
          <div style={{ position: "absolute", left: 1200, top: 220, width: 420, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 2 }}>
            <div style={{ color: k > 0 ? palette.accent : palette.dim, marginBottom: 24, fontSize: 26 }}>{k > 0 ? "记忆 · 已修饰" : "过去 · 原片"}</div>
            {EDITS.map((e, i) => {
              const on = i < applied;
              const neg = e.v.startsWith("−");
              return (
                <div key={e.name} style={{ display: "flex", alignItems: "center", gap: 16, height: 56, color: on ? palette.ink : palette.dim }}>
                  <div style={{ width: 80 }}>{e.name}</div>
                  <div style={{ position: "relative", flex: 1, height: 4, background: palette.faint }}>
                    <div style={{ position: "absolute", left: "50%", top: -9, width: 22, height: 22, borderRadius: 11, background: on ? (neg ? palette.alert : `rgb(214,160,96)`) : palette.dim, transform: `translateX(${on ? (neg ? -140 : 120) : -11}px)` }} />
                  </div>
                  <div style={{ width: 70, textAlign: "right", color: on ? (neg ? palette.alert : "rgb(214,160,96)") : palette.dim }}>{on ? e.v : "0"}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <Sfx name="shutter" at={BEAT} volume={0.4} />
      <Sfx name="shutter" at={cues[1]} volume={0.35} />
      {EDITS.map((_, i) => (
        <Sfx key={i} name="glint" at={cues[2] + (i + 1) * BEAT} volume={0.22} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
