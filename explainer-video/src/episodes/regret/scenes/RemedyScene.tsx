import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Person, ReplayClip } from "../projector";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const CLIP = { x: 720, y: 400, w: 600 };
const NOTES = [
  { text: "前一晚熬夜", x: 300, y: 180 },
  { text: "第一次上台", x: 1080, y: 170 },
  { text: "很紧张", x: 260, y: 620 },
  { text: "信息不足", x: 1090, y: 640 },
];
const PERSON = { x: 1560, bottom: 760 };

// 0 · a lens slides over the blurred clip and brings it into focus.
// 1 · context appears around it, note by note — and the red strings tying
//     the clip to the person snap, one per note.
// 2 · the you-back-then and the you-now, side by side, in the same light.
export const RemedyScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const focus = interpolate(frame, [BEAT, 3 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lens = useRamp(0, BEAT);
  const noteAt = (i: number) => cues[1] + BEAT + i * BEAT;
  const stage = interpolate(frame, [cues[2] - 6, cues[2] + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pair = useRamp(cues[2], 12);
  const warm = useRamp(cues[2] + 2 * BEAT, 2 * BEAT);

  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: stage }}>
        <ReplayClip x={CLIP.x} y={CLIP.y} w={CLIP.w} frame={frame} id="rm" blur={(1 - focus) * 8} tint={0.5 * (1 - focus)} />
        <div style={{ position: "absolute", left: CLIP.x - 210 + focus * 160, top: CLIP.y - 120, width: 220, height: 220, borderRadius: "50%", opacity: lens * (1 - useRamp(cues[1], 10)), border: `3px solid rgba(${palette.accentRgb},0.85)`, background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.18), rgba(160,200,220,0.04) 60%)", boxShadow: `0 0 30px rgba(${palette.accentRgb},0.35)` }} />
        <div style={{ position: "absolute", left: CLIP.x - CLIP.w / 2, top: CLIP.y + 190, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.accent, opacity: focus }}>UNDERSTAND · 理解</div>

        {/* red strings from the clip to the person; each snaps when a note lands */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {NOTES.map((n, i) => {
            const snapped = frame >= noteAt(i);
            const y0 = CLIP.y - 90 + i * 60;
            const sag = snapped ? 60 + Math.min(1, (frame - noteAt(i)) / 8) * 120 : 0;
            return snapped ? (
              <g key={i} opacity={Math.max(0, 1 - (frame - noteAt(i)) / 18)}>
                <path d={`M${CLIP.x + CLIP.w / 2} ${y0} q 120 ${sag} 220 ${sag}`} fill="none" stroke={palette.alert} strokeWidth={3} />
                <path d={`M${PERSON.x - 30} ${PERSON.bottom - 170 + i * 14} q -120 ${sag} -220 ${sag}`} fill="none" stroke={palette.alert} strokeWidth={3} />
              </g>
            ) : (
              <line key={i} x1={CLIP.x + CLIP.w / 2} y1={y0} x2={PERSON.x - 30} y2={PERSON.bottom - 170 + i * 14} stroke={palette.alert} strokeWidth={3} opacity={0.8} />
            );
          })}
        </svg>
        {NOTES.map((n, i) => {
          const a = interpolate(frame, [noteAt(i), noteAt(i) + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={n.text} style={{ position: "absolute", left: n.x, top: n.y, opacity: a, transform: `scale(${0.8 + 0.2 * a})`, padding: "8px 16px", border: `1px dashed ${palette.accent}`, background: "rgba(6,8,12,0.85)", fontSize: 30, fontWeight: 700, letterSpacing: 4, color: palette.ink }}>
              {n.text}
            </div>
          );
        })}
        <Person x={PERSON.x} bottom={PERSON.bottom} height={240} pose={frame >= noteAt(3) ? "plain" : "hunch"} glow={0.5 + 0.4 * Math.min(1, Math.max(0, (frame - cues[1]) / (5 * BEAT)))} />
      </div>

      {frame >= cues[2] - 6 && (
        <div style={{ position: "absolute", inset: 0, opacity: pair }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 120, height: 680, background: `radial-gradient(ellipse at 50% 60%, rgba(${palette.halo},${0.12 + 0.18 * warm}), transparent 60%)` }} />
          <Person x={760} bottom={760} height={230} pose="hunch" glow={0.4 + 0.5 * warm} opacity={0.85} />
          <Person x={1160} bottom={760} height={250} glow={0.9} />
          <div style={{ position: "absolute", left: 660, width: 200, top: 790, textAlign: "center", fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim, opacity: 1 - warm * 0.4 }}>当时的你</div>
          <div style={{ position: "absolute", left: 1060, width: 200, top: 790, textAlign: "center", fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim, opacity: 1 - warm * 0.4 }}>现在的你</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", fontFamily: fonts.mono, fontSize: 30, letterSpacing: 8, color: `rgb(${palette.halo})`, opacity: warm }}>✓ 尽力了</div>
        </div>
      )}

      <Sfx name="glint" at={BEAT} volume={0.35} />
      {NOTES.map((_, i) => (
        <Sfx key={i} name="shatter" at={noteAt(i)} volume={0.22} />
      ))}
      <Sfx name="rise" at={cues[2]} volume={0.25} />

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
