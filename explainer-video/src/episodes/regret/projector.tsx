import React from "react";
import { random } from "remotion";
import { fonts, palette } from "../../channels/backlit/look";
import { FigureShape } from "../../channels/backlit/figure";
import { Halo } from "../../channels/backlit/parts";

// 《后悔》's central image: a bedroom at night, and a projector that keeps
// throwing the same short clip onto the wall — the moment you said the wrong
// thing — over and over, the copies piling up.

// ---------- the clip ----------

export const LOOP = 60; // frames: one replay = one bar at 120 BPM

// A tiny scene in a 160×90 box: a meeting; you stand and say something; the
// others turn to look; a red ✕. `p` is 0–1 through one replay.
const ClipScene: React.FC<{ p: number }> = ({ p }) => {
  const talk = p > 0.2;
  const turn = p > 0.5;
  const cross = p > 0.72;
  return (
    <g>
      <rect width={160} height={90} fill="#1a2230" />
      <rect x={0} y={60} width={160} height={30} fill="#121823" />
      <rect x={20} y={56} width={120} height={5} fill="#3a4456" />
      {[40, 80, 120].map((x, i) => (
        <g key={x} transform={`translate(${x} 44)`}>
          <circle cx={turn ? (i === 0 ? 3 : -3) : 0} cy={-6} r={6} fill="#0b0f15" stroke="rgba(232,238,242,0.35)" strokeWidth={0.8} />
          <rect x={-8} y={0} width={16} height={12} rx={3} fill="#0b0f15" />
          {turn && <circle cx={i === 0 ? 5 : -5} cy={-7} r={1.2} fill={palette.alert} />}
        </g>
      ))}
      {/* you, standing */}
      <g transform="translate(100 18)">
        <circle cx={0} cy={0} r={6} fill="#030405" stroke={`rgba(${palette.halo},0.9)`} strokeWidth={0.9} />
        <rect x={-7} y={7} width={14} height={26} rx={3} fill="#030405" stroke={`rgba(${palette.halo},0.9)`} strokeWidth={0.9} />
      </g>
      {talk && (
        <g transform="translate(110 4)">
          <rect x={0} y={0} width={42} height={14} rx={4} fill="#e8eef2" />
          <text x={21} y={10} textAnchor="middle" fontSize={8} fill="#1a1714" fontWeight={700}>
            ……
          </text>
          <line x1={4} y1={12} x2={38} y2={12} stroke={palette.alert} strokeWidth={1.4} opacity={turn ? 1 : 0} />
        </g>
      )}
      {cross && (
        <g transform="translate(140 72)" stroke={palette.alert} strokeWidth={3} strokeLinecap="round">
          <line x1={-6} y1={-6} x2={6} y2={6} />
          <line x1={6} y1={-6} x2={-6} y2={6} />
        </g>
      )}
    </g>
  );
};

// A strip of film around the clip, with sprocket holes and flicker.
export const ReplayClip: React.FC<{
  x: number;
  y: number;
  w: number;
  frame: number; // the clip's own clock (frames)
  rot?: number;
  opacity?: number;
  count?: number; // replay counter shown in the corner
  blur?: number;
  tint?: number; // 0 → 1: red wash, for the painful layer
  id?: string;
}> = ({ x, y, w, frame, rot = 0, opacity = 1, count, blur = 0, tint = 0, id = "c" }) => {
  const h = (w * 90) / 160;
  const p = (((frame % LOOP) + LOOP) % LOOP) / LOOP;
  const flicker = 0.85 + random(`fl-${id}-${Math.floor(frame / 2)}`) * 0.15;
  const holes = 9;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `rotate(${rot}deg)`, opacity }}>
      <svg width={w} height={h} viewBox="-8 -10 176 110" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, overflow: "visible", filter: `${blur ? `blur(${blur}px) ` : ""}brightness(${flicker})` }}>
        <rect x={-8} y={-10} width={176} height={110} rx={3} fill="#05070a" />
        {Array.from({ length: holes }, (_, i) => (
          <g key={i}>
            <rect x={-4 + i * 20} y={-7} width={8} height={4} rx={1} fill="#1e2632" />
            <rect x={-4 + i * 20} y={93} width={8} height={4} rx={1} fill="#1e2632" />
          </g>
        ))}
        <ClipScene p={p} />
        {tint > 0 && <rect width={160} height={90} fill={`rgba(255,77,109,${0.35 * tint})`} />}
        {/* progress bar */}
        <rect x={0} y={88} width={160 * p} height={2} fill={`rgba(${palette.halo},0.9)`} />
      </svg>
      {count !== undefined && (
        <div style={{ position: "absolute", left: 8, top: 6, fontFamily: fonts.mono, fontSize: Math.max(10, w * 0.05), letterSpacing: 2, color: palette.alert, textShadow: "0 0 6px rgba(0,0,0,0.9)" }}>
          REPLAY ×{count}
        </div>
      )}
    </div>
  );
};

