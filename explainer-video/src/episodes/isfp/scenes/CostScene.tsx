import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { FLOOR, Ground, Him, RIFT, ROSE, SKY } from "../crack";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const PLACES = ["城市", "海边", "山里", "小镇", "异乡", "远方"];
const SPEED = 14;
const GAP = 440;

// 0 · he walks on and on; the world slides past — signposts 城市 · 海边 · 山里
//     · 小镇 · 异乡, and people, each with a ？ over their head as he passes:
//     no one really knows him.
// 1 · a pair of scales: on one pan a feather — 离开 — floats up; then a stone
//     drops onto the other — 遗憾 — and the beam slams down.
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const off = frame * SPEED;
  const stone = interpolate(frame, [c1 + 3 * BEAT, c1 + 4 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t });
  const tilt = frame < c1 + 4 * BEAT ? 8 * ramp(frame, c1 + BEAT, 12) : 8 + 12 * ramp(frame, c1 + 4 * BEAT, 10);
  const rad = (tilt * Math.PI) / 180;
  const L = { x: 960 - 300 * Math.cos(rad), y: 420 - 300 * Math.sin(rad) };
  const R = { x: 960 + 300 * Math.cos(rad), y: 420 + 300 * Math.sin(rad) };
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1]} hits={[c1 + 4 * BEAT, ...keyHits(lines, cues, duration)]}>
        {frame < c1 ? (
          <div style={{ position: "absolute", inset: 0 }}>
            <Ground />
            {PLACES.map((p, i) => {
              const px = 1900 + i * GAP - off;
              return px > -200 && px < 2100 ? (
                <div key={p} style={{ position: "absolute", inset: 0 }}>
                  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
                    <line x1={px} y1={FLOOR} x2={px} y2={FLOOR - 260} stroke="rgba(232,238,242,0.35)" strokeWidth={5} />
                  </svg>
                  <div style={{ position: "absolute", left: px - 70, top: FLOOR - 300, width: 140, padding: "6px 0", textAlign: "center", border: "2px solid rgba(232,238,242,0.35)", borderRadius: 6, fontSize: 26, fontWeight: 800, color: palette.dim }}>{p}</div>
                </div>
              ) : null;
            })}
            {PLACES.map((p, i) => {
              const px = 2120 + i * GAP - off;
              const q = px < 900 ? 1 : 0.25;
              return px > -200 && px < 2100 ? (
                <div key={`s${p}`} style={{ position: "absolute", inset: 0 }}>
                  <Stander x={px} bottom={FLOOR} height={260} lift={1} glow={0.25} rgb={SKY} opacity={0.7} />
                  <div style={{ position: "absolute", left: px - 30, width: 60, top: FLOOR - 330, textAlign: "center", fontSize: 44, fontWeight: 900, color: `rgba(${SKY},${q})` }}>？</div>
                </div>
              ) : null;
            })}
            <Him x={780} face="right" walk={frame / 5} glow={0.5} />
            <div style={{ position: "absolute", left: 120, top: 150, fontFamily: fonts.mono, fontSize: 24, letterSpacing: 6, color: palette.dim }}>认识你的人 · <span style={{ color: `rgb(${RIFT})` }}>很少</span></div>
          </div>
        ) : (
          <div style={{ position: "absolute", inset: 0 }}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <path d="M960 420 L960 760 M880 760 L1040 760" stroke="rgba(232,238,242,0.5)" strokeWidth={6} />
              <line x1={L.x} y1={L.y} x2={R.x} y2={R.y} stroke="rgba(232,238,242,0.75)" strokeWidth={8} strokeLinecap="round" />
              <circle cx={960} cy={420} r={12} fill="#888" />
              {[L, R].map((p, i) => (
                <g key={i}>
                  <path d={`M${p.x} ${p.y} L${p.x - 90} ${p.y + 150} M${p.x} ${p.y} L${p.x + 90} ${p.y + 150}`} stroke="rgba(232,238,242,0.35)" strokeWidth={2} />
                  <path d={`M${p.x - 110} ${p.y + 150} Q${p.x} ${p.y + 200} ${p.x + 110} ${p.y + 150} Z`} fill="#1d2027" stroke="rgba(232,238,242,0.6)" strokeWidth={3} />
                </g>
              ))}
              {/* the feather */}
              <path d={`M${L.x - 50} ${L.y + 140 + Math.sin(frame / 8) * 4} Q${L.x} ${L.y + 90} ${L.x + 60} ${L.y + 120}`} fill="none" stroke={`rgb(${ROSE})`} strokeWidth={4} />
              <path d={`M${L.x - 40} ${L.y + 132} Q${L.x} ${L.y + 104} ${L.x + 50} ${L.y + 118} Q${L.x} ${L.y + 128} ${L.x - 40} ${L.y + 132} Z`} fill={`rgba(${ROSE},0.35)`} />
              {/* the stone */}
              {stone > 0 && <path d={`M${R.x - 80} ${R.y + 150 - (1 - stone) * 500} Q${R.x - 90} ${R.y + 70 - (1 - stone) * 500} ${R.x} ${R.y + 60 - (1 - stone) * 500} Q${R.x + 96} ${R.y + 66 - (1 - stone) * 500} ${R.x + 82} ${R.y + 150 - (1 - stone) * 500} Z`} fill="#3a3640" stroke={`rgb(${RIFT})`} strokeWidth={3} />}
            </svg>
            <div style={{ position: "absolute", left: L.x - 100, width: 200, top: L.y - 70, textAlign: "center", fontSize: 40, fontWeight: 900, color: `rgb(${ROSE})` }}>离开</div>
            <div style={{ position: "absolute", left: R.x - 100, width: 200, top: R.y - 70, textAlign: "center", fontSize: 40, fontWeight: 900, color: `rgb(${RIFT})`, opacity: stone }}>遗憾</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 130, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 8, color: palette.dim }}>轻 · 重</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={frame < c1 ? SKY : RIFT} opacity={0.3} />
      {PLACES.map((_, i) => Math.round((1900 + i * GAP - 780) / SPEED)).filter((at) => at < c1).map((at) => (
        <Sfx key={at} name="shutter" at={at} volume={0.12} />
      ))}
      <Sfx name="whoosh" at={c1 - 3} volume={0.45} />
      <Sfx name="rise" at={c1 + 2 * BEAT} volume={0.3} />
      <Sfx name="boom" at={c1 + 4 * BEAT} volume={0.7} />
      <Sfx name="stamp" at={c1 + 4 * BEAT} volume={0.5} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
