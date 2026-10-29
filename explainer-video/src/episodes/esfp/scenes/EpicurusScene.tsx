import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Seated } from "../../friction/tangle";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Bread, GOLD, LEAF, PINK, WARM } from "../stage";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const FLOOR = 780;

// 0 · EPICUREAN = 享乐, in party lights — then struck through, and under it
//     the plain truth: 极简朴.
// 1 · on a bare table, one by one: 面包 · 清水 · 一小罐奶酪 — 盛宴.
// 2 · a garden gate — 花园 · THE GARDEN — and inside, friends at a table:
//     聊天 · 吃饭 · 思考.
// 3 · 快乐 = not 狂欢 ✕ but two calm lines: 身体 · 无痛苦 and 灵魂 · 无纷扰 —
//     a choppy wave smoothing out flat.
export const EpicurusScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2, c3] = cues;
  const strike = interpolate(frame, [4 * BEAT, 4 * BEAT + 8], [0, 1], clamp);
  const plain = ramp(frame, 5 * BEAT, 10);
  const item = (i: number) => ramp(frame, c1 + 4 + i * BEAT, 8);
  const feast = ramp(frame, c1 + 4 * BEAT, 10);
  const gate = ramp(frame, c2, 12);
  const calm = interpolate(frame, [c3 + 2 * BEAT, c3 + 8 * BEAT], [0, 1], clamp);
  const wave = (y: number, amp: number) =>
    Array.from({ length: 61 }, (_, i) => `${i ? "L" : "M"}${360 + i * 20} ${y + Math.sin(i * 0.9 + frame / 4) * amp * (1 - calm)}`).join(" ");
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} whips={[c1, c2, c3]} hits={[4 * BEAT, c1 + 4 * BEAT, c3 + 2 * BEAT, ...keyHits(lines, cues, duration)]}>
        {frame < c1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Halo x={960} y={420} r={500} intensity={0.4 * (1 - strike)} rgb={PINK} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 290, textAlign: "center", fontFamily: fonts.mono, fontSize: 40, letterSpacing: 14, color: `rgba(${PINK},${1 - 0.6 * strike})` }}>EPICUREAN</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 350, textAlign: "center", fontSize: 130, fontWeight: 900, letterSpacing: 20, color: `rgba(255,236,210,${1 - 0.6 * strike})` }}>
              <span style={{ position: "relative" }}>= 享乐<span style={{ position: "absolute", left: -10, right: -10, top: "50%", height: 10, background: palette.alert, transformOrigin: "0 50%", transform: `scaleX(${strike})` }} /></span>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontSize: 54, fontWeight: 900, letterSpacing: 14, color: `rgb(${LEAF})`, opacity: plain }}>他本人 · 极简朴</div>
          </div>
        )}
        {frame >= c1 && frame < c2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Halo x={960} y={560} r={420} intensity={0.45} rgb={WARM} />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <rect x={520} y={620} width={880} height={24} fill="#3a2c20" stroke={`rgba(${WARM},0.5)`} strokeWidth={2} />
              <g opacity={item(1)}>
                <path d="M930 616 L922 520 L1000 520 L992 616 Z" fill="rgba(180,215,240,0.3)" stroke="rgba(220,235,245,0.8)" strokeWidth={3} />
                <path d="M926 560 L996 560 L992 614 L930 614 Z" fill="rgba(150,200,235,0.45)" />
              </g>
              <g opacity={item(2)}>
                <path d="M1170 616 L1176 560 L1250 560 L1256 616 Z" fill="#d8cfbf" stroke="#fff6e0" strokeWidth={3} />
                <rect x={1166} y={548} width={94} height={14} rx={4} fill="#b8ad98" />
              </g>
            </svg>
            <div style={{ opacity: item(0) }}><Bread x={720} y={612} s={2} /></div>
            {["面包", "清水", "一小罐奶酪"].map((t, i) => (
              <div key={t} style={{ position: "absolute", left: [620, 860, 1110][i], width: 220, top: 670, textAlign: "center", fontSize: 32, fontWeight: 800, color: palette.ink, opacity: item(i) }}>{t}</div>
            ))}
            <div style={{ position: "absolute", left: 0, right: 0, top: 220, textAlign: "center", fontSize: 72, fontWeight: 900, letterSpacing: 24, color: `rgb(${GOLD})`, opacity: feast, transform: `scale(${1.3 - 0.3 * feast})` }}>盛 宴</div>
          </div>
        )}
        {frame >= c2 && frame < c3 && (
          <div style={{ position: "absolute", inset: 0, opacity: gate }}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <line x1={0} y1={FLOOR} x2={1920} y2={FLOOR} stroke={`rgba(${LEAF},0.35)`} strokeWidth={2} />
              <path d={`M300 ${FLOOR} L300 300 Q420 220 540 300 L540 ${FLOOR}`} fill="none" stroke="rgba(160,130,100,0.8)" strokeWidth={10} />
              {Array.from({ length: 16 }, (_, i) => <ellipse key={i} cx={300 + (i % 8) * 34} cy={290 + Math.floor(i / 8) * 30 - Math.sin((i % 8) / 7 * Math.PI) * 50} rx={16} ry={8} fill={`rgba(${LEAF},0.6)`} />)}
              {[700, 1500, 1750].map((x, i) => (
                <g key={x}>
                  <rect x={x - 8} y={FLOOR - 220 - i * 30} width={16} height={220 + i * 30} fill="#2a2018" />
                  <circle cx={x} cy={FLOOR - 260 - i * 30} r={90 + i * 10} fill={`rgba(${LEAF},0.28)`} />
                </g>
              ))}
              <ellipse cx={1100} cy={FLOOR - 170} rx={200} ry={20} fill="#3a2c20" stroke={`rgba(${WARM},0.5)`} strokeWidth={2} />
              <rect x={1092} y={FLOOR - 150} width={16} height={150} fill="#2a2018" />
            </svg>
            <div style={{ position: "absolute", left: 300, width: 240, top: 330, textAlign: "center", fontSize: 30, fontWeight: 900, letterSpacing: 6, color: `rgb(${LEAF})` }}>花园</div>
            <div style={{ position: "absolute", left: 300, width: 240, top: 372, textAlign: "center", fontFamily: fonts.mono, fontSize: 16, letterSpacing: 3, color: palette.dim }}>THE GARDEN</div>
            <Halo x={1100} y={FLOOR - 260} r={360} intensity={0.45} rgb={WARM} />
            <Bread x={1060} y={FLOOR - 178} s={0.8} />
            <Seated x={980} floor={FLOOR} scale={1.25} glow={0.45} />
            <div style={{ position: "absolute", inset: 0, transform: "scaleX(-1)", transformOrigin: "1100px 0" }}>
              <Seated x={980} floor={FLOOR} scale={1.25} glow={0.45} />
            </div>
            {["聊天", "吃饭", "思考"].map((t, i) => (
              <div key={t} style={{ position: "absolute", left: 880 + i * 160, top: 300 - (i % 2) * 40, padding: "8px 18px", borderRadius: 16, border: `2px solid rgba(${WARM},0.6)`, fontSize: 30, fontWeight: 800, color: `rgb(${WARM})`, opacity: ramp(frame, c2 + 6 * BEAT + i * BEAT, 8) }}>{t}</div>
            ))}
          </div>
        )}
        {frame >= c3 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontSize: 44, fontWeight: 900, letterSpacing: 10, color: palette.dim }}>
              快乐 ≠ <span style={{ color: `rgb(${PINK})` }}>狂欢</span> <span style={{ color: palette.alert, opacity: ramp(frame, c3 + BEAT, 6) }}>✕</span>
            </div>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <path d={wave(400, 60)} fill="none" stroke={`rgb(${WARM})`} strokeWidth={5} />
              <path d={wave(620, 60)} fill="none" stroke={`rgb(${LEAF})`} strokeWidth={5} />
            </svg>
            <div style={{ position: "absolute", left: 120, top: 370, fontSize: 34, fontWeight: 900, color: `rgb(${WARM})` }}>身体</div>
            <div style={{ position: "absolute", left: 120, top: 590, fontSize: 34, fontWeight: 900, color: `rgb(${LEAF})` }}>灵魂</div>
            <div style={{ position: "absolute", left: 1600, top: 350, fontSize: 34, fontWeight: 900, color: `rgb(${WARM})`, opacity: calm }}>无痛苦 ✓</div>
            <div style={{ position: "absolute", left: 1600, top: 570, fontSize: 34, fontWeight: 900, color: `rgb(${LEAF})`, opacity: calm }}>无纷扰 ✓</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={frame < c1 ? PINK : WARM} opacity={0.3} />
      <Sfx name="glitch" at={4 * BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.4} />
      {[0, 1, 2].map((i) => (
        <Sfx key={i} name="shutter" at={c1 + 4 + i * BEAT} volume={0.2} />
      ))}
      <Sfx name="glint" at={c1 + 4 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.4} />
      <Sfx name="whoosh" at={c3 - 3} volume={0.4} />
      <Sfx name="rise" at={c3 + 2 * BEAT} volume={0.25} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
