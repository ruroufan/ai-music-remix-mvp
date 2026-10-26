import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Walker } from "../../nostalgia/road";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { GROUND, INK, LEAF, OldTree, Ox, PALE, WARM } from "../checklist";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const USES = [["做船", "会沉"], ["做棺材", "会烂"], ["做门窗", "流脂"]];
const STRAIGHT = [260, 420, 1500, 1660];
const RED = "255, 110, 110";

// Zhuangzi's tree.
// 0 · a gnarled old tree; a carpenter with an axe walks past without turning
//     his head: 看都不看一眼.
// 1 · his verdict, line by line: 做船 → 会沉 ✕ · 做棺材 → 会烂 ✕ · 做门窗 →
//     流脂 ✕ — stamped: 无用.
// 2 · the straight, useful trees round it come down one by one — the crooked
//     one is left standing: 没被砍掉.
// 3 · it grows and spreads until its shade covers the ground, and an ox herd
//     gathers in it — more and more — 几千头.
export const ZhuangziScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2, c3] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : frame < c3 ? 2 : 3;
  const walk = interpolate(frame, [0, c1], [-120, 2000], clamp);
  const chop = (i: number) => interpolate(frame, [c2 + 6 + i * 10, c2 + 18 + i * 10], [0, 1], { ...clamp, easing: (t) => t * t });
  const grow = interpolate(frame, [c3, c3 + 4 * BEAT], [0.75, 1.3], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) });
  const herd = interpolate(frame, [c3 + BEAT, c3 + 7 * BEAT], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} whips={[c1, c2]} hits={[c1 + 4 * BEAT, ...STRAIGHT.map((_, i) => c2 + 18 + i * 10), ...keyHits(lines, cues, duration)]}>
        {seg !== 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: GROUND, bottom: 0, background: "#14110e" }} />
            {seg === 2 &&
              STRAIGHT.map((x, i) => (
                <svg key={x} width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
                  <g transform={`rotate(${(i % 2 ? 1 : -1) * 88 * chop(i)} ${x} ${GROUND - 40})`} opacity={1 - 0.6 * chop(i)}>
                    <rect x={x - 12} y={GROUND - 520} width={24} height={480} fill="#5a4330" />
                    <ellipse cx={x} cy={GROUND - 520} rx={60} ry={110} fill={`rgba(${LEAF},0.6)`} />
                  </g>
                  <rect x={x - 14} y={GROUND - 40} width={28} height={40} fill="#5a4330" />
                </svg>
              ))}
            <OldTree x={960} size={seg === 3 ? grow : 0.75} shade={seg === 3 ? herd : 0.2} frame={frame} glow={seg === 3 ? 0.3 + 0.4 * herd : 0.25} />
            {seg === 0 && (
              <>
                <Walker x={walk} bottom={GROUND} height={260} face="right" walk={frame / 4} glow={0.4} rgb={PALE} />
                <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
                  <line x1={walk + 30} y1={GROUND - 150} x2={walk + 70} y2={GROUND - 230} stroke="#8a6a4a" strokeWidth={6} />
                  <path d={`M${walk + 62} ${GROUND - 244} l24 4 l-6 22 z`} fill="#c9ced4" />
                </svg>
                <div style={{ position: "absolute", left: 1240, top: 300, fontSize: 40, fontWeight: 900, color: palette.dim, opacity: ramp(frame, 3 * BEAT, 10) }}>看都不看一眼</div>
              </>
            )}
            {seg === 2 && <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontSize: 50, fontWeight: 900, letterSpacing: 10, color: `rgb(${LEAF})`, opacity: ramp(frame, c2 + 4 * BEAT, 8) }}>没被砍掉</div>}
            {seg === 3 &&
              Array.from({ length: Math.round(herd * 60) }, (_, i) => {
                const x = 960 + (random(`ox${i}`) - 0.5) * 1300;
                const y = GROUND - 6 + random(`oy${i}`) * 120;
                return <Ox key={i} x={x} y={y} s={0.8 + 0.6 * random(`os${i}`)} />;
              })}
            {seg === 3 && (
              <div style={{ position: "absolute", left: 1440, top: 160, fontFamily: fonts.mono, fontSize: 28, letterSpacing: 4, color: `rgba(${INK},0.6)` }}>
                遮荫 <span style={{ fontSize: 46, color: `rgb(${WARM})` }}>{Math.round(herd * 3000)}</span> 头牛
              </div>
            )}
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 8, color: palette.dim }}>木匠的判断</div>
            {USES.map(([u, r], i) => (
              <div key={u} style={{ position: "absolute", left: 560, width: 800, top: 270 + i * 120, display: "flex", alignItems: "center", fontSize: 50, fontWeight: 900, color: palette.ink, opacity: ramp(frame, c1 + 4 + i * BEAT, 6) }}>
                <span style={{ width: 260 }}>{u}</span>
                <span style={{ color: palette.dim, width: 120 }}>→</span>
                <span style={{ width: 220 }}>{r}</span>
                <span style={{ color: `rgb(${RED})` }}>✕</span>
              </div>
            ))}
            <div style={{ position: "absolute", left: 1220, top: 600, padding: "10px 30px", border: `6px solid rgb(${RED})`, borderRadius: 10, fontSize: 84, fontWeight: 900, color: `rgb(${RED})`, opacity: ramp(frame, c1 + 4 * BEAT, 5), transform: `rotate(-10deg) scale(${1.6 - 0.6 * ramp(frame, c1 + 4 * BEAT, 5)})` }}>无用</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={LEAF} opacity={0.35} />
      {[0, 1, 2, 3].map((i) => (
        <Sfx key={i} name="step" at={i * BEAT + 4} volume={0.2} />
      ))}
      <Sfx name="whoosh" at={c1 - 3} volume={0.45} />
      {USES.map((_, i) => (
        <Sfx key={`u${i}`} name="shutter" at={c1 + 4 + i * BEAT} volume={0.2} />
      ))}
      <Sfx name="stamp" at={c1 + 4 * BEAT} volume={0.6} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.45} />
      {STRAIGHT.map((_, i) => (
        <Sfx key={`c${i}`} name="boom" at={c2 + 18 + i * 10} volume={0.2} />
      ))}
      <Sfx name="rise" at={c3} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
