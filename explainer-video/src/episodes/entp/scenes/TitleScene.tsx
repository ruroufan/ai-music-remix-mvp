import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam, Shards } from "../../glass/immersive";
import { GOLD, RED } from "../ring";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const flashAt = (frame: number, at: number) => (frame >= at ? Math.exp(-(frame - at) / 3) : 0);

// The title's two characters swing in from either side like two fists and
// collide in the middle on the beat — a flash, shards — then square up to
// each other, shaking.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const [a, b] = [...brand.topic];
  const hit = BEAT;
  const k = interpolate(frame, [0, hit], [0, 1], { ...clamp, easing: (t) => t * t * t });
  const recoil = frame >= hit ? Math.exp(-(frame - hit) / 6) * 40 : 0;
  const shake = frame >= 3 * BEAT ? Math.sin(frame * 2.1) * 3 : 0;
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.06, 1]} hits={[hit, 3 * BEAT]}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", fontFamily: fonts.mono, fontSize: 30, letterSpacing: 12, color: `rgb(${GOLD})`, opacity: k }}>ENTP · 辩论家</div>
        <div style={{ position: "absolute", left: 960 - 290 - (1 - k) * 900 - recoil + shake, top: 320, width: 280, textAlign: "center", fontSize: 260, fontWeight: 900, lineHeight: 1, color: `rgb(${GOLD})`, textShadow: `0 0 40px rgba(${GOLD},0.6)`, transform: `rotate(${(1 - k) * -20}deg)` }}>{a}</div>
        <div style={{ position: "absolute", left: 960 + 10 + (1 - k) * 900 + recoil - shake, top: 320, width: 280, textAlign: "center", fontSize: 260, fontWeight: 900, lineHeight: 1, color: `rgb(${RED})`, textShadow: `0 0 40px rgba(${RED},0.6)`, transform: `rotate(${(1 - k) * 20}deg)` }}>{b}</div>
        <Shards x={960} y={450} frame={frame} at={hit} n={32} power={1.4} seed="tg" />
        <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>{brand.series} · {brand.topicLatin}</div>
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(circle at 50% 45%, rgba(255,236,190,${0.7 * flashAt(frame, hit)}), transparent 70%)` }} />
      <Sfx name="whoosh" at={hit - 8} volume={0.4} />
      <Sfx name="boom" at={hit} volume={0.7} />
      <Sfx name="shatter" at={hit} volume={0.35} />
    </ObsFrame>
  );
};
