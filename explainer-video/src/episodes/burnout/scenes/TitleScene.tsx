import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam } from "../../glass/immersive";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// The title burning down: it glows hot, flickers on each beat, and by the end
// it's embers — sparks drifting up off it.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const show = useRamp(0, 6);
  const burn = interpolate(frame, [2 * BEAT, duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flick = 0.85 + 0.15 * Math.sin(frame * 1.7) * Math.exp(-(frame % BEAT) / 6);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.06, 1]} hits={[0]}>
        <div style={{ position: "absolute", inset: 0, opacity: show }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", fontSize: 180, fontWeight: 900, letterSpacing: 40, paddingLeft: 40, color: `rgb(${Math.round(255 - 150 * burn)},${Math.round(200 - 160 * burn)},${Math.round(150 - 130 * burn)})`, textShadow: `0 0 ${40 * flick * (1 - burn * 0.6)}px rgba(255,120,40,${0.8 - 0.5 * burn})`, opacity: flick }}>{brand.topic}</div>
          {Array.from({ length: 30 }, (_, i) => {
            const t = (frame - 2 * BEAT - random(`em-${i}`) * 60) / 60;
            if (t < 0 || t > 1) return null;
            return <div key={i} style={{ position: "absolute", left: 760 + random(`ex-${i}`) * 400 + Math.sin(t * 6 + i) * 20, top: 560 - t * 300, width: 5, height: 5, borderRadius: 3, background: "#ffb060", boxShadow: "0 0 8px #ff8030", opacity: 1 - t }} />;
          })}
          <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>{brand.series} · {brand.topicLatin}</div>
        </div>
      </Cam>
      <Bokeh frame={frame} rgb="255, 170, 120" />
      <Sfx name="boom" at={0} volume={0.7} />
      <Sfx name="rise" at={2 * BEAT} volume={0.3} />
    </ObsFrame>
  );
};
