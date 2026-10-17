import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { KineticText } from "../../../components/Kinetic";
import { LightPool, Stander } from "../circles";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const FACTS = ["BERTRAND RUSSELL", "伯特兰 · 罗素", "1872 — 1970 · 英国哲学家", "THE TRIUMPH OF STUPIDITY · 1933"];

// A profile in a frame: a man with a pipe, the smoke curling up.
const Portrait: React.FC<{ frame: number }> = ({ frame }) => (
  <svg width={300} height={360} viewBox="0 0 250 300" style={{ position: "absolute", left: 470, top: 200, overflow: "visible" }}>
    <rect x={0} y={0} width={250} height={300} rx={12} fill="rgba(14,20,28,0.9)" stroke={`rgba(${palette.halo},0.55)`} strokeWidth={2} />
    <g fill="#030405" stroke={`rgba(${palette.halo},0.85)`} strokeWidth={1.8}>
      <path d="M40 300 Q46 232 104 222 Q156 226 176 300 Z" />
      <path d="M86 236 L84 196 L122 196 L124 236 Z" />
      <path d="M76 70 Q116 40 150 74 Q160 90 160 110 L172 130 L160 136 Q164 150 156 160 Q152 180 126 184 L96 200 Q60 196 56 140 Q52 92 76 70 Z" />
      {/* white hair, standing up */}
      <path d="M70 80 Q66 48 96 44 Q92 30 112 36 Q120 24 136 40 Q156 40 150 70 Q122 50 96 60 Q80 66 70 80 Z" fill={`rgba(232,238,242,0.55)`} />
      {/* the pipe */}
      <path d="M156 164 L196 172" strokeWidth={5} stroke="#2a1c12" />
      <rect x={192} y={146} width={18} height={28} rx={5} fill="#2a1c12" />
    </g>
    {[0, 1, 2].map((k) => {
      const t = (frame / 40 + k / 3) % 1;
      return (
        <path
          key={k}
          d={`M201 ${144 - t * 70} q ${10 + 8 * Math.sin(frame / 12 + k)} -14 0 -28 q ${-10 - 6 * Math.sin(frame / 9 + k)} -14 0 -28`}
          fill="none"
          stroke="rgba(232,238,242,0.5)"
          strokeWidth={2.4}
          strokeLinecap="round"
          opacity={Math.sin(t * Math.PI) * 0.8}
        />
      );
    })}
  </svg>
);

// 0 · a dossier: Russell, his dates, the 1933 essay — one fact per beat.
// 1 · the quote, half by half, as a card; under each half its picture: a
//     small pool with a man chin-up (确信 100%), a big one with a man looking
//     down, question marks all around its rim (怀疑 ???).
export const DiagnosisScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const file = useRamp(0, 10);
  const card = useRamp(cues[1], 8);
  const t1 = frame - cues[1];
  const a = cues[1] + 2 * BEAT;
  const b = cues[1] + 5 * BEAT;
  const small = useRamp(a, 10);
  const big = useRamp(b, 12);
  const sure = Math.round(interpolate(frame, [a + 4, a + 14], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const en = useRamp(cues[1] + 8 * BEAT, 12);
  return (
    <ObsFrame duration={duration}>
      {card < 1 && (
        <div style={{ position: "absolute", inset: 0, opacity: file * (1 - card), transform: `translateY(${-card * 40}px)` }}>
          <Halo x={620} y={380} r={360} intensity={0.5} />
          <Portrait frame={frame} />
          {FACTS.map((f, i) => {
            const p = interpolate(frame, [(i + 1) * BEAT * 0.75, (i + 1) * BEAT * 0.75 + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const name = i === 1;
            return (
              <div
                key={f}
                style={{
                  position: "absolute",
                  left: 860,
                  top: [250, 296, 400, 470][i],
                  opacity: p,
                  transform: `translateX(${(1 - p) * 30}px)`,
                  fontFamily: name ? undefined : fonts.mono,
                  fontSize: name ? 72 : 22,
                  fontWeight: name ? 900 : 400,
                  letterSpacing: name ? 6 : 5,
                  color: i === 3 ? `rgb(${palette.halo})` : name ? palette.ink : palette.dim,
                  padding: i === 3 ? "8px 16px" : 0,
                  border: i === 3 ? `1px solid rgba(${palette.halo},0.6)` : undefined,
                  whiteSpace: "nowrap",
                }}
              >
                {f}
              </div>
            );
          })}
        </div>
      )}
      {t1 >= 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: card }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 128, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 5, color: palette.dim }}>BERTRAND RUSSELL · 1933</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 176, textAlign: "center", fontSize: 44, fontWeight: 700, color: palette.dim, letterSpacing: 4 }}>
            <KineticText text="这个世界的问题在于，" t={t1} look={look} beat={BEAT} seed="q0" />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontSize: 70, fontWeight: 900, letterSpacing: 6 }}>
            <KineticText text="愚蠢的人总是很【确信】，" t={frame - a} look={look} beat={BEAT} seed="q1" />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 356, textAlign: "center", fontSize: 70, fontWeight: 900, letterSpacing: 6 }}>
            <KineticText text="聪明的人却满是【【怀疑】】。" t={frame - b} look={look} beat={BEAT} seed="q2" />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 486, textAlign: "center", fontFamily: fonts.mono, fontSize: 19, letterSpacing: 3, color: palette.dim, opacity: en }}>
            “THE STUPID ARE COCKSURE WHILE THE INTELLIGENT ARE FULL OF DOUBT.”
          </div>
          {/* the two pools */}
          <div style={{ position: "absolute", inset: 0, opacity: small }}>
            <LightPool cx={620} cy={880} rx={120} frame={frame} beam={false} density={0.5} seed="ds" />
            <Stander x={620} bottom={880} height={170} lift={2} glow={0.9} />
            <div style={{ position: "absolute", left: 620 - 150, width: 300, top: 600, textAlign: "center", fontSize: 30, fontWeight: 800, color: palette.accent }}>
              确信 <span style={{ fontFamily: fonts.mono }}>{sure}%</span>
            </div>
          </div>
          <div style={{ position: "absolute", inset: 0, opacity: big }}>
            <LightPool cx={1300} cy={880} rx={330} frame={frame} beam={false} qs={big} seed="db" />
            <Stander x={1300} bottom={880} height={170} lift={0} glow={0.9} />
            <div style={{ position: "absolute", left: 1300 - 150, width: 300, top: 600, textAlign: "center", fontSize: 30, fontWeight: 800, color: look.key }}>
              怀疑 <span style={{ fontFamily: fonts.mono, opacity: 0.5 + 0.5 * Math.abs(Math.sin(frame / 5)) }}>???</span>
            </div>
          </div>
        </div>
      )}
      <Sfx name="whoosh" at={0} volume={0.3} />
      {FACTS.map((_, i) => (
        <Sfx key={i} name="shutter" at={Math.round((i + 1) * BEAT * 0.75)} volume={0.14} />
      ))}
      <Sfx name="stamp" at={cues[1]} volume={0.45} />
      <Sfx name="stamp" at={a} volume={0.55} />
      <Sfx name="glint" at={b + 8} volume={0.35} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[1]} />
    </ObsFrame>
  );
};
