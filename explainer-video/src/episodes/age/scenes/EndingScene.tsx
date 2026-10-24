import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { fonts, palette } from "../../../channels/backlit/look";
import { Walker } from "../../nostalgia/road";
import { Axis, OwnPath } from "../timeline";
import { HIGH_AXIS, STEP } from "./OwnScene";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, HALF_BEAT, type SceneProps } from "../timing";

// 0 · a clock ticking at exactly the same speed while the anxiety meter
//     beside it spikes and spikes: 1 秒 = 1 秒.
// 1 · on his own path now, walking at his own pace, lights opening as he goes.
// 2 · end card, with the channel sign-off.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const anx = 0.3 + 0.6 * Math.abs(Math.sin(frame / 4)) * Math.min(1, frame / (2 * BEAT));
  const t1 = frame - cues[1];
  const walk = interpolate(t1, [0, 9 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const card = useRamp(cues[2], 12);
  const pathPt = { x: STEP.x + 40 + walk * 520, y: STEP.y + 20 + Math.sin(walk * Math.PI) * 140 };
  return (
    <ObsFrame duration={duration}>
      {frame < cues[1] ? (
        <>
          <svg width={360} height={360} viewBox="-180 -180 360 360" style={{ position: "absolute", left: 560, top: 210 }}>
            <circle r={160} fill="none" stroke={palette.ink} strokeWidth={6} />
            {Array.from({ length: 60 }, (_, i) => (
              <line key={i} x1={0} y1={-150} x2={0} y2={i % 5 ? -140 : -128} stroke={palette.dim} strokeWidth={i % 5 ? 2 : 4} transform={`rotate(${i * 6})`} />
            ))}
            <line x1={0} y1={0} x2={0} y2={-140} stroke={palette.alert} strokeWidth={4} transform={`rotate(${Math.floor(frame / 30) * 6})`} />
            <circle r={8} fill={palette.alert} />
          </svg>
          <div style={{ position: "absolute", left: 560, width: 360, top: 600, textAlign: "center", fontFamily: fonts.mono, fontSize: 30, color: palette.ink }}>1 秒 = 1 秒</div>
          <div style={{ position: "absolute", left: 1140, top: 230, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: palette.dim }}>
            焦虑
            <div style={{ marginTop: 10, width: 40, height: 340, border: `1px solid ${palette.faint}`, position: "relative" }}>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${anx * 100}%`, background: palette.alert }} />
            </div>
          </div>
          <div style={{ position: "absolute", left: 1220, top: 420, fontFamily: fonts.mono, fontSize: 26, color: palette.dim }}>时钟：不受影响</div>
        </>
      ) : (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - card * 0.7 }}>
          <Axis age={29.4} y={HIGH_AXIS} opacity={0.18} blur={3} />
          <OwnPath x0={STEP.x} y0={STEP.y} grow={1} frame={frame} />
          <Walker x={pathPt.x} bottom={pathPt.y} height={210} face="right" walk={(t1 / (2 * HALF_BEAT)) * Math.PI} lean={2} glow={1.2} rgb="255, 200, 130" />
        </div>
      )}
      <EndCard opacity={card} signoffAt={cues[2] + BEAT} />
      {Array.from({ length: 7 }, (_, k) => (
        <Sfx key={k} name="shutter" at={k * 2 * HALF_BEAT} volume={0.12} />
      ))}
      <Sfx name="glint" at={cues[1]} volume={0.35} />
      {[2, 4, 6, 8].map((b) => (
        <Sfx key={`w${b}`} name="step" at={cues[1] + b * BEAT} volume={0.2} />
      ))}
      <Sfx name="glint" at={cues[2]} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
