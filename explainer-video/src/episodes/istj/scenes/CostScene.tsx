import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Checklist, Fading, PALE, WARM } from "../checklist";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const LIFE = ["考上好学校", "找份稳定工作", "按时还房贷", "陪客户吃饭", "帮同事顶班", "照顾好家里", "____________"];
const FOR = ["为父母", "为家人", "为银行", "为公司", "为同事", "为家人", "为自己"];
const GREEN = "120, 210, 150";

// 0 · his life as a list, each line ticked — and the column on the right
//     says who for: 为父母 · 为公司 · 为家人 … The last line, 为自己, is blank
//     and unticked; a viewfinder finds it.
// 1 · him, now almost nothing but a dashed outline; two tags hang beside him:
//     有用 ✓ — and 活着 ？
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const done = interpolate(frame, [4, 4 * BEAT], [0, 6], clamp);
  const box = interpolate(frame, [5 * BEAT, 5 * BEAT + 10], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} whips={[c1]} hits={[5 * BEAT, c1 + 2 * BEAT, c1 + 4 * BEAT, ...keyHits(lines, cues, duration)]}>
        {frame < c1 ? (
          <div style={{ position: "absolute", inset: 0 }}>
            <Checklist x={560} y={170} w={800} items={LIFE} done={done} labels={(i) => (i < 6 && done > i + 0.5 ? FOR[i] : i === 6 ? FOR[6] : undefined)} size={1.1} />
            <FocusBox x={960} y={170 + 22 + 6 * 57 + 28} w={840} h={70} progress={box} label="没有一项" />
          </div>
        ) : (
          <div style={{ position: "absolute", inset: 0 }}>
            <Fading x={760} bottom={940} height={520} fade={1} />
            <div style={{ position: "absolute", left: 1080, top: 340, padding: "10px 26px", borderRadius: 12, border: `3px solid rgb(${GREEN})`, fontSize: 48, fontWeight: 900, color: `rgb(${GREEN})`, opacity: ramp(frame, c1 + 2 * BEAT, 6) }}>有用 ✓</div>
            <div style={{ position: "absolute", left: 1080, top: 470, padding: "10px 26px", borderRadius: 12, border: `3px dashed rgb(${PALE})`, fontSize: 48, fontWeight: 900, color: `rgb(${PALE})`, opacity: ramp(frame, c1 + 4 * BEAT, 6) }}>活着 ？</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>很有用 · 很少真正活着</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={WARM} opacity={0.25} />
      {Array.from({ length: 6 }, (_, i) => (
        <Sfx key={i} name="shutter" at={4 + Math.round(i * ((4 * BEAT - 4) / 6))} volume={0.15} />
      ))}
      <Sfx name="boom" at={5 * BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.45} />
      <Sfx name="glint" at={c1 + 2 * BEAT} volume={0.3} />
      <Sfx name="glitch" at={c1 + 4 * BEAT} volume={0.25} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
