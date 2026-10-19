import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam, Shards } from "../immersive";
import { GLASS } from "../parts";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// The title in glass letters: a glint runs across them on every beat; on the
// second beat a crack shoots through them — and they hold.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const show = useRamp(0, 6);
  const crackAt = 2 * BEAT;
  const crack = interpolate(frame, [crackAt, crackAt + 6], [0, 1], clamp);
  const glint = ((frame % BEAT) / BEAT) * 1.6 - 0.3;
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.08, 1]} hits={[crackAt]}>
        <div style={{ position: "absolute", inset: 0, opacity: show }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontSize: 190, fontWeight: 900, letterSpacing: 36, paddingLeft: 36, color: `rgba(${GLASS},0.16)`, WebkitTextStroke: "2.5px rgba(235,245,255,0.95)", textShadow: `0 0 40px rgba(${GLASS},0.5)` }}>
            {brand.topic}
          </div>
          {/* the glint */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 360, height: 260, overflow: "hidden", mixBlendMode: "screen" }}>
            <div style={{ position: "absolute", top: 0, bottom: 0, left: `${glint * 100}%`, width: 160, background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.55), transparent)" }} />
          </div>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <path d="M560 420 L700 470 L760 440 L900 520 L980 480 L1120 560 L1200 520 L1360 590" fill="none" stroke="#fff" strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - crack} style={{ filter: `drop-shadow(0 0 8px rgba(${GLASS},1))` }} />
          </svg>
          <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>
            {brand.series} · {brand.topicLatin}
          </div>
        </div>
        <Shards x={960} y={500} frame={frame} at={crackAt} n={18} power={0.8} seed="tt" />
      </Cam>
      <Bokeh frame={frame} />
      <Sfx name="glint" at={0} volume={0.5} />
      <Sfx name="shatter" at={crackAt} volume={0.6} />
      <Sfx name="boom" at={crackAt} volume={0.6} />
      {[3, 4, 5, 6, 7].map((k) => (
        <Sfx key={k} name="glint" at={k * BEAT} volume={0.12} />
      ))}
    </ObsFrame>
  );
};