// ---------- the room ----------

export const ROOM = {
  floor: 880,
  bed: { x: 360, y: 740, w: 760, h: 70 },
  window: { x: 1400, y: 250, w: 260, h: 320 },
  projector: { x: 1250, y: 700 },
  wall: { x: 260, y: 150, w: 980, h: 420 }, // where the copies land
};

const Window: React.FC<{ dawn: number; frame: number }> = ({ dawn, frame }) => {
  const { x, y, w, h } = ROOM.window;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, border: "4px solid #1e2632", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#03050b, #0a1222)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#7fb0e0 0%, #f2c08a 70%, #ffb070 100%)", opacity: dawn }} />
      {Array.from({ length: 14 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: random(`st-${i}`) * w, top: random(`sy-${i}`) * h * 0.7, width: 2, height: 2, borderRadius: 1, background: "#fff", opacity: (1 - dawn) * (0.4 + 0.6 * Math.abs(Math.sin(frame / 20 + i))) }} />
      ))}
      <div style={{ position: "absolute", left: w * 0.6, top: h * 0.2, width: 34, height: 34, borderRadius: "50%", boxShadow: "-8px 4px 0 0 #e8eef2", opacity: 1 - dawn }} />
      <div style={{ position: "absolute", left: w / 2 - 2, top: 0, width: 4, height: h, background: "#1e2632" }} />
      <div style={{ position: "absolute", left: 0, top: h / 2 - 2, width: w, height: 4, background: "#1e2632" }} />
    </div>
  );
};

