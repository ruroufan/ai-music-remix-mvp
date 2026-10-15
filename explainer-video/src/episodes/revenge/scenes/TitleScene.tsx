import React from "react";
import { useCurrentFrame, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// The title lit from below by a phone screen; a big clock behind it ticks past
// midnight, one minute-mark per beat; the screen light flickers like a feed.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const show = useRamp(0, 6);
  const beat = Math.floor(frame / BEAT);
  const flick = 0.75 + random(`tf-${Math.floor(frame / 3)}`) * 0.25;
  const minute = (beat * 5) % 60;
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: show }}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <circle cx={960} cy={470} r={330} fill="none" stroke={palette.faint} strokeWidth={3} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <line key={i} x1={960 + Math.sin(a) * 300} y1={470 - Math.cos(a) * 300} x2={960 + Math.sin(a) * 325} y2={470 - Math.cos(a) * 325} stroke={palette.dim} strokeWidth={4} />;
          })}
          <line x1={960} y1={470} x2={960 + Math.sin((minute / 60) * Math.PI * 2) * 280} y2={470 - Math.cos((minute / 60) * Math.PI * 2) * 280} stroke={palette.alert} strokeWidth={6} strokeLinecap="round" />
          <line x1={960} y1={470} x2={960 + Math.sin(((1 + minute / 60) / 12) * Math.PI * 2) * 180} y2={470 - Math.cos(((1 + minute / 60) / 12) * Math.PI * 2) * 180} stroke={palette.ink} strokeWidth={10} strokeLinecap="round" />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", fontSize: 150, fontWeight: 900, letterSpacing: 24, color: "#030405", textShadow: `0 ${8 * flick}px 30px rgba(140,190,255,${0.8 * flick}), 0 0 2px rgba(190,225,255,0.95)` }}>{brand.topic}</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 830, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>
          {brand.series} · {brand.topicLatin} · 01:{String(minute).padStart(2, "0")}
        </div>
      </div>
      <Sfx name="boom" at={0} volume={0.8} />
      {[1, 2, 3, 4, 5, 6, 7].map((k) => (
        <Sfx key={k} name="shutter" at={k * BEAT} volume={0.15} />
      ))}
    </ObsFrame>
  );
};
