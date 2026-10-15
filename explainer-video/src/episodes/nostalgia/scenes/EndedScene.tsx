import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { FLOOR, Road, RoadLabels, SEPIA, Walker } from "../road";
import { stride, walkX } from "./HookScene";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const Puzzle: React.FC<{ x: number; y: number; missing: number[]; frame: number; color: string; jitter?: number }> = ({ x, y, missing, frame, color, jitter = 0 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 4 * 92, height: 3 * 92 }}>
    {Array.from({ length: 12 }, (_, i) => {
      const gone = missing.includes(i);
      const jx = gone ? 0 : (random(`jx-${i}`) - 0.5) * jitter * Math.sin(frame / 3 + i);
      return gone ? (
        <div key={i} style={{ position: "absolute", left: (i % 4) * 92, top: Math.floor(i / 4) * 92, width: 88, height: 88, border: `2px dashed ${palette.dim}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, color: palette.dim }}>?</div>
      ) : (
        <div key={i} style={{ position: "absolute", left: (i % 4) * 92 + jx, top: Math.floor(i / 4) * 92, width: 88, height: 88, borderRadius: 8, background: color }} />
      );
    })}
  </div>
);

// 0 · a story closed: the last page, 剧终 — and only now can it be read.
// 1 · two puzzles: the past, every piece in place; the present, gaps and shaking pieces.
// 2 · back on the road: behind him sharp, ahead fog.
export const EndedScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const seg = (i: number) => frame >= cues[i] && (i + 1 >= cues.length || frame < cues[i + 1]);
  const segIn = (i: number) => interpolate(frame, [cues[i], cues[i] + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const close = interpolate(frame, [BEAT, 3 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t * (3 - 2 * t) });
  const stamp = frame >= 3 * BEAT;
  const t2 = frame - cues[2];
  return (
    <ObsFrame duration={duration}>
      {seg(0) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(0) }}>
          <div style={{ position: "absolute", left: 960 - 300, top: 240, width: 600, height: 420, perspective: 1400 }}>
            <div style={{ position: "absolute", left: 300, top: 0, width: 300, height: 420, background: "#e8dcc0", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 54, fontWeight: 900, color: "#5a3a1a" }}>剧终</div>
            <div style={{ position: "absolute", left: 300, top: 0, width: 300, height: 420, background: `linear-gradient(90deg, #b8935c, #8a6a3e)`, transformOrigin: "0 50%", transform: `rotateY(${-180 + close * 180}deg)`, backfaceVisibility: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontSize: 30, color: "#2a1a0a" }}>THE END</div>
            <div style={{ position: "absolute", left: 0, top: 0, width: 300, height: 420, background: "#ddd0b2", opacity: 1 - close }} />
          </div>
          {stamp && <div style={{ position: "absolute", left: 1220, top: 360, padding: "10px 20px", border: `4px solid ${palette.accent}`, color: palette.accent, fontSize: 40, fontWeight: 900, transform: "rotate(-10deg)" }}>已结束 · 看得懂</div>}
        </div>
      )}
      {seg(1) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(1) }}>
          <div style={{ position: "absolute", left: 300, top: 200, fontSize: 36, fontWeight: 900, color: `rgb(${SEPIA})` }}>过去 · 结局已定</div>
          <div style={{ position: "absolute", left: 1220, top: 200, fontSize: 36, fontWeight: 900, color: "rgba(200,208,220,0.85)" }}>当下 · 还在发生</div>
          <Puzzle x={290} y={290} missing={[]} frame={frame} color={`rgba(${SEPIA},0.85)`} />
          <Puzzle x={1210} y={290} missing={[1, 4, 6, 9, 11]} frame={frame} color="#4a5468" jitter={10} />
          <div style={{ position: "absolute", left: 1210, top: 600, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: palette.alert }}>未知 · 不安</div>
        </div>
      )}
      {seg(2) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(2) }}>
          <Road frame={frame} />
          <Walker x={walkX(t2, 860)} bottom={FLOOR} face="left" walk={stride(t2)} lean={-3} />
          <RoadLabels />
        </div>
      )}
      <Sfx name="whoosh" at={BEAT} volume={0.35} />
      <Sfx name="stamp" at={3 * BEAT} volume={0.6} />
      {[2, 4, 6, 8].map((b) => (
        <Sfx key={b} name="glitch" at={cues[1] + b * BEAT} volume={0.15} />
      ))}
      {Array.from({ length: 9 }, (_, k) => (
        <Sfx key={`s${k}`} name="step" at={cues[2] + (k + 1) * BEAT} volume={0.15} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
