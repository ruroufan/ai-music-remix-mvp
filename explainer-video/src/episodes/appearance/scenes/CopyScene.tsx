import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { FILTER, FILTER_RGB, Face, Friend, Phone, type FaceProps } from "../faces";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

const COPIES = [640, 860, 1080, 1300, 1520];
// the layers a face on a screen is built from, one per 1.5 beats
const LAYERS: { label: string; en: string; f: Partial<FaceProps> }[] = [
  { label: "原图", en: "RAW", f: {} },
  { label: "灯光", en: "LIGHT", f: { bright: 0.35, smooth: 0.25 } },
  { label: "磨皮", en: "SMOOTH", f: { bright: 0.4, smooth: 1 } },
  { label: "美白", en: "WHITEN", f: { bright: 0.95, smooth: 1 } },
  { label: "瘦脸 · 大眼", en: "RESHAPE", f: { bright: 1, smooth: 1, slim: 1, eyes: 1 } },
  { label: "拟像", en: "SIMULACRUM", f: { bright: 1, smooth: 1, slim: 1, eyes: 1, statue: 1 } },
];
const LX = (i: number) => 250 + i * 284;
const PEOPLE = Array.from({ length: 12 }, (_, i) => ({ x: 1100 + (i % 4) * 150, y: 300 + Math.floor(i / 4) * 150 }));

