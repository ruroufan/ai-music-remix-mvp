import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { GREY, Reasoning } from "../study";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const ROWS = ["收入", "成本", "人力", "营销", "现金流"];
const METHODS = ["费曼学习法", "番茄钟", "间隔重复", "思维导图", "康奈尔笔记", "刻意练习", "SQ3R", "主动回忆", "交错练习", "二八法则", "第一性原理", "费曼 2.0", "晨间学习", "沉浸法", "项目驱动", "输出倒逼", "每日一小时", "微习惯", "复盘法", "OKR 学习"];

// Three moments, full screen, a whip-pan between each.
// 1 · a business plan: a spreadsheet filling itself out to 第 3 年, a chart
//     climbing — and under it, 第一步：☐ — 已迈出 0 步.
// 2 · twenty study methods fanning out, two per half beat; 开始学习 0%.
// 3 · the two of them, a probability tree of everything she might say between
//     them — and a message box, cursor blinking, 发送 greyed out.
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : 2;
  const cells = Math.max(0, Math.floor((frame - BEAT) / 3));
  const chart = interpolate(frame, [2 * BEAT, c1 - 2 * BEAT], [0, 1], clamp);
  const methods = Math.max(0, Math.min(METHODS.length, Math.floor((frame - c1) / HALF_BEAT) * 2 + 2));
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1, c2]} hits={keyHits(lines, cues, duration)}>
        {seg === 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 260, top: 160, width: 760 }}>
              <div style={{ fontSize: 32, fontWeight: 900, marginBottom: 16 }}>创业计划 · 现金流预测</div>
              <div style={{ display: "grid", gridTemplateColumns: "140px repeat(3, 1fr)", gap: 6, fontFamily: fonts.mono, fontSize: 22 }}>
                {["", "第 1 年", "第 2 年", "第 3 年"].map((h) => <div key={h} style={{ padding: "8px 10px", color: palette.dim }}>{h}</div>)}
                {ROWS.map((r, i) => (
                  <React.Fragment key={r}>
                    <div style={{ padding: "8px 10px", color: palette.ink, fontFamily: undefined, fontWeight: 800 }}>{r}</div>
                    {[0, 1, 2].map((y) => {
                      const on = i * 3 + y < cells;
                      return <div key={y} style={{ padding: "8px 10px", border: `1px solid rgba(${GREY},0.3)`, color: i === 4 ? "#7fe0a0" : palette.ink, opacity: on ? 1 : 0.15 }}>{on ? `${((i + 1) * 13 + y * 37) % 90 + 10}.${(i * 7 + y) % 10}万` : ""}</div>;
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <line x1={1120} y1={560} x2={1660} y2={560} stroke={`rgba(${GREY},0.5)`} />
              <line x1={1120} y1={560} x2={1120} y2={200} stroke={`rgba(${GREY},0.5)`} />
              <polyline points={Array.from({ length: 13 }, (_, i) => `${1120 + i * 45},${560 - Math.pow(i / 12, 1.6) * 320 * chart + Math.sin(i * 1.7) * 14 * chart}`).filter((_, i) => i / 12 <= chart).join(" ")} fill="none" stroke="#7fe0a0" strokeWidth={4} />
            </svg>
            <div style={{ position: "absolute", left: 260, top: 620, display: "flex", alignItems: "center", gap: 18, fontSize: 36, fontWeight: 900, opacity: ramp(frame, c1 - 4 * BEAT, 8) }}>
              第一步：<span style={{ display: "inline-block", width: 40, height: 40, border: `3px solid ${palette.ink}`, borderRadius: 6 }} />
              <span style={{ fontFamily: fonts.mono, fontSize: 26, color: palette.alert, marginLeft: 30 }}>已迈出 0 步</span>
            </div>
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            {METHODS.slice(0, methods).map((m, i) => {
              const a = (i / METHODS.length) * Math.PI - Math.PI;
              const p = ramp(frame, c1 + Math.floor(i / 2) * HALF_BEAT, 6);
              const x = 960 + Math.cos(a) * 560 * p, y = 640 + Math.sin(a) * 420 * p;
              return <div key={m} style={{ position: "absolute", left: x - 90, top: y - 26, width: 180, padding: "10px 0", textAlign: "center", borderRadius: 10, background: "rgba(22,24,28,0.95)", border: `2px solid rgba(${GREY},0.5)`, fontSize: 22, fontWeight: 800, transform: `rotate(${(a + Math.PI / 2) * 20}deg)` }}>{m}</div>;
            })}
            <div style={{ position: "absolute", left: 760, top: 560, width: 400, textAlign: "center" }}>
              <div style={{ fontSize: 30, fontWeight: 900 }}>
                学习方法 <span style={{ fontFamily: fonts.mono, color: palette.ink }}>×{methods}</span>
              </div>
              <div style={{ marginTop: 14, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.08)", border: `1px solid ${palette.faint}` }} />
              <div style={{ marginTop: 10, fontFamily: fonts.mono, fontSize: 24, color: palette.alert }}>开始学习 0%</div>
            </div>
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Stander x={420} bottom={740} height={300} lift={0.6} glow={0.6} />
            <Stander x={1500} bottom={740} height={290} lift={1} glow={0.6} rgb="255, 176, 104" />
            <Reasoning frame={frame} ox={440} oy={440} grow={interpolate(frame, [c2, c2 + 4 * BEAT], [0, 1], clamp)} seed="love" />
            <div style={{ position: "absolute", left: 640, top: 600, width: 640, padding: "16px 22px", borderRadius: 16, background: "rgba(22,24,28,0.95)", border: `2px solid ${palette.faint}`, display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 26, color: palette.dim, flex: 1 }}>
                说点什么…<span style={{ display: "inline-block", width: 3, height: 28, marginLeft: 6, verticalAlign: "middle", background: palette.ink, opacity: Math.floor(frame / 8) % 2 ? 1 : 0 }} />
              </span>
              <span style={{ padding: "8px 18px", borderRadius: 10, background: "rgba(255,255,255,0.1)", color: palette.dim, fontSize: 24, fontWeight: 800 }}>发送</span>
            </div>
            <div style={{ position: "absolute", left: 640, top: 690, fontFamily: fonts.mono, fontSize: 22, color: palette.alert, opacity: ramp(frame, c2 + 4 * BEAT, 8) }}>说出口 0 句 · 推演 {Math.round(interpolate(frame, [c2, duration], [12, 214], clamp))} 种可能</div>
            <div style={{ position: "absolute", left: 1400, top: 360, fontSize: 30, fontWeight: 900, color: look.key, opacity: ramp(frame, c2 + 2 * BEAT, 8) }}>？</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb="200, 205, 215" opacity={0.6} />
      <Sfx name="shutter" at={BEAT} volume={0.2} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.5} />
      {Array.from({ length: 10 }, (_, i) => (
        <Sfx key={i} name="shutter" at={c1 + i * HALF_BEAT} volume={0.12} />
      ))}
      <Sfx name="whoosh" at={c2 - 3} volume={0.5} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
