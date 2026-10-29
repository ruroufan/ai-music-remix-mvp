import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { LightPool, Stander } from "../circles";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const MINE = ["拖延", "粗心", "嘴笨", "那次失误", "半途而废", "不够自信", "熬夜", "没想清楚"];
const THEIRS = ["升职加薪", "获奖", "精修的照片", "说走就走的旅行", "健身打卡", "完美的方案"];

// 0 · back in the big pool: praise floats in — 做得太好了 — and bounces off
//     him; over his head the question stays.
// 1 · the comparison he's really making: on the left, his whole backstage,
//     every flaw, one per half beat, ✕ after ✕; on the right, the highlight
//     reel everyone else posts, ✓ after ✓. Between them: VS.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const intro = useRamp(0, 10);
  const out = interpolate(frame, [cues[1] - 6, cues[1] + 4], [1, 0], clamp);
  // the praise bubble: flies in, hits, bounces back off
  const fly = interpolate(frame, [BEAT, 3 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t });
  const back = interpolate(frame, [3 * BEAT, 5 * BEAT], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) });
  const bx = 1500 - 430 * fly + 380 * back;
  const by = 320 - 60 * Math.sin(back * Math.PI) + 140 * back;
  const hit = frame >= 3 * BEAT ? Math.exp(-(frame - 3 * BEAT) / 6) : 0;
  const cards = useRamp(cues[1], 10);
  const t1 = frame - cues[1];
  const mine = Math.max(0, Math.min(MINE.length, Math.floor((t1 - BEAT) / HALF_BEAT) + 1));
  const theirs = Math.max(0, Math.min(THEIRS.length, Math.floor((t1 - BEAT) / (HALF_BEAT * 1.3)) + 1));
  return (
    <ObsFrame duration={duration}>
      {out > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: intro * out }}>
          <LightPool cx={960} rx={430} frame={frame} seed="h" />
          <Stander x={960} height={260} lift={0} glow={0.9 + hit} />
          {fly > 0 && (
            <div style={{ position: "absolute", left: bx, top: by, transform: `translate(-50%, -50%) rotate(${back * 30}deg)`, opacity: 1 - back * 0.8, padding: "10px 24px", borderRadius: 22, background: palette.accent, color: "#06080c", fontSize: 34, fontWeight: 800, whiteSpace: "nowrap" }}>
              做得太好了
            </div>
          )}
          {hit > 0.05 && (
            <div style={{ position: "absolute", left: 1060 - 50 - (1 - hit) * 40, top: 380 - 50 - (1 - hit) * 40, width: 100 + (1 - hit) * 80, height: 100 + (1 - hit) * 80, borderRadius: "50%", border: `3px solid rgba(232,238,242,${hit})` }} />
          )}
          <div style={{ position: "absolute", left: 1010, top: 250, opacity: interpolate(frame, [4 * BEAT, 5 * BEAT], [0, 1], clamp), padding: "12px 26px", borderRadius: 30, background: "rgba(232,238,242,0.12)", border: "2px dashed rgba(232,238,242,0.5)", fontSize: 36, fontWeight: 800, color: palette.ink }}>
            他们看错了？
          </div>
        </div>
      )}
      {t1 >= -6 && (
        <div style={{ position: "absolute", inset: 0, opacity: cards }}>
          {/* mine: the backstage */}
          <div style={{ position: "absolute", left: 200, top: 150, width: 640, height: 600, borderRadius: 16, background: "linear-gradient(#11151c, #0a0d12)", border: `2px solid ${palette.faint}`, overflow: "hidden", transform: `translateX(${(1 - cards) * -60}px)` }}>
            <div style={{ position: "absolute", left: 28, top: 22, fontFamily: fonts.mono, fontSize: 18, letterSpacing: 5, color: palette.dim }}>你 · BACKSTAGE</div>
            <div style={{ position: "absolute", left: 28, top: 52, fontSize: 40, fontWeight: 900, letterSpacing: 4, color: palette.alert }}>自己的全部缺点</div>
            {MINE.slice(0, mine).map((m, i) => {
              const p = interpolate(t1, [BEAT + i * HALF_BEAT, BEAT + i * HALF_BEAT + 5], [0, 1], clamp);
              return (
                <div key={m} style={{ position: "absolute", left: 40 + (i % 2) * 300, top: 140 + Math.floor(i / 2) * 104, display: "flex", alignItems: "center", gap: 14, opacity: p, transform: `scale(${1.4 - 0.4 * p}) rotate(${(i % 3) - 1}deg)`, transformOrigin: "0 50%" }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: palette.alert }}>✕</span>
                  <span style={{ fontSize: 32, fontWeight: 700, color: "rgba(232,238,242,0.8)" }}>{m}</span>
                </div>
              );
            })}
          </div>
          {/* theirs: the highlight reel */}
          <div style={{ position: "absolute", right: 200, top: 150, width: 640, height: 600, borderRadius: 16, background: `linear-gradient(160deg, rgba(${palette.halo},0.22), rgba(${palette.halo},0.05))`, border: `2px solid rgba(${palette.halo},0.6)`, overflow: "hidden", transform: `translateX(${(1 - cards) * 60}px)`, boxShadow: `0 0 50px rgba(${palette.halo},0.15)` }}>
            <div style={{ position: "absolute", left: 28, top: 22, fontFamily: fonts.mono, fontSize: 18, letterSpacing: 5, color: palette.dim }}>别人 · HIGHLIGHTS</div>
            <div style={{ position: "absolute", left: 28, top: 52, fontSize: 40, fontWeight: 900, letterSpacing: 4, color: look.key }}>展示出来的全部优点</div>
            {THEIRS.slice(0, theirs).map((m, i) => {
              const p = interpolate(t1, [BEAT + i * HALF_BEAT * 1.3, BEAT + i * HALF_BEAT * 1.3 + 6], [0, 1], clamp);
              return (
                <div key={m} style={{ position: "absolute", left: 40, top: 140 + i * 72, display: "flex", alignItems: "center", gap: 14, opacity: p, transform: `translateY(${(1 - p) * 16}px)` }}>
                  <span style={{ fontSize: 32, fontWeight: 900, color: "#46d39a" }}>✓</span>
                  <span style={{ fontSize: 32, fontWeight: 700, color: palette.ink }}>{m}</span>
                  <span style={{ fontSize: 22, color: look.key, letterSpacing: 2 }}>★★★★★</span>
                </div>
              );
            })}
          </div>
          <div style={{ position: "absolute", left: 960 - 60, top: 400, width: 120, textAlign: "center", fontFamily: fonts.mono, fontSize: 52, fontWeight: 700, color: palette.ink, transform: `scale(${1 + 0.4 * Math.exp(-Math.max(0, t1) / 5)})`, textShadow: `0 0 18px rgba(${palette.halo},0.6)` }}>VS</div>
          <Halo x={960} y={430} r={140} intensity={0.4} />
        </div>
      )}
      <Sfx name="whoosh" at={BEAT} volume={0.3} />
      <Sfx name="glitch" at={3 * BEAT} volume={0.35} />
      <Sfx name="stamp" at={cues[1]} volume={0.55} />
      {MINE.map((_, i) => (
        <Sfx key={i} name="shutter" at={cues[1] + BEAT + i * HALF_BEAT} volume={0.13} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
