import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bubble, MaskedFigure, WallShadow } from "../mask";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const FLOOR = 800;
const HUMBLE = ["不敢当", "我很一般的", "过奖过奖", "运气好而已"];

// A light from the front: he bows behind a smiling mask, humble lines popping
// on the beat — while his shadow on the wall behind him stands up straight,
// chin raised, and keeps growing.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const said = Math.min(HUMBLE.length, Math.floor(frame / (1.5 * BEAT)));
  const rise = interpolate(frame, [cues[1] + BEAT, cues[1] + 3 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => 1 - (1 - t) ** 3 });
  return (
    <ObsFrame duration={duration}>
      {/* back wall, lit from the front */}
      <div style={{ position: "absolute", left: 160, top: 110, width: 1600, height: FLOOR - 110, background: "radial-gradient(ellipse at 50% 85%, rgba(255,214,170,0.16), rgba(14,19,28,0.9) 65%)" }} />
      <Horizon y={FLOOR} />
      <WallShadow x={1010} bottom={FLOOR - 40} height={300 + rise * 330} pose={rise > 0.15 ? "proud" : "hunch"} opacity={0.85} />
      <MaskedFigure x={960} bottom={FLOOR} height={250} pose="hunch" glow={0.5} />
      {HUMBLE.slice(0, said).map((t, i) => (
        <Bubble key={t} x={i % 2 ? 1060 : 860} y={520 - i * 70} text={t} tone="humble" size={30} flip={i % 2 === 0} opacity={frame < cues[1] ? 1 : 1 - rise} />
      ))}
      <div style={{ position: "absolute", left: 1200, top: 210, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.alert, opacity: rise }}>SHADOW · CHIN UP ↑</div>
      {[0, 1, 2, 3].map((k) => (
        <Sfx key={k} name="glint" at={Math.round((k + 1) * 1.5 * BEAT)} volume={0.2} />
      ))}
      <Sfx name="rise" at={cues[1]} volume={0.35} />
      <Sfx name="boom" at={cues[1] + 3 * BEAT} volume={0.5} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
