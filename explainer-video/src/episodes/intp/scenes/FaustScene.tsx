import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Seated } from "../../friction/tangle";
import { Walker } from "../../nostalgia/road";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { DOOR, FLOOR, GREEN, GREY, SEAT, Study } from "../study";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const BOOKS = ["哲学", "法律", "医学", "神学"];

// Faust in his study.
// 0 · four great volumes slam down one per beat — 哲学 · 法律 · 医学 · 神学.
// 1 · the room goes darker; he slumps over the desk — 绝望.
// 2 · two gauges: 懂 100% — 活过 0%.
// 3 · he gets up, the door swings open on green light, and he walks out.
export const FaustScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2, c3] = cues;
  const dark = interpolate(frame, [c1, c1 + BEAT, c3, c3 + BEAT], [0, 1, 1, 0.3], clamp);
  const door = interpolate(frame, [c3 + BEAT, c3 + 2 * BEAT], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const walk = interpolate(frame, [c3 + 2 * BEAT, duration], [0, 1], clamp);
  const gauges = ramp(frame, c2, 10);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} focus={{ x: 900, y: 520 }} hits={[...BOOKS.map((_, i) => BEAT + i * BEAT), c3 + BEAT, ...keyHits(lines, cues, duration)]}>
        <Study frame={frame} door={door} spill={door} tint={0.2 * dark} />
        <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${0.45 * dark})` }} />
        {frame < c3 + BEAT ? <Seated x={SEAT} floor={FLOOR} scale={1.25} glow={0.5 - 0.3 * dark} slump={frame >= c1 ? 1 : 0.2} /> : <Walker x={SEAT - 60 + (DOOR.x + 60 - SEAT) * walk} bottom={FLOOR} height={300} face="right" walk={walk * 30} glow={0.6 + 0.4 * walk} rgb={walk > 0.5 ? GREEN : undefined} />}
        {/* the four volumes */}
        {frame < c1 + BEAT &&
          BOOKS.map((b, i) => {
            const at = BEAT + i * BEAT;
            const p = interpolate(frame, [at - 6, at], [0, 1], { ...clamp, easing: (t) => t * t });
            if (p <= 0) return null;
            return (
              <div key={b} style={{ position: "absolute", left: 300 + i * 340, top: 160 + (1 - p) * -260, width: 280, height: 110, borderRadius: 8, background: "linear-gradient(90deg, #3a3428, #2a241a)", border: `3px solid rgba(${GREY},0.6)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 54, fontWeight: 900, color: "#d9c9a4", letterSpacing: 10, transform: `rotate(${(i - 1.5) * 3}deg)`, opacity: 1 - ramp(frame, c1, 10) * 0.7 }}>{b}</div>
            );
          })}
        {frame >= c1 && frame < c2 && <div style={{ position: "absolute", left: 1100, top: 300, fontSize: 64, fontWeight: 900, letterSpacing: 16, color: palette.alert, opacity: ramp(frame, c1 + 4, 8) * 0.9 }}>绝望</div>}
        {frame >= c2 && frame < c3 + BEAT && (
          <div style={{ position: "absolute", left: 1080, top: 220, width: 560, opacity: gauges * (1 - ramp(frame, c3, 8)) }}>
            {[["懂", 1, palette.ink], ["活过", 0, `rgb(${GREEN})`]].map(([k, v, c]) => (
              <div key={k as string} style={{ marginBottom: 30 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 40, fontWeight: 900 }}>
                  <span>{k as string}</span>
                  <span style={{ fontFamily: fonts.mono, color: c as string }}>{Math.round((v as number) * 100 * gauges)}%</span>
                </div>
                <div style={{ marginTop: 10, height: 20, borderRadius: 10, background: "rgba(255,255,255,0.06)", border: `2px solid ${c as string}` }}>
                  <div style={{ width: `${(v as number) * 100 * gauges}%`, height: "100%", borderRadius: 10, background: c as string }} />
                </div>
              </div>
            ))}
          </div>
        )}
        {door > 0 && <div style={{ position: "absolute", left: DOOR.x - 60, width: DOOR.w + 120, top: DOOR.y - 70, textAlign: "center", fontSize: 34, fontWeight: 900, color: `rgb(${GREEN})`, opacity: walk, textShadow: `0 0 16px rgba(${GREEN},0.9)` }}>生活</div>}
        <div style={{ position: "absolute", left: 140, top: 140, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 6, color: palette.dim }}>FAUST · 书房</div>
      </Cam>
      <Bokeh frame={frame} rgb={door > 0.3 ? GREEN : "200, 205, 215"} opacity={0.6} />
      {BOOKS.map((_, i) => (
        <Sfx key={i} name="stamp" at={BEAT + i * BEAT} volume={0.5} />
      ))}
      <Sfx name="boom" at={c1} volume={0.3} />
      <Sfx name="rise" at={c2} volume={0.25} />
      <Sfx name="whoosh" at={c3 + BEAT} volume={0.45} />
      <Sfx name="glint" at={c3 + 2 * BEAT} volume={0.45} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
