import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Backlit, Beam, Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { FigureShape } from "../gilded";
import { Silhouette } from "../../../components/Figures";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const FLOOR = 820;
const STEPS = 4;

// Line 0: no labels now — the feeling itself is not an illness.
// Line 1: a child looking up at the grown-ups.
// Line 2: "not enough" pushes it up the stairs, a step per beat, growing.
export const ChildScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const calm = useRamp(0, 10);
  const look = useRamp(cues[1], 8);
  const gaze = useRamp(cues[1] + BEAT, BEAT);
  const climbStart = cues[2] + BEAT;
  const step = Math.max(0, Math.min(STEPS, Math.floor((frame - climbStart) / BEAT) + 1));
  const stepT = interpolate(frame, [climbStart, climbStart + STEPS * BEAT], [0, STEPS], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const growing = frame >= cues[2];

  const childX = growing ? 620 + stepT * 170 : 960;
  const childBottom = growing ? FLOOR - stepT * 60 : FLOOR;
  const childH = growing ? 150 + stepT * 35 : 150;
  const s = childH / 260;

  return (
    <ObsFrame duration={duration}>
      <Horizon y={FLOOR} />
      {frame < cues[1] && (
        <div style={{ position: "absolute", inset: 0, opacity: calm }}>
          <Backlit x={960} bottom={FLOOR} height={320} glow={0.9} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim }}>
            INFERIORITY ≠ ILLNESS
          </div>
        </div>
      )}
      {frame >= cues[1] && (
        <div style={{ position: "absolute", inset: 0, opacity: look }}>
          {/* grown-ups */}
          {!growing &&
            [640, 1280].map((x) => <Silhouette key={x} x={x} bottom={FLOOR} height={460} fill="#05070a" rim="rgba(232,238,242,0.3)" />)}
          {!growing && <Beam from={{ x: 975, y: FLOOR - 125 }} to={{ x: 1250, y: FLOOR - 430 }} progress={gaze} width={1.5} dashed />}
          {/* the stairs */}
          {growing &&
            Array.from({ length: STEPS }, (_, i) => (
              <div key={i} style={{ position: "absolute", left: 620 + (i + 0.5) * 170, top: FLOOR - (i + 1) * 60, width: 170, height: (i + 1) * 60, background: `rgba(${palette.accentRgb},${i < step ? 0.16 : 0.05})`, borderTop: `2px solid rgba(${palette.accentRgb},${i < step ? 0.8 : 0.2})` }}>
                <div style={{ fontFamily: fonts.mono, fontSize: 18, color: palette.dim, padding: 10 }}>{["学", "试", "错", "长大"][i]}</div>
              </div>
            ))}
          {/* the child: chin up at the grown-ups, then climbing */}
          <svg width={120 * s} height={260 * s} viewBox="0 0 120 260" style={{ position: "absolute", left: childX - 60 * s, top: childBottom - childH }}>
            <FigureShape pose="proud" />
          </svg>
        </div>
      )}

      <Sfx name="glint" at={cues[1] + BEAT} volume={0.25} />
      {Array.from({ length: STEPS }, (_, i) => (
        <Sfx key={i} name="step" at={climbStart + i * BEAT} volume={0.45} />
      ))}

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
