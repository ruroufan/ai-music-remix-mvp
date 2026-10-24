import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Stander } from "../../doubt/circles";
import { Walker } from "../../nostalgia/road";
import { Bokeh, Cam } from "../../glass/immersive";
import { GOLD, RED } from "../blueprint";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const FLOOR = 740;
const VISITED = ["政客", "诗人", "工匠"];
const MARBLE = "232, 226, 212";

const Columns: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity }}>
    <path d={`M520 230 L960 130 L1400 230 Z`} fill="none" stroke={`rgba(${MARBLE},0.5)`} strokeWidth={3} />
    <rect x={520} y={230} width={880} height={20} fill={`rgba(${MARBLE},0.25)`} />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <g key={i}>
        <rect x={560 + i * 160} y={250} width={40} height={FLOOR - 270} fill={`rgba(${MARBLE},0.12)`} stroke={`rgba(${MARBLE},0.35)`} strokeWidth={1.5} />
        {[1, 2, 3].map((k) => <line key={k} x1={560 + i * 160 + k * 10} y1={256} x2={560 + i * 160 + k * 10} y2={FLOOR - 26} stroke={`rgba(${MARBLE},0.15)`} />)}
      </g>
    ))}
    <rect x={500} y={FLOOR - 20} width={920} height={20} fill={`rgba(${MARBLE},0.2)`} />
  </svg>
);

// 0 · Athens: a portico, and in front of it Socrates, a laurel of light over
//     him — 雅典最有智慧的人.
// 1 · the people he visited — 政客 · 诗人 · 工匠 — each sure: 我知道 ✓; one per
//     beat a red stamp lands on them: 其实并不知道.
// 2 · and him: an empty outline of a head, nothing filled in, one glowing ？ —
//     承认自己的无知.
// 3 · a conversation: he only asks — a ？ per beat — and the other person walks,
//     step by step, on their own, up to a light: 答案.
export const SocratesScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2, c3] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : frame < c3 ? 2 : 3;
  const walk = interpolate(frame, [c3 + BEAT, duration - BEAT], [0, 1], clamp);
  const qs = Math.max(0, Math.min(6, Math.floor((frame - c3) / BEAT) + 1));
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1, c2, c3]} hits={[...VISITED.map((_, i) => c1 + (2 + i) * BEAT), ...keyHits(lines, cues, duration)]}>
        {seg === 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Columns opacity={ramp(frame, 0, 12)} />
            <Halo x={960} y={FLOOR - 280} r={240} intensity={0.6} rgb={GOLD} />
            <Stander x={960} bottom={FLOOR} height={300} lift={1} glow={0.9} rgb={MARBLE} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 290, textAlign: "center", fontSize: 40, fontWeight: 900, color: look.key, opacity: ramp(frame, BEAT, 10), textShadow: `0 0 16px ${look.keyGlow}` }}>雅典最有智慧的人</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 350, textAlign: "center", fontFamily: fonts.mono, fontSize: 20, letterSpacing: 6, color: palette.dim, opacity: ramp(frame, 2 * BEAT, 10) }}>—— 德尔斐神谕</div>
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            {VISITED.map((v, i) => {
              const x = 480 + i * 480;
              const stamp = ramp(frame, c1 + (2 + i) * BEAT, 6);
              return (
                <div key={v} style={{ position: "absolute", inset: 0, opacity: ramp(frame, c1 + i * 6, 8) }}>
                  <Stander x={x} bottom={FLOOR} height={260} lift={1.7} glow={0.6} />
                  <div style={{ position: "absolute", left: x - 100, width: 200, top: FLOOR - 400, textAlign: "center" }}>
                    <div style={{ display: "inline-block", padding: "8px 20px", borderRadius: 18, border: `2px solid rgba(${GOLD},0.7)`, fontSize: 28, fontWeight: 800, color: look.key }}>我知道 ✓</div>
                  </div>
                  <div style={{ position: "absolute", left: x - 100, width: 200, top: FLOOR - 460, textAlign: "center", fontSize: 30, fontWeight: 900 }}>{v}</div>
                  {stamp > 0 && (
                    <div style={{ position: "absolute", left: x - 140, top: FLOOR - 230, width: 280, padding: "8px 0", textAlign: "center", border: `5px solid rgb(${RED})`, borderRadius: 10, fontSize: 32, fontWeight: 900, color: `rgb(${RED})`, background: "rgba(11,15,21,0.6)", transform: `rotate(-10deg) scale(${2 - stamp})`, opacity: stamp }}>其实并不知道</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Halo x={960} y={400} r={320} intensity={0.5} rgb={GOLD} />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <path d="M820 760 Q820 560 960 540 Q1100 560 1100 760" fill="none" stroke={`rgba(${MARBLE},0.7)`} strokeWidth={3} />
              <circle cx={960} cy={400} r={120} fill="none" stroke={`rgba(${MARBLE},0.7)`} strokeWidth={3} strokeDasharray="10 8" />
              <text x={960} y={445} textAnchor="middle" fontSize={130} fontWeight={900} fill={`rgb(${GOLD})`} style={{ filter: `drop-shadow(0 0 20px rgba(${GOLD},0.9))` }} opacity={ramp(frame, c2 + BEAT, 8)}>？</text>
            </svg>
            <div style={{ position: "absolute", left: 1200, top: 360, fontFamily: fonts.mono, fontSize: 24, letterSpacing: 4, color: palette.dim, lineHeight: 1.9, opacity: ramp(frame, c2 + 2 * BEAT, 8) }}>
              <div>已知：<span style={{ color: palette.ink }}>—</span></div>
              <div>
                无知：<span style={{ color: look.key }}>承认</span>
              </div>
            </div>
            <div style={{ position: "absolute", left: 300, top: 360, fontSize: 30, fontWeight: 900, color: palette.dim, opacity: 0.6 }}>他们：我知道 ✓✓✓</div>
          </div>
        )}
        {seg === 3 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Halo x={1640} y={FLOOR - 160} r={260} intensity={0.3 + 0.6 * walk} rgb={GOLD} />
            <div style={{ position: "absolute", left: 1560, top: FLOOR - 200, width: 160, textAlign: "center", fontSize: 40, fontWeight: 900, color: look.key, textShadow: `0 0 18px ${look.keyGlow}` }}>答案</div>
            <Stander x={360} bottom={FLOOR} height={280} lift={1} glow={0.8} rgb={MARBLE} />
            {Array.from({ length: qs }, (_, k) => (
              <div key={k} style={{ position: "absolute", left: 420 + k * 26, top: FLOOR - 360 - k * 16, fontSize: 40, fontWeight: 900, color: `rgba(${MARBLE},${1 - k * 0.12})` }}>？</div>
            ))}
            <Walker x={640 + 900 * walk} bottom={FLOOR} height={250} face="right" walk={walk * 40} glow={0.7} />
            <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR + 10, height: 2, background: "linear-gradient(90deg, transparent, rgba(232,238,242,0.15), transparent)" }} />
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} opacity={0.6} />
      <Sfx name="glint" at={BEAT} volume={0.35} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.45} />
      {VISITED.map((_, i) => (
        <Sfx key={i} name="stamp" at={c1 + (2 + i) * BEAT} volume={0.5} />
      ))}
      <Sfx name="whoosh" at={c2 - 3} volume={0.45} />
      <Sfx name="glint" at={c2 + BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c3 - 3} volume={0.45} />
      {[0, 1, 2, 3, 4, 5].map((k) => (
        <Sfx key={`q${k}`} name="shutter" at={c3 + k * BEAT} volume={0.12} />
      ))}
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
