import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Doer, Tangle } from "../tangle";
import { CLOUD, FLOOR, SEAT_X } from "./HookScene";
import { ROWS } from "./ThiefScene";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, HALF_BEAT, type SceneProps } from "../timing";

const N = 14;

// 0 · he sends the message (已发送 ✓) and makes the call (通话中) — and with
//     each, threads are pulled straight out of the knot, a few per beat.
// 1 · the knot is gone: every thread lies straight, lit, in rows like the
//     strings of a zheng. He stands steady under them.
// 2 · end card, with the channel sign-off.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const straight = (i: number) => (i < 4 ? 1 : interpolate(frame, [(i - 4) * HALF_BEAT + BEAT, (i - 4) * HALF_BEAT + BEAT + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const sent = interpolate(frame, [2 * BEAT, 3 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const call = frame >= 5 * BEAT;
  const done = interpolate(frame, [cues[1], cues[1] + BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const card = useRamp(cues[2], 12);
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - card * 0.7 }}>
        <Horizon y={FLOOR} />
        <Tangle cx={CLOUD.cx} cy={CLOUD.cy} r={CLOUD.r} frame={frame} churn={0.4} straight={straight} rows={ROWS} threads={N} />
        <Doer x={SEAT_X - 60} floor={FLOOR} reach={frame < cues[1] ? 1 : 1 - done} glow={1 + 0.4 * done} />
        {frame < cues[1] && (
          <>
            <div style={{ position: "absolute", left: SEAT_X + 120 + sent * 160, top: 520 - sent * 60, padding: "12px 22px", borderRadius: 18, background: palette.accent, color: "#06080c", fontSize: 30, fontWeight: 800, opacity: sent }}>那条消息 · 已发送 ✓</div>
            {call && <div style={{ position: "absolute", left: SEAT_X + 160, top: 620, fontFamily: fonts.mono, fontSize: 30, color: palette.accent }}>☎ 通话中 00:{String(Math.floor((frame - 5 * BEAT) / 30)).padStart(2, "0")}</div>}
          </>
        )}
        <div style={{ position: "absolute", left: ROWS.x1 - 220, top: ROWS.y + 170, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 8, color: `rgb(${palette.halo})`, opacity: done }}>事 上 练</div>
      </div>
      <EndCard opacity={card} signoffAt={cues[2] + BEAT} />
      <Sfx name="glint" at={2 * BEAT} volume={0.45} />
      <Sfx name="shutter" at={5 * BEAT} volume={0.35} />
      {Array.from({ length: 10 }, (_, k) => (
        <Sfx key={k} name="glint" at={BEAT + k * HALF_BEAT} volume={0.1} />
      ))}
      <Sfx name="glint" at={cues[2]} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
