import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam, Shards } from "../../glass/immersive";
import { RED, SOFT } from "../jar";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const flashAt = (frame: number, at: number) => (frame >= at ? Math.exp(-(frame - at) / 4) : 0);

// 忍, huge — 刃 over 心, a blade over a heart. A glint runs along the top of it
// like light on an edge; on the beat a hairline crack splits the character
// from top to bottom. Underneath, small: 刃 · 在 · 心 · 上.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const hit = 2 * BEAT;
  const inK = interpolate(frame, [0, 10], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const glint = interpolate(frame, [6, hit - 4], [-0.2, 1.2], clamp);
  const crack = interpolate(frame, [hit, hit + 6], [0, 1], clamp);
  const shake = frame >= hit ? Math.exp(-(frame - hit) / 6) * Math.sin(frame * 2.4) * 10 : 0;
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.06, 1]} hits={[hit]}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 160, textAlign: "center", fontFamily: fonts.mono, fontSize: 30, letterSpacing: 12, color: `rgb(${SOFT})`, opacity: inK }}>ISFJ · 守卫者</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", fontSize: 420, fontWeight: 900, lineHeight: 1, color: "#e8eef2", opacity: inK, transform: `translateX(${shake}px)`, WebkitMaskImage: `linear-gradient(100deg, #000 ${glint * 100 - 6}%, rgba(0,0,0,0.75) ${glint * 100}%, #000 ${glint * 100 + 6}%)`, textShadow: `0 0 30px rgba(${SOFT},0.5)` }}>{brand.topic}</div>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <path d={`M972 250 L948 360 L984 430 L944 520 L976 610 L950 680`} fill="none" stroke={`rgb(${RED})`} strokeWidth={5} strokeDasharray="500" strokeDashoffset={500 * (1 - crack)} />
          {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={960 + (random(`g${i}`) - 0.5) * 400} cy={290} r={2} fill="#fff" opacity={Math.max(0, 1 - Math.abs(glint - random(`g${i}`)) * 6)} />)}
        </svg>
        <Shards x={960} y={460} frame={frame} at={hit} n={16} power={0.7} seed="isfj-t" />
        <div style={{ position: "absolute", left: 0, right: 0, top: 720, textAlign: "center", fontFamily: fonts.mono, fontSize: 28, letterSpacing: 20, color: `rgb(${RED})`, opacity: interpolate(frame, [hit + 4, hit + 16], [0, 1], clamp) }}>刃 · 在 · 心 · 上</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>{brand.series} · {brand.topicLatin}</div>
      </Cam>
      <Bokeh frame={frame} rgb={SOFT} opacity={0.4} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(circle at 50% 45%, rgba(255,220,220,${0.45 * flashAt(frame, hit)}), transparent 65%)` }} />
      <Sfx name="glint" at={6} volume={0.4} />
      <Sfx name="glitch" at={hit} volume={0.4} />
      <Sfx name="boom" at={hit} volume={0.6} />
    </ObsFrame>
  );
};
