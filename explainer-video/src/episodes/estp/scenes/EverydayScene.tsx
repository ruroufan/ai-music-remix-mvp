import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Seated } from "../../friction/tangle";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { FLAME, SHADE } from "../chase";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const SAT = ["攀岩", "聚会", "密室", "夜跑"];
const SUN = ["自驾", "冲浪", "卡丁车", "蹦迪"];
const PEAKS = [{ x: 520, h: 220 }, { x: 960, h: 340 }, { x: 1420, h: 480 }];

// Three moments, full screen, a whip-pan between each.
// 1 · the weekend planner: 周六 and 周日 fill up block by block — and the
//     one empty day beside them gets a red stamp: 白过了.
// 2 · a flag on a peak, ✓ — and at once a taller peak beyond it, and another:
//     下一个 → 下一个 →.
// 3 · him alone on a chair, a timer counting up — 00:00 … and long before
//     10:00 his hand comes up with the phone glowing in it.
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : 2;
  const per = (c1 - 3 * BEAT) / (SAT.length + SUN.length);
  const blank = ramp(frame, c1 - 2 * BEAT, 4);
  const t2 = frame - c2;
  const phone = ramp(frame, c2 + 5 * BEAT, 6);
  const secs = Math.min(133, Math.floor(Math.max(0, t2) * 1.4));
  const clock = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1, c2]} hits={[c1 - 2 * BEAT, ...PEAKS.map((_, i) => c1 + (1 + 2 * i) * BEAT), c2 + 5 * BEAT, ...keyHits(lines, cues, duration)]}>
        {seg === 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            {["周六", "周日", "空 · 一天"].map((d, col) => (
              <div key={d} style={{ position: "absolute", left: 380 + col * 400, top: 150, width: 360, height: 600, borderRadius: 16, border: "2px solid rgba(232,238,242,0.18)", background: "rgba(14,18,24,0.85)" }}>
                <div style={{ position: "absolute", left: 0, right: 0, top: 18, textAlign: "center", fontSize: 32, fontWeight: 900, letterSpacing: 6, color: col === 2 ? palette.dim : palette.ink }}>{d}</div>
                {(col === 0 ? SAT : col === 1 ? SUN : []).map((a, i) => {
                  const p = ramp(frame, Math.round((col * SAT.length + i) * per), 5);
                  return <div key={a} style={{ position: "absolute", left: 24, right: 24, top: 90 + i * 120, height: 100, borderRadius: 10, background: `rgba(${FLAME},${0.25 + 0.15 * (i % 2)})`, border: `2px solid rgba(${FLAME},0.7)`, fontSize: 34, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", color: palette.ink, opacity: p, transform: `scale(${1.2 - 0.2 * p})` }}>{a}</div>;
                })}
              </div>
            ))}
            <div style={{ position: "absolute", left: 1180 + 360 / 2 - 150, top: 380, width: 300, padding: "14px 0", textAlign: "center", border: `5px solid ${palette.alert}`, borderRadius: 10, fontSize: 56, fontWeight: 900, letterSpacing: 10, color: palette.alert, opacity: blank, transform: `rotate(-12deg) scale(${1.6 - 0.6 * blank})` }}>白过了</div>
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              {PEAKS.map((p, i) => {
                const k = ramp(frame, c1 + 2 * i * BEAT, 10);
                return <path key={i} d={`M${p.x - p.h * 0.9} 780 L${p.x} ${780 - p.h * k} L${p.x + p.h * 0.9} 780 Z`} fill={`rgba(${30 + i * 6},${32 + i * 6},${44 + i * 8},0.95)`} stroke="rgba(232,238,242,0.3)" strokeWidth={2} opacity={k} />;
              })}
              {PEAKS.map((p, i) => {
                const k = ramp(frame, c1 + (1 + 2 * i) * BEAT, 6);
                return (
                  <g key={`f${i}`} opacity={k}>
                    <line x1={p.x} y1={780 - p.h} x2={p.x} y2={780 - p.h - 80} stroke="rgba(232,238,242,0.8)" strokeWidth={4} />
                    <path d={`M${p.x} ${780 - p.h - 80} l50 14 l-50 14 Z`} fill={`rgb(${FLAME})`} />
                  </g>
                );
              })}
            </svg>
            {PEAKS.map((p, i) => (
              <div key={i} style={{ position: "absolute", left: p.x - 20, top: 780 - p.h - 140, fontSize: 40, fontWeight: 900, color: "rgb(130,210,150)", opacity: ramp(frame, c1 + (1 + 2 * i) * BEAT + 4, 6) }}>✓</div>
            ))}
            {PEAKS.slice(0, 2).map((p, i) => (
              <div key={`n${i}`} style={{ position: "absolute", left: p.x + 90, top: 780 - p.h - 30, fontFamily: fonts.mono, fontSize: 24, letterSpacing: 4, color: `rgb(${FLAME})`, opacity: ramp(frame, c1 + (2 + 2 * i) * BEAT - 4, 6) }}>下一个 →</div>
            ))}
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Seated x={1000} floor={860} scale={1.7} glow={0.5} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: fonts.mono, fontSize: 96, fontWeight: 700, letterSpacing: 8, color: phone > 0 ? palette.alert : palette.ink }}>{clock}</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim }}>目标 · 10:00</div>
            <Halo x={1050} y={620 - 60 * phone} r={160} intensity={0.8 * phone} rgb="180, 210, 255" />
            <div style={{ position: "absolute", left: 1020, top: 590 - 60 * phone, width: 54, height: 90, borderRadius: 10, background: `rgba(190,215,255,${0.3 + 0.6 * phone})`, border: "3px solid #222", opacity: phone, transform: `rotate(${-20 + 20 * phone}deg)` }} />
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={seg === 2 ? SHADE : FLAME} opacity={0.35} />
      {[...SAT, ...SUN].map((_, i) => (
        <Sfx key={i} name="shutter" at={Math.round(i * per)} volume={0.15} />
      ))}
      <Sfx name="stamp" at={c1 - 2 * BEAT} volume={0.6} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.5} />
      {PEAKS.map((_, i) => (
        <Sfx key={`p${i}`} name="glint" at={c1 + (1 + 2 * i) * BEAT} volume={0.3} />
      ))}
      <Sfx name="whoosh" at={c2 - 3} volume={0.5} />
      <Sfx name="glitch" at={c2 + 5 * BEAT} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
