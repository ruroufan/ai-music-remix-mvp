import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox, Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Seated } from "../../friction/tangle";
import { Bread, GOLD, LEAF, PINK, WARM } from "../stage";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Node: React.FC<{ x: number; y: number; w: number; p: number; children: React.ReactNode }> = ({ x, y, w, p, children }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - 50, width: w, height: 100, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${palette.faint}`, borderRadius: 14, background: "rgba(10,14,20,0.88)", fontSize: 44, fontWeight: 900, letterSpacing: 4, color: palette.ink, opacity: p, transform: `scale(${0.85 + 0.15 * p})` }}>
    {children}
  </div>
);

// 0 · 「ESFP」 in the viewfinder, flipped over on the beat.
// 1 · what we usually think: ESFP = 最会享受快乐.
// 2 · two kinds of 快乐, side by side. Left, Epicurus's: two people at a small
//     table, a loaf, quiet. Right, ESFP's: a crowd, confetti, lights. Between
//     them, stamped on the beat: ≠.
export const MisreadScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const card = useRamp(0, 8);
  const flip = interpolate(frame, [4 * BEAT, 4 * BEAT + 10], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const cardOut = useRamp(c1 - 4, 6);
  const left = useRamp(c1, 8);
  const eq = useRamp(c1 + BEAT, 8);
  const right = useRamp(c1 + 2 * BEAT, 8);
  const scene = useRamp(c2, 10);
  const neq = interpolate(frame, [c2 + 4 * BEAT, c2 + 4 * BEAT + 6], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.08]} hits={[4 * BEAT, c2 + 4 * BEAT, ...keyHits(lines, cues, duration)]} whips={[c1, c2]}>
        {cardOut < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: card * (1 - cardOut) }}>
            <Halo x={960} y={400} r={420} intensity={0.45} rgb={GOLD} />
            <div style={{ position: "absolute", left: 960 - 330, top: 290, width: 660, height: 220, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid rgba(${GOLD},0.6)`, borderRadius: 18, background: "rgba(12,16,22,0.9)", fontSize: 130, fontWeight: 900, letterSpacing: 30, paddingLeft: 30, transform: `rotate(${flip * 180}deg)` }}>ESFP</div>
            <FocusBox x={960} y={400} w={760} h={300} progress={interpolate(frame, [6, 16], [0, 1], clamp)} label="认知 · COGNITION" />
            <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.alert, opacity: flip }}>颠 覆</div>
          </div>
        )}
        {frame >= c1 && frame < c2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: left }}>我们通常以为</div>
            <Node x={400} y={400} w={240} p={left}>ESFP</Node>
            <div style={{ position: "absolute", left: 530, width: 120, top: 340, textAlign: "center", fontSize: 80, fontWeight: 900, color: palette.accent, opacity: eq }}>=</div>
            <Node x={1130} y={400} w={820} p={right}>最会享受快乐</Node>
          </div>
        )}
        {frame >= c2 && (
          <div style={{ position: "absolute", inset: 0, opacity: scene }}>
            {/* left: the garden table */}
            <div style={{ position: "absolute", left: 120, top: 160, width: 760, height: 600, borderRadius: 18, border: `2px solid rgba(${LEAF},0.4)`, background: "rgba(14,20,16,0.85)" }} />
            <div style={{ position: "absolute", left: 120, width: 760, top: 190, textAlign: "center", fontSize: 40, fontWeight: 900, letterSpacing: 6, color: `rgb(${LEAF})` }}>伊壁鸠鲁的快乐</div>
            <Halo x={500} y={560} r={260} intensity={0.45} rgb={WARM} />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <ellipse cx={500} cy={600} rx={110} ry={16} fill="#3a2c20" stroke={`rgba(${WARM},0.5)`} strokeWidth={2} />
              <rect x={493} y={614} width={14} height={110} fill="#2a2018" />
              <line x1={160} y1={724} x2={840} y2={724} stroke="rgba(232,238,242,0.2)" strokeWidth={2} />
            </svg>
            <Bread x={500} y={594} s={0.7} />
            <Seated x={400} floor={724} scale={1.15} glow={0.4} />
            <div style={{ position: "absolute", inset: 0, transform: "scaleX(-1)", transformOrigin: "500px 0" }}>
              <Seated x={400} floor={724} scale={1.15} glow={0.4} />
            </div>
            {/* right: the party */}
            <div style={{ position: "absolute", left: 1040, top: 160, width: 760, height: 600, borderRadius: 18, border: `2px solid rgba(${PINK},0.4)`, background: "rgba(24,12,20,0.85)", overflow: "hidden" }}>
              {Array.from({ length: 40 }, (_, i) => {
                const y = ((i * 53 + (frame - c2) * (3 + (i % 4))) % 640) - 20;
                return <div key={i} style={{ position: "absolute", left: (i * 97) % 740, top: y, width: 12, height: 7, background: `rgb(${[GOLD, PINK, "130, 200, 255"][i % 3]})`, transform: `rotate(${frame * (5 + i)}deg)` }} />;
              })}
            </div>
            <div style={{ position: "absolute", left: 1040, width: 760, top: 190, textAlign: "center", fontSize: 40, fontWeight: 900, letterSpacing: 6, color: `rgb(${PINK})` }}>ESFP追逐的热闹</div>
            {[1140, 1260, 1380, 1500, 1620, 1720].map((x, i) => (
              <Stander key={x} x={x} bottom={760} height={220 + (i % 2) * 30} lift={1.6 + 0.3 * Math.sin(frame / 4 + i)} glow={0.45} rgb={i % 2 ? PINK : GOLD} />
            ))}
            <div style={{ position: "absolute", left: 880, width: 160, top: 360, textAlign: "center", fontSize: 140, fontWeight: 900, color: palette.alert, opacity: neq, transform: `scale(${1.6 - 0.6 * neq})` }}>≠</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={GOLD} />
      <Sfx name="shutter" at={6} volume={0.2} />
      <Sfx name="whoosh" at={4 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.4} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.4} />
      <Sfx name="rise" at={c2 + 3 * BEAT} volume={0.3} />
      <Sfx name="stamp" at={c2 + 4 * BEAT} volume={0.55} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
