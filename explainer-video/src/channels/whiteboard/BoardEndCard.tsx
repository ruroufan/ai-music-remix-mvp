import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { useEpisode } from "../../EpisodeContext";
import { ink } from "./look";
import { Sketch, Write, rr } from "./sketch";

const RING = rr.circle(960, 330, 120, { seed: 21, rough: 1.4, width: 5 });
const DOT = rr.circle(960, 330, 30, { seed: 22, rough: 1, width: 5, color: ink.red, fill: ink.red, gap: 5 });

// The channel outro, drawn by hand: an aperture, the channel's name, and the
// sign-off written out (three characters a beat) starting at `signoffAt`.
export const BoardEndCard: React.FC<{ opacity: number; start: number; signoffAt: number }> = ({ opacity, start, signoffAt }) => {
  const frame = useCurrentFrame();
  const { brand, timeline } = useEpisode();
  const t = frame - start;
  const ring = interpolate(t, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dot = interpolate(t, [10, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const name = interpolate(t, [14, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const text = brand.signoff ?? "";
  const sign = Math.max(0, Math.min(1, ((frame - signoffAt) / timeline.BEAT) * 3 / [...text].length));
  return (
    <div style={{ position: "absolute", inset: 0, opacity, background: `rgba(247,246,241,${0.92 * Math.min(1, t / 8)})` }}>
      <Sketch strokes={RING} progress={ring} />
      <Sketch strokes={DOT} progress={dot} hand={false} />
      <Write text={brand.channel ?? ""} x={960} y={430} size={84} align="center" progress={name} spacing={0.25} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 540, textAlign: "center", fontSize: 28, color: ink.grey, opacity: name }}>
        {brand.channelLatin} · {brand.series} {brand.topic}
      </div>
      <Write text={text} x={960} y={620} size={46} align="center" progress={sign} color={ink.black} spacing={0.08} />
    </div>
  );
};
