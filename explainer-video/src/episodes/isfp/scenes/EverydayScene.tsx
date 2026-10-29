import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { RIFT, ROSE, SKY } from "../crack";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// the chat: theirs on the left, his on the right — his get shorter, the gaps
// longer, and then there are none
const CHAT: { who: "them" | "me"; text: string; gap?: string }[] = [
  { who: "them", text: "周末还去看展吗？" },
  { who: "me", text: "好呀！一起～", gap: "2分钟后" },
  { who: "them", text: "昨天的事，我们聊聊？" },
  { who: "me", text: "嗯", gap: "3小时后" },
  { who: "them", text: "你是不是生气了" },
  { who: "me", text: "。", gap: "2天后" },
  { who: "them", text: "在吗？" },
];

// Three moments, full screen, a whip-pan between each.
// 1 · a chat window: his replies shrink — 好呀！一起～ → 嗯 → 。 — the gaps
//     grow — 2分钟后 · 3小时后 · 2天后 — and the last 在吗？ gets 已读, nothing.
// 2 · an office: without a word he slides an envelope across the desk —
//     辞职信 — and the boss looks up: ？
// 3 · 你到底怎么了？ — 没什么。 — and above his head a thought he keeps shut:
//     a storm of scribbles, dashed, half there.
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : 2;
  const per = (c1 - 2 * BEAT) / CHAT.length;
  const slide = interpolate(frame, [c1 + 2 * BEAT, c1 + 4 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1, c2]} hits={[c1 + 4 * BEAT, c2 + 2 * BEAT, ...keyHits(lines, cues, duration)]}>
        {seg === 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 560, top: 110, width: 800, height: 660, borderRadius: 26, background: "rgba(14,18,24,0.92)", border: "2px solid rgba(232,238,242,0.18)" }} />
            <div style={{ position: "absolute", left: 560, width: 800, top: 130, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: palette.dim }}>对话</div>
            {CHAT.map((m, i) => {
              const p = ramp(frame, Math.round(i * per), 6);
              const me = m.who === "me";
              const y = 190 + i * 78;
              return (
                <React.Fragment key={i}>
                  {m.gap && <div style={{ position: "absolute", left: 560, width: 800, top: y - 26, textAlign: "center", fontFamily: fonts.mono, fontSize: 16, color: `rgba(${RIFT},0.8)`, opacity: p }}>— {m.gap} —</div>}
                  <div style={{ position: "absolute", top: y, ...(me ? { right: 1920 - 1330 } : { left: 590 }), padding: "10px 20px", borderRadius: 18, fontSize: 28, fontWeight: 700, background: me ? `rgba(${ROSE},0.85)` : "rgba(232,238,242,0.12)", color: me ? "#1a1014" : palette.ink, opacity: p, transform: `translateY(${(1 - p) * 14}px)` }}>{m.text}</div>
                </React.Fragment>
              );
            })}
            <div style={{ position: "absolute", left: 590, top: 190 + CHAT.length * 78 - 30, fontFamily: fonts.mono, fontSize: 18, color: palette.dim, opacity: ramp(frame, Math.round(CHAT.length * per), 6) }}>已读</div>
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Stander x={1300} bottom={760} height={360} lift={1} glow={0.4} rgb={SKY} />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <rect x={780} y={620} width={820} height={26} fill="#2a2230" stroke="rgba(232,238,242,0.25)" strokeWidth={2} />
              <rect x={810} y={646} width={20} height={240} fill="#1c1822" />
              <rect x={1550} y={646} width={20} height={240} fill="#1c1822" />
              <rect x={1380} y={560} width={150} height={60} rx={4} fill="#1a1e26" stroke="rgba(232,238,242,0.2)" strokeWidth={2} />
            </svg>
            <Stander x={520} bottom={900} height={380} lift={0.6} glow={0.5} rgb={ROSE} />
            <div style={{ position: "absolute", left: 640 + 420 * slide, top: 560, width: 220, height: 56, borderRadius: 4, background: "#efe8d8", color: "#3a2018", fontSize: 26, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", letterSpacing: 6, boxShadow: "0 8px 20px rgba(0,0,0,0.5)", transform: `rotate(${-4 + 4 * slide}deg)`, opacity: ramp(frame, c1 + BEAT, 6) }}>辞职信</div>
            <div style={{ position: "absolute", left: 1370, top: 330, fontSize: 80, fontWeight: 900, color: `rgb(${SKY})`, opacity: ramp(frame, c1 + 5 * BEAT, 6) }}>？</div>
            <div style={{ position: "absolute", left: 120, top: 150, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 6, color: palette.dim }}>不说 · 只是某天</div>
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Stander x={1340} bottom={900} height={400} lift={1} glow={0.4} rgb={SKY} />
            <div style={{ position: "absolute", left: 1180, top: 330, padding: "12px 24px", borderRadius: 16, border: `2px solid rgb(${SKY})`, fontSize: 36, fontWeight: 900, color: palette.ink, opacity: ramp(frame, c2 + 4, 6) }}>你到底怎么了？</div>
            <Stander x={600} bottom={900} height={400} lift={0.5} glow={0.5} rgb={ROSE} />
            <div style={{ position: "absolute", left: 700, top: 470, padding: "8px 18px", borderRadius: 14, border: `2px solid rgba(${ROSE},0.6)`, fontSize: 28, color: `rgb(${ROSE})`, opacity: ramp(frame, c2 + 2 * BEAT, 6) }}>没什么。</div>
            {/* the thought he keeps shut */}
            <Halo x={560} y={220} r={220} intensity={0.4 * ramp(frame, c2 + 4 * BEAT, 12)} rgb={RIFT} />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 0.75 * ramp(frame, c2 + 4 * BEAT, 12) }}>
              <ellipse cx={560} cy={220} rx={200} ry={110} fill="rgba(20,14,18,0.6)" stroke={`rgba(${ROSE},0.6)`} strokeWidth={3} strokeDasharray="12 10" />
              <circle cx={600} cy={360} r={14} fill="none" stroke={`rgba(${ROSE},0.6)`} strokeWidth={3} strokeDasharray="6 5" />
              <circle cx={612} cy={400} r={8} fill="none" stroke={`rgba(${ROSE},0.6)`} strokeWidth={3} />
              <path d={`M420 ${230 + Math.sin(frame / 4) * 6} q30 -60 60 0 t60 0 t60 0 t60 0`} fill="none" stroke={`rgba(${RIFT},0.8)`} strokeWidth={4} />
              <path d="M520 160 L500 210 L530 210 L505 270" fill="none" stroke={`rgba(${RIFT},0.9)`} strokeWidth={5} />
              <path d="M620 170 q-40 30 0 50 q40 20 0 50" fill="none" stroke={`rgba(${RIFT},0.7)`} strokeWidth={4} />
            </svg>
            <div style={{ position: "absolute", left: 300, top: 90, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: ramp(frame, c2 + 6 * BEAT, 10) }}>其实 · 有很多</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={ROSE} opacity={0.35} />
      {CHAT.map((_, i) => (
        <Sfx key={i} name="shutter" at={Math.round(i * per)} volume={0.15} />
      ))}
      <Sfx name="whoosh" at={c1 - 3} volume={0.5} />
      <Sfx name="whoosh" at={c1 + 2 * BEAT} volume={0.25} />
      <Sfx name="stamp" at={c1 + 4 * BEAT} volume={0.5} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.5} />
      <Sfx name="glitch" at={c2 + 4 * BEAT} volume={0.25} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
