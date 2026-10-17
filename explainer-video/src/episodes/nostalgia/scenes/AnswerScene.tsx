import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { FLOOR, Road, SEPIA, Walker } from "../road";
import { stride, walkX } from "./HookScene";
import { Person } from "../../solitude/porcupine";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const FIELDS = ["职业", "城市", "成为"];

// 0 · the road, him walking backwards, eyes on the photos.
// 1 · the kid in the photo, with a form: 职业 ___ 城市 ___ 成为 ___ — all blank.
// 2 · from the kid, rays in every direction: 可能 ×∞. Beside him, the grown-up
//     with every field filled in: 已定.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const t1 = frame - cues[1], t2 = frame - cues[2];
  const rays = interpolate(t2, [0, 4 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const nRays = 36;
  return (
    <ObsFrame duration={duration}>
      {frame < cues[1] && (
        <>
          <Road frame={frame} />
          <Walker x={walkX(frame, 880)} bottom={FLOOR} face="left" walk={stride(frame)} lean={-3} />
        </>
      )}
      {frame >= cues[1] && (
        <>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 34% 55%, rgba(${SEPIA},0.25), transparent 50%)` }} />
          <Horizon y={FLOOR} />
          {t2 >= 0 && (
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              {Array.from({ length: nRays }, (_, i) => {
                const a = (i / nRays) * Math.PI * 2;
                const L = (220 + (i % 4) * 90) * rays;
                return <line key={i} x1={640} y1={FLOOR - 110} x2={640 + Math.cos(a) * L} y2={FLOOR - 110 + Math.sin(a) * L * 0.8} stroke={`rgba(${SEPIA},${0.25 + 0.4 * ((i % 3) / 2)})`} strokeWidth={2} strokeDasharray="6 8" />;
              })}
            </svg>
          )}
          <Person x={640} bottom={FLOOR} height={170} glow={1.1} rgb={SEPIA} />
          <div style={{ position: "absolute", left: 300, top: 220, fontFamily: fonts.mono, fontSize: 24, lineHeight: 2, color: `rgb(${SEPIA})`, opacity: Math.min(1, t1 / 6) }}>
            {FIELDS.map((f) => (
              <div key={f}>{f}：<span style={{ display: "inline-block", width: 160, borderBottom: `2px solid rgba(${SEPIA},0.7)` }}>&nbsp;</span></div>
            ))}
            <div style={{ color: palette.accent, fontSize: 22 }}>{t2 >= 0 ? `可能 ×${rays < 1 ? Math.round(rays * 999) : "∞"}` : "未定义"}</div>
          </div>
          {t2 >= 2 * BEAT && (
            <>
              <Person x={1360} bottom={FLOOR} height={250} glow={0.3} />
              <div style={{ position: "absolute", left: 1480, top: 360, fontFamily: fonts.mono, fontSize: 24, lineHeight: 2, color: palette.dim }}>
                {FIELDS.map((f) => (
                  <div key={f}>{f}：已定 ✓</div>
                ))}
              </div>
              <div style={{ position: "absolute", left: 1300, top: FLOOR + 20, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim }}>现在的你</div>
            </>
          )}
          <div style={{ position: "absolute", left: 560, top: FLOOR + 20, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: `rgb(${SEPIA})` }}>那时的你</div>
        </>
      )}
      {Array.from({ length: 4 }, (_, k) => (
        <Sfx key={k} name="step" at={(k + 1) * BEAT} volume={0.15} />
      ))}
      <Sfx name="shutter" at={cues[1]} volume={0.35} />
      <Sfx name="rise" at={cues[2]} volume={0.35} />
      <Sfx name="glint" at={cues[2] + 4 * BEAT} volume={0.4} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
