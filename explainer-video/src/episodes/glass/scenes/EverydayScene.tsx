import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../immersive";
import { GlassHeart, STING } from "../parts";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const SPIRAL = ["是说我丑？", "是说我很累？", "是不是对我有意见？", "我昨天得罪他了？", "他在暗示什么？", "是不是大家都这么觉得？"];
const WORRY = ["我说错话了？", "他生气了？", "是不是我太烦了", "我哪里做错了", "要不要道歉…"];

// Three moments, full screen, with a whip-pan between each.
// 1 · a colleague says it — 你今天气色不好 — and inside his head it spirals:
//     one reading after another, one per half beat, while the clock runs
//     14:00 → 18:00.
// 2 · a chat: 在吗？ sent, read, no reply; the typing dots come and go; the
//     worries pile up round the phone.
// 3 · a hundred five-star reviews in a wall — and one red one-star that grows
//     and grows until it covers all of them.
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : 2;
  // 1
  const said = ramp(frame, 4, 8);
  const spiral = Math.max(0, Math.min(SPIRAL.length, Math.floor((frame - 2 * BEAT) / HALF_BEAT) + 1));
  const hour = interpolate(frame, [2 * BEAT, c1 - 4], [14, 18], clamp);
  // 2
  const t2 = frame - c1;
  const typing = t2 > BEAT && Math.floor(t2 / 12) % 3 === 1;
  const worries = Math.max(0, Math.min(WORRY.length, Math.floor((t2 - 2 * BEAT) / HALF_BEAT) + 1));
  const mins = Math.max(0, Math.round(interpolate(t2, [0, c2 - c1], [1, 163], clamp)));
  // 3
  const t3 = frame - c2;
  const grow = interpolate(t3, [2 * BEAT, 6 * BEAT], [1, 9], { ...clamp, easing: (t) => t * t * t });
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1, c2]} hits={[c2 + 6 * BEAT]}>
        {seg === 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Stander x={460} bottom={720} height={300} lift={1.3} glow={0.5} rgb={palette.accentRgb} />
            <div style={{ position: "absolute", left: 300, top: 210, opacity: said, transform: `scale(${0.8 + 0.2 * said})`, padding: "12px 24px", borderRadius: 24, background: "rgba(232,238,242,0.92)", color: "#14181e", fontSize: 34, fontWeight: 800 }}>你今天气色不好</div>
            <Stander x={1200} bottom={720} height={300} lift={0.3} glow={0.8} />
            <GlassHeart x={1200} y={720 - 145 * (300 / 260)} size={62} crack={spiral > 2 ? 0.4 : 0} pain={spiral > 2 ? 0.5 : 0} />
            {SPIRAL.slice(0, spiral).map((s, i) => {
              const a = -Math.PI / 2 + i * 1.05;
              const r = 150 + i * 34;
              const p = ramp(frame, 2 * BEAT + i * HALF_BEAT, 5);
              return (
                <div key={s} style={{ position: "absolute", left: 1260 + Math.cos(a) * r * 1.25, top: 430 + Math.sin(a) * r * 0.7, transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * p})`, opacity: p * (i < spiral - 3 ? 0.5 : 1), padding: "8px 18px", borderRadius: 20, background: "rgba(232,238,242,0.08)", border: "2px dashed rgba(232,238,242,0.45)", fontSize: 26, fontWeight: 700, color: palette.ink, whiteSpace: "nowrap" }}>
                  {s}
                </div>
              );
            })}
            <div style={{ position: "absolute", right: 150, top: 120, fontFamily: fonts.mono, fontSize: 44, color: look.key, textShadow: `0 0 14px ${look.keyGlow}` }}>
              {String(Math.floor(hour)).padStart(2, "0")}:{String(Math.floor((hour % 1) * 60)).padStart(2, "0")}
            </div>
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 960 - 170, top: 130, width: 340, height: 620, borderRadius: 40, background: "#0d1117", border: `2px solid rgba(${palette.accentRgb},0.5)`, overflow: "hidden", boxShadow: "0 0 60px rgba(160,210,255,0.15)" }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 70, background: "#161c24", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 12, fontSize: 22, fontWeight: 700, color: palette.ink }}>老朋友</div>
              <div style={{ position: "absolute", right: 18, top: 110, padding: "10px 18px", borderRadius: 18, background: "#3fbf6a", color: "#06120a", fontSize: 26, fontWeight: 700 }}>在吗？</div>
              <div style={{ position: "absolute", right: 22, top: 162, fontFamily: fonts.mono, fontSize: 14, color: palette.dim }}>已读 · 14:02</div>
              {typing && <div style={{ position: "absolute", left: 18, top: 210, padding: "10px 18px", borderRadius: 18, background: "#2a313c", fontSize: 26, color: palette.dim, letterSpacing: 4 }}>• • •</div>}
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 30, textAlign: "center", fontFamily: fonts.mono, fontSize: 20, color: STING }}>未回复 · {Math.floor(mins / 60)}h {String(mins % 60).padStart(2, "0")}m</div>
            </div>
            {WORRY.slice(0, worries).map((w, i) => {
              const side = i % 2 ? 1 : -1;
              const p = ramp(frame, c1 + 2 * BEAT + i * HALF_BEAT, 5);
              return (
                <div key={w} style={{ position: "absolute", left: 960 + side * (330 + random(`w-${i}`) * 120), top: 200 + i * 105, transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * p})`, opacity: p, padding: "10px 20px", borderRadius: 20, background: "rgba(255,90,114,0.12)", border: `2px dashed rgba(255,90,114,0.6)`, fontSize: 28, fontWeight: 800, color: palette.ink, whiteSpace: "nowrap" }}>
                  {w}
                </div>
              );
            })}
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            {Array.from({ length: 100 }, (_, i) => {
              const c = i % 10, r = Math.floor(i / 10);
              const p = ramp(frame, c2 + (i % 17) * 0.6, 6);
              return (
                <div key={i} style={{ position: "absolute", left: 360 + c * 122, top: 120 + r * 62, width: 112, height: 52, borderRadius: 8, background: "rgba(63,224,150,0.12)", border: "1px solid rgba(63,224,150,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#5fe0a0", opacity: p }}>
                  ★★★★★
                </div>
              );
            })}
            <div style={{ position: "absolute", left: 360 + 6 * 122 + 56, top: 120 + 4 * 62 + 26, transform: `translate(-50%, -50%) scale(${grow})`, width: 112, height: 52, borderRadius: 8, background: "#3a0c16", border: `2px solid ${STING}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: STING, boxShadow: `0 0 ${10 * grow}px rgba(255,90,114,0.5)`, opacity: ramp(frame, c2 + BEAT, 4) }}>
              ★☆☆☆☆
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 5, color: palette.dim, opacity: 1 - ramp(frame, c2 + 4 * BEAT, 8) }}>好评 ×100 · 差评 ×1</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} />
      <Sfx name="glint" at={4} volume={0.35} />
      {SPIRAL.map((_, i) => (
        <Sfx key={i} name="shutter" at={2 * BEAT + i * HALF_BEAT} volume={0.14} />
      ))}
      <Sfx name="whoosh" at={c1 - 3} volume={0.5} />
      {WORRY.map((_, i) => (
        <Sfx key={i} name="glitch" at={c1 + 2 * BEAT + i * HALF_BEAT} volume={0.12} />
      ))}
      <Sfx name="whoosh" at={c2 - 3} volume={0.5} />
      <Sfx name="stamp" at={c2 + BEAT} volume={0.5} />
      <Sfx name="rise" at={c2 + 2 * BEAT} volume={0.35} />
      <Sfx name="boom" at={c2 + 6 * BEAT} volume={0.55} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
