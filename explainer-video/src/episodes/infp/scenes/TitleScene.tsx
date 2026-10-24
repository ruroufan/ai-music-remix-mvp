import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam, Shards } from "../../glass/immersive";
import { BLOOM, Cloche, GLOW } from "../cloche";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const flashAt = (frame: number, at: number) => (frame >= at ? Math.exp(-(frame - at) / 4) : 0);

// 理 · 想 bloom open in the middle, glowing — and on the beat a glass dome
// drops over them: a clink, a ring of light round the rim. Kept.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const [a, b] = [...brand.topic];
  const grow = (at: number) => interpolate(frame, [at, at + 10], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const hit = 2 * BEAT;
  const drop = interpolate(frame, [hit - 8, hit], [1, 0], { ...clamp, easing: (t) => t * t });
  const bounce = frame >= hit ? Math.exp(-(frame - hit) / 5) * Math.sin((frame - hit) * 1.2) * 0.03 : 0;
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.06, 1]} hits={[hit]}>
        <Halo x={960} y={470} r={420} intensity={0.8} rgb={GLOW} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", fontFamily: fonts.mono, fontSize: 30, letterSpacing: 12, color: `rgb(${GLOW})`, opacity: grow(0) }}>INFP · 调停者</div>
        {[a, b].map((ch, i) => (
          <div key={i} style={{ position: "absolute", left: 960 - 270 + i * 280, top: 340, width: 260, textAlign: "center", fontSize: 230, fontWeight: 900, lineHeight: 1, color: i ? `rgb(${BLOOM})` : `rgb(${GLOW})`, textShadow: `0 0 40px rgba(${GLOW},0.7)`, opacity: grow(i * 6), transform: `scale(${0.6 + 0.4 * grow(i * 6)})` }}>{ch}</div>
        ))}
        <div style={{ position: "absolute", inset: 0, transform: `scale(${1 + bounce})`, transformOrigin: "960px 760px" }}>
          <Cloche x={960} y={760} size={2.4} lift={drop * 0.9} opacity={1 - drop * 0.6} />
        </div>
        <Shards x={960} y={760} frame={frame} at={hit} n={16} power={0.6} seed="infp-t" />
        <div style={{ position: "absolute", left: 0, right: 0, top: 840, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>{brand.series} · {brand.topicLatin}</div>
      </Cam>
      <Bokeh frame={frame} rgb={GLOW} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(circle at 50% 70%, rgba(230,245,255,${0.5 * flashAt(frame, hit)}), transparent 60%)` }} />
      <Sfx name="glint" at={0} volume={0.35} />
      <Sfx name="whoosh" at={hit - 8} volume={0.35} />
      <Sfx name="glint" at={hit} volume={0.7} />
      <Sfx name="boom" at={hit} volume={0.45} />
    </ObsFrame>
  );
};
