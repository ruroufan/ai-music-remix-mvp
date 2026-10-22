import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Walker } from "../../nostalgia/road";
import { Bokeh, Cam } from "../../glass/immersive";
import { BP, Blueprint, RED } from "../blueprint";
import { ImpactBack, ImpactFront, keyHits } from "../impact";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FLOOR = 760;

// 0 · the blueprint draws itself, wall by wall, and every room gets its ✓;
//     he stands beside it, explaining.
// 1 · the three people he's explaining it to turn and walk off; 正确率 100%,
//     听的人 0.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const draw = interpolate(frame, [0, 6 * BEAT], [0, 1], clamp);
  const checks = interpolate(frame, [5 * BEAT, 8 * BEAT], [0, 1], clamp);
  const leave = (i: number) => Math.max(0, frame - c1 - i * 6);
  const listeners = 3 - [0, 1, 2].filter((i) => leave(i) > 10).length;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.08]} focus={{ x: 800, y: 480 }} hits={[...[8 * BEAT, c1], ...keyHits(lines, cues, duration)]}>
        <Blueprint x={170} y={170} w={880} frame={frame} draw={draw} checks={checks} />
        <Stander x={1170} bottom={FLOOR} height={300} lift={1.6} glow={0.8} rgb={BP} />
        {/* he's talking */}
        {[0, 1, 2].map((k) => {
          const t = (frame / 18 + k / 3) % 1;
          return <div key={k} style={{ position: "absolute", left: 1205 + 40 * t, top: FLOOR - 300 - 20 * t, width: 30 + 40 * t, height: 40 + 40 * t, borderRadius: "50%", borderRight: `3px solid rgba(${BP},${1 - t})` }} />;
        })}
        {[0, 1, 2].map((i) => {
          const l = leave(i);
          return <Walker key={i} x={1430 + i * 140 + l * 3} bottom={FLOOR} height={250} face="right" walk={l > 0 ? l * 0.2 : 0} glow={0.5} opacity={Math.max(0, 1 - l / 80)} />;
        })}
        <div style={{ position: "absolute", left: 1300, top: 170, fontFamily: fonts.mono, fontSize: 24, letterSpacing: 3, color: palette.dim, lineHeight: 1.8 }}>
          <div>
            正确率 <span style={{ color: "#7fe0a0", fontSize: 34 }}>{Math.round(checks * 100)}%</span>
          </div>
          <div>
            听的人 <span style={{ color: listeners < 3 ? `rgb(${RED})` : palette.ink, fontSize: 34 }}>{listeners}</span>
          </div>
        </div>
      </Cam>
      <Bokeh frame={frame} rgb={BP} />
      <Sfx name="rise" at={0} volume={0.2} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Sfx key={i} name="stamp" at={Math.round(5 * BEAT + (i * 3 * BEAT) / 6)} volume={0.12} />
      ))}
      {[0, 1, 2].map((i) => (
        <Sfx key={`w${i}`} name="step" at={c1 + i * 6} volume={0.25} />
      ))}
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
