import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ALERT, GLOW } from "../screens";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// rough continents, as ellipses of dots: [cx, cy, rx, ry]
const LAND = [[520, 250, 170, 90], [600, 420, 80, 110], [960, 230, 90, 60], [1000, 380, 90, 120], [1300, 250, 230, 100], [1480, 470, 80, 50]];
const EVENTS = [
  { x: 480, y: 240, t: "选举" }, { x: 620, y: 440, t: "球赛" }, { x: 950, y: 220, t: "新品发布" }, { x: 1020, y: 380, t: "地震" },
  { x: 1250, y: 230, t: "股市" }, { x: 1400, y: 300, t: "明星八卦" }, { x: 1480, y: 470, t: "山火" }, { x: 560, y: 300, t: "热搜" },
];
const HEAD = { x: 960, y: 590 };

// 0 · a dot-matrix world; one per half beat something happens somewhere —
//     选举 · 地震 · 股市 · 明星八卦 — a ring pulsing out from it.
// 1 · and from every one of them a line runs to the small figure at the
//     bottom, into his head — 和我有关？ — until his head glows red.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const dots: React.ReactNode[] = [];
  LAND.forEach(([cx, cy, rx, ry], k) => {
    for (let x = -rx; x <= rx; x += 18) for (let y = -ry; y <= ry; y += 18) {
      if ((x * x) / (rx * rx) + (y * y) / (ry * ry) > 1 || random(`l-${k}-${x}-${y}`) > 0.8) continue;
      dots.push(<circle key={`${k}-${x}-${y}`} cx={cx + x} cy={cy + y} r={3} fill="rgba(170,215,255,0.28)" />);
    }
  });
  const heat = interpolate(frame, [c1, duration], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.08]} focus={{ x: 960, y: 420 }} hits={[c1]}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {dots}
          {EVENTS.map((e, i) => {
            const at = HALF_BEAT * (i + 1);
            if (frame < at) return null;
            const t = ((frame - at) % 30) / 30;
            const line = interpolate(frame, [c1 + i * 4, c1 + i * 4 + 14], [0, 1], clamp);
            return (
              <g key={e.t}>
                <circle cx={e.x} cy={e.y} r={7} fill={`rgb(${ALERT})`} />
                <circle cx={e.x} cy={e.y} r={7 + 30 * t} fill="none" stroke={`rgba(${ALERT},${1 - t})`} strokeWidth={2} />
                {line > 0 && <line x1={e.x} y1={e.y} x2={e.x + (HEAD.x - e.x) * line} y2={e.y + (HEAD.y - e.y) * line} stroke={`rgba(${GLOW},0.6)`} strokeWidth={2} />}
              </g>
            );
          })}
        </svg>
        {EVENTS.map((e, i) => (
          <div key={e.t} style={{ position: "absolute", left: e.x + 12, top: e.y - 34, fontSize: 22, fontWeight: 800, color: palette.ink, opacity: frame >= HALF_BEAT * (i + 1) ? 1 : 0 }}>{e.t}</div>
        ))}
        <Halo x={HEAD.x} y={HEAD.y} r={120 + 120 * heat} intensity={0.3 + 0.7 * heat} rgb={ALERT} />
        <Stander x={960} bottom={760} height={200} lift={0.5} glow={0.8} />
        <div style={{ position: "absolute", left: 1010, top: 600, fontFamily: fonts.mono, fontSize: 28, fontWeight: 700, color: `rgb(${ALERT})`, opacity: heat > 0.2 ? 1 : 0 }}>和我有关？</div>
      </Cam>
      <Bokeh frame={frame} n={6} />
      {EVENTS.map((_, i) => (
        <Sfx key={i} name="glint" at={HALF_BEAT * (i + 1)} volume={0.15} />
      ))}
      <Sfx name="rise" at={c1} volume={0.35} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
