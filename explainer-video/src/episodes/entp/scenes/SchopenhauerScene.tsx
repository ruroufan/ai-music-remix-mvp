import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Boxer, COLD, FrontRopes, GOLD, Opponent, RED, Ring, RingLight } from "../ring";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const TRICKS = ["扩大化", "偷换概念", "转移话题", "以偏概全", "诉诸权威", "人身攻击", "稻草人", "抢先下结论", "激怒对方", "提问轰炸", "假两难", "循环论证"];

// Schopenhauer's argument.
// 0 · two people and, between them, one light: 真理 — honest argument heads
//     straight for it.
// 1 · a mirror swells up in front of one of them — 虚荣心 — and the light is
//     blocked out: 我不可能错.
// 2 · the argument becomes a bout: the ring, a bell, ROUND 1; the one who
//     talks better wins — 赢 ≠ 对.
// 3 · thirty-eight tricks, cards pouring onto a board, numbered — and a red
//     circle going round them one by one: 认出它们.
export const SchopenhauerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2, c3] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : frame < c3 ? 2 : 3;
  const truth = ramp(frame, 4, 12);
  const vanity = ramp(frame, c1 + BEAT, 10);
  const bout = (frame - c2) / (2 * BEAT);
  const cards = Math.max(0, Math.min(38, Math.floor((frame - c3) / 2)));
  const seen = Math.floor((frame - c3 - 3 * BEAT) / 6);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c2, c3]} hits={[c1 + BEAT, c2 + BEAT, ...keyHits(lines, cues, duration)]}>
        {seg <= 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Halo x={960} y={420} r={220} intensity={truth * (1 - 0.8 * vanity)} rgb={GOLD} />
            <div style={{ position: "absolute", left: 860, width: 200, top: 390, textAlign: "center", fontSize: 50, fontWeight: 900, color: `rgba(${GOLD},${1 - 0.7 * vanity})`, textShadow: `0 0 20px rgba(${GOLD},0.8)` }}>真理</div>
            <Boxer x={600} bottom={760} punch={0} glow={0.6} />
            <Opponent x={1320} bottom={760} />
            {/* arrows to the light */}
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: truth * (1 - vanity) }}>
              <path d="M680 520 Q780 440 850 430" fill="none" stroke={`rgba(${GOLD},0.7)`} strokeWidth={3} strokeDasharray="10 8" />
              <path d="M1240 520 Q1140 440 1070 430" fill="none" stroke={`rgba(${GOLD},0.7)`} strokeWidth={3} strokeDasharray="10 8" />
            </svg>
            {/* the mirror */}
            {vanity > 0 && (
              <div style={{ position: "absolute", left: 640, top: 300 - 40 * vanity, width: 200 + 140 * vanity, height: 300 + 120 * vanity, borderRadius: "50%", border: `6px solid rgb(${GOLD})`, background: "radial-gradient(circle at 40% 35%, rgba(255,255,255,0.35), rgba(170,200,230,0.15) 60%)", opacity: vanity, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 34, fontWeight: 900, color: palette.ink, textShadow: "0 2px 8px #000" }}>我不可能错</div>
              </div>
            )}
            <div style={{ position: "absolute", left: 600, top: 790, fontSize: 30, fontWeight: 900, color: `rgb(${RED})`, opacity: vanity }}>虚荣心</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: 1 - vanity }}>如果人天生诚实</div>
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <RingLight />
            <Ring />
            <Opponent x={1110} fall={interpolate(bout % 1, [0.5, 0.8], [0, 1], clamp) * (bout > 1 ? 1 : 0)} />
            <Boxer x={820} punch={interpolate(bout % 1, [0.35, 0.6], [0, 1], clamp)} reach={180} />
            <FrontRopes />
            <div style={{ position: "absolute", left: 0, right: 0, top: 130, textAlign: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: 80, letterSpacing: 10, color: `rgb(${RED})`, opacity: ramp(frame, c2, 6) }}>ROUND 1</div>
            <div style={{ position: "absolute", left: 1380, top: 300, fontSize: 40, fontWeight: 900, color: palette.ink, opacity: ramp(frame, c2 + 4 * BEAT, 8) }}>
              赢 <span style={{ color: `rgb(${RED})` }}>≠</span> 对
            </div>
            <div style={{ position: "absolute", left: 1380, top: 360, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: palette.dim, opacity: ramp(frame, c2 + 6 * BEAT, 8) }}>只是更会说</div>
          </div>
        )}
        {seg === 3 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontSize: 40, fontWeight: 900 }}>
              取胜的诡计 <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 60, color: `rgb(${RED})` }}>×{cards}</span>
            </div>
            {Array.from({ length: cards }, (_, i) => {
              const col = i % 8, row = Math.floor(i / 8);
              const isSeen = i <= seen && i < 12;
              return (
                <div key={i} style={{ position: "absolute", left: 300 + col * 170, top: 220 + row * 110, width: 150, height: 90, borderRadius: 8, background: "rgba(16,20,26,0.92)", border: `2px solid ${isSeen ? `rgb(${RED})` : `rgba(${COLD},0.35)`}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: isSeen ? `0 0 18px rgba(${RED},0.6)` : undefined }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: isSeen ? `rgb(${RED})` : palette.dim }}>#{i + 1}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: isSeen ? palette.ink : palette.faint }}>{i < 12 ? TRICKS[i] : "……"}</div>
                </div>
              );
            })}
            <div style={{ position: "absolute", left: 1640, top: 360, fontSize: 34, fontWeight: 900, color: `rgb(${RED})`, opacity: ramp(frame, c3 + 3 * BEAT, 8), writingMode: "vertical-rl" }}>认出它们</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} opacity={0.5} />
      <Sfx name="glint" at={4} volume={0.35} />
      <Sfx name="rise" at={c1 + BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.45} />
      <Sfx name="glint" at={c2} volume={0.5} />
      <Sfx name="stamp" at={c2 + BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c3 - 3} volume={0.45} />
      {Array.from({ length: 12 }, (_, i) => (
        <Sfx key={i} name="shutter" at={c3 + i * 6} volume={0.08} />
      ))}
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
