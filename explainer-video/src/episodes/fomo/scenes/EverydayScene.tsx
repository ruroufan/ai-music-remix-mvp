import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam } from "../../glass/immersive";
import { ALERT, GLOW } from "../screens";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const PINGS = ["你错过了 37 条群消息", "热搜：昨夜发生了什么", "你关注的人刚刚发布了动态", "限时优惠 · 仅剩 2 小时", "他们正在直播"];
const SAVED = ["《30 岁前必须知道的 50 件事》", "《一文读懂全球经济》", "《高效人士的 7 个习惯》", "《收藏 = 学会？》", "《必读：认知升级指南》"];

// Three moments, full screen, a whip-pan between each.
// 1 · dinner: a bowl, chopsticks — and a phone propped against a cup playing
//     an episode; the steam goes, nobody's looked at the food.
// 2 · 07:00, dark: the phone lights up on the pillow and the notifications
//     pour down, one per half beat.
// 3 · a folder, 必读干货: the count runs up to 386 — and every one of them is
//     at 已读 0%.
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : 2;
  const steam = interpolate(frame, [0, c1], [1, 0], clamp);
  const n = Math.max(0, Math.min(PINGS.length, Math.floor((frame - c1 - BEAT) / HALF_BEAT) + 1));
  const saved = Math.round(interpolate(frame, [c2, c2 + 3 * BEAT], [0, 386], { ...clamp, easing: (t) => t * t }));
  const zero = ramp(frame, c2 + 5 * BEAT, 6);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1, c2]} hits={[c2 + 5 * BEAT]}>
        {seg === 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <rect x={300} y={640} width={1320} height={20} rx={4} fill="#2a2118" stroke={`rgba(255,199,122,0.4)`} strokeWidth={1.5} />
              {/* bowl and steam */}
              <path d="M560 560 Q660 660 760 560 Z" fill="#d9d2c4" />
              <ellipse cx={660} cy={560} rx={100} ry={14} fill="#f2ead8" />
              {[0, 1, 2].map((k) => (
                <path key={k} d={`M${630 + k * 30} 540 q${10 * Math.sin(frame / 10 + k)} -24 0 -48 q${-10 * Math.sin(frame / 10 + k)} -24 0 -48`} fill="none" stroke={`rgba(232,238,242,${0.4 * steam})`} strokeWidth={3} strokeLinecap="round" />
              ))}
              <line x1={790} y1={636} x2={900} y2={520} stroke="#c9a46a" strokeWidth={6} strokeLinecap="round" />
              <line x1={804} y1={636} x2={920} y2={526} stroke="#c9a46a" strokeWidth={6} strokeLinecap="round" />
              {/* the cup and the phone leaning on it */}
              <rect x={1300} y={540} width={80} height={100} rx={10} fill="#3a3428" />
            </svg>
            <div style={{ position: "absolute", left: 1060, top: 300, width: 220, height: 380, borderRadius: 24, background: "#0a0d12", border: "4px solid #222a36", transform: "rotate(-8deg)", boxShadow: `0 0 80px rgba(${GLOW},0.35)`, overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 10, right: 10, top: 90, height: 130, background: "linear-gradient(135deg, #1a3a5a, #0c1a2a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, color: "rgba(255,255,255,0.8)" }}>▶</div>
              <div style={{ position: "absolute", left: 10, right: 10, top: 230, height: 4, background: "rgba(255,255,255,0.2)" }}>
                <div style={{ width: `${(frame / c1) * 100}%`, height: "100%", background: `rgb(${ALERT})` }} />
              </div>
              <div style={{ position: "absolute", left: 14, top: 250, fontSize: 20, fontWeight: 800, color: palette.ink }}>第 3 集</div>
              <div style={{ position: "absolute", left: 14, top: 284, fontFamily: fonts.mono, fontSize: 14, color: palette.dim }}>自动播放下一集</div>
            </div>
            <div style={{ position: "absolute", left: 300, top: 220, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 4, color: palette.dim }}>19:12 · 晚饭</div>
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 70%, rgba(120,200,255,0.12), transparent 60%)" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontFamily: fonts.mono, fontSize: 90, color: palette.ink }}>07:00</div>
            <div style={{ position: "absolute", left: 360, top: 690, width: 1200, height: 60, borderRadius: 30, background: "#1a2230" }} />
            {PINGS.slice(0, n).map((p, i) => {
              const pp = ramp(frame, c1 + BEAT + i * HALF_BEAT, 6);
              return (
                <div key={p} style={{ position: "absolute", left: 610, top: 270 + i * 82, width: 700, padding: "14px 22px", borderRadius: 16, background: "rgba(30,38,50,0.95)", border: `1px solid rgba(${GLOW},0.4)`, display: "flex", gap: 16, alignItems: "center", opacity: pp, transform: `translateY(${(1 - pp) * -30}px)` }}>
                  <div style={{ width: 14, height: 14, borderRadius: 7, background: `rgb(${ALERT})` }} />
                  <span style={{ fontSize: 28, fontWeight: 700 }}>{p}</span>
                </div>
              );
            })}
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 300, top: 180, width: 1320 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
                <span style={{ fontSize: 44, fontWeight: 900 }}>必读干货</span>
                <span style={{ fontFamily: fonts.mono, fontSize: 44, color: look.key }}>{saved}</span>
              </div>
              {SAVED.map((t, i) => (
                <div key={t} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, padding: "14px 24px", borderRadius: 12, border: `1px solid ${palette.faint}`, opacity: ramp(frame, c2 + i * 4, 6) }}>
                  <span style={{ fontSize: 28, fontWeight: 700 }}>{t}</span>
                  <span style={{ fontFamily: fonts.mono, fontSize: 24, color: zero > 0.5 ? `rgb(${ALERT})` : palette.dim }}>已读 0%</span>
                </div>
              ))}
            </div>
            {zero > 0 && (
              <div style={{ position: "absolute", left: 1220, top: 160, padding: "12px 34px", border: `7px solid rgb(${ALERT})`, borderRadius: 14, fontSize: 64, fontWeight: 900, color: `rgb(${ALERT})`, transform: `rotate(-8deg) scale(${2 - zero})`, opacity: zero * 0.9 }}>0 / 386</div>
            )}
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb="120, 200, 255" />
      <Sfx name="whoosh" at={c1 - 3} volume={0.5} />
      {PINGS.map((_, i) => (
        <Sfx key={i} name="glint" at={c1 + BEAT + i * HALF_BEAT} volume={0.2} />
      ))}
      <Sfx name="whoosh" at={c2 - 3} volume={0.5} />
      <Sfx name="rise" at={c2} volume={0.25} />
      <Sfx name="stamp" at={c2 + 5 * BEAT} volume={0.7} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
