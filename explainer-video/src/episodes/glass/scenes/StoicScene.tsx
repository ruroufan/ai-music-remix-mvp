import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam, Shards, SpeedLines } from "../immersive";
import { GLASS, GlassHeart, STING, WordArrow } from "../parts";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// The screen splits down the middle: 事实 on the left, 判断 on the right.
// 1 · on the left, the sentence, plain: just words, stamped 事实.
// 2 · on the right, in his head: 他看不起我 — forged into an arrowhead, it flies
//     across the line and fixes itself onto the plain sentence: now it's an
//     arrow. 你加的.
// 3 · the arrow drops into a glass heart, and what cuts is the head: 后者.
export const StoicScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2, c3] = cues;
  const line = ramp(frame, 4, 20);
  const fact = ramp(frame, c1, 8);
  const stampF = ramp(frame, c1 + 2 * BEAT, 5);
  const thought = ramp(frame, c2, 8);
  const forge = interpolate(frame, [c2 + 2 * BEAT, c2 + 3 * BEAT], [0, 1], clamp);
  const cross = interpolate(frame, [c2 + 3 * BEAT, c2 + 4.5 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t });
  const armed = frame >= c2 + 4.5 * BEAT;
  const drop = interpolate(frame, [c3 + BEAT, c3 + 2 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * t });
  const hitAt = c3 + 2 * BEAT;
  // the sentence's spot on the left; where it ends up (the heart)
  const S = { x: 560, y: 470 };
  const H = { x: 960, y: 660 };
  const ax = armed ? S.x + 200 + (H.x - 30 - (S.x + 200)) * drop : S.x + 200;
  const ay = armed ? S.y + (H.y - S.y) * drop : S.y;
  const ang = armed && drop > 0 ? (Math.atan2(H.y - S.y, H.x - 30 - (S.x + 200)) * 180) / Math.PI * Math.min(1, drop * 3) : 0;
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.1]} hits={[c2 + 4.5 * BEAT, hitAt]}>
        {/* the dividing line and the two headers */}
        <div style={{ position: "absolute", left: 958, top: 130, width: 4, height: 600 * line, background: `linear-gradient(rgba(${GLASS},0.9), rgba(${GLASS},0.2))`, boxShadow: `0 0 16px rgba(${GLASS},0.8)` }} />
        <div style={{ position: "absolute", left: 220, top: 150, fontSize: 44, fontWeight: 900, color: palette.dim, opacity: line }}>事实 <span style={{ fontFamily: fonts.mono, fontSize: 18, letterSpacing: 5 }}>FACT</span></div>
        <div style={{ position: "absolute", right: 220, top: 150, fontSize: 44, fontWeight: 900, color: look.key, opacity: line, textAlign: "right" }}><span style={{ fontFamily: fonts.mono, fontSize: 18, letterSpacing: 5 }}>JUDGMENT</span> 判断</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 236, textAlign: "center", fontSize: 30, fontWeight: 800, color: palette.ink, opacity: line * (1 - fact) }}>发生的事 ≠ 你怎么看</div>
        {/* in his head (right) */}
        <Stander x={1440} bottom={720} height={280} lift={0.5} glow={0.6} />
        {/* 1 · the plain sentence */}
        {!armed && (
          <div style={{ position: "absolute", left: S.x, top: S.y, transform: `translate(-50%, -50%) scale(${0.8 + 0.2 * fact})`, opacity: fact, padding: "12px 26px", borderRadius: 24, background: "rgba(232,238,242,0.1)", border: "2px solid rgba(232,238,242,0.5)", fontSize: 34, fontWeight: 800, color: palette.ink, whiteSpace: "nowrap" }}>你今天气色不好</div>
        )}
        <div style={{ position: "absolute", left: S.x - 70, top: S.y + 50, width: 140, textAlign: "center", padding: "4px 0", border: `2px solid ${palette.dim}`, borderRadius: 8, fontSize: 24, fontWeight: 900, color: palette.dim, opacity: stampF * (armed ? 0.4 : 1), transform: `rotate(-6deg) scale(${1.6 - 0.6 * stampF})` }}>事实</div>
        {/* 2 · the judgment, forged into a head */}
        {thought > 0 && cross < 1 && (
          <div style={{ position: "absolute", left: 1440 - 520 * cross * 1.1, top: 330 + (S.y - 330) * cross, transform: "translate(-50%, -50%)", opacity: thought }}>
            <div style={{ padding: "10px 22px", borderRadius: 22, border: `2px dashed ${forge > 0.5 ? STING : "rgba(232,238,242,0.5)"}`, background: forge > 0.5 ? "rgba(255,90,114,0.15)" : "rgba(232,238,242,0.08)", fontSize: 32, fontWeight: 900, color: forge > 0.5 ? STING : palette.ink, whiteSpace: "nowrap", transform: `scale(${1 - 0.25 * forge})`, clipPath: forge > 0.5 ? "polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%)" : undefined }}>他看不起我</div>
          </div>
        )}
        <SpeedLines x={1440 - 520 * cross * 1.1} y={330 + (S.y - 330) * cross} angle={Math.atan2(S.y - 330, -572)} k={cross > 0 && cross < 1 ? 0.6 : 0} frame={frame} n={10} />
        {/* the armed arrow */}
        {armed && frame < hitAt + 4 && (
          <>
            <WordArrow x={ax} y={ay} angle={ang} text="你今天气色不好" size={32} />
            <div style={{ position: "absolute", left: ax - 40, top: ay - 70, fontSize: 22, fontWeight: 900, color: STING, opacity: 1 - drop, whiteSpace: "nowrap" }}>+ 他看不起我</div>
            <div style={{ position: "absolute", left: ax + 30, top: ay - 34, fontFamily: fonts.mono, fontSize: 16, color: look.key, opacity: 1 - drop }}>← 你加的</div>
          </>
        )}
        {/* 3 · the heart */}
        {frame >= c3 && <GlassHeart x={H.x} y={H.y} size={100} crack={interpolate(frame, [hitAt, hitAt + 8], [0, 0.8], clamp)} pain={frame >= hitAt ? 0.8 : 0} />}
        <Shards x={H.x} y={H.y} frame={frame} at={hitAt} n={22} seed="st" />
        {frame >= hitAt + 6 && (
          <div style={{ position: "absolute", left: H.x + 90, top: H.y - 30, fontSize: 30, fontWeight: 900, color: look.key, textShadow: `0 0 14px ${look.keyGlow}`, opacity: ramp(frame, hitAt + 6, 8) }}>刺痛你的：判断</div>
        )}
      </Cam>
      <Bokeh frame={frame} />
      <Sfx name="whoosh" at={4} volume={0.3} />
      <Sfx name="glint" at={c1} volume={0.3} />
      <Sfx name="stamp" at={c1 + 2 * BEAT} volume={0.5} />
      <Sfx name="glitch" at={c2} volume={0.3} />
      <Sfx name="stamp" at={c2 + 2 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c2 + 3 * BEAT} volume={0.45} />
      <Sfx name="boom" at={c2 + 4.5 * BEAT} volume={0.45} />
      <Sfx name="whoosh" at={c3 + BEAT} volume={0.4} />
      <Sfx name="shatter" at={hitAt} volume={0.6} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
