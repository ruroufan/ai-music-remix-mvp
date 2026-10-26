import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Bench, FEEL, Feeling, GREEN, Machine, RED, STEEL } from "../bench";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const TRUST = ["看得见", "摸得着", "能修好"];
const CHOICES = ["一个人骑车", "不回消息", "突然换工作", "推掉聚会"];

// What he trusts, and what he puts aside.
// 0 · three ticks: 看得见 ✓ 摸得着 ✓ 能修好 ✓.
// 1 · a machine on the bench opens; one gear lit red: 原因找到了.
// 2 · the glowing part on the bench. No manual — 说明书 ✕; the screwdriver
//     slips off it — 拆不开; and he slides it away to the far end of the bench,
//     out of the light: 假装它不存在.
// 3 · Hume: 理性 draws the route — 怎么做 — but the arrow has no destination
//     until the glowing part lights one up: 想要什么.
// 4 · from the pushed-aside part, faint threads run out to the choices he
//     makes: 一个人骑车 · 不回消息 · 突然换工作 · 推掉聚会 — 悄悄替你做选择.
export const HumeScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2, c3, c4] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : frame < c3 ? 2 : frame < c4 ? 3 : 4;
  const open = interpolate(frame, [c1 + 4, c1 + 2 * BEAT], [0, 1], clamp);
  const slide = interpolate(frame, [c2 + 7 * BEAT, c2 + 9 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const want = ramp(frame, c3 + 5 * BEAT, 10);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} whips={[c1, c2, c3, c4]} hits={[...TRUST.map((_, i) => BEAT + i * BEAT), c1 + 2 * BEAT, c2 + 7 * BEAT, c3 + 5 * BEAT, ...keyHits(lines, cues, duration)]}>
        {seg === 0 && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 90 }}>
            {TRUST.map((t, i) => (
              <div key={t} style={{ textAlign: "center", opacity: ramp(frame, BEAT + i * BEAT, 6) }}>
                <div style={{ fontSize: 120, color: `rgb(${GREEN})` }}>✓</div>
                <div style={{ fontSize: 50, fontWeight: 900, color: palette.ink }}>{t}</div>
              </div>
            ))}
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Bench x0={300} x1={1620} />
            <Machine x={960} open={open} frame={frame} brokenAt={1} />
            <div style={{ position: "absolute", left: 1100, top: 300, fontSize: 40, fontWeight: 900, color: `rgb(${RED})`, opacity: ramp(frame, c1 + 2 * BEAT, 8) }}>原因：齿轮断了</div>
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Bench x0={300} x1={1620} />
            <Feeling x={900 + 600 * slide} y={640} size={1.6} frame={frame} k={1 - 0.6 * slide} />
            <div style={{ position: "absolute", left: 420, top: 280, padding: "10px 22px", border: "3px solid rgba(232,238,242,0.5)", fontSize: 34, fontWeight: 900, color: palette.dim, opacity: ramp(frame, c2 + BEAT, 6) }}>说明书 <span style={{ color: `rgb(${RED})` }}>✕</span></div>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: ramp(frame, c2 + 3 * BEAT, 6) * (1 - slide) }}>
              <g transform={`translate(${780 + Math.sin((frame - c2) * 0.8) * 20} 560) rotate(-30)`}>
                <rect x={0} y={-6} width={110} height={12} fill={`rgb(${STEEL})`} />
                <rect x={-60} y={-14} width={60} height={28} rx={6} fill="#b4503c" />
              </g>
            </svg>
            <div style={{ position: "absolute", left: 420, top: 360, fontSize: 34, fontWeight: 900, color: palette.dim, opacity: ramp(frame, c2 + 4 * BEAT, 6) }}>拆不开 · 修不好</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 160, textAlign: "center", fontSize: 50, fontWeight: 900, letterSpacing: 10, color: palette.ink, opacity: ramp(frame, c2 + 9 * BEAT, 8) }}>假装它不存在</div>
          </div>
        )}
        {seg === 3 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <path d="M300 700 L700 700 L700 460 L1100 460" fill="none" stroke={`rgb(${STEEL})`} strokeWidth={8} strokeDasharray="1200" strokeDashoffset={1200 * (1 - ramp(frame, c3 + 4, 3 * BEAT))} />
              {[[1400, 260], [1450, 460], [1400, 660]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={40} fill="none" stroke={i === 1 && want > 0 ? `rgb(${FEEL})` : "rgba(232,238,242,0.3)"} strokeWidth={4} strokeDasharray={i === 1 && want > 0.5 ? undefined : "6 6"} />)}
              <line x1={1100} y1={460} x2={1100 + 300 * want} y2={460} stroke={`rgb(${FEEL})`} strokeWidth={8} />
            </svg>
            <div style={{ position: "absolute", left: 330, top: 720, fontSize: 32, fontWeight: 900, color: `rgb(${STEEL})` }}>理性 → 怎么做</div>
            <div style={{ position: "absolute", left: 1220, top: 140, fontSize: 32, fontWeight: 900, color: palette.dim }}>想要什么？</div>
            {want > 0 && <Feeling x={1450} y={460} size={1} frame={frame} k={want} />}
          </div>
        )}
        {seg === 4 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Feeling x={300} y={560} size={1.2} frame={frame} k={0.6} />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              {CHOICES.map((_, i) => {
                const k = ramp(frame, c4 + 4 + i * 10, 12);
                const y = 260 + i * 160;
                return <path key={i} d={`M330 560 Q800 ${y + 60} ${330 + 900 * k} ${y}`} fill="none" stroke={`rgba(${FEEL},0.6)`} strokeWidth={2.5} strokeDasharray="8 6" />;
              })}
            </svg>
            {CHOICES.map((c, i) => <div key={c} style={{ position: "absolute", left: 1260, top: 230 + i * 160, padding: "10px 22px", borderRadius: 12, border: "2px solid rgba(232,238,242,0.5)", fontSize: 32, fontWeight: 900, color: palette.ink, opacity: ramp(frame, c4 + 16 + i * 10, 6) }}>{c}</div>)}
            <div style={{ position: "absolute", left: 160, top: 160, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 6, color: `rgb(${FEEL})` }}>被放在一边的感受</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={FEEL} opacity={0.35} />
      {TRUST.map((_, i) => (
        <Sfx key={i} name="stamp" at={BEAT + i * BEAT} volume={0.3} />
      ))}
      <Sfx name="whoosh" at={c1 - 3} volume={0.45} />
      <Sfx name="glitch" at={c1 + 2 * BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.45} />
      <Sfx name="glitch" at={c2 + 3 * BEAT} volume={0.2} />
      <Sfx name="whoosh" at={c2 + 7 * BEAT} volume={0.35} />
      <Sfx name="whoosh" at={c3 - 3} volume={0.45} />
      <Sfx name="glint" at={c3 + 5 * BEAT} volume={0.45} />
      <Sfx name="whoosh" at={c4 - 3} volume={0.45} />
      {CHOICES.map((_, i) => (
        <Sfx key={`c${i}`} name="shutter" at={c4 + 16 + i * 10} volume={0.15} />
      ))}
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
