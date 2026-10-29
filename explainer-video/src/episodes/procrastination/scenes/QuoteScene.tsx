import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// The quote, and an hourglass with a crack: most of the sand never reaches
// the lower bulb — it pours out onto the floor.
export const QuoteScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const card = useRamp(0, 10);
  const spill = interpolate(frame, [BEAT, 10 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <ObsFrame duration={duration}>
      <Halo x={960} y={300} r={460} intensity={0.4} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 160, textAlign: "center", opacity: card }}>
        <div style={{ fontSize: 34, color: palette.dim, fontWeight: 700, letterSpacing: 8 }}>塞涅卡说</div>
        <div style={{ fontSize: 78, fontWeight: 900, letterSpacing: 6, marginTop: 20 }}>
          不是生命太短，是我们<span style={{ color: palette.alert }}>浪费</span>得太多。
        </div>
        <div style={{ fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim, marginTop: 20 }}>SENECA · DE BREVITATE VITAE · c. AD 49</div>
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: card }}>
        <g transform="translate(960 600)">
          <rect x={-70} y={-110} width={140} height={10} rx={3} fill="#6b4a26" />
          <rect x={-70} y={100} width={140} height={10} rx={3} fill="#6b4a26" />
          <path d="M-52 -100 L52 -100 L6 0 L52 100 L-52 100 L-6 0 Z" fill="rgba(200,220,240,0.08)" stroke="rgba(200,220,240,0.5)" strokeWidth={2} />
          <path d={`M${-44 + 36 * spill} ${-90 + 80 * spill} L${44 - 36 * spill} ${-90 + 80 * spill} L5 -4 L-5 -4 Z`} fill="#e3c58a" />
          <path d="M-46 96 L46 96 L40 84 L-40 84 Z" fill="#e3c58a" />
          <path d="M8 -8 L28 -2 L22 10" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={1.5} />
          <path d={`M22 4 Q60 40 ${90 + spill * 30} 160`} fill="none" stroke="#e3c58a" strokeWidth={3} strokeDasharray="4 6" strokeDashoffset={-frame * 2} />
        </g>
        {Array.from({ length: Math.floor(spill * 70) }, (_, i) => (
          <circle key={i} cx={1060 + (random(`sx-${i}`) - 0.3) * 260 * spill} cy={765 - random(`sy-${i}`) * 18 * spill} r={2.4} fill="#e3c58a" opacity={0.8} />
        ))}
      </svg>
      <div style={{ position: "absolute", left: 1150, top: 700, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.alert, opacity: spill }}>浪费 {Math.round(spill * 100)}%</div>
      <Sfx name="stamp" at={0} volume={0.6} />
      <Sfx name="glitch" at={BEAT} volume={0.25} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[0]} />
    </ObsFrame>
  );
};
