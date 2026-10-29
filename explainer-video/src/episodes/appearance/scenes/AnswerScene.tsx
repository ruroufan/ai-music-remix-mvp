import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { FILTER, FILTER_RGB, Face, MirrorGlass, Phone, Sliders } from "../faces";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// 0 · the phone (the edited face) and the mirror (the face) side by side, a
//     question mark between them.
// 1 · the phone is labelled for what it is — 你修出来的, its sliders still up
//     — and an arrow runs from the mirror to it: 和它比.
// 2 · a scoreboard between them: 镜子 0 : 1 修图, 0 : 2, 0 : 3… one per beat,
//     until 0 : ∞. The mirror dims; the face in it looks down.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2] = cues;
  const show = useRamp(0, 10);
  const q = interpolate(frame, [c1 - 6, c1], [1, 0], clamp);
  const lab = ramp(frame, c1, 8);
  const arrow = ramp(frame, c1 + 2 * BEAT, 10);
  const board = ramp(frame, c2, 8);
  const n = Math.max(0, Math.floor((frame - c2) / BEAT));
  const inf = frame >= c2 + 7 * BEAT;
  const kick = frame >= c2 ? Math.exp(-((frame - c2) % BEAT) / 4) : 0;
  const down = interpolate(frame, [c2 + 2 * BEAT, c2 + 4 * BEAT], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: show }}>
        <Phone x={600} y={450} w={300} h={600} glow={1.1}>
          <Face id="an-p" x={140} y={270} size={360} smooth={1} bright={0.95} slim={0.85} eyes={0.75} rim={0} />
        </Phone>
        <MirrorGlass x={1320} y={450} w={380} h={520} light={0.6 * (1 - 0.6 * down)}>
          <Face id="an-m" x={190} y={270} size={430} gaze={down} smile={-0.3 * down} rim={0.4} />
        </MirrorGlass>
        <div style={{ position: "absolute", left: 960 - 60, top: 380, width: 120, textAlign: "center", fontSize: 110, fontWeight: 900, color: palette.dim, opacity: q, transform: `scale(${1 + 0.06 * Math.sin(frame / 4)})` }}>?</div>
        {/* 1 · labels and the arrow */}
        <div style={{ position: "absolute", left: 600 - 200, width: 400, top: 102, textAlign: "center", opacity: lab }}>
          <span style={{ fontSize: 34, fontWeight: 900, color: FILTER, textShadow: `0 0 16px rgba(${FILTER_RGB},0.7)` }}>你修出来的</span>
        </div>
        <div style={{ position: "absolute", left: 1320 - 200, width: 400, top: 120, textAlign: "center", fontSize: 30, fontWeight: 800, color: palette.ink, opacity: lab }}>镜子里的你</div>
        <Sliders x={250} y={560} w={190} values={[["磨皮", 0.9], ["美白", 0.8], ["瘦脸", 0.7], ["大眼", 0.6]]} opacity={lab * (1 - board)} />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: arrow * (1 - board) }}>
          <path d={`M1110 300 C1000 250 900 250 ${790 + (1 - arrow) * 200} 300`} fill="none" stroke={palette.ink} strokeWidth={3} strokeDasharray="10 8" />
          <path d="M806 284 L790 300 L812 308" fill="none" stroke={palette.ink} strokeWidth={3} opacity={arrow > 0.95 ? 1 : 0} />
        </svg>
        <div style={{ position: "absolute", left: 960 - 100, width: 200, top: 206, textAlign: "center", fontSize: 30, fontWeight: 800, color: palette.ink, opacity: arrow * (1 - board) }}>和它比</div>
        {/* 2 · the scoreboard */}
        {board > 0 && (
          <div style={{ position: "absolute", left: 960 - 130, top: 330, width: 260, padding: "16px 0", borderRadius: 18, background: "rgba(6,8,12,0.92)", border: `2px solid ${palette.faint}`, opacity: board, transform: `scale(${(1.2 - 0.2 * board) * (1 + 0.04 * kick)})`, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 22px", fontSize: 20, fontWeight: 700, color: palette.dim }}>
              <span>镜子</span>
              <span style={{ color: FILTER }}>修图</span>
            </div>
            <div style={{ fontFamily: fonts.mono, fontSize: 84, fontWeight: 700, color: palette.ink, lineHeight: 1.1 }}>
              <span style={{ color: palette.dim }}>0</span>
              <span style={{ margin: "0 18px", color: palette.faint }}>:</span>
              <span style={{ color: inf ? look.key : FILTER, textShadow: inf ? `0 0 20px ${look.keyGlow}` : `0 0 14px rgba(${FILTER_RGB},0.6)` }}>{inf ? "∞" : Math.max(1, n + 1)}</span>
            </div>
          </div>
        )}
      </div>
      <Sfx name="whoosh" at={0} volume={0.3} />
      <Sfx name="stamp" at={c1} volume={0.45} />
      <Sfx name="whoosh" at={c1 + 2 * BEAT} volume={0.3} />
      {Array.from({ length: 7 }, (_, k) => (
        <Sfx key={k} name="shutter" at={c2 + k * BEAT} volume={0.3} />
      ))}
      <Sfx name="boom" at={c2 + 7 * BEAT} volume={0.5} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
