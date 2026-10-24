import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam, Shards, SpeedLines } from "../immersive";
import { GlassHeart, STING, WordArrow } from "../parts";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const P = { x: 700, b: 700, h: 320 };
const HEART = { x: P.x, y: P.b - 145 * (P.h / 260) };
const FROM = { x: 1520, y: 300 };
const TIP = { x: HEART.x + 28, y: HEART.y - 6 };
const ANG = (Math.atan2(TIP.y - FROM.y, TIP.x - FROM.x) * 180) / Math.PI;

// 0 · a throwaway line floats up — 开个玩笑嘛～ — and becomes an arrow; it
//     streaks in and hits the glass heart in his chest: the camera jolts,
//     glass flies, the heart cracks. DAY 1… DAY 2… DAY 3 — it still hurts,
//     the cracks glowing on every beat.
// 1 · the camera keeps pushing in on the cracked heart.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const fly0 = 1.5 * BEAT, hit = 3 * BEAT;
  const bubble = interpolate(frame, [4, 10, fly0 - 2, fly0 + 2], [0, 1, 1, 0], clamp);
  const k = interpolate(frame, [fly0, hit], [0, 1], { ...clamp, easing: (t) => t * t * t });
  const flying = frame >= fly0 && frame < hit;
  const ax = FROM.x + (TIP.x - FROM.x) * k, ay = FROM.y + (TIP.y - FROM.y) * k;
  const crack = interpolate(frame, [hit, hit + 10], [0, 0.8], clamp);
  const pain = frame >= hit ? 0.35 + 0.65 * Math.exp(-((frame - hit) % BEAT) / 5) : 0;
  const day = Math.max(0, Math.min(3, Math.floor((frame - 4.5 * BEAT) / BEAT) + 1));
  const wob = frame >= hit ? Math.sin((frame - hit) * 1.3) * 6 * Math.exp(-(frame - hit) / 10) : 0;
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.32]} focus={HEART} hits={[hit]}>
        <Stander x={P.x} bottom={P.b} height={P.h} lift={frame < hit ? 1 : 0.4} glow={0.8} />
        <GlassHeart x={HEART.x} y={HEART.y} size={74} crack={crack} pain={pain} />
        {/* the line, before it's an arrow */}
        <div style={{ position: "absolute", left: FROM.x, top: FROM.y, transform: `translate(-50%, -50%) scale(${0.8 + 0.2 * bubble})`, opacity: bubble, padding: "12px 26px", borderRadius: 26, background: "rgba(232,238,242,0.92)", color: "#14181e", fontSize: 36, fontWeight: 800, whiteSpace: "nowrap" }}>开个玩笑嘛～</div>
        <SpeedLines x={ax} y={ay} angle={(ANG * Math.PI) / 180} k={flying ? 0.4 + 0.6 * k : 0} frame={frame} />
        {frame >= fly0 && <WordArrow x={frame < hit ? ax : TIP.x} y={frame < hit ? ay : TIP.y} angle={ANG + wob} text="开个玩笑嘛～" size={34} />}
        <Shards x={HEART.x} y={HEART.y} frame={frame} at={hit} n={26} />
        {/* the days */}
        {day > 0 && (
          <div style={{ position: "absolute", left: 1220, top: 520, fontFamily: fonts.mono, fontWeight: 700, fontSize: 92, color: STING, textShadow: `0 0 26px ${STING}`, opacity: frame < cues[1] ? 1 : interpolate(frame, [cues[1], cues[1] + 10], [1, 0], clamp), transform: `scale(${1 + 0.15 * Math.exp(-((frame - 4.5 * BEAT) % BEAT) / 4)})` }}>
            DAY {day}
          </div>
        )}
        {frame >= hit && <div style={{ position: "absolute", left: 1220, top: 470, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 6, color: palette.dim, opacity: frame < cues[1] ? 1 : 0 }}>STILL HURTS</div>}
      </Cam>
      <Bokeh frame={frame} />
      <Sfx name="glint" at={4} volume={0.3} />
      <Sfx name="whoosh" at={fly0} volume={0.5} />
      <Sfx name="shatter" at={hit} volume={0.7} />
      <Sfx name="boom" at={hit} volume={0.5} />
      {[4.5, 5.5, 6.5].map((b) => (
        <Sfx key={b} name="stamp" at={b * BEAT} volume={0.35} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
