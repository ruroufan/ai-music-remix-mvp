import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Giver, Row, SEATS, TABLE, WARM } from "../kettle";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const RED = "255, 110, 110";

// He goes down the row with the kettle: a step, a pour, a full cup, the next
// one — 倒满 1/6 … 6/6 — each person warming as their cup fills. The cup in
// his own hand: 0%. On the second line the camera settles on it, empty.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const P = (c1 - BEAT) / SEATS.length;
  const k = Math.min(SEATS.length - 1, Math.floor(frame / P));
  const t = Math.min(1, (frame - k * P) / P);
  const from = k === 0 ? SEATS[0] - 220 : SEATS[k - 1] - 104;
  const x = from + (SEATS[k] - 104 - from) * interpolate(t, [0, 0.3], [0, 1], clamp);
  const tilt = frame > c1 - BEAT ? 0 : interpolate(t, [0.3, 0.45, 0.8, 0.92], [0, 52, 52, 0], clamp);
  const fill = (i: number) => (i < k ? 1 : i > k ? 0 : interpolate(t, [0.42, 0.82], [0, 1], clamp));
  const done = SEATS.filter((_, i) => fill(i) > 0.95).length;
  const mine = interpolate(frame, [c1, c1 + 8], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} focus={{ x: x, y: 640 }} hits={[...SEATS.map((_, i) => Math.round(i * P + 0.82 * P)), c1, ...keyHits(lines, cues, duration)]}>
        <Row fills={fill} frame={frame} glow={(i) => 0.35 + 0.5 * fill(i)} />
        <Giver x={x} tilt={tilt} pourTo={TABLE - 50} frame={frame} cup={0} />
        <div style={{ position: "absolute", left: 140, top: 130, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 4, color: "rgba(232,238,242,0.55)", lineHeight: 1.8 }}>
          <div>
            倒满 <span style={{ color: `rgb(${WARM})`, fontSize: 40 }}>{done}/6</span>
          </div>
          <div>
            我的杯子 <span style={{ color: `rgb(${RED})`, fontSize: 40 }}>0%</span>
          </div>
        </div>
        <div style={{ position: "absolute", left: x - 200, width: 200, top: 560, textAlign: "center", fontSize: 34, fontWeight: 900, color: `rgb(${RED})`, opacity: mine, textShadow: `0 0 16px rgba(${RED},0.7)` }}>空的 ↓</div>
      </Cam>
      <Bokeh frame={frame} rgb={WARM} opacity={0.4} />
      {SEATS.map((_, i) => (
        <Sfx key={i} name="glint" at={Math.round(i * P + 0.82 * P)} volume={0.25} />
      ))}
      <Sfx name="boom" at={c1} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
