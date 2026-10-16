import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Seated, Tangle, Thoughts } from "../tangle";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

export const FLOOR = 800;
export const SEAT_X = 900;
export const CLOUD = { cx: 820, cy: 330, r: 260 };

// Sitting perfectly still — while above the head the black threads churn
// and the imagined scenes flicker. 今日完成: 0. 精力: draining anyway.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const energy = interpolate(frame, [0, duration], [0.9, 0.12]);
  const grow = interpolate(frame, [0, 3 * BEAT], [0.3, 1], { extrapolateRight: "clamp" });
  const churn = frame < cues[1] ? 1 : 1.8;
  return (
    <ObsFrame duration={duration}>
      <Horizon y={FLOOR} />
      <Tangle cx={CLOUD.cx} cy={CLOUD.cy} r={CLOUD.r * grow} frame={frame} churn={churn} />
      <Thoughts cx={CLOUD.cx} cy={CLOUD.cy} r={CLOUD.r} frame={frame} beat={BEAT} opacity={grow} />
      <Seated x={SEAT_X} floor={FLOOR} glow={0.5} />
      <div style={{ position: "absolute", left: 1320, top: 520, width: 320, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 3, color: palette.dim, lineHeight: 2 }}>
        <div>今日完成 <span style={{ float: "right", color: palette.ink, fontSize: 30 }}>0</span></div>
        <div>
          精力 <span style={{ float: "right", color: palette.alert }}>{Math.round(energy * 100)}%</span>
          <div style={{ height: 10, background: palette.faint }}>
            <div style={{ width: `${energy * 100}%`, height: "100%", background: palette.alert }} />
          </div>
        </div>
      </div>
      {Array.from({ length: 8 }, (_, k) => (
        <Sfx key={k} name="glitch" at={k * 2 * BEAT + BEAT} volume={0.08} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
