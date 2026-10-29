import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam } from "../../glass/immersive";
import { Grip } from "../ropes";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// 0 · him and his ropes, easy at first. On the beat a plan slips — the card
//     above flips red: 地铁延误 +15min — and every rope snaps taut; his pulse
//     spikes.
// 1 · a badge on him: 靠谱 — and on the beat it cracks: 控制欲.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const slip = 3 * BEAT;
  const tension = interpolate(frame, [slip, slip + 6], [0.25, 0.95], clamp);
  const red = frame >= slip;
  const pulse = 70 + (red ? 50 * Math.min(1, (frame - slip) / 10) : 0);
  const crack = interpolate(frame, [cues[1] + 4 * BEAT, cues[1] + 4 * BEAT + 6], [0, 1], clamp);
  const badge = interpolate(frame, [cues[1] + BEAT, cues[1] + BEAT + 6], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.1]} hits={[slip, cues[1] + 4 * BEAT]}>
        <Grip frame={frame} tension={tension} clench={red ? 0.7 : 0} lift={red ? 0.3 : 0.9} />
        {/* the plan */}
        <div style={{ position: "absolute", left: 960 - 150, top: 330, width: 300, padding: "10px 18px", borderRadius: 10, background: red ? "rgba(60,10,20,0.92)" : "rgba(14,20,28,0.9)", border: `2px solid ${red ? palette.alert : palette.faint}`, fontFamily: fonts.mono, fontSize: 20, color: red ? palette.alert : palette.ink, textAlign: "center", transform: red && frame < slip + 10 ? `translateX(${Math.sin(frame * 4) * 6}px)` : undefined }}>
          {red ? "08:40 地铁延误 +15min" : "08:40 地铁 → 09:00 到"}
        </div>
        <div style={{ position: "absolute", right: 150, top: 120, fontFamily: fonts.mono, fontSize: 30, color: red ? palette.alert : palette.dim }}>♥ {Math.round(pulse + (red ? Math.sin(frame) * 3 : 0))} BPM</div>
        {badge > 0 && (
          <div style={{ position: "absolute", left: 960 - 70, top: 520, width: 140, padding: "6px 0", textAlign: "center", borderRadius: 8, fontSize: 32, fontWeight: 900, transform: `scale(${2 - badge}) rotate(-5deg)`, opacity: badge, background: crack > 0.5 ? "#2a0e14" : "#e9f4ef", color: crack > 0.5 ? look.key : "#1f6b4f", border: crack > 0.5 ? `2px solid ${look.key}` : undefined }}>
            {crack > 0.5 ? "控制欲" : "靠谱"}
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} />
      <Sfx name="glitch" at={slip} volume={0.45} />
      <Sfx name="boom" at={slip} volume={0.45} />
      <Sfx name="stamp" at={cues[1] + BEAT} volume={0.5} />
      <Sfx name="shatter" at={cues[1] + 4 * BEAT} volume={0.45} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
