import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { GOLD, RED } from "../ring";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// Two plinths. On the left, the trophy he can win: 辩论 ✓. On the right, the
// other one — an empty dashed outline where a light should be: 真理 —
// and the 38 tricks bounce off it.
export const TurnScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const won = ramp(frame, BEAT, 8);
  const empty = ramp(frame, 4 * BEAT, 10);
  const pulse = 0.5 + 0.5 * Math.sin((frame / BEAT) * Math.PI);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} hits={[BEAT, 4 * BEAT, ...keyHits(lines, cues, duration)]}>
        <Halo x={620} y={460} r={260} intensity={0.5 * won} rgb={GOLD} />
        {[620, 1300].map((x) => (
          <div key={x} style={{ position: "absolute", left: x - 140, top: 640, width: 280, height: 200, background: "#16141a", border: `2px solid rgba(${GOLD},0.25)` }} />
        ))}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: won }}>
          <path d="M520 330 L720 330 Q720 480 620 510 Q520 480 520 330 Z" fill={`rgba(${GOLD},0.85)`} stroke={`rgb(${GOLD})`} strokeWidth={4} />
          <rect x={600} y={510} width={40} height={80} fill={`rgba(${GOLD},0.7)`} />
          <rect x={550} y={590} width={140} height={40} rx={5} fill={`rgba(${GOLD},0.7)`} />
        </svg>
        <div style={{ position: "absolute", left: 470, width: 300, top: 680, textAlign: "center", fontSize: 44, fontWeight: 900, color: palette.ink, opacity: won }}>
          辩论 <span style={{ color: `rgb(${GOLD})` }}>✓</span>
        </div>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: empty }}>
          <circle cx={1300} cy={470} r={130} fill="none" stroke={`rgba(232,238,242,${0.35 + 0.25 * pulse})`} strokeWidth={4} strokeDasharray="14 12" />
        </svg>
        <div style={{ position: "absolute", left: 1150, width: 300, top: 680, textAlign: "center", fontSize: 44, fontWeight: 900, color: palette.dim, opacity: empty }}>
          真理 <span style={{ color: `rgb(${RED})` }}>✕</span>
        </div>
        <div style={{ position: "absolute", left: 1150, width: 300, top: 440, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 6, color: palette.faint, opacity: empty }}>EMPTY</div>
        {/* the tricks, bouncing off the empty slot */}
        {Array.from({ length: 6 }, (_, i) => {
          const at = 5 * BEAT + i * 8;
          const t = interpolate(frame, [at, at + 20], [0, 1], clamp);
          if (t <= 0 || t >= 1) return null;
          const x = 900 + 260 * Math.min(1, t * 2) - (t > 0.5 ? (t - 0.5) * 500 : 0);
          const y = 300 + i * 50 + (t > 0.5 ? (t - 0.5) * 300 : 0);
          return <div key={i} style={{ position: "absolute", left: x, top: y, fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, color: `rgb(${RED})`, opacity: 1 - t }}>#{[3, 8, 12, 19, 27, 38][i]}</div>;
        })}
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} opacity={0.45} />
      <Sfx name="glint" at={BEAT} volume={0.45} />
      <Sfx name="boom" at={4 * BEAT} volume={0.3} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
