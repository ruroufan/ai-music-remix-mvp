import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Stander } from "../../doubt/circles";
import { Friend } from "../../appearance/faces";
import { Cone, Lamp } from "../lights";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const STUDENTS = Array.from({ length: 12 }, (_, i) => ({ x: 1150 + (i % 4) * 165, y: 390 + Math.floor(i / 4) * 130 }));
const IMAGINED = [0, 2, 3, 5, 8, 10]; // half the room, in his head
const NOTICED = [1, 6, 11]; // a quarter, really

// The embarrassing T-shirt: a retro singer, big hair, shades, a microphone.
const Shirt: React.FC<{ x: number; y: number; s?: number; opacity?: number }> = ({ x, y, s = 1, opacity = 1 }) => (
  <svg width={300 * s} height={300 * s} viewBox="0 0 300 300" style={{ position: "absolute", left: x - 150 * s, top: y - 150 * s, opacity, overflow: "visible" }}>
    <path d="M90 20 L60 30 L10 80 L45 120 L70 100 L70 290 L230 290 L230 100 L255 120 L290 80 L240 30 L210 20 Q150 60 90 20 Z" fill="#e8e2d4" stroke="#7a7062" strokeWidth={3} />
    <g transform="translate(150 165)">
      <circle r={62} fill="#f2b8c6" stroke="#c2577a" strokeWidth={3} />
      {/* big hair */}
      <path d="M-50 -10 C-70 -60 -20 -80 0 -62 C20 -82 72 -60 50 -10 C52 -40 30 -48 0 -44 C-30 -48 -52 -40 -50 -10 Z" fill="#5a3418" />
      <circle cx={0} cy={2} r={30} fill="#f0c8a8" />
      {/* shades */}
      <rect x={-26} y={-8} width={22} height={11} rx={4} fill="#14181e" />
      <rect x={4} y={-8} width={22} height={11} rx={4} fill="#14181e" />
      <path d="M-10 18 Q0 24 10 18" stroke="#7a3a2a" strokeWidth={3} fill="none" />
      {/* the microphone */}
      <line x1={34} y1={30} x2={52} y2={60} stroke="#3a3f48" strokeWidth={6} />
      <circle cx={30} cy={24} r={9} fill="#9aa3ad" />
      <text x={0} y={92} textAnchor="middle" fontSize={20} fontWeight={900} fill="#c2577a" fontFamily="sans-serif">★ SUPERSTAR ★</text>
    </g>
  </svg>
);

const Eye: React.FC<{ x: number; y: number; p: number; dashed?: boolean; color: string }> = ({ x, y, p, dashed, color }) => (
  <svg width={64} height={34} viewBox="-32 -17 64 34" style={{ position: "absolute", left: x - 32, top: y - 17, opacity: p, transform: `scale(${0.6 + 0.4 * p})`, overflow: "visible" }}>
    <path d="M-28 0 Q0 -22 28 0 Q0 22 -28 0 Z" fill={dashed ? "none" : "rgba(6,8,12,0.85)"} stroke={color} strokeWidth={3} strokeDasharray={dashed ? "5 4" : undefined} />
    {!dashed && <circle r={8} fill={color} />}
  </svg>
);

