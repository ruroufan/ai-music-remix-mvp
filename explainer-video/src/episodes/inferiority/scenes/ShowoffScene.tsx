import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Backlit, Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Gilded, GoldTag } from "../gilded";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const FLOOR = 800;
const BUBBLES = [
  { pre: "我们", x: 1060, y: 330 },
  { pre: "当年在", x: 1330, y: 470 },
  { pre: "毕竟是", x: 1120, y: 610 },
];

// Four quick cases, then the rule behind them.
export const ShowoffScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const seg = (i: number) => frame >= cues[i] && (i + 1 >= cues.length || frame < cues[i + 1]);
  const segIn = (i: number) => interpolate(frame, [cues[i], cues[i] + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // 2: the watch slides out from the sleeve on beat 3
  const sleeve = interpolate(frame, [cues[1] + 2 * BEAT, cues[1] + 3 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // 3: retouch slider 0 → 100% over the line
  const retouch = interpolate(frame, [cues[2] + BEAT, cues[3] - BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // 4: every label strains, and the cracks blaze on each beat
  const pulse = Math.max(0, Math.cos(((frame - cues[3]) / BEAT) * Math.PI * 2)) ** 3;

  return (
    <ObsFrame duration={duration}>
      {/* 1 · the school */}
      {seg(0) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(0) }}>
          <Horizon y={FLOOR} />
          <Backlit x={700} bottom={FLOOR} height={320} />
          {BUBBLES.map((b, i) => {
            const a = interpolate(frame, [cues[0] + (i + 1) * BEAT, cues[0] + (i + 1) * BEAT + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={i} style={{ position: "absolute", left: b.x, top: b.y, opacity: a, transform: `translate(-50%, -50%) scale(${0.7 + a * 0.3})`, padding: "18px 26px", borderRadius: 26, border: `2px solid ${palette.faint}`, background: "#0e1522", display: "flex", alignItems: "center", gap: 14, fontSize: 34 }}>
                {b.pre}
                <span style={{ position: "relative", width: 110, height: 50 }}>
                  <GoldTag text="名校" x={55} y={25} size={30} rot={i * 4 - 4} />
                </span>
                …
              </div>
            );
          })}
        </div>
      )}

      {/* 2 · the watch at dinner */}
      {seg(1) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(1) }}>
          <div style={{ position: "absolute", left: 260, top: 640, width: 1400, height: 10, background: "#2a2f3a" }} />
          {[560, 960, 1360].map((x) => (
            <div key={x} style={{ position: "absolute", left: x - 90, top: 610, width: 180, height: 30, borderRadius: "50%", border: `2px solid ${palette.faint}` }} />
          ))}
          {/* an arm reaching for a glass, the sleeve riding up */}
          <div style={{ position: "absolute", left: 300, top: 520, width: 560, height: 70, borderRadius: 35, background: "#05070a", border: `2px solid rgba(${palette.halo},0.6)`, transform: "rotate(8deg)", transformOrigin: "0 50%" }}>
            <div style={{ position: "absolute", right: 70 + sleeve * 10, top: 6, width: 58, height: 58, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #fff3c4, #c99a35 50%, #6b4a10)", boxShadow: sleeve > 0.9 ? "0 0 40px 10px rgba(246,220,138,0.8)" : "none", opacity: sleeve }} />
            <div style={{ position: "absolute", right: 70 + 80 - sleeve * 120, top: -6, width: 200, height: 82, borderRadius: 20, background: "#141a24", border: `2px solid ${palette.faint}` }} />
          </div>
          <div style={{ position: "absolute", left: 980, top: 430, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: "#e6c46a", opacity: sleeve }}>“不经意”</div>
        </div>
      )}

      {/* 3 · the photo, retouched until it's someone else */}
      {seg(2) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(2) }}>
          <div style={{ position: "absolute", left: 960 - 210, top: 120, width: 420, height: 640, borderRadius: 36, border: `2px solid ${palette.faint}`, background: "#0a0e15", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 30, top: 40, width: 360, height: 420, background: "linear-gradient(#2a3446, #141a24)", overflow: "hidden", filter: `saturate(${1 + retouch * 2}) blur(${retouch * 1.5}px) brightness(${1 + retouch * 0.5})` }}>
              {/* the face drifts away from the person */}
              <div style={{ position: "absolute", left: 180 - 70 * (1 - retouch * 0.25), top: 90 - retouch * 20, width: 140 * (1 - retouch * 0.25), height: 170 * (1 + retouch * 0.1), borderRadius: `50% 50% ${50 - retouch * 20}% ${50 - retouch * 20}%`, background: "#e8d6c6" }}>
                {[0.32, 0.68].map((ex) => (
                  <div key={ex} style={{ position: "absolute", left: `${ex * 100}%`, top: "40%", width: 16 + retouch * 18, height: 10 + retouch * 14, borderRadius: "50%", background: "#1a1410", transform: "translate(-50%, -50%)" }} />
                ))}
              </div>
              <div style={{ position: "absolute", left: 180 - 130, top: 270, width: 260, height: 200, borderRadius: "130px 130px 0 0", background: "#3a4456" }} />
              {Array.from({ length: 14 }, (_, i) => (
                <div key={i} style={{ position: "absolute", left: random(`sp-x-${i}`) * 360, top: random(`sp-y-${i}`) * 420, width: 6, height: 6, borderRadius: 3, background: "#fff", opacity: retouch * random(`sp-o-${i}`), boxShadow: "0 0 8px #fff" }} />
              ))}
            </div>
            {/* the slider */}
            <div style={{ position: "absolute", left: 30, top: 510, width: 360, fontFamily: fonts.mono, fontSize: 16, letterSpacing: 2, color: palette.dim }}>
              RETOUCH {Math.round(retouch * 100)}%
              <div style={{ marginTop: 12, height: 6, borderRadius: 3, background: palette.faint }}>
                <div style={{ width: `${retouch * 100}%`, height: 6, borderRadius: 3, background: palette.accent }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4 · all of it on one person; the cracks pulse under the gold */}
      {seg(3) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(3) }}>
          <Horizon y={FLOOR} />
          <Gilded x={960} bottom={FLOOR} height={450} labels={[1, 1, 1, 1]} crack={1} crackGlow={pulse} shake={0.6 + pulse} frame={frame} />
        </div>
      )}

      {BUBBLES.map((_, i) => (
        <Sfx key={i} name="shutter" at={cues[0] + (i + 1) * BEAT} volume={0.3} />
      ))}
      <Sfx name="glint" at={cues[1] + 3 * BEAT} volume={0.5} />
      <Sfx name="rise" at={cues[2] + BEAT} volume={0.25} />
      <Sfx name="glitch" at={cues[3]} volume={0.35} />
      {[1, 2, 3].map((k) => (
        <Sfx key={k} name="stamp" at={cues[3] + k * 2 * BEAT} volume={0.25} />
      ))}
      <Sfx name="whoosh" at={cues[2] - HALF_BEAT} volume={0.2} />

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
