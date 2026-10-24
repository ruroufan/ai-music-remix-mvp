import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam } from "../../glass/immersive";
import { PAIN, PIVOT, ROD, Pendulum, WARM, bobAt, swing } from "../pendulum";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BAR, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FILLERS = ["买东西", "刷手机", "找刺激"];

// 0 · the pendulum; one per bar, a new desire is flung onto the bob — 买东西,
//     刷手机, 找刺激 — and each one throws it higher.
// 1 · it's swinging enormous now. Every time it comes down through the bottom,
//     the hole under the arc opens wider, and a drop arrow measures the fall:
//     落差.
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1] = cues;
  const landAt = (i: number) => BAR / 2 + i * BAR; // as it passes the bottom
  const boosts = FILLERS.filter((_, i) => frame >= landAt(i)).length;
  const amp = interpolate(frame, [0, landAt(0), landAt(0) + 10, landAt(1), landAt(1) + 10, landAt(2), landAt(2) + 10, landAt(2) + 40], [26, 26, 38, 38, 50, 50, 62, 72], clamp);
  const deg = swing(frame, BAR, amp);
  const vel = deg - swing(frame - 1, BAR, amp);
  const bob = bobAt(deg);
  const bottom = bobAt(0);
  const hole = interpolate(frame, [c1, duration], [60, 300], clamp) + (frame >= c1 ? 30 * Math.exp(-((frame - c1 + BAR / 2) % BAR) / 8) : 0);
  const top = bobAt(amp);
  const arrow = interpolate(frame, [c1 + BEAT, c1 + 2 * BEAT], [0, 1], clamp);
  const pain = Math.pow(Math.max(0, -deg / amp), 3);
  const bore = Math.pow(Math.max(0, deg / amp), 3);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.08, 1]} focus={{ x: 960, y: 420 }} hits={FILLERS.map((_, i) => landAt(i)).concat([c1])} whips={[]}>
        {/* the hole under the bottom of the swing */}
        <div style={{ position: "absolute", left: bottom.x - hole * 1.6, top: bottom.y + 60 - hole * 0.25, width: hole * 3.2, height: hole * 0.7, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,0,0,0.95), rgba(0,0,0,0.6) 55%, transparent 72%)", border: frame >= c1 ? "1px solid rgba(232,238,242,0.15)" : undefined }} />
        {frame >= c1 && <div style={{ position: "absolute", left: bottom.x + hole * 1.2, top: bottom.y + 70, fontSize: 30, fontWeight: 900, color: palette.dim }}>空</div>}
        <Pendulum deg={deg} amp={Math.max(56, amp)} pain={pain} bore={bore} trail={vel * 1.4} slump={frame >= c1 ? 0.7 : 0.1} pivot={PIVOT} rod={ROD} />
        {/* the desires, flung onto the bob */}
        {FILLERS.map((f, i) => {
          const at = landAt(i);
          const p = interpolate(frame, [at - 12, at], [0, 1], { ...clamp, easing: (t) => t * t });
          if (p <= 0) return null;
          const sx = i % 2 ? 1700 : 220, sy = 250;
          const stuck = frame >= at;
          const px = stuck ? bob.x : sx + (bottom.x - sx) * p;
          const py = stuck ? bob.y + 76 + i * 40 : sy + (bottom.y - sy) * p - 120 * Math.sin(p * Math.PI);
          return (
            <div key={f} style={{ position: "absolute", left: px - 60, top: py, width: 120, padding: "6px 0", textAlign: "center", borderRadius: 10, background: `rgba(${WARM},0.2)`, border: `2px solid ${look.key}`, fontSize: 22, fontWeight: 900, color: look.key, opacity: frame >= c1 ? 0.35 : 1 }}>{f}</div>
          );
        })}
        {/* 落差: from the top of the swing to the bottom */}
        {arrow > 0 && (
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <line x1={top.x + 150} y1={top.y} x2={top.x + 150} y2={top.y + (bottom.y + 60 - top.y) * arrow} stroke={`rgb(${PAIN})`} strokeWidth={4} strokeDasharray="10 8" />
            <path d={`M${top.x + 136} ${top.y + (bottom.y + 60 - top.y) * arrow - 16} L${top.x + 150} ${top.y + (bottom.y + 60 - top.y) * arrow} L${top.x + 164} ${top.y + (bottom.y + 60 - top.y) * arrow - 16}`} fill="none" stroke={`rgb(${PAIN})`} strokeWidth={4} />
            <text x={top.x + 40} y={(top.y + bottom.y) / 2} fontSize={34} fontWeight={900} fill={`rgb(${PAIN})`} opacity={arrow} textAnchor="end">落差</text>
          </svg>
        )}
        <div style={{ position: "absolute", left: 210, top: 770, fontFamily: fonts.mono, fontSize: 24, letterSpacing: 4, color: palette.dim }}>
          摆幅 <span style={{ color: boosts ? look.key : palette.ink, fontSize: 36 }}>{Math.round(amp)}°</span>
        </div>
      </Cam>
      <Bokeh frame={frame} />
      {FILLERS.map((_, i) => (
        <Sfx key={i} name="stamp" at={landAt(i)} volume={0.35} />
      ))}
      {Array.from({ length: 5 }, (_, k) => c1 + BAR / 2 + k * BAR)
        .filter((f) => f < duration)
        .map((f) => (
          <Sfx key={f} name="boom" at={f} volume={0.2} />
        ))}
      <Sfx name="whoosh" at={c1} volume={0.4} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
