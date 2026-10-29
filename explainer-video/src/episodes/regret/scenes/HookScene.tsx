import React from "react";
import { useCurrentFrame } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bedroom, Copies, ReplayClip, ROOM, LOOP } from "../projector";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

// Line 0: late at night, the projector throws one clip onto the wall.
// Line 1: it plays again. And again — a few copies start to stack up.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const replays = Math.floor(frame / LOOP) + 1;
  const { wall } = ROOM;
  const minute = 47 + Math.floor(frame / BEAT);

  return (
    <ObsFrame duration={duration}>
      <Bedroom frame={frame}>
        <ReplayClip x={wall.x + wall.w / 2} y={wall.y + wall.h / 2} w={520} frame={frame} count={replays} id="main" />
        <Copies frame={frame} count={6} startAt={cues[1] + BEAT} every={BEAT} spread={0.8} opacity={0.6} />
      </Bedroom>
      <div style={{ position: "absolute", left: ROOM.projector.x - 70, top: ROOM.projector.y - 110, fontFamily: fonts.mono, fontSize: 30, color: palette.alert, letterSpacing: 2 }}>
        {String(23 + Math.floor(minute / 60)).padStart(2, "0").replace("24", "00")}:{String(minute % 60).padStart(2, "0")}
      </div>
      {[0, 1, 2, 3].map((k) => (
        <Sfx key={k} name="shutter" at={k * LOOP} volume={0.25} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
