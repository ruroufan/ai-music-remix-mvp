import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { FigureShape } from "../../../channels/backlit/figure";
import { PathField } from "../paths";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const SHOPS = ["轻食沙拉", "黄焖鸡米饭", "麻辣烫", "寿司拼盘", "牛肉面", "螺蛳粉", "酸菜鱼", "汉堡套餐", "烤肉饭", "云吞面", "麻辣香锅", "披萨"];
const USUAL = "常吃的那家";
const ROW = 74;

const pad = (n: number) => String(n).padStart(2, "0");

// Three small scenes: endless scrolling that lands where it always does; a
// sleepless night under a ceiling of forking thoughts; a hand that shakes.
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const seg = (i: number) => frame >= cues[i] && (i + 1 >= cues.length || frame < cues[i + 1]);
  const segIn = (i: number) => interpolate(frame, [cues[i], cues[i] + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // 1 · twenty minutes of scrolling, compressed; stops two beats before the end
  const stopAt = cues[1] - 3 * BEAT;
  const scrollT = Math.min(frame, stopAt) - cues[0];
  const scroll = Math.max(0, scrollT) * 9;
  const stopped = frame >= stopAt;
  const minutes = Math.round(interpolate(frame, [cues[0], stopAt], [0, 20], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  // 2 · clock in the small hours, ticking forward every beat
  const tick = Math.max(0, Math.floor((frame - cues[1]) / BEAT));
  const hour = 2 + Math.floor((tick * 17) / 60);
  const min = (13 + tick * 17) % 60;
  // 3 · the hand shakes harder as it gets closer
  const reach = interpolate(frame, [cues[2], duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shake = (2 + reach * 9) * (random(`sh-${frame}`) - 0.5);

  const list = [...SHOPS, ...SHOPS, ...SHOPS];
  const usualIndex = Math.floor(list.length / 2);
  list.splice(usualIndex, 0, USUAL);
  const finalOffset = usualIndex * ROW - 200;

  return (
    <ObsFrame duration={duration}>
      {seg(0) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(0) }}>
          <div style={{ position: "absolute", left: 960 - 230, top: 110, width: 460, height: 680, borderRadius: 40, border: `2px solid ${palette.faint}`, background: "#0a0e15", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 70, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 30px", fontFamily: fonts.mono, fontSize: 18, color: palette.dim, background: "#0a0e15", zIndex: 2 }}>
              <span>外卖 · 附近</span>
              <span style={{ color: minutes >= 15 ? palette.alert : palette.dim }}>{pad(minutes)}:00</span>
            </div>
            <div style={{ position: "absolute", left: 24, right: 24, top: 80, transform: `translateY(${-(stopped ? finalOffset : scroll % (SHOPS.length * ROW))}px)` }}>
              {list.map((name, i) => {
                const isUsual = name === USUAL && i === usualIndex && stopped;
                return (
                  <div key={i} style={{ height: ROW - 12, marginBottom: 12, borderRadius: 12, display: "flex", alignItems: "center", gap: 16, padding: "0 18px", background: isUsual ? `rgba(${palette.accentRgb},0.18)` : "#141a24", border: isUsual ? `2px solid ${palette.accent}` : "none", fontSize: 26 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: isUsual ? palette.accent : "#232b38" }} />
                    {name}
                    {isUsual && <span style={{ marginLeft: "auto", color: palette.accent }}>✓ 又是它</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {seg(1) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(1) }}>
          {/* thoughts forking on the ceiling */}
          <PathField cx={960} cy={160} scale={0.55} draw={interpolate(frame, [cues[1], cues[2]], [0.15, 1])} opacity={0.75} rotate={frame * 0.3} />
          <div style={{ position: "absolute", left: 360, top: 640, width: 1200, height: 60, borderRadius: 14, background: "#141a24", border: `1px solid ${palette.faint}` }} />
          <svg width={110} height={240} viewBox="0 0 120 260" style={{ position: "absolute", left: 900, top: 520, transform: "rotate(-90deg)", transformOrigin: "55px 120px" }}>
            <FigureShape pose="plain" />
          </svg>
          <Halo x={960} y={660} r={260} intensity={0.35} />
          <div style={{ position: "absolute", right: 260, top: 300, fontFamily: fonts.mono, fontSize: 64, color: palette.alert, letterSpacing: 4, opacity: 0.85 }}>
            {pad(hour)}:{pad(min)}
          </div>
        </div>
      )}

      {seg(2) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(2) }}>
          <div style={{ position: "absolute", left: 1120, top: 640, width: 520, height: 14, background: "#2a2f3a" }} />
          <div style={{ position: "absolute", left: 200 + reach * 520 + shake, top: 440 + shake * 0.6, transform: `rotate(${-6 + shake * 0.4}deg)` }}>
            {/* arm and hand */}
            <div style={{ position: "absolute", left: -400, top: 40, width: 440, height: 64, borderRadius: 32, background: "#05070a", border: `2px solid rgba(${palette.halo},0.6)` }} />
            {/* the envelope */}
            <div style={{ position: "absolute", left: 20, top: 0, width: 240, height: 150, background: "linear-gradient(#e9e6df, #cfcac0)", color: "#1a1714", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 54, fontWeight: 900, letterSpacing: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.6)" }}>辞呈</div>
          </div>
        </div>
      )}

      <Sfx name="whoosh" at={cues[0]} volume={0.2} />
      <Sfx name="glint" at={stopAt} volume={0.45} />
      {[0, 2, 4, 6].map((k) => (
        <Sfx key={k} name="step" at={cues[1] + k * BEAT} volume={0.18} />
      ))}
      <Sfx name="rise" at={cues[2] + 2 * BEAT} volume={0.3} />

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
