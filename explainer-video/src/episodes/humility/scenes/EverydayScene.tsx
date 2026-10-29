import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bubble, MaskedFigure } from "../mask";
import { Person } from "../../solitude/porcupine";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const FLOOR = 780;
const ROUNDS = [
  { praise: "你好厉害！", reply: "哪里哪里" },
  { praise: "PPT 做得真好", reply: "哪里哪里" },
  { praise: "今天好好看", reply: "哪里哪里" },
];

// 1 · a perfect score — "全靠运气" — next to your 71, and your discomfort meter climbing.
// 2 · a polished painting, "随便弄弄"; under the mask his eyes are on you; a
//     progress bar: waiting for praise…
// 3 · praise in, "哪里哪里" out — every time, in a fifth of a second. Auto-reply.
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const seg = (i: number) => frame >= cues[i] && (i + 1 >= cues.length || frame < cues[i + 1]);
  const segIn = (i: number) => interpolate(frame, [cues[i], cues[i] + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t0 = frame - cues[0], t1 = frame - cues[1], t2 = frame - cues[2];
  const stamp = interpolate(t0, [BEAT, BEAT + 4], [1.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ouch = interpolate(t0, [3 * BEAT, 7 * BEAT], [0.1, 0.92], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const wait = interpolate(t1, [2 * BEAT, 7 * BEAT], [0, 0.99], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <ObsFrame duration={duration}>
      {seg(0) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(0) }}>
          <Horizon y={FLOOR} />
          <MaskedFigure x={420} bottom={FLOOR} height={240} glow={0.7} />
          <Bubble x={500} y={470} text="这次全靠运气～" tone="humble" size={32} opacity={t0 >= 2 * BEAT ? 1 : 0} />
          {/* his paper and yours */}
          {[
            { x: 760, score: "100", color: palette.alert, s: stamp, label: "他" },
            { x: 1200, score: "71", color: "#c98b5f", s: 1, label: "你" },
          ].map((p) => (
            <div key={p.label} style={{ position: "absolute", left: p.x, top: 230, width: 300, height: 400, background: "linear-gradient(#e9e6df, #cfcac0)", transform: `rotate(${p.label === "他" ? -3 : 4}deg)`, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}>
              {Array.from({ length: 8 }, (_, i) => (
                <div key={i} style={{ position: "absolute", left: 30, top: 150 + i * 28, width: 200 - (i % 3) * 40, height: 6, borderRadius: 3, background: "rgba(26,23,20,0.25)" }} />
              ))}
              <div style={{ position: "absolute", left: 30, top: 24, fontFamily: fonts.mono, fontSize: 84, fontWeight: 700, color: p.color, transform: `scale(${p.s})`, transformOrigin: "0 50%" }}>{p.score}</div>
              <div style={{ position: "absolute", right: 20, top: 20, fontSize: 24, color: "#3a3128", fontWeight: 700 }}>{p.label}</div>
            </div>
          ))}
          <div style={{ position: "absolute", left: 1560, top: 280, width: 26, height: 300, border: `1px solid ${palette.faint}` }}>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${ouch * 100}%`, background: palette.alert }} />
          </div>
          <div style={{ position: "absolute", left: 1530, top: 600, width: 90, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 2, color: palette.alert }}>难受 {Math.round(ouch * 100)}</div>
        </div>
      )}

      {seg(1) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(1) }}>
          <Horizon y={FLOOR} />
          {/* the easel and an obviously laboured painting */}
          <div style={{ position: "absolute", left: 980, top: 200, width: 460, height: 340, border: "10px solid #6b4a36", background: "linear-gradient(#2c4a78, #d98a5a 70%, #3a2a1e)" }}>
            <div style={{ position: "absolute", left: 60, top: 70, width: 70, height: 70, borderRadius: 35, background: "#ffd9a0", boxShadow: "0 0 40px #ffb070" }} />
            <svg width={440} height={320} style={{ position: "absolute", inset: 0 }}>
              <path d="M0 250 L90 160 L170 230 L270 120 L440 260 L440 320 L0 320 Z" fill="#1d2433" />
            </svg>
            {[0, 1, 2, 3].map((k) => (
              <div key={k} style={{ position: "absolute", left: 40 + k * 110, top: 30 + (k % 2) * 200, color: "#fff7d6", fontSize: 30, opacity: 0.4 + 0.6 * Math.abs(Math.sin(frame / 6 + k)) }}>✦</div>
            ))}
          </div>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <line x1={1060} y1={550} x2={1010} y2={FLOOR} stroke="#6b4a36" strokeWidth={8} />
            <line x1={1360} y1={550} x2={1410} y2={FLOOR} stroke="#6b4a36" strokeWidth={8} />
          </svg>
          <MaskedFigure x={720} bottom={FLOOR} height={240} xray={0.55} glow={0.7} />
          <Bubble x={780} y={470} text="我随便弄弄的" tone="humble" size={32} flip />
          <div style={{ position: "absolute", left: 980, top: 600, width: 460, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 3, color: palette.dim }}>
            等待夸奖… {Math.round(wait * 100)}%
            <div style={{ marginTop: 10, height: 10, background: palette.faint }}>
              <div style={{ width: `${wait * 100}%`, height: "100%", background: palette.accent }} />
            </div>
          </div>
        </div>
      )}

      {seg(2) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(2) }}>
          <Horizon y={FLOOR} />
          <Person x={560} bottom={FLOOR} height={240} glow={0.5} />
          <MaskedFigure x={1360} bottom={FLOOR} height={240} glow={0.6} />
          {ROUNDS.map((r, i) => {
            const at = BEAT + i * 3 * BEAT;
            if (t2 < at) return null;
            const old = t2 >= at + 3 * BEAT;
            return (
              <React.Fragment key={i}>
                <Bubble x={620} y={480 - (old ? 0 : 0)} text={r.praise} tone="praise" size={34} opacity={old ? 0 : 1} pop={Math.min(1, (t2 - at) / 4)} />
                {t2 >= at + 6 && <Bubble x={1300} y={480} text={r.reply} tone="humble" size={34} flip opacity={old ? 0 : 1} pop={Math.min(1, (t2 - at - 6) / 3)} />}
              </React.Fragment>
            );
          })}
          <div style={{ position: "absolute", left: 1180, top: 560, fontFamily: fonts.mono, fontSize: 28, letterSpacing: 4, color: palette.alert, opacity: t2 >= BEAT + 6 ? 1 : 0 }}>
            [自动回复] 0.2s · ×{Math.max(0, Math.min(3, Math.floor((t2 - BEAT - 6) / (3 * BEAT)) + 1))}
          </div>
        </div>
      )}

      <Sfx name="stamp" at={cues[0] + BEAT} volume={0.6} />
      <Sfx name="glint" at={cues[0] + 2 * BEAT} volume={0.25} />
      <Sfx name="rise" at={cues[0] + 3 * BEAT} volume={0.25} />
      <Sfx name="glint" at={cues[1]} volume={0.3} />
      {ROUNDS.map((_, i) => (
        <React.Fragment key={i}>
          <Sfx name="shutter" at={cues[2] + BEAT + i * 3 * BEAT} volume={0.25} />
          <Sfx name="glitch" at={cues[2] + BEAT + i * 3 * BEAT + BEAT / 2} volume={0.25} />
        </React.Fragment>
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
