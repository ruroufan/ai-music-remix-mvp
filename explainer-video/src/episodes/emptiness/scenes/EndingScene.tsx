import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { useEpisode } from "../../../EpisodeContext";
import { Seated } from "../../friction/tangle";
import { Bokeh, Cam } from "../../glass/immersive";
import { Desk, Pendulum, Rider, WARM, bobAt, swing } from "../pendulum";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BAR, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FLOOR = 780;
const DESK = 1660; // the desk's left edge, in the world
const CHAIR = DESK - 20; // the chair's front edge
const S = 1.2;

// The episode's picture. 0 · he swings up to the right-hand end — and at the
//     top of the swing he lets go and jumps. The camera follows him across;
//     he lands in a chair at a desk: a bowl, an open book, and the lamp comes
//     on. Behind him the pendulum swings on, empty, smaller.
// 1 · he reads; the pendulum winds down to a stop in the dark.
// 2 · the channel card.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2] = cues;
  const J = 5 * BEAT; // the jump: the right-hand extreme
  const phase = (-Math.PI * J) / BAR;
  const amp = frame < J ? 46 : interpolate(frame, [J, c1, c2], [46, 22, 0], clamp);
  const deg = swing(frame, BAR, amp, phase);
  const leap = interpolate(frame, [J, J + 18], [0, 1], clamp);
  const landed = frame >= J + 18;
  const pan = interpolate(frame, [J - 4, J + 30], [0, 620], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const lamp = interpolate(frame, [J + 26, J + 34], [0, 1], clamp);
  const card = useRamp(c2, 12);
  // the leap, in world coordinates
  const d0 = swing(J, BAR, 46, phase);
  const b0 = bobAt(d0);
  const r = (d0 * Math.PI) / 180;
  const from = { x: b0.x + Math.sin(r) * 66, y: b0.y - Math.cos(r) * 66 };

  const to = { x: CHAIR - 60 * S, y: FLOOR - 92 * S + 64 };
  const lx = from.x + (to.x - from.x) * leap;
  const ly = from.y + (to.y - from.y) * leap - 180 * Math.sin(leap * Math.PI);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.04, 1]} hits={[J, J + 18]}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.75 * card }}>
          <div style={{ position: "absolute", inset: 0, transform: `translateX(${-pan}px)` }}>
            <Pendulum deg={deg} rider={frame < J} amp={50} pain={Math.pow(Math.max(0, -deg / 46), 3)} bore={Math.pow(Math.max(0, deg / 46), 3)} opacity={1 - 0.55 * leap} ends={1 - leap} />
            <div style={{ position: "absolute", left: 0, right: -1000, top: FLOOR, height: 2, background: `linear-gradient(90deg, transparent, rgba(${WARM},${0.1 + 0.3 * lamp}) 60%, transparent)` }} />
            <Desk x={DESK} floor={FLOOR} on={lamp} frame={frame} />
            {landed && <Seated x={CHAIR} floor={FLOOR} scale={S} glow={0.4 + 0.5 * lamp} slump={-0.2} />}
            {frame >= J && !landed && (
              <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
                <g transform={`translate(${lx} ${ly}) rotate(${-d0 * (1 - leap)}) scale(1.45)`}>
                  <Rider glow={0.9} />
                </g>
              </svg>
            )}
            <div style={{ position: "absolute", left: DESK + 140, top: FLOOR - 300, fontSize: 28, fontWeight: 900, color: look.key, opacity: interpolate(frame, [c1, c1 + 10], [0, 1], clamp) * (1 - card), textShadow: `0 0 14px ${look.keyGlow}` }}>为自己</div>
          </div>
        </div>
      </Cam>
      <Bokeh frame={frame} rgb={WARM} opacity={(0.4 + 0.6 * lamp) * (1 - card)} />
      {card > 0 && <EndCard opacity={card} signoffAt={c2 + BEAT} />}
      <Sfx name="whoosh" at={J - 4} volume={0.5} />
      <Sfx name="step" at={J + 18} volume={0.5} />
      <Sfx name="glint" at={J + 26} volume={0.45} />
      <Sfx name="boom" at={c2} volume={0.35} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
