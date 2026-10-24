import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Doer, Seated, Tangle } from "../tangle";
import { CLOUD, FLOOR, SEAT_X } from "./HookScene";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

export const ROWS = { x0: 380, x1: 1540, y: 250, gap: 20 };

// 0 · 山中贼: a bandit on a mountain — 易. 心中贼: a head full of tangle — 难.
// 1 · not another round of thinking: he stands up and reaches out — and the
//     first threads come out of the knot, straight.
export const ThiefScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const t1 = frame - cues[1];
  const stand = interpolate(t1, [2 * BEAT, 2 * BEAT + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const reach = interpolate(t1, [3 * BEAT, 4 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const straight = (i: number) => interpolate(t1, [(4 + i) * BEAT, (5 + i) * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <ObsFrame duration={duration}>
      {frame < cues[1] ? (
        <>
          <div style={{ position: "absolute", left: 959, top: 150, width: 2, height: 620, background: palette.faint }} />
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <path d="M160 720 L400 330 L520 470 L640 380 L800 720 Z" fill="#0c1018" stroke="rgba(232,238,242,0.3)" strokeWidth={2} />
            <g transform="translate(470 470)">
              <circle cx={0} cy={-40} r={14} fill="#030405" stroke={palette.alert} strokeWidth={2} />
              <rect x={-12} y={-24} width={24} height={40} rx={6} fill="#030405" stroke={palette.alert} strokeWidth={2} />
            </g>
          </svg>
          <div style={{ position: "absolute", left: 0, width: 960, top: 170, textAlign: "center", fontSize: 44, fontWeight: 900 }}>山中贼 · <span style={{ color: palette.accent }}>易</span></div>
          <div style={{ position: "absolute", left: 960, width: 960, top: 170, textAlign: "center", fontSize: 44, fontWeight: 900 }}>心中贼 · <span style={{ color: palette.alert }}>难</span></div>
          <div style={{ position: "absolute", left: 1260, top: 320, width: 360, height: 420, borderRadius: "48% 48% 40% 40%", border: "2px solid rgba(232,238,242,0.3)", background: "rgba(10,14,21,0.8)" }} />
          <Tangle cx={1440} cy={500} r={140} frame={frame} threads={10} churn={1.5} rows={ROWS} />
        </>
      ) : (
        <>
          <Horizon y={FLOOR} />
          <Tangle cx={CLOUD.cx} cy={CLOUD.cy} r={CLOUD.r} frame={frame} churn={1.2 - 0.6 * reach} straight={straight} rows={ROWS} />
          <div style={{ position: "absolute", inset: 0, opacity: 1 - stand }}>
            <Seated x={SEAT_X} floor={FLOOR} glow={0.5} />
          </div>
          {stand > 0 && (
            <div style={{ position: "absolute", inset: 0, opacity: stand }}>
              <Doer x={SEAT_X - 60} floor={FLOOR} reach={reach} glow={0.8 + 0.4 * reach} />
            </div>
          )}
          <div style={{ position: "absolute", left: SEAT_X + 120, top: FLOOR - 210, fontFamily: fonts.mono, fontSize: 30, letterSpacing: 6, color: palette.accent, opacity: reach }}>去做 →</div>
        </>
      )}
      <Sfx name="shatter" at={BEAT} volume={0.2} />
      <Sfx name="whoosh" at={cues[1] + 2 * BEAT} volume={0.4} />
      <Sfx name="step" at={cues[1] + 2 * BEAT + 6} volume={0.4} />
      {[4, 5, 6, 7].map((b) => (
        <Sfx key={b} name="glint" at={cues[1] + (b + 1) * BEAT} volume={0.25} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
