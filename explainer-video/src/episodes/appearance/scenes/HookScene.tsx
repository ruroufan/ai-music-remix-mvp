import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { FILTER, FILTER_RGB, Face, Hearts, MirrorGlass, Phone, Sliders } from "../faces";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const SLIDE = [
  ["磨皮", 0.9],
  ["美白", 0.8],
  ["瘦脸", 0.7],
  ["大眼", 0.6],
] as const;
// the era: a wall of phones, all showing the same polished face
const WALL = Array.from({ length: 15 }, (_, i) => ({ c: i % 5, r: Math.floor(i / 5), at: random(`wall-${i}`) }));

// 0 · a selfie on a phone: the sliders go up one per half beat — 磨皮, 美白,
//     瘦脸, 大眼 — and the face is smoothed, brightened, slimmed. 发布; hearts
//     float up. Then a mirror slides in beside it: the same face, unedited —
//     and it looks down.
// 1 · pull back: the phone is one of a whole wall of phones, every one the
//     same polished face. The mirror is gone.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const v = SLIDE.map((_, i) => SLIDE[i][1] * ease(interpolate(frame, [HALF_BEAT * (i + 1), HALF_BEAT * (i + 1) + 8], [0, 1], clamp)));
  const post = 3 * BEAT;
  const tap = frame >= post && frame < post + 12 ? (frame - post) / 12 : 0;
  const likes = Math.round(interpolate(frame, [post, cues[1]], [0, 128], clamp));
  const mirror = ease(interpolate(frame, [4.5 * BEAT, 5.5 * BEAT], [0, 1], clamp));
  const down = interpolate(frame, [6 * BEAT, 7 * BEAT], [0, 1], clamp);
  // line 1: pull back into the wall
  const back = ease(interpolate(frame, [cues[1], cues[1] + 2 * BEAT], [0, 1], clamp));
  const px = 620 + (960 - 620) * back, py = 450 + (450 - 450) * back;
  const pw = 300 - (300 - 150) * back, ph = 600 - (600 - 300) * back;
  return (
    <ObsFrame duration={duration}>
      {/* the wall of phones */}
      {back > 0 &&
        WALL.map(({ c, r, at }, i) => {
          if (c === 2 && r === 1) return null;
          const on = interpolate(frame, [cues[1] + BEAT + at * 4 * BEAT, cues[1] + BEAT + at * 4 * BEAT + 8], [0, 1], clamp);
          return (
            <Phone key={i} x={960 + (c - 2) * 330} y={450 + (r - 1) * 330} w={150} h={300} glow={0.5} opacity={on * (r === 2 ? 0.35 : 0.6)} time="">
              <Face id={`wall-${i}`} x={65} y={150} size={210} smooth={1} bright={0.9} slim={0.8} eyes={0.7} rim={0} />
            </Phone>
          );
        })}
      <Phone x={px} y={py} w={pw} h={ph}>
        <Face id="hook-p" x={pw / 2 - 10} y={ph * 0.47} size={ph * 0.6} smooth={v[0] / 0.9} bright={v[1] / 0.8} slim={v[2] / 0.7} eyes={v[3] / 0.6} rim={0} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 28 * (pw / 300), display: "flex", justifyContent: "center", opacity: 1 - back }}>
          <div style={{ position: "relative", padding: "10px 46px", borderRadius: 24, background: FILTER, color: "#fff", fontSize: 24, fontWeight: 800, transform: `scale(${tap > 0 ? 1 - 0.12 * Math.sin(tap * Math.PI) : 1})` }}>
            发布
            {tap > 0 && <div style={{ position: "absolute", left: "50%", top: "50%", width: 40 + tap * 160, height: 40 + tap * 160, transform: "translate(-50%, -50%)", borderRadius: "50%", border: `2px solid rgba(${FILTER_RGB},${1 - tap})` }} />}
          </div>
        </div>
      </Phone>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - back }}>
        <Sliders x={250} y={300} w={230} values={SLIDE.map(([l], i) => [l, v[i]])} />
        <Hearts x={700} y={560} frame={frame} start={post} n={24} every={3} life={36} spread={160} />
        <div style={{ position: "absolute", left: 250, top: 520, fontFamily: fonts.mono, fontSize: 30, color: FILTER, opacity: likes > 0 ? 1 : 0, textShadow: `0 0 12px rgba(${FILTER_RGB},0.7)` }}>♥ {likes}</div>
        {mirror > 0 && (
          <div style={{ position: "absolute", inset: 0, opacity: mirror, transform: `translateX(${(1 - mirror) * 120}px)` }}>
            <MirrorGlass x={1310} y={450} w={380} h={520} light={0.5}>
              <Face id="hook-m" x={190} y={270} size={430} gaze={down} smile={-0.25 * down} rim={0.4} />
            </MirrorGlass>
            <div style={{ position: "absolute", left: 1310 - 150, width: 300, top: 128, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 6, color: palette.dim }}>MIRROR · 镜子</div>
          </div>
        )}
      </div>
      {SLIDE.map((_, i) => (
        <Sfx key={i} name="shutter" at={HALF_BEAT * (i + 1)} volume={0.22} />
      ))}
      <Sfx name="glint" at={post} volume={0.4} />
      <Sfx name="whoosh" at={4.5 * BEAT} volume={0.3} />
      <Sfx name="glitch" at={6 * BEAT} volume={0.25} />
      <Sfx name="whoosh" at={cues[1]} volume={0.35} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
