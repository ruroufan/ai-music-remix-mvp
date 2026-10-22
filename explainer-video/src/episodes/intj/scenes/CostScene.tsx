import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { BP, GlassBox, RED } from "../blueprint";
import { ImpactBack, ImpactFront, keyHits } from "../impact";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FLOOR = 760;
const PEOPLE = [[420, 1], [640, 0.8], [1300, 0.85], [1520, 1]];
const NEW = ["新想法", "反例", "别人的经验", "意外"];

// 0 · in the glass box, more and more sure — 确信 climbing — while the people
//     round him drift away and fade: 孤独.
// 1 · one per beat something new flies at the glass — 新想法 · 反例 · 别人的
//     经验 · 意外 — and bounces off; inside, 推演 v1.0 · 无更新.
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const sure = interpolate(frame, [0, c1], [0.7, 0.99], clamp);
  const drift = interpolate(frame, [0, c1 + 2 * BEAT], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.1]} focus={{ x: 960, y: 520 }} hits={[...NEW.map((_, i) => c1 + BEAT + i * BEAT + 8), ...keyHits(lines, cues, duration)]}>
        {PEOPLE.map(([x, s], i) => {
          const dir = x < 960 ? -1 : 1;
          return (
            <div key={i} style={{ position: "absolute", inset: 0, opacity: 1 - 0.85 * drift }}>
              <Stander x={x + dir * drift * 260} bottom={FLOOR - drift * 60} height={240 * s * (1 - 0.4 * drift)} lift={1} glow={0.4} />
            </div>
          );
        })}
        <GlassBox x={960} bottom={FLOOR} w={320} h={430} k={1} />
        <Stander x={960} bottom={FLOOR} height={300} lift={1.7} glow={0.8} rgb={BP} />
        {NEW.map((t, i) => {
          const at = c1 + BEAT + i * BEAT;
          if (frame < at || frame > at + 22) return null;
          const p = (frame - at) / 22;
          const hit = 8 / 22;
          const fromLeft = i % 2 === 0;
          const edge = fromLeft ? 960 - 160 : 960 + 160;
          const start = fromLeft ? 200 : 1720;
          const x = p < hit ? start + (edge - start) * (p / hit) : edge + (fromLeft ? -1 : 1) * 300 * ((p - hit) / (1 - hit));
          const y = 360 + i * 70 + (p > hit ? 200 * Math.pow((p - hit) / (1 - hit), 2) : 0);
          return <div key={t} style={{ position: "absolute", left: x - (fromLeft ? 160 : 0), top: y, width: 160, padding: "6px 0", textAlign: "center", borderRadius: 10, border: `2px solid rgba(255,199,122,0.7)`, background: "rgba(40,30,10,0.8)", fontSize: 24, fontWeight: 800, color: "#ffc77a", opacity: p > hit ? 1 - (p - hit) / (1 - hit) : 1 }}>{t}</div>;
        })}
        <div style={{ position: "absolute", left: 1320, top: 170, width: 360 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, fontWeight: 800 }}>
            <span>确信</span>
            <span style={{ fontFamily: fonts.mono, color: `rgb(${BP})` }}>{Math.round(sure * 100)}%</span>
          </div>
          <div style={{ marginTop: 8, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.08)" }}>
            <div style={{ width: `${sure * 100}%`, height: "100%", borderRadius: 6, background: `rgb(${BP})` }} />
          </div>
          <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", fontSize: 28, fontWeight: 800 }}>
            <span>身边的人</span>
            <span style={{ fontFamily: fonts.mono, color: `rgb(${RED})` }}>{Math.round(4 * (1 - drift))}</span>
          </div>
        </div>
        <div style={{ position: "absolute", left: 960 - 200, width: 400, top: FLOOR + 44, textAlign: "center", fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim, opacity: frame >= c1 ? 1 : 0 }}>推演 v1.0 · 无更新</div>
      </Cam>
      <Bokeh frame={frame} rgb={BP} opacity={0.7} />
      <Sfx name="rise" at={0} volume={0.2} />
      {NEW.map((_, i) => (
        <Sfx key={i} name="glint" at={c1 + BEAT + i * BEAT + 8} volume={0.4} />
      ))}
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