// A cross-section of the bedroom. `beam` is the projector's light (0 off → 1
// on); `dawn` brings morning into the window and the room.
export const Bedroom: React.FC<{ frame: number; beam?: number; dawn?: number; sitUp?: number; children?: React.ReactNode }> = ({ frame, beam = 1, dawn = 0, sitUp = 0, children }) => {
  const { bed, projector, wall } = ROOM;
  const cx = wall.x + wall.w / 2, cy = wall.y + wall.h / 2;
  // the sleeper lies on the mattress, head on the pillow; pivot = the feet
  const s = 190 / 260;
  const pivot = { x: bed.x + 250, y: bed.y - 22 };
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* walls, floor, morning light */}
      <div style={{ position: "absolute", left: 200, top: 120, width: 1520, height: ROOM.floor - 120, background: "linear-gradient(#0b0f17, #0e131d)", borderTop: `1px solid ${palette.faint}` }} />
      <div style={{ position: "absolute", left: 0, top: ROOM.floor, width: 1920, height: 1080 - ROOM.floor, background: "#080b10", borderTop: `1px solid ${palette.faint}` }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(250deg, rgba(255,190,120,0.28), transparent 55%)", opacity: dawn }} />
      <Window dawn={dawn} frame={frame} />

      {/* the projector's beam onto the wall */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: beam }}>
        <defs>
          <linearGradient id="beam" x1="1" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor={`rgba(${palette.halo},0.55)`} />
            <stop offset="1" stopColor={`rgba(${palette.halo},0.04)`} />
          </linearGradient>
        </defs>
        {/* aimed at the main clip (centre of the wall): the cone's outer rays hit
            its top-right and bottom-left corners */}
        <polygon
          points={`${projector.x - 30},${projector.y - 6} ${cx + 280},${cy - 160} ${cx - 280},${cy - 160} ${cx - 280},${cy + 160}`}
          fill="url(#beam)"
        />
      </svg>
      {children}

      {/* bed, sleeper, nightstand, projector */}
      <div style={{ position: "absolute", left: bed.x, top: bed.y, width: bed.w, height: bed.h, borderRadius: 14, background: "#1a212d", border: `1px solid ${palette.faint}` }} />
      <div style={{ position: "absolute", left: bed.x + 20, top: bed.y - 26, width: 150, height: 34, borderRadius: 18, background: "#2a3242" }} />
      <svg
        width={120 * s}
        height={260 * s}
        viewBox="0 0 120 260"
        style={{
          position: "absolute",
          left: pivot.x - 60 * s,
          top: pivot.y - 260 * s,
          transform: `rotate(${-90 + sitUp * 90}deg)`,
          transformOrigin: "50% 100%",
        }}
      >
        <FigureShape pose="plain" rim={`rgba(${palette.halo},${0.5 + 0.4 * dawn})`} />
      </svg>
      <div style={{ position: "absolute", left: bed.x + 150, top: bed.y - 34, width: bed.w - 170, height: 40, borderRadius: 16, background: "#232b3a", border: `1px solid ${palette.faint}` }} />
      <div style={{ position: "absolute", left: projector.x - 60, top: projector.y + 20, width: 120, height: ROOM.floor - projector.y - 20, background: "#141a24", border: `1px solid ${palette.faint}` }} />
      <div style={{ position: "absolute", left: projector.x - 44, top: projector.y - 22, width: 88, height: 42, borderRadius: 8, background: "#232b3a", border: `1px solid ${palette.faint}` }}>
        <div style={{ position: "absolute", left: 6, top: 9, width: 22, height: 22, borderRadius: 11, background: beam > 0.5 ? `rgb(${palette.halo})` : "#0b0f15", boxShadow: beam > 0.5 ? `0 0 16px rgb(${palette.halo})` : "none" }} />
        <div style={{ position: "absolute", right: 8, top: 6, width: 6, height: 6, borderRadius: 3, background: beam > 0.5 ? palette.alert : "#333" }} />
      </div>
      <Halo x={bed.x + 160} y={bed.y - 60} r={200} intensity={0.25 + dawn * 0.5} />
    </div>
  );
};

// Copies of the clip spreading over the wall. Copy i appears at `startAt + i*every`
// and replays from the moment it appears.
export const Copies: React.FC<{ frame: number; count: number; startAt: number; every: number; spread?: number; opacity?: number; tint?: number }> = ({
  frame,
  count,
  startAt,
  every,
  spread = 1,
  opacity = 1,
  tint = 0,
}) => {
  const { wall } = ROOM;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const t0 = startAt + i * every;
        if (frame < t0) return null;
        const a = Math.min(1, (frame - t0) / 6);
        const cx = wall.x + wall.w / 2 + (random(`cx-${i}`) - 0.5) * wall.w * 1.1 * spread;
        const cy = wall.y + wall.h / 2 + (random(`cy-${i}`) - 0.5) * wall.h * 1.15 * spread;
        const w = 180 + random(`cw-${i}`) * 200;
        return (
          <ReplayClip
            key={i}
            id={`k${i}`}
            x={cx}
            y={cy}
            w={w * (0.8 + a * 0.2)}
            frame={frame - t0}
            rot={(random(`cr-${i}`) - 0.5) * 24}
            opacity={a * opacity * (0.55 + random(`co-${i}`) * 0.4)}
            tint={tint * random(`ct-${i}`)}
          />
        );
      })}
    </>
  );
};

// A standing person (backlit), optionally mirrored to face left.
export const Person: React.FC<{ x: number; bottom: number; height?: number; pose?: "plain" | "proud" | "hunch"; flip?: boolean; glow?: number; opacity?: number }> = ({
  x,
  bottom,
  height = 260,
  pose = "plain",
  flip = false,
  glow = 1,
  opacity = 1,
}) => {
  const s = height / 260;
  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      <Halo x={x} y={bottom - height * 0.62} r={height * 0.95} intensity={glow} />
      <svg width={120 * s} height={height} viewBox="0 0 120 260" style={{ position: "absolute", left: x - 60 * s, top: bottom - height, transform: flip ? "scaleX(-1)" : undefined }}>
        <FigureShape pose={pose} rim={`rgba(${palette.halo},${0.35 + 0.6 * glow})`} />
      </svg>
    </div>
  );
};
