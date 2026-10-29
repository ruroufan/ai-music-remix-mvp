import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { BoardFrame } from "./BoardFrame";
import { ink } from "./look";
import { Sketch, Write, rr } from "./sketch";
import { useEpisode } from "../../EpisodeContext";
import type { SceneProps } from "../../types";

// The one-line question, written large by hand and underlined twice.
export const BoardQuestion: React.FC<SceneProps> = ({ lines, duration }) => {
  const frame = useCurrentFrame();
  const { timeline } = useEpisode();
  const text = lines[0].text;
  const w = interpolate(frame, [2, 2 + [...text].length * (timeline.HALF_BEAT / 2)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const u = interpolate(frame, [duration - 3 * timeline.BEAT, duration - 2 * timeline.BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const n = [...text].length;
  const half = (n * 80 * 1.04) / 2;
  return (
    <BoardFrame duration={duration}>
      <Write text={text} x={960} y={440} size={80} align="center" progress={w} />
      <Sketch strokes={UNDER(960 - half, 960 + half)} progress={u} />
    </BoardFrame>
  );
};
const cache: Record<string, ReturnType<typeof rr.line>> = {};
const UNDER = (a: number, b: number) => (cache[`${a}`] ??= [...rr.line(a, 560, b, 556, { seed: 31, color: ink.red, width: 6 }), ...rr.line(a + 40, 576, b - 20, 574, { seed: 32, color: ink.red, width: 5 })]);
