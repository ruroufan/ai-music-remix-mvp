import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox, Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { GREY, Reasoning } from "../study";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Node: React.FC<{ x: number; y: number; w: number; p: number; children: React.ReactNode; color?: string; border?: string; style?: React.CSSProperties }> = ({ x, y, w, p, children, color = palette.ink, border = palette.faint, style }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - 50, width: w, height: 100, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${border}`, borderRadius: 14, background: "rgba(10,14,20,0.88)", fontSize: 50, fontWeight: 900, letterSpacing: 4, color, opacity: p, transform: `scale(${0.85 + 0.15 * p})`, ...style }}>
    {children}
  </div>
);

// 0 · 「INTP」 in the viewfinder, flipped over on the beat.
// 1 · what we usually think: INTP ← 因为 ← 懒 — struck out.
// 2 · a head in profile, and inside it the reasoning branching and pulsing,
//     运转 100%; an exit is drawn on the skull, dashed — 走出脑子 0 次.
export const MisreadScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2] = cues;
  const card = useRamp(0, 8);
  const flip = interpolate(frame, [4 * BEAT, 4 * BEAT + 10], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const cardOut = useRamp(c1 - 4, 6);
  const left = useRamp(c1, 8);
  const arrow = useRamp(c1 + BEAT, 8);
  const right = useRamp(c1 + 2 * BEAT, 8);
  const out1 = useRamp(c2 - 4, 6);
  const busy = useRamp(c2, 8);
  const lock = useRamp(c2 + 4 * BEAT, 6);
  const strike = interpolate(frame, [c1 + 4 * BEAT, c1 + 4 * BEAT + 6], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.08]} hits={[...[4 * BEAT, c1 + 4 * BEAT, c2 + 4 * BEAT], ...keyHits(lines, cues, duration)]} whips={[c1, c2]}>
        {cardOut < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: card * (1 - cardOut) }}>
            <Halo x={960} y={400} r={420} intensity={0.45} />
            <div style={{ position: "absolute", left: 960 - 330, top: 290, width: 660, height: 220, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid rgba(${palette.halo},0.6)`, borderRadius: 18, background: "rgba(12,16,22,0.9)", fontSize: 130, fontWeight: 900, letterSpacing: 30, paddingLeft: 30, transform: `rotate(${flip * 180}deg)` }}>INTP</div>
            <FocusBox x={960} y={400} w={760} h={300} progress={interpolate(frame, [6, 16], [0, 1], clamp)} label="认知 · COGNITION" />
            <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.alert, opacity: flip }}>颠 覆</div>
          </div>
        )}
        {frame >= c1 && out1 < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: 1 - out1 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: left }}>我们通常以为</div>
            <Node x={460} y={400} w={260} p={left}>INTP</Node>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: arrow }}>
              <line x1={980} y1={400} x2={980 - 380 * arrow} y2={400} stroke={palette.accent} strokeWidth={4} />
              <path d={`M${980 - 380 * arrow + 18} 386 L${980 - 380 * arrow} 400 L${980 - 380 * arrow + 18} 414`} fill="none" stroke={palette.accent} strokeWidth={4} />
            </svg>
            <div style={{ position: "absolute", left: 640, width: 300, top: 346, textAlign: "center", fontSize: 30, fontWeight: 700, color: palette.accent, opacity: arrow }}>因为</div>
            <Node x={1300} y={400} w={260} p={right}>
              懒
              <div style={{ position: "absolute", left: 40, right: 40, top: 46, height: 6, background: palette.alert, transformOrigin: "0 50%", transform: `scaleX(${strike})` }} />
            </Node>
          </div>
        )}
        {frame >= c2 && (
          <div style={{ position: "absolute", inset: 0, opacity: busy }}>
            {/* a head, and inside it the reasoning never stops */}
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <defs>
                <clipPath id="ip-head">
                  <path d="M700 760 L700 640 Q600 600 610 470 Q620 230 880 210 Q1140 200 1180 420 Q1200 470 1230 520 L1190 540 Q1200 620 1150 650 L1060 660 L1060 760 Z" />
                </clipPath>
              </defs>
              <path d="M700 760 L700 640 Q600 600 610 470 Q620 230 880 210 Q1140 200 1180 420 Q1200 470 1230 520 L1190 540 Q1200 620 1150 650 L1060 660 L1060 760 Z" fill="rgba(20,22,26,0.9)" stroke={`rgba(${GREY},0.6)`} strokeWidth={3} />
              {/* the exit, drawn on the skull, never used */}
              <rect x={1120} y={300} width={50} height={90} fill="none" stroke={look.key} strokeWidth={3} strokeDasharray="8 6" />
            </svg>
            <div style={{ position: "absolute", inset: 0, clipPath: "path('M700 760 L700 640 Q600 600 610 470 Q620 230 880 210 Q1140 200 1180 420 Q1200 470 1230 520 L1190 540 Q1200 620 1150 650 L1060 660 L1060 760 Z')" }}>
              <Reasoning frame={frame} ox={880} oy={640} grow={Math.min(1, (frame - c2) / 60)} seed="mh" />
              <Reasoning frame={frame} ox={760} oy={560} grow={Math.min(1, (frame - c2 - 10) / 60)} seed="mh2" />
            </div>
            <div style={{ position: "absolute", left: 1190, top: 300, fontSize: 26, fontWeight: 900, color: look.key }}>出口</div>
            <div style={{ position: "absolute", left: 260, top: 300, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 3, color: palette.dim, lineHeight: 2 }}>
              <div>
                运转 <span style={{ color: palette.ink, fontSize: 38 }}>{Math.min(100, Math.round((frame - c2) * 2))}%</span>
              </div>
              <div>
                走出脑子 <span style={{ color: palette.alert, fontSize: 38, opacity: lock > 0.5 ? (Math.floor(frame / 8) % 2 ? 1 : 0.4) : 1 }}>0 次</span>
              </div>
            </div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} />
      <Sfx name="shutter" at={6} volume={0.2} />
      <Sfx name="whoosh" at={4 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.4} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.4} />
      <Sfx name="glitch" at={c1 + 4 * BEAT} volume={0.3} />
      <Sfx name="rise" at={c2} volume={0.3} />
      <Sfx name="glitch" at={c2 + 4 * BEAT} volume={0.3} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
