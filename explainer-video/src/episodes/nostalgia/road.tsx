import React from "react";
import { random } from "remotion";
import { fonts, palette } from "../../channels/backlit/look";
import { Halo } from "../../channels/backlit/parts";

// 《怀旧》's image: a road seen side-on. To the left, the way he came — warm,
// sepia, sharp, lined with photographs. To the right, where he's going — grey
// fog. He walks backwards into it, facing the past; at the end he turns round
// and the fog starts to glow.

export const SEPIA = "214, 160, 96";
export const FLOOR = 790;

// A person in profile, walking. `face` is the way he looks; `walk` is the
// stride phase (radians); `lean` tips him back (walking backwards) or forward.
export const Walker: React.FC<{ x: number; bottom?: number; height?: number; face?: "left" | "right"; walk?: number; lean?: number; glow?: number; rgb?: string; opacity?: number }> = ({
  x,
  bottom = FLOOR,
  height = 260,
  face = "left",
  walk = 0,
  lean = 0,
  glow = 0.8,
  rgb = palette.halo,
  opacity = 1,
}) => {
  const s = height / 260;
  const sw = Math.sin(walk) * 22;
  const rim = `rgba(${rgb},${0.4 + 0.55 * glow})`;
  const leg = (deg: number) => <rect x={-9} y={0} width={18} height={112} rx={8} transform={`translate(60 146) rotate(${deg})`} />;
  const arm = (deg: number) => <rect x={-7} y={0} width={14} height={78} rx={7} transform={`translate(60 76) rotate(${deg})`} />;
  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      <Halo x={x} y={bottom - height * 0.6} r={height * 0.9} intensity={glow} rgb={rgb} />
      <svg width={120 * s} height={260 * s} viewBox="0 0 120 260" style={{ position: "absolute", left: x - 60 * s, top: bottom - 260 * s, overflow: "visible", transform: `${face === "right" ? "scaleX(-1) " : ""}rotate(${lean}deg)`, transformOrigin: "50% 100%" }}>
        <g fill="#030405" stroke={rim} strokeWidth={1.8}>
          {arm(sw * 0.8)}
          {leg(-sw)}
          <path d="M38 150 L36 90 Q36 64 62 62 Q86 64 84 92 L82 150 Z" />
          {leg(sw)}
          {arm(-sw * 0.8)}
          {/* head, facing left: a nose bump on the left */}
          <path d="M60 6 A26 26 0 1 1 60 58 Q48 58 40 48 L34 40 L38 36 Q34 20 44 12 Q51 6 60 6 Z" />
        </g>
      </svg>
    </div>
  );
};

// A small photo standing by the road. `kind` picks the doodle inside.
export const Polaroid: React.FC<{ x: number; y: number; w?: number; rot?: number; kind: "cassette" | "desk" | "shop" | "kid" | "bike" | "home" | "blank"; caption?: string; tone?: number; opacity?: number; blur?: number }> = ({
  x,
  y,
  w = 170,
  rot = 0,
  kind,
  caption,
  tone = 1,
  opacity = 1,
  blur = 0,
}) => {
  const ink = `rgba(70,45,20,${0.85})`;
  const doodle: Record<string, React.ReactNode> = {
    cassette: (
      <g fill="none" stroke={ink} strokeWidth={3}>
        <rect x={20} y={30} width={100} height={64} rx={6} />
        <circle cx={48} cy={60} r={12} />
        <circle cx={92} cy={60} r={12} />
        <path d="M40 94 L50 80 L90 80 L100 94" />
      </g>
    ),
    desk: (
      <g fill="none" stroke={ink} strokeWidth={3}>
        <path d="M18 70 L122 70 M30 70 L30 110 M110 70 L110 110" />
        <rect x={44} y={40} width={50} height={30} />
        <path d="M50 50 L88 50 M50 58 L80 58" />
      </g>
    ),
    shop: (
      <g fill="none" stroke={ink} strokeWidth={3}>
        <path d="M20 50 L120 50 L112 30 L28 30 Z" />
        <rect x={28} y={50} width={84} height={58} />
        <rect x={58} y={70} width={26} height={38} />
      </g>
    ),
    kid: (
      <g fill="none" stroke={ink} strokeWidth={3}>
        <circle cx={70} cy={40} r={14} />
        <path d="M70 54 L70 86 M70 64 L52 76 M70 64 L88 76 M70 86 L58 108 M70 86 L82 108" />
      </g>
    ),
    bike: (
      <g fill="none" stroke={ink} strokeWidth={3}>
        <circle cx={40} cy={88} r={18} />
        <circle cx={100} cy={88} r={18} />
        <path d="M40 88 L62 58 L90 58 L100 88 M62 58 L72 88 L90 58" />
      </g>
    ),
    home: (
      <g fill="none" stroke={ink} strokeWidth={3}>
        <path d="M24 66 L70 30 L116 66 M34 60 L34 108 L106 108 L106 60" />
        <rect x={58} y={80} width={22} height={28} />
      </g>
    ),
    blank: null,
  };
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, transform: `rotate(${rot}deg)`, opacity, filter: blur ? `blur(${blur}px)` : undefined }}>
      <div style={{ background: "#f1ebdd", padding: `${w * 0.06}px ${w * 0.06}px ${w * 0.2}px`, boxShadow: "0 10px 26px rgba(0,0,0,0.5)" }}>
        <svg width={w * 0.88} height={w * 0.75} viewBox="0 0 140 120" style={{ display: "block", background: `rgba(${SEPIA},${0.35 + 0.45 * tone})` }}>
          {doodle[kind]}
        </svg>
      </div>
      {caption && <div style={{ position: "absolute", left: 0, right: 0, bottom: w * 0.04, textAlign: "center", fontSize: w * 0.1, fontWeight: 700, color: "#5a4632" }}>{caption}</div>}
    </div>
  );
};

