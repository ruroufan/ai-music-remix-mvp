import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox, Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { INK, PALE } from "../checklist";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const RED = "255, 110, 110";

const Node: React.FC<{ x: number; y: number; w: number; p: number; children: React.ReactNode }> = ({ x, y, w, p, children }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - 50, width: w, height: 100, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${palette.faint}`, borderRadius: 14, background: "rgba(10,14,20,0.88)", fontSize: 46, fontWeight: 900, letterSpacing: 4, color: palette.ink, opacity: p, transform: `scale(${0.85 + 0.15 * p})` }}>
    {children}
  </div>
);

// 0 · 「ISTJ」 in the viewfinder, flipped over on the beat.
// 1 · what we usually think: ISTJ = 靠谱 · 踏实 → 最安稳 — the last bit struck.
// 2 · 靠谱, huge. A lens slides across it — and through the lens, inside the
//     word, a different word: 不快乐.
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
  const word = useRamp(c2, 8);
  const lx = interpolate(frame, [c2 + BEAT, c2 + 4 * BEAT], [520, 960], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const lens = useRamp(c2 + BEAT, 8);
  const hidden = useRamp(c2 + 4 * BEAT, 8);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.08]} hits={[4 * BEAT, c1 + 4 * BEAT, c2 + 4 * BEAT, ...keyHits(lines, cues, duration)]} whips={[c1, c2]}>
        {cardOut < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: card * (1 - cardOut) }}>
            <Halo x={960} y={400} r={420} intensity={0.45} />
            <div style={{ position: "absolute", left: 960 - 330, top: 290, width: 660, height: 220, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid rgba(${INK},0.6)`, borderRadius: 18, background: "rgba(12,16,22,0.9)", fontSize: 130, fontWeight: 900, letterSpacing: 30, paddingLeft: 30, transform: `rotate(${flip * 180}deg)` }}>ISTJ</div>
            <FocusBox x={960} y={400} w={760} h={300} progress={interpolate(frame, [6, 16], [0, 1], clamp)} label="认知 · COGNITION" />
            <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.alert, opacity: flip }}>颠 覆</div>
          </div>
        )}
        {frame >= c1 && frame < c2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: left }}>我们通常以为</div>
            <Node x={400} y={400} w={240} p={left}>ISTJ</Node>
            <div style={{ position: "absolute", left: 530, width: 100, top: 340, textAlign: "center", fontSize: 80, fontWeight: 900, color: palette.accent, opacity: eq }}>=</div>
            <Node x={860} y={400} w={380} p={eq}>靠谱 · 踏实</Node>
            <div style={{ position: "absolute", left: 1060, width: 100, top: 350, textAlign: "center", fontSize: 60, fontWeight: 900, color: palette.accent, opacity: right }}>→</div>
            <Node x={1380} y={400} w={340} p={right}>
              最安稳
              <div style={{ position: "absolute", left: 40, right: 40, top: 46, height: 6, background: palette.alert, transformOrigin: "0 50%", transform: `scaleX(${strike})` }} />
            </Node>
          </div>
        )}
        {frame >= c2 && (
          <div style={{ position: "absolute", inset: 0, opacity: word }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", fontSize: 300, fontWeight: 900, lineHeight: 1, color: `rgb(${INK})`, letterSpacing: 20 }}>靠谱</div>
            <div style={{ position: "absolute", left: lx - 170, top: 250, width: 340, height: 340, borderRadius: "50%", overflow: "hidden", opacity: lens, border: "8px solid #c9b08a", boxShadow: "0 0 40px rgba(0,0,0,0.7)", background: "#0d0f13" }}>
              <div style={{ position: "absolute", left: -(lx - 170), top: -250, width: 1920, height: 1080 }}>
                <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", fontSize: 150, fontWeight: 900, color: `rgb(${RED})`, letterSpacing: 10, textShadow: `0 0 20px rgba(${RED},0.6)` }}>不快乐</div>
              </div>
            </div>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: lens }}>
              <line x1={lx + 120} y1={540} x2={lx + 240} y2={680} stroke="#c9b08a" strokeWidth={22} strokeLinecap="round" />
            </svg>
            <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 8, color: `rgb(${PALE})`, opacity: hidden }}>藏在“靠谱”里</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} />
      <Sfx name="shutter" at={6} volume={0.2} />
      <Sfx name="whoosh" at={4 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.4} />
      <Sfx name="glitch" at={c1 + 4 * BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.4} />
      <Sfx name="rise" at={c2 + BEAT} volume={0.3} />
      <Sfx name="boom" at={c2 + 4 * BEAT} volume={0.4} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
