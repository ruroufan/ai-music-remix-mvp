import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Person, ReplayClip } from "../projector";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const FLOOR = 760;

// 0 · reflection: glance back at the clip, then walk on toward the light.
// 1 · regret: glance back — and stay. The clip grows; the person doesn't move.
// 2 · split: yesterday's self takes a red ✕ every beat; today's clock runs on.
export const PastScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const seg = (i: number) => frame >= cues[i] && (i + 1 >= cues.length || frame < cues[i + 1]);
  const segIn = (i: number) => interpolate(frame, [cues[i], cues[i] + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // 0
  const t0 = frame - cues[0];
  const lookBack = t0 > BEAT && t0 < 3 * BEAT;
  const walk = interpolate(t0, [3 * BEAT, cues[1] - cues[0]], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // 1
  const t1 = frame - cues[1];
  const grow = interpolate(t1, [BEAT, cues[2] - cues[1]], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // 2
  const t2 = frame - cues[2];
  const hits = Math.max(0, Math.min(6, Math.floor((t2 - BEAT) / BEAT) + 1));
  const lost = Math.max(0, Math.floor(t2 / 10));

  return (
    <ObsFrame duration={duration}>
      {(seg(0) || seg(1)) && <Horizon y={FLOOR} />}
      {seg(0) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(0) }}>
          <ReplayClip x={420} y={460} w={340} frame={t0} id="p0" opacity={0.7 - walk * 0.4} />
          <div style={{ position: "absolute", right: 0, top: 0, width: 700, height: FLOOR, background: `linear-gradient(270deg, rgba(${palette.accentRgb},0.18), transparent)` }} />
          <Person x={860 + walk * 620} bottom={FLOOR} height={250} flip={lookBack} glow={0.6 + walk * 0.5} />
          <div style={{ position: "absolute", left: 1480, top: 360, fontFamily: fonts.mono, fontSize: 24, letterSpacing: 6, color: palette.accent, opacity: walk }}>→ 未来</div>
          <div style={{ position: "absolute", left: 300, top: 640, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 6, color: palette.dim }}>反省 · REFLECT</div>
        </div>
      )}
      {seg(1) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(1) }}>
          <ReplayClip x={460 + grow * 80} y={430} w={340 + grow * 300} frame={t1} id="p1" tint={grow * 0.5} count={Math.floor(t1 / 30) + 1} />
          <Person x={1200} bottom={FLOOR} height={250} pose="hunch" flip glow={0.5 - grow * 0.2} />
          <div style={{ position: "absolute", left: 1330, top: 380, fontFamily: fonts.mono, fontSize: 64, color: palette.dim, letterSpacing: 4 }}>
            {String(2 + Math.floor(t1 / 15)).padStart(2, "0")}:00
          </div>
          <div style={{ position: "absolute", left: 1330, top: 470, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 6, color: palette.alert }}>后悔 · STAY</div>
        </div>
      )}
      {seg(2) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(2) }}>
          <div style={{ position: "absolute", left: 959, top: 150, width: 2, height: 640, background: palette.faint }} />
          <div style={{ position: "absolute", left: 0, width: 960, top: 180, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.dim }}>昨天的自己</div>
          <div style={{ position: "absolute", left: 960, width: 960, top: 180, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.dim }}>今天的自己</div>
          <ReplayClip x={480} y={470} w={460} frame={t2} id="p2" />
          {Array.from({ length: hits }, (_, i) => (
            <div key={i} style={{ position: "absolute", left: 480 - 60 + ((i * 53) % 140) - 70, top: 380 + ((i * 37) % 120) - 40, fontSize: 120, fontWeight: 900, color: palette.alert, transform: `rotate(${(i % 3) * 12 - 12}deg)`, opacity: 0.85 }}>
              ✕
            </div>
          ))}
          <Person x={1300} bottom={720} height={230} pose="hunch" glow={0.4} />
          {/* today's clock, running */}
          <svg width={180} height={180} viewBox="-50 -50 100 100" style={{ position: "absolute", left: 1500, top: 300 }}>
            <circle r={44} fill="none" stroke={palette.dim} strokeWidth={2.5} />
            <line x1={0} y1={0} x2={0} y2={-34} stroke={palette.ink} strokeWidth={2.5} transform={`rotate(${t2 * 24})`} />
            <line x1={0} y1={0} x2={0} y2={-22} stroke={palette.ink} strokeWidth={3.5} transform={`rotate(${t2 * 2})`} />
          </svg>
          <div style={{ position: "absolute", left: 1500, width: 180, top: 500, textAlign: "center", fontFamily: fonts.mono, fontSize: 30, color: palette.alert }}>−{lost}min</div>
        </div>
      )}

      <Sfx name="step" at={cues[0] + 3 * BEAT} volume={0.4} />
      <Sfx name="step" at={cues[0] + 4 * BEAT} volume={0.35} />
      <Sfx name="step" at={cues[0] + 5 * BEAT} volume={0.3} />
      <Sfx name="shutter" at={cues[1]} volume={0.3} />
      {Array.from({ length: 6 }, (_, i) => (
        <Sfx key={i} name="stamp" at={cues[2] + (i + 1) * BEAT} volume={0.3} />
      ))}

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
