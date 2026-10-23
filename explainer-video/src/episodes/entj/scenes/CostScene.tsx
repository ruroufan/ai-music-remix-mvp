import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { CROWD_X, Crowd, FLOOR, GOLD, Leader, Spot, Stage, stageTop } from "../podium";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// 0 · the stage grows taller, his light brighter — and the row shrinks back
//     from it: 越小心.
// 1 · the true words: a stack of speech marks above the row, emptying —
//     真话 7 → 0.
// 2 · all of them nodding, heads down, every eye-line on the floor; nobody's
//     looking at him: 看着你的人 0.
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const grow = interpolate(frame, [0, c1], [0.8, 1.35], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) });
  const back = interpolate(frame, [0, c1], [0, 1], clamp);
  const truths = Math.round(interpolate(frame, [c1, c2 - BEAT], [7, 0], clamp));
  const eyes = interpolate(frame, [c2, c2 + BEAT], [0, 1], clamp);
  const top = stageTop(grow);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1.04, 1]} focus={{ x: 960, y: 420 }} hits={keyHits(lines, cues, duration)}>
        <Spot x={960} y={top} k={0.8 + 0.2 * grow} />
        <Stage rise={grow} />
        <Crowd frame={frame} nod={frame >= c2 ? 1 : 0.3} at={(i) => CROWD_X[i] + (CROWD_X[i] < 960 ? -1 : 1) * 70 * back} height={250 - 30 * back} />
        <Leader x={960} bottom={top} height={290 + 30 * (grow - 0.8)} halo={0.4 + 0.3 * grow} />
        {/* speech marks over the crowd, going out */}
        {frame >= c1 && frame < c2 + BEAT &&
          Array.from({ length: 7 }, (_, i) => (
            <div key={i} style={{ position: "absolute", left: [190, 330, 470, 1450, 1590, 1730, 600][i] - 30, top: 420, fontSize: 52, fontWeight: 900, color: i < truths ? palette.ink : "rgba(232,238,242,0.12)" }}>“ ”</div>
          ))}
        {/* eye-lines: down to the floor */}
        {eyes > 0 && (
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: eyes }}>
            {CROWD_X.map((x, i) => {
              const d = x < 960 ? 1 : -1;
              return <line key={i} x1={x + d * 60} y1={FLOOR - 170} x2={x + d * 120} y2={FLOOR - 4} stroke="rgba(232,238,242,0.4)" strokeWidth={2} strokeDasharray="6 6" />;
            })}
          </svg>
        )}
        <div style={{ position: "absolute", left: 1230, top: 150, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 4, color: palette.dim, lineHeight: 1.9 }}>
          <div style={{ opacity: frame >= c1 ? 1 : 0 }}>
            真话 <span style={{ color: truths ? palette.ink : palette.alert, fontSize: 40 }}>{truths}</span>
          </div>
          <div style={{ opacity: eyes }}>
            看着你的人 <span style={{ color: palette.alert, fontSize: 40 }}>0</span>
          </div>
        </div>
        <div style={{ position: "absolute", left: 260, top: 160, fontSize: 34, fontWeight: 900, color: `rgb(${GOLD})`, opacity: frame < c1 ? 1 : 0 }}>越强 ↑ · 越小心 ↑</div>
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} opacity={0.5} />
      <Sfx name="rise" at={0} volume={0.25} />
      {Array.from({ length: 7 }, (_, i) => (
        <Sfx key={i} name="shutter" at={c1 + Math.round(((c2 - BEAT - c1) * i) / 7)} volume={0.1} />
      ))}
      <Sfx name="boom" at={c2} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
