import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { CALM, CX, Centre, Crowd, FLOOR, SEATS, WARM } from "../ring";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// The episode's picture.
// 0 · the ring, the score cards flickering faster than ever — people drifting
//     in and out of it: 会来也会走.
// 1 · the camera pushes into his chest: the small figure sits there quietly,
//     looks up — and nods. One by one the score cards round him fade out.
//     自己值得.
// 2 · the channel card.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const push = interpolate(frame, [c1, c1 + 3 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const nodAt = c1 + 3 * BEAT;
  const nod = frame > nodAt && frame < nodAt + 24 ? Math.sin(((frame - nodAt) / 24) * Math.PI) : 0;
  const fade = (i: number) => interpolate(frame, [nodAt + 10 + i * 4, nodAt + 22 + i * 4], [0, 1], clamp);
  const drift = (i: number) => (frame < c1 ? 0.5 + 0.5 * Math.sin(frame / 20 + i * 1.3) : 0);
  const card = useRamp(c2, 12);
  const s = 420 / 260;
  const zoom = 1 + 2.2 * push;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.02]} hits={[nodAt + 12, ...keyHits(lines, cues, duration)]}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.92 * card, transform: `scale(${zoom})`, transformOrigin: `${CX}px ${FLOOR - 140 * s}px` }}>
          <Crowd frame={frame} every={frame < c1 ? 10 : 22} fade={(i) => Math.max(fade(i), 0.6 * drift(i))} glow={0.3} />
          <Centre window={0.4 + 0.6 * push} nod={nod} glow={0.4 + 0.5 * fade(SEATS.length - 1)} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontSize: 40, fontWeight: 900, letterSpacing: 10, color: "rgba(232,238,242,0.6)", opacity: frame < c1 ? interpolate(frame, [BEAT, 2 * BEAT], [0, 1], clamp) : 0 }}>会来 · 也会走</div>
        <div style={{ position: "absolute", left: 140, top: 420, fontSize: 64, fontWeight: 900, letterSpacing: 14, color: `rgb(${WARM})`, textShadow: `0 0 24px rgba(${CALM},0.7)`, opacity: interpolate(frame, [nodAt + 20, nodAt + 34], [0, 1], clamp) * (1 - card) }}>自己值得</div>
      </Cam>
      <Bokeh frame={frame} rgb={CALM} opacity={(0.3 + 0.5 * push) * (1 - card)} />
      {card > 0 && <EndCard opacity={card} signoffAt={c2 + BEAT} />}
      <Sfx name="whoosh" at={c1} volume={0.35} />
      <Sfx name="glint" at={nodAt + 12} volume={0.5} />
      {SEATS.map((_, i) => (
        <Sfx key={i} name="shutter" at={nodAt + 10 + i * 4} volume={0.08} />
      ))}
      <Sfx name="boom" at={c2} volume={0.3} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
