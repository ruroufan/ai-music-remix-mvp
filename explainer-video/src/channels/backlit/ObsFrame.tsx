import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig, random } from "remotion";
import { useEpisode, useSceneIndex } from "../../EpisodeContext";
import { fonts, palette } from "./look";

const INSET = 46;

// Camera-viewfinder corner brackets.
const Corners: React.FC = () => {
  const L = 54;
  const c = palette.faint;
  const corner = (style: React.CSSProperties) => (
    <div style={{ position: "absolute", width: L, height: L, borderColor: c, borderStyle: "solid", borderWidth: 0, ...style }} />
  );
  return (
    <>
      {corner({ left: INSET, top: INSET, borderLeftWidth: 2, borderTopWidth: 2 })}
      {corner({ right: INSET, top: INSET, borderRightWidth: 2, borderTopWidth: 2 })}
      {corner({ left: INSET, bottom: INSET, borderLeftWidth: 2, borderBottomWidth: 2 })}
      {corner({ right: INSET, bottom: INSET, borderRightWidth: 2, borderBottomWidth: 2 })}
    </>
  );
};

// The channel mark: a small aperture with light leaking from behind it.
export const ApertureMark: React.FC<{ size?: number }> = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 30 30">
    <defs>
      <radialGradient id="ap-halo">
        <stop offset="0.4" stopColor={`rgb(${palette.halo})`} stopOpacity="0.9" />
        <stop offset="1" stopColor={`rgb(${palette.halo})`} stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="15" cy="15" r="15" fill="url(#ap-halo)" />
    <circle cx="15" cy="15" r="9" fill={palette.bg} stroke={palette.ink} strokeWidth="1.5" />
    {[0, 60, 120, 180, 240, 300].map((a) => (
      <line key={a} x1="15" y1="15" x2={15 + 9 * Math.cos((a * Math.PI) / 180)} y2={15 + 9 * Math.sin((a * Math.PI) / 180)} stroke={palette.ink} strokeWidth="1" opacity="0.6" />
    ))}
    <circle cx="15" cy="15" r="3" fill={palette.accent} />
  </svg>
);

// Floating dust caught in the backlight: slow, parallaxed, a few catching the light.
const Dust: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {Array.from({ length: 34 }, (_, i) => {
      const depth = 0.4 + random(`dz-${i}`) * 0.9;
      const x = (random(`dx-${i}`) * 2100 + frame * 0.35 * depth) % 2100 - 90;
      const y = (random(`dy-${i}`) * 1180 - frame * 0.22 * depth + 1180 * 4) % 1180 - 50 + Math.sin(frame / 40 + i) * 12;
      const r = 1 + depth * 2.2;
      const tw = 0.25 + 0.5 * Math.abs(Math.sin(frame / (20 + i) + i));
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: r * 2, height: r * 2, borderRadius: r, background: `rgba(${palette.halo},${0.5 * tw * depth})`, boxShadow: `0 0 ${6 * depth}px rgba(${palette.halo},${0.4 * tw})`, filter: depth > 1.1 ? "blur(1.5px)" : undefined }} />;
    })}
  </AbsoluteFill>
);

const timecode = (frame: number, fps: number) => {
  const s = Math.floor(frame / fps);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}:${pad(frame % fps)}`;
};

// The motion layer's camera: a slow push-in across the scene, a gentle drift,
// and a punch-in on every downbeat; scenes arrive with a short zoom-blur.
const camera = (frame: number, globalFrame: number, duration: number, bar: number) => {
  const push = 1 + 0.035 * (frame / Math.max(1, duration));
  const ph = (globalFrame % bar) / bar;
  const punch = 0.014 * Math.exp(-ph * 9);
  const arrive = interpolate(frame, [0, 9], [0.06, 0], { extrapolateRight: "clamp" });
  const dx = Math.sin(globalFrame / 97) * 6, dy = Math.cos(globalFrame / 131) * 4;
  return `translate(${dx}px, ${dy}px) scale(${push + punch + arrive})`;
};
const cutBlur = (frame: number) => (frame < 8 ? `blur(${(8 - frame) * 0.9}px) brightness(${1 + (8 - frame) * 0.05})` : undefined);

// A soft diagonal band of light sweeping across the frame every two bars.
const LightSweep: React.FC<{ globalFrame: number; bar: number }> = ({ globalFrame, bar }) => {
  const p = (globalFrame % (2 * bar)) / (2 * bar);
  if (p > 0.45) return null;
  const x = interpolate(p, [0, 0.45], [-40, 130]);
  return <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", background: `linear-gradient(105deg, transparent ${x - 14}%, rgba(${palette.halo},0.07) ${x}%, transparent ${x + 14}%)` }} />;
};

// Shared chrome for every scene of this episode: blue-black stage, scanlines,
// viewfinder, series label, running timecode, channel mark, and a short flash
// on each cut (cuts land on downbeats, so the flash lands on the beat).
export const ObsFrame: React.FC<{ duration: number; children: React.ReactNode; flash?: boolean }> = ({
  duration,
  children,
  flash = true,
}) => {
  const frame = useCurrentFrame();
  const sceneIndex = useSceneIndex();
  const { timeline, brand, look } = useEpisode();
  const { fps } = useVideoConfig();
  const fade = interpolate(frame, [0, 6, duration - 8, duration], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flashA = flash ? interpolate(frame, [0, 5], [0.22, 0], { extrapolateRight: "clamp" }) : 0;
  const globalFrame = timeline.sceneOffsets[sceneIndex] + frame;
  const recOn = Math.floor(globalFrame / timeline.BEAT) % 2 === 0; // blinks on the beat

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, ${palette.bgLift}, ${palette.bg} 70%)`, fontFamily: fonts.sans, color: palette.ink }}>
      {look.fx ? (
        <AbsoluteFill style={{ opacity: fade, transform: camera(frame, globalFrame, duration, timeline.BAR), filter: cutBlur(frame) }}>{children}</AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ opacity: fade }}>{children}</AbsoluteFill>
      )}
      {look.fx && <Dust frame={globalFrame} />}
      {look.fx && <LightSweep globalFrame={globalFrame} bar={timeline.BAR} />}
      {/* scanlines + vignette */}
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 4px)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.7) 100%)" }} />
      <AbsoluteFill style={{ background: `rgba(${palette.accentRgb},1)`, opacity: flashA, mixBlendMode: "screen" }} />

      <Corners />
      <div style={{ position: "absolute", left: INSET + 26, top: INSET + 18, fontFamily: fonts.mono, fontSize: 18, letterSpacing: 3, color: palette.dim, display: "flex", gap: 14, alignItems: "center" }}>
        <span style={{ width: 10, height: 10, borderRadius: 5, background: palette.alert, opacity: recOn ? 1 : 0.25 }} />
        <span>{brand.series}</span>
        <span style={{ color: palette.ink, fontFamily: fonts.sans, fontWeight: 700, letterSpacing: 6, fontSize: 22 }}>{brand.topic}</span>
        <span>· {brand.topicLatin}</span>
      </div>
      <div style={{ position: "absolute", right: INSET + 26, top: INSET + 18, fontFamily: fonts.mono, fontSize: 18, letterSpacing: 2, color: palette.dim }}>
        {timecode(globalFrame, fps)}
      </div>
      <div style={{ position: "absolute", right: INSET + 26, bottom: INSET + 16, display: "flex", alignItems: "center", gap: 12 }}>
        <ApertureMark size={30} />
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 6 }}>{brand.channel}</div>
          <div style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 3, color: palette.dim }}>{brand.channelLatin}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