// 0 · the study's card: Cornell, 2000.
// 1 · the T-shirt (a has-been singer, big hair, shades); then a classroom, the
//     students in rows, and him at the front, wearing it, under a light.
// 2 · what he thinks: 一半的人 — half the room's eyes on him (dashed, imagined).
//     他以为 ≈ 50%.
// 3 · what was so: the imagined eyes go; three real ones are left. 实际 ≈ 25%.
export const ExperimentScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2, c3] = cues;
  const lab = ramp(frame, 0, 10) * (1 - ramp(frame, c1 - 4, 6));
  const shirt = ramp(frame, c1, 10);
  const room = ramp(frame, c1 + 4 * BEAT, 12);
  const think = ramp(frame, c2, 8);
  const real = ramp(frame, c3, 8);
  const b1 = interpolate(frame, [c2 + 2 * BEAT, c2 + 4 * BEAT], [0, 0.5], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const b2 = interpolate(frame, [c3 + 2 * BEAT, c3 + 4 * BEAT], [0, 0.24], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const bar = (label: string, v: number, color: string, y: number, tag: string, p: number) => (
    <div style={{ position: "absolute", left: 160, top: y, width: 680, opacity: p }}>
      <div style={{ fontSize: 26, fontWeight: 800, color: palette.ink, marginBottom: 10 }}>{label}</div>
      <div style={{ position: "relative", height: 30, borderRadius: 6, background: "rgba(232,238,242,0.08)", border: `1px solid ${palette.faint}` }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${v * 100}%`, borderRadius: 6, background: color, boxShadow: `0 0 16px ${color}` }} />
        <div style={{ position: "absolute", left: `calc(${v * 100}% + 14px)`, top: -2, fontFamily: fonts.mono, fontSize: 26, color }}>{tag}</div>
      </div>
    </div>
  );
  return (
    <ObsFrame duration={duration}>
      {lab > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: lab, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, paddingBottom: 160 }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim }}>CORNELL UNIVERSITY · 2000</div>
          <div style={{ fontSize: 84, fontWeight: 900, letterSpacing: 10 }}>尴尬 T 恤实验</div>
          <div style={{ fontFamily: fonts.mono, fontSize: 18, letterSpacing: 4, color: `rgb(${palette.halo})`, padding: "6px 14px", border: `1px solid rgba(${palette.halo},0.6)` }}>GILOVICH · MEDVEC · SAVITSKY</div>
        </div>
      )}
      {frame >= c1 - 4 && (
        <div style={{ position: "absolute", inset: 0, opacity: shirt }}>
          <Shirt x={500 + 0 * room} y={360} s={1.25 - 0.25 * room} />
          <div style={{ position: "absolute", left: 500 - 150, width: 300, top: 560 - 40 * room, textAlign: "center", fontSize: 28, fontWeight: 800, color: palette.ink, opacity: 1 - think }}>过气歌星 T 恤</div>
          {room > 0 && (
            <div style={{ position: "absolute", inset: 0, opacity: room }}>
              <div style={{ position: "absolute", left: 1100, top: 170, width: 640, height: 80, borderRadius: 6, background: "#1f3329", border: "3px solid #5a4a36" }} />
              <div style={{ position: "absolute", left: 1100, width: 640, top: 196, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, color: "rgba(232,238,242,0.6)" }}>PSYCH 101</div>
              {STUDENTS.map((s, i) => (
                <Friend key={i} x={s.x} y={s.y} s={1.25} tone={i} hair={i * 5} />
              ))}
              <Cone id="ex" x={960} y={170} aimX={960} floor={760} spread={110} on={0.8} />
              <Lamp x={960} y={170} floor={760} on={1} size={0.9} />
              <Stander x={960} bottom={760} height={280} lift={0.6} glow={1} rgb="255, 246, 226" />
              <Shirt x={960} y={600} s={0.32} />
            </div>
          )}
          {/* 2 · in his head */}
          {think > 0 && (
            <div style={{ position: "absolute", left: 690, top: 104, transform: `scale(${0.8 + 0.2 * think})`, opacity: think * (1 - real), padding: "12px 22px", borderRadius: 26, background: "rgba(232,238,242,0.1)", border: "2px dashed rgba(232,238,242,0.5)", fontSize: 28, fontWeight: 800, color: palette.ink, whiteSpace: "nowrap" }}>
              大概一半人<br />会注意到我…
            </div>
          )}
          {IMAGINED.map((k, j) => (
            <Eye key={k} x={STUDENTS[k].x} y={STUDENTS[k].y - 70} p={ramp(frame, c2 + BEAT + j * HALF_BEAT, 5) * (1 - real)} dashed color="rgba(255,77,109,0.9)" />
          ))}
          {NOTICED.map((k, j) => (
            <Eye key={k} x={STUDENTS[k].x} y={STUDENTS[k].y - 70} p={ramp(frame, c3 + BEAT + j * HALF_BEAT, 5)} color={look.key ?? palette.accent} />
          ))}
          {bar("他以为会注意到的人", b1, palette.alert, 620, "≈ 50%", think)}
          {bar("真正注意到的人", b2, look.key ?? palette.accent, 720, "≈ 25%", real)}
        </div>
      )}
      <Sfx name="whoosh" at={0} volume={0.3} />
      <Sfx name="stamp" at={c1} volume={0.45} />
      <Sfx name="step" at={c1 + 4 * BEAT} volume={0.3} />
      <Sfx name="shutter" at={c1 + 5 * BEAT} volume={0.3} />
      {IMAGINED.map((_, j) => (
        <Sfx key={j} name="glitch" at={c2 + BEAT + j * HALF_BEAT} volume={0.12} />
      ))}
      {NOTICED.map((_, j) => (
        <Sfx key={j} name="glint" at={c3 + BEAT + j * HALF_BEAT} volume={0.3} />
      ))}
      <Sfx name="stamp" at={c3 + 2 * BEAT} volume={0.5} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