// 0 · an empty frame where the original should be — 原本：无 — and copies of a
//     polished face coming off it one per half beat, each stamped COPY.
// 1 · how such a face is made: layer after layer, one per beat and a half —
//     原图 → 灯光 → 磨皮 → 美白 → 瘦脸·大眼 → a smooth plaster face. 拟像.
// 2 · that face, alone on a phone; beside it, real people, scanned row by row
//     for a match… 匹配：0 人.
export const CopyScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2] = cues;
  const out0 = interpolate(frame, [c1 - 6, c1 + 4], [1, 0], clamp);
  const out1 = interpolate(frame, [c2 - 6, c2 + 4], [1, 0], clamp);
  const scan = interpolate(frame, [c2 + BEAT, c2 + 5 * BEAT], [0, 1], clamp);
  const none = ramp(frame, c2 + 5.5 * BEAT, 6);
  return (
    <ObsFrame duration={duration}>
      {/* 0 · copies without an original */}
      {out0 > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: out0 }}>
          <div style={{ position: "absolute", left: 330 - 110, top: 250, width: 220, height: 300, borderRadius: 14, border: `3px dashed ${palette.dim}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.mono, fontSize: 110, color: palette.faint, opacity: ramp(frame, 0, 8) }}>?</div>
          <div style={{ position: "absolute", left: 330 - 140, width: 280, top: 566, textAlign: "center", fontSize: 28, fontWeight: 800, color: palette.ink, opacity: ramp(frame, 4, 8) }}>
            原本：<span style={{ color: look.key }}>无</span>
          </div>
          <div style={{ position: "absolute", left: 330 - 140, width: 280, top: 610, textAlign: "center", fontFamily: fonts.mono, fontSize: 16, letterSpacing: 4, color: palette.dim, opacity: ramp(frame, 4, 8) }}>ORIGINAL · NONE</div>
          {COPIES.map((x, i) => {
            const at = BEAT + i * HALF_BEAT;
            const p = ramp(frame, at, 7);
            if (p <= 0) return null;
            const from = i === 0 ? 330 : COPIES[i - 1];
            return (
              <div key={i} style={{ position: "absolute", left: from + (x - from) * p - 85, top: 280, width: 170, height: 240, borderRadius: 12, overflow: "hidden", background: "#11151b", border: `2px solid rgba(${FILTER_RGB},0.5)`, opacity: Math.min(1, p * 1.5), boxShadow: `0 0 24px rgba(${FILTER_RGB},0.15)` }}>
                <Face id={`cp-copy-${i}`} x={85} y={124} size={210} smooth={1} bright={0.95} slim={0.8} eyes={0.7} rim={0} />
                <div style={{ position: "absolute", right: 8, top: 8, padding: "2px 8px", border: `2px solid ${FILTER}`, borderRadius: 4, fontFamily: fonts.mono, fontSize: 14, fontWeight: 700, color: FILTER, transform: `rotate(8deg) scale(${p >= 1 ? 1 : 1.8})`, opacity: p >= 1 ? 1 : 0 }}>COPY</div>
              </div>
            );
          })}
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <line x1={444} y1={400} x2={548} y2={400} stroke={palette.dim} strokeWidth={3} strokeDasharray="8 8" opacity={ramp(frame, BEAT, 6)} />
          </svg>
        </div>
      )}
      {/* 1 · layer by layer */}
      {frame >= c1 - 6 && out1 > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: (1 - out0) * out1 }}>
          {LAYERS.map((L, i) => {
            const at = c1 + i * 1.5 * BEAT;
            const p = ramp(frame, at, 8);
            if (p <= 0) return null;
            const last = i === LAYERS.length - 1;
            return (
              <div key={i} style={{ position: "absolute", left: LX(i) - 120, top: 210, width: 240, opacity: p, transform: `translateX(${(1 - p) * -60}px)` }}>
                <div style={{ position: "relative", width: 240, height: 320, borderRadius: 14, overflow: "hidden", background: "#0e1218", border: `2px solid ${last ? FILTER : palette.faint}`, transform: "perspective(900px) rotateY(-16deg)", boxShadow: last ? `0 0 40px rgba(${FILTER_RGB},0.35)` : "0 16px 30px rgba(0,0,0,0.5)" }}>
                  <Face id={`cp-layer-${i}`} x={120} y={166} size={290} rim={0} {...L.f} />
                </div>
                <div style={{ marginTop: 18, textAlign: "center", fontSize: 30, fontWeight: 900, color: last ? FILTER : palette.ink, textShadow: last ? `0 0 16px rgba(${FILTER_RGB},0.7)` : undefined }}>{L.label}</div>
                <div style={{ textAlign: "center", fontFamily: fonts.mono, fontSize: 14, letterSpacing: 4, color: palette.dim }}>{L.en}</div>
                {i < LAYERS.length - 1 && <div style={{ position: "absolute", left: 246, top: 140, fontFamily: fonts.mono, fontSize: 34, color: palette.dim, opacity: ramp(frame, at + BEAT, 6) }}>→</div>}
              </div>
            );
          })}
        </div>
      )}
      {/* 2 · nobody looks like that */}
      {frame >= c2 - 6 && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - out1 }}>
          <Phone x={560} y={450} w={300} h={600} glow={1.2}>
            <Face id="cp-final" x={140} y={270} size={360} smooth={1} bright={1} slim={1} eyes={1} statue={1} rim={0} />
          </Phone>
          {PEOPLE.map((p, i) => {
            const passed = scan > 0 && 1030 + scan * 520 > p.x + 10;
            return (
              <div key={i}>
                <Friend x={p.x} y={p.y} s={1.4} tone={i} hair={i * 7} opacity={0.85} />
                {passed && <div style={{ position: "absolute", left: p.x + 20, top: p.y - 64, fontSize: 30, fontWeight: 900, color: palette.alert }}>✕</div>}
              </div>
            );
          })}
          {scan > 0 && scan < 1 && <div style={{ position: "absolute", left: 1030 + scan * 520, top: 200, width: 4, height: 520, background: FILTER, boxShadow: `0 0 18px ${FILTER}` }} />}
          <div style={{ position: "absolute", left: 1030, top: 168, fontFamily: fonts.mono, fontSize: 18, letterSpacing: 4, color: palette.dim }}>现实中 · 匹配中…</div>
          {none > 0 && (
            <div style={{ position: "absolute", left: 1150, top: 730, opacity: none, transform: `scale(${1.6 - 0.6 * none}) rotate(-4deg)`, padding: "10px 26px", border: `4px solid ${look.key}`, borderRadius: 10, fontSize: 40, fontWeight: 900, color: look.key, textShadow: `0 0 18px ${look.keyGlow}`, background: "rgba(6,8,12,0.85)" }}>
              匹配：<span style={{ fontFamily: fonts.mono }}>0</span> 人
            </div>
          )}
        </div>
      )}
      {COPIES.map((_, i) => (
        <Sfx key={i} name="shutter" at={BEAT + i * HALF_BEAT} volume={0.22} />
      ))}
      {LAYERS.map((_, i) => (
        <Sfx key={i} name={i === LAYERS.length - 1 ? "boom" : "glint"} at={c1 + i * 1.5 * BEAT} volume={i === LAYERS.length - 1 ? 0.45 : 0.25} />
      ))}
      <Sfx name="rise" at={c2 + BEAT} volume={0.3} />
      <Sfx name="stamp" at={c2 + 5.5 * BEAT} volume={0.6} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
