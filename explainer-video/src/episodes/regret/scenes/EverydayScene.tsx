import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { ReplayClip, LOOP } from "../projector";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

// 1 · day and night side by side: the meeting live; the same moment on the
//     ceiling at night, on repeat.
// 2 · the road not taken, ten years ago, lighting up at 2 a.m.
// 3 · "如果当时……" typed, rewound, typed again.
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const seg = (i: number) => frame >= cues[i] && (i + 1 >= cues.length || frame < cues[i + 1]);
  const segIn = (i: number) => interpolate(frame, [cues[i], cues[i] + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const local = frame - cues[0];
  const replays = Math.floor(local / LOOP) + 1;
  // 2 · the untaken path glows
  const road = interpolate(frame, [cues[1] + BEAT, cues[1] + 3 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // 3 · type, rewind, type — each pass is two beats
  const IF = "如果当时……";
  const pass = Math.floor((frame - cues[2]) / (2 * BEAT));
  const inPass = (frame - cues[2]) % (2 * BEAT);
  const typing = inPass < 1.4 * BEAT;
  const shown = typing ? Math.min(IF.length, Math.floor(inPass / (HALF_BEAT / 2))) : Math.max(0, IF.length - Math.floor((inPass - 1.4 * BEAT) / 2));

  return (
    <ObsFrame duration={duration}>
      {seg(0) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(0) }}>
          <div style={{ position: "absolute", left: 959, top: 140, width: 2, height: 720, background: palette.faint }} />
          <div style={{ position: "absolute", left: 200, top: 170, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 6, color: "#e6c46a" }}>14:20 · 会议室</div>
          <div style={{ position: "absolute", left: 1060, top: 170, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 6, color: palette.alert }}>23:58 · 天花板</div>
          {/* day: it happens once */}
          <ReplayClip x={500} y={460} w={600} frame={Math.min(local, LOOP - 1)} id="day" />
          {/* night: it keeps happening */}
          <Halo x={1420} y={460} r={340} intensity={0.35} />
          <ReplayClip x={1420} y={460} w={600} frame={local} count={replays} id="night" />
        </div>
      )}

      {seg(1) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(1) }}>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <path d="M960 860 L960 640" stroke={palette.ink} strokeWidth={6} />
            <path d="M960 640 Q900 480 700 300" fill="none" stroke={palette.dim} strokeWidth={6} />
            <path d="M960 640 Q1020 480 1220 300" fill="none" stroke={`rgba(${palette.halo},${0.3 + road * 0.7})`} strokeWidth={6} strokeDasharray="14 12" style={{ filter: road > 0.5 ? `drop-shadow(0 0 10px rgb(${palette.halo}))` : undefined }} />
          </svg>
          <div style={{ position: "absolute", left: 600, top: 250, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim }}>走过的路</div>
          <div style={{ position: "absolute", left: 1180, top: 250, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: `rgb(${palette.halo})`, opacity: 0.4 + road * 0.6 }}>没选的路 · 2016</div>
          <div style={{ position: "absolute", right: 260, top: 520, fontFamily: fonts.mono, fontSize: 64, color: palette.alert, letterSpacing: 4 }}>02:{String(10 + Math.floor((frame - cues[1]) / BEAT) * 3).padStart(2, "0")}</div>
        </div>
      )}

      {seg(2) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(2) }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", fontSize: 92, fontWeight: 900, letterSpacing: 10 }}>
            {IF.slice(0, shown)}
            <span style={{ color: palette.accent }}>▍</span>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 540, textAlign: "center", fontFamily: fonts.mono, fontSize: 28, letterSpacing: 8, color: typing ? palette.dim : palette.alert }}>
            {typing ? "▶ PLAY" : "◀◀ REWIND"} · ATTEMPT {pass + 1}
          </div>
        </div>
      )}

      {[0, 1, 2, 3].map((k) => (
        <Sfx key={k} name="shutter" at={cues[0] + k * LOOP} volume={0.2} />
      ))}
      <Sfx name="glint" at={cues[1] + BEAT} volume={0.35} />
      {[0, 1, 2, 3].map((k) => (
        <Sfx key={`r${k}`} name="whoosh" at={cues[2] + k * 2 * BEAT + 1.4 * BEAT} volume={0.18} />
      ))}

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
