import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox } from "../../../channels/backlit/parts";
import { fonts } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { FLAME, Highway, Moto, ROAD, SHADE, Shadow } from "../chase";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SPEEDS = [120, 160, 200, 240];

// The picture, first half: he tears down the highway on his bike, the road
// streaking past — and behind him a dark mass keeps pace, never falling back.
// The speed climbs: 120 · 160 · 200 · 240. On the second line the viewfinder
// finds what's behind him: 身后 · 紧追不舍.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const step = Math.min(SPEEDS.length - 1, Math.floor(frame / (2 * BEAT)));
  const dist = frame * 38;
  const sx = 420 + Math.sin(frame / 22) * 60 + interpolate(frame, [0, c1], [-200, 0], clamp);
  const box = interpolate(frame, [c1, c1 + 10], [0, 1], clamp);
  const bob = Math.sin(frame / 2.5) * 2;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} focus={{ x: 960, y: 600 }} hits={[...SPEEDS.map((_, i) => i * 2 * BEAT), c1, ...keyHits(lines, cues, duration)]}>
        <Highway dist={dist} blur={0.8} />
        <Shadow x={sx} frame={frame} scale={1.2} />
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${bob}px)` }}>
          <Moto x={1180} spin={frame * 0.9} frame={frame} scale={1.35} />
        </div>
        <FocusBox x={sx} y={ROAD - 160} w={360} h={340} progress={box} label="身后 · 紧追不舍" color={`rgb(${SHADE})`} />
        <div style={{ position: "absolute", left: 1460, top: 150, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 4, color: "rgba(232,238,242,0.55)" }}>
          <span style={{ fontSize: 60, fontWeight: 700, color: `rgb(${FLAME})` }}>{SPEEDS[step]}</span> km/h
        </div>
      </Cam>
      <Bokeh frame={frame} rgb={FLAME} opacity={0.3} />
      <Sfx name="rise" at={0} volume={0.3} />
      {SPEEDS.map((_, i) => (
        <Sfx key={i} name="whoosh" at={i * 2 * BEAT} volume={0.25} />
      ))}
      <Sfx name="glitch" at={c1} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
