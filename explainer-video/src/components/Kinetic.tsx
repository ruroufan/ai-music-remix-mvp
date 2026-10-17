import React from "react";
import { interpolate, random } from "remotion";
import type { EpisodeLook } from "../EpisodeContext";

// Kinetic subtitle text for episodes with `look.fx`.
//
//   plain text      characters cascade in: rise, de-blur, fade (staggered)
//   【highlight】   as above, in the accent colour
//   【【key】】      the words meant to land: they arrive a beat later, bigger,
//                   each character slamming in from a larger size with a blur,
//                   in warm gold with a glow that breathes, a light sweep across
//                   them, an underline that draws itself, and a ring burst.
type Seg = { text: string; kind: "plain" | "hi" | "key" };

export const parseMarks = (text: string): Seg[] =>
  text
    .split(/(【【[^】]*】】|【[^】]*】)/g)
    .filter(Boolean)
    .map((p) => (p.startsWith("【【") ? { text: p.slice(2, -2), kind: "key" } : p.startsWith("【") ? { text: p.slice(1, -1), kind: "hi" } : { text: p, kind: "plain" }));

export const stripMarks = (text: string) => text.replace(/【|】/g, "");

export const KineticText: React.FC<{ text: string; t: number; look: EpisodeLook; beat: number; seed?: string }> = ({ text, t, look, beat, seed = "k" }) => {
  const segs = parseMarks(text);
  const plainCount = segs.filter((s) => s.kind !== "key").reduce((n, s) => n + [...s.text].length, 0);
  // key phrases land after the rest of the line has arrived, on the next half beat
  const keyAt = Math.max(Math.ceil((plainCount * 0.9 + 4) / (beat / 2)) * (beat / 2), beat / 2);
  let ci = 0;
  let ki = 0;
  return (
    <>
      {segs.map((sg, si) => {
        if (sg.kind === "key" && look.board) {
          // whiteboard: red marker, a yellow highlighter swipe behind, a wavy underline
          const chars = [...sg.text];
          const k0 = keyAt + ki;
          ki += chars.length * 2 + 2;
          const swipe = interpolate(t, [k0 - 4, k0 + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const under = interpolate(t, [k0 + chars.length * 2, k0 + chars.length * 2 + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <span key={si} style={{ position: "relative", display: "inline-block", margin: "0 0.06em", fontSize: "1.28em", verticalAlign: "-0.05em" }}>
              <span style={{ position: "absolute", left: "-0.12em", right: "-0.12em", top: "0.22em", bottom: "0.02em", background: look.keyGlow, transform: `skewX(-8deg) scaleX(${swipe})`, transformOrigin: "0 50%", borderRadius: 4 }} />
              {chars.map((c, i) => {
                const a = k0 + i * 2;
                const p = interpolate(t, [a, a + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const e = 1 - Math.pow(1 - p, 3);
                return (
                  <span key={i} style={{ position: "relative", display: "inline-block", opacity: p > 0 ? 1 : 0, transform: `scale(${1.5 - 0.5 * e}) rotate(${(1 - e) * -8}deg)`, color: look.key }}>
                    {c}
                  </span>
                );
              })}
              {under > 0 && (
                <span style={{ position: "absolute", left: 0, bottom: "-0.3em", height: "0.4em", width: `${under * 100}%`, overflow: "hidden" }}>
                  <svg style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${100 / Math.max(under, 0.001)}%` }} viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M1 5 Q 12 0 25 5 T 50 5 T 75 5 T 99 4" fill="none" stroke={look.key} strokeWidth={4} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                  </svg>
                </span>
              )}
            </span>
          );
        }
        if (sg.kind === "key") {
          const chars = [...sg.text];
          const k0 = keyAt + ki;
          ki += chars.length * 2 + 2;
          const swell = interpolate(t, [k0, k0 + chars.length * 2 + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const breathe = 0.75 + 0.25 * Math.sin(((t - k0) / beat) * Math.PI * 2);
          const sweep = interpolate(t, [k0 + chars.length * 2, k0 + chars.length * 2 + 14], [-0.3, 1.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <span key={si} style={{ position: "relative", display: "inline-block", margin: "0 0.08em", fontSize: "1.32em", fontWeight: 900, verticalAlign: "-0.06em" }}>
              {/* ring burst */}
              {t >= k0 && t < k0 + 24 && (
                <span style={{ position: "absolute", left: "50%", top: "50%", width: 40 + (t - k0) * 22, height: 40 + (t - k0) * 22, transform: "translate(-50%, -50%)", borderRadius: "50%", border: `2px solid ${look.key}`, opacity: Math.max(0, 1 - (t - k0) / 24) * 0.7, pointerEvents: "none" }} />
              )}
              {chars.map((c, i) => {
                const a = k0 + i * 2;
                const p = interpolate(t, [a, a + 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const ease = 1 - Math.pow(1 - p, 3);
                const over = p < 1 ? Math.sin(p * Math.PI) * 0.12 : 0;
                return (
                  <span
                    key={i}
                    style={{
                      display: "inline-block",
                      opacity: p > 0 ? Math.min(1, p * 2) : 0,
                      transform: `scale(${2.2 - 1.2 * ease + over}) translateY(${(1 - ease) * -18}px)`,
                      filter: `blur(${(1 - ease) * 10}px)`,
                      color: look.key,
                      textShadow: `0 0 ${14 + 16 * breathe * swell}px ${look.keyGlow}, 0 0 2px rgba(255,255,255,0.8)`,
                    }}
                  >
                    {c}
                  </span>
                );
              })}
              {/* light sweep across the phrase */}
              {sweep > -0.3 && sweep < 1.3 && (
                <span style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", mixBlendMode: "screen" }}>
                  <span style={{ position: "absolute", top: 0, bottom: 0, left: `${sweep * 100}%`, width: "35%", background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.65), transparent)" }} />
                </span>
              )}
              {/* underline that draws itself */}
              <span style={{ position: "absolute", left: 0, bottom: "-0.08em", height: swell > 0 ? 4 : 0, borderRadius: 2, width: `${swell * 100}%`, background: `linear-gradient(90deg, ${look.key}, rgba(255,255,255,0.9))`, boxShadow: `0 0 12px ${look.keyGlow}` }} />
            </span>
          );
        }
        return (
          <span key={si}>
            {[...sg.text].map((c, i) => {
              if (c === "\n") return <br key={i} />;
              const a = (ci++) * 0.9;
              const p = interpolate(t, [a, a + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const ease = 1 - Math.pow(1 - p, 3);
              const jitter = (random(`${seed}-${si}-${i}`) - 0.5) * 6;
              if (look.board)
                return (
                  <span key={i} style={{ display: "inline-block", opacity: p > 0.15 ? 1 : 0, transform: `scale(${1.15 - 0.15 * ease})`, ...(sg.kind === "hi" ? { color: look.accent } : {}) }}>
                    {c}
                  </span>
                );
              return (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    opacity: ease,
                    transform: `translateY(${(1 - ease) * 16}px) rotate(${(1 - ease) * jitter}deg)`,
                    filter: p < 1 ? `blur(${(1 - ease) * 6}px)` : undefined,
                    ...(sg.kind === "hi" ? { color: look.accent, textShadow: `0 0 12px ${look.accentGlow}` } : {}),
                  }}
                >
                  {c}
                </span>
              );
            })}
          </span>
        );
      })}
    </>
  );
};

// When the key phrase of the current line lands (frames after the line starts), or -1.
export const keyLandsAt = (text: string, beat: number) => {
  const segs = parseMarks(text);
  if (!segs.some((s) => s.kind === "key")) return -1;
  const plainCount = segs.filter((s) => s.kind !== "key").reduce((n, s) => n + [...s.text].length, 0);
  return Math.max(Math.ceil((plainCount * 0.9 + 4) / (beat / 2)) * (beat / 2), beat / 2);
};
