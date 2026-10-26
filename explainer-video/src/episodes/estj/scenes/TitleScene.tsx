import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam, Shards } from "../../glass/immersive";
import { GOLD, Ruler, STEEL } from "../ruler";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const flashAt = (frame: number, at: number) => (frame >= at ? Math.exp(-(frame - at) / 4) : 0);

// 标 · 准 tumble in crooked, at odd angles and heights. On the beat a ruler
// slams down under them — clack — and both characters snap square onto a
// grid, perfectly aligned. [ 合格 ].
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const [a, b] = [...brand.topic];
  const hit = 2 * BEAT;
  const inK = interpolate(frame, [0, 10], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const snap = interpolate(frame, [hit, hit + 4], [0, 1], clamp);
  const drop = interpolate(frame, [hit - 6, hit], [0, 1], { ...clamp, easing: (t) => t * t });
  const grid = interpolate(frame, [hit, hit + 12], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.06, 1]} hits={[hit]}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 0.35 * grid }}>
          {Array.from({ length: 21 }, (_, i) => <line key={`v${i}`} x1={i * 96} y1={0} x2={i * 96} y2={1080} stroke={`rgb(${STEEL})`} strokeWidth={1} />)}
          {Array.from({ length: 12 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 96} x2={1920} y2={i * 96} stroke={`rgb(${STEEL})`} strokeWidth={1} />)}
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 180, textAlign: "center", fontFamily: fonts.mono, fontSize: 30, letterSpacing: 12, color: `rgb(${GOLD})`, opacity: inK }}>ESTJ · 总经理</div>
        {[a, b].map((ch, i) => {
          const r = (1 - snap) * (i ? 14 : -11), dy = (1 - snap) * (i ? -40 : 30);
          return <div key={i} style={{ position: "absolute", left: 960 - 290 + i * 300, top: 330 + dy, width: 280, textAlign: "center", fontSize: 250, fontWeight: 900, lineHeight: 1, color: snap > 0.5 ? "#f2f4f6" : `rgb(${STEEL})`, opacity: inK, transform: `rotate(${r}deg)` }}>{ch}</div>;
        })}
        <Ruler x={560} y={620 - (1 - drop) * 200} len={800} opacity={drop} />
        <Shards x={960} y={620} frame={frame} at={hit} n={14} power={0.6} seed="estj-t" />
        <div style={{ position: "absolute", left: 0, right: 0, top: 690, textAlign: "center", fontFamily: fonts.mono, fontSize: 28, letterSpacing: 12, color: `rgb(${GOLD})`, opacity: grid }}>[ 合格 ]</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>{brand.series} · {brand.topicLatin}</div>
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} opacity={0.35} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(circle at 50% 55%, rgba(255,240,200,${0.45 * flashAt(frame, hit)}), transparent 65%)` }} />
      <Sfx name="whoosh" at={hit - 8} volume={0.35} />
      <Sfx name="stamp" at={hit} volume={0.8} />
      <Sfx name="boom" at={hit} volume={0.35} />
    </ObsFrame>
  );
};
