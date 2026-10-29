import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam, Shards } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Bower, COLD, FLOOR, GOLD, Leader, Spot, Stage, stageTop } from "../podium";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const ALL = ["权力", "胜利", "地位", "财富", "服从"];

// Hegel's story.
// 0 · two people meet, face to face; between them a light — 承认 — that each
//     of them reaches for.
// 1 · the struggle: a clash, sparks; one rises onto a stage — 主人 — the other
//     goes down in a bow — 奴隶.
// 2 · the light swings onto the one bowing: that's who's recognising him — 被他
//     压服的人.
// 3 · 服从 ≠ 承认, stamped.
// 4 · the master with everything stacked round him — 权力 · 胜利 · 地位 · 财富
//     — and one slot still empty, dashed: 承认.
export const HegelScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2, c3, c4] = cues;
  const meet = ramp(frame, 0, 12);
  const fight = frame >= c1;
  const split = ramp(frame, c1 + BEAT, 12);
  const rise = split;
  const onSlave = ramp(frame, c2 + BEAT, 10);
  const neq = ramp(frame, c3 + BEAT, 6);
  const shake = fight && frame < c1 + BEAT ? Math.sin(frame * 2.3) * 8 : 0;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c3, c4]} hits={[c1, c1 + BEAT, c3 + BEAT, ...keyHits(lines, cues, duration)]}>
        {frame < c3 && (
          <div style={{ position: "absolute", inset: 0 }}>
            {/* the light between them */}
            {frame < c1 + BEAT && (
              <>
                <Halo x={960} y={480} r={180} intensity={meet} rgb={GOLD} />
                <div style={{ position: "absolute", left: 960 - 80, top: 440, width: 160, textAlign: "center", fontSize: 44, fontWeight: 900, color: `rgb(${GOLD})`, opacity: meet, textShadow: `0 0 20px rgba(${GOLD},0.9)` }}>承认</div>
              </>
            )}
            {fight && <Shards x={960} y={520} frame={frame} at={c1} n={28} power={1.2} seed="hg" />}
            {/* the master's stage comes up under the left one */}
            {rise > 0 && <Stage cx={760} rise={0.7 * rise} glow={rise} />}
            {rise > 0 && <Spot x={760} y={stageTop(0.7 * rise)} k={rise * (1 - 0.6 * onSlave)} />}
            <Leader x={760 + (1 - meet) * -200 + shake} bottom={rise > 0 ? stageTop(0.7 * rise) : FLOOR} height={270} lift={fight ? 1.8 : 1} halo={0.3 + 0.3 * rise * (1 - onSlave)} />
            {split < 0.5 ? (
              <div style={{ position: "absolute", inset: 0 }}>
                <Stander x={1160 + (1 - meet) * 200 - shake} bottom={FLOOR} height={270} lift={1} glow={0.6} rgb={COLD} />
              </div>
            ) : (
              <Bower x={1160} bottom={FLOOR} height={250} bow={split} face={-1} glow={0.4 + 0.5 * onSlave} rgb={onSlave > 0.5 ? GOLD : COLD} />
            )}
            {onSlave > 0 && <Spot x={1160} y={FLOOR} k={onSlave * 0.8} />}
            <div style={{ position: "absolute", left: 600, width: 320, top: 140, textAlign: "center", fontSize: 40, fontWeight: 900, color: `rgb(${GOLD})`, opacity: split }}>主人</div>
            <div style={{ position: "absolute", left: 1000, width: 320, top: 400, textAlign: "center", fontSize: 40, fontWeight: 900, color: `rgb(${COLD})`, opacity: split }}>奴隶</div>
            {onSlave > 0 && <div style={{ position: "absolute", left: 1270, top: 520, padding: "8px 18px", border: `4px solid ${palette.alert}`, borderRadius: 10, fontSize: 30, fontWeight: 900, color: palette.alert, opacity: onSlave, transform: `rotate(-6deg)` }}>被压服</div>}
          </div>
        )}
        {frame >= c3 && frame < c4 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 280, top: 250, width: 520, height: 380, borderRadius: 18, border: `2px solid rgba(${COLD},0.5)`, background: "rgba(16,20,26,0.9)" }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 24, textAlign: "center", fontSize: 54, fontWeight: 900, color: palette.dim }}>服从</div>
            </div>
            <Bower x={540} bottom={600} height={180} bow={1} glow={0.4} />
            <div style={{ position: "absolute", left: 1120, top: 250, width: 520, height: 380, borderRadius: 18, border: `3px solid rgb(${GOLD})`, background: `rgba(${GOLD},0.1)` }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 24, textAlign: "center", fontSize: 54, fontWeight: 900, color: `rgb(${GOLD})` }}>承认</div>
            </div>
            <Stander x={1300} bottom={600} height={180} lift={1} glow={0.6} rgb={GOLD} />
            <Stander x={1460} bottom={600} height={180} lift={1} glow={0.6} rgb={GOLD} />
            <div style={{ position: "absolute", left: 860, width: 200, top: 340, textAlign: "center", fontSize: 180, fontWeight: 900, lineHeight: 1, color: palette.alert, opacity: neq, transform: `scale(${2 - neq})`, textShadow: `0 0 30px ${palette.alert}` }}>≠</div>
          </div>
        )}
        {frame >= c4 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Spot x={960} y={stageTop(0.8)} k={0.8} />
            <Stage rise={0.8} />
            <Leader x={960} bottom={stageTop(0.8)} />
            {ALL.map((a, i) => {
              const x = [430, 600, 1320, 1490, 780][i], y = [560, 380, 380, 560, 220][i];
              return <div key={a} style={{ position: "absolute", left: x - 90, width: 180, top: y, padding: "12px 0", textAlign: "center", borderRadius: 12, background: `rgba(${GOLD},0.16)`, border: `2px solid rgb(${GOLD})`, fontSize: 32, fontWeight: 900, color: `rgb(${GOLD})`, opacity: ramp(frame, c4 + i * 5, 6) }}>{a}</div>;
            })}
            <div style={{ position: "absolute", left: 1150 - 90, width: 180, top: 220, padding: "12px 0", textAlign: "center", borderRadius: 12, border: "3px dashed rgba(232,238,242,0.6)", fontSize: 32, fontWeight: 900, color: palette.dim, opacity: ramp(frame, c4 + 3 * BEAT, 8) }}>承认 ？</div>
            <div style={{ position: "absolute", left: 1010, top: 290, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.alert, opacity: ramp(frame, c4 + 3 * BEAT, 8) }}>缺</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} opacity={0.5} />
      <Sfx name="glint" at={4} volume={0.35} />
      <Sfx name="shatter" at={c1} volume={0.5} />
      <Sfx name="boom" at={c1 + BEAT} volume={0.45} />
      <Sfx name="whoosh" at={c2 + BEAT} volume={0.35} />
      <Sfx name="whoosh" at={c3 - 3} volume={0.45} />
      <Sfx name="stamp" at={c3 + BEAT} volume={0.6} />
      <Sfx name="whoosh" at={c4 - 3} volume={0.45} />
      {ALL.map((_, i) => (
        <Sfx key={i} name="glint" at={c4 + i * 5} volume={0.15} />
      ))}
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
