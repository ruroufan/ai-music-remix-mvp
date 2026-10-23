import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { COLD, Counter, GOLD, RED, RingLight, SEATS, Seats } from "../ring";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ORDER = [1, 14, 7, 8, 2, 13, 4, 11]; // the eight still sitting since the hook, going

// 0 · his mind speeding up — a dial climbing — while the last eight seats
//     round the ring empty one by one: 能说话的人 8 → 0.
// 1 · one friend, close: they open their mouth — “我觉得……” — and a red
//     reticle snaps onto them. 对手.
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const speed = interpolate(frame, [0, c1], [0.25, 1], clamp);
  const left = (i: number) => {
    const k = ORDER.indexOf(i);
    if (k < 0) return 0;
    const at = BEAT + k * Math.max(6, (c1 - 3 * BEAT) / 8);
    return 1 - interpolate(frame, [at, at + 8], [0, 1], clamp);
  };
  const lock = interpolate(frame, [c1 + 2 * BEAT, c1 + 2 * BEAT + 8], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const r = 260 - 150 * lock;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1]} hits={[c1 + 2 * BEAT + 8, ...keyHits(lines, cues, duration)]}>
        {frame < c1 ? (
          <div style={{ position: "absolute", inset: 0 }}>
            <RingLight k={0.6} />
            <Seats occupied={left} />
            {/* the dial */}
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <path d="M760 520 A200 200 0 0 1 1160 520" fill="none" stroke="rgba(232,238,242,0.15)" strokeWidth={22} />
              <path d="M760 520 A200 200 0 0 1 1160 520" fill="none" stroke={`rgb(${GOLD})`} strokeWidth={22} strokeDasharray={`${628 * speed} 700`} />
              <line x1={960} y1={520} x2={960 + 170 * Math.cos(Math.PI * (1 - speed))} y2={520 - 170 * Math.sin(Math.PI * (1 - speed))} stroke={`rgb(${RED})`} strokeWidth={6} strokeLinecap="round" />
            </svg>
            <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontFamily: fonts.mono, fontSize: 28, letterSpacing: 8, color: `rgb(${GOLD})` }}>脑速 ↑</div>
            <Counter x={820} y={640} label="能说话的人" value={SEATS.filter((_, i) => left(i) > 0.5).length} color={`rgb(${RED})`} />
          </div>
        ) : (
          <div style={{ position: "absolute", inset: 0 }}>
            <Stander x={960} bottom={940} height={620} lift={1} glow={0.6} rgb={COLD} />
            <div style={{ position: "absolute", left: 1120, top: 200, padding: "12px 24px", borderRadius: 18, border: `2px solid rgba(${COLD},0.7)`, fontSize: 36, color: palette.ink, opacity: interpolate(frame, [c1 + BEAT, c1 + BEAT + 6], [0, 1], clamp) }}>我觉得……</div>
            {lock > 0 && (
              <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: lock }}>
                <circle cx={960} cy={420} r={r} fill="none" stroke={`rgb(${RED})`} strokeWidth={5} />
                <circle cx={960} cy={420} r={r * 0.6} fill="none" stroke={`rgba(${RED},0.6)`} strokeWidth={2} />
                {[0, 90, 180, 270].map((a) => {
                  const c = Math.cos((a * Math.PI) / 180), s = Math.sin((a * Math.PI) / 180);
                  return <line key={a} x1={960 + c * (r - 30)} y1={420 + s * (r - 30)} x2={960 + c * (r + 40)} y2={420 + s * (r + 40)} stroke={`rgb(${RED})`} strokeWidth={4} />;
                })}
              </svg>
            )}
            <div style={{ position: "absolute", left: 640, top: 160, fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: 8, color: `rgb(${RED})`, opacity: lock }}>TARGET LOCKED</div>
            <div style={{ position: "absolute", left: 1120, top: 520, fontSize: 80, fontWeight: 900, color: `rgb(${RED})`, textShadow: `0 0 26px rgba(${RED},0.8)`, opacity: lock, transform: `scale(${1.4 - 0.4 * lock})` }}>对手</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} opacity={0.4} />
      <Sfx name="rise" at={0} volume={0.25} />
      {ORDER.map((_, k) => (
        <Sfx key={k} name="shutter" at={Math.round(BEAT + k * Math.max(6, (c1 - 3 * BEAT) / 8))} volume={0.12} />
      ))}
      <Sfx name="whoosh" at={c1 - 3} volume={0.45} />
      <Sfx name="stamp" at={c1 + 2 * BEAT + 6} volume={0.5} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
