import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo, Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Prick } from "../../solitude/porcupine";
import { Person } from "../../solitude/porcupine";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const FLOOR = 780;
const WALLET = { x: 620, y: 470 };
const GLASS = { x: 1300, y: 470 };

const Hourglass: React.FC<{ x: number; y: number; k: number; frame: number }> = ({ x, y, k, frame }) => (
  <svg width={200} height={300} viewBox="-100 -150 200 300" style={{ position: "absolute", left: x - 100, top: y - 150 }}>
    <rect x={-80} y={-150} width={160} height={14} rx={4} fill="#6b4a26" />
    <rect x={-80} y={136} width={160} height={14} rx={4} fill="#6b4a26" />
    <path d="M-60 -136 L60 -136 L8 0 L60 136 L-60 136 L-8 0 Z" fill="rgba(200,220,240,0.08)" stroke="rgba(200,220,240,0.5)" strokeWidth={2} />
    <path d={`M${-50 + 40 * k} ${-120 + 110 * k} L${50 - 40 * k} ${-120 + 110 * k} L6 -6 L-6 -6 Z`} fill="#e3c58a" />
    <path d={`M-52 132 L52 132 L${44 - 30 * k} ${132 - 80 * k} L${-44 + 30 * k} ${132 - 80 * k} Z`} fill="#e3c58a" />
    <line x1={0} y1={0} x2={0} y2={130} stroke="#e3c58a" strokeWidth={2} strokeDasharray="4 6" strokeDashoffset={-frame * 2} />
  </svg>
);

// 0 · two things on the table: a wallet (priced) and an hourglass (¥0 — free?).
// 1 · a hand takes ¥100: a jolt, "心疼！". A hand takes three hours of sand: nothing.
// 2 · "tomorrow there's a whole me to spend": a queue of identical selves stretching off.
export const FreeScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const t1 = frame - cues[1], t2 = frame - cues[2];
  const grab1 = interpolate(t1, [BEAT, 2 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const grab2 = interpolate(t1, [4 * BEAT, 5 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hand = (x: number, y: number, k: number) => {
    const reach = Math.sin(Math.min(1, k) * Math.PI);
    return (
      <div style={{ position: "absolute", left: x - 30, top: y - 320 + reach * 220, width: 60, height: 260, borderRadius: 30, background: "#141a24", border: `1px solid ${palette.faint}`, opacity: k > 0 && k < 1 ? 1 : 0 }} />
    );
  };
  const queue = frame >= cues[2] ? Math.min(9, Math.floor(t2 / HALF_BEAT) + 1) : 0;
  return (
    <ObsFrame duration={duration}>
      {frame < cues[2] && (
        <>
          <div style={{ position: "absolute", left: 360, top: 620, width: 1200, height: 18, background: "#2a2016" }} />
          <Halo x={960} y={480} r={460} intensity={0.35} />
          {/* wallet */}
          <div style={{ position: "absolute", left: WALLET.x - 120, top: WALLET.y + 20, width: 240, height: 130, borderRadius: 14, background: "linear-gradient(#5a3a22, #3a2414)", border: "2px solid #8a6a46" }} />
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} style={{ position: "absolute", left: WALLET.x - 90 + i * 34, top: WALLET.y - 20 - (i === 2 ? grab1 * 0 : 0), width: 44, height: 44, borderRadius: 22, background: "#e6c46a", border: "2px solid #a8842e", opacity: i === 2 ? 1 - grab1 : 1, transform: i === 2 ? `translateY(${-grab1 * 120}px)` : undefined }} />
          ))}
          <Hourglass x={GLASS.x} y={GLASS.y - 10} k={0.35 + grab2 * 0.35} frame={frame} />
          <div style={{ position: "absolute", left: WALLET.x - 120, width: 240, top: 690, textAlign: "center", fontFamily: fonts.mono, fontSize: 26, color: "#e6c46a" }}>金钱 · 有价</div>
          <div style={{ position: "absolute", left: GLASS.x - 120, width: 240, top: 690, textAlign: "center", fontFamily: fonts.mono, fontSize: 26, color: palette.dim }}>时间 · ¥0 ?</div>
          {hand(WALLET.x, WALLET.y, grab1)}
          {hand(GLASS.x, GLASS.y - 40, grab2)}
          {t1 >= 2 * BEAT && (
            <>
              <Prick x={WALLET.x} y={WALLET.y - 80} k={Math.max(0, 1 - (t1 - 2 * BEAT) / 20)} />
              <div style={{ position: "absolute", left: WALLET.x - 220, top: 220, width: 440, textAlign: "center", whiteSpace: "nowrap", fontSize: 48, fontWeight: 900, color: palette.alert }}>−¥100 心疼！</div>
            </>
          )}
          {t1 >= 5 * BEAT && (
            <div style={{ position: "absolute", left: GLASS.x - 160, top: 220, width: 320, textAlign: "center", fontSize: 48, fontWeight: 900, color: palette.dim }}>
              −3 小时 <span style={{ fontSize: 30 }}>……</span>
            </div>
          )}
        </>
      )}
      {frame >= cues[2] && (
        <>
          <Horizon y={FLOOR} />
          {Array.from({ length: queue }, (_, i) => {
            const k = i + 1;
            const s = Math.pow(0.86, k);
            return <Person key={k} x={520 + 200 * (1 - Math.pow(0.86, k)) / 0.14} bottom={FLOOR - (1 - s) * 140} height={250 * s} glow={0.3 * s} opacity={0.75 * s + 0.1} />;
          })}
          <Person x={420} bottom={FLOOR} height={250} glow={0.8} />
          <div style={{ position: "absolute", left: 340, top: FLOOR + 20, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.ink }}>今天的我</div>
          <div style={{ position: "absolute", left: 980, top: 330, fontFamily: fonts.mono, fontSize: 28, letterSpacing: 6, color: `rgb(${palette.halo})`, opacity: queue > 2 ? 1 : 0 }}>明天的我 ×∞ ?</div>
        </>
      )}
      <Sfx name="glint" at={cues[1] + BEAT} volume={0.3} />
      <Sfx name="stamp" at={cues[1] + 2 * BEAT} volume={0.6} />
      <Sfx name="whoosh" at={cues[1] + 4 * BEAT} volume={0.2} />
      {Array.from({ length: 9 }, (_, i) => (
        <Sfx key={i} name="step" at={cues[2] + i * HALF_BEAT} volume={0.12} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
