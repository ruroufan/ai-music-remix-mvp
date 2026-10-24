import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam, Shards } from "../../glass/immersive";
import { LEAF, SUN } from "../field";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const flashAt = (frame: number, at: number) => (frame >= at ? Math.exp(-(frame - at) / 4) : 0);

// 新 · 鲜 · 感 pop in one per half-beat, each with a burst of confetti — and
// each time a new one pops, the one before it goes a little grey. On the
// beat all three flare bright together, then the first starts to fade again.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const chars = [...brand.topic];
  const at = (i: number) => Math.round(i * BEAT * 0.5);
  const hit = 2 * BEAT;
  const pop = (i: number) => interpolate(frame, [at(i), at(i) + 6], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const stale = (i: number) => (frame >= hit ? interpolate(frame, [hit + 10 + i * 10, hit + 40 + i * 10], [0, 0.6], clamp) : chars.slice(i + 1).some((_, j) => frame >= at(i + 1 + j)) ? 0.5 : 0);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.06, 1]} hits={[...chars.map((_, i) => at(i)), hit]}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", fontFamily: fonts.mono, fontSize: 30, letterSpacing: 12, color: `rgb(${SUN})`, opacity: pop(0) }}>ENFP · 竞选者</div>
        {chars.map((ch, i) => {
          const s = stale(i);
          const bright = flashAt(frame, hit);
          return (
            <div key={i} style={{ position: "absolute", left: 960 - 420 + i * 290, top: 340, width: 260, textAlign: "center", fontSize: 230, fontWeight: 900, lineHeight: 1, color: `rgb(${Math.round(255 - 110 * s * (1 - bright))},${Math.round(210 - 70 * s * (1 - bright))},${Math.round(120 + 30 * s)})`, opacity: pop(i), transform: `scale(${0.4 + 0.6 * pop(i) + 0.1 * bright}) rotate(${(1 - pop(i)) * (i % 2 ? 20 : -20)}deg)`, textShadow: `0 0 ${40 * (1 - s) + 40 * bright}px rgba(${SUN},0.7)` }}>{ch}</div>
          );
        })}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {chars.map((_, i) =>
            Array.from({ length: 14 }, (_, k) => {
              const p = (frame - at(i)) / 18;
              if (p <= 0 || p >= 1) return null;
              const a = random(`c${i}-${k}`) * 6.28, d = 60 + 160 * p * random(`cd${i}-${k}`);
              return <rect key={`${i}-${k}`} x={960 - 290 + i * 290 + Math.cos(a) * d} y={460 + Math.sin(a) * d + 80 * p * p} width={10} height={6} fill={k % 2 ? `rgb(${SUN})` : `rgb(${LEAF})`} opacity={1 - p} transform={`rotate(${p * 400} ${960 - 290 + i * 290 + Math.cos(a) * d} ${460 + Math.sin(a) * d})`} />;
            }),
          )}
        </svg>
        <Shards x={960} y={460} frame={frame} at={hit} n={20} power={0.8} seed="enfp-t" />
        <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>{brand.series} · {brand.topicLatin}</div>
      </Cam>
      <Bokeh frame={frame} rgb={SUN} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(circle at 50% 45%, rgba(255,240,200,${0.5 * flashAt(frame, hit)}), transparent 65%)` }} />
      {chars.map((_, i) => (
        <Sfx key={i} name="glint" at={at(i)} volume={0.4} />
      ))}
      <Sfx name="boom" at={hit} volume={0.6} />
      <Sfx name="shatter" at={hit} volume={0.25} />
    </ObsFrame>
  );
};
