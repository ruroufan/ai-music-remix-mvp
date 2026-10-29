import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Walker } from "../../nostalgia/road";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { GOLD, LEAF } from "../ruler";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const HUES = ["130, 200, 140", "255, 180, 120", "180, 160, 255", "120, 210, 220", "255, 150, 190", "220, 220, 120"];

// A town square seen side-on, and from the middle paths fanning out every
// way. People set off along them — each a different colour, each their own
// way; one trips and stumbles, gets up, carries on. 活力 · 哪怕走错.
export const TurnScene: React.FC<SceneProps> = ({ duration, lines, cues }) => {
  const frame = useCurrentFrame();
  const go = interpolate(frame, [BEAT, 9 * BEAT], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} hits={[5 * BEAT, ...keyHits(lines, cues, duration)]}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {HUES.map((h, i) => {
            const a = Math.PI + (i / (HUES.length - 1)) * Math.PI;
            return <line key={i} x1={960} y1={880} x2={960 + Math.cos(a) * 1000} y2={880 + Math.sin(a) * 500} stroke={`rgba(${h},0.3)`} strokeWidth={6} strokeDasharray="14 12" />;
          })}
        </svg>
        {HUES.map((h, i) => {
          const a = Math.PI + (i / (HUES.length - 1)) * Math.PI;
          const d = go * (300 + 300 * random(`d${i}`));
          const trip = i === 3 && frame > 5 * BEAT && frame < 6 * BEAT ? 25 : 0;
          return <Walker key={i} x={960 + Math.cos(a) * d} bottom={880 + Math.sin(a) * d * 0.5} height={220 - 80 * go * (-Math.sin(a))} face={Math.cos(a) < 0 ? "left" : "right"} walk={frame / 4 + i} lean={trip} glow={0.6} rgb={h} />;
        })}
        <div style={{ position: "absolute", left: 1220, top: 520, fontSize: 30, fontWeight: 900, color: "rgb(120,210,220)", opacity: frame > 5 * BEAT && frame < 7 * BEAT ? 1 : 0 }}>走错了 · 没关系</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontSize: 54, fontWeight: 900, letterSpacing: 12, color: `rgb(${GOLD})`, textShadow: `0 0 20px rgba(${GOLD},0.6)`, opacity: ramp(frame, 7 * BEAT, 10) }}>哪怕走错</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim, opacity: ramp(frame, 2 * BEAT, 10) }}>MILL · 社会的活力</div>
        <div style={{ position: "absolute", left: 930, top: 880, width: 60, height: 10, borderRadius: 5, background: `rgb(${LEAF})` }} />
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} opacity={0.4} />
      <Sfx name="whoosh" at={BEAT} volume={0.3} />
      <Sfx name="stamp" at={5 * BEAT} volume={0.25} />
      <Sfx name="glint" at={7 * BEAT} volume={0.45} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
