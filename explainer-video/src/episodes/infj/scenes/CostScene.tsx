import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Seated } from "../../friction/tangle";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { COOL, LAMP } from "../lantern";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// 0 · him, sitting by his dark window, waiting. Outside, a dotted outline of
//     a person walks up — 不用说就懂我 — and dissolves before it arrives.
//     The days tick on.
// 1 · his door, from the street. Three times it opens a crack, a sliver of
//     light — and three times it shuts again, a lock added each time:
//     关上门 ×3.
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const ghost = interpolate(frame, [BEAT, c1 - BEAT], [0, 1], clamp);
  const gx = 1700 - 520 * ghost;
  const gAlpha = Math.min(ramp(frame, BEAT, 10), 1 - interpolate(ghost, [0.7, 1], [0, 1], clamp));
  const days = Math.floor(interpolate(frame, [0, c1], [1, 365], clamp));
  const period = 2 * BEAT;
  const k = Math.floor((frame - c1 - BEAT) / period);
  const t = ((frame - c1 - BEAT) % period) / period;
  const crack = frame < c1 + BEAT || k > 2 ? 0 : Math.sin(Math.min(1, t * 1.6) * Math.PI) * 0.45;
  const locks = Math.max(0, Math.min(3, k + (t > 0.62 ? 1 : 0)));
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} whips={[c1]} hits={[0, 1, 2].map((i) => Math.round(c1 + BEAT + i * period + 0.62 * period)).concat(keyHits(lines, cues, duration))}>
        {frame < c1 ? (
          <div style={{ position: "absolute", inset: 0 }}>
            {/* inside: the dark room, a window */}
            <div style={{ position: "absolute", left: 140, top: 160, width: 820, height: 700, background: "#06080b", border: `3px solid rgba(${COOL},0.35)` }} />
            <div style={{ position: "absolute", left: 640, top: 260, width: 240, height: 280, background: "#0d1118", border: `3px solid rgba(${COOL},0.5)` }} />
            <Seated x={560} floor={860} scale={1.4} glow={0.35} slump={0.6} />
            <div style={{ position: "absolute", left: 200, top: 200, fontFamily: fonts.mono, fontSize: 24, letterSpacing: 4, color: palette.dim }}>
              等待 · 第 <span style={{ color: palette.ink, fontSize: 36 }}>{days}</span> 天
            </div>
            {/* outside: the one who'd just know */}
            <Halo x={gx} y={600} r={200} intensity={0.4 * gAlpha} rgb={LAMP} />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: gAlpha }}>
              <g fill="none" stroke={`rgba(${LAMP},0.85)`} strokeWidth={3} strokeDasharray="8 8">
                <circle cx={gx} cy={470} r={34} />
                <path d={`M${gx - 44} 640 L${gx - 40} 530 Q${gx} 504 ${gx + 40} 530 L${gx + 44} 640 Z`} />
                <path d={`M${gx - 26} 640 L${gx - 26} 760 M${gx + 26} 640 L${gx + 26} 760`} />
              </g>
            </svg>
            <div style={{ position: "absolute", left: gx - 180, width: 360, top: 360, textAlign: "center", fontSize: 30, fontWeight: 900, color: `rgb(${LAMP})`, opacity: gAlpha }}>不用说就懂我</div>
            <div style={{ position: "absolute", left: 1220, top: 820, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: interpolate(ghost, [0.8, 1], [0, 1], clamp) }}>几乎不存在</div>
          </div>
        ) : (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 760, top: 160, width: 400, height: 700, background: `rgba(${LAMP},${0.15 + 0.8 * crack})` }} />
            <div style={{ position: "absolute", left: 760, top: 160, width: 400, height: 700, perspective: 1200 }}>
              <div style={{ position: "absolute", inset: 0, background: "#161a21", border: `4px solid rgba(${COOL},0.5)`, transformOrigin: "0 50%", transform: `rotateY(${-60 * crack}deg)` }}>
                {Array.from({ length: locks }, (_, i) => (
                  <svg key={i} width={70} height={80} viewBox="0 0 70 80" style={{ position: "absolute", left: 300, top: 220 + i * 110 }}>
                    <path d="M18 34 L18 22 Q18 6 35 6 Q52 6 52 22 L52 34" fill="none" stroke="#9aa3ad" strokeWidth={7} />
                    <rect x={8} y={32} width={54} height={44} rx={6} fill="#5b636e" />
                  </svg>
                ))}
              </div>
            </div>
            <Stander x={500} bottom={900} height={300} lift={1} glow={0.4} rgb={COOL} opacity={crack > 0 ? 1 : 0.5} />
            <div style={{ position: "absolute", left: 1260, top: 300, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 4, color: palette.dim }}>
              失望 → 关上门 <span style={{ color: palette.ink, fontSize: 48 }}>×{locks}</span>
            </div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={LAMP} opacity={0.35} />
      <Sfx name="rise" at={BEAT} volume={0.2} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.45} />
      {[0, 1, 2].map((i) => (
        <Sfx key={i} name="stamp" at={Math.round(c1 + BEAT + i * period + 0.62 * period)} volume={0.45} />
      ))}
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
