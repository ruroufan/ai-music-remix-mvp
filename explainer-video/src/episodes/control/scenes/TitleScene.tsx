import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam } from "../../glass/immersive";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const ANCHORS = [[120, 120], [1800, 140], [100, 900], [1820, 920], [960, 60], [960, 1020]];

// The title held in place by ropes pulled out to the edges of the frame — they
// snap tighter on every beat, and the letters shake.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const show = useRamp(0, 6);
  const tug = Math.exp(-(frame % BEAT) / 4);
  const t = interpolate(frame, [0, 4 * BEAT], [0.4, 1], { extrapolateRight: "clamp" });
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.08, 1]} hits={[0, 4 * BEAT]}>
        <div style={{ position: "absolute", inset: 0, opacity: show }}>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            {ANCHORS.map(([x, y], i) => {
              const sx = 960 + (x < 960 ? -260 : x > 960 ? 260 : 0), sy = 470 + (y < 470 ? -60 : 60);
              const sag = 60 * (1 - t) * (1 - tug);
              return <path key={i} d={`M${sx} ${sy} Q${(sx + x) / 2} ${(sy + y) / 2 + sag} ${x} ${y}`} fill="none" stroke={`rgba(255,${200 - 120 * t},${180 - 80 * t},0.9)`} strokeWidth={3 + 2 * t} />;
            })}
          </svg>
          <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", fontSize: 170, fontWeight: 900, letterSpacing: 30, paddingLeft: 30, transform: `translate(${Math.sin(frame * 2.7) * 4 * tug * t}px, ${Math.cos(frame * 3.1) * 3 * tug * t}px)`, textShadow: "0 0 30px rgba(255,77,109,0.4)" }}>{brand.topic}</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>{brand.series} · {brand.topicLatin}</div>
        </div>
      </Cam>
      <Bokeh frame={frame} />
      <Sfx name="boom" at={0} volume={0.7} />
      {[1, 2, 3, 4, 5, 6, 7].map((k) => (
        <Sfx key={k} name="shutter" at={k * BEAT} volume={0.16} />
      ))}
    </ObsFrame>
  );
};
