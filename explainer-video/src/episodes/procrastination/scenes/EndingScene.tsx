import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { PagePile, TearCalendar } from "../calendar";
import { CAL, FLOOR, ME } from "./HookScene";
import { Person } from "../../solitude/porcupine";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const PILE = 48;
const TOP = 47; // the 明天 page on top; the one under it is 今天

// 0 · standing in a heap of 明天; the calendar on the wall: 明天.
// 1 · he tears one more page — and under it: 今天, lit. The heap fades; a
//     timer starts from 00:00.
// 2 · end card, with the channel sign-off.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const tearAt = cues[1] + BEAT;
  const after = frame - tearAt;
  const fade = interpolate(after, [BEAT, 5 * BEAT], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lit = interpolate(after, [0, BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const reach = interpolate(frame, [cues[1], tearAt], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const card = useRamp(cues[2], 12);
  const secs = Math.max(0, Math.floor(after / 30));
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - card * 0.75 }}>
        <Horizon y={FLOOR} />
        <PagePile cx={ME + reach * 200} floor={FLOOR} count={PILE} layer="back" opacity={fade} />
        <Person x={ME + reach * 200} bottom={FLOOR} height={250} glow={0.5 + lit * 0.8} />
        <PagePile cx={ME + reach * 200} floor={FLOOR} count={PILE} layer="front" opacity={fade} />
        <TearCalendar x={CAL.x} y={CAL.y} w={CAL.w} frame={frame} tears={[tearAt]} first={TOP} todayAt={TOP + 1} words={(i) => (i === TOP + 1 ? "今天" : "明天")} glow={lit} />
        {after >= 0 && (
          <div style={{ position: "absolute", left: CAL.x + CAL.w + 50, top: CAL.y + 140, fontFamily: fonts.mono, color: palette.accent, opacity: lit }}>
            <div style={{ fontSize: 20, letterSpacing: 6 }}>NOW</div>
            <div style={{ fontSize: 72, fontWeight: 700 }}>00:{String(secs).padStart(2, "0")}</div>
          </div>
        )}
      </div>
      <EndCard opacity={card} signoffAt={cues[2] + BEAT} />
      <Sfx name="step" at={cues[1]} volume={0.35} />
      <Sfx name="shutter" at={tearAt} volume={0.6} />
      <Sfx name="glint" at={tearAt + 4} volume={0.5} />
      <Sfx name="glint" at={cues[2]} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
