import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam, Shards } from "../../glass/immersive";
import { Kettle, WARM } from "../kettle";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const flashAt = (frame: number, at: number) => (frame >= at ? Math.exp(-(frame - at) / 4) : 0);

// 付 · 出 stand as empty outlines; a kettle tips over them and pours, and
// the characters fill with warm tea from the bottom up — brim full on the
// beat, a glint, and the steam rises off them.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const [a, b] = [...brand.topic];
  const hit = 2 * BEAT;
  const tilt = interpolate(frame, [0, 8, hit, hit + 8], [0, 55, 55, 0], clamp);
  const fill = (i: number) => interpolate(frame, [4 + i * 6, hit - 2 + i * 2], [0, 1], clamp);
  const steam = interpolate(frame, [hit, hit + 20], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.06, 1]} hits={[hit]}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", fontFamily: fonts.mono, fontSize: 30, letterSpacing: 12, color: `rgb(${WARM})`, opacity: interpolate(frame, [0, 10], [0, 1], clamp) }}>ENFJ · 主人公</div>
        <Kettle x={760} y={240} size={1.6} tilt={tilt} pourTo={400} frame={frame} />
        {[a, b].map((ch, i) => (
          <div key={i} style={{ position: "absolute", left: 960 - 270 + i * 280, top: 360, width: 260, textAlign: "center", fontSize: 240, fontWeight: 900, lineHeight: 1, color: "transparent", WebkitTextStroke: `3px rgba(${WARM},0.8)`, backgroundImage: `linear-gradient(to top, rgb(${WARM}) ${fill(i) * 100}%, transparent ${fill(i) * 100}%)`, WebkitBackgroundClip: "text", backgroundClip: "text", textShadow: steam > 0 ? `0 0 ${30 * steam}px rgba(${WARM},0.6)` : undefined }}>{ch}</div>
        ))}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: steam }}>
          {[0, 1, 2, 3, 4].map((i) => {
            const p = ((frame - hit) / 40 + i / 5) % 1;
            const x = 760 + i * 100;
            return <path key={i} d={`M${x} 350 q14 -24 0 -48 q-14 -24 0 -48`} fill="none" stroke={`rgba(232,238,242,${0.45 * Math.sin(p * Math.PI)})`} strokeWidth={3} transform={`translate(0 ${-p * 40})`} />;
          })}
        </svg>
        <Shards x={960} y={470} frame={frame} at={hit} n={14} power={0.6} seed="enfj-t" />
        <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>{brand.series} · {brand.topicLatin}</div>
      </Cam>
      <Bokeh frame={frame} rgb={WARM} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(circle at 50% 45%, rgba(255,236,200,${0.5 * flashAt(frame, hit)}), transparent 65%)` }} />
      <Sfx name="whoosh" at={0} volume={0.3} />
      <Sfx name="rise" at={4} volume={0.3} />
      <Sfx name="glint" at={hit} volume={0.7} />
      <Sfx name="boom" at={hit} volume={0.45} />
    </ObsFrame>
  );
};
