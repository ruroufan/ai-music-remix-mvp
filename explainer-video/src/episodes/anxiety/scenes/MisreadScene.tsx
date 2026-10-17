import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Backlit, FocusBox, Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, HALF_BEAT, type SceneProps } from "../timing";

const FLOOR = 800;
const DOORS = 12;

// Line 0: re-read the word.
// Line 1: the usual picture: a narrow room, one closed door — no choice.
// Line 2: the walls fall away and doors open on every side, one per half beat.
export const MisreadScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const focus = useRamp(BEAT, 10);
  const word = interpolate(frame, [cues[1] - 6, cues[1]], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const room = useRamp(cues[1], 10);
  const squeeze = interpolate(frame, [cues[1], cues[2]], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fall = useRamp(cues[2], BEAT);
  const wallX = 280 - squeeze * 80;

  return (
    <ObsFrame duration={duration}>
      <div style={{ opacity: word }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontSize: 140, fontWeight: 900, letterSpacing: 40, filter: `blur(${(1 - focus) * 10}px)` }}>焦虑</div>
        <FocusBox x={960} y={450} w={560} h={220} progress={focus} label="RE-THINK" />
      </div>

      {frame >= cues[1] && (
        <div style={{ position: "absolute", inset: 0, opacity: room }}>
          <Horizon y={FLOOR} />
          {/* the narrow room: two walls, closing in */}
          {[-1, 1].map((side) => (
            <div
              key={side}
              style={{
                position: "absolute",
                left: side < 0 ? 960 - wallX - 40 : 960 + wallX,
                top: 220,
                width: 40,
                height: FLOOR - 220,
                background: "#141a24",
                border: `1px solid ${palette.faint}`,
                transformOrigin: side < 0 ? "0% 100%" : "100% 100%",
                transform: `rotate(${side * -fall * 80}deg)`,
                opacity: 1 - fall,
              }}
            />
          ))}
          <div style={{ position: "absolute", left: 960 - 60, top: FLOOR - 230, width: 120, height: 230, border: `2px solid ${palette.faint}`, background: "#0a0e15", opacity: 1 - fall }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 240, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 4, color: palette.dim, opacity: 1 - fall }}>ONE DOOR · 没得选</div>
          {/* every way open */}
          {Array.from({ length: DOORS }, (_, i) => {
            const a = Math.PI * (0.06 + (0.88 * i) / (DOORS - 1));
            const x = 960 - Math.cos(a) * 760;
            const y = FLOOR - 40 - Math.sin(a) * 420;
            const on = interpolate(frame, [cues[2] + BEAT + i * HALF_BEAT, cues[2] + BEAT + i * HALF_BEAT + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const s = 0.55 + Math.sin(a) * 0.35;
            return (
              <div key={i} style={{ position: "absolute", left: x - 45 * s, top: y - 150 * s, width: 90 * s, height: 150 * s, borderRadius: `${45 * s}px ${45 * s}px 0 0`, border: `2px solid rgba(${palette.accentRgb},0.8)`, background: `linear-gradient(rgba(${palette.halo},0.5), rgba(${palette.halo},0.05))`, opacity: on, transform: `scale(${0.6 + on * 0.4})` }} />
            );
          })}
          <Backlit x={960} bottom={FLOOR} height={220} glow={0.5 + fall * 0.5} />
        </div>
      )}

      <Sfx name="shutter" at={BEAT} volume={0.4} />
      <Sfx name="stamp" at={cues[1]} volume={0.35} />
      <Sfx name="shatter" at={cues[2]} volume={0.4} />
      {[0, 4, 8].map((i) => (
        <Sfx key={i} name="glint" at={cues[2] + BEAT + i * HALF_BEAT} volume={0.2} />
      ))}

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
