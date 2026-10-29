import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Stander } from "../../doubt/circles";
import { Walker } from "../../nostalgia/road";
import { Bokeh, Cam } from "../../glass/immersive";
import { ALERT, GLOW, WARM } from "../screens";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const BOOKS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
const CITIES = ["罗马", "雅典", "亚历山大", "科林斯", "迦太基", "那不勒斯", "叙拉古", "马赛"];
const HELLO = ["你好", "嗨", "久仰", "幸会", "hi", "改天聊", "加个好友"];
const FEED = ["头条", "短视频", "热搜", "干货", "直播", "新闻"];

// 0 · the letter itself: SENECA LUCILIO SUO SALUTEM, and the line about books.
// 1 · a different book every day — one per beat, never opened past page one —
//     and a traveller walking across a map, town after town.
// 2 · faces everywhere waving 你好 · 嗨 · 幸会 — and a slot marked 朋友, empty.
// 3 · a body: things go in at the top and straight out the bottom, one per
//     half beat; 营养 stays at 0%.
export const SenecaScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2, c3] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : frame < c3 ? 2 : 3;
  const letter = ramp(frame, 0, 10);
  const book = Math.floor((frame - c1) / BEAT);
  const mapX = (frame - c1) * 4;
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1, c2, c3]} hits={[c1 + BEAT, c2 + BEAT, c3 + 4 * BEAT]}>
        {seg === 0 && (
          <div style={{ position: "absolute", left: 560, top: 150, width: 800, height: 560, borderRadius: 10, background: "#e8e2d4", opacity: letter, transform: `rotate(-2deg) translateY(${(1 - letter) * 30}px)`, boxShadow: "0 20px 50px rgba(0,0,0,0.6)", padding: "40px 56px" }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 24, letterSpacing: 4, color: "#5a4a38" }}>SENECA LUCILIO SUO SALUTEM</div>
            <div style={{ marginTop: 30, fontSize: 38, fontWeight: 900, color: "#2a2118", lineHeight: 1.6 }}>
              读书也是这样：
              <br />
              <span style={{ color: "#a8323a" }}>今天这本，明天那本……</span>
            </div>
            <div style={{ marginTop: 30, fontFamily: fonts.mono, fontSize: 20, color: "#8a7a60", lineHeight: 1.8 }}>EPISTULA II · NUSQUAM EST QUI UBIQUE EST</div>
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            {/* the map, scrolling past */}
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <path d={`M0 640 ${Array.from({ length: 30 }, (_, i) => `L${i * 80 - (mapX % 80)} ${640 + Math.sin((i + Math.floor(mapX / 80)) * 1.7) * 14}`).join(" ")}`} fill="none" stroke="rgba(232,238,242,0.25)" strokeWidth={3} strokeDasharray="10 10" />
            </svg>
            {CITIES.map((c, i) => {
              const x = 1900 + i * 340 - mapX;
              if (x < -100 || x > 2000) return null;
              return (
                <div key={c} style={{ position: "absolute", left: x - 60, top: 540, width: 120, textAlign: "center" }}>
                  <div style={{ fontSize: 30, color: `rgb(${ALERT})` }}>●</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: palette.dim }}>{c}</div>
                </div>
              );
            })}
            <Walker x={760} bottom={650} height={260} face="right" walk={frame * 0.2} glow={0.8} />
            {/* a book a day */}
            {BOOKS.map((b, i) => {
              const on = i === Math.min(BOOKS.length - 1, book);
              const done = i < book;
              return (
                <div key={b} style={{ position: "absolute", left: 360 + i * 175, top: 180 + (on ? 0 : 20), width: 150, height: 200, borderRadius: 6, background: on ? `rgba(${WARM},0.25)` : "rgba(20,26,36,0.9)", border: `2px solid ${on ? look.key : palette.faint}`, opacity: i <= book ? (done ? 0.45 : 1) : 0.15, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: 30, fontWeight: 900 }}>{b}</div>
                  <div style={{ marginTop: 12, fontFamily: fonts.mono, fontSize: 16, color: palette.dim }}>{done ? "读到 p.1" : "新书"}</div>
                </div>
              );
            })}
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            {HELLO.map((h, i) => {
              const x = 260 + (i % 4) * 330 + (i > 3 ? 160 : 0), y = i > 3 ? 470 : 230;
              const p = ramp(frame, c2 + Math.floor(i / 2) * HALF_BEAT, 6);
              return (
                <div key={h} style={{ position: "absolute", inset: 0, opacity: p }}>
                  <Stander x={x} bottom={y + 200} height={180} lift={1} glow={0.4} />
                  <div style={{ position: "absolute", left: x + 30, top: y - 10, padding: "6px 16px", borderRadius: 16, border: `2px solid rgba(${GLOW},0.6)`, fontSize: 24, fontWeight: 800 }}>{h}</div>
                </div>
              );
            })}
            <div style={{ position: "absolute", left: 1560, top: 360, width: 200, textAlign: "center", opacity: ramp(frame, c2 + 4 * BEAT, 10) }}>
              <Halo x={100} y={120} r={200} intensity={0.4} rgb={WARM} />
              <div style={{ position: "relative", margin: "0 auto", width: 110, height: 220, borderRadius: 50, border: `3px dashed ${look.key}` }} />
              <div style={{ position: "relative", marginTop: 12, fontSize: 34, fontWeight: 900, color: look.key }}>朋友 0</div>
            </div>
          </div>
        )}
        {seg === 3 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", inset: 0, opacity: 0.6 }}>
              <Stander x={900} bottom={760} height={520} lift={1} glow={0.5} />
            </div>
            {/* a pipe straight through */}
            <div style={{ position: "absolute", left: 870, top: 280, width: 60, height: 480, borderRadius: 30, border: `2px dashed rgba(${GLOW},0.45)` }} />
            {FEED.map((f, i) => {
              const t0 = c3 + BEAT + i * HALF_BEAT;
              const t = (frame - t0) / 22;
              if (t < 0 || t > 1) return null;
              const y = 120 + t * 760;
              return <div key={f} style={{ position: "absolute", left: 840, top: y, width: 120, padding: "6px 0", textAlign: "center", borderRadius: 10, background: "rgba(8,16,26,0.95)", border: `2px solid rgba(${GLOW},0.8)`, fontSize: 24, fontWeight: 800, color: `rgb(${GLOW})` }}>{f}</div>;
            })}
            <div style={{ position: "absolute", left: 1180, top: 400, width: 420 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 34, fontWeight: 900 }}>
                <span>营养</span>
                <span style={{ fontFamily: fonts.mono, color: `rgb(${ALERT})` }}>0%</span>
              </div>
              <div style={{ marginTop: 12, height: 18, borderRadius: 9, background: "rgba(255,255,255,0.08)", border: `1px solid ${palette.faint}` }} />
              <div style={{ marginTop: 18, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim }}>摄入 {Math.max(0, Math.min(FEED.length, Math.floor((frame - c3 - BEAT) / HALF_BEAT) + 1))} · 消化 0</div>
            </div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} />
      <Sfx name="shutter" at={4} volume={0.3} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.45} />
      {BOOKS.map((_, i) => (
        <Sfx key={i} name="step" at={c1 + i * BEAT} volume={0.2} />
      ))}
      <Sfx name="whoosh" at={c2 - 3} volume={0.45} />
      <Sfx name="glint" at={c2 + 4 * BEAT} volume={0.35} />
      <Sfx name="whoosh" at={c3 - 3} volume={0.45} />
      {FEED.map((_, i) => (
        <Sfx key={`f${i}`} name="whoosh" at={c3 + BEAT + i * HALF_BEAT} volume={0.15} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
