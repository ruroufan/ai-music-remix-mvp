import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { GREY, RED, WARM } from "../ring";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const CHAT = [["小林", "周末一起吃火锅？"], ["阿杰", "好啊好啊"], ["我", "那我订位置！大家几点方便？"], ["小雨", "7点"]];
const FACES = ["小林", "阿杰", "小雨", "老周", "朵朵", "阿美"];
const MOOD = [1, 1, 0.5, 1, 0, 1];

const Face: React.FC<{ x: number; y: number; m: number; size?: number }> = ({ x, y, m, size = 1 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
    <circle cx={x} cy={y} r={40 * size} fill="#1a1d23" stroke={`rgba(232,238,242,0.6)`} strokeWidth={3} />
    <circle cx={x - 13 * size} cy={y - 8 * size} r={4 * size} fill="#e8eef2" />
    <circle cx={x + 13 * size} cy={y - 8 * size} r={4 * size} fill="#e8eef2" />
    <path d={`M${x - 16 * size} ${y + 14 * size} Q${x} ${y + 14 * size + 16 * (m - 0.5) * size} ${x + 16 * size} ${y + 14 * size}`} fill="none" stroke="#e8eef2" strokeWidth={3} />
  </svg>
);

// Three moments, full screen, a whip-pan between each.
// 1 · a group chat, lively — but one avatar hasn't said a word: 已读. His own
//     last message gets a red outline — 是不是我说错了什么？
// 2 · 23:40, after the party: a row of faces, and he goes down them one by
//     one — happy? happy? not sure… — 复盘中.
// 3 · a stranger's flat, cold face — and his week as a strip of days going
//     grey: 第 1 天 · 第 2 天 · 第 3 天.
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : 2;
  const worry = ramp(frame, 5 * BEAT, 8);
  const review = Math.min(FACES.length, Math.max(0, Math.floor((frame - c1 - BEAT) / (BEAT * 0.9))));
  const days = Math.min(3, Math.max(0, Math.floor((frame - c2 - 3 * BEAT) / (1.5 * BEAT)) + 1));
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1, c2]} hits={[5 * BEAT, c2 + 2 * BEAT, ...keyHits(lines, cues, duration)]}>
        {seg === 0 && (
          <div style={{ position: "absolute", left: 560, top: 140, width: 800, height: 680, borderRadius: 24, background: "rgba(14,18,24,0.94)", border: "2px solid rgba(232,238,242,0.2)", padding: "24px 32px" }}>
            <div style={{ fontSize: 26, color: palette.dim, borderBottom: "1px solid rgba(232,238,242,0.15)", paddingBottom: 12 }}>周末饭搭子（8）</div>
            {CHAT.map(([who, msg], i) => (
              <div key={i} style={{ display: "flex", justifyContent: who === "我" ? "flex-end" : "flex-start", marginTop: 22, opacity: ramp(frame, 4 + i * 8, 6) }}>
                <div style={{ padding: "12px 20px", borderRadius: 16, background: who === "我" ? `rgba(${WARM},0.18)` : "rgba(255,255,255,0.08)", border: who === "我" && worry > 0 ? `3px solid rgba(${RED},${worry})` : "3px solid transparent", fontSize: 28, color: palette.ink }}>
                  <span style={{ fontSize: 20, color: palette.dim, marginRight: 10 }}>{who}</span>{msg}
                </div>
              </div>
            ))}
            <div style={{ marginTop: 30, fontSize: 24, color: palette.dim, opacity: ramp(frame, 3 * BEAT, 8) }}>老周 · 已读 · 没回复</div>
            <div style={{ position: "absolute", right: -260, top: 260, padding: "12px 22px", borderRadius: 40, border: "3px dashed rgba(232,238,242,0.5)", fontSize: 30, fontWeight: 900, color: palette.ink, opacity: worry }}>是不是我说错了？</div>
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 160, textAlign: "center", fontFamily: fonts.mono, fontSize: 30, letterSpacing: 6, color: palette.dim }}>23:40 · 聚会结束 · 复盘中</div>
            {FACES.map((n, i) => {
              const x = 360 + i * 240, checked = i < review;
              return (
                <div key={n}>
                  <Face x={x} y={480} m={MOOD[i]} size={1.4} />
                  <div style={{ position: "absolute", left: x - 80, width: 160, top: 560, textAlign: "center", fontSize: 26, color: palette.ink }}>{n}</div>
                  <div style={{ position: "absolute", left: x - 80, width: 160, top: 610, textAlign: "center", fontSize: 32, fontWeight: 900, color: MOOD[i] === 1 ? `rgb(${WARM})` : `rgb(${RED})`, opacity: checked ? 1 : 0 }}>{MOOD[i] === 1 ? "开心 ✓" : MOOD[i] === 0 ? "不开心？" : "还行？"}</div>
                </div>
              );
            })}
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Face x={560} y={400} m={0.5} size={3} />
            <div style={{ position: "absolute", left: 420, width: 280, top: 560, textAlign: "center", fontSize: 28, color: palette.dim, opacity: ramp(frame, c2 + 4, 8) }}>嗯。（冷淡）</div>
            <Stander x={1300} bottom={900} height={380} lift={0} glow={0.3} rgb={GREY} />
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ position: "absolute", left: 1040 + i * 180, top: 200, width: 150, height: 120, borderRadius: 12, border: "2px solid rgba(232,238,242,0.4)", background: i < days ? "#2a2f38" : "transparent", textAlign: "center", paddingTop: 20, fontSize: 24, color: palette.ink, opacity: i < days ? 1 : 0.2 }}>
                第 {i + 1} 天
                <div style={{ fontSize: 34, marginTop: 6, color: `rgb(${GREY})` }}>阴</div>
              </div>
            ))}
            <div style={{ position: "absolute", left: 1040, top: 360, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: palette.dim, opacity: ramp(frame, c2 + 7 * BEAT, 8) }}>根本不了解他</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={WARM} opacity={0.35} />
      {CHAT.map((_, i) => (
        <Sfx key={i} name="shutter" at={4 + i * 8} volume={0.12} />
      ))}
      <Sfx name="glitch" at={5 * BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.5} />
      {FACES.map((_, i) => (
        <Sfx key={`f${i}`} name="step" at={Math.round(c1 + BEAT + i * BEAT * 0.9)} volume={0.15} />
      ))}
      <Sfx name="whoosh" at={c2 - 3} volume={0.5} />
      <Sfx name="stamp" at={c2 + 4} volume={0.3} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
