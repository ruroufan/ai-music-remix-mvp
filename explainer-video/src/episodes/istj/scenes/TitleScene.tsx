import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam, Shards } from "../../glass/immersive";
import { INK, PALE } from "../checklist";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const flashAt = (frame: number, at: number) => (frame >= at ? Math.exp(-(frame - at) / 4) : 0);
const GREEN = "120, 210, 150";

// 有 · 用, each set in a ruled form box like an item on a list. On the beat
// a big tick slams down over both boxes — checked — and the characters go
// cold and flat.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const [a, b] = [...brand.topic];
  const hit = 2 * BEAT;
  const box = (i: number) => interpolate(frame, [i * 6, i * 6 + 8], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const tick = interpolate(frame, [hit - 4, hit + 2], [0, 1], clamp);
  const cold = interpolate(frame, [hit, hit + 20], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.06, 1]} hits={[hit]}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 190, textAlign: "center", fontFamily: fonts.mono, fontSize: 30, letterSpacing: 12, color: `rgb(${INK})`, opacity: box(0) }}>ISTJ · 物流师</div>
        {[a, b].map((ch, i) => (
          <div key={i} style={{ position: "absolute", left: 960 - 330 + i * 360, top: 300, width: 300, height: 300, border: `6px solid rgba(${INK},0.8)`, borderRadius: 14, opacity: box(i), transform: `scale(${0.8 + 0.2 * box(i)})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 220, fontWeight: 900, lineHeight: 1, color: `rgb(${Math.round(255 - 105 * cold)},${Math.round(236 - 76 * cold)},${Math.round(200 - 28 * cold)})`, textShadow: `0 0 ${36 * (1 - cold)}px rgba(255,220,160,0.6)` }}>{ch}</div>
        ))}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <path d="M640 470 L860 660 L1300 250" fill="none" stroke={`rgb(${GREEN})`} strokeWidth={34} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1000" strokeDashoffset={1000 * (1 - tick)} opacity={0.9} />
        </svg>
        <Shards x={960} y={450} frame={frame} at={hit} n={16} power={0.7} seed="istj-t" />
        <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>{brand.series} · {brand.topicLatin}</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 660, textAlign: "center", fontFamily: fonts.mono, fontSize: 26, letterSpacing: 10, color: `rgb(${PALE})`, opacity: cold }}>[ ✓ 已完成 ]</div>
      </Cam>
      <Bokeh frame={frame} opacity={0.3} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(circle at 50% 45%, rgba(220,255,230,${0.45 * flashAt(frame, hit)}), transparent 65%)` }} />
      <Sfx name="shutter" at={0} volume={0.3} />
      <Sfx name="shutter" at={6} volume={0.3} />
      <Sfx name="stamp" at={hit} volume={0.7} />
      <Sfx name="boom" at={hit} volume={0.4} />
    </ObsFrame>
  );
};
