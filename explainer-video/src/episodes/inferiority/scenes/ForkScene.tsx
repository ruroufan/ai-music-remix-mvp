import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Backlit, Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { FigureShape } from "../gilded";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const ORIGIN = { x: 960, y: 900 };
const LEFT = { x: 480, y: 470 };
const RIGHT = { x: 1440, y: 470 };

// Line 0: the road splits.
// Line 1: left, steps up — getting stronger. Right, a stage and a big gold
// cardboard cut-out of a strong man with the real, small person hiding behind it.
export const ForkScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const road = interpolate(frame, [BEAT, 3 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const left = useRamp(cues[1], 10);
  const right = useRamp(cues[1] + 2 * BEAT, 10);
  const climb = interpolate(frame, [cues[1], duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cs = 340 / 260;

  return (
    <ObsFrame duration={duration}>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {[LEFT, RIGHT].map((p, i) => (
          <path
            key={i}
            d={`M${ORIGIN.x} ${ORIGIN.y} Q${ORIGIN.x} ${ORIGIN.y - 220} ${p.x} ${p.y + 220}`}
            fill="none"
            stroke={i === 0 ? palette.accent : "#e6c46a"}
            strokeWidth={4}
            strokeDasharray={900}
            strokeDashoffset={900 * (1 - road)}
            opacity={0.8}
          />
        ))}
      </svg>
      <Backlit x={ORIGIN.x} bottom={ORIGIN.y + 40} height={170} glow={0.7} />

      {/* left: getting stronger */}
      <div style={{ position: "absolute", inset: 0, opacity: left }}>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: LEFT.x - 220 + i * 70, top: LEFT.y + 200 - i * 50, width: 70, height: 10 + i * 50, borderTop: `2px solid ${palette.accent}`, background: `rgba(${palette.accentRgb},0.08)` }} />
        ))}
        <svg width={120 * 0.7} height={260 * 0.7} viewBox="0 0 120 260" style={{ position: "absolute", left: LEFT.x - 220 + climb * 280 - 42, top: LEFT.y + 200 - climb * 200 - 182 }}>
          <FigureShape pose="plain" rim={palette.accent} />
        </svg>
        <div style={{ position: "absolute", left: LEFT.x - 200, top: LEFT.y - 200, fontSize: 56, fontWeight: 900, letterSpacing: 10, color: palette.accent }}>变强</div>
      </div>

      {/* right: looking strong */}
      <div style={{ position: "absolute", inset: 0, opacity: right }}>
        <Halo x={RIGHT.x} y={RIGHT.y + 40} r={300} intensity={0.8} rgb="246,220,138" />
        <svg width={120 * cs} height={260 * cs} viewBox="0 0 120 260" style={{ position: "absolute", left: RIGHT.x - 60 * cs, top: RIGHT.y + 240 - 340 }}>
          <defs>
            <linearGradient id="cutout" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f6dc8a" />
              <stop offset="1" stopColor="#8a6216" />
            </linearGradient>
          </defs>
          <FigureShape pose="proud" fill="url(#cutout)" rim="#fff3c4" />
        </svg>
        {/* the prop stick and the small real person peeking out */}
        <div style={{ position: "absolute", left: RIGHT.x + 60, top: RIGHT.y + 40, width: 8, height: 200, background: "#5a4220", transform: "rotate(-20deg)" }} />
        <svg width={120 * 0.55} height={260 * 0.55} viewBox="0 0 120 260" style={{ position: "absolute", left: RIGHT.x + 110, top: RIGHT.y + 240 - 143 }}>
          <FigureShape pose="hunch" rim="rgba(160,190,230,0.7)" />
        </svg>
        <div style={{ position: "absolute", left: RIGHT.x - 60, top: RIGHT.y - 200, fontSize: 56, fontWeight: 900, letterSpacing: 10, color: "#e6c46a" }}>显得强</div>
        <div style={{ position: "absolute", left: RIGHT.x + 120, top: RIGHT.y + 250, fontFamily: fonts.mono, fontSize: 16, letterSpacing: 3, color: palette.dim }}>CUT-OUT</div>
      </div>

      <Sfx name="whoosh" at={BEAT} volume={0.3} />
      <Sfx name="step" at={cues[1]} volume={0.4} />
      <Sfx name="stamp" at={cues[1] + 2 * BEAT} volume={0.55} />

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
