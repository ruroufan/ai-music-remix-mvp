import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { fonts } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { BLOOM, GLOW, GreyStreet, Holder, Wind } from "../cloche";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// The episode's picture.
// 0 · the grey street, him in the middle with the dome. He lifts the glass
//     off. The wind gets in at once: the flower whips back and forth, a
//     couple of petals tear away —
// 1 · — and it opens, wider than it ever did under the glass. Its light
//     reaches the street: window after window comes on, warm.
// 2 · the channel card.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const lift = interpolate(frame, [2 * BEAT, 4 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const wind = interpolate(frame, [3 * BEAT, 4 * BEAT], [0, 1], clamp) * (1 - 0.4 * interpolate(frame, [c1 + 2 * BEAT, c1 + 6 * BEAT], [0, 1], clamp));
  const sway = Math.sin(frame / 3.2) * 28 * wind + Math.sin(frame / 7) * 8 * wind;
  const open = 1 + 2.2 * interpolate(frame, [c1, c1 + 5 * BEAT], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) });
  const warm = interpolate(frame, [c1 + BEAT, c1 + 7 * BEAT], [0, 1], clamp);
  const card = useRamp(c2, 12);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1.04, 1]} focus={{ x: 960, y: 600 }} hits={[2 * BEAT, 4 * BEAT, c1, ...keyHits(lines, cues, duration)]}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.92 * card }}>
          <GreyStreet frame={frame} warm={warm} />
          <Holder x={880} height={400} lift={lift} sway={sway} open={open} glow={0.6 + 0.4 * warm} />
          {/* torn petals */}
          {Array.from({ length: 5 }, (_, i) => {
            const at = 4 * BEAT + i * 9;
            const t = (frame - at) / 50;
            if (t <= 0 || t >= 1) return null;
            return <div key={i} style={{ position: "absolute", left: 1000 + t * (700 + 200 * random(`pt${i}`)), top: 500 - 60 * Math.sin(t * Math.PI) + t * 120 * random(`py${i}`), width: 22, height: 12, borderRadius: "50%", background: `rgb(${BLOOM})`, opacity: 1 - t, transform: `rotate(${t * 720}deg)` }} />;
          })}
          <Wind frame={frame} k={wind} />
          <div style={{ position: "absolute", left: 1240, top: 230, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 8, color: "rgba(232,238,242,0.6)", opacity: interpolate(frame, [4 * BEAT, 4 * BEAT + 10], [0, 1], clamp) * (1 - warm) }}>会受伤 · 会妥协</div>
          <div style={{ position: "absolute", left: 1240, top: 230, fontSize: 40, fontWeight: 900, letterSpacing: 8, color: `rgb(${GLOW})`, textShadow: `0 0 20px rgba(${GLOW},0.8)`, opacity: warm * (1 - card) }}>开得更大了</div>
        </div>
      </Cam>
      <Bokeh frame={frame} rgb={GLOW} opacity={(0.3 + 0.7 * warm) * (1 - card)} />
      {card > 0 && <EndCard opacity={card} signoffAt={c2 + BEAT} />}
      <Sfx name="glint" at={2 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={3 * BEAT} volume={0.5} />
      <Sfx name="whoosh" at={4 * BEAT + 6} volume={0.35} />
      <Sfx name="rise" at={c1} volume={0.35} />
      <Sfx name="boom" at={c2} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
