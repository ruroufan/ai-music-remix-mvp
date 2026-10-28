import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam, Shards } from "../../glass/immersive";
import { FLAME } from "../chase";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// 停 · 不 · 下 · 来 come streaking in from the left with speed lines and
// slam into place on the beat, skid marks under them — and even then they
// never quite hold still: they keep trembling.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const chars = [...brand.topic];
  const hit = 2 * BEAT;
  const inK = interpolate(frame, [0, 10], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.06, 1]} hits={[hit]}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", fontFamily: fonts.mono, fontSize: 30, letterSpacing: 12, color: `rgb(${FLAME})`, opacity: inK }}>ESTP · 企业家</div>
        {chars.map((c, i) => {
          const at = hit - (chars.length - i) * 3;
          const p = interpolate(frame, [at - 14, at], [0, 1], { ...clamp, easing: (t) => t * t });
          const x = 960 + (i - (chars.length - 1) / 2) * 250;
          const jit = frame > at ? Math.sin(frame * 2.3 + i * 2) * 3 : 0;
          return (
            <React.Fragment key={i}>
              {p < 1 && <div style={{ position: "absolute", left: x - 125 - 1400 * (1 - p), top: 400, width: 600 * (1 - p) + 40, height: 8, background: `linear-gradient(90deg, transparent, rgba(${FLAME},0.7))`, opacity: p }} />}
              <div style={{ position: "absolute", left: x - 125 - 1400 * (1 - p) + jit, top: 320 + jit * 0.6, width: 250, textAlign: "center", fontSize: 220, fontWeight: 900, lineHeight: 1, color: palette.ink, opacity: p, textShadow: `${-40 * (1 - p)}px 0 30px rgba(${FLAME},0.5)`, transform: `skewX(${-20 * (1 - p)}deg)` }}>{c}</div>
            </React.Fragment>
          );
        })}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: interpolate(frame, [hit, hit + 6], [0, 1], clamp) }}>
          {[0, 1].map((k) => (
            <path key={k} d={`M${420 + k * 40} ${590 + k * 10} Q960 ${600 + k * 8} ${1480} ${585 + k * 12}`} fill="none" stroke="rgba(232,238,242,0.18)" strokeWidth={10} strokeLinecap="round" />
          ))}
        </svg>
        <Shards x={1460} y={460} frame={frame} at={hit} n={14} power={0.6} seed="estp-t" />
        <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>{brand.series} · {brand.topicLatin}</div>
      </Cam>
      <Bokeh frame={frame} rgb={FLAME} opacity={0.3} />
      <Sfx name="whoosh" at={hit - 14} volume={0.4} />
      <Sfx name="stamp" at={hit} volume={0.8} />
      <Sfx name="boom" at={hit} volume={0.45} />
    </ObsFrame>
  );
};
