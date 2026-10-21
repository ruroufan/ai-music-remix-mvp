import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam } from "../../glass/immersive";
import { ScreenCloud } from "../screens";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// The title glitching: RGB-split copies that jump apart on every beat and
// snap back, a slice of it torn sideways now and then; behind it, screens.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const show = useRamp(0, 6);
  const kick = Math.exp(-(frame % BEAT) / 4);
  const off = 4 + 18 * kick;
  const tear = (frame % BEAT) < 3 ? ((Math.floor(frame / BEAT) % 3) - 1) * 40 : 0;
  const word: React.CSSProperties = { position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", fontSize: 170, fontWeight: 900, letterSpacing: 30, paddingLeft: 30 };
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.06, 1]} hits={[0, BEAT, 2 * BEAT, 3 * BEAT]}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.35, filter: "blur(2px)" }}>
          <ScreenCloud frame={frame} count={24} cx={960} cy={460} />
        </div>
        <div style={{ position: "absolute", inset: 0, opacity: show }}>
          <div style={{ ...word, color: "rgba(255,40,80,0.8)", transform: `translateX(${-off}px)`, mixBlendMode: "screen" }}>{brand.topic}</div>
          <div style={{ ...word, color: "rgba(40,200,255,0.8)", transform: `translateX(${off}px)`, mixBlendMode: "screen" }}>{brand.topic}</div>
          <div style={{ ...word, color: palette.ink }}>{brand.topic}</div>
          {tear !== 0 && <div style={{ ...word, color: palette.ink, clipPath: "inset(45% 0 35% 0)", transform: `translateX(${tear}px)`, background: "#0b0f15" }}>{brand.topic}</div>}
          <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim, opacity: interpolate(frame, [BEAT, BEAT + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>{brand.series} · {brand.topicLatin}</div>
        </div>
      </Cam>
      <Bokeh frame={frame} rgb="120, 200, 255" />
      <Sfx name="boom" at={0} volume={0.7} />
      {[1, 2, 3].map((k) => (
        <Sfx key={k} name="glitch" at={k * BEAT} volume={0.25} />
      ))}
    </ObsFrame>
  );
};
