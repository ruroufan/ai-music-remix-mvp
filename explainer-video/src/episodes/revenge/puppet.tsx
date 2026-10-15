import React from "react";
import { random } from "remotion";
import { fonts, palette } from "../../channels/backlit/look";
import { FigureShape, type Pose } from "../../channels/backlit/figure";
import { Halo } from "../../channels/backlit/parts";

// 《报复性熬夜》's images: by day the person hangs from strings like a marionette
// (work, messages, meetings…); at night the strings snap one by one and he sits
// in the light of a phone; at the end, in daylight, he cuts one himself.

// Where each string is tied on the figure (120×260 figure units) and what it is.
export const STRINGS = [
  { label: "工作", at: [60, 8], top: 0.5 },
  { label: "消息", at: [24, 86], top: 0.2 },
  { label: "会议", at: [96, 86], top: 0.8 },
  { label: "老板", at: [28, 150], top: 0.05 },
  { label: "KPI", at: [92, 150], top: 0.95 },
  { label: "群聊", at: [46, 220], top: 0.33 },
  { label: "别人的要求", at: [74, 220], top: 0.67 },
];
export const N_STRINGS = STRINGS.length;
const TOP_Y = 120;

// `snap[i]` 0 → 1: string i breaks (1 = gone, a limp end left hanging).
// `jerk` 0 → 1: how hard the strings yank him around on the beat.
export const Puppet: React.FC<{
  x: number;
  bottom: number;
  height?: number;
  frame: number;
  beat: number;
  snap?: number[];
  jerk?: number;
  pose?: Pose;
  glow?: number;
  span?: number;
  highlight?: number; // index of a string to light up
  labels?: boolean;
}> = ({ x, bottom, height = 300, frame, beat, snap = [], jerk = 1, pose = "plain", glow = 0.7, span = 760, highlight = -1, labels = true }) => {
  const s = height / 260;
  const ph = (frame % beat) / beat;
  const n = Math.floor(frame / beat);
  const live = STRINGS.filter((_, i) => (snap[i] ?? 0) < 1).length / STRINGS.length;
  const pull = jerk * live;
  const dy = -14 * pull * Math.exp(-ph * 5);
  const tilt = (n % 2 ? 3 : -3) * pull * Math.exp(-ph * 3);
  const top = bottom - 260 * s + dy;
  const at = (ax: number, ay: number) => {
    // rotate the tie point about the feet by `tilt`
    const px = (ax - 60) * s, py = (ay - 260) * s;
    const r = (tilt * Math.PI) / 180;
    return { x: x + px * Math.cos(r) - py * Math.sin(r), y: bottom + dy + px * Math.sin(r) + py * Math.cos(r) };
  };
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Halo x={x} y={bottom - height * 0.6} r={height} intensity={glow} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {STRINGS.map((st, i) => {
          const p = snap[i] ?? 0;
          const a = at(st.at[0], st.at[1]);
          const tx = x - span / 2 + st.top * span;
          const mid = TOP_Y + (a.y - TOP_Y) * 0.45;
          const hot = i === highlight;
          const color = hot ? palette.accent : "rgba(232,238,242,0.55)";
          if (p <= 0) return <line key={i} x1={tx} y1={TOP_Y} x2={a.x} y2={a.y} stroke={color} strokeWidth={hot ? 2.6 : 1.6} />;
          // broken: the upper half whips up, the lower half falls slack
          const mx = tx + (a.x - tx) * 0.45;
          const upEnd = mid - (mid - TOP_Y) * Math.min(1, p * 1.2);
          const hang = 50 + 30 * p;
          return (
            <g key={i}>
              <line x1={tx} y1={TOP_Y} x2={tx + (mx - tx) * (1 - p)} y2={upEnd} stroke={color} strokeWidth={1.6} opacity={1 - p * 0.7} />
              <path d={`M${a.x} ${a.y} Q${a.x + 20 * p} ${a.y - (a.y - mid) * (1 - p) * 0.5} ${a.x + 26 * p} ${a.y - (a.y - mid) * (1 - p) + hang * p * 0.2}`} fill="none" stroke={color} strokeWidth={1.6} opacity={1 - p * 0.4} />
              {p < 0.35 && (
                <g transform={`translate(${mx} ${mid})`} opacity={1 - p / 0.35}>
                  {Array.from({ length: 6 }, (_, k) => {
                    const ang = (k / 6) * Math.PI * 2;
                    return <line key={k} x1={0} y1={0} x2={Math.cos(ang) * 22} y2={Math.sin(ang) * 22} stroke={palette.alert} strokeWidth={2.5} />;
                  })}
                </g>
              )}
            </g>
          );
        })}
      </svg>
      {labels &&
        STRINGS.map((st, i) => {
          const p = snap[i] ?? 0;
          const tx = x - span / 2 + st.top * span;
          const hot = i === highlight;
          return (
            <div key={st.label} style={{ position: "absolute", left: tx, top: TOP_Y - 44, transform: "translateX(-50%)", padding: "4px 12px", borderRadius: 6, border: `1px solid ${hot ? palette.accent : palette.faint}`, background: hot ? "rgba(63,224,207,0.18)" : "rgba(6,8,12,0.85)", fontSize: 22, fontWeight: 700, whiteSpace: "nowrap", color: hot ? palette.accent : palette.ink, opacity: 1 - p * 0.75 }}>
              {st.label}
            </div>
          );
        })}
      <svg width={120 * s} height={260 * s} viewBox="0 0 120 260" style={{ position: "absolute", left: x - 60 * s, top, transform: `rotate(${tilt}deg)`, transformOrigin: "50% 100%", overflow: "visible" }}>
        <FigureShape pose={pose} rim={`rgba(${palette.halo},${0.35 + 0.6 * glow})`} />
        {STRINGS.map((st, i) => ((snap[i] ?? 0) < 1 ? <circle key={i} cx={st.at[0]} cy={st.at[1]} r={3} fill="#c9b48a" /> : null))}
      </svg>
    </div>
  );
};

