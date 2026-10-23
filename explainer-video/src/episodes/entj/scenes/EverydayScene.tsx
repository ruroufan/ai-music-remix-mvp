import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Walker } from "../../nostalgia/road";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { COLD, Crowd, FLOOR, GOLD, Leader, Spot, Stage, stageTop } from "../podium";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const YES = ["是的", "您说得对", "好的", "没问题", "听您的", "对对对", "明白", "好"];

// Three moments, full screen, a whip-pan between each.
// 1 · 项目上线 ✓ — gold confetti — and the team walking off both ways; 一起庆祝
//     · 0 人.
// 2 · home: his word stamps down — 就这么定了 — and the voices round the table
//     drop away one by one; 家里的声音 → 0.
// 3 · the top of the stage, higher than ever; below, everyone bowed, saying
//     the same thing one per half beat — 是的 · 您说得对 · 好的 … — 真话 0.
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : 2;
  const leave = interpolate(frame, [2 * BEAT, c1 - BEAT], [0, 1], clamp);
  const stamp = ramp(frame, c1 + BEAT, 5);
  const yes = Math.max(0, Math.min(YES.length, Math.floor((frame - c2 - BEAT) / HALF_BEAT) + 1));
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1, c2]} hits={[BEAT, c1 + BEAT, ...keyHits(lines, cues, duration)]}>
        {seg === 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 960 - 330, top: 160, width: 660, padding: "22px 0", textAlign: "center", borderRadius: 14, background: `rgba(${GOLD},0.16)`, border: `3px solid rgb(${GOLD})`, fontSize: 64, fontWeight: 900, color: `rgb(${GOLD})`, opacity: ramp(frame, BEAT, 6), transform: `scale(${1.3 - 0.3 * ramp(frame, BEAT, 6)})` }}>项目上线 ✓</div>
            {Array.from({ length: 40 }, (_, i) => {
              const t = (frame - BEAT) / 50;
              if (t < 0 || t > 1) return null;
              const a = random(`cf-a-${i}`) * Math.PI - Math.PI;
              const v = 300 + random(`cf-v-${i}`) * 500;
              return <div key={i} style={{ position: "absolute", left: 960 + Math.cos(a) * v * t, top: 230 + Math.sin(a) * v * t * 0.6 + 400 * t * t, width: 10, height: 6, background: i % 3 ? `rgb(${GOLD})` : palette.ink, transform: `rotate(${t * 400 + i * 30}deg)`, opacity: 1 - t }} />;
            })}
            <Leader x={960} bottom={FLOOR} height={270} lift={1.6} />
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const dir = i < 3 ? -1 : 1;
              const x0 = 960 + dir * (200 + (i % 3) * 130);
              return <Walker key={i} x={x0 + dir * 700 * leave} bottom={FLOOR} height={230} face={dir > 0 ? "right" : "left"} walk={leave * 25 + i} glow={0.4} rgb={COLD} opacity={1 - 0.6 * leave} />;
            })}
            <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontFamily: fonts.mono, fontSize: 26, letterSpacing: 6, color: palette.dim, opacity: leave }}>
              一起庆祝 · <span style={{ color: palette.alert, fontSize: 38 }}>0</span> 人
            </div>
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <path d={`M460 ${FLOOR} L460 380 L960 160 L1460 380 L1460 ${FLOOR}`} fill="rgba(20,22,26,0.9)" stroke={`rgba(${GOLD},0.35)`} strokeWidth={3} />
              <rect x={760} y={FLOOR - 120} width={400} height={14} fill="#2a2118" />
            </svg>
            <Leader x={620} bottom={FLOOR} height={270} lift={1.7} halo={0.3} />
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ position: "absolute", inset: 0, opacity: 1 - 0.5 * ramp(frame, c1 + 2 * BEAT + i * BEAT, 10) }}>
                <Leader x={1060 + i * 130} bottom={FLOOR} height={200 - i * 20} lift={0.4} glow={0.4} halo={0} />
              </div>
            ))}
            {/* the voices: bars going flat */}
            <div style={{ position: "absolute", left: 1040, top: 420, display: "flex", gap: 8, alignItems: "flex-end", height: 80 }}>
              {Array.from({ length: 14 }, (_, i) => {
                const lvl = (1 - interpolate(frame, [c1 + 2 * BEAT, c2 - BEAT], [0, 1], clamp)) * (0.3 + 0.7 * Math.abs(Math.sin(frame / 4 + i)));
                return <div key={i} style={{ width: 10, height: 6 + 70 * lvl, background: `rgba(${COLD},0.8)` }} />;
              })}
            </div>
            <div style={{ position: "absolute", left: 1040, top: 520, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: palette.dim }}>家里的声音</div>
            {stamp > 0 && (
              <div style={{ position: "absolute", left: 470, top: 250, padding: "12px 30px", border: `6px solid ${palette.alert}`, borderRadius: 12, fontSize: 56, fontWeight: 900, color: palette.alert, transform: `rotate(-8deg) scale(${2 - stamp})`, opacity: stamp }}>就这么定了</div>
            )}
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Spot x={960} y={stageTop(1)} k={1} />
            <Stage rise={1} />
            <Crowd frame={frame} nod={1} />
            <Leader x={960} bottom={stageTop(1)} />
            {YES.slice(0, yes).map((y, i) => {
              const x = [190, 1730, 330, 1590, 470, 1450, 600, 1320][i];
              return <div key={y} style={{ position: "absolute", left: x - 70, width: 140, top: 470 - (i % 2) * 40, textAlign: "center", padding: "6px 0", borderRadius: 14, border: `2px solid rgba(${COLD},0.5)`, background: "rgba(16,20,26,0.9)", fontSize: 24, fontWeight: 800, color: palette.dim }}>{y}</div>;
            })}
            <div style={{ position: "absolute", left: 1230, top: 170, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 4, color: palette.dim }}>
              真话 <span style={{ color: palette.alert, fontSize: 40 }}>0</span>
            </div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} opacity={0.5} />
      <Sfx name="glint" at={BEAT} volume={0.45} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.5} />
      <Sfx name="stamp" at={c1 + BEAT} volume={0.7} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.5} />
      {YES.map((_, i) => (
        <Sfx key={i} name="shutter" at={c2 + BEAT + i * HALF_BEAT} volume={0.12} />
      ))}
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
