import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Person } from "../porcupine";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const FLOOR = 770;
const RING = Array.from({ length: 9 }, (_, i) => {
  const a = (i / 9) * Math.PI * 2;
  return { x: 1300 + Math.cos(a) * 230, bottom: FLOOR - 30 + Math.sin(a) * 40, h: 200 + Math.sin(a) * 24 };
});

// 0 · a warm ring of people on the right; on the left, a person — and the
//     shadow behind him, labelled 孤独.
// 1 · he runs from it into the ring. Step by step his outline fades, and
//     something small and lit (自己) drops behind and stays outside.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const run = interpolate(frame, [cues[1], cues[1] + 4 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * (2 - t) });
  const x = 420 + run * 880;
  const ghost = interpolate(frame, [cues[1] + 3 * BEAT, cues[1] + 6 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dropAt = cues[1] + 2 * BEAT;
  const dropped = frame >= dropAt;
  const dropX = 420 + interpolate(dropAt, [cues[1], cues[1] + 4 * BEAT], [0, 1]) * 880 * 0.75;
  const shadowX = 220 + run * 300;
  return (
    <ObsFrame duration={duration}>
      <Horizon y={FLOOR} />
      {/* the ring: back half behind him, front half in front */}
      {RING.filter((p) => p.bottom < FLOOR - 30).map((p, i) => (
        <Person key={`b${i}`} x={p.x} bottom={p.bottom} height={p.h} glow={0.5} opacity={0.8} />
      ))}
      {/* 孤独: a long cold shadow chasing him */}
      <Person x={shadowX} bottom={FLOOR} height={320} rgb="150, 200, 255" glow={0.35} opacity={0.75} />
      <div style={{ position: "absolute", left: shadowX - 60, top: FLOOR - 380, width: 120, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: "rgb(150,200,255)" }}>孤独</div>
      <Person x={x} bottom={FLOOR} height={230} pose={run > 0 && run < 1 ? "hunch" : "plain"} ghost={ghost} glow={0.8} />
      {RING.filter((p) => p.bottom >= FLOOR - 30).map((p, i) => (
        <Person key={`f${i}`} x={p.x} bottom={p.bottom} height={p.h} glow={0.6} />
      ))}
      <div style={{ position: "absolute", left: 1220, top: 380, width: 160, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: `rgb(${palette.halo})` }}>陪伴</div>
      {dropped && (
        <div style={{ position: "absolute", left: dropX - 50, top: FLOOR - 50, width: 100, textAlign: "center" }}>
          <div style={{ width: 22, height: 22, margin: "0 auto", borderRadius: 11, background: palette.accent, boxShadow: `0 0 24px ${palette.accent}`, transform: `translateY(${Math.min(0, -40 + (frame - dropAt) * 8)}px)` }} />
          <div style={{ marginTop: 10, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.accent }}>自己</div>
        </div>
      )}
      <Sfx name="whoosh" at={cues[1]} volume={0.4} />
      <Sfx name="step" at={cues[1] + BEAT} volume={0.4} />
      <Sfx name="glint" at={dropAt} volume={0.45} />
      <Sfx name="step" at={cues[1] + 3 * BEAT} volume={0.3} />
      <Sfx name="glitch" at={cues[1] + 4 * BEAT} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
