import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { Halo } from "../../../channels/backlit/parts";
import { useEpisode } from "../../../EpisodeContext";
import { Walker } from "../../nostalgia/road";
import { Bokeh, Cam } from "../../glass/immersive";
import { FLOOR, Treadmill } from "../treadmill";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const WARM = "255, 199, 122";

// The episode's picture. 0 · he reaches out and presses STOP; the belt runs
//     down over three beats, the console goes from 你可以 to 可以停下, 0.0 km/h.
//     He stands still, breathing.
// 1 · he steps down onto the floor — real ground — and after a beat starts to
//     walk, slowly, on his own; the treadmill slides away behind him, and
//     ahead it's getting light.
// 2 · the channel card.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2] = cues;
  const pressAt = BEAT;
  const press = interpolate(frame, [pressAt - 6, pressAt, pressAt + 10], [0, 1, 0], clamp);
  const stopGlow = interpolate(frame, [pressAt, pressAt + 4], [0, 1], clamp);
  const speedAt = (f: number) => interpolate(f, [0, pressAt, pressAt + 3 * BEAT], [0.7, 0.7, 0], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) });
  const sp = speedAt(frame);
  const down = interpolate(frame, [c1, c1 + 12], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const go = c1 + 2 * BEAT;
  const pace = (f: number) => interpolate(f, [go, go + 2 * BEAT], [0, 1], clamp);
  let walked = 0;
  for (let f = go; f < frame; f++) walked += pace(f);
  const pan = walked * 2.2;
  const dawn = interpolate(frame, [c1, c2], [0, 1], clamp);
  const card = useRamp(c2, 12);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.12, 1]} focus={{ x: 900, y: 520 }} hits={[pressAt]}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.75 * card }}>
          {/* light coming up ahead of him */}
          <div style={{ position: "absolute", left: 1100, top: 200, width: 1200, height: 900, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(${WARM},${0.35 * dawn}), transparent 65%)` }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR, height: 2, background: `linear-gradient(90deg, transparent, rgba(${WARM},${0.2 + 0.4 * dawn}), transparent)` }} />
          <Treadmill cx={900 - pan} frame={frame} speedAt={speedAt} text={frame >= pressAt ? "可以停下" : "你可以"} kmh={6 * (sp / 0.7) + (sp > 0 ? 8 * sp : 0)} stopGlow={stopGlow} press={press} run={frame < c1} lift={0.4 + 0.6 * interpolate(frame, [pressAt, c1], [0, 1], clamp)} />
          {frame < c1 && frame >= pressAt - 6 && frame < pressAt + 12 && (
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <line x1={856} y1={FLOOR - 34 - 210} x2={1000 + 180 * Math.min(1, press * 1.2)} y2={FLOOR - 34 - 250 - 120 * Math.min(1, press * 1.2)} stroke="#030405" strokeWidth={12} strokeLinecap="round" />
            </svg>
          )}
          {frame >= c1 && (
            <>
              <Halo x={840} y={FLOOR - 160} r={260} intensity={0.3 * (1 - dawn) + 0.3} rgb={WARM} />
              <Walker x={840 + 40 * down} bottom={FLOOR - 34 * (1 - down)} height={300} face="right" walk={walked * 0.09} lean={-3 * pace(frame)} glow={0.9} rgb={WARM} />
              <div style={{ position: "absolute", left: 810, top: FLOOR - 360, fontSize: 26, fontWeight: 800, color: look.key, opacity: interpolate(frame, [c1 + 12, c1 + 20, go, go + 10], [0, 1, 1, 0], clamp) }}>呼——</div>
            </>
          )}
        </div>
      </Cam>
      <Bokeh frame={frame} rgb={WARM} opacity={(0.5 + 0.5 * dawn) * (1 - card)} />
      {card > 0 && <EndCard opacity={card} signoffAt={c2 + BEAT} />}
      <Sfx name="stamp" at={pressAt} volume={0.5} />
      <Sfx name="rise" at={pressAt + 2} volume={0.2} />
      <Sfx name="step" at={c1 + 10} volume={0.4} />
      {[0, 1, 2, 3].map((k) => (
        <Sfx key={k} name="step" at={go + BEAT + k * 2 * BEAT} volume={0.22} />
      ))}
      <Sfx name="glint" at={go} volume={0.35} />
      <Sfx name="boom" at={c2} volume={0.35} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
