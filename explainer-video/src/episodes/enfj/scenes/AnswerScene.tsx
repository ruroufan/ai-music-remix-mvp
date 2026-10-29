import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox } from "../../../channels/backlit/parts";
import { fonts } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Giver, Row, WARM, WarmAir } from "../kettle";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// The row, every cup full and steaming, everyone warm — and him at the end,
// kettle in hand, out of the light. Then the viewfinder finds what nobody
// sees: the empty cup in his other hand. 我也需要 · 没让人看见.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const s = 330 / 260;
  const found = interpolate(frame, [c1 + BEAT, c1 + BEAT + 10], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} focus={{ x: frame < c1 ? 960 : 1560, y: 640 }} hits={[c1 + BEAT, c1 + 4 * BEAT, ...keyHits(lines, cues, duration)]}>
        <WarmAir frame={frame} k={0.8} />
        <Row fills={() => 1} frame={frame} glow={() => 0.75} />
        <Giver x={1640} glow={0.2} />
        <FocusBox x={1640 - 58 * s} y={900 - 150 * s - 20} w={130} h={110} progress={found} label="没让人看见" />
        <div style={{ position: "absolute", left: 1320, top: 380, fontSize: 44, fontWeight: 900, color: `rgb(${WARM})`, textShadow: `0 0 20px rgba(${WARM},0.8)`, opacity: ramp(frame, c1 + 4 * BEAT, 8) }}>我也需要</div>
        <div style={{ position: "absolute", left: 140, top: 150, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 6, color: "rgba(232,238,242,0.55)", opacity: frame < c1 ? 1 : 0 }}>每一杯 · 都是满的</div>
      </Cam>
      <Bokeh frame={frame} rgb={WARM} opacity={0.5} />
      <Sfx name="shutter" at={c1 + BEAT} volume={0.4} />
      <Sfx name="glint" at={c1 + 4 * BEAT} volume={0.45} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
