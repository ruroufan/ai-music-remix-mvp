import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Person } from "../porcupine";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

// 0 · split: 被剩下 — everyone walks away from him; 自己选 — he walks out on his own, lit.
// 1 · three panels, one per phrase: a bowl to himself, a walk with his own
//     footprints, an afternoon of sun crossing one window. His outline sharpens in each.
export const SolitudeScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const seg0 = frame < cues[1];
  const t0 = frame;
  const away = interpolate(t0, [BEAT, 5 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t1 = frame - cues[1];
  const panelAt = (i: number) => i * 2 * BEAT + (i === 2 ? BEAT : 0);
  const panel = (i: number) => interpolate(t1, [panelAt(i), panelAt(i) + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const solid = (i: number) => interpolate(t1, [panelAt(i) + 4, panelAt(i) + 2 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const frameBox = (x: number, label: string, i: number, children: React.ReactNode) => (
    <div style={{ position: "absolute", left: x, top: 170, width: 500, height: 560, opacity: panel(i), border: `1px solid ${palette.faint}`, background: "rgba(10,14,21,0.9)", overflow: "hidden" }}>
      {children}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 20, textAlign: "center", fontSize: 28, fontWeight: 700, letterSpacing: 4 }}>{label}</div>
    </div>
  );

  return (
    <ObsFrame duration={duration}>
      {seg0 && (
        <div style={{ position: "absolute", inset: 0 }}>
          <div style={{ position: "absolute", left: 959, top: 150, width: 2, height: 650, background: palette.faint }} />
          <div style={{ position: "absolute", left: 0, width: 960, top: 180, textAlign: "center", fontSize: 44, fontWeight: 900, color: palette.dim }}>孤独 · 被剩下</div>
          <div style={{ position: "absolute", left: 960, width: 960, top: 180, textAlign: "center", fontSize: 44, fontWeight: 900, color: palette.accent }}>独处 · 自己选</div>
          {/* left: the others leave him */}
          {[-1, 1, -1, 1].map((d, i) => (
            <Person key={i} x={480 + d * (90 + i * 30 + away * (180 + i * 40))} bottom={760 - i * 12} height={190 - i * 10} flip={d < 0} glow={0.3} opacity={1 - away * 0.7} />
          ))}
          <Person x={480} bottom={760} height={210} pose="hunch" glow={0.25} ghost={0.4} />
          {/* right: he leaves, by choice, toward the light */}
          <div style={{ position: "absolute", left: 1640, top: 360, width: 120, height: 400, background: `linear-gradient(rgba(${palette.halo},0.7), rgba(${palette.halo},0.25))`, boxShadow: `0 0 60px rgba(${palette.halo},0.5)` }} />
          {[0, 1, 2].map((i) => (
            <Person key={`g${i}`} x={1120 + i * 70} bottom={760 - (i % 2) * 14} height={180} glow={0.25} opacity={0.6} />
          ))}
          <Person x={1300 + away * 260} bottom={760} height={210} glow={0.9} />
        </div>
      )}
      {!seg0 && (
        <div style={{ position: "absolute", inset: 0 }}>
          {frameBox(170, "一个人吃饭", 0, (
            <>
              <svg width={500} height={400} viewBox="0 0 500 400" style={{ position: "absolute", top: 60 }}>
                <path d="M150 230 Q250 330 350 230 Z" fill="#1c2330" stroke={`rgba(${palette.halo},0.8)`} strokeWidth={2} />
                <line x1={300} y1={150} x2={380} y2={240} stroke={`rgba(${palette.halo},0.8)`} strokeWidth={4} />
                <line x1={318} y1={140} x2={392} y2={236} stroke={`rgba(${palette.halo},0.8)`} strokeWidth={4} />
                {[0, 1, 2].map((k) => (
                  <path key={k} d={`M${215 + k * 35} 210 q -10 -20 0 -40 q 10 -20 0 -40`} fill="none" stroke="rgba(232,238,242,0.4)" strokeWidth={3} strokeDasharray="8 6" strokeDashoffset={-frame + k * 5} />
                ))}
              </svg>
              <div style={{ position: "absolute", left: 30, top: 24, fontFamily: fonts.mono, fontSize: 18, letterSpacing: 4, color: palette.dim }}>12:30 · 一人座</div>
              <div style={{ position: "absolute", left: 0, right: 0, top: 380, height: 4, background: `rgba(${palette.halo},${0.2 + 0.6 * solid(0)})` }} />
            </>
          ))}
          {frameBox(710, "一个人散步", 1, (
            <>
              {Array.from({ length: 8 }, (_, k) => (
                <div key={k} style={{ position: "absolute", left: 40 + k * 44, top: 430 - (k % 2) * 14, width: 12, height: 18, borderRadius: 6, background: "rgba(232,238,242,0.35)", opacity: t1 - panelAt(1) > k * 3 ? 1 : 0 }} />
              ))}
              <Person x={70 + Math.min(1, Math.max(0, (t1 - panelAt(1)) / (3 * BEAT))) * 320} bottom={-170 + 600} height={210} ghost={1 - solid(1)} glow={0.8} />
              <div style={{ position: "absolute", left: 30, top: 24, fontFamily: fonts.mono, fontSize: 18, letterSpacing: 4, color: palette.dim }}>18:05 · 江边</div>
            </>
          ))}
          {frameBox(1250, "一个人待一整个下午", 2, (
            <>
              <div style={{ position: "absolute", left: 130, top: 80, width: 240, height: 260, border: "4px solid #1e2632", background: "linear-gradient(#3a5a86, #e2a26e)" }} />
              {(() => {
                const k = Math.min(1, Math.max(0, (t1 - panelAt(2)) / (4 * BEAT)));
                return <div style={{ position: "absolute", left: 140 + k * 190, top: 260 - Math.sin(k * Math.PI) * 150, width: 30, height: 30, borderRadius: 15, background: "#ffd9a0", boxShadow: "0 0 30px #ffb070" }} />;
              })()}
              <Person x={250} bottom={500} height={150} ghost={1 - solid(2)} glow={0.9} />
              <div style={{ position: "absolute", left: 30, top: 24, fontFamily: fonts.mono, fontSize: 18, letterSpacing: 4, color: palette.dim }}>13:00 → 18:00</div>
            </>
          ))}
        </div>
      )}
      <Sfx name="step" at={2 * BEAT} volume={0.3} />
      <Sfx name="step" at={3 * BEAT} volume={0.3} />
      <Sfx name="step" at={4 * BEAT} volume={0.3} />
      {[0, 1, 2].map((i) => (
        <Sfx key={i} name="glint" at={cues[1] + i * 2 * BEAT + (i === 2 ? BEAT : 0)} volume={0.35} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
