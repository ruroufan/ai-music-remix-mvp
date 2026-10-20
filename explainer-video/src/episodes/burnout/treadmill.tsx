import React from "react";
import { fonts, palette } from "../../channels/backlit/look";
import { Walker } from "../nostalgia/road";

// 《倦怠》's image: a man running on a treadmill whose console reads 你可以,
// the speed creeping up and up; in his own hand a whip, cracking down on his
// own back. At the end he presses STOP and the belt runs down.

export const FLOOR = 740;
export const SCREEN = "120, 230, 255";

// distance covered by frame `f` when the speed (0 → 1) is `speedAt(frame)`
export const travelled = (f: number, speedAt: (frame: number) => number, rate = 1) => {
  let d = 0;
  for (let i = 0; i < f; i++) d += rate * speedAt(i);
  return d;
};

export const Treadmill: React.FC<{
  cx: number;
  frame: number;
  speedAt: (frame: number) => number; // 0 → 1
  text?: string; // what the console says
  kmh?: number;
  stopGlow?: number;
  press?: number; // 0 → 1 a finger on STOP
  run?: boolean; // draw the runner
  lash?: number; // 0 → 1 through one stroke of the whip (−1: no whip)
  lift?: number; // how upright he runs (0 hunched)
  ghost?: number;
}> = ({ cx, frame, speedAt, text = "你可以", kmh, stopGlow = 0, press = 0, run = true, lash = -1, lift = 1, ghost = 0 }) => {
  const sp = speedAt(frame);
  const belt = travelled(frame, speedAt, 22);
  const stride = travelled(frame, (f) => 0.08 + 0.42 * speedAt(f)) ;
  const rx = cx - 60;
  const h = 300;
  const shoulder = { x: rx - 4, y: FLOOR - 34 - h * 0.7 };
  // the whip arm: raised behind the head, then down over the shoulder
  const a = lash < 0 ? 0 : lash < 0.6 ? lash / 0.6 : 1 - (lash - 0.6) / 0.4;
  const hand = { x: shoulder.x - 30 + 80 * a, y: shoulder.y - 110 + 70 * a };
  const crack = lash >= 0.55 && lash < 0.75;
  const tail = crack ? { x: rx - 46, y: FLOOR - 34 - h * 0.55 } : { x: hand.x - 160 + 60 * a, y: hand.y - 40 + 120 * a };
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* deck and belt */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <rect x={cx - 330} y={FLOOR - 34} width={560} height={34} rx={14} fill="#141a24" stroke={`rgba(${palette.accentRgb},0.5)`} strokeWidth={2} />
        {Array.from({ length: 16 }, (_, i) => {
          const x = cx - 320 + ((((i * 36 - belt) % 576) + 576) % 576);
          return x < cx + 220 ? <line key={i} x1={x} y1={FLOOR - 30} x2={x + 16} y2={FLOOR - 30} stroke="rgba(232,238,242,0.35)" strokeWidth={3} /> : null;
        })}
        <circle cx={cx - 316} cy={FLOOR - 17} r={12} fill="#0a0d12" stroke={palette.faint} strokeWidth={2} />
        <circle cx={cx + 216} cy={FLOOR - 17} r={12} fill="#0a0d12" stroke={palette.faint} strokeWidth={2} />
        {/* the post, the rail */}
        <path d={`M${cx + 190} ${FLOOR - 34} L${cx + 250} ${FLOOR - 340}`} stroke="#2a3242" strokeWidth={16} strokeLinecap="round" />
        <path d={`M${cx + 236} ${FLOOR - 250} L${cx - 20} ${FLOOR - 230}`} stroke="#2a3242" strokeWidth={8} strokeLinecap="round" />
        {/* speed lines off the belt */}
        {sp > 0.4 && Array.from({ length: 6 }, (_, i) => <line key={i} x1={cx - 340 - i * 40} y1={FLOOR - 40 - i * 7} x2={cx - 340 - i * 40 - 80 * sp} y2={FLOOR - 40 - i * 7} stroke="rgba(232,238,242,0.3)" strokeWidth={2} />)}
      </svg>
      {/* the console */}
      <div style={{ position: "absolute", left: cx + 140, top: FLOOR - 470, width: 260, height: 150, borderRadius: 14, background: "#0a0e14", border: `2px solid rgba(${SCREEN},0.6)`, boxShadow: `0 0 ${20 + 40 * sp}px rgba(${SCREEN},${0.2 + 0.3 * sp})`, transform: "rotate(-8deg)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 16, textAlign: "center", fontSize: 48, fontWeight: 900, color: `rgb(${SCREEN})`, textShadow: `0 0 14px rgba(${SCREEN},0.8)` }}>{text}</div>
        <div style={{ position: "absolute", left: 18, bottom: 14, fontFamily: fonts.mono, fontSize: 24, color: palette.ink }}>{(kmh ?? 6 + 14 * sp).toFixed(1)} <span style={{ fontSize: 14, color: palette.dim }}>km/h</span></div>
        <div style={{ position: "absolute", right: 16, bottom: 12, width: 54, height: 34, borderRadius: 8, background: `rgba(255,77,109,${0.5 + 0.5 * stopGlow})`, boxShadow: stopGlow > 0.05 ? `0 0 ${24 * stopGlow}px rgba(255,77,109,0.9)` : undefined, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.mono, fontSize: 13, fontWeight: 700, color: "#fff", transform: `scale(${1 - 0.15 * press})` }}>STOP</div>
      </div>
      {run && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - ghost * 0.7 }}>
          <Walker x={rx} bottom={FLOOR - 34} height={h} face="right" walk={stride * 1.2} lean={-(6 + 12 * sp) * (2 - lift) * 0.5} glow={0.8} />
          {lash >= 0 && (
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              <line x1={shoulder.x} y1={shoulder.y} x2={hand.x} y2={hand.y} stroke="#030405" strokeWidth={13} strokeLinecap="round" />
              <line x1={shoulder.x} y1={shoulder.y} x2={hand.x} y2={hand.y} stroke={`rgba(${palette.halo},0.7)`} strokeWidth={1.5} strokeLinecap="round" />
              <path d={`M${hand.x} ${hand.y} Q${(hand.x + tail.x) / 2 - 30} ${Math.min(hand.y, tail.y) - 70 * (1 - a)} ${tail.x} ${tail.y}`} fill="none" stroke="#c9b48a" strokeWidth={4} strokeLinecap="round" />
              {crack && <circle cx={tail.x} cy={tail.y} r={30} fill="none" stroke={palette.alert} strokeWidth={4} opacity={0.9} style={{ filter: `drop-shadow(0 0 10px ${palette.alert})` }} />}
            </svg>
          )}
          {crack && <div style={{ position: "absolute", left: tail.x - 120, top: tail.y - 60, fontSize: 40, fontWeight: 900, color: palette.alert, textShadow: `0 0 12px ${palette.alert}` }}>啪</div>}
        </div>
      )}
    </div>
  );
};
