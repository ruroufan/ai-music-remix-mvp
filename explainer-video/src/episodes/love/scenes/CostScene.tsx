import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam } from "../../glass/immersive";
import { FLOOR, FloorLight, HER, HIM, Leaner, Shadows } from "../lovers";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// 0 · all her weight on him: he bows back under it, trembling — 承重 100% —
//     他累; she clings, shaking — 你也怕.
// 1 · a rope between them: 依赖. They rock harder; 轻松 is crossed out.
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const c1 = cues[1];
  const heavy = 1 + 0.8 * ramp(frame, c1, 20);
  const rock = (Math.sin(frame / 7) * 5 + Math.sin(frame / 3.1) * 2) * heavy;
  const shake = Math.sin(frame * 2.1) * 1.5;
  const ax = 865, bx = 1020;
  const load = Math.round(interpolate(frame, [0, 2 * BEAT], [40, 100], clamp));
  const rope = ramp(frame, c1 + BEAT, 12);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.1]} focus={{ x: 940, y: 500 }} hits={[c1 + BEAT]}>
        <FloorLight x={950} />
        <Shadows ax={ax} bx={bx} split={0} />
        <Leaner x={bx} h={318} lean={-11 + rock * 0.7 + shake} lift={0.5} glow={0.8} rgb={HIM} />
        <Leaner x={ax} h={300} lean={18 + rock + shake} lift={0.3} glow={0.8} ghost={0.35} rgb={HER} />
        {rope > 0 && (
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <path d={`M${ax + 40} ${FLOOR - 130} C${ax + 80} ${FLOOR - 60 + rock * 3} ${bx - 60} ${FLOOR - 60 - rock * 3} ${bx - 10} ${FLOOR - 150}`} fill="none" stroke={`rgba(${palette.halo},0.9)`} strokeWidth={5} strokeDasharray="14 6" pathLength={1} style={{ strokeDashoffset: 0 }} opacity={rope} />
          </svg>
        )}
        {rope > 0 && <div style={{ position: "absolute", left: 900, top: FLOOR - 40, fontSize: 28, fontWeight: 900, color: `rgb(${palette.halo})`, opacity: rope }}>依赖</div>}
        {/* the load */}
        <div style={{ position: "absolute", left: bx + 80, top: 250, fontFamily: fonts.mono, fontSize: 24, color: palette.dim }}>承重</div>
        <div style={{ position: "absolute", left: bx + 80, top: 284, width: 200, height: 18, borderRadius: 4, background: "rgba(232,238,242,0.1)" }}>
          <div style={{ width: `${load}%`, height: "100%", borderRadius: 4, background: load > 90 ? palette.alert : `rgb(${HIM})`, boxShadow: load > 90 ? `0 0 12px ${palette.alert}` : undefined }} />
        </div>
        <div style={{ position: "absolute", left: bx + 290, top: 276, fontFamily: fonts.mono, fontSize: 26, color: load > 90 ? palette.alert : palette.ink }}>{load}%</div>
        <div style={{ position: "absolute", left: bx + 80, top: 330, fontSize: 34, fontWeight: 900, color: `rgb(${HIM})`, opacity: ramp(frame, 3 * BEAT, 8) }}>他累</div>
        <div style={{ position: "absolute", left: ax - 330, top: 330, width: 220, textAlign: "right", fontSize: 34, fontWeight: 900, color: `rgb(${HER})`, opacity: ramp(frame, 5 * BEAT, 8) }}>你也怕</div>
        {/* 轻松, crossed out */}
        <div style={{ position: "absolute", left: 960 - 80, top: 160, width: 160, textAlign: "center", fontSize: 40, fontWeight: 900, color: palette.dim, opacity: ramp(frame, c1 + 3 * BEAT, 8) }}>
          轻松
          <div style={{ position: "absolute", left: 10, top: 28, height: 5, width: `${ramp(frame, c1 + 4 * BEAT, 6) * 140}px`, background: look.key, boxShadow: `0 0 10px ${look.key}` }} />
        </div>
      </Cam>
      <Bokeh frame={frame} rgb="255, 170, 190" />
      <Sfx name="rise" at={0} volume={0.25} />
      <Sfx name="stamp" at={3 * BEAT} volume={0.35} />
      <Sfx name="stamp" at={5 * BEAT} volume={0.35} />
      <Sfx name="boom" at={c1 + BEAT} volume={0.45} />
      <Sfx name="glitch" at={c1 + 4 * BEAT} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
