import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { LEAF, Runner, SUN } from "../field";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const HOLES = [200, 380, 560, 1360, 1540, 1720];
const TOP = 300;

// 0 · the ground cut open like a diagram. Along the top, hole after hole,
//     each one a spade deep — 开头 · 开头 · 开头 … In the middle a shaft runs
//     down, dotted, to something glowing at the very bottom that nobody has
//     reached: 最深处的风景.
// 1 · a road: 出发 at one end, 到达 at the other. He sprints off — 热情 —
//     slows, stops halfway. The rest of the road lights up in gold: 承诺.
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const shaft = interpolate(frame, [4 * BEAT, 7 * BEAT], [0, 1], clamp);
  const run = interpolate(frame, [c1, c1 + 4 * BEAT], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2.5) });
  const x = 260 + 600 * run;
  const gold = interpolate(frame, [c1 + 5 * BEAT, c1 + 7 * BEAT], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} whips={[c1]} hits={[...HOLES.map((_, i) => 4 + i * 6), 7 * BEAT, c1 + 7 * BEAT, ...keyHits(lines, cues, duration)]}>
        {frame < c1 ? (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: TOP, bottom: 0, background: "linear-gradient(#2b1f17, #120d09)" }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: TOP - 2, height: 4, background: "rgba(214,170,120,0.5)" }} />
            {HOLES.map((hx, i) => (
              <div key={hx} style={{ opacity: ramp(frame, 4 + i * 6, 5) }}>
                <div style={{ position: "absolute", left: hx - 60, top: TOP, width: 120, height: 50, borderRadius: "0 0 60px 60px", background: "#07090b" }} />
                <div style={{ position: "absolute", left: hx - 80, width: 160, top: TOP - 50, textAlign: "center", fontSize: 26, fontWeight: 800, color: `rgb(${SUN})` }}>开头</div>
              </div>
            ))}
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <line x1={960} y1={TOP} x2={960} y2={TOP + 560 * shaft} stroke="rgba(232,238,242,0.5)" strokeWidth={3} strokeDasharray="10 10" />
            </svg>
            <Halo x={960} y={900} r={200} intensity={0.9 * shaft} rgb={LEAF} />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: shaft }}>
              <path d="M900 920 L960 860 L1020 920 L960 960 Z" fill={`rgb(${LEAF})`} stroke="#fff" strokeWidth={2} />
            </svg>
            <div style={{ position: "absolute", left: 1010, top: 760, fontSize: 36, fontWeight: 900, color: `rgb(${LEAF})`, opacity: ramp(frame, 7 * BEAT, 8) }}>最深处的风景 ？</div>
            <div style={{ position: "absolute", left: 120, top: 130, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 6, color: palette.dim }}>尝遍了所有的开头</div>
          </div>
        ) : (
          <div style={{ position: "absolute", inset: 0 }}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <line x1={200} y1={760} x2={1720} y2={760} stroke="rgba(232,238,242,0.35)" strokeWidth={6} />
              <line x1={x} y1={760} x2={x + (1720 - x) * gold} y2={760} stroke={`rgb(${SUN})`} strokeWidth={8} />
              {[200, 1720].map((fx, i) => (
                <g key={fx}>
                  <rect x={fx - 4} y={560} width={8} height={200} fill="#c9b08a" />
                  <path d={`M${fx + 4} 560 L${fx + 110} 590 L${fx + 4} 620 Z`} fill={i ? `rgb(${LEAF})` : `rgb(${SUN})`} />
                </g>
              ))}
            </svg>
            <div style={{ position: "absolute", left: 150, top: 500, fontSize: 34, fontWeight: 900, color: `rgb(${SUN})` }}>出发 · 热情</div>
            <div style={{ position: "absolute", left: 1600, top: 500, fontSize: 34, fontWeight: 900, color: `rgb(${LEAF})` }}>到达</div>
            <Runner x={x} bottom={760} height={240} walk={(frame - c1) / (2 + 6 * run)} run={1 - run} />
            <div style={{ position: "absolute", left: 1050, top: 680, fontSize: 40, fontWeight: 900, color: `rgb(${SUN})`, opacity: gold, textShadow: `0 0 20px rgba(${SUN},0.7)` }}>承诺</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={SUN} opacity={0.35} />
      {HOLES.map((_, i) => (
        <Sfx key={i} name="step" at={4 + i * 6} volume={0.25} />
      ))}
      <Sfx name="glint" at={7 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.45} />
      <Sfx name="whoosh" at={c1 + 2} volume={0.35} />
      <Sfx name="rise" at={c1 + 5 * BEAT} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
