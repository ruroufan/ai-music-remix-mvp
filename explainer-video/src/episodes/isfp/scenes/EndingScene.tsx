import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { fonts } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { A_X, B_X, FLOOR, Footprints, Ground, Him, Meeting, Other, RIFT, ROSE, Rift, WARM } from "../crack";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const STOP = 1060; // where he ends up, across the crack

// The episode's picture, second half.
// 0 · ◀◀ 回放 — the tape rewinds: he walks backwards into frame, the footprints
//     lift off the floor one by one, until he's back where he stood. ▶ — he
//     starts to turn away again… and stops. Turns back. Steps across the
//     crack; it closes behind him into a warm seam.
// 1 · the two of them face to face. A bubble — 其实，我不想走。 — and between
//     them a warm bloom: 相遇.
// 2 · the channel card.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const rew = 3 * BEAT; // rewind runs 0 → rew
  const play = rew + 4;
  const back = interpolate(frame, [0, rew], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) });
  const rx = -120 + (A_X + 120) * back; // rewinding x
  const hesitate = interpolate(frame, [play + BEAT, play + 2 * BEAT, play + 3 * BEAT], [0, 1, 0], clamp); // half-turn and back
  const cross = interpolate(frame, [play + 4 * BEAT, play + 7 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const heal = interpolate(frame, [play + 6 * BEAT, c1 + 2 * BEAT], [0, 1], clamp);
  const x = frame < play ? rx : A_X + (STOP - A_X) * cross;
  const face: "left" | "right" = frame < play || (hesitate > 0.5 && cross === 0) ? "left" : "right";
  const walk = frame < play ? -Math.abs(rx - A_X) / 26 : cross > 0 && cross < 1 ? ((STOP - A_X) * cross) / 26 : 0;
  const meet = ramp(frame, c1 + BEAT, 16);
  const card = useRamp(c2, 12);
  const tape = frame < play + 2 * BEAT;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1.04, 1]} focus={{ x: 960, y: 560 }} hits={[play, play + 7 * BEAT, c1 + BEAT, ...keyHits(lines, cues, duration)]}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.92 * card }}>
          <Ground />
          {frame < play && <Footprints x0={A_X} x1={-120} shown={1 - back} />}
          <Rift open={1} heal={heal} frame={frame} />
          <Meeting x={(STOP + B_X) / 2} y={FLOOR - 230} k={meet} frame={frame} />
          <Other glow={0.4 + 0.4 * meet} />
          <Him x={x} face={face} walk={walk} glow={0.6 + 0.3 * meet} />
          <div style={{ position: "absolute", left: 840, top: 240, padding: "12px 24px", borderRadius: 18, border: `2px solid rgb(${ROSE})`, background: "rgba(20,12,16,0.85)", fontSize: 38, fontWeight: 900, color: `rgb(${ROSE})`, opacity: ramp(frame, c1 + 2 * BEAT, 8) * (1 - card) }}>其实，我不想走。</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontSize: 46, fontWeight: 900, letterSpacing: 14, color: `rgb(${WARM})`, opacity: ramp(frame, c1 + 4 * BEAT, 10) * (1 - card) }}>相 遇</div>
        </div>
        {/* the tape: rewind, then play */}
        {tape && (
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 6px)", opacity: frame < play ? 1 : 0.4 }} />
            {frame < play && <div style={{ position: "absolute", left: 0, right: 0, top: ((frame * 37) % 1080), height: 18, background: "rgba(255,255,255,0.07)" }} />}
            <div style={{ position: "absolute", left: 150, top: 140, fontFamily: fonts.mono, fontSize: 40, letterSpacing: 8, color: frame < play ? `rgb(${RIFT})` : "rgb(130,210,150)" }}>
              <svg width={frame < play ? 64 : 34} height={36} viewBox={frame < play ? "0 0 64 36" : "0 0 34 36"} style={{ marginRight: 16, verticalAlign: "-4px" }}>
                {frame < play ? <path d="M30 0 L0 18 L30 36 Z M62 0 L32 18 L62 36 Z" fill={`rgb(${RIFT})`} /> : <path d="M0 0 L32 18 L0 36 Z" fill="rgb(130,210,150)" />}
              </svg>
              {frame < play ? "回放" : "这一次"}
            </div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={WARM} opacity={(0.3 + 0.5 * meet) * (1 - card)} />
      {card > 0 && <EndCard opacity={card} signoffAt={c2 + BEAT} />}
      <Sfx name="glitch" at={0} volume={0.35} />
      <Sfx name="rise" at={2} volume={0.25} />
      <Sfx name="shutter" at={play} volume={0.35} />
      <Sfx name="whoosh" at={play + BEAT} volume={0.2} />
      {Array.from({ length: 5 }, (_, i) => (
        <Sfx key={i} name="step" at={play + 4 * BEAT + 6 + i * 9} volume={0.2} />
      ))}
      <Sfx name="glint" at={play + 7 * BEAT} volume={0.4} />
      <Sfx name="glint" at={c1 + BEAT} volume={0.45} />
      <Sfx name="boom" at={c2} volume={0.3} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
