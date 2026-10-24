import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { LEAF, SUN } from "../field";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const COOL = "160, 186, 220";
const MONTHS = [1, 0.85, 0.6, 0.4, 0.25, 0.15];

const Guitar: React.FC<{ x: number; y: number; o: number }> = ({ x, y, o }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: o }}>
    <g transform={`translate(${x} ${y}) rotate(-30)`}>
      <ellipse cx={0} cy={60} rx={70} ry={60} fill="#5a3b24" stroke={`rgb(${SUN})`} strokeWidth={3} />
      <ellipse cx={0} cy={-10} rx={52} ry={46} fill="#5a3b24" stroke={`rgb(${SUN})`} strokeWidth={3} />
      <circle cx={0} cy={40} r={18} fill="#1a120c" />
      <rect x={-10} y={-210} width={20} height={190} fill="#3a2a1e" stroke={`rgb(${SUN})`} strokeWidth={2} />
    </g>
  </svg>
);
const Board: React.FC<{ x: number; y: number; o: number; tilt: number }> = ({ x, y, o, tilt }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: o }}>
    <g transform={`translate(${x} ${y}) rotate(${tilt})`}>
      <rect x={-150} y={-22} width={300} height={44} rx={22} fill={`rgb(${LEAF})`} stroke="#fff" strokeWidth={3} />
      <circle cx={-90} cy={36} r={16} fill="#fff" />
      <circle cx={90} cy={36} r={16} fill="#fff" />
    </g>
  </svg>
);

// Three moments, full screen, a whip-pan between each.
// 1 · a guitar, and the weeks ticking off under it — 第 1 周 · 第 2 周 · 第 3 周 —
//     the guitar going grey as a skateboard swings in, bright: 滑板？
// 2 · six months of a new job as bars: 100% the first month, then lower and
//     lower — and a new tab pops open: 招聘 · 新机会.
// 3 · a heart, burning hot at the start of a timeline, cooling as the line
//     goes on — and a question mark forming over it: 是不是不爱了？
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : 2;
  const week = Math.min(3, 1 + Math.floor(frame / BEAT));
  const board = ramp(frame, 4 * BEAT, 10);
  const tab = ramp(frame, c1 + 6 * BEAT, 8);
  const cool = interpolate(frame, [c2 + BEAT, c2 + 6 * BEAT], [0, 1], clamp);
  const doubt = ramp(frame, c2 + 6 * BEAT, 8);
  const heat = (k: number) => `rgb(${Math.round(255 - 95 * k)},${Math.round(100 + 86 * k)},${Math.round(110 + 110 * k)})`;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1, c2]} hits={[4 * BEAT, c1 + 6 * BEAT, c2 + 6 * BEAT, ...keyHits(lines, cues, duration)]}>
        {seg === 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ filter: `grayscale(${board})`, opacity: 1 - 0.6 * board, position: "absolute", inset: 0 }}>
              <Guitar x={620} y={480} o={1} />
            </div>
            <div style={{ position: "absolute", left: 420, width: 400, top: 720, textAlign: "center", fontFamily: fonts.mono, fontSize: 30, letterSpacing: 4, color: palette.ink }}>
              吉他课 · 第 <span style={{ color: `rgb(${SUN})`, fontSize: 44 }}>{week}</span> 周
            </div>
            <Halo x={1320} y={460} r={240} intensity={0.7 * board} rgb={LEAF} />
            <Board x={1320 + (1 - board) * 400} y={460} o={board} tilt={Math.sin(frame / 6) * 8} />
            <div style={{ position: "absolute", left: 1170, width: 300, top: 560, textAlign: "center", fontSize: 50, fontWeight: 900, color: `rgb(${LEAF})`, opacity: board }}>滑板？</div>
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 300, top: 160, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 6, color: palette.dim }}>新工作 · 干劲</div>
            {MONTHS.map((v, i) => {
              const p = ramp(frame, c1 + 4 + i * 8, 8);
              return (
                <div key={i}>
                  <div style={{ position: "absolute", left: 320 + i * 150, bottom: 1080 - 760, width: 90, height: 460 * v * p, background: i === 0 ? `rgb(${SUN})` : `rgba(${SUN},${0.9 - i * 0.12})` }} />
                  <div style={{ position: "absolute", left: 300 + i * 150, width: 130, top: 775, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, color: palette.dim }}>{i + 1}月</div>
                </div>
              );
            })}
            <div style={{ position: "absolute", left: 1260, top: 300, width: 460, height: 300, borderRadius: 14, background: "#1a1d23", border: `2px solid rgba(${LEAF},0.7)`, opacity: tab, transform: `translateY(${(1 - tab) * 40}px)` }}>
              <div style={{ padding: "16px 22px", fontFamily: fonts.mono, fontSize: 22, color: `rgb(${LEAF})`, borderBottom: "1px solid rgba(232,238,242,0.2)" }}>新标签页 · 招聘</div>
              <div style={{ padding: "30px 22px", fontSize: 40, fontWeight: 900, color: palette.ink }}>新机会 →</div>
            </div>
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Halo x={960} y={430} r={300} intensity={0.9 * (1 - cool)} rgb="255, 120, 130" />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <path d="M960 600 C 760 470 760 300 880 290 C 930 286 955 320 960 350 C 965 320 990 286 1040 290 C 1160 300 1160 470 960 600 Z" fill={heat(cool)} stroke="#fff" strokeWidth={3} opacity={0.9} />
              <line x1={500} y1={760} x2={1420} y2={760} stroke="rgba(232,238,242,0.4)" strokeWidth={3} />
              <circle cx={500 + 920 * cool} cy={760} r={12} fill={heat(cool)} />
            </svg>
            <div style={{ position: "absolute", left: 440, top: 780, fontFamily: fonts.mono, fontSize: 22, color: palette.dim }}>热恋期</div>
            <div style={{ position: "absolute", left: 1340, top: 780, fontFamily: fonts.mono, fontSize: 22, color: palette.dim }}>之后</div>
            <div style={{ position: "absolute", left: 1150, top: 260, fontSize: 120, fontWeight: 900, color: `rgb(${COOL})`, opacity: doubt, transform: `rotate(12deg) scale(${1.4 - 0.4 * doubt})` }}>？</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={SUN} opacity={0.45} />
      {[0, 1, 2].map((i) => (
        <Sfx key={i} name="shutter" at={i * BEAT + 2} volume={0.15} />
      ))}
      <Sfx name="whoosh" at={4 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.5} />
      <Sfx name="glint" at={c1 + 6 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.5} />
      <Sfx name="stamp" at={c2 + 6 * BEAT} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
