import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Walker } from "../../nostalgia/road";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Meeting, ROSE, SKY, WARM } from "../crack";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const FL = 700; // floor inside the panels

const Panel: React.FC<{ x: number; title: string; latin: string; lit: number; p: number }> = ({ x, title, latin, lit, p }) => (
  <div style={{ position: "absolute", left: x, top: 150, width: 800, height: 620, borderRadius: 18, border: `2px solid rgba(232,238,242,${0.12 + 0.3 * lit})`, background: `rgba(14,18,24,${0.5 + 0.3 * lit})`, opacity: p }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 24, textAlign: "center", fontSize: 48, fontWeight: 900, letterSpacing: 10, color: `rgba(232,238,242,${0.35 + 0.65 * lit})` }}>{title}</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 92, textAlign: "center", fontFamily: fonts.mono, fontSize: 20, letterSpacing: 6, color: palette.dim }}>{latin}</div>
  </div>
);

// Two panels side by side.
// 0 · the two titles: 我与它 · I–IT and 我与你 · I–THOU.
// 1 · 我与它 lights: him on one side, and the other person turned into a grey
//     box marked 它 — a pane of glass between them, a measured gap: 距离.
//     各自安好.
// 2 · 我与你 lights: the two of them face to face, close, nothing between.
// 3 · the camera moves into 我与你: between them a warm bloom — 相遇.
export const BuberScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2, c3] = cues;
  const p0 = ramp(frame, 4, 10);
  const itLit = interpolate(frame, [c1, c1 + 8, c2, c2 + 8], [0, 1, 1, 0.25], clamp);
  const youLit = interpolate(frame, [c2, c2 + 8], [0, 1], clamp);
  const box = ramp(frame, c1 + BEAT, 10);
  const glass = ramp(frame, c1 + 3 * BEAT, 8);
  const close = interpolate(frame, [c2 + BEAT, c2 + 4 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const meet = ramp(frame, c3 + 2 * BEAT, 14);
  const zoom = interpolate(frame, [c3, c3 + 2 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const S = 1 + 0.9 * zoom;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.04]} hits={[c1 + 3 * BEAT, c2 + 4 * BEAT, c3 + 2 * BEAT, ...keyHits(lines, cues, duration)]}>
        <div style={{ position: "absolute", inset: 0, transform: `scale(${S})`, transformOrigin: "1380px 500px" }}>
          <div style={{ position: "absolute", inset: 0, opacity: 1 - zoom }}>
            <Panel x={140} title="我与它" latin="I — IT" lit={itLit} p={p0} />
          </div>
          <Panel x={980} title="我与你" latin="I — THOU" lit={youLit} p={p0} />
          {/* I–It */}
          <div style={{ position: "absolute", inset: 0, opacity: (0.3 + 0.7 * itLit) * (1 - zoom) * p0 }}>
            <Walker x={300} bottom={FL} height={260} face="right" glow={0.3 + 0.3 * itLit} rgb={ROSE} />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <line x1={160} y1={FL} x2={920} y2={FL} stroke="rgba(232,238,242,0.2)" strokeWidth={2} />
              <g opacity={box}>
                <rect x={700} y={FL - 200} width={160} height={200} rx={6} fill="#2a2e36" stroke="rgba(170,180,195,0.6)" strokeWidth={3} />
              </g>
              <g opacity={glass}>
                <rect x={520} y={FL - 330} width={14} height={330} fill="rgba(180,220,240,0.12)" stroke="rgba(180,220,240,0.6)" strokeWidth={2} />
                <path d={`M360 ${FL + 30} L690 ${FL + 30} M360 ${FL + 20} L360 ${FL + 40} M690 ${FL + 20} L690 ${FL + 40}`} stroke="rgba(232,238,242,0.5)" strokeWidth={2} />
              </g>
            </svg>
            <div style={{ position: "absolute", left: 700, width: 160, top: FL - 140, textAlign: "center", fontSize: 64, fontWeight: 900, color: "rgba(200,206,215,0.85)", opacity: box }}>它</div>
            <div style={{ position: "absolute", left: 360, width: 330, top: FL + 46, textAlign: "center", fontFamily: fonts.mono, fontSize: 20, letterSpacing: 6, color: palette.dim, opacity: glass }}>距离</div>
          </div>
          {/* I–Thou */}
          <div style={{ position: "absolute", inset: 0, opacity: (0.3 + 0.7 * youLit) * p0 }}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <line x1={1000} y1={FL} x2={1760} y2={FL} stroke="rgba(232,238,242,0.2)" strokeWidth={2} />
            </svg>
            <Meeting x={1380} y={FL - 170} k={meet} frame={frame} />
            <Walker x={1170 + 130 * close} bottom={FL} height={260} face="right" glow={0.3 + 0.4 * youLit + 0.3 * meet} rgb={ROSE} />
            <Walker x={1590 - 130 * close} bottom={FL} height={260} face="left" glow={0.3 + 0.4 * youLit + 0.3 * meet} rgb={SKY} />
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 110, textAlign: "center", fontSize: 52, fontWeight: 900, letterSpacing: 14, color: `rgb(${WARM})`, opacity: meet }}>相 遇</div>
      </Cam>
      <Bokeh frame={frame} rgb={frame < c2 ? SKY : WARM} opacity={0.3} />
      <Sfx name="shutter" at={4} volume={0.2} />
      <Sfx name="stamp" at={c1 + BEAT} volume={0.3} />
      <Sfx name="glitch" at={c1 + 3 * BEAT} volume={0.25} />
      <Sfx name="whoosh" at={c2 + BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c3} volume={0.35} />
      <Sfx name="glint" at={c3 + 2 * BEAT} volume={0.45} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
