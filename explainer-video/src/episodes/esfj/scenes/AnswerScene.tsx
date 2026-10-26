import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { CALM, CX, Centre, Crowd, FLOOR, SEATS, WARM } from "../ring";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// The ring again, and a window into his chest. The small figure stands up —
// and is handed out: a thread of light runs from his chest to every person in
// the ring, one after another, and the chair in his chest is left empty.
// 交给了每一个人 · 不是留给自己.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const win = ramp(frame, BEAT, 10);
  const out = (i: number) => interpolate(frame, [c1 + BEAT + i * 5, c1 + BEAT + i * 5 + 8], [0, 1], clamp);
  const empty = interpolate(frame, [c1 + BEAT, c1 + BEAT + SEATS.length * 5], [0, 1], clamp);
  const s = 420 / 260;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} focus={{ x: 960, y: 620 }} hits={[c1 + BEAT, c1 + BEAT + SEATS.length * 5, ...keyHits(lines, cues, duration)]}>
        <Crowd frame={frame} glow={0.3} />
        <Centre window={win} empty={empty} glow={0.5} />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {SEATS.map((p, i) => {
            const k = out(i);
            const x0 = CX, y0 = FLOOR - 140 * s, x1 = p.x, y1 = p.y - 240 * p.s * 0.6;
            return k > 0 ? <line key={i} x1={x0} y1={y0} x2={x0 + (x1 - x0) * k} y2={y0 + (y1 - y0) * k} stroke={`rgba(${CALM},0.7)`} strokeWidth={3} /> : null;
          })}
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontFamily: fonts.mono, fontSize: 26, letterSpacing: 8, color: palette.dim, opacity: frame < c1 ? win : 0 }}>心里那个旁观者</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 130, textAlign: "center", fontSize: 46, fontWeight: 900, letterSpacing: 8, color: `rgb(${WARM})`, opacity: ramp(frame, c1 + BEAT + SEATS.length * 5, 10) }}>交给了每一个人 · 不是留给自己</div>
      </Cam>
      <Bokeh frame={frame} rgb={WARM} opacity={0.3} />
      <Sfx name="glint" at={BEAT} volume={0.3} />
      {SEATS.map((_, i) => (
        <Sfx key={i} name="shutter" at={c1 + BEAT + i * 5} volume={0.12} />
      ))}
      <Sfx name="boom" at={c1 + BEAT + SEATS.length * 5} volume={0.3} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
