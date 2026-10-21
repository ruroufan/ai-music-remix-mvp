import React from "react";
import { random } from "remotion";
import { fonts, palette } from "../../channels/backlit/look";
import { Seated } from "../friction/tangle";

// 《信息焦虑》's image: a man surrounded by countless small glowing screens,
// each one showing somewhere else in the world, and the more there are the
// fainter he gets. He closes his phone; the screens go out one by one; his
// outline comes back — and across the table someone is talking to him.

export const FLOOR = 770;
export const GLOW = "120, 200, 255";
export const ALERT = "255, 77, 109";
export const WARM = "255, 199, 122";
export const HIM_X = 800; // his chair's front edge (facing right)
export const S = 1.2;
const TABLE = { x0: HIM_X + 20, x1: 1920 - HIM_X - 20, y: FLOOR - 128 * S };

const PLACES = ["纽约 · LIVE", "东京 03:12", "伦敦 · 热搜", "巴黎", "首尔 · 直播", "悉尼", "开罗", "里约", "柏林", "孟买", "洛杉矶", "迪拜", "上海 · 突发", "莫斯科", "多伦多", "新加坡"];
const KINDS = ["live", "chart", "weather", "chat", "sport", "hot", "video", "map"] as const;

const Thumb: React.FC<{ kind: (typeof KINDS)[number]; frame: number; seed: number }> = ({ kind, frame, seed }) => {
  const w = 160, h = 90;
  const ph = frame / 6 + seed;
  switch (kind) {
    case "live":
      return (
        <g>
          {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={10 + i * 24} y={h - 20 - ((i * 37 + seed * 11) % 40)} width={18} height={20 + ((i * 37 + seed * 11) % 40)} fill="rgba(120,200,255,0.35)" />)}
          <rect x={8} y={8} width={38} height={16} rx={3} fill={`rgb(${ALERT})`} opacity={Math.sin(ph) > 0 ? 1 : 0.5} />
          <text x={27} y={20} textAnchor="middle" fontSize={11} fontWeight={800} fill="#fff" fontFamily={fonts.mono}>LIVE</text>
        </g>
      );
    case "chart":
      return <polyline points={Array.from({ length: 12 }, (_, i) => `${8 + i * 13},${h / 2 + Math.sin(i * 1.3 + ph * 0.6) * 20 + (i % 3) * 3}`).join(" ")} fill="none" stroke={seed % 2 ? "#3fbf6a" : `rgb(${ALERT})`} strokeWidth={3} />;
    case "weather":
      return (
        <g>
          <path d="M40 60 Q36 36 60 34 Q68 16 90 22 Q112 18 116 40 Q132 44 126 60 Z" fill="rgba(200,215,230,0.4)" />
          <path d={`M78 ${62} L70 ${78} L82 ${76} L74 ${92}`} stroke="#ffd34d" strokeWidth={3} fill="none" opacity={Math.sin(ph * 2) > 0.3 ? 1 : 0.2} />
          <text x={140} y={30} textAnchor="end" fontSize={18} fill="#fff" fontFamily={fonts.mono}>{20 + (seed % 15)}°</text>
        </g>
      );
    case "chat":
      return (
        <g>
          <rect x={10} y={14} width={90} height={22} rx={10} fill="rgba(255,255,255,0.3)" />
          <rect x={60} y={44} width={90} height={22} rx={10} fill="rgba(63,191,106,0.6)" />
          <circle cx={146} cy={14} r={11} fill={`rgb(${ALERT})`} />
          <text x={146} y={18} textAnchor="middle" fontSize={11} fontWeight={800} fill="#fff">{(seed * 7) % 99}</text>
        </g>
      );
    case "sport":
      return <text x={w / 2} y={60} textAnchor="middle" fontSize={34} fontWeight={900} fill="#fff" fontFamily={fonts.mono}>{seed % 4}:{(seed + Math.floor(frame / 90)) % 3}</text>;
    case "hot":
      return (
        <g>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <text x={10} y={26 + i * 24} fontSize={14} fontWeight={900} fill={i === 0 ? `rgb(${ALERT})` : "#ffb060"}>{i + 1}</text>
              <rect x={28} y={16 + i * 24} width={100 - i * 20 + ((seed * 13) % 20)} height={10} rx={3} fill="rgba(255,255,255,0.35)" />
            </g>
          ))}
          <text x={146} y={26} textAnchor="end" fontSize={14} fontWeight={900} fill={`rgb(${ALERT})`}>热</text>
        </g>
      );
    case "video":
      return (
        <g>
          <path d="M66 28 L98 46 L66 64 Z" fill="rgba(255,255,255,0.75)" />
          <rect x={10} y={h - 12} width={w - 20} height={4} fill="rgba(255,255,255,0.2)" />
          <rect x={10} y={h - 12} width={((frame * 0.7 + seed * 30) % (w - 20))} height={4} fill={`rgb(${ALERT})`} />
        </g>
      );
    default:
      return (
        <g>
          <path d="M10 30 Q50 10 80 34 T150 30" stroke="rgba(120,200,255,0.35)" strokeWidth={2} fill="none" />
          <path d="M20 70 Q60 50 100 72 T150 64" stroke="rgba(120,200,255,0.35)" strokeWidth={2} fill="none" />
          <path d={`M80 ${54 - 6 * Math.abs(Math.sin(ph))} q-12 -16 0 -26 q12 10 0 26 Z`} fill={`rgb(${ALERT})`} />
        </g>
      );
  }
};

