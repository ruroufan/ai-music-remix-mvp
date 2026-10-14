import React from "react";
import { random } from "remotion";
import { fonts, palette } from "../../channels/backlit/look";
import { FigureShape, type Pose } from "../../channels/backlit/figure";
import { Halo } from "../../channels/backlit/parts";

// 《孤独》's images: porcupines in the snow (close in, get pricked, pull apart);
// a crowd where everyone's outline is sharp except one; and a window seat
// where that one outline comes back.

const COLD = "150, 200, 255";

// ---------- snow ----------

export const Snowfield: React.FC<{ frame: number; ground?: number; flakes?: number; children?: React.ReactNode }> = ({ frame, ground = 800, flakes = 90, children }) => (
  <div style={{ position: "absolute", inset: 0 }}>
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#05080f, #0c1422 70%)" }} />
    <div style={{ position: "absolute", left: 0, top: ground, width: 1920, height: 1080 - ground, background: "linear-gradient(#1b2638, #0b1019)", borderTop: "2px solid rgba(220,235,255,0.35)" }} />
    {children}
    <Snow frame={frame} count={flakes} />
  </div>
);

export const Snow: React.FC<{ frame: number; count?: number; box?: { x: number; y: number; w: number; h: number }; opacity?: number }> = ({
  frame,
  count = 90,
  box = { x: 0, y: 0, w: 1920, h: 1080 },
  opacity = 1,
}) => (
  <>
    {Array.from({ length: count }, (_, i) => {
      const speed = 0.8 + random(`sv-${i}`) * 1.6;
      const r = 1.5 + random(`sr-${i}`) * 2.5;
      const y = (random(`sy-${i}`) * box.h + frame * speed) % box.h;
      const x = (random(`sx-${i}`) * box.w + Math.sin(frame / 30 + i) * 14 + box.w) % box.w;
      return <div key={i} style={{ position: "absolute", left: box.x + x, top: box.y + y, width: r * 2, height: r * 2, borderRadius: r, background: "#e8f0ff", opacity: opacity * (0.35 + random(`so-${i}`) * 0.5) }} />;
    })}
  </>
);

// ---------- porcupines ----------

// Quills along the top of the body, swept back toward the tail (left).
const QUILLS = Array.from({ length: 26 }, (_, i) => {
  const th = Math.PI * (1.08 + (i / 25) * 0.8); // along the upper arc
  const bx = -4 + Math.cos(th) * 48;
  const by = 8 + Math.sin(th) * 40;
  const dir = th - 0.4; // swept back
  return { bx, by, dx: Math.cos(dir), dy: Math.sin(dir), len: 0.8 + random(`q-${i}`) * 0.4 };
});

// One porcupine standing on the ground at (x, ground), facing right (or left
// with `flip`). `bristle` raises the quills, `hurt` turns them red, `cold`
// frosts it blue.
export const Porcupine: React.FC<{ x: number; ground: number; size?: number; flip?: boolean; bristle?: number; hurt?: number; cold?: number; breath?: number }> = ({
  x,
  ground,
  size = 1.4,
  flip = false,
  bristle = 0.4,
  hurt = 0,
  cold = 0,
  breath = 0,
}) => {
  const rgb = hurt > 0.05 ? "255, 77, 109" : cold > 0.3 ? COLD : palette.halo;
  const a = 0.55 + 0.4 * Math.max(hurt, 1 - cold * 0.5);
  return (
    <svg
      width={160 * size}
      height={110 * size}
      viewBox="-80 -80 160 110"
      style={{ position: "absolute", left: x - 80 * size, top: ground - 100 * size, overflow: "visible", transform: flip ? "scaleX(-1)" : undefined }}
    >
      <g stroke={`rgba(${rgb},${a})`} strokeWidth={1.6} strokeLinecap="round">
        {QUILLS.map((q, i) => {
          const L = (10 + 22 * bristle + hurt * 6) * q.len;
          return <line key={i} x1={q.bx} y1={q.by} x2={q.bx + q.dx * L} y2={q.by + q.dy * L} />;
        })}
      </g>
      {[-34, -16, 14, 30].map((lx) => (
        <rect key={lx} x={lx} y={8} width={7} height={12} rx={2} fill="#030405" />
      ))}
      <path d="M-50 12 Q-54 -28 -6 -32 Q40 -32 50 0 Q52 12 40 12 Z" fill="#030405" stroke={`rgba(${rgb},${a})`} strokeWidth={1.4} />
      <ellipse cx={54} cy={3} rx={13} ry={7} fill="#030405" stroke={`rgba(${rgb},${a})`} strokeWidth={1.2} />
      <circle cx={46} cy={-5} r={1.8} fill={`rgba(${rgb},0.9)`} />
      {breath > 0 && <circle cx={72 + breath * 14} cy={-4 - breath * 10} r={4 + breath * 8} fill={`rgba(${COLD},${0.35 * (1 - breath)})`} />}
      {cold > 0.3 && <path d="M-40 -10 Q-6 -30 40 -6" fill="none" stroke={`rgba(${COLD},${0.5 * cold})`} strokeWidth={3} strokeDasharray="2 6" />}
    </svg>
  );
};

