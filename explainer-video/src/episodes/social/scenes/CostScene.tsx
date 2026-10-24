import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Cone, FIELD, FLOOR, Field, GLARE, Lamp } from "../lights";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const WORRY = [
  { i: 1, t: "我刚才…" },
  { i: 5, t: "他们会怎么想" },
  { i: 6, t: "好尴尬" },
  { i: 0, t: "说错了吗" },
  { i: 4, t: "别看我" },
];

// 0 · a stage: curtains, his light, him — tense, fidgeting — and in front of
//     him rows of seats, every one empty. 观众：0.
// 1 · pull back: he's one of a whole field of people, each under a light of
//     their own, every one of them looking down. Over a few, what they're
//     thinking about: themselves.
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const c1 = cues[1];
  const pull = interpolate(frame, [c1 - 4, c1 + 2 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const bob = Math.sin(frame / 3) * 3;
  const me = FIELD[3];
  const z = 2.6 - 1.6 * pull;
  return (
    <ObsFrame duration={duration}>
      {/* 0 · the stage */}
      {pull < 1 && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - pull }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 300, height: 1080, background: "linear-gradient(90deg, #3a0e14, #6a1a24 60%, #2a0a0e)" }} />
          <div style={{ position: "absolute", right: 0, top: 0, width: 300, height: 1080, background: "linear-gradient(270deg, #3a0e14, #6a1a24 60%, #2a0a0e)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 90, background: "linear-gradient(#6a1a24, #3a0e14)" }} />
          <div style={{ position: "absolute", left: 300, right: 300, top: FLOOR, height: 40, background: "linear-gradient(#3a2a1c, #1a120c)" }} />
          <Cone id="st" x={960} aimX={960} spread={170} on={1} />
          <Lamp x={960} aimX={960} on={1} />
          <Stander x={960 + bob} bottom={FLOOR} height={300} lift={0.5 + 0.1 * Math.sin(frame / 4)} glow={1.2} rgb={GLARE} />
          {Array.from({ length: 9 }, (_, k) => (
            <div key={k} style={{ position: "absolute", left: 470 + k * 110, top: 766, width: 80, height: 44, borderRadius: "14px 14px 4px 4px", background: "#1a1f28", border: `1px solid ${palette.faint}` }} />
          ))}
          <div style={{ position: "absolute", right: 340, top: 130, fontFamily: fonts.mono, fontSize: 28, color: palette.ink, opacity: ramp(frame, 3 * BEAT, 8) }}>
            观众：<span style={{ color: palette.alert }}>0</span>
          </div>
        </div>
      )}
      {/* 1 · everyone under their own light */}
      {pull > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: pull, transform: `scale(${z})`, transformOrigin: `${me.x}px ${me.b - me.h / 2}px` }}>
          <Field frame={frame} lift={() => 0} />
          {WORRY.map((w, k) => {
            const p = FIELD[w.i];
            const op = ramp(frame, c1 + 2 * BEAT + k * HALF_BEAT, 6);
            return (
              <div key={k} style={{ position: "absolute", left: p.x, top: p.b - p.h - 40, transform: "translate(-50%, -100%)", opacity: op, padding: "6px 14px", borderRadius: 18, background: "rgba(232,238,242,0.1)", border: "2px dashed rgba(232,238,242,0.45)", fontSize: 22, fontWeight: 700, color: palette.ink, whiteSpace: "nowrap" }}>
                {w.t}
              </div>
            );
          })}
        </div>
      )}
      <Sfx name="boom" at={0} volume={0.4} />
      <Sfx name="stamp" at={3 * BEAT} volume={0.45} />
      <Sfx name="whoosh" at={c1 - 4} volume={0.4} />
      {WORRY.map((_, k) => (
        <Sfx key={k} name="glitch" at={c1 + 2 * BEAT + k * HALF_BEAT} volume={0.1} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
