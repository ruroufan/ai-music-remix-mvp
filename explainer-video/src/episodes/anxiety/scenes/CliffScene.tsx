import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { CliffSide, PathField, Vertigo } from "../paths";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// The parable, in five lines:
// 0–1  side view: a person on the edge, leaning to look down;
// 2–4  their point of view, straight down onto the paths — the camera spins,
//      pushes and pulls, and splits into colour fringes, harder every line.
export const CliffScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const draw = useRamp(0, 4 * BEAT);
  const lean = interpolate(frame, [cues[1], cues[1] + 2 * BEAT], [0, 6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sideStrength = interpolate(frame, [cues[1], cues[2]], [0, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pov = frame >= cues[2];
  // spin speeds up line by line; strength ramps 0.4 → 1
  const spin = interpolate(frame, [cues[2], duration], [0, 300], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t });
  const strength = interpolate(frame, [cues[2], cues[3], cues[4], duration], [0.35, 0.55, 0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const beatPulse = Math.max(0, 1 - (frame % BEAT) / 7);
  // dolly: the field rushes toward you on every other beat in the last line
  const rush = frame >= cues[4] ? 1 + beatPulse * 0.08 : 1;
  const jump = useRamp(cues[3] + 2 * BEAT, 2 * BEAT);

  return (
    <ObsFrame duration={duration}>
      {!pov && (
        <Vertigo strength={sideStrength} frame={frame} origin="760px 560px">
          <CliffSide edge={{ x: 820, y: 560 }} lean={lean} draw={draw} frame={frame} />
        </Vertigo>
      )}
      {pov && (
        <>
          <Vertigo strength={strength} frame={frame} spin={spin}>
            <PathField cx={960} cy={500} scale={1.25 * rush} pulse={beatPulse} />
          </Vertigo>
          {/* the toes of the ledge at the bottom of your view */}
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <path d="M0 1080 L0 930 L240 900 L520 935 L760 905 L1040 940 L1300 900 L1600 930 L1920 915 L1920 1080 Z" fill="#0c1018" stroke={`rgba(${palette.halo},0.4)`} strokeWidth={2} />
          </svg>
          {/* "if I wanted to…" — a dotted line down into the void */}
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: jump * (frame < cues[4] ? 1 : 0.4) }}>
            <path d="M960 920 Q960 700 960 500" fill="none" stroke={palette.alert} strokeWidth={3} strokeDasharray="10 12" strokeDashoffset={-frame * 2} />
          </svg>
          <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", fontFamily: fonts.mono, fontSize: 20, letterSpacing: 8, color: palette.dim, opacity: frame >= cues[4] ? 1 : 0 }}>
            EVERYTHING IS POSSIBLE
          </div>
        </>
      )}

      <Sfx name="whoosh" at={0} volume={0.25} />
      <Sfx name="step" at={cues[1]} volume={0.4} />
      <Sfx name="whoosh" at={cues[2]} volume={0.45} />
      <Sfx name="rise" at={cues[3]} volume={0.35} />
      <Sfx name="glitch" at={cues[4]} volume={0.45} />
      <Sfx name="rise" at={duration - 3 * BEAT} volume={0.4} />

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
