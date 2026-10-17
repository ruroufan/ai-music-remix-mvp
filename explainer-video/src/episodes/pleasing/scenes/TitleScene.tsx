import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { brand } from "../episode";
import { fonts, palette } from "../../../channels/backlit/look";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// Title card: "讨好" in black, a light sweeping *behind* the letters so only
// their edges glow. The beat drops on its first frame.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const show = useRamp(0, 6);
  const sweep = interpolate(frame, [0, duration], [-0.25, 1.25]);
  const punch = interpolate(frame, [0, BEAT], [1.12, 1], { extrapolateRight: "clamp" });

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
        <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>
          {brand.series} · {brand.topicLatin}
        </div>
      </div>
      <Sfx name="boom" at={0} volume={0.8} />
      <Sfx name="glint" at={4 * BEAT} volume={0.25} />
    </ObsFrame>
  );
};
