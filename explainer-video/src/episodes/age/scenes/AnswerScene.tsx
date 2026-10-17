import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const Glass: React.FC<{ x: number; frame: number; k: number; cup: boolean; label: string; color: string }> = ({ x, frame, k, cup, label, color }) => (
  <div style={{ position: "absolute", inset: 0 }}>
    <svg width={260} height={380} viewBox="-130 -190 260 380" style={{ position: "absolute", left: x - 130, top: 200 }}>
      <rect x={-100} y={-190} width={200} height={14} rx={4} fill="#3a4456" />
      <rect x={-100} y={176} width={200} height={14} rx={4} fill="#3a4456" />
      <path d="M-80 -176 L80 -176 L10 0 L80 176 L-80 176 L-10 0 Z" fill="rgba(200,220,240,0.06)" stroke="rgba(200,220,240,0.45)" strokeWidth={2} />
      <path d={`M${-70 + 60 * k} ${-160 + 150 * k} L${70 - 60 * k} ${-160 + 150 * k} L8 -6 L-8 -6 Z`} fill={color} />
      {cup ? <path d={`M-72 172 L72 172 L${60 - 40 * k} ${172 - 120 * k} L${-60 + 40 * k} ${172 - 120 * k} Z`} fill={color} /> : null}
      <line x1={0} y1={0} x2={0} y2={cup ? 170 : 190} stroke={color} strokeWidth={3} strokeDasharray="4 6" strokeDashoffset={-frame * 2} />
    </svg>
    {!cup && Array.from({ length: Math.floor(k * 50) }, (_, i) => (
      <div key={i} style={{ position: "absolute", left: x - 6 + (random(`gx-${i}`) - 0.5) * 220, top: 600 + random(`gy-${i}`) * 30 + ((frame + i * 7) % 40), width: 4, height: 4, borderRadius: 2, background: color, opacity: 0.5 }} />
    ))}
    <div style={{ position: "absolute", left: x - 160, width: 320, top: 640, textAlign: "center", fontSize: 34, fontWeight: 800, color }}>{label}</div>
  </div>
);

// 0 · time passing: just an hourglass.
// 1 · two: on the left the sand fills a cup — 活过的; on the right it falls
//     straight through and scatters on the floor — 白白流逝. That's the fear.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [0, duration], [0.15, 0.75]);
  const two = interpolate(frame, [cues[1], cues[1] + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${-two * 360}px)` }}>
        <Glass x={960} frame={frame} k={k} cup label={two > 0.5 ? "活过的" : "时间流逝"} color={`rgb(${palette.halo})`} />
      </div>
      {two > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: two, transform: `translateX(${(1 - two) * 200}px)` }}>
          <Glass x={1320} frame={frame} k={k} cup={false} label="白白流逝" color={palette.alert} />
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: 130, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: two }}>我们怕的是 →</div>
      <Sfx name="whoosh" at={cues[1]} volume={0.35} />
      <Sfx name="stamp" at={cues[1] + 2 * BEAT} volume={0.4} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
