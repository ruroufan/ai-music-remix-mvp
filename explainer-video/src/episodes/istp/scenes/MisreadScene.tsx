import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox, Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { FEEL, Feeling, STEEL } from "../bench";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Node: React.FC<{ x: number; y: number; w: number; p: number; children: React.ReactNode }> = ({ x, y, w, p, children }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - 50, width: w, height: 100, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${palette.faint}`, borderRadius: 14, background: "rgba(10,14,20,0.88)", fontSize: 46, fontWeight: 900, letterSpacing: 4, color: palette.ink, opacity: p, transform: `scale(${0.85 + 0.15 * p})` }}>
    {children}
  </div>
);

// 0 · 「ISTP」 in the viewfinder, flipped over on the beat.
// 1 · what we usually think: ISTP = 冷静 · 理性 · 感情淡 — 感情淡 struck out.
// 2 · a stage. Out front, a calm figure labelled 理性. The curtain behind it
//     draws back: backstage, a glowing part at a ship's wheel, steering —
//     感受 · 幕后掌舵.
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
  const curtain = interpolate(frame, [c2 + 3 * BEAT, c2 + 5 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const wheel = (frame - c2) * 1.5;
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.08]} hits={[4 * BEAT, c1 + 4 * BEAT, c2 + 5 * BEAT, ...keyHits(lines, cues, duration)]} whips={[c1, c2]}>
        {cardOut < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: card * (1 - cardOut) }}>
            <Halo x={960} y={400} r={420} intensity={0.45} rgb={STEEL} />
            <div style={{ position: "absolute", left: 960 - 330, top: 290, width: 660, height: 220, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid rgba(${STEEL},0.6)`, borderRadius: 18, background: "rgba(12,16,22,0.9)", fontSize: 130, fontWeight: 900, letterSpacing: 30, paddingLeft: 30, transform: `rotate(${flip * 180}deg)` }}>ISTP</div>
            <FocusBox x={960} y={400} w={760} h={300} progress={interpolate(frame, [6, 16], [0, 1], clamp)} label="认知 · COGNITION" />
            <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.alert, opacity: flip }}>颠 覆</div>
          </div>
        )}
        {frame >= c1 && frame < c2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: left }}>我们通常以为</div>
            <Node x={460} y={400} w={240} p={left}>ISTP</Node>
            <div style={{ position: "absolute", left: 590, width: 120, top: 340, textAlign: "center", fontSize: 80, fontWeight: 900, color: palette.accent, opacity: eq }}>=</div>
            <Node x={1180} y={400} w={680} p={right}>
              冷静 · 理性 · <span style={{ position: "relative", marginLeft: 12 }}>感情淡<span style={{ position: "absolute", left: -4, right: -4, top: "50%", height: 6, background: palette.alert, transformOrigin: "0 50%", transform: `scaleX(${strike})` }} /></span>
            </Node>
          </div>
        )}
        {frame >= c2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 300, top: 180, width: 1320, height: 640, background: "#0e0f12", border: `2px solid rgba(${STEEL},0.3)` }} />
            {/* backstage: the feeling at the wheel */}
            <Halo x={960} y={430} r={260} intensity={0.8 * curtain} rgb={FEEL} />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: curtain }}>
              <g transform={`rotate(${wheel} 960 430)`}>
                <circle cx={960} cy={430} r={110} fill="none" stroke={`rgb(${FEEL})`} strokeWidth={10} />
                {Array.from({ length: 8 }, (_, i) => <line key={i} x1={960} y1={430} x2={960 + Math.cos((i * Math.PI) / 4) * 140} y2={430 + Math.sin((i * Math.PI) / 4) * 140} stroke={`rgb(${FEEL})`} strokeWidth={8} strokeLinecap="round" />)}
              </g>
            </svg>
            {curtain > 0 && <Feeling x={960} y={430} size={1.6} frame={frame} k={curtain} />}
            <div style={{ position: "absolute", left: 300, top: 180, width: 660 * (1 - curtain), height: 640, background: "linear-gradient(90deg, #5a1f22, #7a2a2e)" }} />
            <div style={{ position: "absolute", left: 960 + 660 * curtain, top: 180, width: 660 * (1 - curtain), height: 640, background: "linear-gradient(90deg, #7a2a2e, #5a1f22)" }} />
            {/* front of stage: reason, calm */}
            <Stander x={960} bottom={900} height={300} lift={0} glow={0.5} rgb={STEEL} />
            <div style={{ position: "absolute", left: 1040, top: 720, fontSize: 30, fontWeight: 900, color: `rgb(${STEEL})` }}>理性</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontSize: 44, fontWeight: 900, letterSpacing: 8, color: `rgb(${FEEL})`, opacity: curtain }}>感受 · 幕后掌舵</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={FEEL} />
      <Sfx name="shutter" at={6} volume={0.2} />
      <Sfx name="whoosh" at={4 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.4} />
      <Sfx name="glitch" at={c1 + 4 * BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.4} />
      <Sfx name="whoosh" at={c2 + 3 * BEAT} volume={0.35} />
      <Sfx name="glint" at={c2 + 5 * BEAT} volume={0.4} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