const MEMORIES: { x: number; kind: "cassette" | "desk" | "shop" | "kid" | "bike" | "home"; caption: string; rot: number }[] = [
  { x: 110, kind: "kid", caption: "7 岁", rot: -6 },
  { x: 300, kind: "bike", caption: "那辆单车", rot: 5 },
  { x: 490, kind: "desk", caption: "高三", rot: -4 },
  { x: 680, kind: "cassette", caption: "那首歌", rot: 6 },
];

// The road: past on the left (warm, sharp, photographs), fog on the right.
// `fogX` is where the fog begins; `light` 0 → 1 warms the fog from within.
export const Road: React.FC<{ frame: number; fogX?: number; light?: number; photos?: number; future?: number }> = ({ frame, fogX = 980, light = 0, photos = 1, future = 0 }) => (
  <div style={{ position: "absolute", inset: 0 }}>
    {/* the past: warm */}
    <div style={{ position: "absolute", left: 0, top: 0, width: fogX + 200, height: FLOOR, background: `linear-gradient(90deg, rgba(${SEPIA},0.32), rgba(${SEPIA},0.12) 70%, transparent)` }} />
    <div style={{ position: "absolute", left: 0, top: FLOOR, width: 1920, height: 1080 - FLOOR, background: "#0a0c10" }} />
    <div style={{ position: "absolute", left: 0, top: FLOOR - 2, width: fogX + 100, height: 6, background: `linear-gradient(90deg, rgba(${SEPIA},0.95), rgba(${SEPIA},0.4))` }} />
    {MEMORIES.map((m, i) => (
      <div key={m.kind} style={{ position: "absolute", inset: 0, opacity: Math.max(0, Math.min(1, photos * MEMORIES.length - i)) }}>
        <div style={{ position: "absolute", left: m.x - 2, top: 470, width: 4, height: FLOOR - 470, background: "#3a2a1a" }} />
        <Polaroid x={m.x} y={300} w={150} rot={m.rot} kind={m.kind} caption={m.caption} />
      </div>
    ))}
    {/* the future: fog */}
    <div style={{ position: "absolute", left: fogX, top: 0, right: 0, bottom: 1080 - FLOOR - 40, background: `linear-gradient(90deg, rgba(120,128,140,0), rgba(120,128,140,0.55) 18%, rgba(110,118,130,0.7))` }} />
    {Array.from({ length: 9 }, (_, i) => {
      const drift = ((frame * (0.4 + random(`fd-${i}`) * 0.5) + random(`fx-${i}`) * 900) % 900);
      return <div key={i} style={{ position: "absolute", left: fogX + 40 + drift, top: 160 + random(`fy-${i}`) * 520, width: 380, height: 180, borderRadius: "50%", background: `rgba(${Math.round(160 + 95 * light)},${Math.round(168 + 30 * light)},${Math.round(180 - 60 * light)},${0.18 + 0.12 * light})`, filter: "blur(28px)" }} />;
    })}
    {/* faint shapes of photos-to-be inside the fog */}
    {future > 0 &&
      [1260, 1480, 1700].map((x, i) => <Polaroid key={x} x={x} y={300} w={140} rot={(i - 1) * 5} kind="blank" tone={0} opacity={future * 0.55} blur={2} />)}
    {/* the fog lighting up warm */}
    <div style={{ position: "absolute", left: fogX - 200, top: 0, right: 0, bottom: 1080 - FLOOR, background: `radial-gradient(ellipse at 70% 55%, rgba(255,200,125,${0.85 * light}), rgba(255,170,90,${0.38 * light}) 45%, transparent 80%)` }} />
  </div>
);

export const RoadLabels: React.FC<{ left?: string; right?: string; opacity?: number }> = ({ left = "← 来路 · 清清楚楚", right = "前方 · 一片模糊 →", opacity = 1 }) => (
  <>
    <div style={{ position: "absolute", left: 120, top: 200, fontFamily: fonts.mono, fontSize: 24, letterSpacing: 6, color: `rgb(${SEPIA})`, opacity }}>{left}</div>
    <div style={{ position: "absolute", right: 140, top: 200, fontFamily: fonts.mono, fontSize: 24, letterSpacing: 6, color: "rgba(200,208,220,0.8)", opacity }}>{right}</div>
  </>
);
