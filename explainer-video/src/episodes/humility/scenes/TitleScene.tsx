import React from "react";
import { useCurrentFrame } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// The word, and an oval lens (a mask's eye-hole view) sliding across it on the
// beat: wherever the lens passes, 谦虚 reads 骄傲.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const show = useRamp(0, 6);
  const step = Math.floor(frame / BEAT);
  const within = (frame % BEAT) / BEAT;
  const xs = [760, 1160, 960, 760, 1160, 960, 760, 1160];
  const from = xs[step % xs.length], to = xs[(step + 1) % xs.length];
  const lx = from + (to - from) * (within < 0.35 ? 0 : Math.min(1, (within - 0.35) / 0.4) ** 2);
  const word = (text: string, style: React.CSSProperties) => (
    <div style={{ position: "absolute", left: 0, right: 0, top: 340, textAlign: "center", fontSize: 240, fontWeight: 900, letterSpacing: 70, paddingLeft: 70, ...style }}>{text}</div>
  );
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: show }}>
        <Halo x={960} y={480} r={460} intensity={0.8} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 220, textAlign: "center", fontSize: 40, fontWeight: 700, letterSpacing: 24, color: palette.dim }}>伪装的</div>
        {word(brand.topic ?? "", { color: "#030405", textShadow: `0 0 2px rgba(${palette.halo},0.95), 0 0 30px rgba(${palette.halo},0.5)` })}
        <div style={{ position: "absolute", inset: 0, clipPath: `ellipse(150px 170px at ${lx}px 470px)` }}>
          <div style={{ position: "absolute", inset: 0, background: "#0b0d12" }} />
          {word("骄傲", { color: palette.alert, textShadow: "0 0 30px rgba(255,77,109,0.6)" })}
        </div>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <ellipse cx={lx} cy={470} rx={150} ry={170} fill="none" stroke={`rgba(${palette.accentRgb},0.7)`} strokeWidth={2} strokeDasharray="6 6" />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 700, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>
          {brand.series} · {brand.topicLatin}
        </div>
      </div>
      <Sfx name="boom" at={0} volume={0.8} />
      {[1, 2, 3, 4, 5, 6, 7].map((k) => (
        <Sfx key={k} name="whoosh" at={k * BEAT} volume={0.12} />
      ))}
    </ObsFrame>
  );
};
