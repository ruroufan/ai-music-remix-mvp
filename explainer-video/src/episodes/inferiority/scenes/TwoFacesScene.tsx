import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo, Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { FigureShape, Gilded } from "../gilded";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const FLOOR = 820;
const H = 320;

// Line 0: two people — one head down, one head up.
// Line 1: they slide together: the same person.
// Line 2: one hides the wound (a dark hand over the crack), one gilds it (a
//         gold label slapped over it).
export const TwoFacesScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const enter = useRamp(0, 10);
  const merge = interpolate(frame, [cues[1], cues[1] + 3 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t * (3 - 2 * t) });
  const hide = useRamp(cues[2] + BEAT, 6);
  const gild = interpolate(frame, [cues[2] + 4 * BEAT - 4, cues[2] + 4 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lx = interpolate(merge, [0, 1], [640, 960]);
  const rx = interpolate(merge, [0, 1], [1280, 960]);
  const s = H / 260;
  const inLine2 = frame >= cues[2];

  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: enter }}>
        <Horizon y={FLOOR} />
        {!inLine2 && (
          <>
            {/* head down */}
            <Halo x={lx} y={FLOOR - H * 0.62} r={H * 0.8} intensity={0.35} rgb="140,170,220" />
            <svg width={120 * s} height={260 * s} viewBox="0 0 120 260" style={{ position: "absolute", left: lx - 60 * s, top: FLOOR - H, opacity: 1 - merge * 0.4 }}>
              <FigureShape pose="hunch" rim="rgba(160,190,230,0.7)" fill={merge > 0.9 ? "none" : "#030405"} />
            </svg>
            {/* head up, labelled */}
            <Gilded x={rx} bottom={FLOOR} height={H} labels={[1, 1, 1, 1]} crack={0} glow={0.8} frame={frame} />
            <div style={{ position: "absolute", left: 640 - 100, top: FLOOR + 30, width: 200, textAlign: "center", fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim, opacity: 1 - merge }}>低着头</div>
            <div style={{ position: "absolute", left: 1280 - 100, top: FLOOR + 30, width: 200, textAlign: "center", fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim, opacity: 1 - merge }}>昂着头</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR + 30, textAlign: "center", fontFamily: fonts.mono, fontSize: 20, letterSpacing: 6, color: palette.accent, opacity: merge }}>SAME PERSON · 同一种人</div>
          </>
        )}
        {inLine2 && (
          <>
            <Gilded x={960} bottom={FLOOR} height={H + 40} pose="plain" labels={[0, gild, 0, 0]} crack={1} crackGlow={1 - gild} frame={frame} />
            {/* the hand that hides it */}
            <div
              style={{
                position: "absolute",
                // centred on the chest crack (figure box coords ≈ 50, 112)
                left: 960 + (50 - 60) * ((H + 40) / 260) - 60,
                top: FLOOR - 270 * ((H + 40) / 260) + 132 * ((H + 40) / 260) - 32,
                width: 120,
                height: 64,
                borderRadius: 30,
                background: "#05070a",
                border: "2px solid rgba(160,190,230,0.6)",
                opacity: hide * (1 - gild),
                transform: "rotate(-14deg)",
              }}
            />
            <div style={{ position: "absolute", left: 960 - 520, top: 420, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim, opacity: hide * (1 - gild) }}>藏 · HIDE</div>
            <div style={{ position: "absolute", left: 960 + 360, top: 420, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: "#e6c46a", opacity: gild }}>贴金 · GILD</div>
          </>
        )}
      </div>

      <Sfx name="whoosh" at={cues[1]} volume={0.3} />
      <Sfx name="glint" at={cues[1] + 3 * BEAT} volume={0.3} />
      <Sfx name="shutter" at={cues[2] + BEAT} volume={0.4} />
      <Sfx name="stamp" at={cues[2] + 4 * BEAT} volume={0.7} />

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
