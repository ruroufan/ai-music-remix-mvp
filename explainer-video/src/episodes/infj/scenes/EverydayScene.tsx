import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Eyes, Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { COOL, LAMP } from "../lantern";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const ASKS = [["要不要辞职？", "先存半年钱再说"], ["该不该分手？", "你其实早有答案"], ["我是不是很差？", "你只是太累了"]];

// Three moments, full screen, a whip-pan between each.
// 1 · a friend's eyes, just a little crease between the brows — his lamp
//     catches it: 不开心. Then him, a rain cloud over his head — and all he
//     says: 没事.
// 2 · other people's questions, each one answered, ✓ ✓ ✓ — and his own
//     card, face down, never turned over.
// 3 · a thread between him and a friend; a jar fills, drop by drop: 失望.
//     When it's full, the thread is cut — no word, no sound.
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : 2;
  const caught = ramp(frame, 2 * BEAT, 6);
  const meIn = ramp(frame, 5 * BEAT, 10);
  const fine = ramp(frame, 7 * BEAT, 6);
  const drops = Math.max(0, Math.min(8, Math.floor((frame - c2 - BEAT) / (BEAT / 2))));
  const cut = interpolate(frame, [c2 + 6 * BEAT, c2 + 6 * BEAT + 4], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1, c2]} hits={[2 * BEAT, 7 * BEAT, ...ASKS.map((_, i) => c1 + (i + 1) * BEAT), c2 + 6 * BEAT, ...keyHits(lines, cues, duration)]}>
        {seg === 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ opacity: 1 - meIn, position: "absolute", inset: 0 }}>
              <Eyes x={960} y={420} scale={0.9} frown={0.6} />
              <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: caught }}>
                <rect x={900} y={290} width={120} height={90} fill="none" stroke={`rgb(${LAMP})`} strokeWidth={3} />
              </svg>
              <div style={{ position: "absolute", left: 1040, top: 260, fontSize: 40, fontWeight: 900, color: `rgb(${LAMP})`, opacity: caught, textShadow: `0 0 16px rgba(${LAMP},0.8)` }}>不开心 ✓</div>
              <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 8, color: palette.dim, opacity: caught }}>一个眼神 · 0.3 秒</div>
            </div>
            {meIn > 0 && (
              <div style={{ position: "absolute", inset: 0, opacity: meIn }}>
                <Stander x={960} bottom={860} height={380} lift={0} glow={0.4} rgb={COOL} />
                <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
                  <path d="M800 300 Q800 220 880 230 Q910 170 990 190 Q1060 160 1100 230 Q1170 240 1150 300 Z" fill="#2a3038" stroke={`rgba(${COOL},0.5)`} strokeWidth={2} />
                  {Array.from({ length: 9 }, (_, i) => {
                    const y = 310 + ((frame * 6 + i * 37) % 120);
                    return <line key={i} x1={830 + i * 34} y1={y} x2={826 + i * 34} y2={y + 18} stroke={`rgba(${COOL},0.6)`} strokeWidth={2} />;
                  })}
                </svg>
                <div style={{ position: "absolute", left: 1090, top: 470, padding: "14px 28px", borderRadius: 18, border: `2px solid rgb(${LAMP})`, background: "rgba(16,18,24,0.9)", fontSize: 44, fontWeight: 900, color: palette.ink, opacity: fine, transform: `scale(${1.3 - 0.3 * fine})` }}>没事。</div>
              </div>
            )}
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            {ASKS.map(([q, a], i) => {
              const p = ramp(frame, c1 + 4 + i * BEAT, 6);
              return (
                <div key={q} style={{ position: "absolute", left: 220, top: 200 + i * 170, width: 760, height: 130, borderRadius: 14, background: "rgba(16,20,26,0.92)", border: `2px solid rgba(${COOL},0.45)`, padding: "18px 28px", opacity: p, transform: `translateX(${(1 - p) * -40}px)` }}>
                  <div style={{ fontSize: 28, color: palette.dim }}>{q}</div>
                  <div style={{ marginTop: 10, fontSize: 34, fontWeight: 900, color: `rgb(${LAMP})` }}>→ {a} ✓</div>
                </div>
              );
            })}
            <Halo x={1420} y={460} r={220} intensity={0.15} rgb={COOL} />
            <div style={{ position: "absolute", left: 1220, top: 300, width: 400, height: 300, borderRadius: 16, background: "repeating-linear-gradient(45deg, #151920 0 14px, #1b2029 14px 28px)", border: `2px dashed rgba(232,238,242,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, color: palette.faint, opacity: ramp(frame, c1 + 4 * BEAT, 8) }}>我自己的……</div>
            <div style={{ position: "absolute", left: 1220, width: 400, top: 630, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 6, color: palette.dim, opacity: ramp(frame, c1 + 5 * BEAT, 8) }}>从未翻开</div>
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Stander x={440} bottom={820} height={300} lift={0} glow={0.6} rgb={LAMP} />
            <Stander x={1480} bottom={820} height={300} lift={1} glow={0.5} rgb={COOL} />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <path d={`M500 640 Q${730} ${680 + 40 * cut} ${940 - 30 * cut} ${700 + 120 * cut}`} fill="none" stroke={`rgba(${LAMP},0.8)`} strokeWidth={3} />
              <path d={`M1420 640 Q${1190} ${680 + 40 * cut} ${980 + 30 * cut} ${700 + 120 * cut}`} fill="none" stroke={`rgba(${LAMP},0.8)`} strokeWidth={3} />
              {/* the jar */}
              <rect x={880} y={250} width={160} height={220} rx={18} fill="none" stroke="rgba(232,238,242,0.5)" strokeWidth={3} />
              <rect x={886} y={464 - 26 * drops} width={148} height={26 * drops} rx={10} fill={`rgba(${COOL},0.45)`} />
            </svg>
            <div style={{ position: "absolute", left: 880, width: 160, top: 486, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 6, color: palette.dim }}>失望 {drops}/8</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontSize: 40, fontWeight: 900, color: palette.ink, opacity: cut }}>……</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={LAMP} opacity={0.5} />
      <Sfx name="glint" at={2 * BEAT} volume={0.35} />
      <Sfx name="stamp" at={7 * BEAT} volume={0.35} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.5} />
      {ASKS.map((_, i) => (
        <Sfx key={i} name="shutter" at={c1 + 4 + i * BEAT} volume={0.2} />
      ))}
      <Sfx name="whoosh" at={c2 - 3} volume={0.5} />
      <Sfx name="shatter" at={c2 + 6 * BEAT} volume={0.3} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
