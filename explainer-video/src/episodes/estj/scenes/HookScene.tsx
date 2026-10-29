import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Clippings, GOLD, GROUND, LEAF, Measurer, SAPS, Sapling, STEEL } from "../ruler";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// A row of saplings, every one a different shape. He goes down the row with
// his ruler: holds it up to each — snip — and it's clipped into the standard
// box. 统一 1/6 … 6/6. A perfect row: 按我说的做 · 就对了.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const P = (c1 - BEAT / 2) / SAPS.length;
  const k = Math.min(SAPS.length - 1, Math.floor(frame / P));
  const t = Math.min(1, (frame - k * P) / P);
  const done = frame >= c1 - BEAT / 2;
  const from = k === 0 ? 120 : SAPS[k - 1] - 150;
  const x = done ? SAPS[5] + 160 : from + (SAPS[k] - 150 - from) * Math.min(1, t / 0.3);
  const rot = done ? -10 : t < 0.3 ? -10 : t < 0.55 ? -90 : -10;
  const trim = (i: number) => interpolate(frame, [i * P + 0.55 * P, i * P + 0.75 * P], [0, 1], clamp);
  const n = SAPS.filter((_, i) => trim(i) > 0.5).length;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} focus={{ x: 960, y: 620 }} hits={[...SAPS.map((_, i) => Math.round(i * P + 0.55 * P)), c1, ...keyHits(lines, cues, duration)]}>
        <div style={{ position: "absolute", left: 0, right: 0, top: GROUND, bottom: 0, background: "#14120f" }} />
        {SAPS.map((sx, i) => (
          <div key={i}>
            <Sapling x={sx} seed={i} trim={trim(i)} />
            <Clippings x={sx} y={GROUND - 240} k={(frame - (i * P + 0.55 * P)) / 30} seed={i} />
          </div>
        ))}
        <Measurer x={x} rot={rot} />
        <div style={{ position: "absolute", left: 120, top: 130, fontFamily: fonts.mono, fontSize: 28, letterSpacing: 4, color: "rgba(232,238,242,0.55)" }}>
          统一 <span style={{ fontSize: 46, color: `rgb(${GOLD})` }}>{n}/6</span>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", fontSize: 44, fontWeight: 900, letterSpacing: 8, color: `rgb(${STEEL})`, opacity: interpolate(frame, [c1, c1 + 10], [0, 1], clamp) }}>
          按我说的做 · <span style={{ color: `rgb(${LEAF})` }}>就对了</span>
        </div>
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} opacity={0.3} />
      {SAPS.map((_, i) => (
        <Sfx key={i} name="shutter" at={Math.round(i * P + 0.55 * P)} volume={0.3} />
      ))}
      <Sfx name="stamp" at={c1} volume={0.4} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
