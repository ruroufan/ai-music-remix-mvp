import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { keyLandsAt } from "../../../components/Kinetic";
import { Walker } from "../../nostalgia/road";
import { FLOOR_Y, LightPool, Stander } from "../circles";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SMALL = 330;
const BIG = 1000;
const SPEED = 6.5; // px per frame
// question marks out in the dark beyond the big pool
const FIELD = Array.from({ length: 34 }, (_, i) => ({ x: 1480 + random(`fx-${i}`) * 2200, y: 170 + random(`fy-${i}`) * 600, s: 22 + random(`fs-${i}`) * 16 }));

// The two pools from the start: the small one, its owner chin-up; the big
// one, its owner looking down, question marks all around.
// 0 · keep the doubt — he lifts his head.
// 1 · and walks on out of his circle, into the dark; the camera goes with
//     him. Around him, outward from him, the question marks turn into small
//     lights; when 更大的世界 lands, a ring runs out across the floor from his
//     feet, wider than the screen. The small pool stays as it was.
// 2 · the channel card.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const intro = useRamp(0, 12);
  const lift = interpolate(frame, [4 * BEAT, 6 * BEAT], [0, 1.15], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const walkT = Math.max(0, frame - cues[1]);
  const he = BIG + SPEED * walkT;
  // the camera eases into following him
  const ox = -0.65 * SPEED * Math.max(0, walkT - 20 * (1 - Math.exp(-walkT / 20)));
  const turn = interpolate(frame, [cues[1] - 2, cues[1] + 3], [0, 1], clamp);
  const R = 120 + 1300 * interpolate(walkT, [0, cues[2] - cues[1]], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) });
  const chest = FLOOR_Y - 150;
  const star = (x: number, y: number) => Math.max(0, Math.min(1, (R - Math.hypot(x - he, (y - chest) * 1.6)) / 120));
  const keyAt = cues[1] + keyLandsAt(lines[1].text, BEAT);
  const ring = interpolate(frame, [keyAt, keyAt + 3 * BEAT], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const card = useRamp(cues[2], 12);
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: intro * (1 - 0.75 * card) }}>
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${ox}px)` }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.8 }}>
            <LightPool cx={SMALL} rx={120} frame={frame} density={0.5} seed="es" />
            <Stander x={SMALL} height={200} lift={2} glow={0.8} />
          </div>
          <LightPool cx={BIG} rx={430} frame={frame} qs={0.75 + 0.25 * Math.min(1, lift)} seed="h" starAt={star} />
          {FIELD.map((q, i) => {
            const st = star(q.x, q.y);
            const flick = 0.45 + 0.55 * Math.abs(Math.sin(frame / (11 + (i % 5)) + i));
            return st > 0.5 ? (
              <div key={i} style={{ position: "absolute", left: q.x - 4, top: q.y - 4, width: 8, height: 8, borderRadius: 4, background: palette.accent, boxShadow: `0 0 14px ${palette.accent}`, opacity: flick * Math.min(1, (st - 0.5) * 4), transform: `scale(${1 + 1.5 * Math.max(0, 1 - (st - 0.5) * 4)})` }} />
            ) : (
              <div key={i} style={{ position: "absolute", left: q.x, top: q.y, transform: "translate(-50%, -50%)", fontFamily: fonts.mono, fontSize: q.s, fontWeight: 700, color: `rgba(232,238,242,${0.45 * flick})`, opacity: 1 - st * 2 }}>
                ?
              </div>
            );
          })}
          {ring > 0 && ring < 1 && (
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              <ellipse cx={he} cy={FLOOR_Y} rx={60 + 1800 * ring} ry={(60 + 1800 * ring) * 0.26} fill="none" stroke={look.key} strokeWidth={3} opacity={1 - ring} style={{ filter: `drop-shadow(0 0 10px ${look.key})` }} />
            </svg>
          )}
          {turn < 1 && <Stander x={BIG} height={250} lift={lift} glow={0.7 + 0.4 * Math.min(1, lift)} opacity={1 - turn} />}
          {turn > 0 && <Walker x={he} bottom={FLOOR_Y} height={250} face="right" walk={(walkT / BEAT) * Math.PI + Math.PI / 2} glow={1.1} opacity={turn} />}
        </div>
      </div>
      {card > 0 && <EndCard opacity={card} signoffAt={cues[2] + BEAT} />}
      <Sfx name="rise" at={4 * BEAT} volume={0.3} />
      <Sfx name="glint" at={6 * BEAT} volume={0.3} />
      {Array.from({ length: 8 }, (_, k) => (
        <Sfx key={k} name="step" at={cues[1] + (k + 1) * BEAT} volume={0.14} />
      ))}
      <Sfx name="glint" at={keyAt} volume={0.4} />
      <Sfx name="boom" at={cues[2]} volume={0.35} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
