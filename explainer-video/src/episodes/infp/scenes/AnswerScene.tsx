import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { GLOW, GREY, GreyStreet, Kept } from "../cloche";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// Split down the middle. Left, under the glass: 想象 — everything as it should
// be. Right, the street: 现实. Then the verdict on each side: 失望 0 — and on
// the right, stamped big: 会.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const zero = ramp(frame, c1 + BEAT, 8);
  const will = ramp(frame, c1 + 3 * BEAT, 5);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} hits={[c1 + BEAT, c1 + 3 * BEAT, ...keyHits(lines, cues, duration)]}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 960, height: 1080, overflow: "hidden" }}>
          <Kept x={480} y={820} size={1.5} sway={Math.sin(frame / 20) * 3} glow={1} />
          <div style={{ position: "absolute", left: 0, width: 960, top: 150, textAlign: "center", fontSize: 56, fontWeight: 900, color: `rgb(${GLOW})` }}>想象</div>
          <div style={{ position: "absolute", left: 0, width: 960, top: 230, textAlign: "center", fontFamily: fonts.mono, fontSize: 26, letterSpacing: 4, color: palette.dim, opacity: zero }}>
            失望 <span style={{ fontSize: 44, color: `rgb(${GLOW})` }}>0</span>
          </div>
        </div>
        <div style={{ position: "absolute", left: 960, top: 0, width: 960, height: 1080, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: -960, top: 0, width: 1920, height: 1080 }}>
            <GreyStreet frame={frame} />
          </div>
          <div style={{ position: "absolute", left: 0, width: 960, top: 150, textAlign: "center", fontSize: 56, fontWeight: 900, color: `rgb(${GREY})` }}>现实</div>
          <div style={{ position: "absolute", left: 330, top: 360, width: 300, height: 220, display: "flex", alignItems: "center", justifyContent: "center", border: "6px solid rgb(255,110,110)", borderRadius: 12, fontSize: 150, fontWeight: 900, color: "rgb(255,110,110)", background: "rgba(10,10,12,0.85)", opacity: will, transform: `rotate(-8deg) scale(${1.6 - 0.6 * will})` }}>会</div>
        </div>
        <div style={{ position: "absolute", left: 958, top: 100, width: 4, height: 880, background: "rgba(232,238,242,0.4)" }} />
      </Cam>
      <Bokeh frame={frame} rgb={GLOW} opacity={0.35} />
      <Sfx name="glint" at={c1 + BEAT} volume={0.4} />
      <Sfx name="stamp" at={c1 + 3 * BEAT} volume={0.6} />
      <Sfx name="boom" at={c1 + 3 * BEAT} volume={0.3} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
