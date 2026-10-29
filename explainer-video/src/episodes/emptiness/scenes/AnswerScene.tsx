import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Walker } from "../../nostalgia/road";
import { Bokeh, Cam } from "../../glass/immersive";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FLOOR = 740;
const PUSH = ["KPI", "截止日期", "老板的目标", "别人的期待"];

// 0 · a switch: 上班 → 放假. He's standing still.
// 1 · flashback to work: one per beat, big arrows slam in from behind him —
//     KPI · 截止日期 · 老板的目标 · 别人的期待 — and push him along; he walks.
// 2 · the arrows drop away, and he stops. He looks at what he's holding:
//     我的目标：___ — empty.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2] = cues;
  const flip = interpolate(frame, [BEAT, BEAT + 6], [0, 1], clamp);
  const pushing = frame >= c1 && frame < c2;
  const drop = interpolate(frame, [c2, c2 + 12], [0, 1], { ...clamp, easing: (t) => t * t });
  let walked = 0;
  for (let f = c1; f < Math.min(frame, c2 + 10); f++) walked += interpolate(f, [c1, c1 + BEAT, c2 - 4, c2 + 10], [0, 1, 1, 0], clamp);
  const mine = interpolate(frame, [c2 + 2 * BEAT, c2 + 2 * BEAT + 10], [0, 1], clamp);
  const x = 900 + Math.min(260, walked * 1.6) - 260 * (frame >= c1 ? 0.5 : 0);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.08]} focus={{ x: 900, y: 560 }} whips={[c1]} hits={[c1 + BEAT, c1 + 2 * BEAT, c1 + 3 * BEAT, c1 + 4 * BEAT, c2]}>
        <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR, height: 2, background: "linear-gradient(90deg, transparent, rgba(232,238,242,0.18), transparent)" }} />
        {frame < c1 && (
          <div style={{ position: "absolute", left: 760, top: 220, width: 400, display: "flex", alignItems: "center", gap: 20, fontSize: 34, fontWeight: 900 }}>
            <span style={{ color: flip > 0.5 ? palette.dim : palette.ink }}>上班</span>
            <div style={{ position: "relative", width: 120, height: 56, borderRadius: 28, background: flip > 0.5 ? "rgba(255,199,122,0.3)" : "rgba(255,255,255,0.1)", border: `2px solid ${palette.faint}` }}>
              <div style={{ position: "absolute", top: 6, left: 6 + 64 * flip, width: 40, height: 40, borderRadius: 20, background: flip > 0.5 ? look.key : palette.ink }} />
            </div>
            <span style={{ color: flip > 0.5 ? look.key : palette.dim }}>放假</span>
          </div>
        )}
        {frame >= c1 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: 1 - drop }}>上班时</div>
        )}
        {/* the arrows pushing him */}
        {frame >= c1 &&
          PUSH.map((p, i) => {
            const at = c1 + BEAT + i * BEAT;
            const inP = interpolate(frame, [at - 4, at], [0, 1], { ...clamp, easing: (t) => t * t });
            if (inP <= 0) return null;
            const y = 300 + i * 100;
            const tip = x - 120 - i * 30;
            const fall = drop * (200 + i * 60);
            return (
              <div key={p} style={{ position: "absolute", left: tip - 560 + (1 - inP) * -600, top: y + fall, width: 560, height: 70, opacity: 1 - drop, transform: `rotate(${drop * (10 + i * 6)}deg)` }}>
                <svg width={560} height={70} style={{ position: "absolute", inset: 0 }}>
                  <path d="M0 14 L470 14 L470 0 L560 35 L470 70 L470 56 L0 56 Z" fill={`rgba(${palette.accentRgb},${0.18 + 0.06 * i})`} stroke={`rgba(${palette.accentRgb},0.7)`} strokeWidth={2} />
                </svg>
                <div style={{ position: "absolute", left: 30, top: 16, fontSize: 30, fontWeight: 900, color: palette.ink }}>{p}</div>
              </div>
            );
          })}
        <Walker x={x} bottom={FLOOR} height={290} face="right" walk={walked * 0.16} lean={pushing ? -8 : 0} glow={0.8} />
        {/* what's in his hands */}
        {mine > 0 && (
          <>
            <Halo x={x + 260} y={420} r={260} intensity={0.4 * mine} />
            <div style={{ position: "absolute", left: x + 90, top: 330, width: 420, padding: "24px 30px", borderRadius: 16, background: "rgba(14,20,28,0.92)", border: `2px dashed ${look.key}`, opacity: mine, transform: `scale(${1.1 - 0.1 * mine})` }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: look.key }}>我的目标：</div>
              <div style={{ marginTop: 20, height: 46, borderBottom: "3px solid rgba(232,238,242,0.4)", display: "flex", alignItems: "flex-end", paddingBottom: 6 }}>
                <div style={{ width: 4, height: 36, background: palette.ink, opacity: Math.floor(frame / 8) % 2 ? 1 : 0 }} />
              </div>
            </div>
          </>
        )}
      </Cam>
      <Bokeh frame={frame} />
      <Sfx name="shutter" at={BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.45} />
      {PUSH.map((_, i) => (
        <Sfx key={i} name="stamp" at={c1 + BEAT + i * BEAT} volume={0.3} />
      ))}
      <Sfx name="whoosh" at={c2} volume={0.4} />
      <Sfx name="glint" at={c2 + 2 * BEAT} volume={0.35} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
