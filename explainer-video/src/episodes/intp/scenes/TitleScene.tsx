import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam, Shards } from "../../glass/immersive";
import { GREY, Reasoning } from "../study";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const flashAt = (frame: number, at: number) => (frame >= at ? Math.exp(-(frame - at) / 3) : 0);

// The title slams in, grey — and out of it the reasoning sprouts in every
// direction at once, faster and faster, until the word is caged in its own
// branches.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const word = useRamp(BEAT, 6);
  const grow = interpolate(frame, [BEAT, duration], [0, 1], { ...clamp, easing: (t) => t * t });
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.06, 1]} hits={[BEAT, 3 * BEAT]}>
        <Reasoning frame={frame} ox={960} oy={560} grow={grow} seed="t1" />
        <Reasoning frame={frame} ox={760} oy={560} grow={grow * 0.9} seed="t2" />
        <Reasoning frame={frame} ox={1160} oy={560} grow={grow * 0.9} seed="t3" />
        <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: fonts.mono, fontSize: 30, letterSpacing: 12, color: `rgb(${GREY})`, opacity: word }}>INTP · 逻辑学家</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 350, textAlign: "center", fontSize: 240, fontWeight: 900, letterSpacing: 50, paddingLeft: 50, color: `rgb(${GREY})`, opacity: word, transform: `scale(${1.5 - 0.5 * word})`, textShadow: "0 0 40px rgba(220,225,232,0.5)" }}>{brand.topic}</div>
        <Shards x={960} y={480} frame={frame} at={BEAT} n={26} power={1.2} seed="tt" />
        <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>{brand.series} · {brand.topicLatin}</div>
      </Cam>
      <Bokeh frame={frame} rgb="200, 205, 215" />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(circle at 50% 45%, rgba(230,235,240,${0.6 * flashAt(frame, BEAT)}), transparent 70%)` }} />
      <Sfx name="boom" at={BEAT} volume={0.7} />
      <Sfx name="shatter" at={BEAT} volume={0.3} />
      <Sfx name="rise" at={2 * BEAT} volume={0.3} />
    </ObsFrame>
  );
};
