import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Stander } from "../../doubt/circles";
import { Walker } from "../../nostalgia/road";
import { Bokeh, Cam } from "../immersive";
import { GlassHeart, STING } from "../parts";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const PASS = [
  { at: 1, say: "还行吧", v: 62 },
  { at: 3, say: "一般", v: 40 },
  { at: 5, say: "挺好的", v: 75 },
  { at: 7, say: "不怎么样", v: 28 },
];
const G = { x: 960, y: 330, r: 150 };

// 0 · over his head a dial — 自我评价 — and passers-by walking across behind
//     him, each tossing out a word as they go; every word yanks the needle.
// 1 · one more goes by: 啧. The needle slams to the bottom, and the sun goes
//     all the way across the sky — a whole day — with him slumped under it.
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const c1 = cues[1];
  const tsk = c1 + BEAT;
  let v = 50;
  for (const p of PASS) if (frame >= p.at * BEAT) v = p.v;
  if (frame >= tsk) v = 4;
  const last = PASS.filter((p) => frame >= p.at * BEAT).pop();
  const jolt = last ? Math.exp(-(frame - last.at * BEAT) / 4) * Math.sin((frame - last.at * BEAT) * 2) * 6 : 0;
  const ang = -180 + (v / 100) * 180 + jolt;
  const day = interpolate(frame, [tsk + BEAT, duration - 4], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.06]} hits={[tsk]}>
        {/* the sun crossing the sky */}
        {day > 0 && (
          <>
            <div style={{ position: "absolute", left: 200 + 1520 * day - 40, top: 520 - Math.sin(day * Math.PI) * 400 - 40, width: 80, height: 80, borderRadius: 40, background: "radial-gradient(circle, #ffe2a8, #ffb060 60%, transparent 72%)", opacity: 0.8 }} />
            <div style={{ position: "absolute", right: 150, top: 110, fontFamily: fonts.mono, fontSize: 30, color: look.key }}>{String(Math.floor(9 + 12 * day)).padStart(2, "0")}:00</div>
          </>
        )}
        {/* passers-by */}
        {PASS.concat([{ at: tsk / BEAT, say: "啧", v: 4 }]).map((p, i) => {
          const t0 = p.at * BEAT - 20;
          const x = interpolate(frame, [t0, t0 + 110], [1900, 20], clamp);
          if (frame < t0 || frame > t0 + 110) return null;
          const talk = frame >= p.at * BEAT && frame < p.at * BEAT + 26;
          return (
            <div key={i}>
              <Walker x={x} bottom={640} height={220} face="left" walk={((frame - t0) / BEAT) * Math.PI} glow={0.35} rgb={palette.accentRgb} opacity={0.75} />
              {talk && <div style={{ position: "absolute", left: x - 30, top: 360, transform: "translate(-50%, -100%)", padding: "8px 18px", borderRadius: 18, background: p.say === "啧" ? STING : "rgba(232,238,242,0.92)", color: p.say === "啧" ? "#fff" : "#14181e", fontSize: p.say === "啧" ? 40 : 26, fontWeight: 900, whiteSpace: "nowrap" }}>{p.say}</div>}
            </div>
          );
        })}
        <Stander x={960} bottom={760} height={300} lift={frame >= tsk ? 0 : 0.6} glow={0.7} />
        <GlassHeart x={960} y={760 - 145 * (300 / 260)} size={60} crack={frame >= tsk ? 0.6 : 0.2} pain={frame >= tsk ? 0.7 : 0.2} />
        {/* the dial */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <path d={`M${G.x - G.r} ${G.y} A${G.r} ${G.r} 0 0 1 ${G.x + G.r} ${G.y}`} fill="none" stroke={palette.faint} strokeWidth={16} strokeLinecap="round" />
          <path d={`M${G.x - G.r} ${G.y} A${G.r} ${G.r} 0 0 1 ${G.x + G.r} ${G.y}`} fill="none" stroke={v < 20 ? STING : palette.accent} strokeWidth={16} strokeLinecap="round" pathLength={100} strokeDasharray={`${v} 100`} />
          <line x1={G.x} y1={G.y} x2={G.x + Math.cos((ang * Math.PI) / 180) * (G.r - 24)} y2={G.y + Math.sin((ang * Math.PI) / 180) * (G.r - 24)} stroke="#fff" strokeWidth={5} strokeLinecap="round" />
          <circle cx={G.x} cy={G.y} r={10} fill="#fff" />
        </svg>
        <div style={{ position: "absolute", left: G.x - 150, width: 300, top: G.y + 18, textAlign: "center", fontSize: 26, fontWeight: 800, color: palette.ink }}>自我评价 <span style={{ fontFamily: fonts.mono, color: v < 20 ? STING : palette.accent }}>{Math.round(v)}</span></div>
        <div style={{ position: "absolute", left: G.x - 200, width: 400, top: G.y + 58, textAlign: "center", fontFamily: fonts.mono, fontSize: 16, letterSpacing: 4, color: look.key, opacity: ramp(frame, 2 * BEAT, 8) }}>控制权：路人</div>
      </Cam>
      <Bokeh frame={frame} />
      {PASS.map((p) => (
        <Sfx key={p.at} name="glitch" at={p.at * BEAT} volume={0.25} />
      ))}
      <Sfx name="shatter" at={tsk} volume={0.45} />
      <Sfx name="boom" at={tsk} volume={0.45} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
