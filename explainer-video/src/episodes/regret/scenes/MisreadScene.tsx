import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Backlit, FocusBox, Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const FLOOR = 800;

// Line 0: re-read the word.
// Line 1: the usual story — reflect, and you grow: an arrow pointing up.
// Line 2: Spinoza's answer: the arrow bends back on itself into a loop. Not a virtue.
export const MisreadScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const focus = useRamp(BEAT, 10);
  const word = interpolate(frame, [cues[1] - 6, cues[1]], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const stage = useRamp(cues[1], 10);
  const grow = useRamp(cues[1] + BEAT, 3 * BEAT);
  const bend = interpolate(frame, [cues[2] + BEAT, cues[2] + 3 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t * (3 - 2 * t) });
  const spin = frame >= cues[2] + 3 * BEAT ? (frame - cues[2] - 3 * BEAT) * 6 : 0;

  // straight arrow up → circle: draw both and crossfade
  const arrowLen = 360 * grow;
  const cx = 1180, base = FLOOR - 40;

  return (
    <ObsFrame duration={duration}>
      <div style={{ opacity: word }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontSize: 140, fontWeight: 900, letterSpacing: 40, filter: `blur(${(1 - focus) * 10}px)` }}>后悔</div>
        <FocusBox x={960} y={450} w={560} h={220} progress={focus} label="RE-THINK" />
      </div>

      {frame >= cues[1] && (
        <div style={{ position: "absolute", inset: 0, opacity: stage }}>
          <Horizon y={FLOOR} />
          <Backlit x={760} bottom={FLOOR} height={300} glow={0.8} />
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            {/* the hoped-for arrow: reflect → grow */}
            <g opacity={1 - bend}>
              <line x1={cx} y1={base} x2={cx} y2={base - arrowLen} stroke={palette.accent} strokeWidth={8} strokeLinecap="round" />
              {grow > 0.9 && <polygon points={`${cx - 26},${base - arrowLen + 20} ${cx + 26},${base - arrowLen + 20} ${cx},${base - arrowLen - 24}`} fill={palette.accent} />}
            </g>
            {/* the real shape: a loop going nowhere */}
            <g opacity={bend} transform={`rotate(${spin} ${cx} ${base - 180})`}>
              <circle cx={cx} cy={base - 180} r={150} fill="none" stroke={palette.alert} strokeWidth={8} strokeDasharray={`${940 * bend} 2000`} />
              <polygon points={`${cx + 150 - 22},${base - 180 - 4} ${cx + 150 + 22},${base - 180 - 4} ${cx + 150},${base - 180 + 34}`} fill={palette.alert} />
            </g>
          </svg>
          <div style={{ position: "absolute", left: cx + 70, top: base - 300, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: palette.accent, opacity: grow * (1 - bend) }}>REFLECT → GROW</div>
          <div style={{ position: "absolute", left: cx + 190, top: base - 200, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: palette.alert, opacity: bend }}>LOOP ↻</div>
        </div>
      )}

      <Sfx name="shutter" at={BEAT} volume={0.4} />
      <Sfx name="rise" at={cues[1] + BEAT} volume={0.3} />
      <Sfx name="glitch" at={cues[2] + BEAT} volume={0.4} />
      <Sfx name="stamp" at={cues[2] + 3 * BEAT} volume={0.5} />

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
