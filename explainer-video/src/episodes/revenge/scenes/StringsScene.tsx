import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { NightRoom, N_STRINGS, Puppet } from "../puppet";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

export const FLOOR = 800;

// 0 · daytime: a marionette, yanked on every beat by work, messages, meetings…
// 1 · the strings light up one by one as they're named.
// 2 · night falls; the strings snap, one per beat; he drops — and is sitting
//     on his bed in the phone's light. Nobody's pulling now.
export const StringsScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const t1 = frame - cues[1], t2 = frame - cues[2];
  const hi = t1 >= 0 && frame < cues[2] ? [0, 1, 2, 6][Math.min(3, Math.floor(t1 / (2 * BEAT)))] : -1;
  const night = interpolate(t2, [0, 2 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const snap = Array.from({ length: N_STRINGS }, (_, i) => interpolate(t2, [(i + 1.5) * BEAT, (i + 1.5) * BEAT + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const sitAt = (N_STRINGS + 2) * BEAT;
  const sit = interpolate(t2, [sitAt - 4, sitAt + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <ObsFrame duration={duration}>
      {/* day light → night */}
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(rgba(200,215,230,${0.1 * (1 - night)}), transparent 70%)` }} />
      <Horizon y={FLOOR} />
      <div style={{ position: "absolute", left: 1500, top: 200, fontFamily: fonts.mono, fontSize: 56, color: night > 0.5 ? palette.alert : palette.ink }}>{night > 0.5 ? "01:47" : t1 >= 0 ? "16:40" : "14:30"}</div>
      <div style={{ position: "absolute", left: 1500, top: 280, fontSize: 60, color: night > 0.5 ? "#e8eef2" : "#ffd27a" }}>{night > 0.5 ? "☾" : "☀"}</div>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - sit }}>
        <Puppet x={820} bottom={FLOOR} frame={frame} beat={BEAT} snap={snap} jerk={t1 >= 0 && frame < cues[2] ? 1.4 : 1} highlight={hi} glow={0.6} />
      </div>
      {sit > 0 && <NightRoom frame={frame} opacity={sit} clock="01:47" x={640} />}
      {t2 >= sitAt && <div style={{ position: "absolute", left: 1320, top: 640, fontFamily: fonts.mono, fontSize: 24, letterSpacing: 6, color: "rgb(140,190,255)" }}>没有人来找你</div>}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((k) => (
        <Sfx key={k} name="step" at={k * BEAT} volume={0.14} />
      ))}
      {[0, 1, 2, 3].map((k) => (
        <Sfx key={`h${k}`} name="glint" at={cues[1] + k * 2 * BEAT} volume={0.25} />
      ))}
      {Array.from({ length: N_STRINGS }, (_, i) => (
        <Sfx key={`s${i}`} name="shatter" at={cues[2] + Math.round((i + 1.5) * BEAT)} volume={0.18} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
