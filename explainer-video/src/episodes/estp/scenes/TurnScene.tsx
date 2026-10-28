import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { KineticText } from "../../../components/Kinetic";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { FLAME, Highway, Moto, ROAD, SHADE, Shadow } from "../chase";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const FUN = ["派对", "游戏", "赛车", "旅行", "刷屏"];
const V = 34;
const BX = 1240; // the bike
const GX = 820; // where the shadow stops

// 0 · the word: 消遣 · DIVERTISSEMENT, small pastimes orbiting it.
// 1 · the picture, second half. He rides on, the pastimes flashing past like
//     signs — and ahead, coming closer, a banner: 终点. He brakes hard,
//     skids, stops. The shadow catches up… and settles into a shape: a bike
//     and a rider, exactly his — his own silhouette. 原来 · 是我自己.
export const TurnScene: React.FC<SceneProps> = ({ duration, lines, cues }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1] = cues;
  const brake = c1 + 5 * BEAT;
  const T = BEAT;
  const t = frame - c1;
  const tau = Math.min(Math.max(0, frame - brake), T);
  const dist = V * Math.max(0, Math.min(frame, brake) - c1) + V * (tau - (tau * tau) / (2 * T));
  const stopped = frame >= brake + T;
  const goal = 2300 - 0.27 * dist;
  const sx = interpolate(frame, [brake, brake + 3 * BEAT], [250, GX], { ...clamp, easing: (k) => k * k * (3 - 2 * k) });
  const reveal = interpolate(frame, [brake + 3 * BEAT, brake + 5 * BEAT], [0, 1], { ...clamp, easing: (k) => k * k * (3 - 2 * k) });
  const skid = interpolate(frame, [brake, brake + T], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} whips={[c1]} hits={[brake, brake + 5 * BEAT, ...keyHits(lines, cues, duration)]}>
        {frame < c1 ? (
          <div style={{ position: "absolute", inset: 0 }}>
            {FUN.map((f, i) => {
              const a = (i / FUN.length) * Math.PI * 2 + frame / 30;
              return <div key={f} style={{ position: "absolute", left: 960 + Math.cos(a) * 520 - 70, top: 430 + Math.sin(a) * 230 - 24, width: 140, textAlign: "center", padding: "6px 0", borderRadius: 10, border: `2px solid rgba(${FLAME},0.5)`, fontSize: 28, fontWeight: 800, color: `rgb(${FLAME})`, opacity: ramp(frame, 8 + i * 4, 8) }}>{f}</div>;
            })}
            <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", fontSize: 160, fontWeight: 900, letterSpacing: 30 }}>
              <KineticText text="消遣" t={frame} look={look} beat={BEAT} seed="dv" />
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 540, textAlign: "center", fontFamily: fonts.mono, fontSize: 26, letterSpacing: 10, color: palette.dim, opacity: ramp(frame, BEAT, 10) }}>DIVERTISSEMENT</div>
          </div>
        ) : (
          <div style={{ position: "absolute", inset: 0 }}>
            <Highway dist={dist} blur={stopped ? 0 : 0.6 * (1 - tau / T)} />
            {FUN.map((f, i) => {
              const x = 2000 + i * 520 - dist * 1.2;
              return x > -200 && x < 2100 ? <div key={f} style={{ position: "absolute", left: x, top: ROAD - 250, padding: "6px 16px", borderRadius: 8, border: `2px solid rgba(${FLAME},0.5)`, fontSize: 26, fontWeight: 800, color: `rgb(${FLAME})` }}>{f}</div> : null;
            })}
            {/* the finish banner */}
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <line x1={goal} y1={ROAD} x2={goal} y2={ROAD - 330} stroke="rgba(232,238,242,0.6)" strokeWidth={6} />
              <rect x={goal - 6} y={ROAD - 330} width={180} height={70} fill="rgba(232,238,242,0.12)" stroke="rgba(232,238,242,0.6)" strokeWidth={3} />
              <path d={`M${BX - 140} ${ROAD - 4} L${BX - 140 - 260 * skid} ${ROAD - 4}`} stroke="rgba(232,238,242,0.3)" strokeWidth={8} strokeLinecap="round" opacity={skid > 0 ? 1 : 0} />
            </svg>
            <div style={{ position: "absolute", left: goal, width: 170, top: ROAD - 318, textAlign: "center", fontSize: 40, fontWeight: 900, letterSpacing: 8, color: palette.ink }}>终点</div>
            <Shadow x={sx} frame={frame} scale={1.2} reveal={reveal} k={frame >= brake ? 1 : 0} />
            {reveal > 0 && <Moto x={GX} ghost={1} scale={1.35} opacity={reveal * 0.95} lean={0.5} />}
            <Moto x={BX} spin={dist / 46} frame={frame} scale={1.35} light={stopped ? 0.4 : 1} lean={stopped ? 0.5 : 1} />
            <div style={{ position: "absolute", left: GX - 200, width: 400, top: 290, textAlign: "center", fontSize: 40, fontWeight: 900, letterSpacing: 10, color: `rgb(${SHADE})`, opacity: ramp(frame, brake + 5 * BEAT, 10) }}>原来 · 是我自己</div>
            <div style={{ position: "absolute", left: 120, top: 150, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: t > 0 ? 1 : 0 }}>开心 · 不知不觉 · 走向终点</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={reveal > 0 ? SHADE : FLAME} opacity={0.3} />
      <Sfx name="shutter" at={8} volume={0.2} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.45} />
      <Sfx name="glitch" at={brake} volume={0.4} />
      <Sfx name="stamp" at={brake + T} volume={0.5} />
      <Sfx name="rise" at={brake + BEAT} volume={0.3} />
      <Sfx name="glint" at={brake + 5 * BEAT} volume={0.45} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
