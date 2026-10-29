import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Carrier, LAMP, OWN, ROOMS, Room, roomCx } from "../lantern";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SEEN = ["他累了", "她在逞强", "他想被夸", "她其实害怕"];
const RED = "255, 92, 92";

// The street. He walks along it with the lamp, and each room he passes lights
// up — and over each one, what he saw at a glance: 他累了 · 她在逞强 ·
// 他想被夸 · 她其实害怕. 看穿 4/4. Then he reaches his own room, at the end:
// the only dark one, door shut, window boarded. 懂你 0.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const x = interpolate(frame, [0, c1 - BEAT], [-80, 1220], clamp);
  const walking = frame < c1 - BEAT;
  const litAt = (i: number) => (roomCx(i) - 40 + 80) * ((c1 - BEAT) / 1300);
  const lit = (i: number) => interpolate(frame, [litAt(i), litAt(i) + 8], [0, 1], clamp);
  const seen = ROOMS.filter((_, i) => lit(i) > 0.5).length;
  const own = interpolate(frame, [c1, c1 + 8], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} focus={{ x: 960, y: 640 }} hits={[...ROOMS.map((_, i) => Math.round(litAt(i))), c1, ...keyHits(lines, cues, duration)]}>
        {ROOMS.map((r, i) => (
          <Room key={i} {...r} lit={lit(i)} />
        ))}
        {ROOMS.map((r, i) => (
          <div key={`s${i}`} style={{ position: "absolute", left: r.x, width: r.w, top: 820 - r.h - 150, textAlign: "center", fontSize: 30, fontWeight: 900, color: `rgb(${LAMP})`, opacity: lit(i), transform: `translateY(${(1 - lit(i)) * 16}px)`, textShadow: `0 0 16px rgba(${LAMP},0.7)` }}>{SEEN[i]}</div>
        ))}
        <Room {...OWN} shut={1} who={false} />
        <div style={{ position: "absolute", left: OWN.x, width: OWN.w, top: 820 - OWN.h - 180, textAlign: "center", fontSize: 64, fontWeight: 900, color: "rgba(232,238,242,0.5)", opacity: own }}>？</div>
        <Carrier x={x} walk={walking ? frame / 4 : 0} />
        <div style={{ position: "absolute", left: 90, top: 110, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 4, color: "rgba(232,238,242,0.55)", lineHeight: 1.8 }}>
          <div>
            看穿 <span style={{ color: `rgb(${LAMP})`, fontSize: 40 }}>{seen}/4</span>
          </div>
          <div style={{ opacity: own }}>
            懂你 <span style={{ color: `rgb(${RED})`, fontSize: 40 }}>0</span>
          </div>
        </div>
      </Cam>
      <Bokeh frame={frame} rgb={LAMP} opacity={0.4} />
      {ROOMS.map((_, i) => (
        <Sfx key={i} name="glint" at={Math.round(litAt(i))} volume={0.3} />
      ))}
      <Sfx name="boom" at={c1} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
