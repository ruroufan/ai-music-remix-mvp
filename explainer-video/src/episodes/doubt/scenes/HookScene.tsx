import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { palette } from "../../../channels/backlit/look";
import { Person } from "../../solitude/porcupine";
import { FLOOR_Y, LightPool } from "../circles";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const PRAISE = [
  { t: "你真厉害！", x: 420, y: 300 },
  { t: "做得太好了", x: 1340, y: 260 },
  { t: "这次多亏你", x: 360, y: 520 },
  { t: "你是最棒的", x: 1400, y: 480 },
];

// He stands in a wide pool of light, head a little down. Praise comes in from
// the dark, one bubble per beat — and over his head: "他们看错了…".
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.min(PRAISE.length, Math.floor((frame - BEAT) / BEAT) + 1));
  const think = interpolate(frame, [5 * BEAT, 6 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const qs = interpolate(frame, [cues[1], cues[1] + 3 * BEAT], [0.25, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <ObsFrame duration={duration}>
      <LightPool cx={960} rx={430} frame={frame} qs={qs} seed="h" />
      <Person x={960} bottom={FLOOR_Y} height={260} pose="hunch" glow={0.9} />
      {PRAISE.slice(0, n).map((p, i) => {
        const a = interpolate(frame, [BEAT + i * BEAT, BEAT + i * BEAT + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={p.t} style={{ position: "absolute", left: p.x, top: p.y, transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * a})`, opacity: a * (1 - think * 0.5), padding: "10px 24px", borderRadius: 22, background: palette.accent, color: "#06080c", fontSize: 34, fontWeight: 800 }}>
            {p.t}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 960, top: FLOOR_Y - 400, transform: "translateX(-50%)", whiteSpace: "nowrap", opacity: think, padding: "12px 26px", borderRadius: 30, background: "rgba(232,238,242,0.12)", border: "2px dashed rgba(232,238,242,0.5)", fontSize: 36, fontWeight: 800, color: palette.ink }}>他们看错了…</div>
      {PRAISE.map((_, i) => (
        <Sfx key={i} name="glint" at={BEAT + i * BEAT} volume={0.22} />
      ))}
      <Sfx name="glitch" at={5 * BEAT} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
