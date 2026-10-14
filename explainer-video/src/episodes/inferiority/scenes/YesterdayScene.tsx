import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Backlit, Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { FigureShape } from "../gilded";
import { Silhouette } from "../../../components/Figures";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const FLOOR = 820;
const YESTERDAY = { x: 760, h: 280 };
const TODAY = { x: 1160, h: 300 };

// Other people fade out; what is left is you and yesterday's you, and a ruler
// between you.
export const YesterdayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const others = interpolate(frame, [cues[0] + 3 * BEAT, cues[0] + 5 * BEAT], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pair = useRamp(cues[0] + 2 * BEAT, 10);
  const ruler = useRamp(cues[0] + 5 * BEAT, 2 * BEAT);
  const ys = YESTERDAY.h / 260;
  const delta = TODAY.h - YESTERDAY.h;

  return (
    <ObsFrame duration={duration}>
      <Horizon y={FLOOR} />
      <div style={{ opacity: others }}>
        {[260, 420, 1540, 1700].map((x, i) => (
          <Silhouette key={x} x={x} bottom={FLOOR} height={260 + (i % 2) * 70} fill="#05070a" rim="rgba(232,238,242,0.25)" />
        ))}
        <div style={{ position: "absolute", left: 200, top: 400, fontFamily: fonts.mono, fontSize: 16, letterSpacing: 3, color: palette.dim }}>OTHERS</div>
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: pair }}>
        {/* yesterday: an outline */}
        <svg width={120 * ys} height={260 * ys} viewBox="0 0 120 260" style={{ position: "absolute", left: YESTERDAY.x - 60 * ys, top: FLOOR - YESTERDAY.h }}>
          <g strokeDasharray="5 6">
            <FigureShape pose="plain" fill="none" rim={palette.dim} rimWidth={2} />
          </g>
        </svg>
        <Backlit x={TODAY.x} bottom={FLOOR} height={TODAY.h} />
        <div style={{ position: "absolute", left: YESTERDAY.x - 100, top: FLOOR + 30, width: 200, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 4, color: palette.dim }}>昨天 · YESTERDAY</div>
        <div style={{ position: "absolute", left: TODAY.x - 100, top: FLOOR + 30, width: 200, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 4, color: palette.accent }}>今天 · TODAY</div>
      </div>
      {/* the ruler */}
      <div style={{ position: "absolute", inset: 0, opacity: ruler }}>
        <div style={{ position: "absolute", left: 960 - 1, top: FLOOR - TODAY.h - 20, width: 2, height: TODAY.h + 20, background: palette.faint }} />
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: 960 - (i % 4 === 0 ? 14 : 7), top: FLOOR - i * 26, width: i % 4 === 0 ? 28 : 14, height: 2, background: palette.faint }} />
        ))}
        {[YESTERDAY.h, TODAY.h].map((h, i) => (
          <div key={h} style={{ position: "absolute", left: i ? 960 : YESTERDAY.x, top: FLOOR - h, width: i ? TODAY.x - 960 : 960 - YESTERDAY.x, height: 0, borderTop: `2px dashed ${i ? palette.accent : palette.dim}` }} />
        ))}
        <div style={{ position: "absolute", left: 980, top: FLOOR - TODAY.h - 4, fontFamily: fonts.mono, fontSize: 22, color: palette.accent, transform: "translateY(-100%)" }}>+{delta}</div>
      </div>

      <Sfx name="whoosh" at={cues[0] + 3 * BEAT} volume={0.3} />
      <Sfx name="glint" at={cues[0] + 5 * BEAT} volume={0.35} />
      <Sfx name="glint" at={cues[0] + 7 * BEAT} volume={0.3} />

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
