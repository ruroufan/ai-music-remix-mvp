import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const PLAN = ["早餐", "景点 A", "打卡", "午餐", "景点 B", "购物", "景点 C", "晚餐", "夜景", "复盘"];
const MSGS = ["到了吗？", "在干嘛？", "怎么不回？", "和谁在一起？", "回我！"];

// Three moments, full screen, a whip-pan between each.
// 1 · the front door: his hand rattles the handle once per half beat — 锁了吗？
//     — 检查 ×1, ×2, ×3…
// 2 · a holiday, planned to the hour: 07:00 → 23:00 filling up one slot per
//     half beat, not a gap left.
// 3 · ten minutes late with a reply: his messages stack up, one per half beat,
//     the clock counting.
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : 2;
  const checks = Math.max(0, Math.min(8, Math.floor((frame - BEAT) / HALF_BEAT) + 1));
  const rattle = frame > BEAT && frame < c1 - 10 ? Math.sin(frame * 3) * 8 : 0;
  const slots = Math.max(0, Math.min(PLAN.length, Math.floor((frame - c1 - BEAT) / HALF_BEAT) + 1));
  const msgs = Math.max(0, Math.min(MSGS.length, Math.floor((frame - c2 - BEAT) / HALF_BEAT) + 1));
  const late = Math.round(interpolate(frame, [c2, duration], [600, 600 + 260], clamp));
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1, c2]} hits={[c2 + (MSGS.length + 1) * HALF_BEAT]}>
        {seg === 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 780, top: 150, width: 360, height: 610, background: "linear-gradient(90deg, #3a2a1c, #2a1e14)", border: `2px solid rgba(${palette.halo},0.5)`, borderRadius: 6 }} />
            <div style={{ position: "absolute", left: 1080, top: 430, width: 40, height: 14, borderRadius: 7, background: "#c9b48a", transform: `rotate(${rattle}deg)` }} />
            <div style={{ position: "absolute", left: 1086, top: 480, width: 22, height: 30, borderRadius: 4, background: "#8a7a5a" }} />
            <Stander x={1320} bottom={760} height={320} lift={0.6} glow={0.8} />
            <div style={{ position: "absolute", left: 1112, top: 420, width: 30, height: 30, borderRadius: 15, background: "#030405", border: `1.5px solid rgba(${palette.halo},0.8)`, transform: `translate(${rattle}px, ${rattle * 0.3}px)` }} />
            <div style={{ position: "absolute", left: 1220, top: 230, padding: "10px 22px", borderRadius: 22, background: "rgba(232,238,242,0.1)", border: "2px dashed rgba(232,238,242,0.5)", fontSize: 32, fontWeight: 800, opacity: ramp(frame, BEAT, 6) }}>锁了吗？</div>
            <div style={{ position: "absolute", left: 340, top: 360, fontFamily: fonts.mono, fontSize: 84, fontWeight: 700, color: look.key, textShadow: `0 0 20px ${look.keyGlow}`, opacity: checks > 0 ? 1 : 0, transform: `scale(${1 + 0.12 * Math.exp(-((frame - BEAT) % HALF_BEAT) / 3)})` }}>×{checks}</div>
            <div style={{ position: "absolute", left: 340, top: 320, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim }}>检查 · CHECK</div>
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 560, top: 110, width: 800, height: 660, borderRadius: 16, background: "rgba(14,20,28,0.9)", border: `2px solid ${palette.faint}`, padding: "20px 30px" }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 20, letterSpacing: 5, color: palette.dim, marginBottom: 8 }}>DAY 1 · 行程</div>
              {PLAN.map((p, i) => {
                const on = i < slots;
                return (
                  <div key={p} style={{ display: "flex", alignItems: "center", gap: 18, height: 57, borderBottom: `1px solid ${palette.faint}` }}>
                    <span style={{ fontFamily: fonts.mono, fontSize: 22, color: palette.dim, width: 90 }}>{String(7 + Math.round(i * 1.6)).padStart(2, "0")}:{i % 2 ? "30" : "00"}</span>
                    <span style={{ flex: 1, height: 40, borderRadius: 8, background: on ? `rgba(255,77,109,${0.25 + 0.05 * (i % 3)})` : "transparent", border: on ? "1px solid rgba(255,77,109,0.6)" : undefined, display: "flex", alignItems: "center", paddingLeft: 16, fontSize: 26, fontWeight: 800, color: palette.ink, opacity: on ? 1 : 0, transform: `scaleX(${on ? 1 : 0.6})`, transformOrigin: "0 50%" }}>{p}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ position: "absolute", left: 1400, top: 640, fontFamily: fonts.mono, fontSize: 24, color: palette.alert, opacity: slots >= PLAN.length ? 1 : 0 }}>空档：0</div>
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 960 - 180, top: 120, width: 360, height: 640, borderRadius: 40, background: "#0d1117", border: `2px solid rgba(${palette.accentRgb},0.5)`, overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 70, background: "#161c24", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 12, fontSize: 22, fontWeight: 700 }}>TA</div>
              {MSGS.slice(0, msgs).map((m, i) => (
                <div key={m} style={{ position: "absolute", right: 18, top: 100 + i * 70, padding: "10px 18px", borderRadius: 18, background: i === MSGS.length - 1 ? palette.alert : "#3fbf6a", color: i === MSGS.length - 1 ? "#fff" : "#06120a", fontSize: 26, fontWeight: 700 }}>{m}</div>
              ))}
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 30, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, color: palette.alert }}>未回复 · {Math.floor(late / 60)}:{String(late % 60).padStart(2, "0")}</div>
            </div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} />
      {Array.from({ length: 8 }, (_, i) => (
        <Sfx key={i} name="shutter" at={BEAT + i * HALF_BEAT} volume={0.2} />
      ))}
      <Sfx name="whoosh" at={c1 - 3} volume={0.5} />
      {PLAN.map((_, i) => (
        <Sfx key={i} name="step" at={c1 + BEAT + i * HALF_BEAT} volume={0.14} />
      ))}
      <Sfx name="whoosh" at={c2 - 3} volume={0.5} />
      {MSGS.map((_, i) => (
        <Sfx key={i} name="glint" at={c2 + BEAT + i * HALF_BEAT} volume={0.2} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
