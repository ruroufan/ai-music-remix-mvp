import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam } from "../../glass/immersive";
import { FLOOR, HER, HIM, Leaner } from "../lovers";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const ORBS = ["梦想", "朋友", "爱好", "判断", "时间"];
const G = { x: 1250, y: 400, r: 230 };
const ME = 640;

// 0 · behind him, a globe draws itself: 全世界.
// 1 · out of her, one per half beat, the things that are hers — 梦想, 朋友,
//     爱好, 判断, 时间 — float over into his world. She thins out.
// 2 · a light from his world falls on her; when it swings away, she all but
//     disappears; when it comes back, there she is.
// 3 · the label on her, 深情, peels away: 逃避.
// 4 · behind her a door of light — 自己的人生 — and her back is to it.
export const BeauvoirScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2, c3, c4] = cues;
  const globe = ramp(frame, BEAT, 30);
  const given = Math.max(0, Math.min(ORBS.length, Math.floor((frame - c1 - HALF_BEAT) / HALF_BEAT) + 1));
  const ghostBase = interpolate(frame, [c1, c2], [0, 0.55], clamp);
  // the light from his world: on her, away, on her again
  const beam = frame >= c2 ? interpolate(frame, [c2, c2 + BEAT, c2 + 3 * BEAT, c2 + 4 * BEAT, c2 + 5 * BEAT, c2 + 6 * BEAT], [0, 1, 1, 0, 0, 1], clamp) : 0;
  const ghost = frame >= c2 ? 0.95 - 0.7 * beam : ghostBase;
  const tagIn = ramp(frame, c3, 6);
  const peel = interpolate(frame, [c3 + 3 * BEAT, c3 + 3 * BEAT + 12], [0, 1], { ...clamp, easing: (t) => t * t });
  const door = ramp(frame, c4, 12);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.1]} focus={{ x: 900, y: 450 }} hits={[c3 + 3 * BEAT]}>
        {/* 4 · the door to her own life, behind her */}
        {door > 0 && (
          <div style={{ position: "absolute", left: 220, top: FLOOR - 420, width: 200, height: 420, opacity: door, background: `linear-gradient(rgba(${palette.halo},0.55), rgba(${palette.halo},0.2))`, boxShadow: `0 0 80px rgba(${palette.halo},0.5)`, borderRadius: "100px 100px 0 0" }}>
            <div style={{ position: "absolute", left: -60, right: -60, top: -60, textAlign: "center", fontSize: 30, fontWeight: 900, color: `rgb(${palette.halo})` }}>自己的人生</div>
          </div>
        )}
        {/* his world */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: globe }}>
          <circle cx={G.x} cy={G.y} r={G.r} fill={`rgba(${HIM},0.08)`} stroke={`rgba(${HIM},0.8)`} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - globe} />
          {[-0.6, -0.2, 0.2, 0.6].map((k) => (
            <ellipse key={k} cx={G.x} cy={G.y + k * G.r} rx={G.r * Math.sqrt(1 - k * k)} ry={G.r * 0.12 * Math.sqrt(1 - k * k)} fill="none" stroke={`rgba(${HIM},0.35)`} strokeWidth={1.5} />
          ))}
          {[0, 1, 2].map((k) => (
            <ellipse key={k} cx={G.x} cy={G.y} rx={G.r * Math.abs(Math.cos(frame / 40 + k))} ry={G.r} fill="none" stroke={`rgba(${HIM},0.3)`} strokeWidth={1.5} />
          ))}
        </svg>
        <div style={{ position: "absolute", left: G.x - 150, width: 300, top: G.y - G.r - 60, textAlign: "center", fontSize: 34, fontWeight: 900, color: `rgb(${HIM})`, opacity: globe }}>全世界</div>
        <Leaner x={G.x} floor={FLOOR} h={300} lift={1.1} glow={0.8} rgb={HIM} />
        {/* the beam onto her */}
        {beam > 0.02 && (
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <polygon points={`${G.x - 120},${G.y + 60} ${G.x - 90},${G.y + 120} ${ME + 90},${FLOOR} ${ME - 90},${FLOOR - 40}`} fill={`rgba(${HIM},${0.18 * beam})`} />
          </svg>
        )}
        <Leaner x={ME} floor={FLOOR} h={280} lift={0.6} glow={0.8} ghost={ghost} rgb={HER} />
        {/* her things, floating over */}
        {ORBS.map((o, i) => {
          const at = c1 + HALF_BEAT + i * HALF_BEAT;
          const k = interpolate(frame, [at, at + 20], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
          if (k <= 0) return null;
          const sx = ME, sy = FLOOR - 170;
          const tx = G.x + Math.cos(i * 1.3) * G.r * 0.5, ty = G.y + Math.sin(i * 1.3) * G.r * 0.5;
          return (
            <div key={o} style={{ position: "absolute", left: sx + (tx - sx) * k, top: sy + (ty - sy) * k - Math.sin(k * Math.PI) * 120, transform: "translate(-50%, -50%)", padding: "8px 16px", borderRadius: 22, background: `rgba(${HER},0.85)`, color: "#1a1006", fontSize: 24, fontWeight: 900, boxShadow: `0 0 24px rgba(${HER},0.8)`, opacity: 0.9 }}>
              {o}
            </div>
          );
        })}
        <div style={{ position: "absolute", left: ME - 120, width: 240, top: FLOOR + 20, textAlign: "center", fontFamily: fonts.mono, fontSize: 20, color: palette.dim, opacity: given > 0 ? 1 : 0 }}>SELF · {Math.round(100 - ghost * 100)}%</div>
        {/* 深情 → 逃避 */}
        {tagIn > 0 && (
          <div style={{ position: "absolute", left: ME - 80, top: FLOOR - 200, width: 160 }}>
            <div style={{ padding: "8px 0", textAlign: "center", borderRadius: 8, background: "#2a0e14", border: `2px solid ${look.key}`, color: look.key, fontSize: 34, fontWeight: 900, opacity: peel }}>逃避</div>
            <div style={{ position: "absolute", inset: 0, padding: "8px 0", textAlign: "center", borderRadius: 8, background: "#fbe9ee", color: "#c2577a", fontSize: 34, fontWeight: 900, opacity: tagIn * (1 - peel * 0.9), transformOrigin: "0% 0%", transform: `rotate(${-6 + peel * 70}deg) translateY(${peel * 140}px) scale(${2 - tagIn})` }}>深情</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb="255, 170, 190" />
      <Sfx name="rise" at={BEAT} volume={0.3} />
      {ORBS.map((_, i) => (
        <Sfx key={i} name="glint" at={c1 + HALF_BEAT + i * HALF_BEAT} volume={0.2} />
      ))}
      <Sfx name="shutter" at={c2 + 3 * BEAT} volume={0.35} />
      <Sfx name="shutter" at={c2 + 5 * BEAT} volume={0.35} />
      <Sfx name="stamp" at={c3} volume={0.5} />
      <Sfx name="whoosh" at={c3 + 3 * BEAT} volume={0.45} />
      <Sfx name="rise" at={c4} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
