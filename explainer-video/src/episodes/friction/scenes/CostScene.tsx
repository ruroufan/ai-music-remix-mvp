import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Seated } from "../tangle";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const FLOOR = 730;

// 0 · the same obstacle twice: imagined — a black mountain filling the frame;
//     real — a pebble. ×20.
// 1 · a war map in his head, battles crossed off one after another — 已打完 —
//     and under his chair: 前进 0 步.
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const grow = interpolate(frame, [BEAT, 4 * BEAT], [0.2, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => 1 - (1 - t) ** 3 });
  const t1 = frame - cues[1];
  const battles = Math.max(0, Math.min(36, Math.floor((t1 - BEAT) / (HALF_BEAT / 2))));
  return (
    <ObsFrame duration={duration}>
      {frame < cues[1] ? (
        <>
          <Horizon y={FLOOR} />
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <path d={`M${220} ${FLOOR} L${220 + 330 * grow} ${FLOOR - 560 * grow} L${220 + 420 * grow} ${FLOOR - 470 * grow} L${220 + 600 * grow} ${FLOOR - 640 * grow} L${220 + 860 * grow} ${FLOOR} Z`} fill="#05070a" stroke="rgba(232,238,242,0.25)" strokeWidth={2} />
            <ellipse cx={1500} cy={FLOOR - 16} rx={34} ry={18} fill="#2a3242" stroke={`rgba(${palette.halo},0.7)`} strokeWidth={2} />
          </svg>
          <div style={{ position: "absolute", left: 220, width: 860, top: FLOOR + 20, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 4, color: palette.alert }}>想象中的困难</div>
          <div style={{ position: "absolute", left: 1400, width: 200, top: FLOOR + 20, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 4, color: `rgb(${palette.halo})` }}>真实的</div>
          <div style={{ position: "absolute", left: 1300, top: 380, fontFamily: fonts.mono, fontSize: 90, fontWeight: 700, color: palette.alert, opacity: grow > 0.9 ? 1 : 0 }}>×20</div>
        </>
      ) : (
        <>
          <Horizon y={FLOOR} />
          <div style={{ position: "absolute", left: 520, top: 120, width: 880, height: 420, borderRadius: "50% 50% 46% 46%", background: "rgba(16,21,31,0.9)", border: `1px solid ${palette.faint}`, overflow: "hidden" }}>
            {Array.from({ length: 36 }, (_, i) => {
              const x = 80 + random(`bx-${i}`) * 720, y = 60 + random(`by-${i}`) * 300;
              const done = i < battles;
              return (
                <div key={i} style={{ position: "absolute", left: x, top: y, fontSize: 30, color: done ? palette.alert : "rgba(232,238,242,0.3)", transform: `scale(${done ? 1 : 0.8})` }}>{done ? "✕" : "⚔"}</div>
              );
            })}
          </div>
          <div style={{ position: "absolute", left: 1440, top: 220, fontFamily: fonts.mono, color: palette.dim, fontSize: 22, letterSpacing: 4 }}>
            脑内的仗
            <div style={{ fontSize: 70, fontWeight: 700, color: palette.alert }}>已打完 {battles}</div>
          </div>
          <Seated x={1000} floor={FLOOR} scale={1.1} glow={0.4} slump={0.5} />
          <div style={{ position: "absolute", left: 760, top: FLOOR + 24, width: 400, textAlign: "center", fontFamily: fonts.mono, fontSize: 30, color: palette.accent }}>前进：0 步</div>
        </>
      )}
      <Sfx name="rise" at={BEAT} volume={0.3} />
      <Sfx name="boom" at={4 * BEAT} volume={0.4} />
      {Array.from({ length: 16 }, (_, k) => (
        <Sfx key={k} name="stamp" at={cues[1] + BEAT + k * (HALF_BEAT / 2)} volume={0.08} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
