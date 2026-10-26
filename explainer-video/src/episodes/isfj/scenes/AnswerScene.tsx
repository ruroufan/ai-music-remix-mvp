import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Holder, RED, Say, SOFT } from "../jar";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// 0 · his mouth says 没关系 — and from the jar in his chest, in red, 有关系.
// 1 · two tags: 不在意 — struck — and under it, true: 不敢在意.
// 2 · what he's afraid of, as dashed thought-clouds over the people round him:
//     伤了和气 · 别人不舒服.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const strike = interpolate(frame, [c1 + 2 * BEAT, c1 + 2 * BEAT + 6], [0, 1], clamp);
  const dare = ramp(frame, c1 + 3 * BEAT, 6);
  const fear = (i: number) => ramp(frame, c2 + BEAT + i * 2 * BEAT, 10);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} hits={[2 * BEAT, c1 + 3 * BEAT, ...keyHits(lines, cues, duration)]}>
        <Holder x={frame >= c2 ? 960 : 760} stones={19} crack={0.5} />
        {frame < c2 && <Say x={900} y={240} text="没关系" k={ramp(frame, 4, 6)} color={SOFT} />}
        {frame < c1 && <div style={{ position: "absolute", left: 900, top: 560, fontSize: 52, fontWeight: 900, color: `rgb(${RED})`, textShadow: `0 0 20px rgba(${RED},0.6)`, opacity: ramp(frame, 2 * BEAT, 6) }}>有关系</div>}
        {frame >= c1 && frame < c2 && (
          <div style={{ position: "absolute", left: 1120, top: 380 }}>
            <div style={{ position: "relative", fontSize: 54, fontWeight: 900, color: palette.dim }}>
              不在意
              <div style={{ position: "absolute", left: -6, right: -6, top: "50%", height: 6, background: palette.alert, transformOrigin: "0 50%", transform: `scaleX(${strike})` }} />
            </div>
            <div style={{ marginTop: 26, fontSize: 70, fontWeight: 900, color: `rgb(${RED})`, opacity: dare, textShadow: `0 0 20px rgba(${RED},0.5)` }}>不敢在意</div>
          </div>
        )}
        {frame >= c2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Stander x={420} bottom={900} height={380} lift={1} glow={0.3} rgb="150, 156, 166" />
            <Stander x={1500} bottom={900} height={380} lift={1} glow={0.3} rgb="150, 156, 166" />
            {["伤了和气", "别人不舒服"].map((f, i) => (
              <div key={f} style={{ position: "absolute", left: i ? 1340 : 260, top: 300, width: 320, padding: "20px 0", textAlign: "center", borderRadius: 60, border: "3px dashed rgba(232,238,242,0.5)", fontSize: 36, fontWeight: 900, color: palette.ink, opacity: fear(i), transform: `translateY(${(1 - fear(i)) * 20}px)` }}>{f}？</div>
            ))}
            <div style={{ position: "absolute", left: 0, right: 0, top: 160, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim, opacity: fear(0) }}>他怕的</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={SOFT} opacity={0.3} />
      <Sfx name="glitch" at={2 * BEAT} volume={0.3} />
      <Sfx name="stamp" at={c1 + 3 * BEAT} volume={0.45} />
      {[0, 1].map((i) => (
        <Sfx key={i} name="shutter" at={c2 + BEAT + i * 2 * BEAT} volume={0.2} />
      ))}
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
