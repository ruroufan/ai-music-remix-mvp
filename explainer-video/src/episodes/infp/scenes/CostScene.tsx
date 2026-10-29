import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { GLOW, GREY, Kept } from "../cloche";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// 0 · a museum case: the dome on a plinth behind a velvet rope, a little
//     plaque — 理想 · 保存完好 — and under it, stamped: 从未实现. Dust
//     settles on the glass, the years tick by.
// 1 · the flower inside goes thin, then dotted, an outline of a flower — the
//     glass still spotless: 一场梦.
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const plaque = ramp(frame, BEAT, 8);
  const never = ramp(frame, 4 * BEAT, 5);
  const years = Math.floor(interpolate(frame, [0, c1], [1, 30], clamp));
  const fade = interpolate(frame, [c1 + BEAT, c1 + 5 * BEAT], [0, 1], clamp);
  const dream = ramp(frame, c1 + 5 * BEAT, 10);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} focus={{ x: 960, y: 560 }} hits={[4 * BEAT, c1 + 5 * BEAT, ...keyHits(lines, cues, duration)]}>
        {/* plinth and rope */}
        <div style={{ position: "absolute", left: 760, top: 720, width: 400, height: 240, background: "#1b1c20", border: `2px solid rgba(${GREY},0.4)` }} />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <path d="M520 760 Q740 840 960 800 Q1180 840 1400 760" fill="none" stroke="rgb(150,40,50)" strokeWidth={8} />
          {[520, 1400].map((x) => (
            <rect key={x} x={x - 8} y={740} width={16} height={220} fill="#8a7a5a" />
          ))}
        </svg>
        <Kept x={960} y={720} size={1.6} glow={0.9 - 0.6 * fade} fade={fade} dust={frame < c1 ? interpolate(frame, [0, c1], [0, 0.9], clamp) : 0.9} />
        <div style={{ position: "absolute", left: 820, top: 800, width: 280, padding: "10px 0", textAlign: "center", background: "#c9b88a", color: "#1a1712", opacity: plaque }}>
          <div style={{ fontSize: 30, fontWeight: 900 }}>理想</div>
          <div style={{ fontSize: 18 }}>保存完好</div>
        </div>
        <div style={{ position: "absolute", left: 1180, top: 560, padding: "10px 22px", border: "4px solid rgb(255,110,110)", borderRadius: 8, fontSize: 44, fontWeight: 900, color: "rgb(255,110,110)", opacity: never, transform: `rotate(-10deg) scale(${1.6 - 0.6 * never})` }}>从未实现</div>
        <div style={{ position: "absolute", left: 200, top: 180, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 4, color: palette.dim, opacity: frame < c1 ? 1 : 0 }}>
          保存 <span style={{ fontSize: 42, color: palette.ink }}>{years}</span> 年
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", fontSize: 64, fontWeight: 900, letterSpacing: 16, color: `rgba(${GLOW},0.85)`, opacity: dream, textShadow: `0 0 20px rgba(${GLOW},0.6)` }}>一场梦</div>
      </Cam>
      <Bokeh frame={frame} rgb={GLOW} opacity={0.35} />
      <Sfx name="shutter" at={BEAT} volume={0.2} />
      <Sfx name="stamp" at={4 * BEAT} volume={0.55} />
      <Sfx name="rise" at={c1 + BEAT} volume={0.25} />
      <Sfx name="glint" at={c1 + 5 * BEAT} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
