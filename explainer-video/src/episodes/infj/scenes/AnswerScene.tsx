import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { COOL, Carrier, Key, LAMP, ROOMS, Room, roomCx } from "../lantern";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// 0 · the street again: he goes along it and every door swings open for him
//     as he comes — 来去自如.
// 1 · his own door, close up: a keyhole glowing faintly. Two people stand
//     outside it, hands empty. The key is in his hand — and it stays there:
//     钥匙 · 从没给过.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const x = interpolate(frame, [0, c1 - 4], [-60, 1300], clamp);
  const openAt = (i: number) => ((roomCx(i) - 120 + 60) / 1360) * (c1 - 4);
  const door = (i: number) => interpolate(frame, [openAt(i), openAt(i) + 8], [0, 1], clamp);
  const key = ramp(frame, c1 + 2 * BEAT, 10);
  const never = ramp(frame, c1 + 5 * BEAT, 8);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} whips={[c1]} hits={[c1 + 2 * BEAT, c1 + 5 * BEAT, ...keyHits(lines, cues, duration)]}>
        {frame < c1 ? (
          <div style={{ position: "absolute", inset: 0 }}>
            {ROOMS.map((r, i) => (
              <Room key={i} {...r} lit={door(i)} door={door(i)} />
            ))}
            <Carrier x={x} walk={frame / 4} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: fonts.mono, fontSize: 28, letterSpacing: 12, color: `rgb(${LAMP})`, opacity: ramp(frame, 2 * BEAT, 10) }}>来 去 自 如</div>
          </div>
        ) : (
          <div style={{ position: "absolute", inset: 0 }}>
            {/* his door, close */}
            <div style={{ position: "absolute", left: 760, top: 160, width: 400, height: 700, background: "#161a21", border: `4px solid rgba(${COOL},0.5)` }} />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <circle cx={1100} cy={520} r={16} fill={`rgba(${LAMP},${0.35 + 0.2 * Math.sin(frame / 6)})`} />
              <path d="M1094 530 L1090 570 L1110 570 L1106 530 Z" fill={`rgba(${LAMP},${0.35 + 0.2 * Math.sin(frame / 6)})`} />
            </svg>
            <Stander x={360} bottom={900} height={300} lift={1} glow={0.5} rgb={COOL} />
            <Stander x={560} bottom={900} height={280} lift={1} glow={0.5} rgb={COOL} />
            <div style={{ position: "absolute", left: 300, width: 320, top: 560, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: ramp(frame, c1 + BEAT, 8) }}>空着手</div>
            <Stander x={1480} bottom={900} height={320} lift={0} glow={0.7} rgb={LAMP} />
            <Key x={1560} y={640} size={0.7} glow={key} opacity={key} rot={-30} />
            <div style={{ position: "absolute", left: 1300, top: 250, fontSize: 44, fontWeight: 900, color: `rgb(${LAMP})`, opacity: key }}>钥匙</div>
            <div style={{ position: "absolute", left: 1300, top: 310, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 6, color: palette.ink, opacity: never }}>从没给过 ✕</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={LAMP} opacity={0.45} />
      {ROOMS.map((_, i) => (
        <Sfx key={i} name="whoosh" at={Math.round(openAt(i))} volume={0.18} />
      ))}
      <Sfx name="whoosh" at={c1 - 3} volume={0.45} />
      <Sfx name="glint" at={c1 + 2 * BEAT} volume={0.5} />
      <Sfx name="stamp" at={c1 + 5 * BEAT} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
