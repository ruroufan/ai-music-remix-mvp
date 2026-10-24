import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam } from "../../glass/immersive";
import { BRASS, WARM, swing } from "../pendulum";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BAR, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ITEMS = ["读书", "思考", "创造"];

const Icon: React.FC<{ i: number; frame: number }> = ({ i, frame }) => {
  const s = { fill: "none", stroke: `rgb(${WARM})`, strokeWidth: 4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (i === 0)
    return (
      <g {...s}>
        <path d="M-80 30 Q-40 10 0 30 Q40 10 80 30 L80 -40 Q40 -60 0 -40 Q-40 -60 -80 -40 Z" />
        <line x1={0} y1={-40} x2={0} y2={30} />
        {[-24, -10, 4].map((y) => <line key={y} x1={-62} y1={y} x2={-18} y2={y - 6} strokeWidth={2} opacity={0.6} />)}
      </g>
    );
  if (i === 1)
    return (
      <g {...s}>
        <path d={Array.from({ length: 60 }, (_, k) => { const a = k * 0.32 + frame / 20; const r = 4 + k * 1.1; return `${k ? "L" : "M"}${Math.cos(a) * r} ${Math.sin(a) * r * 0.9}`; }).join(" ")} strokeWidth={3} />
      </g>
    );
  const draw = (frame % 60) / 60;
  return (
    <g {...s}>
      <path d={`M-70 30 Q-30 ${-30 + 10 * Math.sin(frame / 9)} 10 20 T 70 -10`} strokeDasharray={200} strokeDashoffset={200 * (1 - draw)} />
      <g transform={`translate(${-70 + 140 * draw} ${10 - 30 * draw}) rotate(40)`}>
        <rect x={-6} y={-60} width={12} height={56} rx={2} fill={`rgba(${WARM},0.3)`} />
        <path d="M-6 -4 L0 8 L6 -4" />
      </g>
    </g>
  );
};

// A faint pendulum still swings at the back. One per beat three small lights
// come up in front of it — 读书, 思考, 创造 — each its own warm lamp, each
// alive (the page turns, the thought spirals, the pencil draws). Then each
// gets a tag: 结果？ struck out — 值得 ✓.
export const WayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1] = cues;
  const settle = interpolate(frame, [0, duration], [1, 0.3], clamp);
  const deg = swing(frame, BAR, 30 * settle);
  const header = useRamp(BEAT, 8);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.06]} hits={ITEMS.map((_, i) => 2 * BEAT + i * BEAT).concat([c1])}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 0.18 }}>
          <g transform={`rotate(${-deg} 960 0)`}>
            <line x1={960} y1={0} x2={960} y2={640} stroke={`rgb(${BRASS})`} strokeWidth={6} />
            <circle cx={960} cy={680} r={60} fill={`rgba(${BRASS},0.8)`} />
          </g>
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 8, color: palette.dim, opacity: header }}>本身就能带来满足的事</div>
        {ITEMS.map((it, i) => {
          const p = rampAt(frame, 2 * BEAT + i * BEAT);
          const tag = rampAt(frame, c1 + BEAT + i * BEAT, 6);
          const cx = 560 + i * 400;
          return (
            <div key={it} style={{ position: "absolute", inset: 0, opacity: p }}>
              <Halo x={cx} y={420} r={220} intensity={0.7 * p} rgb={WARM} />
              <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
                <g transform={`translate(${cx} 400) scale(${0.8 + 0.2 * p})`}>
                  <Icon i={i} frame={frame} />
                </g>
              </svg>
              <div style={{ position: "absolute", left: cx - 120, width: 240, top: 500, textAlign: "center", fontSize: 50, fontWeight: 900, color: look.key, textShadow: `0 0 18px ${look.keyGlow}` }}>{it}</div>
              {tag > 0 && (
                <div style={{ position: "absolute", left: cx - 120, width: 240, top: 590, textAlign: "center", opacity: tag }}>
                  <span style={{ fontSize: 24, color: palette.dim, textDecoration: "line-through", marginRight: 14 }}>结果？</span>
                  <span style={{ fontSize: 28, fontWeight: 900, color: "#7fe0a0" }}>值得 ✓</span>
                </div>
              )}
            </div>
          );
        })}
      </Cam>
      <Bokeh frame={frame} rgb={WARM} opacity={0.8} />
      {ITEMS.map((_, i) => (
        <Sfx key={i} name="glint" at={2 * BEAT + i * BEAT} volume={0.3} />
      ))}
      {ITEMS.map((_, i) => (
        <Sfx key={`t${i}`} name="stamp" at={c1 + BEAT + i * BEAT} volume={0.22} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};

const rampAt = (frame: number, at: number, len = 10) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
