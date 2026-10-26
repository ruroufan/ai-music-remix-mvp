import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Centre, Crowd, GREEN, RED, SEATS, WARM, scoreAt } from "../ring";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// He stands in the middle of a ring of people, every one of them holding up a
// score card — and the numbers keep changing: 8, 3, 6, 9, 4… His glow rises
// and sinks with the average: 平均分 7.2 → 5.8 → 8.1 … 被打分.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const avg = SEATS.reduce((a, _, i) => a + scoreAt(i, frame), 0) / SEATS.length;
  const mood = (avg - 2) / 8;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} focus={{ x: 960, y: 600 }} hits={[22, 44, 66, 88, 110, 132, c1, ...keyHits(lines, cues, duration)]}>
        <Crowd frame={frame} />
        <Centre glow={0.2 + 0.8 * mood} />
        <div style={{ position: "absolute", left: 120, top: 130, fontFamily: fonts.mono, fontSize: 28, letterSpacing: 4, color: "rgba(232,238,242,0.55)" }}>
          平均分 <span style={{ fontSize: 46, color: `rgb(${mood > 0.6 ? GREEN : mood < 0.45 ? RED : WARM})` }}>{avg.toFixed(1)}</span>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontSize: 44, fontWeight: 900, letterSpacing: 12, color: `rgb(${WARM})`, opacity: interpolate(frame, [c1, c1 + 10], [0, 1], clamp) }}>被 打 分</div>
      </Cam>
      <Bokeh frame={frame} rgb={WARM} opacity={0.3} />
      {[22, 44, 66, 88, 110, 132, 154, 176, 198, 220, 242].map((f) => (
        <Sfx key={f} name="shutter" at={f} volume={0.15} />
      ))}
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
