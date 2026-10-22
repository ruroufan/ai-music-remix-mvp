import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { BP, Blueprint, GlassBox, RED } from "../blueprint";
import { ImpactBack, ImpactFront, keyHits } from "../impact";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const FLOOR = 760;
const HIM = 420;
const THEM = [1180, 1400, 1620];

// 0 · he shows them the plan; they hang back: 嗯…… · 再说吧 · ……
// 1 · and the plan itself is fine — 观点 ✓ 没问题 — they even nod: 有道理.
// 2 · a scan line passes over him and shows what's written in the air above
//     his head, unsaid: “我早就想清楚了” — the glass round him lights up, and
//     the three of them step back.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const ok = ramp(frame, c1 + BEAT, 6);
  const scan = interpolate(frame, [c2, c2 + 2 * BEAT], [0, 1], clamp);
  const reveal = ramp(frame, c2 + BEAT, 8);
  const back = interpolate(frame, [c2 + 2 * BEAT, c2 + 3 * BEAT], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const says = frame < c1 ? ["嗯……", "再说吧", "……"] : ["有道理", "对", "没错"];
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.08]} focus={{ x: 900, y: 500 }} hits={[...[c1 + BEAT, c2 + BEAT], ...keyHits(lines, cues, duration)]}>
        <Blueprint x={720} y={230} w={420} frame={frame} draw={1} checks={1} label="方案 · v1.0" />
        {ok > 0 && <div style={{ position: "absolute", left: 760, top: 520, fontSize: 30, fontWeight: 900, color: "#7fe0a0", opacity: ok * (1 - 0.6 * reveal) }}>观点 ✓ 没问题</div>}
        <GlassBox x={HIM} bottom={FLOOR} w={260} h={380} k={0.25 + 0.75 * reveal} text="" />
        <Stander x={HIM} bottom={FLOOR} height={300} lift={1.6} glow={0.8} rgb={BP} />
        {/* the scan line */}
        {scan > 0 && scan < 1 && <div style={{ position: "absolute", left: 200, width: 460, top: 260 + 520 * scan, height: 4, background: `rgb(${RED})`, boxShadow: `0 0 20px rgba(${RED},0.9)` }} />}
        <div style={{ position: "absolute", left: HIM - 260, width: 520, top: 230, textAlign: "center", fontSize: 44, fontWeight: 900, color: `rgb(${RED})`, opacity: reveal, textShadow: `0 0 18px rgba(${RED},0.8)`, clipPath: `inset(0 0 ${100 - scan * 100}% 0)` }}>“我早就想清楚了”</div>
        <div style={{ position: "absolute", left: HIM - 200, width: 400, top: 300, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 6, color: palette.dim, opacity: reveal }}>没说出口 · UNSAID</div>
        {THEM.map((x, i) => {
          const bx = x + back * (80 + i * 40);
          return (
            <div key={x} style={{ position: "absolute", inset: 0, opacity: 1 - 0.4 * back }}>
              <Stander x={bx} bottom={FLOOR} height={260} lift={frame < c1 ? 0.6 : 1} glow={0.5} />
              <div style={{ position: "absolute", left: bx - 80, width: 160, top: FLOOR - 360, textAlign: "center", fontSize: 26, fontWeight: 800, color: frame < c1 ? palette.dim : "#7fe0a0", opacity: back > 0.5 ? 0 : 1 }}>{says[i]}</div>
            </div>
          );
        })}
      </Cam>
      <Bokeh frame={frame} rgb={BP} />
      <Sfx name="glint" at={c1 + BEAT} volume={0.35} />
      <Sfx name="rise" at={c2} volume={0.3} />
      <Sfx name="glitch" at={c2 + BEAT} volume={0.35} />
      <Sfx name="whoosh" at={c2 + 2 * BEAT} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
