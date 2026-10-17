import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const FEED = [
  { who: "小林", what: "我们结婚啦" },
  { who: "老同学", what: "新家钥匙到手" },
  { who: "前同事", what: "升职，感恩" },
  { who: "表哥", what: "提车了" },
];
const LIST = ["存款五十万", "结婚", "买房", "升职主管", "去冰岛看极光", "学会一门乐器", "跑一次全马", "读完一百本书", "创业一次", "生一个孩子"];
const DONE = [4, 7];

// 1 · peers' good news drops in, one per beat — and a heart-rate trace spikes.
// 2 · the candles go out and a gavel comes down: 宣判 — 又老一岁.
// 3 · the list, "30 岁前必须做完的 10 件事", scanned line by line: ✕ ✕ ✕ …
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const seg = (i: number) => frame >= cues[i] && (i + 1 >= cues.length || frame < cues[i + 1]);
  const segIn = (i: number) => interpolate(frame, [cues[i], cues[i] + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t0 = frame - cues[0], t1 = frame - cues[1], t2 = frame - cues[2];
  const posts = Math.max(0, Math.min(FEED.length, Math.floor((t0 - BEAT / 2) / BEAT) + 1));
  const bpm = 70 + posts * 18;
  const blow = t1 >= 2 * BEAT;
  const gavel = interpolate(t1, [3 * BEAT - 5, 3 * BEAT], [-40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scan = Math.max(0, Math.min(LIST.length, Math.floor((t2 - BEAT) / HALF_BEAT) + 1));
  return (
    <ObsFrame duration={duration}>
      {seg(0) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(0) }}>
          {FEED.slice(0, posts).map((p, i) => (
            <div key={p.who} style={{ position: "absolute", left: 300, top: 170 + i * 120, width: 620, height: 100, borderRadius: 16, background: "rgba(16,21,31,0.95)", border: `1px solid ${palette.faint}`, display: "flex", alignItems: "center", gap: 20, padding: "0 24px", boxSizing: "border-box", transform: `translateX(${Math.max(0, 1 - (t0 - BEAT / 2 - i * BEAT) / 6) * -60}px)` }}>
              <div style={{ width: 60, height: 60, borderRadius: 30, background: `hsl(${i * 80} 30% 40%)` }} />
              <div>
                <div style={{ fontFamily: fonts.mono, fontSize: 18, color: palette.dim }}>{p.who} · 刚刚</div>
                <div style={{ fontSize: 32, fontWeight: 800 }}>{p.what}</div>
              </div>
              <div style={{ marginLeft: "auto", color: palette.alert, fontSize: 30 }}>♥ {(i + 2) * 37}</div>
            </div>
          ))}
          <svg width={600} height={240} style={{ position: "absolute", left: 1060, top: 300 }}>
            <polyline
              fill="none"
              stroke={palette.alert}
              strokeWidth={4}
              points={Array.from({ length: 60 }, (_, i) => {
                const x = i * 10;
                const ph = (i + frame * (0.5 + posts * 0.35)) % (24 - posts * 4);
                const y = 120 - (ph < 1 ? 80 + posts * 15 : ph < 2 ? -40 : 0);
                return `${x},${y}`;
              }).join(" ")}
            />
          </svg>
          <div style={{ position: "absolute", left: 1060, top: 560, fontFamily: fonts.mono, fontSize: 40, color: palette.alert }}>♥ {bpm} BPM</div>
        </div>
      )}
      {seg(1) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(1) }}>
          <div style={{ position: "absolute", left: 660, top: 520, width: 400, height: 160, borderRadius: "20px 20px 10px 10px", background: "linear-gradient(#e8d8c4, #c9a986)" }} />
          <div style={{ position: "absolute", left: 640, top: 670, width: 440, height: 20, borderRadius: 10, background: "#2a3242" }} />
          {["2", "6"].map((d, i) => (
            <React.Fragment key={d}>
              <div style={{ position: "absolute", left: 790 + i * 90, top: 400, width: 70, height: 120, borderRadius: 10, background: "#ff9fb0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80, fontWeight: 900, color: "#fff" }}>{d}</div>
              {!blow && <div style={{ position: "absolute", left: 815 + i * 90, top: 360 + Math.sin(frame / 3 + i) * 3, width: 20, height: 34, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: "#ffd27a", boxShadow: "0 0 30px #ffb070" }} />}
              {blow && <div style={{ position: "absolute", left: 818 + i * 90, top: 300 - (t1 - 2 * BEAT) * 3, width: 14, height: 60, borderRadius: 7, background: "rgba(200,208,220,0.25)", filter: "blur(4px)" }} />}
            </React.Fragment>
          ))}
          <div style={{ position: "absolute", left: 1180, top: 330 + gavel, transform: `rotate(${gavel * 0.8}deg)`, transformOrigin: "100% 100%" }}>
            <div style={{ width: 160, height: 70, borderRadius: 12, background: "#5a3a22", border: "2px solid #8a6a46" }} />
            <div style={{ marginLeft: 70, width: 20, height: 140, background: "#5a3a22" }} />
          </div>
          {t1 >= 3 * BEAT && <div style={{ position: "absolute", left: 1160, top: 560, padding: "10px 22px", border: `5px solid ${palette.alert}`, color: palette.alert, fontSize: 48, fontWeight: 900, transform: "rotate(-8deg)" }}>宣判：又老一岁</div>}
        </div>
      )}
      {seg(2) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(2) }}>
          <div style={{ position: "absolute", left: 560, top: 110, width: 800, height: 630, background: "#ece8e0", color: "#1a1714", padding: "26px 50px", boxSizing: "border-box", boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 16 }}>30 岁前必须做完的 10 件事</div>
            {LIST.map((it, i) => {
              const checked = i < scan;
              const ok = DONE.includes(i);
              return (
                <div key={it} style={{ display: "flex", alignItems: "center", gap: 18, height: 50, fontSize: 27, fontWeight: 700, background: i === scan - 1 ? "rgba(255,77,109,0.12)" : "transparent" }}>
                  <span style={{ width: 34, height: 34, border: "3px solid #3a3128", borderRadius: 4, display: "inline-flex", alignItems: "center", justifyContent: "center", color: ok ? "#0f8f84" : "#b2283e", fontSize: 30 }}>{checked ? (ok ? "✓" : "✕") : ""}</span>
                  <span style={{ opacity: checked && !ok ? 0.55 : 1 }}>{it}</span>
                </div>
              );
            })}
          </div>
          <div style={{ position: "absolute", left: 1400, top: 640, fontFamily: fonts.mono, fontSize: 36, color: palette.alert }}>已完成 {DONE.filter((d) => d < scan).length}/10</div>
        </div>
      )}
      {FEED.map((_, i) => (
        <Sfx key={i} name="glint" at={cues[0] + BEAT / 2 + i * BEAT} volume={0.25} />
      ))}
      <Sfx name="whoosh" at={cues[1] + 2 * BEAT} volume={0.3} />
      <Sfx name="stamp" at={cues[1] + 3 * BEAT} volume={0.8} />
      <Sfx name="boom" at={cues[1] + 3 * BEAT} volume={0.4} />
      {LIST.map((_, i) => (
        <Sfx key={`l${i}`} name="shutter" at={cues[2] + BEAT + i * HALF_BEAT} volume={0.16} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
