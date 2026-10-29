import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Walker } from "../../nostalgia/road";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { GOLD, WARM } from "../stage";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const GROUND = 780;

// Night. He walks a dark road alone — but far off, up on the hill, one window
// is lit: a friend's. Nobody comes out; nobody needs to. A thin warm thread
// runs from that window to him, and he walks lighter. 帮助 (small) < 相信.
export const TurnScene: React.FC<SceneProps> = ({ duration, lines, cues }) => {
  const frame = useCurrentFrame();
  const win = ramp(frame, BEAT, 12);
  const thread = interpolate(frame, [3 * BEAT, 5 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const words = ramp(frame, 5 * BEAT, 10);
  const x = 520 + frame * 1.6;
  const hx = x, hy = GROUND - 220;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} hits={[BEAT, 5 * BEAT, ...keyHits(lines, cues, duration)]}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <path d="M0 520 Q500 440 1000 480 Q1400 510 1920 420 L1920 1080 L0 1080 Z" fill="#0e1014" />
          <line x1={0} y1={GROUND} x2={1920} y2={GROUND} stroke="rgba(232,238,242,0.2)" strokeWidth={2} />
          <path d="M1480 470 L1480 380 L1540 340 L1600 380 L1600 470 Z" fill="#14161c" stroke="rgba(232,238,242,0.2)" strokeWidth={2} />
          <rect x={1522} y={390} width={36} height={36} fill={`rgba(${WARM},${0.2 + 0.8 * win})`} />
          <path d={`M1540 408 Q${(1540 + hx) / 2} ${Math.min(hy, 408) - 160} ${1540 + (hx - 1540) * thread} ${408 + (hy - 408) * thread}`} fill="none" stroke={`rgba(${WARM},0.8)`} strokeWidth={3} strokeDasharray={`${1600 * thread} 3000`} />
        </svg>
        <Halo x={1540} y={408} r={160} intensity={0.7 * win} rgb={WARM} />
        <Walker x={x} bottom={GROUND} height={340} face="right" walk={frame / 6} glow={0.3 + 0.5 * thread} rgb={GOLD} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontSize: 40, fontWeight: 900, letterSpacing: 10, color: palette.ink, opacity: words }}>
          <span style={{ fontSize: 28, color: palette.dim }}>帮助</span> &lt; <span style={{ fontSize: 60, color: `rgb(${WARM})` }}>相信</span>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", fontFamily: fonts.mono, fontSize: 17, letterSpacing: 2, color: palette.dim, opacity: ramp(frame, 7 * BEAT, 12) }}>“IT IS NOT SO MUCH OUR FRIENDS’ HELP THAT HELPS US, AS THE CONFIDENCE OF THEIR HELP.”</div>
      </Cam>
      <Bokeh frame={frame} rgb={WARM} opacity={0.25 + 0.2 * thread} />
      <Sfx name="glint" at={BEAT} volume={0.3} />
      <Sfx name="rise" at={3 * BEAT} volume={0.25} />
      <Sfx name="stamp" at={5 * BEAT} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
