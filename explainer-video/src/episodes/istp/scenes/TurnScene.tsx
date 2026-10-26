import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { FEEL, Feeling, Gear, GREEN, STEEL } from "../bench";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// The gears of reason, still — and the glowing part slots into the middle of
// them like a missing piece. On the beat everything turns together, smooth:
// 理性 + 感受 · 照样运转.
export const TurnScene: React.FC<SceneProps> = ({ duration, lines, cues }) => {
  const frame = useCurrentFrame();
  const fit = interpolate(frame, [2 * BEAT, 4 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const run = Math.max(0, frame - 4 * BEAT) * 3;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} hits={[4 * BEAT, ...keyHits(lines, cues, duration)]}>
        <Gear x={760} y={520} r={110} teeth={14} rot={run} />
        <Gear x={1160} y={520} r={110} teeth={14} rot={-run + 13} />
        <Gear x={960} y={300} r={70} teeth={10} rot={-run * 1.5} />
        <Feeling x={960} y={520 + (1 - fit) * 360} size={2} frame={frame} still={fit >= 1} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center", fontSize: 44, fontWeight: 900, letterSpacing: 6, color: palette.ink, opacity: ramp(frame, 4 * BEAT, 10) }}>
          <span style={{ color: `rgb(${STEEL})` }}>理性</span> + <span style={{ color: `rgb(${FEEL})` }}>感受</span> · <span style={{ color: `rgb(${GREEN})` }}>照样运转</span>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 8, color: palette.dim, opacity: ramp(frame, 4, 10) }}>承认感受 ≠ 不理性</div>
      </Cam>
      <Bokeh frame={frame} rgb={FEEL} opacity={0.3 + 0.3 * fit} />
      <Sfx name="whoosh" at={2 * BEAT} volume={0.3} />
      <Sfx name="stamp" at={4 * BEAT} volume={0.45} />
      <Sfx name="glint" at={4 * BEAT} volume={0.4} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
