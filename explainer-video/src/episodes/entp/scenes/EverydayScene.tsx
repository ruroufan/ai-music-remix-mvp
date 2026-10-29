import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { COLD, GOLD, RED } from "../ring";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const REPLIES = ["相关 ≠ 因果", "样本量太小", "前提不成立"];

// Three moments, full screen, a whip-pan between each.
// 1 · a friend's message — 今天好累，可能是下雨吧 — and his three replies
//     slam in red, one per beat: 相关 ≠ 因果 · 样本量太小 · 前提不成立.
// 2 · two podiums, 正方 and 反方. The friend steps onto his side — 我同意你！ —
//     and he jumps straight across to the other one: 那我反过来说….
// 3 · the trophy, 赢 — and its inside crumbles away until it's just an
//     outline: 心里 · 空.
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : 2;
  const jump = interpolate(frame, [c1 + 3 * BEAT, c1 + 4 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const hollow = interpolate(frame, [c2 + BEAT, c2 + 5 * BEAT], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1, c2]} hits={[...REPLIES.map((_, i) => 2 * BEAT + i * BEAT), c1 + 4 * BEAT, ...keyHits(lines, cues, duration)]}>
        {seg === 0 && (
          <div style={{ position: "absolute", left: 560, top: 150, width: 800, height: 560, borderRadius: 24, background: "rgba(14,18,24,0.92)", border: `2px solid ${palette.faint}`, padding: "34px 40px" }}>
            <div style={{ display: "flex", opacity: ramp(frame, 4, 6) }}>
              <div style={{ padding: "14px 22px", borderRadius: 18, background: "rgba(255,255,255,0.1)", fontSize: 30 }}>今天好累，可能是下雨吧～</div>
            </div>
            {REPLIES.map((r, i) => {
              const p = ramp(frame, 2 * BEAT + i * BEAT, 5);
              return (
                <div key={r} style={{ display: "flex", justifyContent: "flex-end", marginTop: 26, opacity: p, transform: `scale(${1.3 - 0.3 * p})` }}>
                  <div style={{ padding: "14px 22px", borderRadius: 18, background: `rgba(${RED},0.18)`, border: `2px solid rgb(${RED})`, fontSize: 32, fontWeight: 900, color: palette.ink }}>{r}</div>
                </div>
              );
            })}
            <div style={{ display: "flex", marginTop: 26, opacity: ramp(frame, 6 * BEAT, 8) }}>
              <div style={{ padding: "14px 22px", borderRadius: 18, background: "rgba(255,255,255,0.06)", fontSize: 26, color: palette.dim }}>……算了</div>
            </div>
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            {[["正方", 640], ["反方", 1280]].map(([l, x]) => (
              <div key={l as string} style={{ position: "absolute", left: (x as number) - 150, top: 620, width: 300, height: 150, borderRadius: 8, background: "#1c1a20", border: `2px solid rgba(${GOLD},0.35)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, fontWeight: 900, color: palette.dim }}>{l as string}</div>
            ))}
            <Stander x={560} bottom={620} height={240} lift={1} glow={0.6} rgb={COLD} />
            <Stander x={720 + (1360 - 720) * jump} bottom={620 - Math.sin(jump * Math.PI) * 160} height={250} lift={1.5} glow={0.9} rgb={GOLD} />
            <div style={{ position: "absolute", left: 380, top: 300, padding: "10px 20px", borderRadius: 16, border: `2px solid rgba(${COLD},0.6)`, fontSize: 30, fontWeight: 800, opacity: ramp(frame, c1 + BEAT, 6) }}>我同意你！</div>
            <div style={{ position: "absolute", left: 1380, top: 290, padding: "10px 20px", borderRadius: 16, border: `2px solid rgb(${RED})`, fontSize: 30, fontWeight: 900, color: `rgb(${RED})`, opacity: ramp(frame, c1 + 4 * BEAT, 6) }}>那我反过来说……</div>
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <path id="cup" d="M780 220 L1140 220 Q1140 460 960 500 Q780 460 780 220 Z" fill={`rgba(${GOLD},${0.85 * (1 - hollow)})`} stroke={`rgb(${GOLD})`} strokeWidth={5} />
              <path d="M780 260 Q690 260 700 330 Q712 400 800 400 M1140 260 Q1230 260 1220 330 Q1208 400 1120 400" fill="none" stroke={`rgb(${GOLD})`} strokeWidth={5} />
              <rect x={930} y={500} width={60} height={110} fill={`rgba(${GOLD},0.7)`} />
              <rect x={840} y={610} width={240} height={50} rx={6} fill={`rgba(${GOLD},0.7)`} />
            </svg>
            {/* the inside crumbling */}
            {Array.from({ length: 40 }, (_, i) => {
              const t = Math.max(0, Math.min(1, hollow * 1.4 - random(`h-${i}`) * 0.4));
              if (t <= 0 || t >= 1) return null;
              const x = 800 + random(`hx-${i}`) * 320, y = 240 + random(`hy-${i}`) * 220;
              return <div key={i} style={{ position: "absolute", left: x, top: y + t * 400, width: 8, height: 8, background: `rgba(${GOLD},${1 - t})` }} />;
            })}
            <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontSize: 110, fontWeight: 900, color: hollow > 0.5 ? `rgba(${GOLD},0.9)` : "#1a1208", opacity: 1 - 0.5 * hollow }}>赢</div>
            <div style={{ position: "absolute", left: 1260, top: 380, fontFamily: fonts.mono, fontSize: 28, letterSpacing: 6, color: palette.dim, opacity: hollow }}>
              心里 · <span style={{ color: `rgb(${RED})` }}>空</span>
            </div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} opacity={0.5} />
      {REPLIES.map((_, i) => (
        <Sfx key={i} name="stamp" at={2 * BEAT + i * BEAT} volume={0.4} />
      ))}
      <Sfx name="whoosh" at={c1 - 3} volume={0.5} />
      <Sfx name="whoosh" at={c1 + 3 * BEAT} volume={0.4} />
      <Sfx name="stamp" at={c1 + 4 * BEAT} volume={0.45} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.5} />
      <Sfx name="shatter" at={c2 + BEAT} volume={0.25} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
