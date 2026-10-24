import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Field, GROUND, PLOTS, Plot, Runner, SUN, plotCx } from "../field";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const ME = 2;

// The field, and over every plot a glowing tag: 可能. He steps into one —
// and the light closes in on it; one by one the other plots' 可能 go out:
// 放弃. Threads run from him back to every one of them, pulling. He looks
// back over his shoulder: 舍不得.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const narrow = interpolate(frame, [c1, c1 + 4 * BEAT], [0, 1], clamp);
  const lost = (i: number) => (i === ME ? 0 : ramp(frame, c1 + BEAT + [0, 0, 0, 1, 2, 3][i] * 6 + (i < ME ? i * 6 : 0), 8));
  const pull = ramp(frame, c1 + 5 * BEAT, 10);
  const back = frame > c1 + 7 * BEAT;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} focus={{ x: plotCx(ME), y: 700 }} hits={[c1, c1 + 5 * BEAT, c1 + 7 * BEAT, ...keyHits(lines, cues, duration)]}>
        <Field />
        {PLOTS.map((_, i) => (
          <div key={i}>
            <Plot i={i} g={0.3} seeded={1} dim={0.6 * lost(i)} />
            <div style={{ position: "absolute", left: PLOTS[i].x + 40, width: PLOTS[i].w - 80, top: GROUND - 200, textAlign: "center", padding: "6px 0", borderRadius: 10, border: `2px solid rgba(${SUN},${0.8 * (1 - lost(i))})`, fontSize: 28, fontWeight: 900, color: `rgba(${SUN},${1 - 0.8 * lost(i)})`, boxShadow: `0 0 ${20 * (1 - lost(i))}px rgba(${SUN},0.5)` }}>可能</div>
          </div>
        ))}
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at ${plotCx(ME)}px ${GROUND - 60}px, transparent ${60 - 45 * narrow}%, rgba(0,0,0,${0.6 * narrow}) ${70 - 40 * narrow}%)` }} />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: pull }}>
          {PLOTS.map((_, i) => (i === ME ? null : <path key={i} d={`M${plotCx(ME)} ${GROUND - 140} Q${(plotCx(ME) + plotCx(i)) / 2} ${GROUND - 260 + Math.sin(frame / 8 + i) * 10} ${plotCx(i)} ${GROUND - 170}`} fill="none" stroke={`rgba(${SUN},0.6)`} strokeWidth={2.5} strokeDasharray="8 6" />))}
        </svg>
        <Runner x={plotCx(ME)} walk={0} run={0} face={back ? "left" : "right"} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: fonts.mono, fontSize: 26, letterSpacing: 10, color: palette.dim, opacity: frame >= c1 + BEAT ? 1 - pull : 0 }}>深入一件 · 放弃其他所有</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontSize: 60, fontWeight: 900, letterSpacing: 14, color: `rgb(${SUN})`, textShadow: `0 0 24px rgba(${SUN},0.7)`, opacity: back ? ramp(frame, c1 + 7 * BEAT, 8) : 0 }}>舍不得</div>
      </Cam>
      <Bokeh frame={frame} rgb={SUN} opacity={0.4} />
      <Sfx name="shutter" at={c1} volume={0.3} />
      {PLOTS.map((_, i) => (i === ME ? null : <Sfx key={i} name="glitch" at={c1 + BEAT + [0, 0, 0, 1, 2, 3][i] * 6 + (i < ME ? i * 6 : 0)} volume={0.08} />))}
      <Sfx name="rise" at={c1 + 5 * BEAT} volume={0.3} />
      <Sfx name="glint" at={c1 + 7 * BEAT} volume={0.4} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
