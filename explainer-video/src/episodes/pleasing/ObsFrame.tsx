import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig } from "remotion";
import { useSceneIndex } from "../../EpisodeContext";
import { brand } from "./episode";
import { fonts, palette } from "./look";
import { timeline } from "./timing";

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

const timecode = (frame: number, fps: number) => {
  const s = Math.floor(frame / fps);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}:${pad(frame % fps)}`;
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
  const { fps } = useVideoConfig();
  const fade = interpolate(frame, [0, 6, duration - 8, duration], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flashA = flash ? interpolate(frame, [0, 5], [0.22, 0], { extrapolateRight: "clamp" }) : 0;
  const globalFrame = timeline.sceneOffsets[sceneIndex] + frame;
  const recOn = Math.floor(globalFrame / timeline.BEAT) % 2 === 0; // blinks on the beat

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, ${palette.bgLift}, ${palette.bg} 70%)`, fontFamily: fonts.sans, color: palette.ink }}>
      <AbsoluteFill style={{ opacity: fade }}>{children}</AbsoluteFill>
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
