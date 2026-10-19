import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam } from "../immersive";
import { Emperor, WordArrow } from "../parts";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const WORDS = ["叛徒", "无能", "暴君", "昏君", "骗子", "软弱", "失败者", "背叛"];
const STOPS = WORDS.map((_, i) => ({ x: 1000 + (i % 4) * 150 + random(`ex-${i}`) * 40, y: 240 + Math.floor(i / 4) * 150 + (i % 2) * 60 + random(`ey-${i}`) * 30 }));

// 0 · night, a field tent, the emperor writing by lamplight — and arrows of
//     words flying in at him from the dark, one per half beat, each slowing to
//     a stop in mid-air before it reaches him, trembling there.
// 1 · the camera pushes in on the page.
// 2 · on the page, in his hand: 别人的话，只是别人的话。 As the line is
//     finished, the arrows fall.
export const EmperorScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2] = cues;
  const page = ramp(frame, c2 - 6, 12);
  const text = ["别人的话，", "只是别人的话。"];
  const chars = text.join("").length;
  const written = interpolate(frame, [c2 + 4, c2 + 4 * BEAT], [0, chars], clamp);
  const fallAt = c2 + 4 * BEAT + 4;
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.5]} focus={{ x: 700, y: 520 }}>
        <Halo x={620} y={420} r={420} intensity={0.7} />
        {/* the lamp */}
        <div style={{ position: "absolute", left: 830, top: 440, width: 24, height: 34, borderRadius: 8, background: "#ffd79a", boxShadow: "0 0 50px 20px rgba(255,190,110,0.45)", opacity: 0.9 + 0.1 * Math.sin(frame / 3) }} />
        <Emperor x={600} floor={760} scale={1.4} write={frame / 30} />
        {WORDS.map((w, i) => {
          const at = 2 + i * HALF_BEAT;
          const k = interpolate(frame, [at, at + 22], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 4) });
          if (k <= 0) return null;
          const s = STOPS[i];
          const x = 2000 + (s.x - 2000) * k;
          const y = s.y - 120 + 120 * k;
          const shiver = k >= 1 ? Math.sin(frame * 3 + i) * 2 : 0;
          const fall = interpolate(frame, [fallAt + i * 2, fallAt + i * 2 + 24], [0, 1], { ...clamp, easing: (t) => t * t });
          return <WordArrow key={w} x={x + shiver} y={y + fall * (780 - y)} angle={180 + fall * (60 + i * 10)} text={w} size={30} opacity={1 - fall * 0.6} />;
        })}
      </Cam>
      {page > 0 && (
        <div style={{ position: "absolute", left: 960 - 420, top: 170, width: 840, height: 520, opacity: page, transform: `rotate(-2deg) scale(${0.9 + 0.1 * page})`, background: "linear-gradient(160deg, #efe4c8, #d9c9a2)", boxShadow: "0 30px 60px rgba(0,0,0,0.6)", borderRadius: 6 }}>
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} style={{ position: "absolute", left: 50, right: 50, top: 70 + i * 50, height: 1, background: "rgba(90,70,40,0.25)" }} />
          ))}
          <div style={{ position: "absolute", left: 60, top: 26, fontFamily: fonts.mono, fontSize: 18, letterSpacing: 6, color: "rgba(90,70,40,0.6)" }}>ΤΑ ΕΙΣ ΕΑΥΤΟΝ · 致自己</div>
          {(() => {
            let n = 0;
            return text.map((row, r) => (
              <div key={r} style={{ position: "absolute", left: 80, top: 130 + r * 150, fontSize: 92, fontWeight: 900, letterSpacing: 6, color: "#2a1a0a" }}>
                {[...row].map((ch, j) => {
                  const p = Math.max(0, Math.min(1, written - n++));
                  return <span key={j} style={{ opacity: p, display: "inline-block", transform: `translateY(${(1 - p) * 8}px)`, textShadow: p > 0 && p < 1 ? `0 0 18px ${look.keyGlow}` : undefined }}>{ch}</span>;
                })}
              </div>
            ));
          })()}
        </div>
      )}
      <Bokeh frame={frame} n={7} opacity={0.8} />
      {WORDS.map((_, i) => (
        <Sfx key={i} name="whoosh" at={2 + i * HALF_BEAT} volume={0.18} />
      ))}
      <Sfx name="stamp" at={c1} volume={0.3} />
      {Array.from({ length: 6 }, (_, k) => (
        <Sfx key={k} name="step" at={c2 + 4 + k * HALF_BEAT} volume={0.15} />
      ))}
      <Sfx name="shatter" at={fallAt} volume={0.4} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
