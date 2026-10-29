import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { GREY } from "../study";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// Left: a wireframe globe turning — theory: 世界是什么样的 ✓. Right: the dashed
// outline of a person, empty — 替你活一遍 — and a red ✗ stamps over it.
export const TurnScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const globe = ramp(frame, 0, 10);
  const body = ramp(frame, 3 * BEAT, 10);
  const x = ramp(frame, 6 * BEAT, 6);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} hits={[6 * BEAT, ...keyHits(lines, cues, duration)]}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: globe }}>
          <circle cx={600} cy={420} r={220} fill="none" stroke={`rgba(${GREY},0.8)`} strokeWidth={2} />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const rx = Math.abs(Math.cos((frame / 40 + (i * Math.PI) / 6) % Math.PI)) * 220;
            return <ellipse key={i} cx={600} cy={420} rx={rx} ry={220} fill="none" stroke={`rgba(${GREY},0.45)`} strokeWidth={1.5} />;
          })}
          {[-150, -75, 0, 75, 150].map((dy) => <ellipse key={dy} cx={600} cy={420 + dy} rx={Math.sqrt(220 * 220 - dy * dy)} ry={18} fill="none" stroke={`rgba(${GREY},0.35)`} strokeWidth={1.5} />)}
        </svg>
        <div style={{ position: "absolute", left: 400, width: 400, top: 680, textAlign: "center", fontSize: 32, fontWeight: 800, opacity: globe }}>
          世界是什么样的 <span style={{ color: "#7fe0a0" }}>✓</span>
        </div>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: body }}>
          <circle cx={1320} cy={260} r={60} fill="none" stroke="rgba(232,238,242,0.7)" strokeWidth={3} strokeDasharray="10 8" />
          <path d="M1230 650 L1230 400 Q1230 340 1320 336 Q1410 340 1410 400 L1410 650" fill="none" stroke="rgba(232,238,242,0.7)" strokeWidth={3} strokeDasharray="10 8" />
        </svg>
        <div style={{ position: "absolute", left: 1120, width: 400, top: 680, textAlign: "center", fontSize: 32, fontWeight: 800, opacity: body }}>替你活一遍</div>
        {x > 0 && <div style={{ position: "absolute", left: 1200, top: 260, width: 240, textAlign: "center", fontSize: 260, fontWeight: 900, lineHeight: 1, color: palette.alert, opacity: x, transform: `scale(${2 - x})`, textShadow: `0 0 30px ${palette.alert}` }}>✗</div>}
        <div style={{ position: "absolute", left: 0, right: 0, top: 130, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.dim }}>理论 · THEORY</div>
      </Cam>
      <Bokeh frame={frame} rgb="200, 205, 215" opacity={0.5} />
      <Sfx name="glint" at={4} volume={0.3} />
      <Sfx name="stamp" at={6 * BEAT} volume={0.6} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
