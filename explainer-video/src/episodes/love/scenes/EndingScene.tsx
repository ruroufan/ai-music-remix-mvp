import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { useEpisode } from "../../../EpisodeContext";
import { keyLandsAt } from "../../../components/Kinetic";
import { Bokeh, Cam } from "../../glass/immersive";
import { Couple, FLOOR } from "../lovers";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const smooth = (frame: number, a: number, b: number) => interpolate(frame, [a, b], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });

// The episode's picture. 0 · slowly she takes her weight back and straightens
// up; the rocking settles; her outline comes back. 1 · they stand side by
// side, steady, a little apart — and the one shadow on the floor parts into
// two. When 用强大去爱 lands, a warm breath of light. 2 · the channel card.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2] = cues;
  const up = smooth(frame, BEAT, c1 + BEAT);
  const apart = smooth(frame, c1 - 2 * BEAT, c1 + 2 * BEAT);
  const split = smooth(frame, c1, c1 + 4 * BEAT);
  const keyAt = c1 + keyLandsAt(lines[1].text, BEAT);
  const breath = frame >= keyAt ? Math.exp(-(frame - keyAt) / 30) : 0;
  const card = useRamp(c2, 12);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.12, 1]} focus={{ x: 960, y: 520 }}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.75 * card }}>
          <Couple cx={960} frame={frame} lean={1 - up} sway={1 - 0.95 * up} gap={0.45 * apart} ghost={0.5 * (1 - up)} herGlow={0.6 + 0.6 * up} split={split} />
          {breath > 0.02 && <div style={{ position: "absolute", left: 960 - 500, top: FLOOR - 600, width: 1000, height: 800, borderRadius: "50%", background: `radial-gradient(ellipse, ${look.keyGlow}, transparent 65%)`, opacity: 0.5 * breath }} />}
        </div>
      </Cam>
      <Bokeh frame={frame} rgb="255, 170, 190" opacity={1 - card} />
      {card > 0 && <EndCard opacity={card} signoffAt={c2 + BEAT} />}
      <Sfx name="rise" at={BEAT} volume={0.3} />
      <Sfx name="step" at={c1} volume={0.35} />
      <Sfx name="glint" at={keyAt} volume={0.45} />
      <Sfx name="boom" at={c2} volume={0.35} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
