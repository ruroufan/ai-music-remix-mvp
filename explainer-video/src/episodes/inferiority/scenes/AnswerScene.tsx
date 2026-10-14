import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Backlit, Halo, Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Gilded, FloorShadow } from "../gilded";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const FLOOR = 800;

// Line 0: the labelled figure keeps asking to be confirmed — "确认?" on every beat.
// Line 1: next to it, someone holding a small steady light. No labels, no checks.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const enter = useRamp(0, 8);
  const beatIdx = Math.floor(frame / BEAT);
  const sinceBeat = (frame % BEAT) / BEAT;
  const calm = useRamp(cues[1], 2 * BEAT);
  const leftX = interpolate(calm, [0, 1], [960, 620]);

  return (
    <ObsFrame duration={duration}>
      <Horizon y={FLOOR} />
      <div style={{ position: "absolute", inset: 0, opacity: enter * (1 - calm * 0.55) }}>
        <FloorShadow x={leftX} floor={FLOOR} height={280} opacity={0.8} />
        <Gilded x={leftX} bottom={FLOOR} height={400} labels={[1, 1, 1, 1]} crack={1} crackGlow={0.3} shake={0.5} frame={frame} />
        {/* "confirm?" popping on every beat, around the labels */}
        {frame < duration - 6 && (
          <div
            style={{
              position: "absolute",
              left: leftX + (beatIdx % 2 ? 110 : -230),
              top: 300 + (beatIdx % 3) * 110,
              fontFamily: fonts.mono,
              fontSize: 24,
              letterSpacing: 3,
              color: "#e6c46a",
              opacity: 1 - sinceBeat,
              transform: `translateY(${-sinceBeat * 20}px)`,
            }}
          >
            确认？✓
          </div>
        )}
      </div>

      <div style={{ position: "absolute", inset: 0, opacity: calm }}>
        <Backlit x={1300} bottom={FLOOR} height={330} glow={1} />
        <Halo x={1300} y={FLOOR - 170} r={70} intensity={1.6} />
        <div style={{ position: "absolute", left: 1300 - 14, top: FLOOR - 184, width: 28, height: 28, borderRadius: 14, background: "#fff3dc", boxShadow: `0 0 30px 10px rgba(${palette.halo},0.8)` }} />
      </div>

      <Sfx name="glint" at={cues[1]} volume={0.35} />
      <Sfx name="whoosh" at={cues[1]} volume={0.25} />

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
