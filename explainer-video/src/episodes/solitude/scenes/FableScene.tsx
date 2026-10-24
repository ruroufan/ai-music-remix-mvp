import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Herd, Snowfield } from "../porcupine";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const GROUND = 720;
const ease = (t: number) => t * t * (3 - 2 * t);

// 0 · winter: they start apart and shivering, huddle up — and the quills go in.
// 1 · they spring apart; it's freezing.
// 2 · in, out, in, out: once every two beats.
// 3 · they settle at a middle distance; a measuring line: not too cold, not too painful.
export const FableScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  let gap: number;
  if (frame < cues[1]) gap = 1 - ease(interpolate(frame, [BEAT, 4 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  else if (frame < cues[2]) gap = ease(interpolate(frame, [cues[1], cues[1] + BEAT], [0, 1], { extrapolateRight: "clamp" }));
  else if (frame < cues[3]) {
    const t = ((frame - cues[2]) % (2 * BEAT)) / (2 * BEAT);
    gap = 0.5 + 0.5 * Math.cos(t * Math.PI * 2); // 1 → 0 → 1 every two beats
  } else gap = interpolate(frame, [cues[3], cues[3] + 2 * BEAT], [1, 0.42], { extrapolateRight: "clamp", easing: ease });

  const settled = interpolate(frame, [cues[3] + 2 * BEAT, cues[3] + 3 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const temp = Math.round(interpolate(gap, [0, 1], [18, -16]));
  const pain = Math.round(Math.max(0, (0.22 - gap) / 0.22) * 100);
  const spacing = 1.25 * (96 + 0.42 * 190);

  return (
    <ObsFrame duration={duration}>
      <Snowfield frame={frame} ground={GROUND}>
        <Herd frame={frame} cx={960} ground={GROUND} gap={gap} />
      </Snowfield>
      {/* readouts */}
      <div style={{ position: "absolute", left: 150, top: 150, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: palette.dim, lineHeight: 1.8 }}>
        <div>
          体温 <span style={{ color: temp < 0 ? "rgb(150,200,255)" : `rgb(${palette.halo})`, fontSize: 30 }}>{temp > 0 ? "+" : ""}{temp}°</span>
        </div>
        <div>
          刺痛 <span style={{ color: palette.alert, fontSize: 30 }}>{pain}%</span>
        </div>
      </div>
      {/* the settled distance */}
      {settled > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: settled }}>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <line x1={960 - spacing / 2} y1={GROUND + 40} x2={960 + spacing / 2} y2={GROUND + 40} stroke={palette.accent} strokeWidth={2} />
            <line x1={960 - spacing / 2} y1={GROUND + 28} x2={960 - spacing / 2} y2={GROUND + 52} stroke={palette.accent} strokeWidth={2} />
            <line x1={960 + spacing / 2} y1={GROUND + 28} x2={960 + spacing / 2} y2={GROUND + 52} stroke={palette.accent} strokeWidth={2} />
          </svg>
          <div style={{ position: "absolute", left: 0, right: 0, top: 440, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 6, color: palette.accent }}>不太冷 · 不太痛</div>
        </div>
      )}
      <Sfx name="whoosh" at={BEAT} volume={0.25} />
      {[4, 5, 6].map((k) => (
        <Sfx key={k} name="glitch" at={k * BEAT} volume={0.3} />
      ))}
      <Sfx name="whoosh" at={cues[1]} volume={0.35} />
      {[0, 1, 2].map((k) => (
        <Sfx key={`c${k}`} name="glitch" at={cues[2] + k * 2 * BEAT + BEAT} volume={0.25} />
      ))}
      <Sfx name="glint" at={cues[3] + 2 * BEAT} volume={0.4} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
