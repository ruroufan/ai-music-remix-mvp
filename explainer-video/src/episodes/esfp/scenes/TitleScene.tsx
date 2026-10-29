import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam } from "../../glass/immersive";
import { GOLD, PINK } from "../stage";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// 热 · 闹 in marquee bulbs, blazing — on the beat a confetti cannon goes off.
// Then, bulb by bulb, the marquee goes dark, and the confetti lies on the
// floor.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const [a, b] = [...brand.topic];
  const hit = 2 * BEAT;
  const inK = interpolate(frame, [0, 8], [0, 1], clamp);
  const dark = interpolate(frame, [hit + 2 * BEAT, hit + 4 * BEAT], [0, 1], clamp);
  const t = frame - hit;
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.06, 1]} hits={[hit]}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", fontFamily: fonts.mono, fontSize: 30, letterSpacing: 12, color: `rgb(${GOLD})`, opacity: inK }}>ESFP · 表演者</div>
        <div style={{ position: "absolute", left: 560, top: 290, width: 800, height: 380, borderRadius: 20, border: `4px solid rgba(${GOLD},${0.3 + 0.5 * (1 - dark)})`, opacity: inK }}>
          {Array.from({ length: 24 }, (_, i) => {
            const side = i < 8 ? 0 : i < 12 ? 1 : i < 20 ? 2 : 3;
            const k = side === 0 ? i : side === 1 ? i - 8 : side === 2 ? i - 12 : i - 20;
            const pos = side === 0 ? { left: 20 + k * 106, top: -14 } : side === 1 ? { left: 786, top: 40 + k * 90 } : side === 2 ? { left: 762 - k * 106, top: 366 } : { left: -14, top: 310 - k * 90 };
            const on = random(`b${i}`) > dark && 0.6 + 0.4 * Math.abs(Math.sin(frame / 4 + i)) > 0.6;
            return <div key={i} style={{ position: "absolute", ...pos, width: 24, height: 24, borderRadius: 12, background: on ? `rgb(${i % 2 ? GOLD : PINK})` : "#2a2420", boxShadow: on ? `0 0 14px rgba(${GOLD},0.8)` : undefined }} />;
          })}
          <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", fontSize: 230, fontWeight: 900, lineHeight: 1, letterSpacing: 40, paddingLeft: 40, color: `rgba(255,240,210,${1 - 0.7 * dark})`, textShadow: dark < 0.6 ? `0 0 40px rgba(${GOLD},0.7)` : undefined }}>{a}{b}</div>
        </div>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {t >= 0 &&
            Array.from({ length: 60 }, (_, i) => {
              const a0 = -Math.PI / 2 + (random(`ca${i}`) - 0.5) * 2.4;
              const v = 18 + random(`cv${i}`) * 22;
              const tt = Math.min(t, 80);
              const x = 960 + Math.cos(a0) * v * tt * 0.9;
              const y = Math.min(980, 700 + Math.sin(a0) * v * tt + 0.45 * tt * tt);
              return <rect key={i} x={x} y={y} width={12} height={7} fill={`rgb(${[GOLD, PINK, "130, 200, 255", "160, 230, 150"][i % 4]})`} opacity={1 - 0.6 * dark} transform={`rotate(${tt * (8 + i)} ${x} ${y})`} />;
            })}
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>{brand.series} · {brand.topicLatin}</div>
      </Cam>
      <Bokeh frame={frame} rgb={PINK} opacity={0.4 * (1 - dark)} />
      <Sfx name="rise" at={0} volume={0.25} />
      <Sfx name="boom" at={hit} volume={0.6} />
      <Sfx name="shatter" at={hit} volume={0.4} />
      <Sfx name="shutter" at={hit + 2 * BEAT} volume={0.4} />
    </ObsFrame>
  );
};
