import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { palette } from "../../../channels/backlit/look";
import { Crowd, HERO, Person, Prick } from "../porcupine";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

// 0 · the usual equation: alone = nobody around. One person in empty space.
// 1 · the crowd floods in and squeezes; the equation gets corrected:
//     alone = packed in together. Little pricks where shoulders touch.
export const MisreadScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const t1 = frame - cues[1];
  const count = t1 < 0 ? 0 : Math.min(31, Math.floor(t1 / 3) * 2 + 2);
  const strike = interpolate(t1, [2 * BEAT, 2 * BEAT + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fix = interpolate(t1, [3 * BEAT, 3 * BEAT + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const squeeze = interpolate(t1, [BEAT, 4 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <ObsFrame duration={duration}>
      <Crowd frame={frame} count={count} squeeze={squeeze} />
      <Person x={HERO.x} bottom={HERO.bottom} height={HERO.height} glow={0.8 - squeeze * 0.4} />
      {squeeze > 0.6 &&
        [-1, 1].map((d) => <Prick key={d} x={HERO.x + d * 130} y={HERO.bottom - 170} k={(squeeze - 0.6) * 2.5 * (0.6 + 0.4 * Math.abs(Math.sin(frame / 4 + d)))} />)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", fontSize: 64, fontWeight: 900, letterSpacing: 8 }}>
        <span style={{ display: "inline-block", padding: "6px 24px", background: "rgba(6,8,12,0.75)" }}>
          孤独 ={" "}
          <span style={{ position: "relative", color: strike > 0 ? palette.dim : palette.ink }}>
            身边没人
            <span style={{ position: "absolute", left: 0, top: "52%", height: 6, width: `${strike * 100}%`, background: palette.alert }} />
          </span>
          {fix > 0 && <span style={{ color: palette.accent, opacity: fix, marginLeft: 24 }}>挤在一起</span>}
          {frame < cues[1] && <span style={{ color: palette.accent, marginLeft: 12 }}>?</span>}
        </span>
      </div>
      <Sfx name="shutter" at={BEAT} volume={0.3} />
      <Sfx name="rise" at={cues[1]} volume={0.35} />
      <Sfx name="stamp" at={cues[1] + 2 * BEAT} volume={0.55} />
      <Sfx name="glint" at={cues[1] + 3 * BEAT} volume={0.35} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
