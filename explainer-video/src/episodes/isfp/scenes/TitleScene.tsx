import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam, Shards } from "../../glass/immersive";
import { RIFT, ROSE, Rift } from "../crack";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// 回 · 避, close together. On the beat a crack splits the screen between
// them and 避 slides away to the right, fading — the one who leaves.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const [a, b] = [...brand.topic];
  const hit = 2 * BEAT;
  const inK = interpolate(frame, [0, 10], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const split = interpolate(frame, [hit, hit + 3 * BEAT], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) });
  const open = interpolate(frame, [hit - 2, hit + 6], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.06, 1]} hits={[hit]}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", fontFamily: fonts.mono, fontSize: 30, letterSpacing: 12, color: `rgb(${ROSE})`, opacity: inK }}>ISFP · 探险家</div>
        <div style={{ position: "absolute", inset: 0, transform: "translateY(-220px)" }}>
          <Rift open={open} frame={frame} top={-200} />
        </div>
        <div style={{ position: "absolute", left: 960 - 290 - 40 * split, top: 330, width: 280, textAlign: "center", fontSize: 260, fontWeight: 900, lineHeight: 1, color: palette.ink, opacity: inK, textShadow: "0 0 30px rgba(255,255,255,0.25)" }}>{a}</div>
        <div style={{ position: "absolute", left: 960 + 10 + 260 * split, top: 330, width: 280, textAlign: "center", fontSize: 260, fontWeight: 900, lineHeight: 1, color: `rgba(232,238,242,${1 - 0.65 * split})`, opacity: inK }}>{b}</div>
        <Shards x={960} y={460} frame={frame} at={hit} n={14} power={0.6} seed="isfp-t" />
        <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>{brand.series} · {brand.topicLatin}</div>
      </Cam>
      <Bokeh frame={frame} rgb={split > 0 ? RIFT : ROSE} opacity={0.3} />
      <Sfx name="whoosh" at={hit - 8} volume={0.3} />
      <Sfx name="shatter" at={hit} volume={0.6} />
      <Sfx name="boom" at={hit} volume={0.45} />
    </ObsFrame>
  );
};
