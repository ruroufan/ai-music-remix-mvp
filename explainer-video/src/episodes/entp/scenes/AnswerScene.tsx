import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
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

// 0 · the scoreboard: 争论 WIN, 朋友 LOSE — the same match, two results.
// 1 · the answer, split down the middle. Left, what the other one wanted:
//     two people, two cups, words going back and forth — 交谈. Right, what
//     they got: a bell, a scoreboard, 1 : 0 — 比赛. Between them, ≠.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const board = ramp(frame, 4, 8);
  const split = ramp(frame, c1, 10);
  const match = ramp(frame, c1 + 3 * BEAT, 6);
  const talk = (i: number) => ramp(frame, c1 + BEAT + i * BEAT, 6);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} whips={[c1]} hits={[c1 + 3 * BEAT, ...keyHits(lines, cues, duration)]}>
        {frame < c1 ? (
          <div style={{ position: "absolute", left: 560, top: 230, width: 800, opacity: board, fontFamily: "'Bebas Neue', sans-serif" }}>
            {[["争论", "WIN", GOLD], ["朋友", "LOSE", RED]].map(([l, r, c], i) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "26px 40px", marginBottom: 24, background: "rgba(16,18,24,0.92)", border: `2px solid rgba(${c},0.6)`, opacity: ramp(frame, 4 + i * 2 * BEAT, 8) }}>
                <span style={{ fontFamily: fonts.sans, fontSize: 56, fontWeight: 900, color: palette.ink }}>{l}</span>
                <span style={{ fontSize: 110, letterSpacing: 8, color: `rgb(${c})`, textShadow: `0 0 24px rgba(${c},0.7)` }}>{r}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ position: "absolute", inset: 0, opacity: split }}>
            {/* left: a conversation */}
            <div style={{ position: "absolute", left: 120, top: 150, fontFamily: fonts.mono, fontSize: 24, letterSpacing: 6, color: palette.dim }}>对方想要的</div>
            <div style={{ position: "absolute", left: 120, top: 190, fontSize: 64, fontWeight: 900, color: `rgb(${COLD})` }}>交谈</div>
            <Halo x={480} y={600} r={260} intensity={0.35} rgb={COLD} />
            <Stander x={320} bottom={820} height={230} lift={1} glow={0.6} rgb={COLD} />
            <Stander x={640} bottom={820} height={230} lift={1} glow={0.6} rgb={COLD} />
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ position: "absolute", left: i % 2 ? 470 : 360, top: 380 + i * 64, padding: "8px 18px", borderRadius: 14, border: `2px solid rgba(${COLD},0.6)`, fontSize: 24, color: palette.ink, opacity: talk(i) }}>{["今天…", "嗯，然后呢？", "哈哈 是啊"][i]}</div>
            ))}
            {/* the divide */}
            <div style={{ position: "absolute", left: 958, top: 120, width: 4, height: 760, background: `linear-gradient(transparent, rgba(${RED},0.8), transparent)` }} />
            <div style={{ position: "absolute", left: 900, width: 120, top: 440, textAlign: "center", fontSize: 120, fontWeight: 900, color: `rgb(${RED})`, textShadow: `0 0 30px rgba(${RED},0.8)`, opacity: match, transform: `scale(${1.5 - 0.5 * match})` }}>≠</div>
            {/* right: a match */}
            <div style={{ position: "absolute", right: 120, top: 150, textAlign: "right", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 6, color: palette.dim }}>你给的</div>
            <div style={{ position: "absolute", right: 120, top: 190, fontSize: 64, fontWeight: 900, color: `rgb(${RED})`, opacity: match }}>比赛</div>
            <div style={{ position: "absolute", left: 1180, top: 360, width: 520, padding: "24px 0", background: "rgba(16,18,24,0.94)", border: `3px solid rgb(${RED})`, textAlign: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: 150, letterSpacing: 16, color: palette.ink, opacity: match, transform: `scale(${1.2 - 0.2 * match})` }}>
              1 <span style={{ color: `rgb(${RED})` }}>:</span> 0
            </div>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: match }}>
              <path d="M1400 700 Q1400 620 1440 620 Q1480 620 1480 700 Z" fill={`rgba(${GOLD},0.85)`} />
              <rect x={1390} y={700} width={100} height={10} fill={`rgb(${GOLD})`} />
              <line x1={1440} y1={600} x2={1440} y2={620} stroke={`rgb(${GOLD})`} strokeWidth={4} />
            </svg>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} opacity={0.45} />
      <Sfx name="stamp" at={4} volume={0.35} />
      <Sfx name="stamp" at={4 + 2 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.45} />
      <Sfx name="glint" at={c1 + 3 * BEAT} volume={0.5} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
