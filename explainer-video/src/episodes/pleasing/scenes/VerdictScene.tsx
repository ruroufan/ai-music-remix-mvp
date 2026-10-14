import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../ObsFrame";
import { Backlit, Horizon } from "../parts";
import { fonts, palette } from "../look";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const FLOOR = 820;

// Line 0: the verdict — "自由" stamped onto the sentence.
// Line 1: you walk, drawing your own line on the floor as you go.
export const VerdictScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const paper = useRamp(0, 8);
  const stampAt = cues[0] + 2 * BEAT;
  // the stamp drops in the beat before and lands on the beat
  const drop = interpolate(frame, [stampAt - 6, stampAt], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const landed = frame >= stampAt;
  const paperOut = interpolate(frame, [cues[1] - 6, cues[1]], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const walk = interpolate(frame, [cues[1], duration - 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x = 520 + walk * 760;

  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: paper * paperOut }}>
        <div style={{ position: "absolute", left: 960 - 260, top: 170, width: 520, height: 620, background: "linear-gradient(#e9e6df, #cfcac0)", color: "#1a1714", padding: 44, boxSizing: "border-box", transform: "rotate(-1.5deg)" }}>
          <div style={{ textAlign: "center", fontSize: 34, fontWeight: 900, letterSpacing: 18 }}>判决</div>
          <div style={{ fontFamily: fonts.mono, fontSize: 14, letterSpacing: 2, textAlign: "center", marginTop: 6, opacity: 0.6 }}>CONDAMNÉ À ÊTRE LIBRE</div>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ height: 10, borderRadius: 5, background: "rgba(26,23,20,0.25)", marginTop: i === 0 ? 50 : 26, width: `${90 - (i % 3) * 14}%` }} />
          ))}
          <div style={{ marginTop: 40, fontSize: 22, letterSpacing: 4 }}>被告：人</div>
          {/* the stamp's mark */}
          {landed && (
            <div style={{ position: "absolute", right: 60, bottom: 60, width: 170, height: 170, border: `8px solid ${palette.alert}`, color: palette.alert, fontSize: 64, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", letterSpacing: 6, transform: "rotate(-12deg)", opacity: 0.9 }}>
              自由
            </div>
          )}
        </div>
        {/* the stamp itself */}
        {!landed && drop > 0 && (
          <div style={{ position: "absolute", left: 960 + 260 - 60 - 170, top: 170 + 620 - 60 - 170 - (1 - drop) * 500, width: 170, height: 170, background: "#2a1a1e", borderRadius: 12, opacity: drop }} />
        )}
      </div>

      <div style={{ position: "absolute", inset: 0, opacity: 1 - paperOut }}>
        <Horizon y={FLOOR} />
        {/* the line you draw yourself */}
        <div style={{ position: "absolute", left: 520, top: FLOOR - 2, width: walk * 760, height: 4, background: palette.accent, boxShadow: `0 0 14px ${palette.accent}` }} />
        <Backlit x={x} bottom={FLOOR} height={240} glow={0.6 + walk * 0.4} />
      </div>

      <Sfx name="whoosh" at={stampAt - BEAT} volume={0.3} />
      <Sfx name="stamp" at={stampAt} volume={0.9} />
      <Sfx name="rise" at={cues[1]} volume={0.3} />

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
