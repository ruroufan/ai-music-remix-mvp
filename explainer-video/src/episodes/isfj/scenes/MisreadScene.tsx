import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox, Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Holder, RED, SOFT } from "../jar";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const GULP = ["凭什么是我", "我也很累", "你忘了", "其实我介意"];

const Node: React.FC<{ x: number; y: number; w: number; p: number; children: React.ReactNode }> = ({ x, y, w, p, children }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - 50, width: w, height: 100, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${palette.faint}`, borderRadius: 14, background: "rgba(10,14,20,0.88)", fontSize: 46, fontWeight: 900, letterSpacing: 4, color: palette.ink, opacity: p, transform: `scale(${0.85 + 0.15 * p})` }}>
    {children}
  </div>
);

// 0 · 「ISFJ」 in the viewfinder, flipped over on the beat.
// 1 · what we usually think: ISFJ = 脾气好 · 不计较 — 不计较 struck out.
// 2 · him, the jar in his chest; the things he minds — 凭什么是我 · 我也很累
//     · 你忘了 · 其实我介意 — drop down past his mouth one after another and
//     into the jar: 咽了下去.
export const MisreadScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const card = useRamp(0, 8);
  const flip = interpolate(frame, [4 * BEAT, 4 * BEAT + 10], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const cardOut = useRamp(c1 - 4, 6);
  const left = useRamp(c1, 8);
  const eq = useRamp(c1 + BEAT, 8);
  const right = useRamp(c1 + 2 * BEAT, 8);
  const strike = interpolate(frame, [c1 + 4 * BEAT, c1 + 4 * BEAT + 6], [0, 1], clamp);
  const gulpAt = (i: number) => c2 + 4 + i * BEAT;
  const swallowed = GULP.reduce((a, _, i) => a + interpolate(frame, [gulpAt(i) + 10, gulpAt(i) + 16], [0, 1], clamp), 0);
  const label = useRamp(c2 + 5 * BEAT, 8);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.08]} hits={[4 * BEAT, c1 + 4 * BEAT, ...GULP.map((_, i) => gulpAt(i) + 14), ...keyHits(lines, cues, duration)]} whips={[c1, c2]}>
        {cardOut < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: card * (1 - cardOut) }}>
            <Halo x={960} y={400} r={420} intensity={0.45} rgb={SOFT} />
            <div style={{ position: "absolute", left: 960 - 330, top: 290, width: 660, height: 220, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid rgba(${SOFT},0.6)`, borderRadius: 18, background: "rgba(12,16,22,0.9)", fontSize: 130, fontWeight: 900, letterSpacing: 30, paddingLeft: 30, transform: `rotate(${flip * 180}deg)` }}>ISFJ</div>
            <FocusBox x={960} y={400} w={760} h={300} progress={interpolate(frame, [6, 16], [0, 1], clamp)} label="认知 · COGNITION" />
            <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.alert, opacity: flip }}>颠 覆</div>
          </div>
        )}
        {frame >= c1 && frame < c2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: left }}>我们通常以为</div>
            <Node x={520} y={400} w={260} p={left}>ISFJ</Node>
            <div style={{ position: "absolute", left: 660, width: 140, top: 340, textAlign: "center", fontSize: 80, fontWeight: 900, color: palette.accent, opacity: eq }}>=</div>
            <Node x={1200} y={400} w={560} p={right}>
              脾气好 · <span style={{ position: "relative", marginLeft: 12 }}>不计较<span style={{ position: "absolute", left: -4, right: -4, top: "50%", height: 6, background: palette.alert, transformOrigin: "0 50%", transform: `scaleX(${strike})` }} /></span>
            </Node>
          </div>
        )}
        {frame >= c2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Holder x={760} stones={16 + swallowed} crack={0.3} />
            {GULP.map((g, i) => {
              const t = (frame - gulpAt(i)) / 16;
              if (t < 0 || t > 1) return null;
              return <div key={g} style={{ position: "absolute", left: 640 + 120 * (1 - t) + 100, top: 200 + t * 260, fontSize: 34 - 14 * t, fontWeight: 900, color: `rgb(${RED})`, opacity: 1 - 0.6 * t, whiteSpace: "nowrap" }}>{g}</div>;
            })}
            <div style={{ position: "absolute", left: 1080, top: 380, fontSize: 56, fontWeight: 900, color: palette.ink, opacity: label }}>咽了下去</div>
            <div style={{ position: "absolute", left: 1080, top: 460, fontFamily: fonts.mono, fontSize: 24, letterSpacing: 4, color: palette.dim, opacity: label }}>不是不计较</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={SOFT} />
      <Sfx name="shutter" at={6} volume={0.2} />
      <Sfx name="whoosh" at={4 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.4} />
      <Sfx name="glitch" at={c1 + 4 * BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.4} />
      {GULP.map((_, i) => (
        <Sfx key={i} name="step" at={gulpAt(i) + 14} volume={0.25} />
      ))}
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
