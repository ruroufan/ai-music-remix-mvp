import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FIRE = "255, 140, 60";

// 0 · two shafts. 剥削别人: the weight sinks and stops on a gold line, 底线.
//     剥削自己: the same weight sinks — and there's no line; it falls out of
//     the bottom of the frame.
// 1 · a 罢工 placard, crossed out. The boss's chair turns round: it's him.
// 2 · he's a match now, burning down from the head — to ash and embers.
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : 2;
  const sinkL = interpolate(frame, [BEAT, 3 * BEAT], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const sinkR = interpolate(frame, [3 * BEAT, c1], [0, 1], { ...clamp, easing: (t) => t * t });
  const sign = useRamp(c1, 8);
  const cross = interpolate(frame, [c1 + BEAT, c1 + BEAT + 6], [0, 1], clamp);
  const turn = interpolate(frame, [c1 + 4 * BEAT, c1 + 4 * BEAT + 12], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const burn = interpolate(frame, [c2 + BEAT, duration - BEAT], [0, 1], clamp);
  const lit = useRamp(c2, 6);
  const stickTop = 300 + 360 * burn;
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.08]} whips={[c1, c2]} hits={[3 * BEAT, c1 + BEAT, c1 + 4 * BEAT]}>
        {seg === 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            {[{ x: 620, label: "剥削别人", sink: sinkL, floor: true }, { x: 1300, label: "剥削自己", sink: sinkR, floor: false }].map((s) => {
              const y = s.floor ? 220 + 400 * s.sink : 220 + 900 * s.sink;
              return (
                <div key={s.label} style={{ position: "absolute", inset: 0 }}>
                  <div style={{ position: "absolute", left: s.x - 150, top: 140, width: 300, height: 940, borderLeft: `2px solid ${palette.faint}`, borderRight: `2px solid ${palette.faint}`, background: "linear-gradient(rgba(20,26,36,0.6), rgba(5,7,10,0.9))" }} />
                  <div style={{ position: "absolute", left: s.x - 150, width: 300, top: 80, textAlign: "center", fontSize: 40, fontWeight: 900 }}>{s.label}</div>
                  {s.floor && (
                    <>
                      <div style={{ position: "absolute", left: s.x - 190, top: 720, width: 380, height: 6, background: look.key, boxShadow: `0 0 18px ${look.keyGlow}` }} />
                      <div style={{ position: "absolute", left: s.x + 200, top: 700, fontSize: 32, fontWeight: 900, color: look.key }}>底线</div>
                    </>
                  )}
                  {!s.floor && frame > 3 * BEAT + 10 && <div style={{ position: "absolute", left: s.x + 170, top: 700, fontSize: 32, fontWeight: 900, color: palette.alert }}>没有底线</div>}
                  <div style={{ position: "absolute", left: s.x - 80, top: y, width: 160, height: 100, borderRadius: 10, background: "#2a3242", border: `2px solid ${palette.faint}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.mono, fontSize: 24, color: palette.ink }}>压力</div>
                </div>
              );
            })}
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 300, top: 220, width: 300, opacity: sign, transform: `rotate(-6deg)` }}>
              <div style={{ padding: "26px 0", textAlign: "center", background: "#e8e2d4", borderRadius: 8, fontSize: 70, fontWeight: 900, color: "#2a2118", position: "relative" }}>
                罢工
                <svg width={300} height={140} style={{ position: "absolute", left: 0, top: 0 }}>
                  <line x1={20} y1={20} x2={20 + 260 * cross} y2={20 + 100 * cross} stroke={palette.alert} strokeWidth={10} strokeLinecap="round" />
                  <line x1={280} y1={20} x2={280 - 260 * cross} y2={20 + 100 * cross} stroke={palette.alert} strokeWidth={10} strokeLinecap="round" />
                </svg>
              </div>
              <div style={{ margin: "0 auto", width: 12, height: 240, background: "#6a5638" }} />
            </div>
            <div style={{ position: "absolute", left: 300, top: 640, width: 300, textAlign: "center", fontSize: 30, fontWeight: 800, color: palette.dim, opacity: cross }}>也不会反抗</div>
            {/* the boss's chair: a high back, turned away — then round */}
            <Halo x={1250} y={480} r={360} intensity={0.2 + 0.5 * turn} rgb="255, 199, 122" />
            <div style={{ position: "absolute", left: 1100, top: 300, width: 300, height: 420, borderRadius: "30px 30px 10px 10px", background: "#1b1410", border: `3px solid rgba(255,199,122,${0.4 + 0.4 * (1 - turn)})`, transformOrigin: "150px 0", transform: `scaleX(${Math.abs(1 - 2 * turn)})`, opacity: turn < 0.5 ? 1 : 0 }} />
            {turn >= 0.5 && <Stander x={1250} bottom={760} height={330} lift={0.4} glow={0.9} />}
            <div style={{ position: "absolute", left: 1100, top: 220, width: 300, textAlign: "center", fontSize: 34, fontWeight: 900, color: turn >= 0.5 ? look.key : palette.dim }}>{turn >= 0.5 ? "老板 = 你" : "老板"}</div>
            <div style={{ position: "absolute", left: 1060, top: 780, width: 380, height: 18, borderRadius: 6, background: "#2a2118" }} />
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Halo x={960} y={stickTop} r={260 * (1 - 0.7 * burn)} intensity={lit * (0.8 - 0.6 * burn)} rgb={FIRE} />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              {/* the burnt part, curling to ash */}
              <path d={`M960 ${stickTop} Q${960 + 20 * burn} ${stickTop - 60 * burn} ${960 + 50 * burn} ${stickTop - 80 * burn}`} stroke="#1a1a1a" strokeWidth={12} fill="none" opacity={burn > 0.05 ? 0.9 : 0} />
              <rect x={950} y={stickTop} width={20} height={Math.max(0, 760 - stickTop)} fill="#c9a46a" />
              <rect x={950} y={stickTop} width={20} height={24} fill="#3a2010" />
              {burn < 0.98 && <ellipse cx={960} cy={stickTop - 2} rx={18} ry={22} fill={burn < 0.05 ? "#a8323a" : "#2a1208"} />}
              {/* the flame */}
              {burn < 0.95 && (
                <path d={`M960 ${stickTop - 110 - 12 * Math.sin(frame / 2)} Q${990 + 8 * Math.sin(frame / 3)} ${stickTop - 40} 960 ${stickTop + 6} Q${930 - 8 * Math.sin(frame / 2.5)} ${stickTop - 40} 960 ${stickTop - 110 - 12 * Math.sin(frame / 2)} Z`} fill={`rgba(${FIRE},${0.9 * lit * (1 - burn * 0.6)})`} style={{ filter: `drop-shadow(0 0 20px rgba(${FIRE},0.9))` }} />
              )}
              {/* ash on the floor */}
              <ellipse cx={960} cy={766} rx={30 + 70 * burn} ry={8} fill={`rgba(120,110,100,${0.7 * burn})`} />
              {Array.from({ length: 18 }, (_, i) => {
                const t0 = c2 + BEAT + random(`e-t-${i}`) * (duration - c2 - BEAT);
                const t = frame - t0;
                if (t < 0 || t > 50) return null;
                return <circle key={i} cx={960 + (random(`e-x-${i}`) - 0.5) * 80 + t * (random(`e-d-${i}`) - 0.5) * 3} cy={stickTop - t * 4} r={2 + random(`e-r-${i}`) * 3} fill={`rgba(${FIRE},${1 - t / 50})`} />;
              })}
            </svg>
            <div style={{ position: "absolute", left: 1120, top: 420, fontSize: 44, fontWeight: 900, letterSpacing: 10, color: `rgba(${FIRE},1)`, opacity: interpolate(frame, [duration - 3 * BEAT, duration - 2 * BEAT], [0, 1], clamp) }}>燃尽</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={seg === 2 ? FIRE : undefined} />
      <Sfx name="stamp" at={3 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={3 * BEAT + 4} volume={0.3} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.45} />
      <Sfx name="shatter" at={c1 + BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c1 + 4 * BEAT} volume={0.35} />
      <Sfx name="boom" at={c1 + 4 * BEAT + 6} volume={0.4} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.45} />
      <Sfx name="glint" at={c2} volume={0.4} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
