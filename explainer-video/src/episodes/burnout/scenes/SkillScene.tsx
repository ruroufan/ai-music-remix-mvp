import React from "react";
import { useCurrentFrame } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam } from "../../glass/immersive";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";


// The console's STOP button, very close: it lights up, breathing, and under it
// a new label — 不做的能力 / THE ABILITY NOT TO.
export const SkillScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const glow = useRamp(BEAT, 16);
  const label = useRamp(5 * BEAT, 10);
  const breathe = 0.85 + 0.15 * Math.sin((frame / (2 * BEAT)) * Math.PI);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.12]} focus={{ x: 960, y: 420 }}>
        <div style={{ position: "absolute", left: 460, top: 160, width: 1000, height: 560, borderRadius: 40, background: "#0a0e14", border: `3px solid ${palette.faint}`, transform: "perspective(1400px) rotateX(14deg)" }} />
        <Halo x={960} y={400} r={420} intensity={0.7 * glow * breathe} rgb="255, 77, 109" />
        <div style={{ position: "absolute", left: 960 - 200, top: 400 - 130, width: 400, height: 260, borderRadius: 40, background: `rgba(255,77,109,${0.35 + 0.6 * glow})`, boxShadow: `0 0 ${80 * glow * breathe}px rgba(255,77,109,0.9), inset 0 -16px 0 rgba(0,0,0,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.mono, fontSize: 110, fontWeight: 700, color: "#fff", letterSpacing: 8 }}>STOP</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", opacity: label, transform: `translateY(${(1 - label) * 20}px)` }}>
          <div style={{ fontSize: 60, fontWeight: 900, letterSpacing: 14, color: look.key, textShadow: `0 0 20px ${look.keyGlow}` }}>不做的能力</div>
          <div style={{ marginTop: 8, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.dim }}>THE ABILITY NOT TO</div>
        </div>
      </Cam>
      <Bokeh frame={frame} rgb="255, 120, 140" opacity={0.7} />
      <Sfx name="rise" at={0} volume={0.25} />
      <Sfx name="glint" at={5 * BEAT} volume={0.45} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
