import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Walker } from "../../nostalgia/road";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { FLAME, SHADE, Shadow } from "../chase";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const GROUND = 760;

const Rabbit: React.FC<{ x: number; y: number; s?: number; hop?: number; color?: string }> = ({ x, y, s = 1, hop = 0, color = "rgba(232,238,242,0.85)" }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
    <g transform={`translate(${x} ${y - Math.abs(Math.sin(hop)) * 40 * s}) scale(${s})`} fill={color}>
      <ellipse cx={0} cy={-30} rx={44} ry={28} />
      <circle cx={42} cy={-56} r={20} />
      <ellipse cx={40} cy={-96} rx={7} ry={26} transform="rotate(-12 40 -96)" />
      <ellipse cx={54} cy={-94} rx={7} ry={24} transform="rotate(10 54 -94)" />
      <circle cx={-44} cy={-36} r={10} />
      <ellipse cx={-20} cy={-4} rx={22} ry={8} />
    </g>
  </svg>
);

const CARDS = [
  { t: "打猎", o: "那只兔子" },
  { t: "赌博", o: "那笔钱" },
  { t: "战争", o: "……" },
];

// 0 · three cards — 打猎 · 赌博 · 战争 — and under each what it's supposedly
//     for: 那只兔子 ✕ · 那笔钱 ✕.
// 1 · someone hands the hunter a rabbit in a box, free. His face falls:
//     ……没意思. 不高兴.
// 2 · the hunter running after a rabbit, the ground streaming by — and the
//     tags: 猎物 ✕ · 追逐 ✓.
// 3 · the chase goes on; far behind, a dark cloud labelled 处境 can't keep up
//     — as long as he keeps running.
export const PascalScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2, c3] = cues;
  const box = interpolate(frame, [c1 + BEAT, c1 + 3 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const run = frame - c2;
  const cloud = ramp(frame, c3 + BEAT, 12);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} whips={[c1, c2]} hits={[...CARDS.map((_, i) => 4 * BEAT + i * BEAT), c1 + 3 * BEAT, c2 + 2 * BEAT, ...keyHits(lines, cues, duration)]}>
        {frame < c1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            {CARDS.map((c, i) => {
              const p = ramp(frame, 4 + i * 8, 8);
              const no = ramp(frame, 4 * BEAT + i * BEAT, 5);
              const x = 560 + i * 400;
              return (
                <div key={c.t} style={{ position: "absolute", left: x - 160, top: 220, width: 320, height: 420, borderRadius: 16, border: "2px solid rgba(232,238,242,0.2)", background: "rgba(14,18,24,0.88)", opacity: p, transform: `translateY(${(1 - p) * 40}px)` }}>
                  <div style={{ position: "absolute", left: 0, right: 0, top: 50, textAlign: "center", fontSize: 84, fontWeight: 900, letterSpacing: 8, color: palette.ink }}>{c.t}</div>
                  <div style={{ position: "absolute", left: 40, right: 40, top: 200, height: 2, background: "rgba(232,238,242,0.15)" }} />
                  <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontSize: 40, fontWeight: 800, color: palette.dim }}>
                    {c.o} {i < 2 && <span style={{ color: palette.alert, opacity: no }}>✕</span>}
                  </div>
                  <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.faint }}>想要的？</div>
                </div>
              );
            })}
          </div>
        )}
        {frame >= c1 && frame < c2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: GROUND, height: 2, background: "rgba(232,238,242,0.2)" }} />
            <Stander x={1300} bottom={GROUND} height={380} lift={1} glow={0.4} rgb={SHADE} />
            <Stander x={620} bottom={GROUND} height={400} lift={1.2 - 0.9 * ramp(frame, c1 + 4 * BEAT, 10)} glow={0.5} rgb={FLAME} />
            <div style={{ position: "absolute", left: 1180 - 420 * box, top: 520, width: 160, height: 120, borderRadius: 8, background: "#efe8d8", border: "3px solid #b4503c", boxShadow: "0 10px 24px rgba(0,0,0,0.5)" }} />
            <Rabbit x={1260 - 420 * box} y={524} s={0.6} />
            <div style={{ position: "absolute", left: 1180 - 420 * box, width: 160, top: 650, textAlign: "center", fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim }}>送你</div>
            <div style={{ position: "absolute", left: 420, top: 240, padding: "10px 22px", borderRadius: 16, border: `2px solid rgba(${FLAME},0.6)`, fontSize: 34, fontWeight: 800, color: `rgb(${FLAME})`, opacity: ramp(frame, c1 + 4 * BEAT, 8) }}>……没意思</div>
          </div>
        )}
        {frame >= c2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: GROUND, height: 2, background: "rgba(232,238,242,0.25)" }} />
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} style={{ position: "absolute", left: ((i * 220 - run * 18) % 2200 + 2200) % 2200 - 200, top: GROUND + 30, width: 100, height: 5, background: "rgba(232,238,242,0.22)" }} />
            ))}
            {frame >= c3 && (
              <div style={{ opacity: cloud }}>
                <Shadow x={220 + Math.sin(run / 14) * 30} frame={frame} scale={0.9} />
                <div style={{ position: "absolute", left: 120, width: 200, top: 400, textAlign: "center", fontSize: 40, fontWeight: 900, letterSpacing: 8, color: `rgb(${SHADE})` }}>处境</div>
              </div>
            )}
            <Walker x={900} bottom={GROUND} height={380} face="right" walk={run / 2.6} lean={10} glow={0.6} rgb={FLAME} />
            <Rabbit x={1440 + Math.sin(run / 10) * 40} y={GROUND} s={1.1} hop={run / 5} />
            <div style={{ position: "absolute", left: 1320, top: 360, fontSize: 40, fontWeight: 900, color: palette.dim, opacity: ramp(frame, c2 + 2 * BEAT, 6) }}>猎物 <span style={{ color: palette.alert }}>✕</span></div>
            <div style={{ position: "absolute", left: 760, top: 240, fontSize: 48, fontWeight: 900, color: `rgb(${FLAME})`, opacity: ramp(frame, c2 + 3 * BEAT, 6) }}>追逐 <span style={{ color: "rgb(130,210,150)" }}>✓</span></div>
            <Halo x={900} y={500} r={320} intensity={0.3} rgb={FLAME} />
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={FLAME} opacity={0.3} />
      {CARDS.map((_, i) => (
        <Sfx key={i} name="shutter" at={4 + i * 8} volume={0.15} />
      ))}
      {[0, 1].map((i) => (
        <Sfx key={`x${i}`} name="glitch" at={4 * BEAT + i * BEAT} volume={0.2} />
      ))}
      <Sfx name="whoosh" at={c1 - 3} volume={0.45} />
      <Sfx name="stamp" at={c1 + 4 * BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.45} />
      <Sfx name="glint" at={c2 + 3 * BEAT} volume={0.35} />
      <Sfx name="rise" at={c3} volume={0.3} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
