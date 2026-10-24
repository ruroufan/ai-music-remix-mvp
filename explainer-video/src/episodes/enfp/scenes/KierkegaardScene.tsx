import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Field, GROUND, LEAF, PLOTS, Plot, SUN, plotCx } from "../field";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const CROPS = ["吉他", "滑板", "摄影", "烘焙", "日语", "跑步", "画画", "播客", "露营", "陶艺", "编程", "舞蹈"];
const THINGS = ["新爱好", "新工作", "新城市", "新朋友", "新计划", "新目标", "新恋情", "新开始"];
const GREY = "150, 156, 166";

// Kierkegaard's aesthete, and the other way.
// 0 · grey fog creeping in from every edge — 无聊 — and him backing away from
//     it into the last bright patch.
// 1 · crop rotation: four plots, and what's planted in them keeps changing
//     every half-beat — 吉他 → 滑板 → 摄影 → 烘焙 … — never left long enough
//     to grow.
// 2 · a card stamped 新, and as you watch the stamp turns to 旧 and the card
//     is swapped for the next — faster and faster: 换 ×N.
// 3 · the two stages: 审美阶段 — dots scattered everywhere, blinking on and
//     off — → 伦理阶段: one dot, holding still, putting down roots.
// 4 · a stake driven into one plot, a flag on it: 选定 · 负责. The other
//     plots go quiet.
export const KierkegaardScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2, c3, c4] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : frame < c3 ? 2 : frame < c4 ? 3 : 4;
  const fog = interpolate(frame, [0, c1 - BEAT], [0, 1], clamp);
  const rot = Math.floor((frame - c1) / (BEAT / 2));
  let n = 0;
  for (let t = 0, d = 12; t + d < frame - c2; t += d, d = Math.max(3, d * 0.85)) n++;
  const age = (() => { let t = 0, d = 12; for (let i = 0; i < n; i++) { t += d; d = Math.max(3, d * 0.85); } return Math.min(1, (frame - c2 - t) / d); })();
  const stake = interpolate(frame, [c4 + BEAT, c4 + BEAT + 6], [0, 1], { ...clamp, easing: (t) => t * t });
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} whips={[c1, c2, c3, c4]} hits={[c4 + BEAT + 6, ...keyHits(lines, cues, duration)]}>
        {seg === 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Halo x={960} y={560} r={420 - 260 * fog} intensity={0.8} rgb={SUN} />
            <Stander x={960 + 30 * fog} bottom={880} height={380} lift={0} glow={0.7} rgb={SUN} />
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 55%, transparent ${45 - 30 * fog}%, rgba(${GREY},${0.35 + 0.3 * fog}) ${70 - 25 * fog}%)` }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 160, textAlign: "center", fontSize: 72, fontWeight: 900, letterSpacing: 20, color: `rgba(${GREY},${0.4 + 0.6 * fog})` }}>无 聊</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 8, color: palette.dim, opacity: ramp(frame, 2 * BEAT, 10) }}>审美的人 · 最怕的东西</div>
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Field />
            {[1, 2, 3, 4].map((i, k) => {
              const phase = ((frame - c1) % (BEAT / 2)) / (BEAT / 2);
              return (
                <div key={i}>
                  <Plot i={i} g={0.15 + 0.3 * phase} seeded={1} />
                  <div style={{ position: "absolute", left: PLOTS[i].x, width: PLOTS[i].w, top: GROUND - 160, textAlign: "center", fontSize: 40, fontWeight: 900, color: `rgb(${k % 2 ? LEAF : SUN})`, transform: `scale(${1.3 - 0.3 * Math.min(1, phase * 4)})` }}>{CROPS[(Math.max(0, rot) + k * 3) % CROPS.length]}</div>
                </div>
              );
            })}
            <div style={{ position: "absolute", left: 0, right: 0, top: 160, textAlign: "center", fontFamily: fonts.mono, fontSize: 28, letterSpacing: 10, color: `rgb(${SUN})` }}>轮作 · 不断更换生活的内容</div>
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 760, top: 300, width: 400, height: 300, borderRadius: 18, background: `rgba(${age > 0.6 ? GREY : SUN},${0.12 + 0.1 * (1 - age)})`, border: `3px solid rgb(${age > 0.6 ? GREY : SUN})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60, fontWeight: 900, color: palette.ink, transform: `scale(${1.15 - 0.15 * Math.min(1, age * 5)})` }}>{THINGS[n % THINGS.length]}</div>
            <div style={{ position: "absolute", left: 1080, top: 260, width: 120, height: 120, borderRadius: 60, border: `5px solid rgb(${age > 0.6 ? GREY : "255,110,110"})`, textAlign: "center", lineHeight: "108px", fontSize: 64, fontWeight: 900, color: `rgb(${age > 0.6 ? GREY : "255,110,110"})`, transform: "rotate(14deg)" }}>{age > 0.6 ? "旧" : "新"}</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 660, textAlign: "center", fontFamily: fonts.mono, fontSize: 30, letterSpacing: 6, color: palette.dim }}>
              换 <span style={{ fontSize: 56, color: `rgb(${SUN})` }}>×{n + 1}</span>
            </div>
          </div>
        )}
        {seg === 3 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              {Array.from({ length: 40 }, (_, i) => {
                const on = Math.sin(frame / 3 + random(`d${i}`) * 20) > 0;
                return <circle key={i} cx={300 + random(`dx${i}`) * 480} cy={300 + random(`dy${i}`) * 360} r={8} fill={`rgba(${SUN},${on ? 0.9 : 0.15})`} />;
              })}
              <path d="M860 480 L1040 480" stroke="rgba(232,238,242,0.6)" strokeWidth={5} />
              <path d="M1020 464 L1044 480 L1020 496" fill="none" stroke="rgba(232,238,242,0.6)" strokeWidth={5} />
              <g opacity={ramp(frame, c3 + 2 * BEAT, 10)}>
                <circle cx={1400} cy={440} r={40} fill={`rgb(${LEAF})`} />
                {[-60, -25, 25, 60].map((d, k) => <path key={k} d={`M1400 480 Q${1400 + d * 0.5} 560 ${1400 + d} 640`} fill="none" stroke={`rgba(${LEAF},0.8)`} strokeWidth={4} />)}
              </g>
            </svg>
            <div style={{ position: "absolute", left: 340, width: 400, top: 700, textAlign: "center", fontSize: 44, fontWeight: 900, color: `rgb(${SUN})` }}>审美阶段</div>
            <div style={{ position: "absolute", left: 1200, width: 400, top: 700, textAlign: "center", fontSize: 44, fontWeight: 900, color: `rgb(${LEAF})`, opacity: ramp(frame, c3 + 2 * BEAT, 10) }}>伦理阶段</div>
          </div>
        )}
        {seg === 4 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Field />
            {PLOTS.map((_, i) => (
              <Plot key={i} i={i} g={0.3} seeded={1} dim={i === 2 ? 0 : ramp(frame, c4 + 2 * BEAT, 12)} glow={i === 2 ? 0.6 * stake : 0} />
            ))}
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <rect x={plotCx(2) - 6} y={GROUND - 260 - (1 - stake) * 300} width={12} height={250} fill="#8a6a4a" />
              <path d={`M${plotCx(2) + 6} ${GROUND - 250 - (1 - stake) * 300} L${plotCx(2) + 150} ${GROUND - 215 - (1 - stake) * 300} L${plotCx(2) + 6} ${GROUND - 180 - (1 - stake) * 300} Z`} fill={`rgb(${SUN})`} />
            </svg>
            <div style={{ position: "absolute", left: plotCx(2) + 180, top: GROUND - 300, fontSize: 48, fontWeight: 900, color: `rgb(${SUN})`, textShadow: `0 0 20px rgba(${SUN},0.7)`, opacity: ramp(frame, c4 + 2 * BEAT, 8) }}>选定 · 负责</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={SUN} opacity={seg === 0 ? 0.2 : 0.45} />
      <Sfx name="rise" at={0} volume={0.2} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.45} />
      {Array.from({ length: 16 }, (_, i) => (
        <Sfx key={i} name="shutter" at={c1 + Math.round(i * (BEAT / 2))} volume={0.08} />
      ))}
      <Sfx name="whoosh" at={c2 - 3} volume={0.45} />
      <Sfx name="whoosh" at={c3 - 3} volume={0.45} />
      <Sfx name="glint" at={c3 + 2 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c4 - 3} volume={0.45} />
      <Sfx name="stamp" at={c4 + BEAT + 6} volume={0.6} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
