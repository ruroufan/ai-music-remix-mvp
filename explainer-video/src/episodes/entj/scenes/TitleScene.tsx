import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam, Shards } from "../../glass/immersive";
import { GOLD, Spot } from "../podium";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const flashAt = (frame: number, at: number) => (frame >= at ? Math.exp(-(frame - at) / 3) : 0);

// The title slams down in gold under a spotlight — and then the light
// around it goes out, until the one character stands alone in the dark.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const word = useRamp(BEAT, 6);
  const alone = interpolate(frame, [3 * BEAT, duration], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.06, 1]} hits={[BEAT, 3 * BEAT]}>
        <Spot x={960} y={720} k={word} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", fontFamily: fonts.mono, fontSize: 30, letterSpacing: 12, color: `rgb(${GOLD})`, opacity: word * (1 - 0.5 * alone) }}>ENTJ · 指挥官</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 290, textAlign: "center", fontSize: 330, fontWeight: 900, lineHeight: 1.1, color: `rgb(${GOLD})`, opacity: word, transform: `scale(${1.6 - 0.6 * word})`, textShadow: `0 0 ${40 + 40 * (1 - alone)}px rgba(${GOLD},0.7)` }}>{brand.topic}</div>
        <Shards x={960} y={470} frame={frame} at={BEAT} n={30} power={1.3} seed="tw" />
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 46%, transparent ${30 - 12 * alone}%, rgba(0,0,0,${0.85 * alone}) ${48 - 14 * alone}%)` }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>{brand.series} · {brand.topicLatin}</div>
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} opacity={1 - alone} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(circle at 50% 45%, rgba(255,236,190,${0.6 * flashAt(frame, BEAT)}), transparent 70%)` }} />
      <Sfx name="boom" at={BEAT} volume={0.7} />
      <Sfx name="shatter" at={BEAT} volume={0.3} />
      <Sfx name="whoosh" at={3 * BEAT} volume={0.3} />
    </ObsFrame>
  );
};
