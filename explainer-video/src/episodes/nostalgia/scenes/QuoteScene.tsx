import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { SEPIA, Walker } from "../road";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// The quote again, with a figure under it who looks back over his shoulder —
// and then turns to face the way he has to go.
export const QuoteScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const card = useRamp(0, 10);
  const turn = frame >= 6 * BEAT;
  const fwd = interpolate(frame, [6 * BEAT, 8 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <ObsFrame duration={duration}>
      <Halo x={960} y={330} r={460} intensity={0.4} rgb={SEPIA} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", opacity: card }}>
        <div style={{ fontSize: 34, color: palette.dim, fontWeight: 700, letterSpacing: 8 }}>克尔凯郭尔说</div>
        <div style={{ fontSize: 76, fontWeight: 900, letterSpacing: 6, marginTop: 18, lineHeight: 1.45 }}>
          人生只能<span style={{ color: `rgb(${SEPIA})` }}>向后</span>理解，<br />却必须<span style={{ color: palette.accent }}>向前</span>生活。
        </div>
      </div>
      <Walker x={960} bottom={800} height={190} face={turn ? "right" : "left"} walk={turn ? Math.PI / 2 + fwd * Math.PI : 0} glow={turn ? 0.6 + 0.6 * fwd : 0.5} rgb={turn ? palette.accentRgb : SEPIA} />
      <div style={{ position: "absolute", left: 640, top: 690, fontFamily: fonts.mono, fontSize: 22, color: `rgb(${SEPIA})`, opacity: turn ? 0.3 : 1 }}>← 理解</div>
      <div style={{ position: "absolute", left: 1170, top: 690, fontFamily: fonts.mono, fontSize: 22, color: palette.accent, opacity: turn ? 1 : 0.3 }}>生活 →</div>
      <Sfx name="stamp" at={0} volume={0.55} />
      <Sfx name="whoosh" at={6 * BEAT} volume={0.4} />
      <Sfx name="step" at={7 * BEAT} volume={0.35} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[0]} />
    </ObsFrame>
  );
};
