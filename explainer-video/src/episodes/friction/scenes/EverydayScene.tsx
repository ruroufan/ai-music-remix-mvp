import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const DRAFTS = ["在吗？想问一下那个事", "您好，打扰了，想请教一下…", "不好意思打扰一下，请问…", "嗯…其实也没什么，就是…", "方便的时候看一下就好～"];
const REHEARSE = ["“喂，王经理您好…”", "“如果他说没空…”", "“那我就说…”", "“万一他直接拒绝…”", "“喂，王经理您好…”"];

// 1 · a message typed, deleted, retyped — draft 1, 2, 3, 4, 5 — send never pressed.
// 2 · a call screen, never dialled; the rehearsal scrolls past while the clock
//     runs from 13:00 to 17:30.
// 3 · a scoreboard of imagined rounds, filling with red: 输 ×100.
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const seg = (i: number) => frame >= cues[i] && (i + 1 >= cues.length || frame < cues[i + 1]);
  const segIn = (i: number) => interpolate(frame, [cues[i], cues[i] + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t0 = frame - cues[0], t1 = frame - cues[1], t2 = frame - cues[2];
  const draft = Math.max(0, Math.min(DRAFTS.length - 1, Math.floor(t0 / (1.5 * BEAT))));
  const inDraft = t0 - draft * 1.5 * BEAT;
  const shown = Math.min([...DRAFTS[draft]].length, Math.floor(inDraft / 1.2));
  const mins = 13 * 60 + Math.round(interpolate(t1, [0, 7 * BEAT], [0, 270], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const losses = Math.max(0, Math.min(100, Math.floor(interpolate(t2, [BEAT, 7 * BEAT], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t }))));
  return (
    <ObsFrame duration={duration}>
      {seg(0) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(0) }}>
          <div style={{ position: "absolute", left: 560, top: 230, width: 800, height: 380, borderRadius: 20, background: "#0b0f16", border: `2px solid ${palette.faint}` }}>
            <div style={{ padding: "22px 30px", fontSize: 28, fontWeight: 700, borderBottom: `1px solid ${palette.faint}` }}>李老师</div>
            <div style={{ position: "absolute", left: 30, right: 30, bottom: 30, height: 90, borderRadius: 14, background: "#151b25", border: `1px solid ${palette.accent}`, display: "flex", alignItems: "center", padding: "0 20px", fontSize: 32 }}>
              {[...DRAFTS[draft]].slice(0, shown).join("")}
              <span style={{ width: 3, height: 36, marginLeft: 4, background: palette.accent, opacity: Math.floor(frame / 8) % 2 }} />
            </div>
            <div style={{ position: "absolute", right: 30, top: 18, padding: "8px 22px", borderRadius: 10, background: "#2a3242", color: palette.dim, fontSize: 24 }}>发送</div>
          </div>
          <div style={{ position: "absolute", left: 1400, top: 300, fontFamily: fonts.mono, color: palette.dim, fontSize: 22, letterSpacing: 4 }}>
            草稿
            <div style={{ fontSize: 110, fontWeight: 700, color: palette.alert }}>{draft + 1}</div>
            <div>/ 5 遍</div>
          </div>
        </div>
      )}
      {seg(1) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(1) }}>
          <div style={{ position: "absolute", left: 760, top: 140, width: 400, height: 640, borderRadius: 40, background: "#0b0f16", border: `2px solid ${palette.faint}`, textAlign: "center" }}>
            <div style={{ marginTop: 80, width: 120, height: 120, borderRadius: 60, background: "#2a3242", marginLeft: 140 }} />
            <div style={{ marginTop: 24, fontSize: 40, fontWeight: 800 }}>王经理</div>
            <div style={{ fontFamily: fonts.mono, fontSize: 20, color: palette.dim, marginTop: 8 }}>未拨出</div>
            <div style={{ position: "absolute", left: 140, bottom: 70, width: 120, height: 120, borderRadius: 60, background: "#1f8f5a", opacity: 0.5 }} />
          </div>
          <div style={{ position: "absolute", left: 1220, top: 230, width: 520, height: 400, overflow: "hidden" }}>
            {REHEARSE.map((r, i) => (
              <div key={i} style={{ position: "absolute", top: i * 90 - ((t1 * 1.6) % 450), fontSize: 30, fontWeight: 700, color: "rgba(232,238,242,0.75)" }}>{r}</div>
            ))}
          </div>
          <div style={{ position: "absolute", left: 300, top: 360, fontFamily: fonts.mono, fontSize: 96, fontWeight: 700, color: palette.alert }}>
            {String(Math.floor(mins / 60)).padStart(2, "0")}:{String(mins % 60).padStart(2, "0")}
          </div>
          <div style={{ position: "absolute", left: 300, top: 480, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: palette.dim }}>预演中…</div>
        </div>
      )}
      {seg(2) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(2) }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontFamily: fonts.mono, fontSize: 26, letterSpacing: 6, color: palette.dim }}>脑内模拟 · 还没发生的那件事</div>
          <div style={{ position: "absolute", left: 960 - 330, top: 200, width: 660, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {Array.from({ length: 100 }, (_, i) => (
              <div key={i} style={{ width: 60, height: 50, borderRadius: 4, background: i < losses ? "rgba(255,77,109,0.75)" : "#141a24", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 900, color: "#06080c" }}>{i < losses ? "✕" : ""}</div>
            ))}
          </div>
          <div style={{ position: "absolute", left: 1340, top: 380, fontFamily: fonts.mono, fontSize: 90, fontWeight: 700, color: palette.alert }}>输 ×{losses}</div>
          <div style={{ position: "absolute", left: 1340, top: 490, fontFamily: fonts.mono, fontSize: 24, color: palette.dim }}>实际发生：0</div>
        </div>
      )}
      {DRAFTS.map((_, i) => (
        <Sfx key={i} name="glitch" at={cues[0] + Math.round((i + 1) * 1.5 * BEAT) - 3} volume={0.15} />
      ))}
      {Array.from({ length: 6 }, (_, k) => (
        <Sfx key={`c${k}`} name="shutter" at={cues[1] + k * BEAT} volume={0.12} />
      ))}
      {Array.from({ length: 12 }, (_, k) => (
        <Sfx key={`l${k}`} name="stamp" at={cues[2] + BEAT + k * HALF_BEAT} volume={0.12 + k * 0.015} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
