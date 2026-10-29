import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam, Shards } from "../../glass/immersive";
import { COOL, LAMP } from "../lantern";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const flashAt = (frame: number, at: number) => (frame >= at ? Math.exp(-(frame - at) / 4) : 0);

// 不 · 被 drop in, lit by the lamp. 懂 stands in an open doorway, glowing —
// and on the beat the door slams shut over it. The frame shakes; only a
// sliver of light round the door's edge is left.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const [a, b, c] = [...brand.topic];
  const drop = (at: number) => interpolate(frame, [at, at + 8], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const hit = 2 * BEAT;
  const shut = interpolate(frame, [hit - 6, hit], [0, 1], { ...clamp, easing: (t) => t * t });
  const shake = frame >= hit ? Math.exp(-(frame - hit) / 6) * Math.sin(frame * 2.3) * 14 : 0;
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.06, 1]} hits={[hit]}>
        <div style={{ transform: `translateX(${shake}px)`, position: "absolute", inset: 0 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 220, textAlign: "center", fontFamily: fonts.mono, fontSize: 30, letterSpacing: 12, color: `rgb(${LAMP})`, opacity: drop(0) }}>INFJ · 提倡者</div>
          {[a, b].map((ch, i) => (
            <div key={i} style={{ position: "absolute", left: 360 + i * 300, top: 330 - (1 - drop(i * 6)) * 60, width: 280, textAlign: "center", fontSize: 240, fontWeight: 900, lineHeight: 1, color: `rgb(${LAMP})`, opacity: drop(i * 6), textShadow: `0 0 40px rgba(${LAMP},0.6)` }}>{ch}</div>
          ))}
          {/* the doorway with 懂 in it */}
          <div style={{ position: "absolute", left: 1000, top: 290, width: 340, height: 340, background: `radial-gradient(circle, rgba(${LAMP},0.55), rgba(${LAMP},0.1))`, border: `4px solid rgba(${COOL},0.5)` }} />
          <div style={{ position: "absolute", left: 1030, top: 330, width: 280, textAlign: "center", fontSize: 240, fontWeight: 900, lineHeight: 1, color: "#fff4dc", textShadow: `0 0 40px rgba(${LAMP},0.9)`, opacity: drop(12) }}>{c}</div>
          <div style={{ position: "absolute", left: 1000, top: 290, width: 340, height: 340, perspective: 900 }}>
            <div style={{ position: "absolute", inset: 0, background: "#161a21", border: `3px solid rgba(${COOL},0.55)`, transformOrigin: "0 50%", transform: `rotateY(${-85 * (1 - shut)}deg)`, boxShadow: shut >= 1 ? `0 0 30px rgba(${LAMP},0.35)` : undefined }}>
              <div style={{ position: "absolute", right: 24, top: 160, width: 16, height: 16, borderRadius: 8, background: `rgba(${LAMP},0.7)` }} />
            </div>
          </div>
          <Shards x={1170} y={460} frame={frame} at={hit} n={18} power={0.8} seed="infj-t" />
          <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>{brand.series} · {brand.topicLatin}</div>
        </div>
      </Cam>
      <Bokeh frame={frame} rgb={LAMP} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(circle at 60% 45%, rgba(255,236,190,${0.5 * flashAt(frame, hit)}), transparent 70%)` }} />
      <Sfx name="glint" at={0} volume={0.3} />
      <Sfx name="whoosh" at={hit - 8} volume={0.4} />
      <Sfx name="boom" at={hit} volume={0.7} />
      <Sfx name="stamp" at={hit} volume={0.5} />
    </ObsFrame>
  );
};
