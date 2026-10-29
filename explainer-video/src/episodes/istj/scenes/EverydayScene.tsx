import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Checklist, INK, PALE, WARM } from "../checklist";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const SAT = ["08:00 晨跑", "09:30 整理衣柜", "11:00 采购", "14:00 学习", "16:00 洗车", "19:00 备菜"];
const SEA = "120, 180, 220";
const RED = "255, 110, 110";

// Three moments, full screen, a whip-pan between each.
// 1 · a calendar page — 周六 · 休息 — and a to-do list writing itself under it,
//     hour by hour.
// 2 · a chat: 周末去看海吗？ next to a sea, blue and glittering — and his reply,
//     去那里干什么？ — and the sea drains to grey.
// 3 · a day as a 24-hour ring with nothing written in it; it fills grey, and
//     a red stamp comes down: 浪费.
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : 2;
  const reply = ramp(frame, c1 + 3 * BEAT, 6);
  const grey = interpolate(frame, [c1 + 4 * BEAT, c1 + 6 * BEAT], [0, 1], clamp);
  const ring = interpolate(frame, [c2 + 4, c2 + 4 * BEAT], [0, 1], clamp);
  const stamp = ramp(frame, c2 + 5 * BEAT, 5);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1, c2]} hits={[c1 + 3 * BEAT, c2 + 5 * BEAT, ...keyHits(lines, cues, duration)]}>
        {seg === 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 360, top: 200, width: 360, height: 420, background: "#efe8d8", borderRadius: 10, color: "#262019", textAlign: "center", boxShadow: "0 18px 40px rgba(0,0,0,0.55)" }}>
              <div style={{ height: 90, background: "rgb(200,70,60)", borderRadius: "10px 10px 0 0", color: "#fff", fontSize: 44, fontWeight: 900, lineHeight: "90px" }}>周六</div>
              <div style={{ fontSize: 170, fontWeight: 900, lineHeight: "220px" }}>休</div>
              <div style={{ fontSize: 32, color: "rgba(38,32,25,0.6)" }}>休息日</div>
            </div>
            <Checklist x={860} y={190} w={460} items={SAT} done={0} size={1.1} />
            <div style={{ position: "absolute", left: 860, top: 190, width: 460, height: 560, background: "#0b0d10", transformOrigin: "50% 100%", transform: `scaleY(${1 - interpolate(frame, [BEAT, 6 * BEAT], [0, 1], clamp)})` }} />
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 200, top: 220, width: 700, height: 460, borderRadius: 18, overflow: "hidden", filter: `grayscale(${grey})`, opacity: 1 - 0.5 * grey }}>
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(rgb(255,214,160) 0%, rgb(${SEA}) 55%, rgb(40,90,140) 100%)` }} />
              <svg width={700} height={460} style={{ position: "absolute", inset: 0 }}>
                <circle cx={500} cy={190} r={60} fill="rgba(255,240,200,0.95)" />
                {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M0 ${270 + i * 30} q 60 ${-10} 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0`} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth={3} transform={`translate(${-((frame * (1 + i * 0.2)) % 240)} 0)`} />)}
              </svg>
            </div>
            <div style={{ position: "absolute", left: 1040, top: 260, padding: "16px 28px", borderRadius: 18, background: "rgba(255,255,255,0.1)", fontSize: 38, color: palette.ink, opacity: ramp(frame, c1 + 4, 6) }}>周末去看海吗？</div>
            <div style={{ position: "absolute", left: 1180, top: 400, padding: "16px 28px", borderRadius: 18, border: `2px solid rgb(${PALE})`, fontSize: 42, fontWeight: 900, color: palette.ink, opacity: reply, transform: `scale(${1.3 - 0.3 * reply})` }}>去那里干什么？</div>
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <circle cx={960} cy={480} r={230} fill="none" stroke={`rgba(${INK},0.2)`} strokeWidth={40} />
              <circle cx={960} cy={480} r={230} fill="none" stroke={`rgb(${PALE})`} strokeWidth={40} strokeDasharray={`${1445 * ring} 1500`} transform="rotate(-90 960 480)" />
              {Array.from({ length: 24 }, (_, i) => <line key={i} x1={960 + Math.cos((i / 24) * 6.283) * 270} y1={480 + Math.sin((i / 24) * 6.283) * 270} x2={960 + Math.cos((i / 24) * 6.283) * 285} y2={480 + Math.sin((i / 24) * 6.283) * 285} stroke={`rgba(${INK},0.4)`} strokeWidth={3} />)}
            </svg>
            <div style={{ position: "absolute", left: 0, right: 0, top: 440, textAlign: "center", fontFamily: fonts.mono, fontSize: 40, color: palette.dim }}>{Math.round(ring * 24)}h · 没做什么</div>
            <div style={{ position: "absolute", left: 1150, top: 300, padding: "10px 26px", border: `6px solid rgb(${RED})`, borderRadius: 10, fontSize: 80, fontWeight: 900, color: `rgb(${RED})`, opacity: stamp, transform: `rotate(-12deg) scale(${1.6 - 0.6 * stamp})` }}>浪费</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={WARM} opacity={0.35} />
      {SAT.map((_, i) => (
        <Sfx key={i} name="shutter" at={BEAT + i * 10} volume={0.12} />
      ))}
      <Sfx name="whoosh" at={c1 - 3} volume={0.5} />
      <Sfx name="stamp" at={c1 + 3 * BEAT} volume={0.35} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.5} />
      <Sfx name="stamp" at={c2 + 5 * BEAT} volume={0.6} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
