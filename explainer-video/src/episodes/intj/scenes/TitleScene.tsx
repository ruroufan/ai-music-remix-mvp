import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam, Shards } from "../../glass/immersive";
import { BP } from "../blueprint";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const flashAt = (frame: number, at: number) => (frame >= at ? Math.exp(-(frame - at) / 3) : 0);

// The title drafted like a technical drawing: a grid, construction lines and
// dimensions snap in round it on the beat, then the word slams in — a flash,
// glass shards — solid, exact; a ✓ stamps beside it, and a red slash cuts
// across it all. Above it: INTJ · 建筑师.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const lines = interpolate(frame, [0, BEAT], [0, 1], clamp);
  const word = useRamp(BEAT, 6);
  const tick = useRamp(3 * BEAT, 6);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.06, 1]} hits={[BEAT, 3 * BEAT]}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 20 }, (_, i) => (
            <line key={i} x1={0} y1={i * 60} x2={1920 * lines} y2={i * 60} stroke={`rgba(${BP},0.06)`} />
          ))}
          <g stroke={`rgba(${BP},0.6)`} strokeWidth={1.5} opacity={lines}>
            <line x1={660} y1={340} x2={660 + 600 * lines} y2={340} />
            <line x1={660} y1={600} x2={660 + 600 * lines} y2={600} />
            <line x1={620} y1={360} x2={620} y2={360 + 220 * lines} />
            <line x1={612} y1={360} x2={628} y2={360} />
            <line x1={612} y1={580} x2={628} y2={580} />
          </g>
          <text x={580} y={478} fontSize={18} fill={`rgba(${BP},0.8)`} fontFamily={fonts.mono} textAnchor="end" opacity={lines}>220</text>
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: fonts.mono, fontSize: 30, letterSpacing: 12, color: `rgb(${BP})`, opacity: word }}>INTJ · 建筑师</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 350, textAlign: "center", fontSize: 250, fontWeight: 900, letterSpacing: 70, paddingLeft: 70, color: palette.ink, opacity: word, transform: `scale(${1.5 - 0.5 * word})`, textShadow: `0 0 40px rgba(${BP},0.8), 0 0 90px rgba(${BP},0.4)` }}>{brand.topic}</div>
        <div style={{ position: "absolute", left: 1320, top: 380, fontSize: 120, fontWeight: 900, color: "#7fe0a0", opacity: tick, transform: `scale(${2 - tick}) rotate(-8deg)` }}>✓</div>
        <Shards x={960} y={480} frame={frame} at={BEAT} n={30} power={1.3} seed="ti" />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: tick }}>
          <line x1={360} y1={720} x2={360 + 1200 * tick} y2={300 + 0 * tick} stroke="rgba(255,77,109,0.9)" strokeWidth={6} />
          <path d={`M1380 470 l40 -30 l-10 40 l50 -20`} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth={2} />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>{brand.series} · {brand.topicLatin}</div>
      </Cam>
      <Bokeh frame={frame} rgb={BP} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(circle at 50% 45%, rgba(220,240,255,${0.6 * flashAt(frame, BEAT)}), transparent 70%)` }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(circle at 70% 45%, rgba(255,77,109,${0.35 * flashAt(frame, 3 * BEAT)}), transparent 70%)` }} />
      <Sfx name="shatter" at={BEAT} volume={0.35} />
      <Sfx name="boom" at={BEAT} volume={0.7} />
      <Sfx name="stamp" at={3 * BEAT} volume={0.5} />
    </ObsFrame>
  );
};
