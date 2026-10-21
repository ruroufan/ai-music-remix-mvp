import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { Halo } from "../../../channels/backlit/parts";
import { fonts } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam } from "../../glass/immersive";
import { FLOOR, ScreenCloud, Table, WARM } from "../screens";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const N = 30;
const ORDER = Array.from({ length: N }, (_, i) => i).sort((a, b) => random(`o-${a}`) - random(`o-${b}`));

// The episode's picture. 0 · he turns the phone over and puts it down; the
//     screens go out one by one (two per half beat), his outline comes back
//     sharp — and across the table someone is talking to him; the bowl is
//     still steaming. 1 · warm light over the two of them: 此刻 · 在场.
// 2 · the channel card.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2] = cues;
  const down = BEAT;
  const offAt = (i: number) => down + BEAT + Math.floor(ORDER.indexOf(i) / 2) * HALF_BEAT;
  const on = (i: number) => interpolate(frame, [offAt(i), offAt(i) + 8], [1, 0], clamp);
  const last = down + BEAT + (N / 2) * HALF_BEAT;
  const clear = interpolate(frame, [down, last], [0, 1], clamp);
  const warm = interpolate(frame, [c1, c1 + 2 * BEAT], [0, 1], clamp);
  const card = useRamp(c2, 12);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.1, 1]} focus={{ x: 960, y: 560 }} hits={[down]}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.75 * card }}>
          <Halo x={960} y={FLOOR - 220} r={360 + 200 * warm} intensity={0.25 + 0.6 * warm} rgb={WARM} />
          <Table frame={frame} phone={frame < down ? 1 : 0} fade={0.7 * (1 - clear)} other={clear} talk={clear} />
          <ScreenCloud frame={frame} count={N} on={on} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", fontFamily: fonts.mono, fontSize: 30, letterSpacing: 12, color: look.key, opacity: warm * (1 - card), textShadow: `0 0 14px ${look.keyGlow}` }}>此刻 · 在场</div>
        </div>
      </Cam>
      <Bokeh frame={frame} rgb={WARM} opacity={(0.3 + 0.7 * clear) * (1 - card)} />
      {card > 0 && <EndCard opacity={card} signoffAt={c2 + BEAT} />}
      <Sfx name="stamp" at={down} volume={0.45} />
      {Array.from({ length: N / 2 }, (_, k) => (
        <Sfx key={k} name="shutter" at={down + BEAT + k * HALF_BEAT} volume={0.1} />
      ))}
      <Sfx name="glint" at={c1} volume={0.4} />
      <Sfx name="boom" at={c2} volume={0.35} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
