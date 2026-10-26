import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam, Shards } from "../../glass/immersive";
import { RED, WARM } from "../ring";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const flashAt = (frame: number, at: number) => (frame >= at ? Math.exp(-(frame - at) / 4) : 0);

// 被 · 喜 · 欢 pop in, and under them a like-counter that won't sit still —
// ♥ 128 → 97 → 203 → 64 … On the beat it freezes and the title flares.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const chars = [...brand.topic];
  const hit = 2 * BEAT;
  const pop = (i: number) => interpolate(frame, [i * 5, i * 5 + 8], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const likes = frame < hit ? Math.round(120 + 90 * Math.sin(frame * 0.9) + 40 * Math.sin(frame * 2.3)) : 0;
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.06, 1]} hits={[hit]}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 190, textAlign: "center", fontFamily: fonts.mono, fontSize: 30, letterSpacing: 12, color: `rgb(${WARM})`, opacity: pop(0) }}>ESFJ · 执政官</div>
        {chars.map((ch, i) => (
          <div key={i} style={{ position: "absolute", left: 960 - 420 + i * 290, top: 320, width: 260, textAlign: "center", fontSize: 230, fontWeight: 900, lineHeight: 1, color: `rgb(${WARM})`, opacity: pop(i), transform: `scale(${0.5 + 0.5 * pop(i) + 0.08 * flashAt(frame, hit)})`, textShadow: `0 0 ${30 + 40 * flashAt(frame, hit)}px rgba(${WARM},0.6)` }}>{ch}</div>
        ))}
        <div style={{ position: "absolute", left: 0, right: 0, top: 620, textAlign: "center", fontFamily: fonts.mono, fontSize: 48, color: frame < hit ? palette.ink : `rgb(${RED})` }}>
          <span style={{ color: `rgb(${RED})` }}>♥</span> {frame < hit ? likes : "?"}
        </div>
        <Shards x={960} y={430} frame={frame} at={hit} n={18} power={0.7} seed="esfj-t" />
        <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>{brand.series} · {brand.topicLatin}</div>
      </Cam>
      <Bokeh frame={frame} rgb={WARM} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(circle at 50% 45%, rgba(255,230,210,${0.45 * flashAt(frame, hit)}), transparent 65%)` }} />
      {[0, 5, 10].map((f) => (
        <Sfx key={f} name="glint" at={f} volume={0.35} />
      ))}
      <Sfx name="boom" at={hit} volume={0.6} />
      <Sfx name="stamp" at={hit} volume={0.4} />
    </ObsFrame>
  );
};
