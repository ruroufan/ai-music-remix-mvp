import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Checklist, Fading, INK, PALE, TODO } from "../checklist";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// He holds the list. Item after item gets ticked and struck through — 完成
// 1/10 … 10/10 — and with every tick he goes a little paler, a little more
// see-through, until he's barely an outline holding a perfect list. 快乐：—
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const tickAt = (i: number) => BEAT + i * ((c1 - BEAT) / TODO.length);
  const done = TODO.reduce((a, _, i) => a + interpolate(frame, [tickAt(i), tickAt(i) + 4], [0, 1], clamp), 0);
  const fade = (done / TODO.length) * 0.9;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} focus={{ x: 860, y: 520 }} hits={[...TODO.map((_, i) => Math.round(tickAt(i))), c1, ...keyHits(lines, cues, duration)]}>
        <Fading x={620} bottom={920} height={420} fade={fade} />
        <Checklist x={760} y={150} done={done} size={1.05} rot={-2} />
        <div style={{ position: "absolute", left: 1300, top: 220, fontFamily: fonts.mono, fontSize: 28, letterSpacing: 4, color: `rgba(${INK},0.55)`, lineHeight: 2 }}>
          <div>
            完成 <span style={{ fontSize: 46, color: "rgb(120,210,150)" }}>{Math.floor(done + 0.01)}/{TODO.length}</span>
          </div>
          <div>
            快乐 <span style={{ fontSize: 46, color: `rgb(${PALE})` }}>—</span>
          </div>
        </div>
        <div style={{ position: "absolute", left: 1300, top: 420, fontSize: 36, fontWeight: 900, color: `rgb(${PALE})`, opacity: interpolate(frame, [c1, c1 + 10], [0, 1], clamp) }}>全都做对了 · 人却淡了</div>
      </Cam>
      <Bokeh frame={frame} opacity={0.3} />
      {TODO.map((_, i) => (
        <Sfx key={i} name="shutter" at={Math.round(tickAt(i))} volume={0.18} />
      ))}
      <Sfx name="boom" at={c1} volume={0.3} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
