import React from "react";
import { palette } from "./look";

// A person in profile-less silhouette, in a 120×260 box (same proportions as
// components/Figures' Silhouette), with three postures.
export type Pose = "plain" | "proud" | "hunch";

const HEAD: Record<Pose, { cx: number; cy: number }> = {
  plain: { cx: 60, cy: 34 },
  proud: { cx: 64, cy: 28 }, // chin up
  hunch: { cx: 70, cy: 52 }, // head down and forward
};
const BODY: Record<Pose, string> = {
  plain: "M22 100 Q22 66 60 66 Q98 66 98 100 L98 170 Q98 178 90 178 L30 178 Q22 178 22 170 Z",
  proud: "M20 98 Q22 62 60 62 Q100 62 100 98 L98 170 Q98 178 90 178 L30 178 Q22 178 22 170 Z",
  hunch: "M28 112 Q30 78 70 84 Q100 92 96 120 L92 172 Q92 178 84 178 L36 178 Q28 178 30 170 Z",
};

export const FigureShape: React.FC<{ pose?: Pose; fill?: string; rim?: string; rimWidth?: number }> = ({
  pose = "plain",
  fill = "#030405",
  rim = `rgba(${palette.halo},0.9)`,
  rimWidth = 1.8,
}) => {
  const h = HEAD[pose];
  return (
    <g fill={fill} stroke={rim} strokeWidth={rimWidth}>
      <rect x={38} y={150} width={16} height={110} rx={4} />
      <rect x={66} y={150} width={16} height={110} rx={4} />
      <path d={BODY[pose]} />
      <circle cx={h.cx} cy={h.cy} r={28} />
    </g>
  );
};

