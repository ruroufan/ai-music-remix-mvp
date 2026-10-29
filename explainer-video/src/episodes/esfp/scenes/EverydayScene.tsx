import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Walker } from "../../nostalgia/road";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { GOLD, Mask, PINK } from "../stage";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const NAMES = ["阿杰", "小雨", "大鹏", "莉莉", "老王", "婷婷", "阿强", "小美", "浩子", "萌萌", "阿伟", "珊珊", "小林", "可可", "大熊", "晴晴"];
const CHEERS = [
  { t: "哈哈哈你太好笑了", x: 300, y: 260 },
  { t: "有你在真好玩", x: 1280, y: 230 },
  { t: "再来一个！", x: 1380, y: 470 },
  { t: "开心果！", x: 260, y: 520 },
];

// Three moments, full screen, a whip-pan between each.
// 1 · the party: him in the middle, a badge — 气氛担当 — everyone laughing.
//     Then, on the beat, a cut: the street home at night, one lamp, him
//     walking alone. ……
// 2 · his phone: a contact list scrolling and scrolling — 好朋友 487 — and it
//     slows, his thumb hovering: 打给谁？
// 3 · him smiling, a big grin, and all round him: 哈哈哈你太好笑了 · 有你在真
//     好玩 · 再来一个！ — and one bubble nobody fills in, faint, dashed: 你真
//     的开心吗？
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : 2;
  const home = 5 * BEAT;
  const t1 = frame - c1;
  const scroll = t1 < 5 * BEAT ? t1 * t1 * 0.6 : 25 * BEAT * BEAT * 0.6 + (t1 - 5 * BEAT) * 3;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[home, c1, c2]} hits={[c1 + 6 * BEAT, ...keyHits(lines, cues, duration)]}>
        {seg === 0 && frame < home && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Halo x={960} y={480} r={600} intensity={0.5} rgb={PINK} />
            {[420, 640, 1280, 1500].map((x, i) => (
              <Stander key={x} x={x} bottom={820} height={300} lift={1.6 + 0.4 * Math.sin(frame / 3 + i)} glow={0.4} rgb={i % 2 ? PINK : GOLD} />
            ))}
            <Stander x={960} bottom={820} height={360} lift={2} glow={0.8} rgb={GOLD} />
            <div style={{ position: "absolute", left: 960 - 110, top: 330, width: 220, padding: "8px 0", textAlign: "center", borderRadius: 30, background: `rgb(${GOLD})`, color: "#2a1a08", fontSize: 30, fontWeight: 900, letterSpacing: 4, opacity: ramp(frame, BEAT, 6) }}>气氛担当</div>
            {Array.from({ length: 30 }, (_, i) => (
              <div key={i} style={{ position: "absolute", left: (i * 131) % 1900, top: ((i * 71 + frame * (4 + (i % 3))) % 900) - 20, width: 12, height: 7, background: `rgb(${[GOLD, PINK, "130, 200, 255"][i % 3]})`, transform: `rotate(${frame * (4 + i)}deg)` }} />
            ))}
          </div>
        )}
        {seg === 0 && frame >= home && (
          <div style={{ position: "absolute", inset: 0 }}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <line x1={0} y1={820} x2={1920} y2={820} stroke="rgba(232,238,242,0.2)" strokeWidth={2} />
              <line x1={1300} y1={820} x2={1300} y2={300} stroke="rgba(160,160,170,0.6)" strokeWidth={8} />
              <path d="M1300 300 Q1300 270 1250 270" fill="none" stroke="rgba(160,160,170,0.6)" strokeWidth={8} />
              <path d={`M1250 290 L1040 820 L1460 820 Z`} fill="rgba(255,220,160,0.06)" />
            </svg>
            <Halo x={1250} y={290} r={200} intensity={0.6} rgb="255, 220, 160" />
            <Walker x={700 + (frame - home) * 2.2} bottom={820} height={360} face="right" walk={(frame - home) / 6} glow={0.3} rgb={GOLD} />
            <div style={{ position: "absolute", left: 760 + (frame - home) * 2.2, top: 330, fontSize: 44, color: palette.dim, opacity: ramp(frame, home + 2 * BEAT, 10) }}>……</div>
            <div style={{ position: "absolute", left: 120, top: 150, fontFamily: fonts.mono, fontSize: 24, letterSpacing: 6, color: palette.dim }}>回家路上</div>
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 760, top: 110, width: 400, height: 700, borderRadius: 40, background: "#0d1016", border: "4px solid rgba(232,238,242,0.3)", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 80, background: "rgba(232,238,242,0.06)", fontSize: 26, fontWeight: 900, color: palette.ink, display: "flex", alignItems: "center", justifyContent: "center" }}>
                好朋友 · <span style={{ color: `rgb(${GOLD})`, marginLeft: 8 }}>487</span>
              </div>
              <div style={{ position: "absolute", left: 0, right: 0, top: 80, bottom: 0, overflow: "hidden" }}>
                {Array.from({ length: 60 }, (_, i) => {
                  const y = i * 70 - (scroll % (NAMES.length * 70 * 2));
                  return y > -70 && y < 640 ? (
                    <div key={i} style={{ position: "absolute", left: 24, right: 24, top: y, height: 60, display: "flex", alignItems: "center", borderBottom: "1px solid rgba(232,238,242,0.08)" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 20, background: `rgba(${i % 2 ? GOLD : PINK},0.5)`, marginRight: 16 }} />
                      <span style={{ fontSize: 28, fontWeight: 700, color: palette.ink }}>{NAMES[i % NAMES.length]}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
            <div style={{ position: "absolute", left: 1220, top: 420, fontSize: 56, fontWeight: 900, color: `rgb(${PINK})`, opacity: ramp(frame, c1 + 6 * BEAT, 8) }}>打给谁？</div>
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Stander x={960} bottom={900} height={460} lift={1.2} glow={0.6} rgb={GOLD} />
            <Mask x={960} y={900 - 460 * 0.86} r={50} />
            {CHEERS.map((c, i) => (
              <div key={c.t} style={{ position: "absolute", left: c.x, top: c.y, padding: "10px 22px", borderRadius: 18, border: `2px solid rgba(${i % 2 ? PINK : GOLD},0.7)`, fontSize: 32, fontWeight: 800, color: palette.ink, opacity: ramp(frame, c2 + 4 + i * 8, 6) }}>{c.t}</div>
            ))}
            <div style={{ position: "absolute", left: 1150, top: 640, padding: "10px 22px", borderRadius: 18, border: "2px dashed rgba(232,238,242,0.3)", fontSize: 30, color: "rgba(232,238,242,0.3)", opacity: ramp(frame, c2 + 6 * BEAT, 14) }}>你真的开心吗？</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={seg === 0 && frame < home ? PINK : GOLD} opacity={seg === 0 && frame < home ? 0.45 : 0.25} />
      <Sfx name="boom" at={0} volume={0.25} />
      <Sfx name="shutter" at={home} volume={0.5} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.5} />
      <Sfx name="rise" at={c1} volume={0.2} />
      <Sfx name="glint" at={c1 + 6 * BEAT} volume={0.35} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.5} />
      {CHEERS.map((_, i) => (
        <Sfx key={i} name="shutter" at={c2 + 4 + i * 8} volume={0.15} />
      ))}
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
