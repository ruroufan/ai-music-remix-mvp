import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ALERT, ScreenCloud, Table } from "../screens";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// 0 · at a table, phone in hand; one per half beat a glowing screen pops up
//     round him — somewhere else in the world — and the unread count climbs.
// 1 · they keep coming, a crowd of them, and he's starting to fade.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const count = Math.max(0, Math.min(30, Math.floor(frame / HALF_BEAT)));
  const fade = interpolate(frame, [cues[1], duration], [0, 0.55], clamp);
  const unread = Math.round(interpolate(frame, [0, duration], [3, 999], { ...clamp, easing: (t) => t * t }));
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.1]} focus={{ x: 800, y: 520 }}>
        <Table frame={frame} fade={fade} />
        <ScreenCloud frame={frame} count={count} />
        <div style={{ position: "absolute", left: 1500, top: 160, padding: "8px 18px", borderRadius: 20, background: `rgb(${ALERT})`, fontFamily: fonts.mono, fontSize: 26, fontWeight: 700, color: "#fff" }}>未读 {unread > 99 ? "99+" : unread}</div>
      </Cam>
      <Bokeh frame={frame} rgb="120, 200, 255" />
      {Array.from({ length: 30 }, (_, i) => (
        <Sfx key={i} name="glint" at={i * HALF_BEAT} volume={0.06} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
