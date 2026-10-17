import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { NightRoom } from "../puppet";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

export const clockAt = (min: number) => `${String(Math.floor(min / 60) % 24).padStart(2, "0")}:${String(Math.floor(min) % 60).padStart(2, "0")}`;

// 00:40 and climbing: sitting up in bed, thumb scrolling. The sleepiness meter
// fills — and the phone stays on.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const sleepy = interpolate(frame, [0, cues[1] + 4 * BEAT], [0.55, 0.97], { extrapolateRight: "clamp" });
  const nod = frame % (4 * BEAT) > 3 * BEAT ? Math.sin(((frame % BEAT) / BEAT) * Math.PI) * 8 : 0;
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${nod * 0.3}px)` }}>
        <NightRoom frame={frame} clock={clockAt(40 + frame / 6)} />
      </div>
      <div style={{ position: "absolute", left: 1380, top: 560, width: 300, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim }}>
        困意 <span style={{ float: "right", color: palette.alert }}>{Math.round(sleepy * 100)}%</span>
        <div style={{ marginTop: 8, height: 10, background: palette.faint }}>
          <div style={{ width: `${sleepy * 100}%`, height: "100%", background: palette.alert }} />
        </div>
        <div style={{ marginTop: 22 }}>
          睡觉 <span style={{ float: "right", color: palette.accent }}>不要</span>
        </div>
      </div>
      {frame >= cues[1] && (
        <div style={{ position: "absolute", left: 1000, top: 260, fontFamily: fonts.mono, fontSize: 40, color: "rgba(140,190,255,0.7)", letterSpacing: 10, opacity: 0.5 + 0.5 * Math.sin(frame / 8) }}>z z z ✕</div>
      )}
      {Array.from({ length: 8 }, (_, k) => (
        <Sfx key={k} name="shutter" at={k * 2 * BEAT + BEAT} volume={0.1} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
