import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { FLAME, Highway, Moto, SHADE } from "../chase";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const DOSES = [120, 200, 280, 360];
const VIEWS = [
  { t: "雪山", d: "3,000 km", x: 330, y: 230, r: -6 },
  { t: "沙漠", d: "5,200 km", x: 690, y: 190, r: 4 },
  { t: "海岛", d: "7,800 km", x: 1230, y: 200, r: -3 },
  { t: "极光", d: "9,600 km", x: 1590, y: 250, r: 6 },
];

// 0 · faster: each thrill wears off quicker than the last — the needle steps
//     120 → 200 → 280 → 360, the road a blur, the bike shaking.
// 1 · postcards of the farthest places he's been, with their distances —
//     雪山 3,000 km · 沙漠 · 海岛 · 极光 9,600 km — and in the middle a mirror,
//     0 km, that he's never looked into: 最近的自己 · 从没见过.
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const step = Math.min(DOSES.length - 1, Math.floor(frame / (2 * BEAT)));
  const shake = step * 1.5;
  const mirror = ramp(frame, c1 + 4 * BEAT, 12);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1]} hits={[...DOSES.map((_, i) => i * 2 * BEAT), c1 + 4 * BEAT, ...keyHits(lines, cues, duration)]}>
        {frame < c1 ? (
          <div style={{ position: "absolute", inset: 0 }}>
            <Highway dist={frame * (30 + step * 14) + step * 400} blur={0.5 + 0.17 * step} />
            <div style={{ position: "absolute", inset: 0, transform: `translate(${Math.sin(frame * 3.1) * shake}px, ${Math.cos(frame * 2.7) * shake}px)` }}>
              <Moto x={1000} spin={frame} frame={frame} scale={1.35} />
            </div>
            <div style={{ position: "absolute", left: 1400, top: 150, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 4, color: "rgba(232,238,242,0.55)" }}>
              <span style={{ fontSize: 66, fontWeight: 700, color: step === DOSES.length - 1 ? palette.alert : `rgb(${FLAME})` }}>{DOSES[step]}</span> km/h
            </div>
            <div style={{ position: "absolute", left: 140, top: 160, fontFamily: fonts.mono, fontSize: 24, letterSpacing: 6, color: palette.dim }}>
              刺激 · {[0, 1, 2, 3].map((i) => <span key={i} style={{ display: "inline-block", width: 16, height: 26, marginRight: 6, verticalAlign: "-4px", background: `rgb(${FLAME})`, opacity: i < 4 - step ? 1 : 0.2 }} />)} 不够用
            </div>
          </div>
        ) : (
          <div style={{ position: "absolute", inset: 0 }}>
            {VIEWS.map((v, i) => {
              const p = ramp(frame, c1 + 4 + i * 6, 8);
              return (
                <div key={v.t} style={{ position: "absolute", left: v.x - 140, top: v.y, width: 280, height: 210, background: "#efe8d8", padding: 12, boxSizing: "border-box", transform: `rotate(${v.r}deg) scale(${0.8 + 0.2 * p})`, opacity: p * (1 - 0.4 * mirror), boxShadow: "0 12px 28px rgba(0,0,0,0.5)" }}>
                  <div style={{ width: "100%", height: 130, background: ["linear-gradient(#9fb4c8,#eef3f7)", "linear-gradient(#e0a060,#f3d39c)", "linear-gradient(#58a8c8,#e8d6a0)", "linear-gradient(#10203a,#3a9a7a)"][i] }} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 26, fontWeight: 900, color: "#262019" }}>
                    <span>{v.t}</span>
                    <span style={{ fontFamily: fonts.mono, fontSize: 18, fontWeight: 400 }}>{v.d}</span>
                  </div>
                </div>
              );
            })}
            <Halo x={960} y={560} r={260} intensity={0.35 * mirror} rgb={SHADE} />
            <div style={{ position: "absolute", left: 960 - 110, top: 420, width: 220, height: 300, borderRadius: 110, border: `5px solid rgba(232,238,242,${0.25 + 0.5 * mirror})`, background: "rgba(20,18,30,0.85)", opacity: mirror }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 545, textAlign: "center", fontFamily: fonts.mono, fontSize: 26, color: palette.dim, opacity: mirror }}>0 km</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 740, textAlign: "center", fontSize: 32, fontWeight: 900, letterSpacing: 8, color: `rgb(${SHADE})`, opacity: mirror }}>最近的自己 · 从没见过</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={frame < c1 ? FLAME : SHADE} opacity={0.3} />
      {DOSES.map((_, i) => (
        <Sfx key={i} name="whoosh" at={i * 2 * BEAT} volume={0.25 + 0.05 * i} />
      ))}
      <Sfx name="whoosh" at={c1 - 3} volume={0.45} />
      {VIEWS.map((_, i) => (
        <Sfx key={`v${i}`} name="shutter" at={c1 + 4 + i * 6} volume={0.18} />
      ))}
      <Sfx name="glint" at={c1 + 4 * BEAT} volume={0.4} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
