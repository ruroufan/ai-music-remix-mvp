import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam } from "../../glass/immersive";
import { BP, Blueprint, GOLD } from "../blueprint";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// His blueprint, big. A magnifying glass — 审视 — moves slowly across it; on
// the second line it comes to rest over the ticks, and every ✓ turns into a ？:
// the thing being examined now is his own being right.
export const ExamineScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1] = cues;
  const t = interpolate(frame, [0, c1 + BEAT], [0, 1], { ...clamp, easing: (k) => k * k * (3 - 2 * k) });
  const lx = 600 + 720 * t, ly = 400 + 70 * Math.sin(t * Math.PI * 2);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} hits={[...[c1 + BEAT], ...keyHits(lines, cues, duration)]}>
        <Blueprint x={460} y={150} w={1000} frame={frame} draw={1} checks={1} q={frame >= c1 + BEAT ? 1 : 0} />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <circle cx={lx} cy={ly} r={130} fill="rgba(200,230,255,0.08)" stroke={`rgb(${GOLD})`} strokeWidth={6} style={{ filter: `drop-shadow(0 0 14px rgba(${GOLD},0.7))` }} />
          <line x1={lx + 92} y1={ly + 92} x2={lx + 200} y2={ly + 200} stroke={`rgb(${GOLD})`} strokeWidth={16} strokeLinecap="round" />
        </svg>
        <div style={{ position: "absolute", left: lx - 60, width: 120, top: ly - 180, textAlign: "center", fontSize: 34, fontWeight: 900, color: look.key, textShadow: `0 0 14px ${look.keyGlow}` }}>审视</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 110, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: `rgb(${BP})`, opacity: frame >= c1 + BEAT ? 1 : 0 }}>审视对象：你自己的正确</div>
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} opacity={0.6} />
      <Sfx name="whoosh" at={0} volume={0.25} />
      <Sfx name="glitch" at={c1 + BEAT} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
