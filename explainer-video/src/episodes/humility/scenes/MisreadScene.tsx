import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// 0 · re-read the word.
// 1 · the usual map: humility at one end, pride at the other, "opposites".
// 2 · the humility card flips over — 骄傲 on the back — and "↔ 反面" becomes "=".
export const MisreadScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const focus = useRamp(BEAT, 10);
  const word = interpolate(frame, [cues[1] - 6, cues[1]], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const map = useRamp(cues[1], 10);
  const flip = interpolate(frame, [cues[2] + BEAT, cues[2] + 2 * BEAT], [0, 180], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t * (3 - 2 * t) });
  const eq = interpolate(frame, [cues[2] + 2 * BEAT, cues[2] + 2 * BEAT + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const card = (front: string, back: string | null, x: number, color: string, rot: number) => (
    <div style={{ position: "absolute", left: x - 170, top: 330, width: 340, height: 220, perspective: 1200 }}>
      <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateY(${rot}deg)` }}>
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", border: `2px solid ${color}`, background: "rgba(10,14,21,0.9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 96, fontWeight: 900, letterSpacing: 16, color }}>{front}</div>
        {back && (
          <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", border: `2px solid ${palette.alert}`, background: "rgba(30,8,14,0.9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 96, fontWeight: 900, letterSpacing: 16, color: palette.alert }}>{back}</div>
        )}
      </div>
    </div>
  );
  return (
    <ObsFrame duration={duration}>
      <div style={{ opacity: word }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontSize: 140, fontWeight: 900, letterSpacing: 40, filter: `blur(${(1 - focus) * 10}px)` }}>谦虚</div>
        <FocusBox x={960} y={450} w={560} h={220} progress={focus} label="RE-THINK" />
      </div>
      {frame >= cues[1] - 6 && (
        <div style={{ position: "absolute", inset: 0, opacity: map }}>
          {card("谦虚", "骄傲", 560, palette.accent, flip)}
          {card("骄傲", null, 1360, palette.alert, 0)}
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 1 - eq }}>
            <line x1={760} y1={440} x2={1160} y2={440} stroke={palette.dim} strokeWidth={3} />
            <path d="M760 440 l18 -10 l0 20 Z M1160 440 l-18 -10 l0 20 Z" fill={palette.dim} />
          </svg>
          <div style={{ position: "absolute", left: 760, width: 400, top: 380, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 8, color: palette.dim, opacity: 1 - eq }}>反面</div>
          <div style={{ position: "absolute", left: 760, width: 400, top: 360, textAlign: "center", fontSize: 140, fontWeight: 900, color: palette.alert, opacity: eq, transform: `scale(${1.3 - 0.3 * eq})` }}>=</div>
        </div>
      )}
      <Sfx name="shutter" at={BEAT} volume={0.4} />
      <Sfx name="whoosh" at={cues[1]} volume={0.3} />
      <Sfx name="whoosh" at={cues[2] + BEAT} volume={0.4} />
      <Sfx name="stamp" at={cues[2] + 2 * BEAT} volume={0.6} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
