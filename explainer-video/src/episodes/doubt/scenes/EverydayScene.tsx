import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Stander } from "../circles";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const W = 500;
const H = 600;
const TOP = 140;
const XS = [370, 960, 1550];
const GREEN = "#46d39a";

const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
// a stamp: slams down from twice the size
const slam = (frame: number, at: number) => {
  const p = ramp(frame, at, 6);
  return { opacity: p > 0 ? 1 : 0, transform: `scale(${2 - p})` };
};

const Panel: React.FC<{ i: number; on: number; active: number; tag: string; children: React.ReactNode }> = ({ i, on, active, tag, children }) => (
  <div
    style={{
      position: "absolute",
      left: XS[i] - W / 2,
      top: TOP + (1 - on) * 40,
      width: W,
      height: H,
      opacity: on * (0.35 + 0.65 * active),
      overflow: "hidden",
      borderRadius: 16,
      border: `2px solid ${active > 0.5 ? palette.accent : palette.faint}`,
      background: "rgba(10,14,20,0.82)",
      boxShadow: active > 0.5 ? `0 0 40px rgba(${palette.accentRgb},0.18)` : undefined,
    }}
  >
    <div style={{ position: "absolute", left: 22, top: 16, fontFamily: fonts.mono, fontSize: 18, letterSpacing: 4, color: palette.dim }}>{tag}</div>
    {children}
  </div>
);

const Paper: React.FC<{ top: number; h: number; title: string; children?: React.ReactNode }> = ({ top, h, title, children }) => (
  <div style={{ position: "absolute", left: 60, top, width: 380, height: h, borderRadius: 6, background: "#e6eaee", boxShadow: "0 12px 30px rgba(0,0,0,0.5)" }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 16, textAlign: "center", fontSize: 30, fontWeight: 900, color: "#1a1f26", letterSpacing: 6 }}>{title}</div>
    {children}
  </div>
);

const Bars: React.FC<{ top: number; n: number; gap?: number; w?: number }> = ({ top, n, gap = 26, w = 300 }) => (
  <>
    {Array.from({ length: n }, (_, k) => (
      <div key={k} style={{ position: "absolute", left: 40, top: top + k * gap, width: w - (k % 3) * 40, height: 8, borderRadius: 4, background: "#b9c1ca" }} />
    ))}
  </>
);

const Clover: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <svg width={44 * s} height={50 * s} viewBox="-22 -22 44 50" style={{ position: "absolute", left: x, top: y }}>
    <g fill="#46d39a" stroke="#0a3a26" strokeWidth={1}>
      {[0, 90, 180, 270].map((a) => (
        <path key={a} d="M0 0 C -12 -6 -10 -20 0 -14 C 10 -20 12 -6 0 0 Z" transform={`rotate(${a + 45})`} />
      ))}
    </g>
    <path d="M0 2 Q 4 16 -2 26" stroke="#46d39a" strokeWidth={3} fill="none" />
  </svg>
);

const Bubble: React.FC<{ x: number; y: number; p: number; children: React.ReactNode }> = ({ x, y, p, children }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity: p, transform: `scale(${0.8 + 0.2 * p})`, transformOrigin: "0% 100%", padding: "12px 20px", borderRadius: 26, background: "rgba(232,238,242,0.1)", border: "2px dashed rgba(232,238,242,0.5)", fontSize: 30, fontWeight: 800, color: palette.ink, whiteSpace: "nowrap" }}>
    {children}
  </div>
);

