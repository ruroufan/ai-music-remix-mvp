import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Person } from "../../solitude/porcupine";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const FLOOR = 760;
const CHAIN = ["今天", "明天", "后天", "大后天", "下周", "下个月", "明年"];

const Meter: React.FC<{ x: number; y: number; label: string; k: number; color: string }> = ({ x, y, label, k, color }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 240, fontFamily: fonts.mono, fontSize: 18, letterSpacing: 3, color: palette.dim }}>
    {label} <span style={{ float: "right", color }}>{Math.round(k * 100)}%</span>
    <div style={{ marginTop: 6, height: 10, background: palette.faint }}>
      <div style={{ width: `${k * 100}%`, height: "100%", background: color }} />
    </div>
  </div>
);

// 0 · today's you and tomorrow's: courage exactly the same, panic way up.
// 1 · a chain of days, each one pawned to the next — a red 抵押 stamp per beat.
// 2 · the chain runs out at a life bar, 0 to 80, and the debt eats it from the end.
export const DebtScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const seg = (i: number) => frame >= cues[i] && (i + 1 >= cues.length || frame < cues[i + 1]);
  const segIn = (i: number) => interpolate(frame, [cues[i], cues[i] + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const panic = interpolate(frame, [BEAT, 4 * BEAT], [0.3, 0.95], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t1 = frame - cues[1], t2 = frame - cues[2];
  const links = Math.max(0, Math.min(CHAIN.length, Math.floor(t1 / BEAT) + 1));
  const eat = interpolate(t2, [BEAT, 8 * BEAT], [0, 0.85], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * (2 - t) });
  return (
    <ObsFrame duration={duration}>
      {seg(0) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(0) }}>
          <Horizon y={FLOOR} />
          <Person x={620} bottom={FLOOR} height={240} glow={0.5} />
          <Person x={1300} bottom={FLOOR} height={240} pose="hunch" glow={0.5} />
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} style={{ position: "absolute", left: 1300 + (i - 1) * 50, top: FLOOR - 300 + ((frame * 3 + i * 20) % 60), width: 10, height: 16, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: "rgba(160,210,255,0.8)", opacity: panic }} />
          ))}
          <div style={{ position: "absolute", left: 540, top: FLOOR + 20, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim }}>今天的你</div>
          <div style={{ position: "absolute", left: 1220, top: FLOOR + 20, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim }}>明天的你</div>
          <Meter x={500} y={250} label="勇气" k={0.3} color={palette.accent} />
          <Meter x={500} y={310} label="着急" k={0.3} color={palette.alert} />
          <Meter x={1180} y={250} label="勇气" k={0.3} color={palette.accent} />
          <Meter x={1180} y={310} label="着急" k={panic} color={palette.alert} />
        </div>
      )}
      {seg(1) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(1) }}>
          {CHAIN.slice(0, links).map((d, i) => {
            const x = 150 + i * 240, y = 380 + (i % 2) * 40;
            const stamped = i < links - 1;
            return (
              <React.Fragment key={d}>
                <div style={{ position: "absolute", left: x, top: y, width: 170, height: 200, background: "#ece8e0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: d.length > 2 ? 40 : 56, fontWeight: 900, color: i === 0 ? "#0f8f84" : "#b2283e" }}>
                  {d}
                  {stamped && <div style={{ position: "absolute", left: 30, top: 70, padding: "4px 10px", border: `4px solid ${palette.alert}`, color: palette.alert, fontSize: 32, fontWeight: 900, transform: "rotate(-16deg)", opacity: 0.9 }}>抵押</div>}
                </div>
                {i > 0 && <div style={{ position: "absolute", left: x - 70, top: y + 90, width: 70, height: 4, background: palette.alert }} />}
              </React.Fragment>
            );
          })}
        </div>
      )}
      {seg(2) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(2) }}>
          <div style={{ position: "absolute", left: 300, top: 330, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: palette.dim }}>人生 · 0 → 80 岁</div>
          <div style={{ position: "absolute", left: 300, top: 380, width: 1320, height: 70, border: `2px solid ${palette.dim}` }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(1 - eat) * 100}%`, background: `linear-gradient(90deg, rgba(${palette.halo},0.5), rgba(${palette.halo},0.25))` }} />
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: `${eat * 100}%`, background: `repeating-linear-gradient(135deg, rgba(255,77,109,0.75) 0 12px, rgba(255,77,109,0.45) 12px 24px)` }} />
          </div>
          <div style={{ position: "absolute", left: 300 + (1 - eat) * 1320 - 120, top: 470, width: 240, textAlign: "center", fontFamily: fonts.mono, fontSize: 26, color: palette.alert }}>还债 ← {Math.round(80 - eat * 80)} 岁</div>
          <div style={{ position: "absolute", left: 300, top: 230, fontFamily: fonts.mono, fontSize: 30, color: palette.alert }}>欠款：今天 × {Math.round(eat * 365 * 40).toLocaleString("en-US")}</div>
          <Person x={420} bottom={FLOOR} height={200} pose="hunch" glow={0.35} />
        </div>
      )}
      <Sfx name="glitch" at={2 * BEAT} volume={0.3} />
      {CHAIN.slice(1).map((_, i) => (
        <Sfx key={i} name="stamp" at={cues[1] + (i + 1) * BEAT} volume={0.35} />
      ))}
      <Sfx name="rise" at={cues[2] + BEAT} volume={0.3} />
      <Sfx name="boom" at={cues[2] + 8 * BEAT} volume={0.5} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
