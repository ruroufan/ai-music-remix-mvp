import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { GREY } from "../study";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const FLOOR = 760;
const X = 960;
const PLANS = ["方案 A", "方案 B", "方案 C"];
const VARS = ["天气", "别人", "钱", "时机", "意外", "情绪", "运气", "身体"];

// 0 · he stands inside a big clean bubble — his head — with his plans in it.
// 1 · in there every plan glows: 完美 ✓.
// 2 · the bubble pops; out here the variables come down on him, one per half
//     beat — 天气 · 别人 · 钱 · 时机 · 意外 … — each a ？-cube, bouncing.
// 3 · the bubble closes round him again, and the cubes bounce off it:
//     躲避不确定.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2, c3] = cues;
  const bubble = frame < c2 ? ramp(frame, 0, 10) : frame < c3 ? 1 - ramp(frame, c2, 4) : ramp(frame, c3, 8);
  const pop = frame >= c2 && frame < c2 + 10 ? (frame - c2) / 10 : 0;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.08]} focus={{ x: X, y: 480 }} hits={[c2, ...keyHits(lines, cues, duration)]}>
        {/* the bubble */}
        {bubble > 0.01 && (
          <div style={{ position: "absolute", left: X - 330, top: 120, width: 660, height: 660, borderRadius: "50%", border: `3px solid rgba(232,238,242,${0.5 * bubble})`, background: `radial-gradient(circle at 40% 35%, rgba(255,255,255,${0.12 * bubble}), rgba(255,255,255,${0.03 * bubble}) 60%)`, opacity: bubble, transform: `scale(${0.9 + 0.1 * bubble})` }} />
        )}
        {pop > 0 &&
          Array.from({ length: 24 }, (_, i) => {
            const a = (i / 24) * Math.PI * 2;
            return <div key={i} style={{ position: "absolute", left: X + Math.cos(a) * (330 + 200 * pop), top: 450 + Math.sin(a) * (330 + 200 * pop), width: 8, height: 8, borderRadius: 4, background: "rgba(232,238,242,0.8)", opacity: 1 - pop }} />;
          })}
        {frame < c2 &&
          PLANS.map((p, i) => {
            const show = ramp(frame, BEAT + i * BEAT, 6);
            const perfect = ramp(frame, c1 + i * 6, 6);
            return (
              <div key={p} style={{ position: "absolute", left: X - 150, top: 200 + i * 80, width: 300, padding: "10px 0", textAlign: "center", borderRadius: 12, border: `2px solid ${perfect > 0.5 ? look.key : `rgba(${GREY},0.5)`}`, background: perfect > 0.5 ? "rgba(255,199,122,0.15)" : "rgba(22,24,28,0.9)", fontSize: 28, fontWeight: 800, opacity: show, boxShadow: perfect > 0.5 ? `0 0 24px ${look.keyGlow}` : undefined }}>
                {p} {perfect > 0.5 && <span style={{ color: look.key }}>完美 ✓</span>}
              </div>
            );
          })}
        <Stander x={X} bottom={FLOOR} height={300} lift={frame >= c2 && frame < c3 ? 0.3 : 1} glow={0.8} />
        {/* the variables falling */}
        {frame >= c2 &&
          VARS.map((v, i) => {
            const at = c2 + BEAT + i * HALF_BEAT;
            if (frame < at) return null;
            const t = (frame - at) / 30;
            const tx = X + (i % 2 ? 1 : -1) * (160 + (i % 4) * 110);
            const shielded = frame >= c3;
            const yFall = Math.min(1, t) ;
            const y = 80 + yFall * yFall * (FLOOR - 140) - (t > 1 ? Math.abs(Math.sin((t - 1) * 6)) * 40 * Math.exp(-(t - 1) * 2) : 0);
            const x = shielded ? tx + (i % 2 ? 1 : -1) * Math.min(1, (frame - c3) / 20) * 260 : tx;
            return (
              <div key={v} style={{ position: "absolute", left: x - 55, top: y - 60, width: 110, height: 110, borderRadius: 12, background: "rgba(40,20,26,0.92)", border: `3px solid ${palette.alert}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `rotate(${random(`vr-${i}`) * 40 - 20 + t * 30}deg)` }}>
                <div style={{ fontSize: 40, fontWeight: 900, color: palette.alert, lineHeight: 1 }}>？</div>
                <div style={{ fontSize: 22, fontWeight: 800 }}>{v}</div>
              </div>
            );
          })}
        {frame >= c2 && frame < c3 && <div style={{ position: "absolute", left: 0, right: 0, top: 130, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 8, color: palette.alert }}>现实 · 算不到的变量</div>}
        {frame >= c3 && <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 8, color: palette.dim }}>回到脑子里 · 安全</div>}
      </Cam>
      <Bokeh frame={frame} rgb="200, 205, 215" opacity={0.6} />
      {PLANS.map((_, i) => (
        <Sfx key={i} name="glint" at={c1 + i * 6} volume={0.25} />
      ))}
      <Sfx name="shatter" at={c2} volume={0.45} />
      {VARS.map((_, i) => (
        <Sfx key={`v${i}`} name="stamp" at={c2 + BEAT + i * HALF_BEAT + 30} volume={0.15} />
      ))}
      <Sfx name="whoosh" at={c3} volume={0.4} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
