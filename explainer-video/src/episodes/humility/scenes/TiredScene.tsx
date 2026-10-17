import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { MaskedFigure } from "../mask";
import { Person } from "../../solitude/porcupine";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const FLOOR = 760;

const Battery: React.FC<{ x: number; y: number; k: number; label: string }> = ({ x, y, k, label }) => (
  <div style={{ position: "absolute", left: x, top: y, fontFamily: fonts.mono, fontSize: 18, letterSpacing: 4, color: palette.dim }}>
    {label}
    <div style={{ marginTop: 8, width: 220, height: 34, border: `2px solid ${palette.dim}`, borderRadius: 6, padding: 3, boxSizing: "border-box" }}>
      <div style={{ width: `${k * 100}%`, height: "100%", borderRadius: 3, background: k < 0.25 ? palette.alert : palette.accent }} />
    </div>
  </div>
);

// 0 · plain pride vs. disguised modesty, side by side: one battery barely
//     moves; the other drains.
// 1 · the disguise's two jobs, ticked off on the beat: put yourself down — and
//     check that nobody took it seriously (his eyes darting to each face).
export const TiredScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const drain = interpolate(frame, [BEAT, cues[1] + 7 * BEAT], [0.95, 0.08], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t1 = frame - cues[1];
  const job1 = t1 >= BEAT, job2 = t1 >= 3 * BEAT;
  const look = job2 ? Math.floor((t1 - 3 * BEAT) / (BEAT / 2)) % 3 : -1;
  const OTHERS = [1260, 1460, 1660];
  return (
    <ObsFrame duration={duration}>
      <Horizon y={FLOOR} />
      {frame < cues[1] && (
        <>
          <div style={{ position: "absolute", left: 959, top: 150, width: 2, height: 640, background: palette.faint }} />
          <div style={{ position: "absolute", left: 0, width: 960, top: 170, textAlign: "center", fontSize: 40, fontWeight: 900, color: palette.dim }}>直接的骄傲</div>
          <div style={{ position: "absolute", left: 960, width: 960, top: 170, textAlign: "center", fontSize: 40, fontWeight: 900, color: palette.alert }}>伪装的谦虚</div>
          <Person x={480} bottom={FLOOR} height={250} pose="proud" glow={0.6} />
          <Battery x={600} y={420} k={0.82} label="ENERGY" />
          <MaskedFigure x={1440} bottom={FLOOR} height={250} pose="hunch" glow={0.5} />
          <Battery x={1560} y={420} k={drain} label="ENERGY" />
        </>
      )}
      {frame >= cues[1] && (
        <>
          <MaskedFigure x={640} bottom={FLOOR} height={270} pose="hunch" xray={job2 ? 0.5 : 0} glow={0.5} />
          {OTHERS.map((x, i) => (
            <React.Fragment key={x}>
              <Person x={x} bottom={FLOOR} height={210} glow={look === i ? 0.7 : 0.25} />
              {look === i && <div style={{ position: "absolute", left: x - 16, top: FLOOR - 270, fontSize: 40, fontWeight: 900, color: palette.accent }}>?</div>}
            </React.Fragment>
          ))}
          {job2 && (
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <line x1={660} y1={FLOOR - 220} x2={OTHERS[Math.max(0, look)]} y2={FLOOR - 190} stroke={palette.accent} strokeWidth={2} strokeDasharray="8 8" />
            </svg>
          )}
          <div style={{ position: "absolute", left: 180, top: 200, fontSize: 36, fontWeight: 700, lineHeight: 1.9 }}>
            <div style={{ opacity: job1 ? 1 : 0.35 }}>{job1 ? "☑" : "☐"} 贬低自己</div>
            <div style={{ opacity: job2 ? 1 : 0.35 }}>{job2 && t1 > 6 * BEAT ? "☑" : "☐"} 确认别人没有当真</div>
          </div>
          <Battery x={1460} y={180} k={drain} label="ENERGY" />
        </>
      )}
      <Sfx name="glitch" at={4 * BEAT} volume={0.25} />
      <Sfx name="stamp" at={cues[1] + BEAT} volume={0.5} />
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <Sfx key={k} name="shutter" at={cues[1] + 3 * BEAT + k * (BEAT / 2)} volume={0.15} />
      ))}
      <Sfx name="stamp" at={cues[1] + 6 * BEAT} volume={0.45} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
