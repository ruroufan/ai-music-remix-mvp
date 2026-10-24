import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam } from "../../glass/immersive";
import { FLOOR, FloorLight, HER, HIM, Leaner, Shadows } from "../lovers";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// 0 · the two of them, her weight on him, rocking.
// 1 · the glowing part of her that is her — 自己 — has already gone over to
//     him: it sits in his chest. She's only an outline.
// 2 · he takes a few steps away — and her self goes with him; with nothing to
//     lean on she tips and flickers.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2] = cues;
  const rock = Math.sin(frame / 9) * 4 + Math.sin(frame / 4.3) * 1.2;
  const go = interpolate(frame, [c2 + BEAT, c2 + 4 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const bx = 1020 + 360 * go;
  const ax = 865;
  const orbK = interpolate(frame, [c1 + BEAT, c1 + 2.5 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const ghost = 0.15 + 0.45 * orbK + 0.35 * go;
  const flick = go > 0.3 ? (Math.floor(frame / 3) % 3 === 0 ? 0.25 : 0) : 0;
  const ox = ax + (bx - ax) * orbK, oy = FLOOR - 190 + Math.sin(orbK * Math.PI) * -90;
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.12]} focus={{ x: 960, y: 500 }} hits={[c2 + 4 * BEAT]}>
        <FloorLight x={960} />
        <Shadows ax={ax} bx={bx} split={go} />
        <Leaner x={bx} h={318} lean={-6 * (1 - go) + rock * 0.8 * (1 - go)} lift={1.1} glow={0.8} rgb={HIM} />
        <Leaner x={ax} h={300} lean={16 + rock + 10 * go + (go > 0 ? Math.sin(frame * 1.7) * 3 * go : 0)} lift={0.4} glow={0.8} ghost={Math.min(0.95, ghost + flick)} rgb={HER} />
        {orbK > 0 && (
          <div style={{ position: "absolute", left: ox - 44, top: oy - 44, width: 88, height: 88, borderRadius: 44, background: `radial-gradient(circle, rgba(${HER},1), rgba(${HER},0.4) 60%, transparent 72%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900, color: "#1a1006" }}>自己</div>
        )}
        {go > 0.5 && <div style={{ position: "absolute", left: ax - 160, top: FLOOR - 400, width: 320, textAlign: "center", fontSize: 28, fontWeight: 900, color: look.key, opacity: ramp(frame, c2 + 4 * BEAT, 8) }}>靠他才存在的自己</div>}
      </Cam>
      <Bokeh frame={frame} rgb="255, 170, 190" />
      <Sfx name="whoosh" at={c1 + BEAT} volume={0.35} />
      <Sfx name="glint" at={c1 + 2.5 * BEAT} volume={0.35} />
      {[1, 2, 3].map((k) => (
        <Sfx key={k} name="step" at={c2 + k * BEAT} volume={0.3} />
      ))}
      <Sfx name="glitch" at={c2 + 4 * BEAT} volume={0.35} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
