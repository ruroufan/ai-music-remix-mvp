import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Jar, RED, SOFT } from "../jar";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// Nietzsche's mechanism.
// 0 · a wave of feeling hits a figure — he answers it — and it passes straight
//     through and away behind him: 回应 → 过去了.
// 1 · the same wave, but a lid comes down over his mouth; the wave can't get
//     out and turns inward, circling in his chest, round and round: 反刍 ×N.
// 2 · the jar close up: the stones darkening, bubbles rising — fermenting —
//     说不出口的苦.
// 3 · a shelf, then another, then another, full of jars, each labelled
//     没关系: 存了起来.
export const NietzscheScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2, c3] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : frame < c3 ? 2 : 3;
  const wave = (from: number) => (frame - from) / (3 * BEAT);
  const w0 = wave(BEAT);
  const w1 = Math.min(0.5, wave(c1 + BEAT));
  const loops = Math.max(0, Math.floor((frame - c1 - 3 * BEAT) / 8));
  const dark = interpolate(frame, [c2, c3], [0, 1], clamp);
  const shelves = interpolate(frame, [c3 + 4, c3 + 5 * BEAT], [0, 18], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} whips={[c1, c2, c3]} hits={[BEAT + 3 * BEAT * 0.5, c1 + 2 * BEAT, ...keyHits(lines, cues, duration)]}>
        {seg <= 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Stander x={960} bottom={900} height={460} lift={seg === 0 ? 1 : 0} glow={0.5} rgb={SOFT} />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              {seg === 0 && w0 > 0 && w0 < 1 && <path d={`M${200 + 1500 * w0} 420 q40 -60 80 0 t80 0 t80 0`} fill="none" stroke={`rgb(${RED})`} strokeWidth={8} strokeLinecap="round" opacity={w0 > 0.5 ? 1 - (w0 - 0.5) * 2 : 1} />}
              {seg === 1 && w1 > 0 && <path d={`M${200 + 1500 * w1} 420 q40 -60 80 0 t80 0 t80 0`} fill="none" stroke={`rgb(${RED})`} strokeWidth={8} strokeLinecap="round" opacity={frame > c1 + 3 * BEAT ? 0 : 1} />}
              {seg === 1 && frame > c1 + 3 * BEAT && (
                <g transform={`rotate(${(frame - c1) * 8} 960 560)`}>
                  <path d="M960 480 A80 80 0 1 1 880 560" fill="none" stroke={`rgb(${RED})`} strokeWidth={8} strokeLinecap="round" />
                  <path d="M870 548 L880 572 L896 552" fill="none" stroke={`rgb(${RED})`} strokeWidth={6} />
                </g>
              )}
              {seg === 1 && <rect x={900} y={420 - 40 * (1 - ramp(frame, c1 + 2 * BEAT, 6))} width={120} height={16} rx={6} fill="#c9ced4" opacity={ramp(frame, c1 + 2 * BEAT, 6)} />}
            </svg>
            {seg === 0 && <div style={{ position: "absolute", left: 1240, top: 260, fontSize: 44, fontWeight: 900, color: palette.ink, opacity: ramp(frame, 3 * BEAT, 8) }}>回应 → 过去了</div>}
            {seg === 1 && (
              <div style={{ position: "absolute", left: 1240, top: 260, fontSize: 44, fontWeight: 900, color: `rgb(${RED})`, opacity: ramp(frame, c1 + 3 * BEAT, 8) }}>
                转向内心 · 反刍 <span style={{ fontFamily: fonts.mono }}>×{loops}</span>
              </div>
            )}
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Halo x={960} y={560} r={300} intensity={0.3 + 0.3 * dark} rgb={RED} />
            <Jar x={960} y={880} size={2.2} stones={20} crack={0.4} tint={dark} />
            <div style={{ position: "absolute", left: 960 - 176, top: 880 - 440 * 1.1 + 40, width: 352, height: 380, background: `rgba(40,20,20,${0.45 * dark})`, borderRadius: 30 }} />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              {Array.from({ length: 14 }, (_, i) => {
                const p = ((frame - c2) / 40 + random(`b${i}`)) % 1;
                return <circle key={i} cx={830 + random(`bx${i}`) * 260} cy={860 - p * 380} r={4 + 5 * random(`br${i}`)} fill="none" stroke="rgba(200,225,240,0.6)" strokeWidth={2} opacity={1 - p} />;
              })}
            </svg>
            <div style={{ position: "absolute", left: 1260, top: 380, fontSize: 52, fontWeight: 900, color: `rgb(${RED})`, opacity: ramp(frame, c2 + 2 * BEAT, 8), textShadow: `0 0 20px rgba(${RED},0.5)` }}>说不出口的苦</div>
            <div style={{ position: "absolute", left: 1260, top: 460, fontFamily: fonts.mono, fontSize: 24, letterSpacing: 6, color: palette.dim, opacity: ramp(frame, c2 + 4, 8) }}>发酵中 · RESSENTIMENT</div>
          </div>
        )}
        {seg === 3 && (
          <div style={{ position: "absolute", inset: 0 }}>
            {[380, 620, 860].map((y) => <div key={y} style={{ position: "absolute", left: 200, width: 1520, top: y, height: 14, background: "#3a2e24" }} />)}
            {Array.from({ length: Math.floor(shelves) }, (_, i) => {
              const row = i % 3, col = Math.floor(i / 3);
              const x = 300 + col * 240, y = [380, 620, 860][row];
              return (
                <div key={i}>
                  <Jar x={x} y={y} size={0.5} stones={6 + (i * 7) % 12} crack={(i % 4) / 6} />
                  <div style={{ position: "absolute", left: x - 50, width: 100, top: y - 70, textAlign: "center", padding: "2px 0", background: "#efe8d8", color: "#262019", fontSize: 18, fontWeight: 800 }}>没关系</div>
                </div>
              );
            })}
            <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontSize: 50, fontWeight: 900, letterSpacing: 12, color: palette.ink, opacity: ramp(frame, c3 + 3 * BEAT, 8) }}>没有消失 · 存了起来</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={SOFT} opacity={0.3} />
      <Sfx name="whoosh" at={BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.45} />
      <Sfx name="whoosh" at={c1 + BEAT} volume={0.4} />
      <Sfx name="stamp" at={c1 + 2 * BEAT} volume={0.45} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.45} />
      <Sfx name="rise" at={c2} volume={0.3} />
      <Sfx name="whoosh" at={c3 - 3} volume={0.45} />
      {Array.from({ length: 6 }, (_, i) => (
        <Sfx key={i} name="step" at={c3 + 4 + i * 12} volume={0.15} />
      ))}
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
