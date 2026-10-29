import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo, Mirror } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Person } from "../porcupine";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, HALF_BEAT, type SceneProps } from "../timing";

const PINGS = ["新消息", "@你", "直播开始了", "3 条未读", "推荐给你", "语音通话", "群聊 99+", "新消息"];

// 0 · never alone for a second: notifications keep landing around him; the
//     mirror beside him reflects nothing — there's no one there to see.
// 1–2 · the quote, line by line, as a card.
export const QuoteScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const out = interpolate(frame, [cues[1] - 6, cues[1] + 4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const q1 = useRamp(cues[1], 10);
  const q2 = useRamp(cues[2], 10);
  const pings = Math.min(PINGS.length, Math.floor(frame / HALF_BEAT) + 1);
  return (
    <ObsFrame duration={duration}>
      {out > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: out }}>
          <Person x={760} bottom={790} height={250} pose="hunch" glow={0.4} />
          <div style={{ position: "absolute", left: 820, top: 600, width: 46, height: 80, borderRadius: 8, background: "#cfe8ff", boxShadow: "0 0 50px rgba(160,210,255,0.7)", transform: "rotate(-14deg)" }} />
          {PINGS.slice(0, pings).map((p, i) => (
            <div key={i} style={{ position: "absolute", left: 330 + ((i * 263) % 760), top: 180 + ((i * 137) % 300), padding: "8px 16px", borderRadius: 12, background: "rgba(232,238,242,0.9)", color: "#14181e", fontSize: 24, fontWeight: 700 }}>
              {p}
            </div>
          ))}
          <Mirror x={1400} y={500} w={280} h={520} dim={0.2}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 220, textAlign: "center", fontFamily: fonts.mono, fontSize: 20, letterSpacing: 6, color: palette.dim }}>NO ONE</div>
          </Mirror>
        </div>
      )}
      {frame >= cues[1] - 6 && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - out }}>
          <Halo x={960} y={430} r={460} intensity={0.45} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontSize: 72, fontWeight: 900, letterSpacing: 8, opacity: q1, transform: `translateY(${(1 - q1) * 16}px)` }}>人只有在独处时，才能成为自己；</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center", fontSize: 72, fontWeight: 900, letterSpacing: 8, opacity: q2, transform: `translateY(${(1 - q2) * 16}px)` }}>
            谁不热爱独处，谁也就不热爱<span style={{ color: palette.accent }}>自由</span>。
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim, opacity: q1 }}>ARTHUR SCHOPENHAUER · 1788—1860 ·《人生的智慧》</div>
        </div>
      )}
      {PINGS.map((_, k) => (
        <Sfx key={k} name="shutter" at={k * HALF_BEAT} volume={0.14} />
      ))}
      <Sfx name="stamp" at={cues[1]} volume={0.55} />
      <Sfx name="stamp" at={cues[2]} volume={0.6} />
      <Sfx name="glint" at={cues[2] + BEAT} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[1, 2]} />
    </ObsFrame>
  );
};
