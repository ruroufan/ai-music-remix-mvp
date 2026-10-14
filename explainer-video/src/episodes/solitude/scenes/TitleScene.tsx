import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Prick } from "../porcupine";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// The two characters behave like the porcupines: every beat they lean in,
// prick (a red spark between them), and spring apart again.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const show = useRamp(0, 6);
  const t = (frame % BEAT) / BEAT;
  // close in over the first 60% of the beat, snap apart after
  const close = t < 0.6 ? t / 0.6 : 1 - (t - 0.6) / 0.4;
  const gap = interpolate(close, [0, 1], [200, 26]);
  const prick = t > 0.5 && t < 0.75 ? 1 - Math.abs(t - 0.62) / 0.13 : 0;
  const [a, b] = [...(brand.topic ?? "")];
  const ch = (c: string, dx: number) => (
    <div style={{ position: "absolute", left: 960 + dx - 120, top: 340, width: 240, textAlign: "center", fontSize: 230, fontWeight: 900, color: "#030405", textShadow: `0 0 2px rgba(${palette.halo},0.95), 0 0 30px rgba(${palette.halo},0.55)` }}>{c}</div>
  );
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: show }}>
        <Halo x={960} y={480} r={460} intensity={0.85} />
        {ch(a, -gap / 2 - 120)}
        {ch(b, gap / 2 + 120)}
        <Prick x={960} y={480} k={Math.max(0, prick)} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 690, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>
          {brand.series} · {brand.topicLatin}
        </div>
      </div>
      <Sfx name="boom" at={0} volume={0.8} />
      {[0, 1, 2, 3, 4, 5, 6].map((k) => (
        <Sfx key={k} name="glint" at={k * BEAT + BEAT / 2} volume={0.15} />
      ))}
    </ObsFrame>
  );
};
