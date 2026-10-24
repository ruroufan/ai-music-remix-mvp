import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Backlit, Horizon, Mirror } from "../../../channels/backlit/parts";
import { Silhouette } from "../../../components/Figures";
import { palette } from "../../../channels/backlit/look";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, HALF_BEAT, type SceneProps } from "../timing";

const FLOOR = 860;
// An arc of mirrors, each bending you into a different shape.
const MIRRORS = [
  { x: 250, y: 470, sx: 0.7, sy: 1.25, tilt: 28, tint: "255,120,150" },
  { x: 480, y: 420, sx: 1.4, sy: 0.75, tilt: 18, tint: "120,200,255" },
  { x: 720, y: 390, sx: 1, sy: 1, tilt: 8, tint: "255,176,104" },
  { x: 1200, y: 390, sx: 0.8, sy: 1.1, tilt: -8, tint: "180,255,160" },
  { x: 1440, y: 420, sx: 1.25, sy: 0.85, tilt: -18, tint: "200,150,255" },
  { x: 1670, y: 470, sx: 0.65, sy: 1.3, tilt: -28, tint: "255,220,120" },
];
const PLEASED = 2; // the one you please…
const FAILED = 3; // …and the one you let down

export const MirrorsScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const youGlow = interpolate(frame, [cues[2], cues[2] + 4 * BEAT], [1, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lost = useRamp(cues[2] + 2 * BEAT, 2 * BEAT);
  const pleased = useRamp(cues[1] + BEAT, 8);
  const failed = useRamp(cues[1] + 3 * BEAT, 8);
  const allPleased = useRamp(cues[2], 2 * BEAT);

  return (
    <ObsFrame duration={duration}>
      <Horizon y={FLOOR} />
      {MIRRORS.map((m, i) => {
        // mirrors appear one per half beat
        const appear = interpolate(frame, [i * HALF_BEAT, i * HALF_BEAT + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const isPleased = i === PLEASED ? pleased : allPleased;
        const isFailed = i === FAILED ? failed * (1 - allPleased) : 0;
        return (
          <Mirror key={i} x={m.x} y={m.y} w={180} h={380} tilt={m.tilt} opacity={appear} dim={isFailed * 0.6} crack={i === FAILED ? failed : 0}>
            {/* a different you in every glass */}
            <div style={{ position: "absolute", inset: 0, transform: `scale(${m.sx}, ${m.sy})`, transformOrigin: "50% 85%" }}>
              <Silhouette x={90} bottom={340} height={200} fill="#05070a" rim={`rgba(${m.tint},0.9)`} />
            </div>
            {/* their approval */}
            <div style={{ position: "absolute", left: 0, right: 0, top: 26, textAlign: "center", fontSize: 40, fontWeight: 900, color: palette.accent, opacity: isPleased, textShadow: `0 0 12px ${palette.accent}` }}>✓</div>
          </Mirror>
        );
      })}

      {/* you, from behind — and by the end, only an outline is left */}
      <div style={{ opacity: 1 - lost }}>
        <Backlit x={960} bottom={FLOOR + 60} height={300} glow={youGlow} />
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: lost }}>
        <g transform={`translate(${960 - 69} ${FLOOR + 60 - 300}) scale(${300 / 260})`} fill="none" stroke={palette.dim} strokeWidth={2} strokeDasharray="6 7">
          <rect x={38} y={150} width={16} height={110} rx={4} />
          <rect x={66} y={150} width={16} height={110} rx={4} />
          <path d="M22 100 Q22 66 60 66 Q98 66 98 100 L98 170 Q98 178 90 178 L30 178 Q22 178 22 170 Z" />
          <circle cx={60} cy={34} r={28} />
          <text x={60} y={44} textAnchor="middle" fill={palette.dim} stroke="none" fontSize={30} fontWeight={700}>?</text>
        </g>
      </svg>

      {[0, 2, 4].map((i) => (
        <Sfx key={i} name="glint" at={i * HALF_BEAT} volume={0.22} />
      ))}
      <Sfx name="glint" at={cues[1] + BEAT} volume={0.35} />
      <Sfx name="shatter" at={cues[1] + 3 * BEAT} volume={0.45} />
      <Sfx name="whoosh" at={cues[2] + 2 * BEAT} volume={0.35} />

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
