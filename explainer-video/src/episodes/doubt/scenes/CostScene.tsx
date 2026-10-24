import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Walker } from "../../nostalgia/road";
import { FLOOR_Y, LightPool, Stander } from "../circles";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SPOTS = [
  { x: 840, tag: "升职" },
  { x: 1200, tag: "发言" },
  { x: 1560, tag: "舞台" },
];

// A chair, side-on, facing left, its front edge at x.
const Chair: React.FC<{ x: number; glow: number }> = ({ x, glow }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
    <g fill="#141a24" stroke={`rgba(${palette.halo},${0.25 + 0.6 * glow})`} strokeWidth={2}>
      <rect x={x} y={FLOOR_Y - 92} width={92} height={12} rx={3} />
      <rect x={x + 80} y={FLOOR_Y - 200} width={12} height={120} rx={3} />
      <rect x={x + 6} y={FLOOR_Y - 80} width={8} height={80} />
      <rect x={x + 78} y={FLOOR_Y - 80} width={8} height={80} />
    </g>
  </svg>
);

// 0 · three spots of light, a chair in each — 升职, 发言, 舞台 — light up one
//     after another. Each time, he leans toward it… and steps back.
// 1 · the people who never doubt themselves march in from the right in a
//     column and take them, far end first, one per two beats. His own light
//     dims.
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const show = useRamp(0, 10);
  const backs = SPOTS.map((_, k) => interpolate(frame, [(2 + 2 * k) * BEAT, (2 + 2 * k) * BEAT + 8], [0, 1], clamp));
  const back = backs.reduce((a, b) => a + b, 0);
  const lean = SPOTS.map((_, k) => interpolate(frame, [(1 + 2 * k) * BEAT + HALF_BEAT, (2 + 2 * k) * BEAT, (2 + 2 * k) * BEAT + 6], [0, 1, 0], clamp)).reduce((a, b) => a + b, 0);
  // they come in from the right in a column and fill the spots from the far end
  const arriveAt = (k: number) => cues[1] + (2 + 2 * (SPOTS.length - 1 - k)) * BEAT;
  const taken = SPOTS.map((_, k) => interpolate(frame, [arriveAt(k), arriveAt(k) + 6], [0, 1], clamp));
  const dim = taken.reduce((a, b) => a + b, 0) / SPOTS.length;
  const meX = 400 - 34 * back;
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: show }}>
        <LightPool cx={meX} rx={250} frame={frame} glow={0.6 - 0.35 * dim} qs={0.7} seed="cm" beam={false} />
        <Stander x={meX + 30 * lean} height={240} lift={0.2 - 0.2 * Math.min(1, back / 2)} glow={0.7 - 0.4 * dim} />
        {SPOTS.map((s, k) => {
          const on = interpolate(frame, [(1 + 2 * k) * BEAT, (1 + 2 * k) * BEAT + 6], [0, 1], clamp);
          // the arrow he almost follows
          const reach = interpolate(frame, [(1 + 2 * k) * BEAT + HALF_BEAT, (2 + 2 * k) * BEAT, (2 + 2 * k) * BEAT + 8], [0, 1, 0], clamp);
          // the one who takes it
          const walkFrom = cues[1] + (SPOTS.length - 1 - k) * HALF_BEAT;
          const arrive = arriveAt(k);
          const wx = interpolate(frame, [walkFrom, arrive], [2050, s.x - 30], clamp);
          const walking = frame >= walkFrom && frame < arrive;
          return (
            <div key={s.tag} style={{ position: "absolute", inset: 0 }}>
              <LightPool cx={s.x} rx={110} frame={frame} glow={on} qs={0} seed={`cs${k}`} />
              <Chair x={s.x + 10} glow={on} />
              <div style={{ position: "absolute", left: s.x - 90, width: 180, top: 300, textAlign: "center", opacity: on }}>
                <div style={{ display: "inline-block", padding: "6px 18px", borderRadius: 10, border: `2px solid ${taken[k] > 0.5 ? palette.faint : look.key}`, color: taken[k] > 0.5 ? palette.dim : look.key, fontSize: 32, fontWeight: 900, letterSpacing: 4, transform: `scale(${1.3 - 0.3 * on})`, boxShadow: taken[k] > 0.5 ? undefined : `0 0 20px ${look.keyGlow}` }}>{s.tag}</div>
                <div style={{ marginTop: 8, fontFamily: fonts.mono, fontSize: 16, letterSpacing: 4, color: palette.dim, opacity: taken[k] }}>TAKEN</div>
              </div>
              {reach > 0.01 && (
                <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
                  <line x1={meX + 90} y1={FLOOR_Y - 150} x2={meX + 90 + (s.x - 130 - meX - 90) * reach} y2={FLOOR_Y - 150} stroke="rgba(232,238,242,0.5)" strokeWidth={3} strokeDasharray="10 10" />
                </svg>
              )}
              {walking && <Walker x={wx} bottom={FLOOR_Y} height={230} face="left" walk={(frame / BEAT) * Math.PI + Math.PI / 2} glow={0.9} />}
              {frame >= arrive && <Stander x={s.x - 30} height={230} lift={2} glow={1} />}
            </div>
          );
        })}
      </div>
      {SPOTS.map((_, k) => (
        <React.Fragment key={k}>
          <Sfx name="glint" at={(1 + 2 * k) * BEAT} volume={0.3} />
          <Sfx name="step" at={(2 + 2 * k) * BEAT} volume={0.3} />
          <Sfx name="stamp" at={arriveAt(k)} volume={0.45} />
        </React.Fragment>
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
