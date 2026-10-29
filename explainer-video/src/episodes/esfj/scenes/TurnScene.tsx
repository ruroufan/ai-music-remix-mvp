import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { CALM, Inner, WARM } from "../ring";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// 称赞 on the left, small and flickering like applause; on the right, the
// small figure in its chair — it nods — and over it, lit and steady:
// 值得被称赞.
export const TurnScene: React.FC<SceneProps> = ({ duration, lines, cues }) => {
  const frame = useCurrentFrame();
  const nodAt = 5 * BEAT;
  const nod = frame > nodAt && frame < nodAt + 20 ? Math.sin(((frame - nodAt) / 20) * Math.PI) : 0;
  const worth = ramp(frame, nodAt + 10, 12);
  const flick = 0.5 + 0.5 * Math.abs(Math.sin(frame * 0.8));
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} hits={[nodAt + 10, ...keyHits(lines, cues, duration)]}>
        <div style={{ position: "absolute", left: 300, top: 440, fontSize: 70, fontWeight: 900, color: `rgba(232,238,242,${0.3 + 0.5 * flick * (1 - 0.5 * worth)})` }}>称赞</div>
        <div style={{ position: "absolute", left: 300, top: 540, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim }}>会来 · 也会走</div>
        <Halo x={1300} y={560} r={300} intensity={0.8 * worth} rgb={WARM} />
        <Inner x={1340} y={840} scale={1.4} nod={nod} glow={0.4 + 0.5 * worth} />
        <div style={{ position: "absolute", left: 1000, width: 600, top: 240, textAlign: "center", fontSize: 72, fontWeight: 900, color: `rgb(${WARM})`, textShadow: `0 0 30px rgba(${WARM},0.7)`, opacity: worth }}>值得被称赞</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: `rgb(${CALM})`, opacity: ramp(frame, 4, 10) }}>ADAM SMITH · 智慧的人</div>
      </Cam>
      <Bokeh frame={frame} rgb={WARM} opacity={0.3 + 0.4 * worth} />
      <Sfx name="glint" at={nodAt + 10} volume={0.55} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
