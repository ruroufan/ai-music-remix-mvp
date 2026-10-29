import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { COOL, WARM } from "../kettle";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// A ruled line, like a line in a book. 他人 sits on it already. 你自己 has
// slipped down off it, half out of frame — and on the beat it lifts back up
// onto the same line, and a gold rule runs under both: 同一行.
export const TurnScene: React.FC<SceneProps> = ({ duration, lines, cues }) => {
  const frame = useCurrentFrame();
  const lift = interpolate(frame, [3 * BEAT, 4 * BEAT], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const rule = interpolate(frame, [4 * BEAT, 5 * BEAT], [0, 1], clamp);
  const label = ramp(frame, 5 * BEAT, 8);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} hits={[4 * BEAT, ...keyHits(lines, cues, duration)]}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.dim, opacity: ramp(frame, 4, 10) }}>KANT · 道德律令</div>
        {[340, 480, 620].map((y) => (
          <div key={y} style={{ position: "absolute", left: 260, width: 1400, top: y, height: 2, background: "rgba(232,238,242,0.15)" }} />
        ))}
        <div style={{ position: "absolute", left: 1040, top: 380, fontSize: 90, fontWeight: 900, color: `rgb(${COOL})`, opacity: ramp(frame, 4, 8) }}>他人</div>
        <div style={{ position: "absolute", left: 640, top: 380 + 300 * (1 - lift), fontSize: 90, fontWeight: 900, color: `rgb(${WARM})`, opacity: 0.35 + 0.65 * lift, transform: `rotate(${(1 - lift) * 12}deg)`, textShadow: lift > 0.9 ? `0 0 24px rgba(${WARM},0.8)` : undefined }}>你自己</div>
        <div style={{ position: "absolute", left: 900, top: 380, fontSize: 90, fontWeight: 900, color: palette.dim, opacity: lift }}>和</div>
        <div style={{ position: "absolute", left: 620, top: 490, width: 620 * rule, height: 8, borderRadius: 4, background: `rgb(${WARM})`, boxShadow: `0 0 20px rgba(${WARM},0.8)` }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 540, textAlign: "center", fontFamily: fonts.mono, fontSize: 30, letterSpacing: 16, color: `rgb(${WARM})`, opacity: label }}>同 一 行</div>
      </Cam>
      <Bokeh frame={frame} rgb={WARM} opacity={0.3 + 0.4 * lift} />
      <Sfx name="rise" at={3 * BEAT} volume={0.3} />
      <Sfx name="glint" at={4 * BEAT} volume={0.55} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
