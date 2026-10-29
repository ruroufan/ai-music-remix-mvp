import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { BLOOM, GLOW, GREY, GreyStreet, Holder, Kept } from "../cloche";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Close up, under the glass: the flower glowing, little lights drifting round
// it — 想象里 · 活得很好. Then the camera pulls all the way out: it's a small
// dome in his hands, and all round him the street is grey. He tries to take a
// step — and can't. 步数 0.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const out = interpolate(frame, [4 * BEAT, 6 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const tries = frame > 7 * BEAT ? Math.abs(Math.sin(((frame - 7 * BEAT) / BEAT) * Math.PI)) : 0;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.04]} hits={[6 * BEAT, c1, ...keyHits(lines, cues, duration)]}>
        {out < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: 1 - out, transform: `scale(${1 - 0.7 * out})`, transformOrigin: "986px 700px" }}>
            <Kept x={960} y={860} size={2.2} sway={Math.sin(frame / 20) * 4} glow={1.1} />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              {Array.from({ length: 22 }, (_, i) => {
                const a = random(`m${i}`) * 6.28 + frame / (40 + 20 * random(`ms${i}`));
                const r = 120 + random(`mr${i}`) * 140;
                return <circle key={i} cx={960 + Math.cos(a) * r} cy={480 + Math.sin(a) * r * 0.8} r={2 + 3 * random(`mz${i}`)} fill={`rgba(${i % 2 ? BLOOM : GLOW},0.8)`} />;
              })}
            </svg>
            <div style={{ position: "absolute", left: 120, top: 160, fontFamily: fonts.mono, fontSize: 30, letterSpacing: 10, color: `rgb(${GLOW})` }}>想象里 · 活得很好</div>
          </div>
        )}
        {out > 0 && (
          <div style={{ position: "absolute", inset: 0, opacity: out }}>
            <GreyStreet frame={frame} />
            <div style={{ position: "absolute", inset: 0, transform: `translateY(${-6 * tries}px)` }}>
              <Holder x={900} height={320} />
            </div>
            <div style={{ position: "absolute", left: 1200, top: 160, fontFamily: fonts.mono, fontSize: 30, letterSpacing: 10, color: `rgb(${GREY})` }}>现实 · 寸步难行</div>
            <div style={{ position: "absolute", left: 1200, top: 220, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 4, color: "rgba(232,238,242,0.55)", opacity: interpolate(frame, [7 * BEAT, 7 * BEAT + 8], [0, 1], clamp) }}>
              步数 <span style={{ fontSize: 44, color: "rgb(255,110,110)" }}>0</span>
            </div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={GLOW} opacity={0.5 * (1 - out) + 0.15} />
      <Sfx name="glint" at={4} volume={0.3} />
      <Sfx name="whoosh" at={4 * BEAT} volume={0.4} />
      <Sfx name="boom" at={6 * BEAT} volume={0.3} />
      <Sfx name="step" at={7 * BEAT} volume={0.25} />
      <Sfx name="step" at={8 * BEAT} volume={0.25} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
