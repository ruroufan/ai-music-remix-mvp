import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { FILTER, FILTER_RGB, Face, Hearts, MirrorGlass, Phone } from "../faces";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const COMMENTS = ["好美！", "女神", "求滤镜", "绝了", "皮肤好好", "爱了爱了", "神颜", "好精致"];

// 0 · the phone and the mirror start side by side. Each beat, another round of
//     editing — 修图 ×1, ×2, ×3… — the face on the phone gets smoother and
//     further from the one in the mirror, and the two drift apart: 距离 ↑.
// 1 · online, that face is loved: hearts pour out, comments pop up around it,
//     the likes count up to 9,999+.
// 2 · the mirror: ♥ 0. The face in it looks down, its light goes, and a
//     heart under it breaks in two.
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2] = cues;
  const edits = Math.max(0, Math.min(6, Math.floor(frame / BEAT)));
  const e = interpolate(frame, [0, 6 * BEAT], [0, 1], clamp);
  const apart = interpolate(frame, [0, 6 * BEAT + 10], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) });
  const px = 800 - 250 * apart, mx = 1120 + 250 * apart;
  const likes = Math.round(interpolate(frame, [c1, c1 + 5 * BEAT], [128, 9999], { ...clamp, easing: (t) => t * t }));
  const alone = ramp(frame, c2, 10);
  const down = interpolate(frame, [c2 + BEAT, c2 + 3 * BEAT], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <Phone x={px} y={440} w={280} h={560} glow={0.9 + 0.6 * ramp(frame, c1, 10)} opacity={1 - 0.45 * alone}>
        <Face id="co-p" x={130} y={250} size={330} smooth={Math.min(1, e * 2)} bright={e} slim={e} eyes={e} statue={Math.max(0, e - 0.5) * 1.4} rim={0} />
      </Phone>
      <MirrorGlass x={mx} y={440} w={340} h={470} light={0.6 * (1 - 0.7 * alone)}>
        <Face id="co-m" x={170} y={245} size={390} gaze={down} smile={-0.35 * down} rim={0.4} />
      </MirrorGlass>
      {/* 0 · the distance */}
      <div style={{ position: "absolute", inset: 0, opacity: 1 - ramp(frame, c1, 8) }}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <line x1={px + 150} y1={780} x2={mx - 180} y2={780} stroke={palette.dim} strokeWidth={2} strokeDasharray="8 8" />
          <path d={`M${px + 162} 770 L${px + 150} 780 L${px + 162} 790 M${mx - 192} 770 L${mx - 180} 780 L${mx - 192} 790`} fill="none" stroke={palette.dim} strokeWidth={2} />
        </svg>
        <div style={{ position: "absolute", left: (px + mx) / 2 - 120, width: 240, top: 740, textAlign: "center", fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim, background: palette.bg }}>
          距离 <span style={{ color: palette.alert }}>↑</span>
        </div>
        <div style={{ position: "absolute", left: px - 120, width: 240, top: 100, textAlign: "center", fontFamily: fonts.mono, fontSize: 30, fontWeight: 700, color: FILTER, opacity: edits > 0 ? 1 : 0, textShadow: `0 0 12px rgba(${FILTER_RGB},0.6)` }}>
          修图 ×{edits}
        </div>
      </div>
      {/* 1 · loved online */}
      {frame >= c1 && (
        <div style={{ position: "absolute", inset: 0, opacity: ramp(frame, c1, 8) }}>
          <Hearts x={px - 20} y={620} frame={frame} start={c1} n={60} every={2} life={40} spread={260} />
          {COMMENTS.map((c, i) => {
            const p = ramp(frame, c1 + 4 + i * HALF_BEAT * 0.75, 6);
            if (p <= 0) return null;
            const side = i % 2 ? 1 : -1;
            return (
              <div key={c} style={{ position: "absolute", left: px + side * (190 + random(`cm-${i}`) * 50) - (side < 0 ? 140 : 0), top: 170 + i * 66, opacity: p * (1 - 0.6 * alone), transform: `scale(${0.7 + 0.3 * p})`, padding: "8px 16px", borderRadius: 16, background: "rgba(255,255,255,0.92)", color: "#1a1f26", fontSize: 22, fontWeight: 700, whiteSpace: "nowrap" }}>
                {c}
              </div>
            );
          })}
          <div style={{ position: "absolute", left: px - 140, width: 280, top: 98, textAlign: "center", fontFamily: fonts.mono, fontSize: 36, fontWeight: 700, color: FILTER, textShadow: `0 0 14px rgba(${FILTER_RGB},0.7)`, opacity: 1 - 0.5 * alone }}>
            ♥ {likes >= 9999 ? "9,999+" : likes.toLocaleString("en-US")}
          </div>
        </div>
      )}
      {/* 2 · and in the mirror */}
      {alone > 0 && (
        <div style={{ position: "absolute", left: mx - 140, width: 280, top: 98, textAlign: "center", opacity: alone }}>
          <span style={{ fontFamily: fonts.mono, fontSize: 36, fontWeight: 700, color: palette.dim }}>♥ 0</span>
        </div>
      )}
      {/* a heart, breaking in two */}
      {alone > 0 &&
        [0, 1].map((h) => {
          const brk = ramp(frame, c2 + 3 * BEAT, 10);
          return (
            <div key={h} style={{ position: "absolute", left: mx - 40, top: 690, width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 70, color: look.key, textShadow: `0 0 16px ${look.keyGlow}`, opacity: alone * (1 - 0.4 * brk), clipPath: h ? "inset(0 0 0 50%)" : "inset(0 50% 0 0)", transform: `translateX(${(h ? 1 : -1) * 10 * brk}px) rotate(${(h ? 1 : -1) * 14 * brk}deg)` }}>
              ♥
            </div>
          );
        })}
      {Array.from({ length: 6 }, (_, k) => (
        <Sfx key={k} name="shutter" at={(k + 1) * BEAT} volume={0.2} />
      ))}
      <Sfx name="glint" at={c1} volume={0.4} />
      {COMMENTS.map((_, i) => (
        <Sfx key={i} name="step" at={c1 + 4 + Math.round(i * HALF_BEAT * 0.75)} volume={0.12} />
      ))}
      <Sfx name="whoosh" at={c2} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
