import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bubble, FallenMask, MaskedFigure, Scale } from "../mask";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const FLOOR = 800;
const HERO = 520;
export const MASK_REST = { x: HERO + 70, floor: FLOOR };

// 0 · the scale: his own weight (我) on one pan, everyone else on the other,
//     teetering. He lifts his weight off — and as it leaves the pan, the mask
//     comes loose and drops. The scale stops mattering.
// 1 · praise comes; he says thank you. That's all.
export const ScaleScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const liftAt = 5 * BEAT;
  const lift = interpolate(frame, [liftAt, liftAt + 2 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t * (3 - 2 * t) });
  const fall = interpolate(frame, [liftAt + 2 * BEAT, liftAt + 3 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const teeter = Math.sin((frame / BEAT) * Math.PI) * 9 * (1 - lift);
  const tilt = teeter + lift * 16;
  const fade = interpolate(frame, [liftAt + 3 * BEAT, cues[1]], [1, 0.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t1 = frame - cues[1];
  return (
    <ObsFrame duration={duration}>
      <Horizon y={FLOOR} />
      <Scale x={1200} y={330} tilt={tilt} left={["我"]} right={["别人", "评价"]} lift={lift} liftTo={{ x: HERO + 90, y: FLOOR - 140 }} opacity={fade} />
      <MaskedFigure x={HERO} bottom={FLOOR} height={270} xray={frame < liftAt ? 0.45 : 0.45 * (1 - fall)} fall={fall} glow={0.6 + fall * 0.6} mask={fall >= 1 ? 0 : 1} />
      {fall >= 1 && <FallenMask x={MASK_REST.x} floor={MASK_REST.floor} />}
      <div style={{ position: "absolute", left: 1000, top: 760 - 600, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 6, color: palette.dim, opacity: fade }}>不需要上天平</div>
      {t1 >= BEAT && <Bubble x={1150} y={520} text="你真厉害！" tone="praise" size={38} pop={Math.min(1, (t1 - BEAT) / 4)} />}
      {t1 >= 2 * BEAT && <Bubble x={HERO + 40} y={490} text="谢谢。" tone="reply" size={40} pop={Math.min(1, (t1 - 2 * BEAT) / 4)} />}
      {t1 >= 3 * BEAT && <div style={{ position: "absolute", left: HERO + 210, top: 400, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: palette.accent }}>✓ 就够了</div>}
      <Sfx name="whoosh" at={liftAt} volume={0.35} />
      <Sfx name="shatter" at={liftAt + 3 * BEAT} volume={0.35} />
      <Sfx name="boom" at={liftAt + 3 * BEAT} volume={0.35} />
      <Sfx name="glint" at={cues[1] + BEAT} volume={0.3} />
      <Sfx name="glint" at={cues[1] + 2 * BEAT} volume={0.45} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
