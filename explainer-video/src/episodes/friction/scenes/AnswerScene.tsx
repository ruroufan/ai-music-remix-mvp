import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Seated, Tangle, Thoughts } from "../tangle";
import { CLOUD, FLOOR, SEAT_X } from "./HookScene";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

// 0 · sitting still, the tangle churning overhead.
// 1 · a fight with nobody: red sparks where the threads lash at him, beat by
//     beat; stamina dropping — VS 想象中的事情.
// 2 · reality: one clean line, ×1. Imagination: tangles multiplying, ×1000.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const t1 = frame - cues[1], t2 = frame - cues[2];
  const fight = frame >= cues[1] && frame < cues[2];
  const stamina = interpolate(frame, [cues[1], cues[2]], [0.8, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const count = Math.round(interpolate(t2, [BEAT, 7 * BEAT], [1, 1000], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t }));
  return (
    <ObsFrame duration={duration}>
      {frame < cues[2] ? (
        <>
          <Horizon y={FLOOR} />
          <Tangle cx={CLOUD.cx} cy={CLOUD.cy} r={CLOUD.r} frame={frame} churn={fight ? 2.2 : 1.2} />
          {frame < cues[1] && <Thoughts cx={CLOUD.cx} cy={CLOUD.cy} r={CLOUD.r} frame={frame} beat={BEAT} />}
          <Seated x={SEAT_X} floor={FLOOR} glow={0.5} slump={fight ? 0.4 + 0.3 * Math.exp(-((t1 % BEAT) / BEAT) * 4) : 0} />
          {fight &&
            Array.from({ length: 3 }, (_, k) => {
              const b = Math.floor(t1 / BEAT) * 3 + k;
              const ph = (t1 % BEAT) / BEAT;
              const x = 700 + random(`fx-${b}`) * 260, y = 420 + random(`fy-${b}`) * 160;
              return ph < 0.5 ? (
                <svg key={k} width={120} height={120} viewBox="-60 -60 120 120" style={{ position: "absolute", left: x - 60, top: y - 60, opacity: 1 - ph * 2 }}>
                  {Array.from({ length: 8 }, (_, i) => {
                    const a = (i / 8) * Math.PI * 2;
                    return <line key={i} x1={Math.cos(a) * 8} y1={Math.sin(a) * 8} x2={Math.cos(a) * (20 + ph * 60)} y2={Math.sin(a) * (20 + ph * 60)} stroke={palette.alert} strokeWidth={3} />;
                  })}
                </svg>
              ) : null;
            })}
          {fight && (
            <div style={{ position: "absolute", left: 1300, top: 330, fontFamily: fonts.mono, color: palette.dim, fontSize: 22, letterSpacing: 4 }}>
              <div style={{ fontSize: 44, fontWeight: 900, color: palette.alert, fontFamily: fonts.sans }}>VS 想象中的事情</div>
              <div style={{ marginTop: 26 }}>体力 {Math.round(stamina * 100)}%</div>
              <div style={{ marginTop: 8, width: 320, height: 12, background: palette.faint }}>
                <div style={{ width: `${stamina * 100}%`, height: "100%", background: palette.alert }} />
              </div>
              <div style={{ marginTop: 16 }}>对手：不存在</div>
            </div>
          )}
        </>
      ) : (
        <>
          <div style={{ position: "absolute", left: 959, top: 150, width: 2, height: 620, background: palette.faint }} />
          <div style={{ position: "absolute", left: 0, width: 960, top: 180, textAlign: "center", fontSize: 44, fontWeight: 900, color: palette.accent }}>现实</div>
          <div style={{ position: "absolute", left: 960, width: 960, top: 180, textAlign: "center", fontSize: 44, fontWeight: 900, color: palette.alert }}>想象</div>
          <svg width={960} height={400} style={{ position: "absolute", left: 0, top: 300 }}>
            <line x1={180} y1={200} x2={780} y2={200} stroke={palette.accent} strokeWidth={6} strokeLinecap="round" />
          </svg>
          <div style={{ position: "absolute", left: 0, width: 960, top: 560, textAlign: "center", fontFamily: fonts.mono, fontSize: 60, fontWeight: 700, color: palette.accent }}>×1</div>
          {Array.from({ length: Math.min(9, 1 + Math.floor(t2 / 10)) }, (_, i) => (
            <Tangle key={i} cx={1160 + (i % 3) * 200} cy={330 + Math.floor(i / 3) * 110} r={90} frame={frame + i * 40} threads={6} churn={1.6} />
          ))}
          <div style={{ position: "absolute", left: 960, width: 960, top: 640, textAlign: "center", fontFamily: fonts.mono, fontSize: 60, fontWeight: 700, color: palette.alert }}>×{count}</div>
        </>
      )}
      {Array.from({ length: 8 }, (_, k) => (
        <Sfx key={k} name="glitch" at={cues[1] + k * BEAT} volume={0.2} />
      ))}
      <Sfx name="stamp" at={cues[2]} volume={0.5} />
      <Sfx name="rise" at={cues[2] + BEAT} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
