import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Crowd, HERO, Person } from "../porcupine";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

// 0 · the one in the middle still has quills. Beat by beat they fold away —
//     and then the outline goes with them: everyone is sharp except him.
// 1 · two tags: the one who fits in — present ✓; the real you — absent ✕.
export const CrowdScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const spikes = interpolate(frame, [BEAT, 5 * BEAT], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const stepped = Math.ceil(spikes * 4) / 4; // folds away in four steps, on the beat
  const ghost = interpolate(frame, [5 * BEAT, 8 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tag1 = interpolate(frame, [cues[1] + BEAT, cues[1] + BEAT + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tag2 = interpolate(frame, [cues[1] + 3 * BEAT, cues[1] + 3 * BEAT + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <ObsFrame duration={duration}>
      <Crowd frame={frame} chatter={0.8} />
      <Person x={HERO.x} bottom={HERO.bottom} height={HERO.height} spikes={stepped} ghost={ghost} glow={0.9} />
      <div style={{ position: "absolute", left: HERO.x + 120, top: 360, opacity: tag1, padding: "10px 18px", border: `1px solid ${palette.accent}`, background: "rgba(6,8,12,0.85)", fontSize: 30, fontWeight: 700 }}>
        合群的人 · <span style={{ color: palette.accent }}>在场 ✓</span>
      </div>
      <div style={{ position: "absolute", left: HERO.x + 120, top: 440, opacity: tag2, padding: "10px 18px", border: `1px dashed ${palette.alert}`, background: "rgba(6,8,12,0.85)", fontSize: 30, fontWeight: 700 }}>
        真正的你 · <span style={{ color: palette.alert }}>缺席 ✕</span>
      </div>
      <div style={{ position: "absolute", left: HERO.x - 60, top: HERO.bottom - HERO.height - 60, fontFamily: fonts.mono, fontSize: 18, letterSpacing: 4, color: palette.dim, opacity: ghost }}>OPACITY {Math.round((1 - ghost * 0.85) * 100)}%</div>
      {[1, 2, 3, 4].map((k) => (
        <Sfx key={k} name="shutter" at={k * BEAT} volume={0.25} />
      ))}
      <Sfx name="glitch" at={5 * BEAT} volume={0.35} />
      <Sfx name="stamp" at={cues[1] + BEAT} volume={0.4} />
      <Sfx name="stamp" at={cues[1] + 3 * BEAT} volume={0.55} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
