import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam, Shards } from "../immersive";
import { GLASS, GlassHeart, STING } from "../parts";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const P = { x: 960, b: 720, h: 320 };
const HEART = { x: P.x, y: P.b - 145 * (P.h / 260) };

// 0 · the joke goes past him as sound — rings of it, 开个玩笑嘛～ — heard.
// 1 · then it turns and goes in: the words are cut into the glass heart, and
//     they stay there, glowing. 相信.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const c1 = cues[1];
  const pass = interpolate(frame, [BEAT, 6 * BEAT], [0, 1], clamp);
  const sink = interpolate(frame, [c1 + BEAT, c1 + 2 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t });
  const hitAt = c1 + 2 * BEAT;
  const carved = ramp(frame, hitAt, 10);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.45]} focus={HEART} hits={[hitAt]}>
        <Stander x={P.x} bottom={P.b} height={P.h} lift={frame < hitAt ? 1 : 0.3} glow={0.7} />
        {/* sound, going past */}
        {frame < c1 + BEAT &&
          [0, 1, 2, 3].map((k) => {
            const r = ((frame * 4 + k * 70) % 280) + 20;
            return <div key={k} style={{ position: "absolute", left: 300 - r, top: 380 - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `2px solid rgba(${GLASS},${0.5 * (1 - r / 300)})` }} />;
          })}
        {frame < c1 + BEAT && (
          <div style={{ position: "absolute", left: 300 + 1400 * pass, top: 360, transform: "translate(-50%, -50%)", opacity: ramp(frame, BEAT, 6), padding: "10px 22px", borderRadius: 22, background: "rgba(232,238,242,0.9)", color: "#14181e", fontSize: 32, fontWeight: 800, whiteSpace: "nowrap" }}>开个玩笑嘛～</div>
        )}
        <div style={{ position: "absolute", left: 300, top: 230, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: ramp(frame, 2 * BEAT, 8) * (1 - sink) }}>听见 · HEARD</div>
        {/* … then in */}
        {frame >= c1 + BEAT && frame < hitAt && (
          <div style={{ position: "absolute", left: 1500 + (HEART.x - 1500) * sink, top: 360 + (HEART.y - 360) * sink, transform: `translate(-50%, -50%) scale(${1 - 0.6 * sink})`, padding: "10px 22px", borderRadius: 22, background: "rgba(232,238,242,0.9)", color: "#14181e", fontSize: 32, fontWeight: 800, whiteSpace: "nowrap" }}>开个玩笑嘛～</div>
        )}
        <GlassHeart x={HEART.x} y={HEART.y} size={110} crack={carved * 0.5} pain={carved}>
          {carved > 0 && (
            <foreignObject x={-48} y={-16} width={96} height={40}>
              <div style={{ fontSize: 14, fontWeight: 900, color: STING, textAlign: "center", textShadow: `0 0 6px ${STING}`, opacity: carved, whiteSpace: "nowrap" }}>开个玩笑嘛～</div>
            </foreignObject>
          )}
        </GlassHeart>
        <Shards x={HEART.x} y={HEART.y} frame={frame} at={hitAt} n={16} power={0.6} seed="an" />
        <div style={{ position: "absolute", left: HEART.x + 110, top: HEART.y - 30, padding: "6px 18px", border: `3px solid ${look.key}`, borderRadius: 8, fontSize: 32, fontWeight: 900, color: look.key, opacity: ramp(frame, hitAt + BEAT, 5), transform: `rotate(-6deg) scale(${1.6 - 0.6 * ramp(frame, hitAt + BEAT, 5)})` }}>相信</div>
      </Cam>
      <Bokeh frame={frame} />
      <Sfx name="whoosh" at={BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c1 + BEAT} volume={0.45} />
      <Sfx name="shatter" at={hitAt} volume={0.5} />
      <Sfx name="stamp" at={hitAt + BEAT} volume={0.55} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
