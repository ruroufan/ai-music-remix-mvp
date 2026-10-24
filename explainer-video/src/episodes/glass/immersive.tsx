import React from "react";
import { random } from "remotion";

// 《玻璃心》's motion layer — more camera than the channel's usual: a hand-held
// drift that never quite stops, a slow push, punches and shake on impacts,
// whip-pans between moments, foreground bokeh drifting past faster than the
// scene (parallax), speed lines behind fast things, and glass shards.

const decay = (frame: number, at: number, len: number) => (frame >= at && frame < at + len ? Math.exp(-((frame - at) / len) * 4) : 0);

// The camera. `push` [from, to] scale over the scene, around `focus`;
// `hits` are impact frames (punch + shake); `whips` are whip-pan frames.
export const Cam: React.FC<{
  frame: number;
  duration: number;
  push?: [number, number];
  focus?: { x: number; y: number };
  hits?: number[];
  whips?: number[];
  children: React.ReactNode;
}> = ({ frame, duration, push = [1, 1.08], focus = { x: 960, y: 480 }, hits = [], whips = [], children }) => {
  const k = Math.min(1, frame / Math.max(1, duration));
  const ease = k * k * (3 - 2 * k);
  let scale = push[0] + (push[1] - push[0]) * ease;
  // hand-held: a few slow sines that never line up
  let x = Math.sin(frame / 37) * 6 + Math.sin(frame / 13 + 1) * 2;
  let y = Math.cos(frame / 41) * 5 + Math.sin(frame / 17 + 2) * 2;
  let rot = Math.sin(frame / 53) * 0.35;
  for (const h of hits) {
    const d = decay(frame, h, 14);
    scale += 0.05 * d;
    x += (random(`hx-${h}-${frame}`) - 0.5) * 34 * d;
    y += (random(`hy-${h}-${frame}`) - 0.5) * 34 * d;
    rot += (random(`hr-${h}-${frame}`) - 0.5) * 1.6 * d;
  }
  let blur = 0;
  for (const w of whips) {
    const t = (frame - w) / 6; // −1 … 1 around the cut
    if (t > -1 && t < 1) {
      x += (t < 0 ? -1 : 1) * (1 - Math.abs(t)) * 260; // out to the left, in from the right
      blur = Math.max(blur, (1 - Math.abs(t)) * 26);
    }
  }
  return (
    <div style={{ position: "absolute", inset: 0, transformOrigin: `${focus.x}px ${focus.y}px`, transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`, filter: blur > 0.5 ? `blur(${blur * 0.25}px)` : undefined }}>
      {children}
      {blur > 0.5 && <div style={{ position: "absolute", inset: -200, background: `repeating-linear-gradient(0deg, rgba(255,255,255,0.0) 0px, rgba(255,255,255,${0.05 * (blur / 26)}) 3px, rgba(255,255,255,0) 9px)` }} />}
    </div>
  );
};

// Out-of-focus lights drifting past in front of everything.
export const Bokeh: React.FC<{ frame: number; n?: number; rgb?: string; opacity?: number }> = ({ frame, n = 9, rgb = "170, 215, 255", opacity = 1 }) => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity }}>
    {Array.from({ length: n }, (_, i) => {
      const r = 40 + random(`bk-r-${i}`) * 90;
      const sp = 0.6 + random(`bk-s-${i}`) * 1.6;
      const x = ((random(`bk-x-${i}`) * 2300 - frame * sp * 1.4) % 2300 + 2300) % 2300 - 190;
      const y = random(`bk-y-${i}`) * 1080 + Math.sin(frame / 40 + i) * 30;
      const warm = i % 3 === 0;
      return <div key={i} style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: `radial-gradient(circle, rgba(${warm ? "255, 190, 130" : rgb},0.16), rgba(${warm ? "255, 190, 130" : rgb},0.05) 60%, transparent 72%)`, filter: "blur(6px)" }} />;
    })}
  </div>
);

// Speed lines streaming behind something moving along `angle` (radians,
// direction of travel), centred on (x, y).
export const SpeedLines: React.FC<{ x: number; y: number; angle: number; k: number; frame: number; n?: number; spread?: number }> = ({ x, y, angle, k, frame, n = 16, spread = 120 }) =>
  k <= 0.02 ? null : (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
      {Array.from({ length: n }, (_, i) => {
        const off = (random(`sl-o-${i}`) - 0.5) * spread;
        const L = (120 + random(`sl-l-${i}`) * 380) * k;
        const back = 60 + ((frame * 37 + i * 97) % 300);
        const cx = x - Math.cos(angle) * back - Math.sin(angle) * off;
        const cy = y - Math.sin(angle) * back + Math.cos(angle) * off;
        return <line key={i} x1={cx} y1={cy} x2={cx - Math.cos(angle) * L} y2={cy - Math.sin(angle) * L} stroke="rgba(220,235,255,0.55)" strokeWidth={1 + random(`sl-w-${i}`) * 2} strokeLinecap="round" opacity={k} />;
      })}
    </svg>
  );

// Glass shards bursting out of (x, y) at frame `at`, falling under gravity.
export const Shards: React.FC<{ x: number; y: number; frame: number; at: number; n?: number; power?: number; seed?: string }> = ({ x, y, frame, at, n = 22, power = 1, seed = "sh" }) => {
  const t = frame - at;
  if (t < 0 || t > 60) return null;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
      {Array.from({ length: n }, (_, i) => {
        const a = random(`${seed}-a-${i}`) * Math.PI * 2;
        const v = (6 + random(`${seed}-v-${i}`) * 16) * power;
        const px = x + Math.cos(a) * v * t;
        const py = y + Math.sin(a) * v * t + 0.35 * t * t;
        const s = 5 + random(`${seed}-s-${i}`) * 12;
        const rot = t * (random(`${seed}-r-${i}`) - 0.5) * 40;
        return (
          <polygon key={i} points={`0,${-s} ${s * 0.6},${s * 0.4} ${-s * 0.5},${s * 0.7}`} transform={`translate(${px} ${py}) rotate(${rot})`} fill="rgba(210,235,255,0.55)" stroke="rgba(255,255,255,0.9)" strokeWidth={1} opacity={Math.max(0, 1 - t / 60)} />
        );
      })}
    </svg>
  );
};
