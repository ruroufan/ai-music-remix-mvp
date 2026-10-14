import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Backlit, Beam, FocusBox, Horizon } from "../../../channels/backlit/parts";
import { Silhouette } from "../../../components/Figures";
import { palette } from "../../../channels/backlit/look";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, HALF_BEAT, type SceneProps } from "../timing";

const FLOOR = 840;
const OTHERS = [300, 520, 1400, 1620];
const SELF = { x: 960, head: FLOOR - 200 };
const IMAGE = { x: 960, y: 330 }; // where the self-image forms

// Line 0: re-reading the quote — focus pulls onto it.
// Line 1: the usual reading: "other people are bad" (red eyes in the dark).
// Line 2: Sartre's point: we only see ourselves through their eyes — their
// gazes converge and draw an outline of you.
export const MisreadScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const focus = useRamp(cues[0] + BEAT, 10);
  const blur = interpolate(focus, [0, 1], [10, 0]);
  const quoteOut = interpolate(frame, [cues[1] - 6, cues[1]], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const crowd = useRamp(cues[1], 10);
  const lens = useRamp(cues[2], 10);
  const beams = useRamp(cues[2] + BEAT, 2 * BEAT);
  const image = useRamp(cues[2] + 3 * BEAT, 2 * BEAT);
  const shake = frame >= cues[1] && frame < cues[2] ? Math.sin(frame * 1.7) * 2 : 0;

  return (
    <ObsFrame duration={duration}>
      <div style={{ opacity: quoteOut }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontSize: 96, fontWeight: 900, letterSpacing: 22, filter: `blur(${blur}px)`, opacity: 0.85 }}>
          他人即地狱
        </div>
        <FocusBox x={960} y={420} w={760} h={190} progress={focus} label="RE-READ" />
      </div>

      <div style={{ position: "absolute", inset: 0, opacity: crowd }}>
        <Horizon y={FLOOR} />
        {OTHERS.map((x, i) => (
          <div key={x} style={{ position: "absolute", inset: 0, transform: `translateX(${shake * (i % 2 ? 1 : -1)}px)` }}>
            <Silhouette x={x} bottom={FLOOR} height={300} fill="#020304" rim="rgba(232,238,242,0.15)" />
            {/* eyes: red and hostile, then lenses that hold you */}
            {[-9, 9].map((dx) => (
              <div
                key={dx}
                style={{
                  position: "absolute",
                  left: x + dx - 5,
                  top: FLOOR - 300 + 28,
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  background: lens > 0.5 ? palette.accent : palette.alert,
                  boxShadow: `0 0 12px ${lens > 0.5 ? palette.accent : palette.alert}`,
                }}
              />
            ))}
            <Beam from={{ x, y: FLOOR - 270 }} to={IMAGE} progress={beams} width={1.5} dashed />
          </div>
        ))}
        <Backlit x={SELF.x} bottom={FLOOR} height={200} glow={0.5 + image * 0.5} />
        {/* the self you can only see through them */}
        <div style={{ position: "absolute", inset: 0, opacity: image }}>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <g transform={`translate(${IMAGE.x - 60} ${IMAGE.y - 110}) scale(1)`} fill="none" stroke={palette.accent} strokeWidth={2} strokeDasharray="6 6">
              <circle cx={60} cy={34} r={28} />
              <path d="M22 100 Q22 66 60 66 Q98 66 98 100 L98 170 L22 170 Z" />
            </g>
          </svg>
        </div>
      </div>

      <Sfx name="shutter" at={cues[0] + BEAT} volume={0.5} />
      <Sfx name="boom" at={cues[1]} volume={0.4} />
      <Sfx name="glint" at={cues[2]} volume={0.3} />
      <Sfx name="glint" at={cues[2] + 3 * BEAT + HALF_BEAT} volume={0.3} />

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
