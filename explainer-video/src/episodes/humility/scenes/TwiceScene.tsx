import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bubble, MaskedFigure } from "../mask";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const FLOOR = 780;

// 0 · praise arrives; he waves it away — "不不不" — and it bounces off.
// 1 · so it comes again, louder. A counter ticks to ×2, and behind the mask
//     the real face lights up: that was the point.
export const TwiceScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const p1 = frame >= BEAT;
  const refuse = frame >= 3 * BEAT;
  const bounce = interpolate(frame, [3 * BEAT, 4 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t1 = frame - cues[1];
  const p2 = t1 >= BEAT;
  const counted = t1 >= 2 * BEAT;
  const glow = interpolate(t1, [2 * BEAT, 4 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const n = (p1 ? 1 : 0) + (p2 ? 1 : 0);
  return (
    <ObsFrame duration={duration}>
      <Horizon y={FLOOR} />
      <MaskedFigure x={1100} bottom={FLOOR} height={260} xray={glow} glow={0.6 + glow * 0.8} />
      {p1 && (
        <div style={{ position: "absolute", inset: 0, transform: `translate(${-bounce * 380}px, ${-bounce * 120}px) rotate(${-bounce * 20}deg)`, opacity: 1 - bounce * 0.8, transformOrigin: "620px 470px" }}>
          <Bubble x={620} y={470} text="你真棒！" tone="praise" size={36} pop={Math.min(1, (frame - BEAT) / 4)} />
        </div>
      )}
      {refuse && frame < cues[1] + BEAT && <Bubble x={1040} y={460} text="不不不，我不行" tone="humble" size={32} flip />}
      {p2 && <Bubble x={520} y={430} text="真的！你超棒！！" tone="praise" size={48} pop={Math.min(1, (t1 - BEAT) / 4)} />}
      {/* the count */}
      <div style={{ position: "absolute", left: 1320, top: 200, fontFamily: fonts.mono, color: palette.dim, fontSize: 20, letterSpacing: 6 }}>
        赞美
        <div style={{ fontSize: 110, fontWeight: 700, color: counted ? palette.accent : palette.ink, letterSpacing: 2, transform: `scale(${counted ? 1 + 0.25 * Math.max(0, 1 - (t1 - 2 * BEAT) / 6) : 1})`, transformOrigin: "0 50%" }}>×{n}</div>
        <div style={{ color: palette.accent, opacity: counted ? 1 : 0, fontSize: 22 }}>✓ 目标达成</div>
      </div>
      <div style={{ position: "absolute", left: 1000, top: 250, fontFamily: fonts.mono, fontSize: 18, letterSpacing: 4, color: `rgb(${palette.halo})`, opacity: glow }}>面具后 · 满意</div>
      <Sfx name="glint" at={BEAT} volume={0.35} />
      <Sfx name="whoosh" at={3 * BEAT} volume={0.4} />
      <Sfx name="glint" at={cues[1] + BEAT} volume={0.45} />
      <Sfx name="stamp" at={cues[1] + 2 * BEAT} volume={0.7} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
