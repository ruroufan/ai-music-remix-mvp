import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { FILTER_RGB, Face, MirrorGlass } from "../faces";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const TILE = { w: 210, h: 270, gap: 24 };
// the mirror, and where the face's features land on screen (face size 430 at
// (190, 270) inside a 380 × 520 glass centred on (960, 450))
const M = { x: 960, y: 450, w: 380, h: 520 };
const K = 430 / 520;
const at = (fx: number, fy: number) => ({ x: M.x - M.w / 2 + 190 - 200 * K + fx * K, y: M.y - M.h / 2 + 270 - 260 * K + fy * K });
const FLAWS = [
  { label: "毛孔", p: at(146, 304), side: -1 },
  { label: "雀斑", p: at(200, 266), side: 1 },
  { label: "黑眼圈", p: at(158, 257), side: -1 },
  { label: "细纹", p: at(276, 234), side: 1 },
  { label: "痘痘", p: at(262, 332), side: 1 },
  { label: "痣", p: at(238, 356), side: -1 },
];

// 0 · a wall of the same smooth faces, scrolling up and up; a stamp lands on
//     it: 正常. The day's screen time ticks up in the corner.
// 1 · the mirror, the real face — and a scanner goes over it like an app,
//     ringing every pore, freckle, spot and line in red, one per half beat:
//     检测到 6 处错误. The face looks down.
export const NormalScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const c1 = cues[1];
  const out = interpolate(frame, [c1 - 6, c1 + 4], [1, 0], clamp);
  const stamp = ramp(frame, 4 * BEAT, 6);
  const mins = Math.round(interpolate(frame, [0, c1], [3 * 60 + 2, 3 * 60 + 27], clamp));
  const mirror = ramp(frame, c1 - 4, 10);
  const scan = interpolate(frame, [c1 + 4, c1 + BEAT + 4], [0, 1], clamp);
  const err = ramp(frame, c1 + 5 * BEAT, 6);
  const down = interpolate(frame, [c1 + 6 * BEAT, c1 + 7 * BEAT], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      {out > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: out, overflow: "hidden" }}>
          {Array.from({ length: 24 }, (_, i) => {
            const c = i % 6, r = Math.floor(i / 6);
            const y = 120 + r * (TILE.h + TILE.gap) - ((frame * 4) % (TILE.h + TILE.gap)) - (c % 2) * 60;
            return (
              <div key={i} style={{ position: "absolute", left: 105 + c * (TILE.w + 70), top: y, width: TILE.w, height: TILE.h, borderRadius: 16, overflow: "hidden", background: "#11151b", border: `1px solid rgba(${FILTER_RGB},0.3)`, opacity: 0.75 }}>
                <Face id={`nm-${i}`} x={TILE.w / 2} y={TILE.h / 2 + 6} size={250} smooth={1} bright={0.9} slim={0.8} eyes={0.7} rim={0} />
              </div>
            );
          })}
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, transparent 30%, rgba(6,8,12,0.75) 85%)" }} />
          {stamp > 0 && (
            <div style={{ position: "absolute", left: 960 - 190, top: 300, width: 380, height: 170, display: "flex", alignItems: "center", justifyContent: "center", border: `8px solid ${look.key}`, borderRadius: 18, fontSize: 110, fontWeight: 900, letterSpacing: 24, paddingLeft: 24, color: look.key, background: "rgba(6,8,12,0.7)", textShadow: `0 0 26px ${look.keyGlow}`, opacity: stamp, transform: `rotate(-6deg) scale(${1.8 - 0.8 * stamp})` }}>
              正常
            </div>
          )}
          <div style={{ position: "absolute", right: 120, top: 120, padding: "8px 16px", borderRadius: 12, background: "rgba(6,8,12,0.85)", fontFamily: fonts.mono, fontSize: 20, color: palette.ink }}>
            今日屏幕使用 <span style={{ color: palette.alert }}>{Math.floor(mins / 60)}h {String(mins % 60).padStart(2, "0")}m</span>
          </div>
        </div>
      )}
      {frame >= c1 - 4 && (
        <div style={{ position: "absolute", inset: 0, opacity: mirror }}>
          <MirrorGlass x={M.x} y={M.y} w={M.w} h={M.h} light={0.6 - 0.3 * err}>
            <Face id="nm-me" x={190} y={270} size={430} gaze={down} smile={-0.3 * down} rim={0.4} />
            {scan > 0 && scan < 1 && <div style={{ position: "absolute", left: 0, right: 0, top: scan * M.h, height: 4, background: palette.alert, boxShadow: `0 0 16px ${palette.alert}` }} />}
          </MirrorGlass>
          {FLAWS.map((f, i) => {
            const p = ramp(frame, c1 + BEAT + 4 + i * HALF_BEAT, 5);
            if (p <= 0) return null;
            const lx = f.side < 0 ? 640 : 1280;
            const ly = 250 + i * 70;
            return (
              <div key={f.label} style={{ position: "absolute", inset: 0, opacity: p }}>
                <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
                  <circle cx={f.p.x} cy={f.p.y} r={14 + (1 - p) * 20} fill="none" stroke={palette.alert} strokeWidth={3} />
                  <line x1={f.p.x + f.side * 14} y1={f.p.y} x2={lx + (f.side < 0 ? 0 : 0)} y2={ly} stroke="rgba(255,77,109,0.6)" strokeWidth={1.6} />
                </svg>
                <div style={{ position: "absolute", left: f.side < 0 ? lx - 150 : lx, width: 150, top: ly - 20, textAlign: f.side < 0 ? "right" : "left", padding: "0 10px", fontSize: 28, fontWeight: 800, color: palette.alert }}>✕ {f.label}</div>
              </div>
            );
          })}
          {err > 0 && (
            <div style={{ position: "absolute", left: 960 - 230, top: 640, width: 460, padding: "14px 0", textAlign: "center", borderRadius: 14, background: "rgba(40,6,14,0.92)", border: `2px solid ${palette.alert}`, opacity: err, transform: `scale(${1.3 - 0.3 * err})`, boxShadow: `0 0 30px rgba(255,77,109,0.35)` }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: palette.alert }}><span style={{ fontFamily: fonts.mono, fontSize: 20, letterSpacing: 3, marginRight: 14 }}>ERROR</span>检测到 6 处“错误”</div>
            </div>
          )}
        </div>
      )}
      <Sfx name="stamp" at={4 * BEAT} volume={0.7} />
      <Sfx name="rise" at={c1} volume={0.25} />
      {FLAWS.map((_, i) => (
        <Sfx key={i} name="glitch" at={c1 + BEAT + 4 + i * HALF_BEAT} volume={0.16} />
      ))}
      <Sfx name="stamp" at={c1 + 5 * BEAT} volume={0.5} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
