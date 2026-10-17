import React from "react";
import { useCurrentFrame } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { TearCalendar } from "../calendar";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// The title on a calendar page. Every beat the page is torn off — and the
// next one says the same thing, a day later.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const show = useRamp(0, 6);
  const tears = Array.from({ length: 7 }, (_, k) => (k + 1) * BEAT);
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: show }}>
        <Halo x={960} y={470} r={460} intensity={0.8} />
        <TearCalendar x={960 - 200} y={150} w={400} frame={frame} tears={tears} words={() => brand.topic ?? ""} first={20} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 740, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>
          {brand.series} · {brand.topicLatin}
        </div>
      </div>
      <Sfx name="boom" at={0} volume={0.8} />
      {tears.map((t, k) => (
        <Sfx key={k} name="shutter" at={t} volume={0.3} />
      ))}
    </ObsFrame>
  );
};
