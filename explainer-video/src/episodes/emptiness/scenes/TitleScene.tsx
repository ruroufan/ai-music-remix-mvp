import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam } from "../../glass/immersive";
import { BRASS, swing } from "../pendulum";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BAR, BEAT, type SceneProps } from "../timing";

// The title, hollow: it lands solid, then drains — the fill sinks out of the
// letters and only their outlines are left; behind them a pendulum swings.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const show = useRamp(0, 6);
  const drain = interpolate(frame, [2 * BEAT, duration - BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const deg = swing(frame, BAR, 24);
  const word: React.CSSProperties = { position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontSize: 200, fontWeight: 900, letterSpacing: 60, paddingLeft: 60 };
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.06, 1]} hits={[0]}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 0.35 * show }}>
          <g transform={`rotate(${-deg} 960 0)`}>
            <line x1={960} y1={0} x2={960} y2={680} stroke={`rgb(${BRASS})`} strokeWidth={6} />
            <circle cx={960} cy={720} r={56} fill={`rgba(${BRASS},0.7)`} />
          </g>
        </svg>
        <div style={{ position: "absolute", inset: 0, opacity: show }}>
          <div style={{ ...word, color: "transparent", WebkitTextStroke: "3px rgba(232,238,242,0.85)" }}>{brand.topic}</div>
          <div style={{ ...word, color: palette.ink, clipPath: `inset(${drain * 100}% 0 0 0)`, textShadow: "0 0 30px rgba(170,215,255,0.4)" }}>{brand.topic}</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>{brand.series} · {brand.topicLatin}</div>
        </div>
      </Cam>
      <Bokeh frame={frame} />
      <Sfx name="boom" at={0} volume={0.7} />
      <Sfx name="whoosh" at={2 * BEAT} volume={0.3} />
    </ObsFrame>
  );
};
