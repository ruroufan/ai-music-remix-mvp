import React from "react";
import { useCurrentFrame } from "remotion";
import { BoardFrame } from "../../../channels/whiteboard/BoardFrame";
import { ink } from "../../../channels/whiteboard/look";
import { Sketch, Write, rr } from "../../../channels/whiteboard/sketch";
import { useEpisode } from "../../../EpisodeContext";
import { crown } from "../drawings";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";
import { ramp } from "./util";

const CROWN = crown(830, 330, 70, 11);
const FRAME = rr.rect(560, 360, 800, 250, { seed: 12, color: ink.orange, width: 5, rough: 1.4 });
const UNDER = [...rr.line(620, 640, 1300, 634, { seed: 13, color: ink.red, width: 7 }), ...rr.line(660, 662, 1280, 660, { seed: 14, color: ink.red, width: 5 })];

// The title written large; a crown drawn over 完美, a fussy frame around it all,
// and a double red underline.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  return (
    <BoardFrame duration={duration}>
      <Write text={brand.topic ?? ""} x={960} y={400} size={170} align="center" progress={ramp(frame, 0, 2 * BEAT)} spacing={0.08} />
      <Sketch strokes={CROWN} progress={ramp(frame, 2 * BEAT, 3 * BEAT)} />
      <Sketch strokes={FRAME} progress={ramp(frame, 3 * BEAT, 5 * BEAT)} />
      <Sketch strokes={UNDER} progress={ramp(frame, 5 * BEAT, 6 * BEAT)} />
      <Write text={brand.topicLatin ?? ""} x={960} y={700} size={44} align="center" progress={ramp(frame, 6 * BEAT, 7 * BEAT)} font='"Caveat", cursive' color={ink.grey} hand={false} />
      <Sfx name="boom" at={0} volume={0.6} />
      <Sfx name="glint" at={2 * BEAT} volume={0.3} />
      <Sfx name="whoosh" at={5 * BEAT} volume={0.25} />
    </BoardFrame>
  );
};
