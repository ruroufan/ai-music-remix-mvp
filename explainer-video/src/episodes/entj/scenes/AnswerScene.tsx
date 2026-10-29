import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { COLD, Crowd, GOLD, Leader, Spot, Stage, stageTop } from "../podium";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// 0 · him on the stage, the row below bowed.
// 1 · next to him on the stage, an empty dashed outline at his own height —
//     想要 · 被尊重; down below, all those bowed heads — 得到 · 被服从.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const want = ramp(frame, c1 + BEAT, 10);
  const got = ramp(frame, c1 + 3 * BEAT, 10);
  const top = stageTop(1);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} focus={{ x: 960, y: 420 }} hits={[c1 + BEAT, c1 + 3 * BEAT, ...keyHits(lines, cues, duration)]}>
        <Spot x={960} y={top} k={1} />
        <Stage rise={1} />
        <Crowd frame={frame} nod={0.5} glow={() => 0.35 + 0.3 * got} />
        <Leader x={900} bottom={top} />
        {/* the one he wants: someone at his height — nobody there */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: want }}>
          <circle cx={1040} cy={top - 248} r={28} fill="none" stroke={`rgb(${GOLD})`} strokeWidth={3} strokeDasharray="8 6" />
          <path d={`M1000 ${top} L1000 ${top - 150} Q1000 ${top - 214} 1040 ${top - 216} Q1080 ${top - 214} 1080 ${top - 150} L1080 ${top}`} fill="none" stroke={`rgb(${GOLD})`} strokeWidth={3} strokeDasharray="8 6" />
        </svg>
        <div style={{ position: "absolute", left: 1110, top: top - 230, fontSize: 36, fontWeight: 900, color: `rgb(${GOLD})`, opacity: want }}>
          想要 <span style={{ fontFamily: fonts.mono, fontSize: 22, color: palette.dim }}>·</span> 被尊重
        </div>
        <div style={{ position: "absolute", left: 1330, top: 830, fontSize: 32, fontWeight: 900, color: `rgb(${COLD})`, opacity: got }}>
          得到 <span style={{ fontFamily: fonts.mono, fontSize: 22, color: palette.dim }}>·</span> 被服从
        </div>
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} opacity={0.5} />
      <Sfx name="glint" at={c1 + BEAT} volume={0.4} />
      <Sfx name="stamp" at={c1 + 3 * BEAT} volume={0.4} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
