import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { N_STRINGS, Puppet, Scissors, STRINGS } from "../puppet";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const FLOOR = 800;
const X = 860;
const CUT = 0; // the string he cuts himself: 工作 (from his head)

// 0 · daylight. Still on his strings — but he raises a pair of scissors and,
//     on the beat, cuts one himself. He straightens up in the sun.
// 1 · end card, with the channel sign-off.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const cutAt = 4 * BEAT;
  const raise = interpolate(frame, [BEAT, 3 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * (2 - t) });
  const close = interpolate(frame, [cutAt - 4, cutAt], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const snapped = interpolate(frame, [cutAt, cutAt + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const snap = Array.from({ length: N_STRINGS }, (_, i) => (i === CUT ? snapped : 0));
  const sun = interpolate(frame, [0, cutAt + 2 * BEAT], [0.4, 1], { extrapolateRight: "clamp" });
  const card = useRamp(cues[1], 12);
  // the scissors travel up to the 工作 string, a little above his head
  const sx = X + 70, sy = 380 - raise * 120;
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - card * 0.75 }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 78% 18%, rgba(255,214,140,${0.32 * sun}), transparent 60%)` }} />
        <div style={{ position: "absolute", left: 1460, top: 150, width: 110, height: 110, borderRadius: 55, background: "#ffd9a0", boxShadow: `0 0 ${80 * sun}px rgba(255,200,120,${0.7 * sun})`, opacity: sun }} />
        <Horizon y={FLOOR} />
        <Puppet x={X} bottom={FLOOR} frame={frame} beat={BEAT} snap={snap} jerk={0.35 * (1 - snapped)} glow={0.6 + 0.6 * snapped} labels />
        {frame < cutAt + 2 * BEAT && <Scissors x={sx} y={sy} close={close} rot={-60} size={0.8} />}
        <div style={{ position: "absolute", left: 1200, top: 560, fontFamily: fonts.mono, fontSize: 24, letterSpacing: 6, color: palette.accent, opacity: snapped }}>14:30 · {STRINGS[CUT].label} ✂ · 这一小时属于自己</div>
      </div>
      <EndCard opacity={card} signoffAt={cues[1] + BEAT} />
      <Sfx name="whoosh" at={BEAT} volume={0.3} />
      <Sfx name="shatter" at={cutAt} volume={0.45} />
      <Sfx name="glint" at={cutAt + 2} volume={0.5} />
      <Sfx name="glint" at={cues[1]} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[1]} />
    </ObsFrame>
  );
};