// A red burst where two porcupines touch.
export const Prick: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) =>
  k <= 0.02 ? null : (
    <svg width={120} height={120} viewBox="-60 -60 120 120" style={{ position: "absolute", left: x - 60, top: y - 60, overflow: "visible" }}>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <line key={i} x1={Math.cos(a) * 8} y1={Math.sin(a) * 8} x2={Math.cos(a) * (14 + 30 * k)} y2={Math.sin(a) * (14 + 30 * k)} stroke={palette.alert} strokeWidth={3} strokeLinecap="round" opacity={k} />;
      })}
      <circle r={6 * k} fill={palette.alert} opacity={k} />
    </svg>
  );

// A row of porcupines. `gap` 0 = huddled (touching, pricking) → 1 = far apart
// (freezing). Left half faces right, right half faces left: toward each other.
export const Herd: React.FC<{ frame: number; cx: number; ground: number; gap: number; n?: number; size?: number; showPain?: boolean }> = ({
  frame,
  cx,
  ground,
  gap,
  n = 5,
  size = 1.25,
  showPain = true,
}) => {
  const spacing = size * (96 + gap * 190);
  const pain = Math.max(0, (0.22 - gap) / 0.22);
  const cold = Math.max(0, (gap - 0.55) / 0.45);
  const xs = Array.from({ length: n }, (_, i) => cx + (i - (n - 1) / 2) * spacing);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Halo x={cx} y={ground - 60} r={260 + (1 - gap) * 220} intensity={0.25 + 0.6 * (1 - gap) * (1 - cold)} />
      {xs.map((x, i) => {
        const shiver = Math.sin(frame * 2.7 + i * 1.3) * 3 * cold;
        const sz = size * (0.9 + random(`ps-${i}`) * 0.2);
        return (
          <Porcupine
            key={i}
            x={x + shiver}
            ground={ground}
            size={sz}
            flip={i >= n / 2}
            bristle={0.35 + pain * 0.65}
            hurt={pain}
            cold={cold}
            breath={cold > 0.2 ? ((frame + i * 11) % 40) / 40 : 0}
          />
        );
      })}
      {showPain &&
        xs.slice(1).map((x, i) => (
          <Prick key={i} x={(x + xs[i]) / 2} y={ground - 40 * size} k={pain * (0.7 + 0.3 * Math.abs(Math.sin(frame / 3 + i)))} />
        ))}
    </div>
  );
};

// ---------- people ----------

const HEADS: Record<Pose, { cx: number; cy: number }> = { plain: { cx: 60, cy: 34 }, proud: { cx: 64, cy: 28 }, hunch: { cx: 70, cy: 52 } };
const SPIKES: { head: boolean; a: number; x?: number; y?: number }[] = [
  ...Array.from({ length: 9 }, (_, i) => ({ head: true, a: -Math.PI * (0.12 + (i / 8) * 0.76) })),
  ...Array.from({ length: 6 }, (_, i) => ({ head: false, x: 22, y: 84 + i * 16, a: Math.PI * (1.08 + i * 0.02) })),
  ...Array.from({ length: 6 }, (_, i) => ({ head: false, x: 98, y: 84 + i * 16, a: -Math.PI * (0.08 + i * 0.02) })),
];

