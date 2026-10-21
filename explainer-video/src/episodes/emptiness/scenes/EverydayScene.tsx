import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam } from "../../glass/immersive";
import { PAIN } from "../pendulum";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const DAYS = [
  { d: "第 1 天", v: 1, note: "终于放假！" },
  { d: "第 2 天", v: 0.55, note: "睡到中午" },
  { d: "第 3 天", v: 0.06, note: "无所事事" },
];
const HAVE = ["住 ✓", "吃 ✓", "穿 ✓", "玩 ✓", "钱 ✓"];
const TRIES = ["一个新手机", "去旅行", "一个"];

// Three moments, full screen, a whip-pan between each.
// 1 · 长假倒计时 30 → 0, then the days one per beat, the excitement on each
//     draining: 100% · 55% · 6% — 无所事事.
// 2 · the cart: 结算 — 清空 ✓ — and a happiness line over the afternoon that
//     jumps at 14:00 and is back on the floor by 18:00.
// 3 · everything ticked — 住 吃 穿 玩 钱 — and a note 我想要： where every
//     try gets typed and deleted again.
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : 2;
  const count = Math.round(interpolate(frame, [0, 2 * BEAT], [30, 0], clamp));
  const pay = c1 + 2 * BEAT;
  const curve = interpolate(frame, [pay, c2 - BEAT], [0, 1], clamp);
  // typing and deleting, one try per two beats
  const tt = frame - c2 - BEAT;
  const k = Math.max(0, Math.floor(tt / (2 * BEAT)));
  const within = tt - k * 2 * BEAT;
  const word = TRIES[Math.min(k, TRIES.length - 1)];
  const shown = tt < 0 ? 0 : within < BEAT ? Math.ceil((within / BEAT) * word.length) : Math.max(0, word.length - Math.ceil(((within - BEAT) / (0.6 * BEAT)) * word.length));
  const pts = Array.from({ length: 40 }, (_, i) => {
    const x = i / 39;
    if (x > curve) return null;
    const y = x < 0.05 ? x / 0.05 : Math.exp(-(x - 0.05) * 4.5);
    return `${520 + x * 880},${620 - y * 300}`;
  }).filter(Boolean);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1, c2]} hits={[2 * BEAT, pay]}>
        {seg === 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 6, color: palette.dim }}>长假倒计时</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 160, textAlign: "center", fontFamily: fonts.mono, fontSize: 110, fontWeight: 700, color: count === 0 ? look.key : palette.ink }}>{count === 0 ? "放假！" : `${count} 天`}</div>
            {DAYS.map((d, i) => {
              const p = ramp(frame, 3 * BEAT + i * 2 * BEAT);
              const grey = i === 2;
              return (
                <div key={d.d} style={{ position: "absolute", left: 380 + i * 400, top: 380, width: 360, padding: "22px 26px", borderRadius: 16, background: "rgba(14,20,28,0.9)", border: `2px solid ${grey ? palette.faint : `rgba(${palette.halo},0.6)`}`, opacity: p, transform: `translateY(${(1 - p) * 30}px)` }}>
                  <div style={{ fontSize: 34, fontWeight: 900, color: grey ? palette.dim : palette.ink }}>{d.d}</div>
                  <div style={{ marginTop: 18, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.08)" }}>
                    <div style={{ width: `${d.v * 100 * p}%`, height: "100%", borderRadius: 7, background: grey ? "rgba(232,238,242,0.3)" : look.key }} />
                  </div>
                  <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", fontSize: 24, fontWeight: 700, color: grey ? `rgb(${PAIN})` : palette.dim }}>
                    <span>{d.note}</span>
                    <span style={{ fontFamily: fonts.mono }}>{Math.round(d.v * 100)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 160, top: 180, width: 300, padding: "20px 24px", borderRadius: 16, background: "rgba(14,20,28,0.9)", border: `2px solid ${palette.faint}` }}>
              <div style={{ fontSize: 30, fontWeight: 900 }}>购物车 ({frame < pay ? 12 : 0})</div>
              {["耳机", "外套", "香薰", "键盘"].map((it) => (
                <div key={it} style={{ marginTop: 12, fontSize: 24, color: palette.dim, textDecoration: frame >= pay ? "line-through" : undefined, opacity: frame >= pay ? 0.4 : 1 }}>□ {it}</div>
              ))}
              <div style={{ marginTop: 20, padding: "12px 0", textAlign: "center", borderRadius: 10, background: frame >= pay ? "#3fbf6a" : "#ff7a3d", fontSize: 26, fontWeight: 900, transform: `scale(${frame >= pay && frame < pay + 8 ? 0.92 : 1})` }}>{frame >= pay ? "清空 ✓" : "结算"}</div>
            </div>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <line x1={520} y1={620} x2={1420} y2={620} stroke={palette.faint} strokeWidth={2} />
              <line x1={520} y1={620} x2={520} y2={280} stroke={palette.faint} strokeWidth={2} />
              {pts.length > 1 && <polyline points={pts.join(" ")} fill="none" stroke={look.key} strokeWidth={5} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 8px ${look.keyGlow})` }} />}
              {["14:00", "15:00", "16:00", "17:00", "18:00"].map((t, i) => (
                <text key={t} x={520 + i * 220} y={660} textAnchor="middle" fontFamily={fonts.mono} fontSize={20} fill={palette.dim}>{t}</text>
              ))}
              <text x={540} y={270} fontSize={26} fontWeight={800} fill={palette.dim}>快乐</text>
            </svg>
            <div style={{ position: "absolute", left: 1180, top: 520, fontSize: 30, fontWeight: 900, color: `rgb(${PAIN})`, opacity: curve > 0.9 ? 1 : 0 }}>又空了</div>
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 260, top: 200, display: "flex", flexDirection: "column", gap: 14 }}>
              {HAVE.map((h, i) => (
                <div key={h} style={{ padding: "10px 24px", borderRadius: 12, border: `2px solid rgba(63,191,106,0.6)`, color: "#7fe0a0", fontSize: 30, fontWeight: 800, opacity: ramp(frame, c2 + i * 4, 6) }}>{h}</div>
              ))}
              <div style={{ fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim, marginTop: 8 }}>什么都不缺</div>
            </div>
            <div style={{ position: "absolute", left: 760, top: 180, width: 820, height: 500, borderRadius: 12, background: "#e8e2d4", boxShadow: "0 20px 50px rgba(0,0,0,0.6)", padding: "40px 50px" }}>
              <div style={{ fontSize: 50, fontWeight: 900, color: "#2a2118" }}>我想要：</div>
              <div style={{ marginTop: 40, height: 80, borderBottom: "2px solid rgba(42,33,24,0.3)", display: "flex", alignItems: "flex-end", paddingBottom: 8, fontSize: 48, fontWeight: 700, color: "#5a4a38" }}>
                {word.slice(0, shown)}
                <span style={{ display: "inline-block", width: 4, height: 50, marginLeft: 4, background: "#2a2118", opacity: Math.floor(frame / 8) % 2 ? 1 : 0 }} />
              </div>
              {[0, 1].map((i) => (
                <div key={i} style={{ height: 80, borderBottom: "2px solid rgba(42,33,24,0.3)" }} />
              ))}
            </div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} />
      <Sfx name="stamp" at={2 * BEAT} volume={0.4} />
      {DAYS.map((_, i) => (
        <Sfx key={i} name="shutter" at={3 * BEAT + i * 2 * BEAT} volume={0.2} />
      ))}
      <Sfx name="whoosh" at={c1 - 3} volume={0.5} />
      <Sfx name="glint" at={pay} volume={0.45} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.5} />
      {HAVE.map((_, i) => (
        <Sfx key={i} name="stamp" at={c2 + i * 4} volume={0.12} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
