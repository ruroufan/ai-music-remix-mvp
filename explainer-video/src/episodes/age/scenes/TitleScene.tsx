import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// A split-flap counter flips through the ages behind the title, one per beat
// — 25, 26, 27 … — each flip a little redder.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const show = useRamp(0, 6);
  const step = Math.floor(frame / BEAT);
  const within = (frame % BEAT) / BEAT;
  const n = 25 + step;
  const flip = within < 0.25 ? within / 0.25 : 1;
  const red = Math.min(1, step / 6);
  const card = (digit: string, i: number) => (
    <div key={i} style={{ position: "relative", width: 230, height: 320, borderRadius: 16, background: "#10151f", border: `1px solid ${palette.faint}`, overflow: "hidden", perspective: 900 }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.mono, fontSize: 250, fontWeight: 700, color: `rgba(${Math.round(232 + 23 * red)}, ${Math.round(238 - 161 * red)}, ${Math.round(242 - 133 * red)}, 0.35)` }}>{digit}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: "50%", background: "#141a26", transformOrigin: "50% 100%", transform: `rotateX(${(1 - flip) * -90}deg)`, borderBottom: "2px solid #06080c", opacity: flip < 1 ? 0.9 : 0 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 2, background: "#06080c" }} />
    </div>
  );
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: show }}>
        <Halo x={960} y={470} r={480} intensity={0.6 + 0.3 * red} rgb={red > 0.5 ? "255, 77, 109" : undefined} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", gap: 24 }}>{[...String(n)].map(card)}</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 390, textAlign: "center", fontSize: 150, fontWeight: 900, letterSpacing: 26, color: palette.ink, textShadow: `0 0 40px rgba(0,0,0,0.9), 0 0 2px rgba(${palette.halo},0.9)`, transform: `scale(${interpolate(frame, [0, 10], [1.15, 1], { extrapolateRight: "clamp" })})` }}>{brand.topic}</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>
          {brand.series} · {brand.topicLatin}
        </div>
      </div>
      <Sfx name="boom" at={0} volume={0.8} />
      {[1, 2, 3, 4, 5, 6, 7].map((k) => (
        <Sfx key={k} name="shutter" at={k * BEAT} volume={0.25} />
      ))}
    </ObsFrame>
  );
};
