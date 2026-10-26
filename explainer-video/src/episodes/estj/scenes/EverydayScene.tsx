import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { GOLD, LEAF, RED, STEEL } from "../ruler";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const DISHES = ["锅", "碗", "盘", "杯"];

// Three moments, full screen, a whip-pan between each.
// 1 · an application form: 第一志愿 · 艺术设计 — a red pen strikes it and
//     writes over it: 金融. 已把关.
// 2 · a colleague's flowchart, a bit crooked but it works ✓ — and a meter
//     beside it climbing: 难受 ↑↑↑ — until he redraws it dead straight.
// 3 · the dish rack in someone else's order — 锅 碗 盘 杯 — and his hand
//     shuffles them back to his: 杯 碗 盘 锅. 顺序不对.
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : 2;
  const strike = interpolate(frame, [3 * BEAT, 3 * BEAT + 6], [0, 1], clamp);
  const fin = ramp(frame, 4 * BEAT, 8);
  const itch = interpolate(frame, [c1 + BEAT, c1 + 5 * BEAT], [0.2, 1], clamp);
  const fix = ramp(frame, c1 + 6 * BEAT, 10);
  const shuffle = interpolate(frame, [c2 + 4 * BEAT, c2 + 6 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const order = [3, 1, 2, 0];
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1, c2]} hits={[3 * BEAT, c1 + 6 * BEAT, c2 + 4 * BEAT, ...keyHits(lines, cues, duration)]}>
        {seg === 0 && (
          <div style={{ position: "absolute", left: 560, top: 180, width: 800, height: 560, background: "#efe8d8", color: "#262019", padding: "40px 50px", boxShadow: "0 18px 40px rgba(0,0,0,0.55)" }}>
            <div style={{ fontSize: 40, fontWeight: 900 }}>高考志愿填报表</div>
            <div style={{ marginTop: 50, fontSize: 32 }}>考生：小宇</div>
            <div style={{ marginTop: 30, fontSize: 36, position: "relative" }}>
              第一志愿：<span style={{ position: "relative", color: "#2a5a9a" }}>艺术设计<span style={{ position: "absolute", left: -6, right: -6, top: "50%", height: 5, background: `rgb(${RED})`, transformOrigin: "0 50%", transform: `scaleX(${strike})` }} /></span>
              <span style={{ marginLeft: 26, color: `rgb(${RED})`, fontWeight: 900, opacity: fin, fontSize: 46, fontStyle: "italic" }}>金融</span>
            </div>
            <div style={{ position: "absolute", right: 50, bottom: 40, padding: "6px 20px", border: `4px solid rgb(${RED})`, color: `rgb(${RED})`, fontSize: 36, fontWeight: 900, transform: "rotate(-10deg)", opacity: fin }}>已把关</div>
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              {[[420, 260], [620, 420], [460, 560], [700, 700]].map(([x, y], i, a) => {
                const sx = x + (600 - x) * fix, sy = 260 + i * 150;
                const nx = i < a.length - 1 ? a[i + 1][0] + (600 - a[i + 1][0]) * fix : 0;
                return (
                  <g key={i}>
                    {i < a.length - 1 && <line x1={sx} y1={(fix ? sy : y) + 30} x2={nx} y2={(fix ? 260 + (i + 1) * 150 : a[i + 1][1]) - 30} stroke={`rgba(${STEEL},0.7)`} strokeWidth={3} />}
                    <rect x={sx - 80} y={(fix ? sy : y) - 30} width={160} height={60} rx={10} fill="#1a1d23" stroke={`rgb(${fix > 0.5 ? GOLD : STEEL})`} strokeWidth={3} transform={`rotate(${(1 - fix) * (i % 2 ? 6 : -5)} ${sx} ${fix ? sy : y})`} />
                  </g>
                );
              })}
            </svg>
            <div style={{ position: "absolute", left: 760, top: 690, fontSize: 40, fontWeight: 900, color: `rgb(${LEAF})`, opacity: 1 - fix }}>能跑通 ✓</div>
            <div style={{ position: "absolute", left: 1280, top: 220, width: 60, height: 460, borderRadius: 30, border: "3px solid rgba(232,238,242,0.4)", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${itch * 100 * (1 - 0.8 * fix)}%`, background: `rgb(${RED})` }} />
            </div>
            <div style={{ position: "absolute", left: 1230, width: 160, top: 700, textAlign: "center", fontFamily: fonts.mono, fontSize: 26, color: `rgb(${RED})` }}>难受 {"↑".repeat(Math.max(1, Math.round(itch * 3)))}</div>
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 460, top: 640, width: 1000, height: 20, background: "#c9ced4" }} />
            {DISHES.map((d, i) => {
              const to = order.indexOf(i);
              const x = 520 + (i + (to - i) * shuffle) * 230;
              return <div key={d} style={{ position: "absolute", left: x, top: 470 - Math.sin(shuffle * Math.PI) * 60 * (i % 2 ? 1 : -1), width: 180, height: 160, borderRadius: d === "盘" ? 90 : 18, border: `4px solid rgb(${STEEL})`, background: "#1a1d23", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60, fontWeight: 900, color: palette.ink }}>{d}</div>;
            })}
            <div style={{ position: "absolute", left: 0, right: 0, top: 220, textAlign: "center", fontSize: 50, fontWeight: 900, color: `rgb(${RED})`, opacity: ramp(frame, c2 + 2 * BEAT, 6) * (1 - shuffle) }}>顺序不对</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 220, textAlign: "center", fontSize: 50, fontWeight: 900, color: `rgb(${GOLD})`, opacity: ramp(frame, c2 + 6 * BEAT, 6) }}>这样才对 ✓</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} opacity={0.35} />
      <Sfx name="stamp" at={3 * BEAT} volume={0.35} />
      <Sfx name="stamp" at={4 * BEAT} volume={0.45} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.5} />
      <Sfx name="rise" at={c1 + BEAT} volume={0.25} />
      <Sfx name="glint" at={c1 + 6 * BEAT} volume={0.35} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.5} />
      <Sfx name="whoosh" at={c2 + 4 * BEAT} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
