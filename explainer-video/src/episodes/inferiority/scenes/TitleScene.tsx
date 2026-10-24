import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// Title card: the word is cracked, light leaks through the crack — and on the
// third beat a strip of gold is slapped over it.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const show = useRamp(0, 6);
  const sweep = interpolate(frame, [0, duration], [-0.25, 1.25]);
  const punch = interpolate(frame, [0, BEAT], [1.12, 1], { extrapolateRight: "clamp" });
  const crack = useRamp(BEAT, BEAT);
  const gold = interpolate(frame, [3 * BEAT - 4, 3 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const crackPath = "M720 380 L810 430 L780 470 L900 500 L880 540 L1010 560 L990 600 L1170 640";

  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: show }}>
        <Halo x={560 + sweep * 800} y={470} r={440} intensity={1.15} />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 330,
            textAlign: "center",
            fontSize: 230,
            fontWeight: 900,
            letterSpacing: 60,
            color: "#030405",
            transform: `scale(${punch})`,
            textShadow: `0 0 2px rgba(${palette.halo},0.95), 0 0 26px rgba(${palette.halo},0.6)`,
          }}
        >
          {brand.topic}
        </div>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <path d={crackPath} fill="none" stroke={`rgb(${palette.halo})`} strokeWidth={4} strokeDasharray={900} strokeDashoffset={900 * (1 - crack)} style={{ filter: `drop-shadow(0 0 8px rgb(${palette.halo}))` }} />
        </svg>
        {/* the gold patch */}
        <div
          style={{
            position: "absolute",
            left: 790,
            top: 480,
            width: 320,
            height: 64,
            transform: `rotate(14deg) scale(${1 + (1 - gold) * 0.5})`,
            opacity: gold,
            background: "linear-gradient(135deg, #f6dc8a, #c99a35 55%, #8a6216)",
            border: "1px solid #fff3c4",
            boxShadow: "0 8px 30px rgba(201,154,53,0.4)",
          }}
        />
        <div style={{ position: "absolute", left: 0, right: 0, top: 660, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>
          {brand.series} · {brand.topicLatin}
        </div>
      </div>
      <Sfx name="boom" at={0} volume={0.8} />
      <Sfx name="glitch" at={BEAT} volume={0.4} />
      <Sfx name="stamp" at={3 * BEAT} volume={0.6} />
    </ObsFrame>
  );
};