// One glowing screen at (x, y), scaled `s`, `on` 0 → 1 (it flickers out on
// its way to 0). `blur` for the ones close to the camera.
export const Tile: React.FC<{ i: number; x: number; y: number; s?: number; on?: number; frame: number; blur?: number; tilt?: number }> = ({ i, x, y, s = 1, on = 1, frame, blur = 0, tilt = 0 }) => {
  if (on <= 0.01) return null;
  const kind = KINDS[i % KINDS.length];
  const flick = on < 1 ? (Math.sin(frame * 3.7 + i) > 0 ? on : on * 0.4) : 1;
  return (
    <div style={{ position: "absolute", left: x - 85 * s, top: y - 62 * s, width: 170 * s, opacity: flick, filter: blur > 0.2 ? `blur(${blur}px)` : undefined, transform: `rotate(${tilt}deg) scale(${0.85 + 0.15 * on})` }}>
      <div style={{ width: 170 * s, height: 100 * s, borderRadius: 8 * s, background: "rgba(8,16,26,0.92)", border: `${Math.max(1, 2 * s)}px solid rgba(${GLOW},0.75)`, boxShadow: `0 0 ${24 * s}px rgba(${GLOW},0.45)`, overflow: "hidden" }}>
        <svg width={170 * s} height={100 * s} viewBox="-5 -5 170 100">
          <Thumb kind={kind} frame={frame} seed={i} />
        </svg>
      </div>
      <div style={{ marginTop: 4 * s, fontFamily: fonts.mono, fontSize: 13 * s, letterSpacing: 1, color: `rgba(${GLOW},0.9)`, whiteSpace: "nowrap" }}>{PLACES[i % PLACES.length]}</div>
    </div>
  );
};

// Where the i-th screen of the cloud sits: a loose ring round (cx, cy), the
// later ones further out, some of them in front (bigger, blurred).
export const slot = (i: number, cx = 900, cy = 470) => {
  const a = random(`sa-${i}`) * Math.PI * 2;
  const near = random(`sn-${i}`) > 0.82;
  const r = 230 + random(`sr-${i}`) * 520 + (i % 5) * 20;
  return { x: cx + Math.cos(a) * r * 1.35, y: Math.max(150, Math.min(720, cy + Math.sin(a) * r * 0.62)), s: near ? 1.5 : 0.75 + random(`ss-${i}`) * 0.5, blur: near ? 3 : 0, tilt: (random(`st-${i}`) - 0.5) * 14 };
};

// The cloud: `count` screens shown, `on(i)` for each (default 1).
export const ScreenCloud: React.FC<{ frame: number; count: number; on?: (i: number) => number; drift?: number; cx?: number; cy?: number }> = ({ frame, count, on = () => 1, drift = 1, cx, cy }) => (
  <>
    {Array.from({ length: count }, (_, i) => {
      const p = slot(i, cx, cy);
      const dx = Math.sin(frame / 40 + i) * 8 * drift, dy = Math.cos(frame / 47 + i * 2) * 6 * drift;
      return <Tile key={i} i={i} x={p.x + dx} y={p.y + dy} s={p.s} blur={p.blur} tilt={p.tilt} on={on(i)} frame={frame} />;
    })}
  </>
);

