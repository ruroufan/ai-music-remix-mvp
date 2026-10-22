import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Seated } from "../../friction/tangle";
import { Walker } from "../../nostalgia/road";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { FLOOR, GREEN, GREY, HEAD, Reasoning, SEAT, Study } from "../study";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// 0 · the study: the reasoning denser and denser — 精密度 climbing to 99.9% —
//     while everything else, him included, drains to grey: 生活的颜色 → 0.
// 1 · split: out on the right, three people trying — tripping, falling,
//     getting up — taller each time (试错 ×N); on the left he hasn't moved,
//     推演中….
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const drain = interpolate(frame, [0, c1], [0, 1], clamp);
  const prec = interpolate(frame, [0, c1], [87.2, 99.9], clamp);
  const split = interpolate(frame, [c1, c1 + 10], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const tries = Math.max(0, Math.floor((frame - c1) / BEAT));
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} hits={[c1, ...keyHits(lines, cues, duration)]}>
        <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${50 * split}% 0 0)` }}>
          <div style={{ position: "absolute", inset: 0, transform: `translateX(${-300 * split}px)` }}>
            <div style={{ position: "absolute", inset: 0, filter: `grayscale(${drain}) brightness(${1 - 0.3 * drain})` }}>
              <Study frame={frame} />
              <Seated x={SEAT} floor={FLOOR} scale={1.25} glow={0.5 * (1 - drain) + 0.1} slump={0.4} />
            </div>
            <Reasoning frame={frame} ox={HEAD.x} oy={HEAD.y - 20} grow={1} seed="rs" />
            <Reasoning frame={frame} ox={HEAD.x + 20} oy={HEAD.y - 10} grow={drain} seed="c2" />
            <Reasoning frame={frame} ox={HEAD.x - 20} oy={HEAD.y - 30} grow={drain * 0.9} seed="c3" />
            {split > 0.5 && <div style={{ position: "absolute", left: HEAD.x - 120, top: 140, fontFamily: fonts.mono, fontSize: 24, letterSpacing: 6, color: palette.dim }}>推演中…</div>}
          </div>
        </div>
        {split > 0 && (
          <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 0 ${100 - 50 * split}%)` }}>
            <div style={{ position: "absolute", left: 960, top: 0, width: 960, height: 1080, background: `linear-gradient(rgba(${GREEN},0.08), rgba(${GREEN},0.02))` }} />
            {[0, 1, 2].map((i) => {
              const ph = ((frame - c1 + i * 20) % (2 * BEAT)) / (2 * BEAT);
              const fall = ph > 0.55 && ph < 0.8 ? Math.sin(((ph - 0.55) / 0.25) * Math.PI) : 0;
              const grow = 1 + 0.06 * tries;
              return (
                <div key={i} style={{ position: "absolute", inset: 0, transformOrigin: `${1160 + i * 220}px ${FLOOR}px`, transform: `rotate(${fall * 50}deg)` }}>
                  <Walker x={1160 + i * 220} bottom={FLOOR} height={200 * grow} face="right" walk={frame * 0.25 + i} glow={0.8} rgb={GREEN} />
                </div>
              );
            })}
            <div style={{ position: "absolute", left: 1100, top: 200, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 4, color: `rgb(${GREEN})` }}>试错 ×{tries} · 长高中</div>
            <div style={{ position: "absolute", left: 958, top: 0, width: 4, height: 1080, background: "rgba(232,238,242,0.4)" }} />
          </div>
        )}
        <div style={{ position: "absolute", left: 1220, top: 280, width: 420, opacity: 1 - split }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, fontWeight: 800 }}>
            <span>理论精密度</span>
            <span style={{ fontFamily: fonts.mono }}>{prec.toFixed(1)}%</span>
          </div>
          <div style={{ marginTop: 8, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.08)" }}>
            <div style={{ width: `${prec}%`, height: "100%", borderRadius: 6, background: `rgb(${GREY})` }} />
          </div>
          <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", fontSize: 28, fontWeight: 800 }}>
            <span>生活的颜色</span>
            <span style={{ fontFamily: fonts.mono, color: palette.alert }}>{Math.round(100 * (1 - drain))}%</span>
          </div>
          <div style={{ marginTop: 8, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.08)" }}>
            <div style={{ width: `${100 * (1 - drain)}%`, height: "100%", borderRadius: 6, background: `rgb(${GREEN})` }} />
          </div>
        </div>
      </Cam>
      <Bokeh frame={frame} rgb="200, 205, 215" opacity={0.5} />
      <Sfx name="whoosh" at={c1} volume={0.45} />
      {[0, 1, 2, 3].map((k) => (
        <Sfx key={k} name="step" at={c1 + BEAT + k * BEAT} volume={0.2} />
      ))}
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
