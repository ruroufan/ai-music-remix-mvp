import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Stander } from "../../doubt/circles";
import { BlurCrowd, Cone, FLOOR, Lamp } from "../lights";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const LINES = ["你好呀！", "好久不见～", "最近怎么样？", "哈哈，是吗", "我也是我也是", "那改天再约？", "嗯嗯好的", "拜拜～", "你好呀！", "好久不见～"];
const SPOTS = [
  [600, 250], [1240, 230], [520, 400], [1330, 380], [640, 540], [1250, 530], [760, 170], [1110, 150], [480, 650], [1380, 660],
];

// 0 · at home, rehearsing: the lines he'll say pop up around him one per half
//     beat — 演练 ×1 … ×10. Then the door: a glaring light slams on over him,
//     blurred people all around, the lines are gone, and he shrinks back.
// 1 · a label slaps onto his chest: 社恐.
export const HookScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const n = Math.max(0, Math.min(LINES.length, Math.floor((frame - 4) / HALF_BEAT) + 1));
  const cut = 5.5 * BEAT;
  const lit = frame >= cut;
  const shrink = interpolate(frame, [cut, cut + 10], [0, 1], clamp);
  const back = interpolate(frame, [cut + 6, cut + BEAT * 1.5], [0, 1], clamp);
  const shake = lit && frame < cues[1] ? Math.sin(frame * 2.3) * 3 * (1 - back * 0.5) : 0;
  const tagAt = cues[1] + 2 * BEAT;
  const tag = interpolate(frame, [tagAt, tagAt + 6], [0, 1], clamp);
  const x = 960 - 90 * back + shake;
  return (
    <ObsFrame duration={duration}>
      {!lit && (
        <div style={{ position: "absolute", inset: 0 }}>
          <Stander x={960} bottom={FLOOR} height={300} lift={1} glow={0.7} />
          {LINES.slice(0, n).map((l, i) => {
            const p = interpolate(frame, [4 + i * HALF_BEAT, 4 + i * HALF_BEAT + 5], [0, 1], clamp);
            return (
              <div key={i} style={{ position: "absolute", left: SPOTS[i][0], top: SPOTS[i][1], transform: `translate(-50%, -50%) scale(${0.7 + 0.3 * p})`, opacity: p * (i < n - 4 ? 0.45 : 1), padding: "10px 22px", borderRadius: 22, background: "rgba(232,238,242,0.1)", border: "2px dashed rgba(232,238,242,0.45)", fontSize: 30, fontWeight: 700, color: palette.ink, whiteSpace: "nowrap" }}>
                {l}
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 1500, top: 120, fontFamily: fonts.mono, fontSize: 30, color: look.key, textShadow: `0 0 12px ${look.keyGlow}` }}>演练 ×{n}</div>
        </div>
      )}
      {lit && (
        <div style={{ position: "absolute", inset: 0 }}>
          <BlurCrowd opacity={shrink} />
          <Cone id="hk" x={960} aimX={x} spread={190} on={shrink} />
          <Lamp x={960} aimX={x} on={shrink} />
          <Stander x={x} bottom={FLOOR} height={300 - 20 * back} lift={1 - shrink} glow={1.2} rgb="255, 246, 226" />
          {tag > 0 && (
            <div style={{ position: "absolute", left: x - 70, top: FLOOR - 180, width: 140, padding: "8px 0", textAlign: "center", background: "#f3efe6", color: "#c02a3f", fontSize: 36, fontWeight: 900, borderRadius: 6, transform: `rotate(-8deg) scale(${2 - tag})`, opacity: tag, boxShadow: "0 6px 16px rgba(0,0,0,0.5)" }}>
              社恐
            </div>
          )}
        </div>
      )}
      {LINES.map((_, i) => (
        <Sfx key={i} name="shutter" at={4 + i * HALF_BEAT} volume={0.12} />
      ))}
      <Sfx name="boom" at={cut} volume={0.6} />
      <Sfx name="stamp" at={tagAt} volume={0.7} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
