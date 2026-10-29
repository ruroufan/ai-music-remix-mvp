import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Crowd, GOLD, Leader, Spot, Stage, stageTop } from "../podium";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// 0 · the stage rises; he's on top in a gold spotlight, the wins piling up —
//     胜 ×1 … ×99 — and below him a row of people, heads bowed.
// 1 · the light round him narrows; everyone else drops into shadow — 身边：0.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const rise = interpolate(frame, [0, 2 * BEAT], [0.4, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const wins = Math.round(interpolate(frame, [0, c1], [1, 99], { ...clamp, easing: (t) => t * t }));
  const dark = interpolate(frame, [c1, c1 + 2 * BEAT], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.1]} focus={{ x: 960, y: 420 }} hits={keyHits(lines, cues, duration)}>
        <Spot x={960} y={stageTop(rise)} k={1} />
        <Stage rise={rise} />
        <Crowd frame={frame} opacity={1 - 0.7 * dark} />
        <Leader x={960} bottom={stageTop(rise)} />
        <div style={{ position: "absolute", left: 1230, top: 170, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 4, color: palette.dim, lineHeight: 1.9 }}>
          <div>
            胜 <span style={{ color: `rgb(${GOLD})`, fontSize: 40 }}>×{wins}</span>
          </div>
          <div style={{ opacity: dark }}>
            身边 <span style={{ color: palette.alert, fontSize: 40 }}>0</span>
          </div>
        </div>
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} opacity={0.5} />
      <Sfx name="rise" at={0} volume={0.25} />
      {[0, 1, 2, 3].map((i) => (
        <Sfx key={i} name="stamp" at={2 * BEAT + i * BEAT} volume={0.15} />
      ))}
      <Sfx name="boom" at={c1} volume={0.3} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
