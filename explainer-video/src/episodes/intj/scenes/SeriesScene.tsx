import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam, Shards } from "../../glass/immersive";
import { BP, GOLD } from "../blueprint";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const GROUPS = [
  { id: "NT", name: "分析家", codes: ["INTJ", "INTP", "ENTJ", "ENTP"] },
  { id: "NF", name: "外交家", codes: ["INFJ", "INFP", "ENFJ", "ENFP"] },
  { id: "SJ", name: "守护者", codes: ["ISTJ", "ISFJ", "ESTJ", "ESFJ"] },
  { id: "SP", name: "探险家", codes: ["ISTP", "ISFP", "ESTP", "ESFP"] },
];
const flashAt = (frame: number, at: number) => (frame >= at ? Math.exp(-(frame - at) / 3) : 0);
const CELL = { w: 230, h: 96, gx: 600, gy: 350 };

// The series card, before anything else.
// 0 · 16种MBTI系列 slams in; the sixteen types pop up as a grid, two frames
//     apart, a row per group.
// 1 · the NT row lights up gold — 之 分析家组（NT）— the others dim.
// 2 · INTJ lifts out of the grid and flies to the middle, huge: 建筑师.
export const SeriesScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const head = interpolate(frame, [0, 6], [0, 1], clamp);
  const nt = interpolate(frame, [2 * BEAT, 2 * BEAT + 6], [0, 1], clamp);
  const fly = interpolate(frame, [4 * BEAT, 4 * BEAT + 10], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const grid = 1 - 0.85 * fly;
  // INTJ's cell, and where it flies to
  const sx = CELL.gx + CELL.w / 2, sy = CELL.gy + CELL.h / 2;
  const ix = sx + (960 - sx) * fly, iy = sy + (500 - sy) * fly;
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.05]} hits={[0, 2 * BEAT, 4 * BEAT]}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontSize: 76, fontWeight: 900, letterSpacing: 16, paddingLeft: 16, opacity: head * (1 - 0.6 * fly), transform: `scale(${1.4 - 0.4 * head})`, textShadow: `0 0 30px rgba(${BP},0.6)` }}>
          16种<span style={{ fontFamily: fonts.mono, color: `rgb(${BP})` }}>MBTI</span>系列
        </div>
        {/* the grid */}
        <div style={{ position: "absolute", inset: 0, opacity: grid }}>
          {GROUPS.map((g, r) => {
            const on = r === 0;
            return (
              <React.Fragment key={g.id}>
                <div style={{ position: "absolute", left: CELL.gx - 240, top: CELL.gy + r * (CELL.h + 20) + 22, width: 210, textAlign: "right", fontSize: 30, fontWeight: 800, color: on && nt > 0.5 ? look.key : palette.dim, opacity: interpolate(frame, [r * 4, r * 4 + 6], [0, 1], clamp) * (on ? 1 : 1 - 0.6 * nt) }}>
                  {g.name} <span style={{ fontFamily: fonts.mono, fontSize: 24 }}>{g.id}</span>
                </div>
                {g.codes.map((c, k) => {
                  const i = r * 4 + k;
                  const pop = interpolate(frame, [i * 2, i * 2 + 6], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
                  if (c === "INTJ" && fly > 0) return null;
                  const lit = on ? nt : 0;
                  return (
                    <div key={c} style={{ position: "absolute", left: CELL.gx + k * (CELL.w + 20), top: CELL.gy + r * (CELL.h + 20), width: CELL.w, height: CELL.h, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, border: `2px solid ${lit > 0.5 ? `rgb(${GOLD})` : `rgba(${BP},0.5)`}`, background: lit > 0.5 ? `rgba(${GOLD},0.16)` : "rgba(12,29,51,0.85)", fontFamily: fonts.mono, fontSize: 52, fontWeight: 700, letterSpacing: 6, color: lit > 0.5 ? `rgb(${GOLD})` : palette.ink, opacity: pop * (on ? 1 : 1 - 0.7 * nt), transform: `scale(${(0.6 + 0.4 * pop) * (on ? 1 + 0.06 * lit : 1)})`, boxShadow: lit > 0.5 ? `0 0 30px rgba(${GOLD},0.5)` : undefined }}>
                      {c}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
        {/* 之 分析家组（NT） */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 240, textAlign: "center", fontSize: 50, fontWeight: 900, letterSpacing: 8, color: look.key, opacity: nt * (1 - fly), transform: `scale(${1.3 - 0.3 * nt})`, textShadow: `0 0 20px ${look.keyGlow}` }}>之 · 分析家组（NT）</div>
        {/* INTJ, flying out */}
        {fly > 0 && (
          <>
            <div style={{ position: "absolute", left: ix - 400, top: iy - 120, width: 800, textAlign: "center", fontFamily: fonts.mono, fontSize: 70 + 150 * fly, fontWeight: 700, letterSpacing: 10 + 20 * fly, lineHeight: 1, color: `rgb(${GOLD})`, textShadow: `0 0 ${40 * fly}px rgba(${GOLD},0.8)` }}>INTJ</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", fontSize: 54, fontWeight: 900, letterSpacing: 20, paddingLeft: 20, opacity: interpolate(frame, [4 * BEAT + 8, 4 * BEAT + 16], [0, 1], clamp) }}>
              分析家组 · 建筑师
            </div>
          </>
        )}
        <Shards x={960} y={500} frame={frame} at={4 * BEAT + 6} n={26} power={1.2} seed="se" />
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} opacity={0.6} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(circle at 50% 45%, rgba(220,240,255,${0.5 * flashAt(frame, 0)}), transparent 70%)` }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(circle at 50% 40%, rgba(255,220,160,${0.45 * flashAt(frame, 2 * BEAT)}), transparent 70%)` }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(circle at 50% 46%, rgba(255,240,210,${0.7 * flashAt(frame, 4 * BEAT + 6)}), transparent 70%)` }} />
      <Sfx name="boom" at={0} volume={0.6} />
      {Array.from({ length: 16 }, (_, i) => (
        <Sfx key={i} name="shutter" at={i * 2} volume={0.06} />
      ))}
      <Sfx name="stamp" at={2 * BEAT} volume={0.5} />
      <Sfx name="whoosh" at={4 * BEAT} volume={0.45} />
      <Sfx name="shatter" at={4 * BEAT + 6} volume={0.35} />
    </ObsFrame>
  );
};
