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
const WEEKEND = ["读书会", "健身", "学英语", "看展", "做饭打卡", "写复盘"];

// Three moments, full screen, a whip-pan between each.
// 1 · 23:40, a laptop: a course, lesson 38 — and a 干货 folder counting up.
// 2 · the weekend, Saturday and Sunday, filled one slot per half beat, each
//     marked 有意义 ✓.
// 3 · a page for today that's blank — 今天：什么都没做 — and a red stamp,
//     pulsing: 罪恶感.
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : 2;
  const saved = Math.round(interpolate(frame, [BEAT, c1 - 10], [96, 128], clamp));
  const filled = Math.max(0, Math.min(WEEKEND.length, Math.floor((frame - c1 - BEAT) / HALF_BEAT) + 1));
  const guilt = ramp(frame, c2 + 3 * BEAT, 6);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1, c2]} hits={[c2 + 3 * BEAT]}>
        {seg === 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 980, top: 300, width: 520, height: 320, borderRadius: 12, background: "#0d1117", border: `2px solid rgba(${palette.accentRgb},0.5)`, boxShadow: "0 0 70px rgba(160,210,255,0.2)" }}>
              <div style={{ position: "absolute", left: 20, top: 16, fontSize: 24, fontWeight: 800 }}>高效人生课 · 第 38 讲</div>
              <div style={{ position: "absolute", left: 20, right: 20, top: 60, bottom: 50, borderRadius: 8, background: "linear-gradient(135deg, #1a2a3a, #0c141e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60, color: "rgba(255,255,255,0.7)" }}>▶</div>
              <div style={{ position: "absolute", left: 20, right: 20, bottom: 24, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.15)" }}>
                <div style={{ width: `${30 + 50 * (frame / c1)}%`, height: "100%", borderRadius: 3, background: palette.accent }} />
              </div>
            </div>
            <div style={{ position: "absolute", left: 1000, top: 640, width: 500, height: 24, background: "#1c2330", borderRadius: 4 }} />
            <Stander x={760} bottom={740} height={300} lift={0.2} glow={0.6} />
            <div style={{ position: "absolute", left: 300, top: 220, fontFamily: fonts.mono, fontSize: 40, color: palette.alert }}>23:40</div>
            <div style={{ position: "absolute", left: 300, top: 300, padding: "10px 20px", borderRadius: 12, border: `2px solid rgba(${palette.halo},0.6)`, fontSize: 30, fontWeight: 800 }}>
              干货收藏 <span style={{ fontFamily: fonts.mono, color: look.key }}>×{saved}</span>
            </div>
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            {["周六", "周日"].map((d, k) => (
              <div key={d} style={{ position: "absolute", left: 420 + k * 560, top: 130, width: 500, height: 620, borderRadius: 16, background: "rgba(14,20,28,0.9)", border: `2px solid ${palette.faint}`, padding: "20px 26px" }}>
                <div style={{ fontSize: 34, fontWeight: 900, marginBottom: 14 }}>{d}</div>
                {WEEKEND.filter((_, i) => i % 2 === k).map((w, j) => {
                  const idx = j * 2 + k;
                  const on = idx < filled;
                  return (
                    <div key={w} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 110, marginBottom: 20, padding: "0 20px", borderRadius: 12, background: on ? "rgba(255,199,122,0.14)" : "transparent", border: on ? "2px solid rgba(255,199,122,0.6)" : `2px dashed ${palette.faint}`, opacity: on ? 1 : 0.4 }}>
                      <span style={{ fontSize: 32, fontWeight: 800 }}>{on ? w : ""}</span>
                      {on && <span style={{ fontSize: 22, fontWeight: 900, color: look.key }}>有意义 ✓</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 660, top: 140, width: 600, height: 600, borderRadius: 12, background: "#e8e2d4", boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }}>
              <div style={{ position: "absolute", left: 40, top: 30, fontSize: 38, fontWeight: 900, color: "#2a2118" }}>今天</div>
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} style={{ position: "absolute", left: 40, right: 40, top: 120 + i * 56, height: 1, background: "rgba(42,33,24,0.2)" }} />
              ))}
              <div style={{ position: "absolute", left: 40, top: 150, fontSize: 30, color: "#5a4a38", opacity: ramp(frame, c2 + BEAT, 8) }}>什么都没做。</div>
              {guilt > 0 && (
                <div style={{ position: "absolute", left: 170, top: 300, padding: "14px 40px", border: `8px solid ${palette.alert}`, borderRadius: 14, fontSize: 80, fontWeight: 900, color: palette.alert, transform: `rotate(-10deg) scale(${(2 - guilt) * (1 + 0.04 * Math.sin(frame / 3))})`, opacity: guilt * 0.9 }}>罪恶感</div>
              )}
            </div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} />
      <Sfx name="shutter" at={BEAT} volume={0.25} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.5} />
      {WEEKEND.map((_, i) => (
        <Sfx key={i} name="stamp" at={c1 + BEAT + i * HALF_BEAT} volume={0.18} />
      ))}
      <Sfx name="whoosh" at={c2 - 3} volume={0.5} />
      <Sfx name="stamp" at={c2 + 3 * BEAT} volume={0.7} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