// Three cases, a panel each, side by side; the panel being talked about lights
// up, the others dim.
// 1 · 升职通知, stamped 恭喜 — and over his head: 我是不是运气好？ (a clover)
// 2 · a report: eleven ticks, one cross; a magnifier finds the cross and
//     stays there. ✓ ×11 — 只记得 ✕ ×1
// 3 · an exam, 98 in red — and a searchlight from the dark: 下一次…
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const on = cues.map((c) => ramp(frame, c, 10));
  const active = (i: number) => (frame >= cues[i] && (i + 1 >= cues.length || frame < cues[i + 1]) ? 1 : 0);
  const [c1, c2, c3] = cues;
  const ticks = Math.max(0, Math.min(12, Math.floor((frame - c2 - HALF_BEAT) / (HALF_BEAT / 2)) + 1));
  const lens = interpolate(frame, [c2 + 5 * BEAT, c2 + 6 * BEAT], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const beam = ramp(frame, c3 + 3 * BEAT, 10);
  const sweep = Math.sin((frame - c3) / 14) * 10;
  return (
    <ObsFrame duration={duration}>
      {/* 1 · promotion */}
      <Panel i={0} on={on[0]} active={active(0)} tag="CASE 01 · 升职">
        <Paper top={64} h={250} title="升职通知">
          <Bars top={80} n={5} />
          <div style={{ position: "absolute", right: 26, bottom: 18, width: 110, height: 110, borderRadius: "50%", border: `5px solid ${palette.alert}`, color: palette.alert, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 900, rotate: "-14deg", ...slam(frame, c1 + BEAT) }}>恭喜</div>
        </Paper>
        <Stander x={120} bottom={H - 30} height={170} lift={0} glow={0.7} />
        <Bubble x={190} y={370} p={ramp(frame, c1 + 3 * BEAT)}>
          我是不是<br />运气好？
        </Bubble>
        <div style={{ opacity: ramp(frame, c1 + 3 * BEAT + HALF_BEAT) }}>
          <Clover x={400} y={470} s={1.3} />
        </div>
      </Panel>

      {/* 2 · the report */}
      <Panel i={1} on={on[1]} active={active(1)} tag="CASE 02 · 报告">
        <Paper top={64} h={400} title="季度报告">
          {Array.from({ length: 12 }, (_, k) => {
            const bad = k === 7;
            const shown = k < ticks;
            return (
              <div key={k} style={{ position: "absolute", left: 30, top: 70 + k * 26, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 250 - (k % 3) * 40, height: 8, borderRadius: 4, background: "#b9c1ca" }} />
                <div style={{ fontSize: 22, fontWeight: 900, color: bad ? palette.alert : GREEN, opacity: shown ? 1 : 0, transform: `scale(${shown ? 1 : 2})` }}>{bad ? "✕" : "✓"}</div>
              </div>
            );
          })}
        </Paper>
        {/* the magnifier, parked on the one cross */}
        {lens > 0 && (
          <div style={{ position: "absolute", left: 60 + 30 + 210 + (1 - lens) * 220, top: 64 + 70 + 7 * 26 + 8 - (1 - lens) * 220, opacity: lens }}>
            <div style={{ position: "absolute", left: -66, top: -66, width: 132, height: 132, borderRadius: "50%", border: "6px solid #c9d3dc", background: "rgba(255,240,240,0.9)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 76, fontWeight: 900, color: palette.alert, boxShadow: `0 0 30px rgba(255,77,109,${0.3 + 0.3 * Math.abs(Math.sin(frame / 6))})` }}>✕</div>
            <div style={{ position: "absolute", left: 40, top: 40, width: 16, height: 90, borderRadius: 6, background: "#8a95a0", transform: "rotate(-45deg)", transformOrigin: "50% 0" }} />
          </div>
        )}
        <div style={{ position: "absolute", left: 0, right: 0, top: 500, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 40, opacity: ramp(frame, c2 + 6 * BEAT) }}>
          <span style={{ fontFamily: fonts.mono, fontSize: 26, color: palette.dim }}>
            <span style={{ color: GREEN }}>✓</span> ×11
          </span>
          <span style={{ fontSize: 24, color: palette.dim }}>只记得</span>
          <span style={{ fontFamily: fonts.mono, fontSize: 44, fontWeight: 700, color: palette.alert, textShadow: `0 0 16px ${palette.alert}` }}>✕ ×1</span>
        </div>
      </Panel>

      {/* 3 · the exam */}
      <Panel i={2} on={on[2]} active={active(2)} tag="CASE 03 · 考试">
        <Paper top={64} h={250} title="期末考试">
          <Bars top={80} n={5} w={240} />
          <div style={{ position: "absolute", right: 24, top: 70, width: 120, height: 100, borderRadius: "50%", border: `5px solid ${palette.alert}`, color: palette.alert, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, fontWeight: 900, fontFamily: fonts.mono, rotate: "-8deg", ...slam(frame, c3 + BEAT) }}>98</div>
        </Paper>
        {/* the searchlight */}
        {beam > 0 && (
          <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: beam }}>
            <defs>
              <linearGradient id="ev-beam" x1="1" y1="0" x2="0" y2="0.6">
                <stop offset="0" stopColor="rgba(232,238,242,0.55)" />
                <stop offset="1" stopColor="rgba(232,238,242,0)" />
              </linearGradient>
            </defs>
            <polygon points={`${W + 10},330 ${70 + sweep * 3},${H - 10} ${250 + sweep * 3},${H + 10}`} fill="url(#ev-beam)" />
            <circle cx={W - 6} cy={330} r={16} fill="rgba(232,238,242,0.9)" />
          </svg>
        )}
        <Stander x={150} bottom={H - 30} height={170} lift={0} glow={0.5 + 0.5 * beam} rgb={beam > 0.5 ? "232, 238, 242" : palette.halo} />
        <div style={{ position: "absolute", right: 30, top: 370, fontSize: 32, fontWeight: 800, color: palette.ink, opacity: beam }}>下一次…</div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 14, textAlign: "center", fontFamily: fonts.mono, fontSize: 15, letterSpacing: 3, color: look.key, opacity: ramp(frame, c3 + 5 * BEAT) }}>IMPOSTOR SYNDROME · 冒名顶替综合征</div>
      </Panel>

      <Sfx name="whoosh" at={c1} volume={0.25} />
      <Sfx name="stamp" at={c1 + BEAT} volume={0.6} />
      <Sfx name="glint" at={c1 + 3 * BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c2} volume={0.25} />
      {Array.from({ length: 12 }, (_, k) => (
        <Sfx key={k} name="shutter" at={c2 + HALF_BEAT + Math.round(k * (HALF_BEAT / 2))} volume={k === 7 ? 0.3 : 0.1} />
      ))}
      <Sfx name="glitch" at={c2 + 5 * BEAT} volume={0.35} />
      <Sfx name="whoosh" at={c3} volume={0.25} />
      <Sfx name="stamp" at={c3 + BEAT} volume={0.6} />
      <Sfx name="rise" at={c3 + 2 * BEAT} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