// A standing person. `ghost` 0 → 1 makes them translucent with a broken
// outline (present, but not really there); `spikes` gives them quills.
export const Person: React.FC<{
  x: number;
  bottom: number;
  height?: number;
  pose?: Pose;
  ghost?: number;
  glow?: number;
  spikes?: number;
  opacity?: number;
  flip?: boolean;
  rgb?: string;
}> = ({ x, bottom, height = 260, pose = "plain", ghost = 0, glow = 1, spikes = 0, opacity = 1, flip = false, rgb = palette.halo }) => {
  const s = height / 260;
  const h = HEADS[pose];
  const rimA = (0.35 + 0.6 * glow) * (1 - ghost * 0.6);
  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {glow * (1 - ghost) > 0.02 && <Halo x={x} y={bottom - height * 0.62} r={height * 0.95} intensity={glow * (1 - ghost)} rgb={rgb} />}
      <svg width={160 * s} height={300 * s} viewBox="-20 -30 160 300" style={{ position: "absolute", left: x - 80 * s, top: bottom - 290 * s, overflow: "visible", transform: flip ? "scaleX(-1)" : undefined }}>
        {spikes > 0.01 && (
          <g stroke={`rgba(${rgb},${0.85 * (1 - ghost)})`} strokeWidth={2.4} strokeLinecap="round">
            {SPIKES.map((p, i) => {
              const L = (8 + 16 * random(`sp-${i}`)) * spikes;
              const [x0, y0] = p.head ? [h.cx + Math.cos(p.a) * 28, h.cy + Math.sin(p.a) * 28] : [p.x!, p.y!];
              return <line key={i} x1={x0} y1={y0} x2={x0 + Math.cos(p.a) * L} y2={y0 + Math.sin(p.a) * L} />;
            })}
          </g>
        )}
        <g strokeDasharray={ghost > 0.25 ? "7 6" : undefined}>
          <FigureShape pose={pose} fill={`rgba(3,4,5,${1 - ghost * 0.85})`} rim={`rgba(${ghost > 0.25 ? "232,238,242" : rgb},${rimA})`} rimWidth={1.8 + ghost * 0.6} />
        </g>
      </svg>
    </div>
  );
};

// A crowd in three depth rows around the middle. Everyone is sharp and lit;
// `hero` (the one in the middle front) is drawn by the caller.
const CROWD = (() => {
  const rows = [
    { y: 600, h: 150, n: 13, a: 0.45 },
    { y: 690, h: 200, n: 10, a: 0.7 },
    { y: 790, h: 250, n: 8, a: 1 },
  ];
  const out: { x: number; bottom: number; h: number; a: number; pose: Pose; flip: boolean; k: number }[] = [];
  let k = 0;
  rows.forEach((r, ri) => {
    for (let i = 0; i < r.n; i++) {
      const x = 120 + (i + 0.5) * (1680 / r.n) + (random(`cx-${ri}-${i}`) - 0.5) * 60;
      if (ri === 2 && Math.abs(x - 960) < 170) continue; // leave room for the hero
      const poses: Pose[] = ["plain", "proud", "plain", "hunch"];
      out.push({ x, bottom: r.y, h: r.h * (0.9 + random(`ch-${ri}-${i}`) * 0.2), a: r.a, pose: poses[Math.floor(random(`cp-${ri}-${i}`) * 4)], flip: random(`cf-${ri}-${i}`) > 0.5, k: k++ });
    }
  });
  return out;
})();

export const CROWD_SIZE = CROWD.length;
export const HERO = { x: 960, bottom: 800, height: 260 };

const CHATTER = ["哈哈哈", "真的假的", "干杯！", "笑死", "下次再约", "对对对", "+1"];

