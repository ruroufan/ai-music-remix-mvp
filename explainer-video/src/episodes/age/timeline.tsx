import React from "react";
import { random } from "remotion";
import { fonts, palette } from "../../channels/backlit/look";

// 《年龄焦虑》's image: a long timeline studded with other people's milestones —
// married at 26, a flat at 28, promoted at 29 — and a person running along it.
// At the end he steps down off it, and a small path of his own grows under his feet.

export const PINS = [
  { age: 22, label: "毕业", who: "同学" },
  { age: 24, label: "年薪三十万", who: "表哥" },
  { age: 25, label: "结婚", who: "小林" },
  { age: 26, label: "买房", who: "老同学" },
  { age: 27, label: "升职", who: "前同事" },
  { age: 28, label: "生娃", who: "闺蜜" },
  { age: 29, label: "创业", who: "室友" },
  { age: 30, label: "第二套房", who: "发小" },
  { age: 31, label: "财务自由", who: "博主" },
  { age: 32, label: "移民", who: "学长" },
  { age: 33, label: "当总监", who: "邻居" },
  { age: 34, label: "二胎", who: "堂姐" },
];

export const PX_PER_YEAR = 300;
export const AXIS_Y = 640;

// The axis, scrolled so that `age` sits at screen x `at`. `behind` (an age)
// turns every pin before it red: those are the ones he's "behind" on.
export const Axis: React.FC<{ age: number; at?: number; y?: number; opacity?: number; behind?: number; blur?: number }> = ({ age, at = 760, y = AXIS_Y, opacity = 1, behind, blur = 0 }) => {
  const X = (a: number) => at + (a - age) * PX_PER_YEAR;
  const from = Math.floor(age - at / PX_PER_YEAR) - 1, to = Math.ceil(age + (1920 - at) / PX_PER_YEAR) + 1;
  return (
    <div style={{ position: "absolute", inset: 0, opacity, filter: blur ? `blur(${blur}px)` : undefined }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: y - 3, height: 6, background: `linear-gradient(90deg, rgba(232,238,242,0.15), rgba(232,238,242,0.6) 40%, rgba(232,238,242,0.6) 60%, rgba(232,238,242,0.15))` }} />
      {Array.from({ length: Math.max(0, to - from) * 4 }, (_, k) => {
        const a = from + k / 4;
        const major = k % 4 === 0;
        return (
          <React.Fragment key={k}>
            <div style={{ position: "absolute", left: X(a) - 1, top: y + 6, width: 2, height: major ? 22 : 10, background: major ? palette.ink : palette.faint }} />
            {major && <div style={{ position: "absolute", left: X(a) - 40, top: y + 34, width: 80, textAlign: "center", fontFamily: fonts.mono, fontSize: 20, color: palette.dim }}>{a} 岁</div>}
          </React.Fragment>
        );
      })}
      {PINS.filter((p) => p.age >= from && p.age <= to).map((p, i) => {
        const late = behind !== undefined && p.age <= behind;
        const tall = 150 + (i % 2) * 70;
        return (
          <div key={p.label} style={{ position: "absolute", left: X(p.age), top: y - tall, height: tall }}>
            <div style={{ position: "absolute", left: -1.5, top: 0, width: 3, height: tall, background: late ? palette.alert : "rgba(232,238,242,0.5)" }} />
            <div style={{ position: "absolute", left: -6, top: tall - 6, width: 12, height: 12, borderRadius: 6, background: late ? palette.alert : palette.ink }} />
            <div style={{ position: "absolute", left: 6, top: -4, padding: "6px 14px", whiteSpace: "nowrap", background: late ? "rgba(255,77,109,0.16)" : "rgba(12,16,24,0.92)", border: `1px solid ${late ? palette.alert : palette.faint}`, borderRadius: 6 }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: late ? palette.alert : palette.ink }}>{p.label}</div>
              <div style={{ fontFamily: fonts.mono, fontSize: 15, color: palette.dim }}>{p.who} · {p.age}岁</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Speed lines streaming past (for running scenes).
export const SpeedLines: React.FC<{ frame: number; speed: number; y?: number }> = ({ frame, speed, y = AXIS_Y }) => (
  <>
    {Array.from({ length: 16 }, (_, i) => {
      const w = 120 + random(`sw-${i}`) * 260;
      const x = 1920 - ((frame * speed * (0.6 + random(`sv-${i}`)) + random(`sx-${i}`) * 2200) % 2200);
      return <div key={i} style={{ position: "absolute", left: x, top: y - 380 + random(`sy-${i}`) * 360, width: w, height: 2, background: `linear-gradient(90deg, transparent, rgba(232,238,242,${0.15 + 0.2 * Math.min(1, speed / 30)}))` }} />;
    })}
  </>
);

// The path of his own: from (x0, y0) curving down and away, drawn up to `grow`,
// little lights opening along it.
export const OwnPath: React.FC<{ x0: number; y0: number; grow: number; frame: number }> = ({ x0, y0, grow, frame }) => {
  const d = `M${x0} ${y0} C ${x0 + 160} ${y0 + 40}, ${x0 + 220} ${y0 + 160}, ${x0 + 420} ${y0 + 170} S ${x0 + 760} ${y0 + 120}, ${x0 + 1000} ${y0 + 200}`;
  const lights = Array.from({ length: 12 }, (_, i) => i / 12);
  // approximate points along the curve for the lights
  const pt = (t: number) => {
    const bez = (p0: number, p1: number, p2: number, p3: number, u: number) => (1 - u) ** 3 * p0 + 3 * (1 - u) ** 2 * u * p1 + 3 * (1 - u) * u * u * p2 + u ** 3 * p3;
    if (t < 0.5) {
      const u = t / 0.5;
      return { x: bez(x0, x0 + 160, x0 + 220, x0 + 420, u), y: bez(y0, y0 + 40, y0 + 160, y0 + 170, u) };
    }
    const u = (t - 0.5) / 0.5;
    return { x: bez(x0 + 420, x0 + 620, x0 + 760, x0 + 1000, u), y: bez(y0 + 170, y0 + 180, y0 + 120, y0 + 200, u) };
  };
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <path d={d} fill="none" stroke={`rgba(${palette.halo},0.25)`} strokeWidth={26} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - grow} />
      <path d={d} fill="none" stroke={`rgb(${palette.halo})`} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - grow} />
      {lights.map((t, i) => {
        if (t > grow) return null;
        const p = pt(t);
        const on = Math.min(1, (grow - t) * 8);
        return (
          <g key={i} transform={`translate(${p.x} ${p.y})`} opacity={on}>
            <circle r={6 + 3 * Math.sin(frame / 10 + i)} fill={i % 3 === 0 ? palette.accent : `rgb(${palette.halo})`} opacity={0.9} />
            <path d="M0 -8 Q -10 -24 0 -34 Q 10 -24 0 -8" fill={`rgba(${palette.accentRgb},0.7)`} transform={`scale(${on})`} />
          </g>
        );
      })}
    </svg>
  );
};
