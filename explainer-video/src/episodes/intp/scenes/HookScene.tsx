import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Seated } from "../../friction/tangle";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { FLOOR, HEAD, SEAT, Reasoning, Study } from "../study";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// 0 · the grey study; he sits at the desk and the reasoning grows out behind
//     his head, branch after branch — 方案 ×1 … ×100.
// 1 · the counter keeps climbing; 已执行 stays at 0, blinking red.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const grow = interpolate(frame, [0, duration - BEAT], [0.05, 1], clamp);
  const plans = Math.round(interpolate(frame, [0, duration - BEAT], [1, 100], { ...clamp, easing: (t) => t * t }));
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.1]} focus={{ x: HEAD.x, y: HEAD.y }} hits={keyHits(lines, cues, duration)}>
        <Study frame={frame} />
        <Reasoning frame={frame} ox={HEAD.x} oy={HEAD.y - 20} grow={grow} />
        <Seated x={SEAT} floor={FLOOR} scale={1.25} glow={0.5} slump={0.3} />
        <div style={{ position: "absolute", left: 1150, top: 380, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 3, color: palette.dim, lineHeight: 1.9 }}>
          <div>
            方案 <span style={{ color: palette.ink, fontSize: 40 }}>×{plans}</span>
          </div>
          <div>
            已执行 <span style={{ color: palette.alert, fontSize: 40, opacity: Math.floor(frame / 8) % 2 ? 1 : 0.4 }}>0</span>
          </div>
        </div>
      </Cam>
      <Bokeh frame={frame} rgb="200, 205, 215" opacity={0.6} />
      <Sfx name="rise" at={0} volume={0.2} />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <Sfx key={i} name="shutter" at={i * 2 * BEAT} volume={0.1} />
      ))}
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
