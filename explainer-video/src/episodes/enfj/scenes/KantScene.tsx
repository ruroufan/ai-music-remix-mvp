import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { COOL, Giver, Kettle, Row, SEATS, WARM } from "../kettle";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const RED = "255, 110, 110";
const BIRTHDAYS = [["小林", "3/12"], ["阿杰", "5/02"], ["妈妈", "6/18"], ["朵朵", "8/09"], ["老周", "9/27"], ["小雨", "11/03"], ["阿姨", "12/21"]];
const STEPS = ["倒水", "陪聊", "暖场", "收拾", "安慰"];

// Kant, and where ENFJ put himself.
// 0 · the row, and over every head a warm tag: 目的 · 目的 · 目的 … — and over
//     his, stamped in grey: 手段.
// 1 · what that makes him: a kettle — 照顾别人的工具 — and a checklist that
//     gets everyone better: 让大家都好起来的方法.
// 2 · a wall of birthday cards, every date circled — and one card, his own,
//     blank: 我 · ？/？ — 忘了自己也是一个人.
export const KantScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : 2;
  const means = ramp(frame, 5 * BEAT, 5);
  const blank = ramp(frame, c2 + 5 * BEAT, 8);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} whips={[c1, c2]} hits={[5 * BEAT, c2 + 5 * BEAT, ...keyHits(lines, cues, duration)]}>
        {seg === 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Row fills={() => 1} frame={frame} glow={() => 0.7} />
            {SEATS.map((x, i) => (
              <div key={x} style={{ position: "absolute", left: x - 60, width: 120, top: 470, textAlign: "center", padding: "6px 0", borderRadius: 8, border: `2px solid rgb(${WARM})`, background: `rgba(${WARM},0.15)`, fontSize: 28, fontWeight: 900, color: `rgb(${WARM})`, opacity: ramp(frame, 4 + i * 6, 6) }}>目的</div>
            ))}
            <Giver x={1640} kettle={false} glow={0.3} />
            <div style={{ position: "absolute", left: 1580, width: 120, top: 430, textAlign: "center", padding: "6px 0", borderRadius: 8, border: `3px solid rgb(${RED})`, fontSize: 30, fontWeight: 900, color: `rgb(${RED})`, opacity: means, transform: `rotate(-8deg) scale(${1.6 - 0.6 * means})` }}>手段</div>
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Halo x={620} y={520} r={300} intensity={0.4} rgb={WARM} />
            <Kettle x={520} y={520} size={3.2} tilt={Math.sin((frame - c1) / 10) * 6} />
            <div style={{ position: "absolute", left: 360, width: 520, top: 780, textAlign: "center", fontSize: 40, fontWeight: 900, color: palette.ink, opacity: ramp(frame, c1 + 4, 8) }}>照顾别人的<span style={{ color: `rgb(${RED})` }}>工具</span></div>
            <div style={{ position: "absolute", left: 1120, top: 300, width: 460, padding: "24px 30px", borderRadius: 14, border: `2px solid rgba(${COOL},0.5)`, background: "rgba(14,16,20,0.9)", opacity: ramp(frame, c1 + 2 * BEAT, 8) }}>
              {STEPS.map((s, i) => (
                <div key={s} style={{ fontSize: 30, color: palette.ink, lineHeight: 1.7, opacity: ramp(frame, c1 + 2 * BEAT + i * 5, 5) }}>
                  <span style={{ color: `rgb(${WARM})` }}>✓</span> {s}
                </div>
              ))}
            </div>
            <div style={{ position: "absolute", left: 1080, width: 540, top: 780, textAlign: "center", fontSize: 40, fontWeight: 900, color: palette.ink, opacity: ramp(frame, c1 + 4 * BEAT, 8) }}>让大家好起来的<span style={{ color: `rgb(${RED})` }}>方法</span></div>
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            {BIRTHDAYS.map(([n, d], i) => {
              const col = i % 4, row = Math.floor(i / 4);
              return (
                <div key={n} style={{ position: "absolute", left: 300 + col * 340, top: 230 + row * 230, width: 280, height: 180, borderRadius: 14, background: "#efe6d4", color: "#2a2018", padding: "18px 22px", opacity: ramp(frame, c2 + 3 + i * 4, 6) }}>
                  <div style={{ fontSize: 30, fontWeight: 900 }}>{n}</div>
                  <div style={{ marginTop: 10, fontFamily: fonts.mono, fontSize: 40 }}>{d}</div>
                  <div style={{ position: "absolute", right: 18, top: 16, width: 50, height: 50, borderRadius: 25, border: `4px solid rgb(${WARM})`, color: `rgb(${WARM})`, textAlign: "center", fontSize: 32, lineHeight: "44px" }}>♥</div>
                </div>
              );
            })}
            <div style={{ position: "absolute", left: 300 + 3 * 340, top: 460, width: 280, height: 180, borderRadius: 14, border: "3px dashed rgba(232,238,242,0.4)", padding: "18px 22px", opacity: blank }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: palette.dim }}>我</div>
              <div style={{ marginTop: 10, fontFamily: fonts.mono, fontSize: 40, color: palette.faint }}>？/？</div>
            </div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={WARM} opacity={0.45} />
      {SEATS.map((_, i) => (
        <Sfx key={i} name="glint" at={4 + i * 6} volume={0.12} />
      ))}
      <Sfx name="stamp" at={5 * BEAT} volume={0.55} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.45} />
      {STEPS.map((_, i) => (
        <Sfx key={`s${i}`} name="shutter" at={c1 + 2 * BEAT + i * 5} volume={0.12} />
      ))}
      <Sfx name="whoosh" at={c2 - 3} volume={0.45} />
      {BIRTHDAYS.map((_, i) => (
        <Sfx key={`b${i}`} name="shutter" at={c2 + 3 + i * 4} volume={0.1} />
      ))}
      <Sfx name="boom" at={c2 + 5 * BEAT} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
