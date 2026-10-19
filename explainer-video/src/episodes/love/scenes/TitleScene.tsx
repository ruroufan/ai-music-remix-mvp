import React from "react";
import { useCurrentFrame } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam } from "../../glass/immersive";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// The title over a heart of light that beats — lub-dub — on every beat.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand, look } = useEpisode();
  const show = useRamp(0, 6);
  const ph = frame % BEAT;
  const beat = Math.exp(-ph / 3) + 0.6 * (ph >= 4 ? Math.exp(-(ph - 4) / 3) : 0);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.06, 1]} hits={[0]}>
        <div style={{ position: "absolute", inset: 0, opacity: show }}>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <path d="M0 -60 C-30 -130 -150 -130 -150 -40 C-150 40 -50 100 0 150 C50 100 150 40 150 -40 C150 -130 30 -130 0 -60 Z" transform={`translate(960 470) scale(${1.7 + 0.12 * beat})`} fill="rgba(255,120,150,0.12)" stroke="rgba(255,150,175,0.7)" strokeWidth={1.2} style={{ filter: `drop-shadow(0 0 ${20 + 30 * beat}px rgba(255,120,150,0.7))` }} />
          </svg>
          <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", fontSize: 160, fontWeight: 900, letterSpacing: 30, paddingLeft: 30, textShadow: `0 0 40px ${look.keyGlow}`, transform: `scale(${1 + 0.03 * beat})` }}>{brand.topic}</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>{brand.series} · {brand.topicLatin}</div>
        </div>
      </Cam>
      <Bokeh frame={frame} rgb="255, 170, 190" />
      <Sfx name="boom" at={0} volume={0.7} />
      {[1, 2, 3, 4, 5, 6, 7].map((k) => (
        <Sfx key={k} name="step" at={k * BEAT} volume={0.25} />
      ))}
    </ObsFrame>
  );
};
