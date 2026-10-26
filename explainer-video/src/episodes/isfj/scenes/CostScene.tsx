import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Holder, Jar, RED, SOFT } from "../jar";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const flashAt = (frame: number, at: number) => (frame >= at ? Math.exp(-(frame - at) / 5) : 0);

// 0 · the jar, full to the lid, cracked all over. Something tiny — 一件小事 —
//     drops one last pebble in… and the jar bursts. Glass and stones fly; a
//     flash; even he flinches: 吓一跳.
// 1 · or the other way: nothing bursts, he just goes grey, slowly; the people
//     round him fade back into the dark: 淡了下来.
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const boom = 6 * BEAT;
  const last = interpolate(frame, [4 * BEAT, boom], [0, 1], { ...clamp, easing: (t) => t * t });
  const shatter = interpolate(frame, [boom, boom + 20], [0, 1], clamp);
  const fade = interpolate(frame, [c1, c1 + 6 * BEAT], [0, 1], clamp);
  const flash = flashAt(frame, boom);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1]} hits={[boom, ...keyHits(lines, cues, duration)]}>
        {frame < c1 ? (
          <div style={{ position: "absolute", inset: 0, transform: frame >= boom ? `translate(${Math.sin(frame * 3) * 16 * Math.exp(-(frame - boom) / 8)}px, 0)` : undefined }}>
            <Jar x={960} y={900} size={2.4} stones={23 + last} crack={0.4 + 0.6 * Math.min(1, frame / (4 * BEAT))} shatter={shatter} />
            <div style={{ position: "absolute", left: 1240, top: 200, padding: "8px 18px", borderRadius: 10, border: "2px dashed rgba(232,238,242,0.5)", fontSize: 28, color: palette.ink, opacity: ramp(frame, 2 * BEAT, 8) * (1 - shatter) }}>一件小事</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 160, textAlign: "center", fontSize: 72, fontWeight: 900, letterSpacing: 14, color: `rgb(${RED})`, textShadow: `0 0 30px rgba(${RED},0.8)`, opacity: ramp(frame, boom, 4) }}>爆 发</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center", fontFamily: fonts.mono, fontSize: 26, letterSpacing: 8, color: palette.dim, opacity: ramp(frame, boom + BEAT, 8) }}>连你自己都吓一跳</div>
          </div>
        ) : (
          <div style={{ position: "absolute", inset: 0 }}>
            {[300, 1620].map((x) => (
              <div key={x} style={{ opacity: 1 - 0.9 * fade }}>
                <Stander x={x} bottom={900} height={360} lift={1} glow={0.4} rgb={SOFT} />
              </div>
            ))}
            <Holder x={960} stones={22} crack={0.8} grey={fade} glow={0.6 * (1 - fade)} />
            <div style={{ position: "absolute", left: 1160, top: 300, fontSize: 52, fontWeight: 900, letterSpacing: 10, color: `rgba(232,238,242,${0.3 + 0.5 * fade})`, opacity: ramp(frame, c1 + 3 * BEAT, 10) }}>淡了下来</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={SOFT} opacity={0.3 * (1 - fade)} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(circle at 50% 60%, rgba(255,200,200,${0.6 * flash}), transparent 65%)` }} />
      <Sfx name="step" at={boom - 2} volume={0.3} />
      <Sfx name="boom" at={boom} volume={0.8} />
      <Sfx name="shatter" at={boom} volume={0.6} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.4} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
