import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam } from "../../glass/immersive";
import { GLOW, ScreenCloud, Table } from "../screens";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// A rack focus. First the screens are sharp — 世界 — and the table behind them
// a blur; then focus pulls: the screens melt into bokeh and what's sharp is the
// table, and someone sitting across it — 眼前.
export const TurnScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const pull = interpolate(frame, [4 * BEAT, 7 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.06]} focus={{ x: 960, y: 520 }}>
        <div style={{ position: "absolute", inset: 0, filter: `blur(${8 * (1 - pull)}px)` }}>
          <Table frame={frame} fade={0.4} other={0.4 + 0.6 * pull} talk={pull} />
        </div>
        <div style={{ position: "absolute", inset: 0, filter: `blur(${10 * pull}px)`, opacity: 1 - 0.6 * pull }}>
          <ScreenCloud frame={frame} count={26} />
        </div>
        <div style={{ position: "absolute", left: 200, top: 150, fontFamily: fonts.mono, fontSize: 30, letterSpacing: 10, color: `rgb(${GLOW})`, opacity: 1 - pull }}>世界</div>
        <div style={{ position: "absolute", left: 1180, top: 330, fontFamily: fonts.mono, fontSize: 34, letterSpacing: 10, color: look.key, opacity: pull, textShadow: `0 0 14px ${look.keyGlow}` }}>眼前</div>
      </Cam>
      <Bokeh frame={frame} />
      <Sfx name="whoosh" at={4 * BEAT} volume={0.35} />
      <Sfx name="glint" at={7 * BEAT} volume={0.35} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
