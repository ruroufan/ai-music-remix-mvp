import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { NightRoom } from "../puppet";
import { clockAt } from "./HookScene";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const FEED = ["#2a3b5a", "#4a2a3a", "#2a4a3a", "#3a3a2a", "#2a2a4a", "#4a3a2a"];

// 1 · home at 22:00 — and the feed scrolls on: "已刷 2:00:00".
// 2 · "next episode in 5…": the alarm is set for 7:00; episode 3 → 4 → 5.
// 3 · in bed doing nothing, the lamp still on; a cursor hovers over 关灯 and won't click.
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const seg = (i: number) => frame >= cues[i] && (i + 1 >= cues.length || frame < cues[i + 1]);
  const segIn = (i: number) => interpolate(frame, [cues[i], cues[i] + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t0 = frame - cues[0], t1 = frame - cues[1], t2 = frame - cues[2];
  const scrolled = Math.round(interpolate(t0, [BEAT, 7 * BEAT], [0, 7200], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const ep = 3 + Math.max(0, Math.floor((t1 - BEAT) / (2 * BEAT)));
  const count = 5 - Math.floor(((t1 % (2 * BEAT)) / (2 * BEAT)) * 5);
  const hover = 1150 + Math.sin(t2 / 9) * 30;
  return (
    <ObsFrame duration={duration}>
      {seg(0) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(0) }}>
          <div style={{ position: "absolute", left: 960 - 220, top: 120, width: 440, height: 700, borderRadius: 40, border: `3px solid ${palette.faint}`, background: "#0a0e15", overflow: "hidden" }}>
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} style={{ position: "absolute", left: 24, width: 392, height: 220, borderRadius: 16, top: ((i * 240 - t0 * 14) % 2880 + 2880) % 2880 - 240, background: FEED[i % FEED.length] }}>
                <div style={{ position: "absolute", left: 18, bottom: 16, width: 200, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.3)" }} />
                <div style={{ position: "absolute", right: 18, bottom: 16, fontSize: 22, color: palette.alert }}>♥</div>
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", left: 260, top: 300, fontFamily: fonts.mono, color: palette.dim, fontSize: 22, letterSpacing: 4 }}>
            到家
            <div style={{ fontSize: 80, color: palette.ink, fontWeight: 700 }}>22:00</div>
          </div>
          <div style={{ position: "absolute", left: 1300, top: 300, fontFamily: fonts.mono, color: palette.dim, fontSize: 22, letterSpacing: 4 }}>
            已刷
            <div style={{ fontSize: 80, color: palette.alert, fontWeight: 700 }}>{clockAt(scrolled / 60)}:{String(scrolled % 60).padStart(2, "0")}</div>
          </div>
        </div>
      )}
      {seg(1) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(1) }}>
          <div style={{ position: "absolute", left: 360, top: 160, width: 1200, height: 600, borderRadius: 12, background: "linear-gradient(135deg, #1a2438, #0b0f16)", border: `2px solid ${palette.faint}` }}>
            <div style={{ position: "absolute", left: 40, top: 30, fontSize: 36, fontWeight: 700 }}>第 {ep} 集 · 已播完</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 220, textAlign: "center", fontSize: 44, fontWeight: 700 }}>下一集 <span style={{ fontFamily: fonts.mono, color: palette.accent, fontSize: 90 }}>{count}</span> 秒后自动播放</div>
            <div style={{ position: "absolute", left: 470, top: 420, padding: "16px 40px", borderRadius: 12, background: palette.accent, color: "#06080c", fontSize: 34, fontWeight: 900 }}>▶ 再看一集</div>
            <div style={{ position: "absolute", right: 40, top: 30, fontFamily: fonts.mono, fontSize: 26, color: palette.alert }}>⏰ 明早 07:00</div>
          </div>
        </div>
      )}
      {seg(2) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(2) }}>
          <NightRoom frame={frame} clock={clockAt(80 + t2 / 8)} lamp={1} glow={0.15} scroll={false} />
          <div style={{ position: "absolute", left: 1100, top: 300, padding: "18px 34px", borderRadius: 14, border: `2px solid ${palette.faint}`, background: "rgba(6,8,12,0.9)", fontSize: 36, fontWeight: 700 }}>关灯？</div>
          <svg width={40} height={50} style={{ position: "absolute", left: hover + 40, top: 350 }}>
            <path d="M2 2 L2 40 L12 30 L20 46 L26 43 L18 28 L32 28 Z" fill="#e8eef2" stroke="#06080c" strokeWidth={2} />
          </svg>
          <div style={{ position: "absolute", left: 1100, top: 420, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: palette.dim }}>什么都没做 · {clockAt(t2 / 6)}</div>
        </div>
      )}
      {Array.from({ length: 6 }, (_, k) => (
        <Sfx key={k} name="shutter" at={cues[0] + (k + 1) * BEAT} volume={0.14} />
      ))}
      {[1, 3, 5, 7].map((b) => (
        <Sfx key={`e${b}`} name="glint" at={cues[1] + b * BEAT} volume={0.25} />
      ))}
      <Sfx name="glitch" at={cues[2] + 3 * BEAT} volume={0.2} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