// Seated on the edge of a bed, facing right, in the 160×260 box.
const SEATED = {
  head: { cx: 70, cy: 60 },
  torso: "M36 150 Q30 100 62 92 Q92 90 96 128 L98 172 L38 172 Z",
  thigh: "M40 156 L132 156 Q140 156 140 166 L140 182 L40 182 Z",
  shin: "M120 174 L140 174 L142 252 L120 252 Z",
};

// The bedroom at night: bed, lamp, window with the moon, a clock, and him
// sitting up in the blue light of his phone. `lamp` 0/1, `glow` = phone light.
export const NightRoom: React.FC<{ frame: number; clock?: string; glow?: number; lamp?: number; scroll?: boolean; x?: number; floor?: number; opacity?: number }> = ({
  frame,
  clock = "01:47",
  glow = 1,
  lamp = 0,
  scroll = true,
  x = 820,
  floor = 800,
  opacity = 1,
}) => {
  const s = 1.3;
  const face = { x: x + (SEATED.head.cx + 20) * s, y: floor - (260 - SEATED.head.cy) * s };
  const phone = { x: x + 150 * s, y: floor - 160 * s };
  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#04060b, #080c14)" }} />
      <div style={{ position: "absolute", left: 0, top: floor, width: 1920, height: 1080 - floor, background: "#05070b", borderTop: `1px solid ${palette.faint}` }} />
      {/* window + moon */}
      <div style={{ position: "absolute", left: 1380, top: 190, width: 240, height: 300, border: "4px solid #1a202b", background: "linear-gradient(#050914, #0c1424)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 140, top: 50, width: 40, height: 40, borderRadius: 20, boxShadow: "-10px 5px 0 0 #e8eef2" }} />
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: random(`ws-${i}`) * 240, top: random(`wy-${i}`) * 300, width: 2, height: 2, background: "#fff", opacity: 0.3 + 0.5 * Math.abs(Math.sin(frame / 20 + i)) }} />
        ))}
      </div>
      {/* bed */}
      <div style={{ position: "absolute", left: x - 260, top: floor - 110, width: 640, height: 90, borderRadius: 14, background: "#151b26", border: `1px solid ${palette.faint}` }} />
      <div style={{ position: "absolute", left: x - 240, top: floor - 140, width: 160, height: 40, borderRadius: 18, background: "#222a38" }} />
      {/* nightstand, lamp, clock */}
      <div style={{ position: "absolute", left: x - 470, top: floor - 150, width: 150, height: 150, background: "#121821", border: `1px solid ${palette.faint}` }} />
      <div style={{ position: "absolute", left: x - 440, top: floor - 230, width: 90, height: 60, borderRadius: "40px 40px 6px 6px", background: lamp ? "#ffd9a0" : "#2a3242", boxShadow: lamp ? "0 0 120px 40px rgba(255,200,140,0.35)" : "none" }} />
      <div style={{ position: "absolute", left: x - 405, top: floor - 170, width: 20, height: 22, background: "#2a3242" }} />
      <div style={{ position: "absolute", left: x - 460, top: floor - 140, fontFamily: fonts.mono, fontSize: 34, color: palette.alert }}>{clock}</div>
      {/* phone light on him */}
      <div style={{ position: "absolute", left: face.x - 260, top: face.y - 200, width: 520, height: 420, background: `radial-gradient(ellipse at 60% 55%, rgba(140,190,255,${0.32 * glow}), transparent 60%)` }} />
      <svg width={160 * s} height={260 * s} viewBox="0 0 160 260" style={{ position: "absolute", left: x, top: floor - 260 * s, overflow: "visible" }}>
        <g fill="#030405" stroke={`rgba(140,190,255,${0.4 + 0.5 * glow})`} strokeWidth={1.8}>
          <path d={SEATED.shin} />
          <path d={SEATED.thigh} />
          <path d={SEATED.torso} />
          <circle cx={SEATED.head.cx} cy={SEATED.head.cy} r={28} />
        </g>
      </svg>
      {/* the phone */}
      <div style={{ position: "absolute", left: phone.x - 20, top: phone.y - 36, width: 40, height: 70, borderRadius: 7, background: `rgba(190,225,255,${0.6 + 0.4 * glow})`, boxShadow: `0 0 ${40 * glow}px rgba(150,200,255,${0.8 * glow})`, transform: "rotate(-20deg)", overflow: "hidden" }}>
        {scroll &&
          Array.from({ length: 6 }, (_, i) => (
            <div key={i} style={{ position: "absolute", left: 5, top: ((i * 16 - frame * 3) % 96 + 96) % 96 - 12, width: 30, height: 10, borderRadius: 2, background: "rgba(40,70,110,0.5)" }} />
          ))}
      </div>
    </div>
  );
};

