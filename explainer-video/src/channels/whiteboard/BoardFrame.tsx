import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, random } from "remotion";
import { useEpisode, useSceneIndex } from "../../EpisodeContext";
import { ink, hand } from "./look";
import { rr } from "./sketch";

// Faint ghosts of old marker that never quite wiped off.
const GHOSTS = Array.from({ length: 7 }, (_, i) =>
  rr.curve(
    Array.from({ length: 5 }, (_, k) => [80 + random(`gx-${i}`) * 1700 + k * 40, 120 + random(`gy-${i}`) * 820 + Math.sin(k + i) * 30] as [number, number]),
    { seed: 50 + i, rough: 2, width: 10, color: "rgba(60,70,90,0.05)" },
  ),
);
const MARK = rr.circle(0, 0, 34, { seed: 9, rough: 1.5, width: 3, color: ink.black });

// The board every whiteboard scene is drawn on: off-white, a brushed-metal
// frame, faint ghosts of old marker, the episode written top-left and the
// channel's name bottom-right. Each scene slides in like the board was rolled
// along; the view breathes in a little on every downbeat.
export const BoardFrame: React.FC<{ duration: number; children: React.ReactNode }> = ({ duration, children }) => {
  const frame = useCurrentFrame();
  const sceneIndex = useSceneIndex();
  const { timeline, brand } = useEpisode();
  const globalFrame = timeline.sceneOffsets[sceneIndex] + frame;
  const slide = interpolate(frame, [0, 10], [140, 0], { extrapolateRight: "clamp", easing: (t) => 1 - (1 - t) ** 3 });
  const fade = interpolate(frame, [0, 4, duration - 5, duration], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ph = (globalFrame % timeline.BAR) / timeline.BAR;
  const punch = 1 + 0.008 * Math.exp(-ph * 9) + 0.02 * (frame / Math.max(1, duration));
  return (
    <AbsoluteFill style={{ background: "#d7d9dc", fontFamily: hand.font, color: ink.black }}>
      <AbsoluteFill style={{ margin: 18, borderRadius: 10, background: `radial-gradient(ellipse at 50% 40%, #ffffff, ${ink.board} 70%, #ecebe5)`, boxShadow: "inset 0 0 0 3px #b8bcc2, inset 0 0 40px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <svg width={1920} height={1080} style={{ position: "absolute", left: -18, top: -18 }}>
          {GHOSTS.flat().map((s, i) => (
            <path key={i} d={s.d} fill="none" stroke={s.stroke} strokeWidth={s.strokeWidth} strokeLinecap="round" />
          ))}
        </svg>
        <AbsoluteFill style={{ left: -18, top: -18, width: 1920, height: 1080, opacity: fade, transform: `translateX(${slide}px) scale(${punch})` }}>{children}</AbsoluteFill>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 66, top: 46, fontSize: 26, color: ink.grey, display: "flex", gap: 14, alignItems: "baseline" }}>
        <span style={{ width: 12, height: 12, borderRadius: 6, background: ink.red, display: "inline-block", opacity: Math.floor(globalFrame / timeline.BEAT) % 2 ? 0.3 : 1 }} />
        <span>{brand.series}</span>
        <span style={{ color: ink.black, fontSize: 32 }}>{brand.topic}</span>
      </div>
      <div style={{ position: "absolute", right: 70, bottom: 44, display: "flex", alignItems: "center", gap: 14 }}>
        <svg width={40} height={40} viewBox="-20 -20 40 40" style={{ overflow: "visible" }}>
          {MARK.map((s, i) => (
            <path key={i} d={s.d} fill="none" stroke={s.stroke} strokeWidth={s.strokeWidth} />
          ))}
          <circle r={5} fill={ink.red} />
        </svg>
        <span style={{ fontSize: 30 }}>{brand.channel}</span>
      </div>
      {/* the marker tray */}
      <div style={{ position: "absolute", left: 300, right: 300, bottom: 6, height: 12, borderRadius: 4, background: "#b8bcc2" }} />
    </AbsoluteFill>
  );
};