// `count` limits how many people are there (they arrive in order);
// `chatter` 0 → 1 shows speech bubbles popping on the beat.
export const Crowd: React.FC<{ frame: number; count?: number; chatter?: number; beat?: number; opacity?: number; squeeze?: number }> = ({
  frame,
  count = CROWD.length,
  chatter = 0,
  beat = 15,
  opacity = 1,
  squeeze = 0,
}) => {
  const order = [...CROWD].sort((p, q) => random(`co-${p.k}`) - random(`co-${q.k}`));
  const on = new Set(order.slice(0, count).map((p) => p.k));
  const b = Math.floor(frame / beat);
  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {CROWD.map((p) => {
        if (!on.has(p.k)) return null;
        const sway = Math.sin(frame / 12 + p.k) * 4;
        const x = p.x + (HERO.x - p.x) * squeeze * 0.35 + sway;
        const talking = chatter > 0 && random(`talk-${p.k}-${b}`) > 0.82;
        return (
          <React.Fragment key={p.k}>
            <Person x={x} bottom={p.bottom} height={p.h} pose={p.pose} flip={p.flip} glow={0.55 * p.a} opacity={p.a} />
            {talking && (
              <div style={{ position: "absolute", left: x - 10, top: p.bottom - p.h - 52, padding: "4px 12px", borderRadius: 14, background: "rgba(232,238,242,0.92)", color: "#14181e", fontSize: 22 * (p.h / 250) + 6, fontWeight: 700, opacity: chatter * p.a, whiteSpace: "nowrap" }}>
                {CHATTER[Math.floor(random(`said-${p.k}-${b}`) * CHATTER.length)]}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ---------- the window seat ----------

// Seated, facing right, in a 160×260 box (same scale as FigureShape).
const SEATED = {
  head: { cx: 54, cy: 52 },
  torso: "M30 140 Q26 92 54 86 Q84 84 86 120 L90 168 L32 168 Z",
  thigh: "M34 152 L130 152 Q138 152 138 162 L138 178 L34 178 Z",
  shin: "M118 170 L138 170 L140 252 L118 252 Z",
};

// A room corner at dusk: a big window with snow falling outside, a seat, a
// cup on the sill, and a person sitting alone. `solid` 0 → 1 brings their
// outline back from broken and see-through to sharp and lit.
export const WindowSeat: React.FC<{ frame: number; solid: number; opacity?: number }> = ({ frame, solid, opacity = 1 }) => {
  const win = { x: 1000, y: 170, w: 640, h: 520 };
  const ghost = 1 - solid;
  const rimA = 0.3 + 0.65 * solid;
  const rim = solid > 0.6 ? `rgba(${palette.halo},${rimA})` : `rgba(232,238,242,${rimA})`;
  const fill = `rgba(3,4,5,${0.2 + 0.8 * solid})`;
  const s = 1.25;
  const seat = { x: 820, floor: 790 };
  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#0a0f18, #0d131e)" }} />
      <div style={{ position: "absolute", left: 0, top: seat.floor, width: 1920, height: 1080 - seat.floor, background: "#080b10", borderTop: `1px solid ${palette.faint}` }} />
      {/* the window: dusk outside, snow, far-off lights */}
      <div style={{ position: "absolute", left: win.x, top: win.y, width: win.w, height: win.h, overflow: "hidden", border: "6px solid #1e2632" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#1b2a44, #3a4a66 60%, #c98b5f)" }} />
        {Array.from({ length: 22 }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: random(`wl-${i}`) * win.w, top: win.h * 0.72 + random(`wy-${i}`) * win.h * 0.22, width: 4, height: 4, borderRadius: 2, background: "#ffcf8a", opacity: 0.5 + 0.5 * Math.abs(Math.sin(frame / 25 + i)) }} />
        ))}
        <Snow frame={frame} count={40} box={{ x: 0, y: 0, w: win.w, h: win.h }} opacity={0.9} />
        <div style={{ position: "absolute", left: win.w / 2 - 3, top: 0, width: 6, height: win.h, background: "#1e2632" }} />
      </div>
      <div style={{ position: "absolute", left: win.x - 30, top: win.y + win.h, width: win.w + 60, height: 18, background: "#1e2632" }} />
      {/* window light on the floor and on him */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(240deg, rgba(${palette.halo},${0.1 + 0.18 * solid}), transparent 60%)` }} />
      {/* cup with steam */}
      <div style={{ position: "absolute", left: win.x + 40, top: win.y + win.h - 40, width: 36, height: 40, borderRadius: "0 0 10px 10px", background: "#2a3242" }} />
      <svg width={60} height={80} style={{ position: "absolute", left: win.x + 30, top: win.y + win.h - 120 }}>
        {[0, 1].map((k) => (
          <path key={k} d={`M${20 + k * 14} 76 q -8 -16 0 -32 q 8 -16 0 -32`} fill="none" stroke="rgba(232,238,242,0.35)" strokeWidth={2} strokeDasharray="6 5" strokeDashoffset={-frame * 0.6 + k * 7} />
        ))}
      </svg>
      {/* the seat */}
      <div style={{ position: "absolute", left: seat.x - 30, top: seat.floor - 115 * s + 6, width: 150 * s, height: 26, borderRadius: 6, background: "#1c2330", border: `1px solid ${palette.faint}` }} />
      <div style={{ position: "absolute", left: seat.x - 20, top: seat.floor - 115 * s + 30, width: 16, height: 115 * s - 30, background: "#141a24" }} />
      <div style={{ position: "absolute", left: seat.x + 150 * s - 60, top: seat.floor - 115 * s + 30, width: 16, height: 115 * s - 30, background: "#141a24" }} />
      {solid > 0.05 && <Halo x={seat.x + 60 * s} y={seat.floor - 200 * s} r={260} intensity={solid * 0.9} />}
      <svg width={160 * s} height={260 * s} viewBox="0 0 160 260" style={{ position: "absolute", left: seat.x - 20, top: seat.floor - 260 * s, overflow: "visible" }}>
        <g fill={fill} stroke={rim} strokeWidth={1.8 + ghost * 0.4} strokeDasharray={ghost > 0.25 ? "7 6" : undefined}>
          <path d={SEATED.shin} />
          <path d={SEATED.thigh} />
          <path d={SEATED.torso} />
          <circle cx={SEATED.head.cx} cy={SEATED.head.cy} r={28} />
        </g>
      </svg>
      <div style={{ position: "absolute", left: win.x, top: win.y - 44, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 6, color: palette.dim, opacity: solid }}>
        16:40 · 一个人
      </div>
    </div>
  );
};
