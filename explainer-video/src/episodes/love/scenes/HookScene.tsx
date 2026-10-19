import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam } from "../../glass/immersive";
import { Couple, FLOOR } from "../lovers";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// 0 · the two of them, her whole weight on him, both rocking; the more she
//     leans, the more her outline thins to a dashed line.
// 1 · a label pinned on her: 深情 — and on the beat it flips over: 恋爱脑.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const lean = interpolate(frame, [0, 3 * BEAT], [0.5, 1], clamp);
  const ghost = interpolate(frame, [3 * BEAT, 7 * BEAT], [0, 0.6], clamp);
  const pin = interpolate(frame, [cues[1] + BEAT, cues[1] + BEAT + 6], [0, 1], clamp);
  const flip = interpolate(frame, [cues[1] + 4 * BEAT, cues[1] + 4 * BEAT + 8], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.12]} focus={{ x: 960, y: 520 }} hits={[cues[1] + 4 * BEAT]}>
        <Couple cx={960} frame={frame} lean={lean} sway={1} ghost={ghost} />
        {pin > 0 && (
          <div style={{ position: "absolute", left: 780, top: FLOOR - 250, width: 170, height: 70, perspective: 600, opacity: pin, transform: `scale(${2 - pin})` }}>
            <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateY(${flip * 180}deg)` }}>
              <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "#fbe9ee", color: "#c2577a", fontSize: 36, fontWeight: 900, transform: "rotate(-6deg)" }}>深情</div>
              <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "#2a0e14", border: `2px solid ${look.key}`, color: look.key, fontSize: 36, fontWeight: 900, transform: "rotateY(180deg) rotate(-6deg)" }}>恋爱脑</div>
            </div>
          </div>
        )}
        <div style={{ position: "absolute", left: 560, top: 230, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 5, color: "rgba(232,238,242,0.6)", opacity: ghost }}>SELF · {Math.round(100 - ghost * 130)}%</div>
      </Cam>
      <Bokeh frame={frame} rgb="255, 170, 190" />
      <Sfx name="whoosh" at={0} volume={0.25} />
      <Sfx name="glitch" at={3 * BEAT} volume={0.25} />
      <Sfx name="stamp" at={cues[1] + BEAT} volume={0.5} />
      <Sfx name="whoosh" at={cues[1] + 4 * BEAT} volume={0.45} />
      <Sfx name="boom" at={cues[1] + 4 * BEAT} volume={0.4} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
