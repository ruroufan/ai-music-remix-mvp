import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox, Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Walker } from "../../nostalgia/road";
import { FLAME, SHADE } from "../chase";
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

// 0 · 「ESTP」 in the viewfinder, flipped over on the beat.
// 1 · what we usually think: ESTP 爱冒险 = 胆子大 · 精力足.
// 2 · he runs, and runs — and behind him stands a tall mirror. In it, his
//     reflection, looking at his back. He never turns round. 背对 · 自己.
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
  const mirror = interpolate(frame, [c2 + 2 * BEAT, c2 + 4 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const box = interpolate(frame, [c2 + 5 * BEAT, c2 + 5 * BEAT + 10], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.08]} hits={[4 * BEAT, c2 + 5 * BEAT, ...keyHits(lines, cues, duration)]} whips={[c1, c2]}>
        {cardOut < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: card * (1 - cardOut) }}>
            <Halo x={960} y={400} r={420} intensity={0.45} rgb={FLAME} />
            <div style={{ position: "absolute", left: 960 - 330, top: 290, width: 660, height: 220, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid rgba(${FLAME},0.6)`, borderRadius: 18, background: "rgba(12,16,22,0.9)", fontSize: 130, fontWeight: 900, letterSpacing: 30, paddingLeft: 30, transform: `rotate(${flip * 180}deg)` }}>ESTP</div>
            <FocusBox x={960} y={400} w={760} h={300} progress={interpolate(frame, [6, 16], [0, 1], clamp)} label="认知 · COGNITION" />
            <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.alert, opacity: flip }}>颠 覆</div>
          </div>
        )}
        {frame >= c1 && frame < c2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: left }}>我们通常以为</div>
            <Node x={400} y={400} w={240} p={left}>ESTP</Node>
            <div style={{ position: "absolute", left: 530, width: 120, top: 340, textAlign: "center", fontSize: 80, fontWeight: 900, color: palette.accent, opacity: eq }}>=</div>
            <Node x={1130} y={400} w={820} p={right}>爱冒险 ← 胆子大 · 精力足</Node>
          </div>
        )}
        {frame >= c2 && (
          <div style={{ position: "absolute", inset: 0, opacity: scene }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 760, height: 2, background: "rgba(232,238,242,0.25)" }} />
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} style={{ position: "absolute", left: ((i * 260 - (frame - c2) * 16) % 2080 + 2080) % 2080 - 160, top: 790, width: 120, height: 6, background: "rgba(232,238,242,0.25)" }} />
            ))}
            {/* the mirror, and in it his reflection, watching his back */}
            <Halo x={480} y={470} r={300} intensity={0.4 * mirror} rgb={SHADE} />
            <div style={{ position: "absolute", left: 320, top: 180, width: 320, height: 580, borderRadius: 160, border: `6px solid rgba(232,238,242,${0.2 + 0.5 * mirror})`, background: `linear-gradient(160deg, rgba(60,56,80,${0.5 * mirror}), rgba(16,14,24,${0.7 * mirror}))` }} />
            <div style={{ position: "absolute", inset: 0, opacity: mirror, clipPath: "inset(180px 1280px 320px 320px round 160px)" }}>
              <Walker x={480} bottom={740} height={420} face="right" walk={0} glow={0.3} rgb={SHADE} />
            </div>
            <Walker x={1240} bottom={760} height={420} face="right" walk={(frame - c2) / 3.5} lean={8} glow={0.6} rgb={FLAME} />
            <FocusBox x={480} y={470} w={340} h={600} progress={box} label="背对 · 自己" color={`rgb(${SHADE})`} />
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={FLAME} />
      <Sfx name="shutter" at={6} volume={0.2} />
      <Sfx name="whoosh" at={4 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.4} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.4} />
      <Sfx name="rise" at={c2 + 3 * BEAT} volume={0.3} />
      <Sfx name="glitch" at={c2 + 5 * BEAT} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
