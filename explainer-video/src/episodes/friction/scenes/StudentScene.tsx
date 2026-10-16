import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Seated, Tangle } from "../tangle";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const FLOOR = 780;

// 0 · split: 静坐 — still water, a calm line over the head; 遇事 — the same
//     person, the water churned, a tangle exploding overhead.
// 1 · two practice logs: 静中养心 — full of ticks; 事上用功 — empty.
// 2 · a blade that has never touched the stone: rough, dull — 磨过：0 次.
export const StudentScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const seg = (i: number) => frame >= cues[i] && (i + 1 >= cues.length || frame < cues[i + 1]);
  const segIn = (i: number) => interpolate(frame, [cues[i], cues[i] + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t0 = frame - cues[0];
  const hit = interpolate(t0, [5 * BEAT, 6 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const water = (x0: number, w: number, k: number) => (
    <svg width={w} height={60} style={{ position: "absolute", left: x0, top: FLOOR - 10 }}>
      <path d={`M0 30 ${Array.from({ length: 24 }, (_, i) => `Q ${i * (w / 24) + w / 48} ${30 + Math.sin(frame / 4 + i * 1.7) * 18 * k} ${(i + 1) * (w / 24)} 30`).join(" ")}`} fill="none" stroke={palette.accent} strokeWidth={2.5} opacity={0.7} />
    </svg>
  );
  return (
    <ObsFrame duration={duration}>
      {seg(0) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(0) }}>
          <Horizon y={FLOOR} />
          <div style={{ position: "absolute", left: 959, top: 140, width: 2, height: 640, background: palette.faint }} />
          <div style={{ position: "absolute", left: 0, width: 960, top: 160, textAlign: "center", fontSize: 40, fontWeight: 900, color: palette.accent }}>静坐 · 心里很好</div>
          <div style={{ position: "absolute", left: 960, width: 960, top: 160, textAlign: "center", fontSize: 40, fontWeight: 900, color: palette.alert, opacity: 0.4 + 0.6 * hit }}>一遇到事 · 就乱了</div>
          {water(160, 640, 0.05)}
          <svg width={600} height={40} style={{ position: "absolute", left: 180, top: 320 }}>
            <line x1={0} y1={20} x2={600} y2={20} stroke={`rgba(${palette.halo},0.7)`} strokeWidth={3} />
          </svg>
          <Seated x={560} floor={FLOOR} scale={1.1} glow={0.7} />
          {water(1120, 640, 0.2 + hit)}
          <Tangle cx={1440} cy={330} r={60 + 160 * hit} frame={frame} threads={10} churn={1 + hit} rows={{ x0: 1200, x1: 1700, y: 330, gap: 10 }} />
          <Seated x={1520} floor={FLOOR} scale={1.1} glow={0.5} slump={hit} />
        </div>
      )}
      {seg(1) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(1) }}>
          {[
            { x: 360, title: "静中养心", n: 28, color: palette.accent },
            { x: 1020, title: "事上用功", n: 0, color: palette.alert },
          ].map((p) => (
            <div key={p.title} style={{ position: "absolute", left: p.x, top: 170, width: 540, height: 560, background: "#ece8e0", color: "#1a1714", padding: "30px 36px", boxSizing: "border-box" }}>
              <div style={{ fontSize: 40, fontWeight: 900, marginBottom: 20 }}>{p.title}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {Array.from({ length: 28 }, (_, i) => (
                  <div key={i} style={{ width: 52, height: 52, border: "2px solid rgba(26,23,20,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "#0f8f84" }}>
                    {i < p.n && i < Math.floor((frame - cues[1]) / 2) ? "✓" : ""}
                  </div>
                ))}
              </div>
              <div style={{ position: "absolute", left: 36, bottom: 24, fontFamily: fonts.mono, fontSize: 26, color: p.n ? "#0f8f84" : "#b2283e" }}>{p.n ? "每天 ✓" : "0 次"}</div>
            </div>
          ))}
        </div>
      )}
      {seg(2) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(2) }}>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <g transform="translate(560 420)">
              <rect x={-220} y={-6} width={220} height={60} rx={14} fill="#5a3a22" />
              <path d={`M0 0 ${Array.from({ length: 22 }, (_, i) => `L${i * 28 + 14} ${i % 2 ? 6 : -4}`).join(" ")} L640 20 L620 50 L0 50 Z`} fill="#8a949e" stroke="#b8c2cc" strokeWidth={2} />
            </g>
            <rect x={600} y={600} width={600} height={60} rx={8} fill="#3a3a3a" stroke="#6a6a6a" />
          </svg>
          <div style={{ position: "absolute", left: 600, top: 680, width: 600, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 4, color: palette.dim }}>磨刀石 · 从未用过</div>
          <div style={{ position: "absolute", left: 1320, top: 360, fontFamily: fonts.mono, color: palette.dim, fontSize: 22, letterSpacing: 4 }}>
            事上磨过
            <div style={{ fontSize: 100, fontWeight: 700, color: palette.alert }}>0 次</div>
          </div>
        </div>
      )}
      <Sfx name="glitch" at={cues[0] + 5 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={cues[0] + 5 * BEAT} volume={0.3} />
      <Sfx name="shutter" at={cues[1]} volume={0.3} />
      <Sfx name="stamp" at={cues[2] + 2 * BEAT} volume={0.5} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
