import React from "react";
import { random } from "remotion";
import { fonts, palette } from "../../channels/backlit/look";

// 《拖延》's image: a tear-off day calendar on which every page says 明天, and
// the torn pages piling up around the person's feet. The very last page says 今天.

const DAY0 = new Date(2026, 9, 15); // the episode's "today"
const WEEK = "日一二三四五六";
export const dateLabel = (i: number) => {
  const d = new Date(DAY0.getFullYear(), DAY0.getMonth(), DAY0.getDate() + i);
  return `${d.getMonth() + 1}/${String(d.getDate()).padStart(2, "0")} 周${WEEK[d.getDay()]}`;
};

const PAPER = "#ece8e0";

// One page, top-left at (0, 0), w × h.
const Page: React.FC<{ w: number; h: number; word: string; index: number; today?: boolean; sub?: string }> = ({ w, h, word, index, today = false, sub }) => {
  const size = Math.min(w / (word.length * 1.05), h * 0.42);
  return (
    <div style={{ position: "absolute", inset: 0, width: w, height: h, background: PAPER, boxShadow: "inset 0 -6px 12px rgba(0,0,0,0.12)" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.06, textAlign: "center", fontFamily: fonts.mono, fontSize: h * 0.055, letterSpacing: 2, color: "#6b625a" }}>2026 · {dateLabel(index)}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.26, textAlign: "center", fontSize: size, fontWeight: 900, lineHeight: 1.1, color: today ? "#0f8f84" : "#b2283e", letterSpacing: size * 0.05 }}>{word}</div>
      {sub && <div style={{ position: "absolute", left: 0, right: 0, top: h * 0.7, textAlign: "center", fontSize: h * 0.07, fontWeight: 700, color: "#3a3128" }}>{sub}</div>}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: h * 0.05, textAlign: "center", fontFamily: fonts.mono, fontSize: h * 0.045, color: "#9a9188" }}>No.{String(index + 1).padStart(3, "0")}</div>
    </div>
  );
};

// A wall calendar at (x, y) (top-left of the pad). Pages tear on a schedule:
// page k comes off at `tears[k]` (scene frames) and flies away. `words[i]` is
// what page i says (default 明天); `subs[i]` an optional second line.
export const TearCalendar: React.FC<{
  x: number;
  y: number;
  w?: number;
  frame: number;
  tears: number[];
  words?: (i: number) => string;
  subs?: (i: number) => string | undefined;
  todayAt?: number; // page index that is 今天 (drawn in teal)
  first?: number; // index of the page on top at the start
  glow?: number;
}> = ({ x, y, w = 360, frame, tears, words = () => "明天", subs = () => undefined, todayAt = -1, first = 0, glow = 0 }) => {
  const h = w * 1.2;
  const torn = tears.filter((t) => frame >= t).length;
  const top = first + torn;
  const flying = tears.map((t, k) => ({ k, age: frame - t })).filter((f) => f.age >= 0 && f.age < 28);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h + w * 0.18 }}>
      {glow > 0 && <div style={{ position: "absolute", left: -w * 0.4, top: -w * 0.3, width: w * 1.8, height: h * 1.6, background: `radial-gradient(circle, rgba(${palette.accentRgb},${0.35 * glow}), transparent 60%)` }} />}
      {/* the pad's thickness */}
      {[3, 2, 1].map((d) => (
        <div key={d} style={{ position: "absolute", left: d * 2, top: w * 0.18 + d * 3, width: w, height: h, background: "#d6d1c8", borderRadius: 2 }} />
      ))}
      <div style={{ position: "absolute", left: 0, top: w * 0.18, width: w, height: h, overflow: "hidden" }}>
        <Page w={w} h={h} word={words(top)} sub={subs(top)} index={top} today={top === todayAt} />
      </div>
      {/* binding */}
      <div style={{ position: "absolute", left: -6, top: 0, width: w + 12, height: w * 0.2, borderRadius: 6, background: "linear-gradient(#a3303e, #6e1c27)" }} />
      {[0.28, 0.72].map((r) => (
        <div key={r} style={{ position: "absolute", left: w * r - 9, top: -14, width: 18, height: 34, borderRadius: 9, border: "4px solid #9aa3ad", boxSizing: "border-box" }} />
      ))}
      {/* pages in flight */}
      {flying.map(({ k, age }) => {
        const i = first + k;
        const t = age / 28;
        const dir = random(`fd-${k}`) > 0.5 ? 1 : -1;
        return (
          <div
            key={k}
            style={{
              position: "absolute",
              left: 0,
              top: w * 0.18,
              width: w,
              height: h,
              transformOrigin: "50% 0%",
              transform: `translate(${dir * t * w * 1.3}px, ${t * t * h * 1.4}px) rotate(${dir * (t * 70 + 8)}deg) rotateX(${t * 50}deg) scale(${1 - t * 0.35})`,
              opacity: 1 - Math.max(0, t - 0.7) / 0.3,
            }}
          >
            <Page w={w} h={h} word={words(i)} sub={subs(i)} index={i} today={i === todayAt} />
          </div>
        );
      })}
    </div>
  );
};

// Torn pages lying in a heap around (cx, floor). `count` of them so far; the
// newest land on top. `layer` splits the heap into the pages behind the
// person and the ones in front of their feet.
export const PagePile: React.FC<{ cx: number; floor: number; count: number; spread?: number; layer?: "back" | "front" | "all"; opacity?: number; word?: string }> = ({
  cx,
  floor,
  count,
  spread = 520,
  layer = "all",
  opacity = 1,
  word = "明天",
}) => (
  <div style={{ position: "absolute", inset: 0, opacity }}>
    {Array.from({ length: count }, (_, i) => {
      const front = random(`pf-${i}`) > 0.5;
      if ((layer === "back" && front) || (layer === "front" && !front)) return null;
      const r = random(`pr-${i}`);
      const px = cx + (random(`px-${i}`) - 0.5) * spread * (0.35 + 0.65 * Math.min(1, i / 40));
      const heap = Math.max(0, 1 - Math.abs(px - cx) / (spread * 0.55)) * Math.min(150, i * 2.2);
      const py = floor - 18 - random(`py-${i}`) * heap + (front ? 22 : 0);
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: px - 46,
            top: py - 30,
            width: 92,
            height: 64,
            background: PAPER,
            transform: `rotate(${(r - 0.5) * 80}deg) skewX(${(random(`sk-${i}`) - 0.5) * 20}deg)`,
            boxShadow: "0 3px 8px rgba(0,0,0,0.5)",
            filter: `brightness(${0.55 + 0.35 * random(`pb-${i}`)})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            fontWeight: 900,
            color: "#b2283e",
          }}
        >
          {word}
        </div>
      );
    })}
  </div>
);
