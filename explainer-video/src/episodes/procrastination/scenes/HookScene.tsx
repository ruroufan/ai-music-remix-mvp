import React from "react";
import { useCurrentFrame } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { PagePile, TearCalendar } from "../calendar";
import { Person } from "../../solitude/porcupine";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

export const FLOOR = 800;
export const CAL = { x: 1080, y: 160, w: 340 };
export const ME = 720;
const DEADLINE = 11; // page index of the due date

// Every beat a page comes off — 明天, 明天, 明天 — and the deadline gets closer.
// In the second line the tearing doubles in speed and the pile at his feet grows.
export const hookTears = (cue1: number) => [
  ...Array.from({ length: 6 }, (_, k) => (k + 1) * BEAT),
  ...Array.from({ length: 14 }, (_, k) => cue1 + BEAT + k * HALF_BEAT),
];

export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const tears = hookTears(cues[1]);
  const torn = tears.filter((t) => frame >= t).length;
  const left = Math.max(0, DEADLINE - torn);
  const late = left === 0;
  return (
    <ObsFrame duration={duration}>
      <Horizon y={FLOOR} />
      <PagePile cx={ME} floor={FLOOR} count={torn} layer="back" />
      <Person x={ME} bottom={FLOOR} height={250} glow={0.6} />
      <PagePile cx={ME} floor={FLOOR} count={torn} layer="front" />
      <TearCalendar x={CAL.x} y={CAL.y} w={CAL.w} frame={frame} tears={tears} />
      <div style={{ position: "absolute", left: CAL.x + CAL.w + 50, top: CAL.y + 80, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim }}>
        DEADLINE
        <div style={{ fontSize: 30, color: palette.ink, marginTop: 6 }}>10/26</div>
        <div style={{ marginTop: 26 }}>还剩</div>
        <div style={{ fontSize: 96, fontWeight: 700, color: late ? palette.alert : palette.ink, opacity: late && Math.floor(frame / 6) % 2 ? 0.3 : 1 }}>{left}</div>
        <div>天</div>
      </div>
      {tears.map((t, k) => (
        <Sfx key={k} name="shutter" at={t} volume={0.16 + Math.min(0.2, k * 0.01)} />
      ))}
      <Sfx name="stamp" at={tears[DEADLINE - 1]} volume={0.5} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
