import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Checklist, INK, TODO, WARM } from "../checklist";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// 0 · the list, every line ticked — and beside it a gauge: 快乐, nearly empty.
// 1 · a balance: on one pan a tall stack of lists — 有用的事 — and the other
//     pan, 没用的东西, empty and high.
// 2 · what goes on the empty pan, drifting in warm: 一次发呆 (a cloud going
//     by) · 一场漫无目的的散步 (footprints wandering anywhere) · 一个没有结果
//     的下午 (the sun crossing a window).
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : 2;
  const card = (i: number) => ramp(frame, c2 + 4 * BEAT + i * 2 * BEAT, 10);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} whips={[c1, c2]} hits={[c1 + BEAT, ...[0, 1, 2].map((i) => c2 + 4 * BEAT + i * 2 * BEAT), ...keyHits(lines, cues, duration)]}>
        {seg === 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Checklist x={520} y={160} done={TODO.length} />
            <div style={{ position: "absolute", left: 1150, top: 220, width: 60, height: 460, borderRadius: 30, border: `3px solid rgba(${INK},0.4)`, overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${8 * ramp(frame, 4, 20)}%`, background: `rgb(${WARM})` }} />
            </div>
            <div style={{ position: "absolute", left: 1100, width: 160, top: 700, textAlign: "center", fontFamily: fonts.mono, fontSize: 26, color: palette.dim }}>快乐 8%</div>
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <line x1={960} y1={260} x2={960} y2={800} stroke={`rgba(${INK},0.5)`} strokeWidth={8} />
              <g transform={`rotate(${-14 * ramp(frame, c1 + BEAT, 12)} 960 300)`}>
                <line x1={560} y1={300} x2={1360} y2={300} stroke={`rgba(${INK},0.6)`} strokeWidth={8} />
                <line x1={560} y1={300} x2={560} y2={480} stroke={`rgba(${INK},0.4)`} strokeWidth={2} />
                <line x1={1360} y1={300} x2={1360} y2={480} stroke={`rgba(${INK},0.4)`} strokeWidth={2} />
                <path d="M460 480 Q560 520 660 480 Z" fill="#2a2f38" />
                <path d="M1260 480 Q1360 520 1460 480 Z" fill="#2a2f38" />
                {Array.from({ length: 9 }, (_, i) => <rect key={i} x={1300 + (i % 2) * 6} y={466 - i * 16} width={110} height={14} fill="#efe8d8" stroke="#262019" strokeWidth={1} />)}
              </g>
            </svg>
            <div style={{ position: "absolute", left: 1220, top: 560, fontSize: 36, fontWeight: 900, color: palette.ink }}>有用的事</div>
            <div style={{ position: "absolute", left: 410, top: 360, fontSize: 36, fontWeight: 900, color: palette.dim }}>没用的东西</div>
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: fonts.mono, fontSize: 26, letterSpacing: 10, color: `rgb(${WARM})`, opacity: ramp(frame, c2 + 4, 10) }}>让人快乐的 · 往往没用</div>
            {[0, 1, 2].map((i) => {
              const x = 230 + i * 520;
              return (
                <div key={i} style={{ position: "absolute", left: x, top: 280, width: 440, height: 380, borderRadius: 20, background: `rgba(${WARM},0.1)`, border: `2px solid rgba(${WARM},0.6)`, opacity: card(i), transform: `translateY(${(1 - card(i)) * 40}px)` }}>
                  <Halo x={220} y={150} r={160} intensity={0.5} rgb={WARM} />
                  <svg width={440} height={260} style={{ position: "absolute", left: 0, top: 0 }}>
                    {i === 0 && <path transform={`translate(${((frame - c2) * 1.2) % 300 - 60} 0)`} d="M100 150 Q100 110 140 110 Q160 80 200 95 Q240 85 250 120 Q285 125 280 150 Z" fill="rgba(255,255,255,0.8)" />}
                    {i === 1 && Array.from({ length: 12 }, (_, k) => <ellipse key={k} cx={60 + k * 28} cy={130 + Math.sin(k * 1.3 + random("fw") * 6) * 50} rx={7} ry={11} fill={`rgba(${WARM},${k * 30 < (frame - c2 - 6 * BEAT) * 6 ? 0.85 : 0.1})`} />)}
                    {i === 2 && (
                      <>
                        <rect x={100} y={50} width={240} height={180} fill="none" stroke={`rgba(${INK},0.5)`} strokeWidth={4} />
                        <line x1={220} y1={50} x2={220} y2={230} stroke={`rgba(${INK},0.4)`} strokeWidth={3} />
                        <circle cx={120 + 200 * Math.min(1, Math.max(0, (frame - c2 - 8 * BEAT) / 90))} cy={110} r={24} fill={`rgb(${WARM})`} />
                      </>
                    )}
                  </svg>
                  <div style={{ position: "absolute", left: 0, right: 0, top: 280, textAlign: "center", fontSize: 32, fontWeight: 900, color: palette.ink }}>{["一次发呆", "一场漫无目的的散步", "一个没有结果的下午"][i]}</div>
                </div>
              );
            })}
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={WARM} opacity={seg === 2 ? 0.5 : 0.25} />
      <Sfx name="glitch" at={8} volume={0.15} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.45} />
      <Sfx name="stamp" at={c1 + BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.45} />
      {[0, 1, 2].map((i) => (
        <Sfx key={i} name="glint" at={c2 + 4 * BEAT + i * 2 * BEAT} volume={0.3} />
      ))}
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
