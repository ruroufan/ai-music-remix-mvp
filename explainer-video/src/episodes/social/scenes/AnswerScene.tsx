import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Stander } from "../../doubt/circles";
import { BlurCrowd, Cone, FLOOR, GLARE, Lamp } from "../lights";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const TAGS = [
  { label: "放大", x: 1060, y: 520, w: 120, h: 120, tx: 1220, ty: 500 },
  { label: "审视", x: 960, y: 450, w: 110, h: 110, tx: 620, ty: 400 },
  { label: "被记住", x: 960, y: 600, w: 220, h: 300, tx: 1220, ty: 660 },
];

// 0 · him among the blurred people, no light yet — and he edges back.
// 1 · the light over his head clicks on: glare.
// 2 · viewfinder brackets snap onto his hand, his face, all of him, one per
//     beat: 放大 · 审视 · 被记住 (REC).
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2] = cues;
  const on = interpolate(frame, [c1 + BEAT, c1 + BEAT + 3], [0, 1], clamp);
  const back = interpolate(frame, [2 * BEAT, 4 * BEAT], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <BlurCrowd opacity={ramp(frame, 0, 10)} />
      <Cone id="an" x={960} aimX={960 - 30 * back} spread={180} on={on} />
      <Lamp x={960} aimX={960 - 30 * back} on={on} />
      <Stander x={960 - 30 * back} bottom={FLOOR} height={300} lift={1 - 0.6 * back} glow={0.7 + 0.6 * on} rgb={on > 0.5 ? GLARE : palette.halo} />
      {TAGS.map((t, i) => {
        const p = ramp(frame, c2 + (1 + i) * BEAT, 6);
        if (p <= 0) return null;
        return (
          <div key={t.label} style={{ position: "absolute", inset: 0 }}>
            <FocusBox x={t.x} y={t.y} w={t.w} h={t.h} progress={p} color={palette.alert} />
            <div style={{ position: "absolute", left: t.tx - (t.tx < 960 ? 200 : 0), width: 200, top: t.ty - 26, textAlign: t.tx < 960 ? "right" : "left", opacity: p }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 18px", borderRadius: 24, border: `2px solid ${i === 2 ? look.key : palette.alert}`, background: "rgba(6,8,12,0.8)", fontSize: 32, fontWeight: 900, color: i === 2 ? look.key : palette.alert }}>
                {i === 2 && <span style={{ width: 14, height: 14, borderRadius: 7, background: palette.alert, opacity: Math.floor(frame / 8) % 2 ? 1 : 0.3 }} />}
                {t.label}
              </span>
            </div>
          </div>
        );
      })}
      {frame >= c2 + 3 * BEAT && <div style={{ position: "absolute", left: 1230, top: 700, fontFamily: fonts.mono, fontSize: 18, letterSpacing: 4, color: palette.alert }}>● REC</div>}
      <Sfx name="step" at={2 * BEAT} volume={0.25} />
      <Sfx name="step" at={3 * BEAT} volume={0.25} />
      <Sfx name="boom" at={c1 + BEAT} volume={0.6} />
      {TAGS.map((_, i) => (
        <Sfx key={i} name="shutter" at={c2 + (1 + i) * BEAT} volume={0.4} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
