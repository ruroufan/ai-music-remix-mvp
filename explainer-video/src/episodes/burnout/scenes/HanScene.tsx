import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam, SpeedLines } from "../../glass/immersive";
import { FLOOR, SCREEN, Treadmill } from "../treadmill";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const MORE = ["更自律", "更优秀", "再多做一点"];

// 0 · the old society: a barrier, 你不准, and a boss with a whip behind it.
// 1 · the barrier swings away; in its place a gold sign, 你能行！, and a road
//     that runs off to the horizon.
// 2 · the treadmill again — no boss anywhere — and he lifts the whip himself,
//     and brings it down on his own back, on the beat.
// 3 · 更自律 / 更优秀 / 再多做一点 stack up, one per beat, the speed climbs.
// 4 · the console's number runs off the end: ∞ — 没有尽头.
export const HanScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2, c3, c4] = cues;
  const old = useRamp(0, 8);
  const swing = interpolate(frame, [c1, c1 + 10], [0, 1], { ...clamp, easing: (t) => t * t });
  const can = useRamp(c1 + 4, 8);
  const road = interpolate(frame, [c1 + 4, c2], [0, 1], clamp);
  const mill = useRamp(c2, 6);
  const speedAt = (f: number) => (f < c2 ? 0.5 : interpolate(f, [c2, c3, c4, duration], [0.5, 0.6, 0.95, 1.1], clamp));
  const lashAt = (f: number) => {
    if (f < c2 + BEAT) return -1;
    const per = f < c3 ? 2 * BEAT : BEAT;
    return ((f - c2 - BEAT) % per) / per;
  };
  const stack = (i: number) => rampAt(frame, c3 + BEAT + i * BEAT);
  const inf = interpolate(frame, [c4, c4 + BEAT], [0, 1], clamp);
  const kmh = 6 + 14 * speedAt(frame) + (frame > c4 ? Math.pow((frame - c4) / 20, 2.2) : 0);
  const hitFrames = Array.from({ length: 20 }, (_, k) => k).map((k) => c2 + BEAT + Math.round(0.6 * 2 * BEAT) + k * 2 * BEAT).filter((f) => f < c3);
  for (let f = c3 + Math.round(0.6 * BEAT); f < duration; f += BEAT) hitFrames.push(f);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={frame < c2 ? [1, 1.05] : [1, 1.14]} focus={{ x: 900, y: 520 }} hits={[c1, c4, ...hitFrames.filter((f) => f >= c3)]} whips={[c2]}>
        {frame < c2 && (
          <div style={{ position: "absolute", inset: 0, opacity: old }}>
            {/* the road */}
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <path d={`M760 ${FLOOR + 200} L940 ${FLOOR - 340 * road} L980 ${FLOOR - 340 * road} L1160 ${FLOOR + 200} Z`} fill={`rgba(${palette.halo},${0.12 * road})`} />
              {Array.from({ length: 8 }, (_, k) => {
                const z = ((k / 8 + frame / 90) % 1);
                const y = FLOOR + 160 - 480 * Math.pow(z, 0.6) * road;
                const w = 10 * (1 - z);
                return road > 0.1 ? <rect key={k} x={960 - w / 2} y={y} width={w} height={26 * (1 - z)} fill={`rgba(${palette.halo},${0.7 * (1 - z)})`} /> : null;
              })}
            </svg>
            {/* the barrier and its master */}
            <div style={{ position: "absolute", inset: 0, opacity: 1 - swing }}>
              <Stander x={1300} bottom={FLOOR} height={330} lift={2} glow={0.5} rgb="255, 77, 109" />
              <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
                <path d={`M1340 ${FLOOR - 220} Q1420 ${FLOOR - 330} 1480 ${FLOOR - 160 + 20 * Math.sin(frame / 6)}`} fill="none" stroke="#c9b48a" strokeWidth={4} />
              </svg>
              <div style={{ position: "absolute", left: 960 - 20, top: FLOOR - 180, width: 40, height: 180, background: "#2a3242" }} />
              <div style={{ position: "absolute", left: 960 - 380, top: FLOOR - 220, width: 760, height: 60, borderRadius: 8, background: "repeating-linear-gradient(45deg, #ff4d6d 0 40px, #f2efe8 40px 80px)", transformOrigin: "380px 30px", transform: `rotate(${-80 * swing}deg)` }} />
              <div style={{ position: "absolute", left: 560, top: 230, width: 400, padding: "18px 0", textAlign: "center", borderRadius: 12, background: "rgba(60,10,20,0.92)", border: `3px solid ${palette.alert}`, fontSize: 68, fontWeight: 900, color: palette.alert }}>你不准</div>
              <div style={{ position: "absolute", left: 560, top: 380, width: 400, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim }}>规训社会 · DISCIPLINE</div>
            </div>
            {can > 0 && (
              <div style={{ position: "absolute", left: 960 - 260, top: 200, width: 520, textAlign: "center", opacity: can, transform: `scale(${1.3 - 0.3 * can})` }}>
                <Halo x={260} y={70} r={340} intensity={0.6} />
                <div style={{ position: "relative", padding: "20px 0", borderRadius: 14, background: "rgba(40,30,10,0.85)", border: `3px solid ${look.key}`, fontSize: 80, fontWeight: 900, color: look.key, textShadow: `0 0 20px ${look.keyGlow}` }}>你能行！</div>
                <div style={{ position: "relative", marginTop: 16, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim }}>功绩社会 · ACHIEVEMENT</div>
              </div>
            )}
          </div>
        )}
        {frame >= c2 && (
          <div style={{ position: "absolute", inset: 0, opacity: mill }}>
            <Halo x={900} y={FLOOR - 200} r={460} intensity={0.25 + 0.3 * speedAt(frame)} rgb={SCREEN} />
            <Treadmill cx={900} frame={frame} speedAt={speedAt} lash={lashAt(frame)} lift={0.8 - 0.4 * inf} kmh={kmh > 99 ? 99.9 : kmh} text={frame >= c4 ? "你还可以" : "你可以"} />
            <div style={{ position: "absolute", left: 360, top: 250, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: frame < c3 ? 1 : 0 }}>没有人逼他</div>
            {MORE.map((m, i) => (
              <div key={m} style={{ position: "absolute", left: 240, top: 420 - i * 90, padding: "10px 26px", borderRadius: 12, border: `2px solid rgba(${SCREEN},0.7)`, background: "rgba(8,18,26,0.85)", fontSize: 40, fontWeight: 900, color: `rgb(${SCREEN})`, opacity: stack(i), transform: `translateY(${(1 - stack(i)) * -40}px)` }}>{m}</div>
            ))}
            {frame >= c4 && (
              <div style={{ position: "absolute", left: 1340, top: 220, textAlign: "center", opacity: inf }}>
                <div style={{ fontFamily: fonts.mono, fontSize: 200, lineHeight: 1, color: look.key, textShadow: `0 0 30px ${look.keyGlow}`, transform: `scale(${1 + 0.05 * Math.sin(frame / 4)})` }}>∞</div>
                <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: 10, color: look.key }}>没有尽头</div>
              </div>
            )}
          </div>
        )}
      </Cam>
      <SpeedLines x={1800} y={520} angle={0} k={frame >= c3 ? 0.4 + 0.6 * inf : 0} frame={frame} spread={760} n={22} />
      <Bokeh frame={frame} />
      <Sfx name="stamp" at={4} volume={0.4} />
      <Sfx name="whoosh" at={c1} volume={0.45} />
      <Sfx name="glint" at={c1 + 4} volume={0.4} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.5} />
      {hitFrames.map((f) => (
        <Sfx key={f} name="shatter" at={f} volume={0.12} />
      ))}
      {MORE.map((_, i) => (
        <Sfx key={i} name="stamp" at={c3 + BEAT + i * BEAT} volume={0.25} />
      ))}
      <Sfx name="rise" at={c4 - 2 * HALF_BEAT} volume={0.3} />
      <Sfx name="boom" at={c4} volume={0.45} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};

const rampAt = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
