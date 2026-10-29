import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { COOL, LAMP, PoliteWall } from "../lantern";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const SAYABLE = ["今天天气不错", "工作挺顺利", "周末去哪", "最近在看一本书"];
const NOTES = ["我很好 :)", "谢谢关心", "没关系的", "都还行"];

// Wittgenstein, and what INFJ does with him.
// 0 · a line down the middle. Left, 可以说的 — plain words, clearly lit.
//     Right, 不可说的 — dark; one finger to the lips. 保持沉默.
// 1 · him, and inside his chest a tangle of light — every feeling knotted
//     into every other: 说不清. The tangle dims; his mouth is a line. 沉默.
// 2 · seen from outside: a wall goes up in front of him, course by course —
//     neat, quiet, with polite little notes pinned on it: 我很好 :) ·
//     谢谢关心. 你世界的边界.
export const WittgensteinScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : 2;
  const line = ramp(frame, 4, 12);
  const hush = ramp(frame, 6 * BEAT, 10);
  const knot = ramp(frame, c1 + 4, 12);
  const dim = ramp(frame, c1 + 5 * BEAT, 12);
  const wall = interpolate(frame, [c2 + 4, c2 + 5 * BEAT], [0, 1], clamp);
  const sign = ramp(frame, c2 + 5 * BEAT, 8);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} whips={[c1, c2]} hits={[6 * BEAT, c1 + 5 * BEAT, c2 + 5 * BEAT, ...keyHits(lines, cues, duration)]}>
        {seg === 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 958, top: 140, width: 4, height: 720 * line, background: `rgba(${COOL},0.7)` }} />
            <div style={{ position: "absolute", left: 960, top: 120, width: 960, height: 800, background: `rgba(0,0,0,${0.35 + 0.4 * hush})` }} />
            <div style={{ position: "absolute", left: 200, top: 170, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 8, color: `rgb(${LAMP})`, opacity: line }}>可以说的 · 说清楚</div>
            {SAYABLE.map((w, i) => (
              <div key={w} style={{ position: "absolute", left: 220 + (i % 2) * 260, top: 280 + i * 110, fontSize: 40, fontWeight: 900, color: palette.ink, opacity: ramp(frame, 10 + i * 8, 8), textShadow: `0 0 14px rgba(${LAMP},0.6)` }}>{w}</div>
            ))}
            <div style={{ position: "absolute", left: 1180, top: 170, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 8, color: palette.dim, opacity: line }}>不可说的 · ？</div>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: hush }}>
              <path d="M1340 560 Q1440 600 1540 560" fill="none" stroke="rgba(232,238,242,0.6)" strokeWidth={6} strokeLinecap="round" />
              <rect x={1432} y={430} width={20} height={170} rx={10} fill="#030405" stroke={`rgba(${COOL},0.7)`} strokeWidth={2} />
            </svg>
            <div style={{ position: "absolute", left: 1260, width: 360, top: 660, textAlign: "center", fontSize: 44, fontWeight: 900, color: palette.dim, opacity: hush, letterSpacing: 10 }}>保持沉默</div>
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Stander x={960} bottom={960} height={640} lift={0} glow={0.4} rgb={COOL} />
            <Halo x={960} y={600} r={260} intensity={(0.9 - 0.75 * dim) * knot} rgb={LAMP} />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: knot }}>
              {Array.from({ length: 14 }, (_, i) => {
                const a = random(`k${i}`) * 6.28, b = random(`k2${i}`) * 6.28, r1 = 30 + random(`r${i}`) * 80;
                const sp = (frame - c1) / 20 + i;
                const p = (t: number) => `${960 + Math.cos(t) * r1} ${600 + Math.sin(t * 1.3) * r1 * 0.8}`;
                return <path key={i} d={`M${p(a + sp * 0.1)} Q${p(b)} ${p(a + b + sp * 0.07)} T${p(b + sp * 0.05)}`} fill="none" stroke={`rgba(${LAMP},${0.9 - 0.7 * dim})`} strokeWidth={2.5} />;
              })}
            </svg>
            {["委屈", "想念", "失望", "害怕", "其实……"].map((w, i) => (
              <div key={w} style={{ position: "absolute", left: [640, 1180, 600, 1220, 900][i], top: [460, 470, 660, 650, 800][i], fontSize: 30, fontWeight: 800, color: `rgba(${LAMP},${0.85 * (1 - dim)})`, opacity: ramp(frame, c1 + 4 + i * 5, 8) }}>{w}</div>
            ))}
            <div style={{ position: "absolute", left: 1300, top: 280, fontSize: 40, fontWeight: 900, color: palette.dim, opacity: knot * (1 - dim) }}>说不清</div>
            <div style={{ position: "absolute", left: 1300, top: 280, fontSize: 56, fontWeight: 900, letterSpacing: 12, color: palette.ink, opacity: dim }}>沉默</div>
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Stander x={960} bottom={840} height={300} lift={0} glow={0.4} rgb={COOL} opacity={1 - 0.7 * wall} />
            <PoliteWall x={460} w={1000} bottom={860} rows={9} k={wall} />
            {NOTES.map((n, i) => (
              <div key={n} style={{ position: "absolute", left: 540 + i * 230, top: 520 + (i % 2) * 90, padding: "8px 16px", background: "#e8e2d4", color: "#1a1a1a", fontSize: 26, fontWeight: 800, transform: `rotate(${(i % 2 ? 4 : -4)}deg) scale(${0.8 + 0.2 * ramp(frame, c2 + 5 * BEAT + i * 4, 6)})`, opacity: ramp(frame, c2 + 5 * BEAT + i * 4, 6), boxShadow: "0 4px 10px rgba(0,0,0,0.5)" }}>{n}</div>
            ))}
            <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: fonts.mono, fontSize: 26, letterSpacing: 10, color: `rgb(${COOL})`, opacity: sign }}>你世界的边界</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={LAMP} opacity={0.45} />
      <Sfx name="shutter" at={4} volume={0.2} />
      <Sfx name="boom" at={6 * BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.45} />
      <Sfx name="rise" at={c1 + 4} volume={0.25} />
      <Sfx name="stamp" at={c1 + 5 * BEAT} volume={0.35} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.45} />
      {Array.from({ length: 9 }, (_, i) => (
        <Sfx key={i} name="step" at={Math.round(c2 + 4 + (i * (5 * BEAT - 4)) / 9)} volume={0.2} />
      ))}
      {NOTES.map((_, i) => (
        <Sfx key={`n${i}`} name="shutter" at={c2 + 5 * BEAT + i * 4} volume={0.15} />
      ))}
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