// A pair of scissors centred at (x, y); `close` 0 → 1 snips.
export const Scissors: React.FC<{ x: number; y: number; close: number; rot?: number; size?: number }> = ({ x, y, close, rot = 0, size = 1 }) => {
  const a = 24 * (1 - close);
  return (
    <svg width={200 * size} height={200 * size} viewBox="-100 -100 200 200" style={{ position: "absolute", left: x - 100 * size, top: y - 100 * size, transform: `rotate(${rot}deg)`, overflow: "visible" }}>
      {[1, -1].map((d) => (
        <g key={d} transform={`rotate(${d * a})`}>
          <path d={`M0 0 L-90 ${d * -6} L-92 ${d * 2} Z`} fill="#dfe8ef" stroke="#9aa3ad" strokeWidth={1} />
          <circle cx={36} cy={d * 16} r={15} fill="none" stroke={palette.accent} strokeWidth={6} />
          <line x1={0} y1={0} x2={24} y2={d * 10} stroke={palette.accent} strokeWidth={6} strokeLinecap="round" />
        </g>
      ))}
      <circle r={4} fill="#9aa3ad" />
    </svg>
  );
};

// A 24-hour bar from x0 to x0 + w: `blocks` are [start hour, end hour, label, color].
export const DayBar: React.FC<{ x: number; y: number; w: number; blocks: [number, number, string, string][]; h?: number; reveal?: number; cursor?: number }> = ({ x, y, w, blocks, h = 70, reveal = 1, cursor }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h }}>
    <div style={{ position: "absolute", inset: 0, border: `1px solid ${palette.faint}`, background: "#0b0f16" }} />
    {blocks.map(([a, b, label, color], i) => {
      const vis = Math.max(0, Math.min(1, reveal * blocks.length - i));
      return (
        <div key={i} style={{ position: "absolute", left: (a / 24) * w, top: 0, width: ((b - a) / 24) * w * vis, height: h, background: color, borderRight: "2px solid #06080c", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#06080c", whiteSpace: "nowrap" }}>
          {vis > 0.9 ? label : ""}
        </div>
      );
    })}
    {[0, 6, 12, 18, 24].map((hr) => (
      <div key={hr} style={{ position: "absolute", left: (hr / 24) * w - 20, top: h + 8, width: 40, textAlign: "center", fontFamily: fonts.mono, fontSize: 16, color: palette.dim }}>{hr}:00</div>
    ))}
    {cursor !== undefined && <div style={{ position: "absolute", left: (cursor / 24) * w - 2, top: -16, width: 4, height: h + 32, background: palette.alert }} />}
  </div>
);
