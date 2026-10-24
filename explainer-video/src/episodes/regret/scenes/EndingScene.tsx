import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { Bedroom, Copies, ReplayClip, ROOM } from "../projector";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// 0 · the copies on the wall go out, beat by beat, until one clip is left.
// 1 · click: the projector switches off. The room goes quiet; dawn comes up
//     in the window; the sleeper turns toward it.
// 2 · end card over the morning room, with the channel sign-off.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const copies = interpolate(frame, [BEAT, 6 * BEAT], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const offAt = cues[1] + BEAT;
  const beam = frame < offAt ? 1 : Math.max(0, 1 - (frame - offAt) / 4);
  const dawn = interpolate(frame, [offAt + BEAT, cues[2] + 2 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t * (3 - 2 * t) });
  const card = useRamp(cues[2], 12);
  const { wall } = ROOM;

  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - card * 0.7 }}>
        <Bedroom frame={frame} beam={beam} dawn={dawn}>
          <Copies frame={frame + 400} count={Math.ceil(14 * copies)} startAt={0} every={1} spread={1} opacity={0.65 * copies} tint={0.5} />
          <ReplayClip x={wall.x + wall.w / 2} y={wall.y + wall.h / 2} w={420} frame={frame} id="main" count={frame < offAt ? 1 : undefined} opacity={beam} />
        </Bedroom>
      </div>
      <EndCard opacity={card} signoffAt={cues[2] + BEAT} />

      {[1, 2, 3, 4, 5].map((k) => (
        <Sfx key={k} name="shutter" at={k * BEAT} volume={0.15} />
      ))}
      <Sfx name="stamp" at={offAt} volume={0.45} />
      <Sfx name="glint" at={cues[2]} volume={0.3} />

      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