// The table: him on the left facing right, phone up (`phone` 1) or face down
// on the table (0); `fade` how far he's faded away; someone across from him
// (`other` 0 → 1), talking (`talk`); a bowl with a little steam.
export const Table: React.FC<{ frame: number; phone?: number; fade?: number; other?: number; talk?: number; turn?: number; bowl?: number }> = ({ frame, phone = 1, fade = 0, other = 0, talk = 0, bowl = 1 }) => {
  const headX = HIM_X - 70 * S, headY = FLOOR - 204 * S;
  const px = headX + 70, py = headY + 40;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* the other person: the same seated figure, mirrored */}
      {other > 0.01 && (
        <div style={{ position: "absolute", inset: 0, transformOrigin: "960px 0", transform: "scaleX(-1)", opacity: other }}>
          <Seated x={HIM_X} floor={FLOOR} scale={S} glow={0.5 + 0.3 * talk} />
        </div>
      )}
      {/* talking: small arcs from their mouth */}
      {talk > 0.01 &&
        [0, 1, 2].map((k) => {
          const t = ((frame / 20 + k / 3) % 1);
          return <div key={k} style={{ position: "absolute", left: 1920 - headX - 60 - 50 * t, top: headY - 16 - 20 * t, width: 30 + 40 * t, height: 40 + 40 * t, borderRadius: "50%", borderLeft: `3px solid rgba(${WARM},${(1 - t) * talk})` }} />;
        })}
      {/* table */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <rect x={TABLE.x0} y={TABLE.y} width={TABLE.x1 - TABLE.x0} height={14} rx={3} fill="#2a2118" stroke={`rgba(${WARM},0.4)`} strokeWidth={1.5} />
        <rect x={(TABLE.x0 + TABLE.x1) / 2 - 8} y={TABLE.y + 14} width={16} height={FLOOR - TABLE.y - 14} fill="#1b1410" />
        <path d={`M${(TABLE.x0 + TABLE.x1) / 2 - 60} ${FLOOR} L${(TABLE.x0 + TABLE.x1) / 2 + 60} ${FLOOR}`} stroke="#1b1410" strokeWidth={6} />
        {bowl > 0 && (
          <g opacity={bowl}>
            <path d={`M920 ${TABLE.y - 2} Q960 ${TABLE.y + 30} 1000 ${TABLE.y - 2} Z`} transform={`translate(0 -26)`} fill="#d9d2c4" />
            {[0, 1].map((k) => (
              <path key={k} d={`M${950 + k * 20} ${TABLE.y - 34} q${6 * Math.sin(frame / 10 + k)} -14 0 -28 q${-6 * Math.sin(frame / 10 + k)} -14 0 -28`} fill="none" stroke="rgba(232,238,242,0.3)" strokeWidth={2} strokeLinecap="round" />
            ))}
          </g>
        )}
        {/* the phone face-down on the table */}
        {phone < 0.5 && <rect x={860} y={TABLE.y - 6} width={46} height={6} rx={2} fill="#0a0d12" stroke={palette.faint} strokeWidth={1} />}
      </svg>
      {/* him */}
      <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.82 * fade, filter: fade > 0.05 ? `blur(${fade * 3}px)` : undefined }}>
        <Seated x={HIM_X} floor={FLOOR} scale={S} glow={0.6 * (1 - fade) + 0.2} slump={phone > 0.5 ? 0.5 : -0.1} />
      </div>
      {fade > 0.3 && (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <rect x={HIM_X - 150 * S} y={FLOOR - 270 * S} width={170 * S} height={270 * S} rx={20} fill="none" stroke={`rgba(232,238,242,${0.45 * fade})`} strokeWidth={2} strokeDasharray="8 7" />
        </svg>
      )}
      {/* the phone in his hand, lighting his face */}
      {phone >= 0.5 && (
        <>
          <div style={{ position: "absolute", left: px - 60, top: py - 60, width: 160, height: 160, borderRadius: "50%", background: `radial-gradient(circle, rgba(${GLOW},${0.35 * phone}), transparent 65%)` }} />
          <div style={{ position: "absolute", left: px, top: py, width: 28, height: 48, borderRadius: 5, background: `rgba(${GLOW},0.9)`, border: "2px solid #0a0d12", transform: "rotate(-18deg)", boxShadow: `0 0 18px rgba(${GLOW},0.9)` }} />
        </>
      )}
    </div>
  );
};
