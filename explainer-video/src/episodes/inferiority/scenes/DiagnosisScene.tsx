import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { FigureShape, GoldTag } from "../gilded";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const PIVOT = { x: 960, y: 820 };
const ARM = 420;

// Adler's seesaw: the heavier the inferiority on one end, the higher the
// superiority on the other. Line 1 sets the diagnosis above it as a quote.
export const DiagnosisScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const enter = useRamp(0, 10);
  const tilt = interpolate(frame, [cues[0] + BEAT, cues[0] + 3 * BEAT], [0, 14], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => 1 - Math.pow(1 - t, 3) });
  const quote = useRamp(cues[1], 10);
  const rad = (tilt * Math.PI) / 180;
  const left = { x: PIVOT.x - ARM * Math.cos(rad), y: PIVOT.y - 30 + ARM * Math.sin(rad) };
  const right = { x: PIVOT.x + ARM * Math.cos(rad), y: PIVOT.y - 30 - ARM * Math.sin(rad) };

  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: enter * (1 - quote * 0.55), transform: `translateY(${quote * 90}px)` }}>
        <Horizon y={PIVOT.y + 40} />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <polygon points={`${PIVOT.x - 50},${PIVOT.y + 40} ${PIVOT.x + 50},${PIVOT.y + 40} ${PIVOT.x},${PIVOT.y - 30}`} fill="#0e1522" stroke={palette.faint} strokeWidth={2} />
          <line x1={left.x} y1={left.y} x2={right.x} y2={right.y} stroke={palette.ink} strokeWidth={8} strokeLinecap="round" />
          {/* the small, hunched self weighs one end down */}
          <g transform={`translate(${left.x - 45} ${left.y - 200}) scale(${200 / 260})`}>
            <FigureShape pose="hunch" rim="rgba(232,238,242,0.5)" />
          </g>
        </svg>
        <div style={{ position: "absolute", left: left.x - 60, top: left.y + 20, width: 120, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 4, color: palette.dim }}>自卑</div>
        <GoldTag text="优越感" x={right.x} y={right.y - 46} size={40} rot={-tilt} />
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", opacity: quote, transform: `scale(${1.08 - quote * 0.08})` }}>
        <div style={{ fontSize: 92, fontWeight: 900, letterSpacing: 14, textShadow: `0 0 40px rgba(${palette.halo},0.45)` }}>
          优越感，是对<span style={{ color: palette.accent }}>自卑</span>的补偿。
        </div>
        <div style={{ fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim, marginTop: 16 }}>ALFRED ADLER · 1870—1937 · 个体心理学</div>
      </div>

      <Sfx name="whoosh" at={0} volume={0.3} />
      <Sfx name="rise" at={cues[0] + BEAT} volume={0.3} />
      <Sfx name="stamp" at={cues[1]} volume={0.7} />

      <Subtitles lines={lines} cues={cues} duration={duration} hide={[1]} />
    </ObsFrame>
  );
};
