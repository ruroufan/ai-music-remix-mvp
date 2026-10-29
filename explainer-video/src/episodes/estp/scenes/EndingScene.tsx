import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { DAWN, FLAME, Room, Sitter } from "../chase";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// The episode's picture, last: an empty room, a window, a shaft of light on
// the floor. He sits down on the floor — and the shadow sits down beside him,
// shoulder to shoulder. A clock ticks quietly: 00:01 … nothing happens, and
// that's fine. Then the window brightens, both of them warm, and the
// shadow's violet softens into the same light. 自由.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const room = ramp(frame, 0, 14);
  const sit = ramp(frame, 2 * BEAT, 12);
  const join = ramp(frame, 4 * BEAT, 14);
  const light = interpolate(frame, [c1, c1 + 6 * BEAT], [0.3, 1], clamp);
  const card = useRamp(c2, 12);
  const secs = Math.floor(Math.max(0, frame - 2 * BEAT) / 30);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1.04, 1]} focus={{ x: 960, y: 620 }} hits={[4 * BEAT, c1 + BEAT, ...keyHits(lines, cues, duration)]}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.92 * card }}>
          <Room k={room} light={light} />
          <div style={{ position: "absolute", inset: 0, opacity: sit, transform: `translateY(${(1 - sit) * 30}px)` }}>
            <Sitter x={860} glow={0.4 + 0.4 * light} />
          </div>
          <div style={{ position: "absolute", inset: 0, opacity: join * (0.85 + 0.15 * light), transform: `translateX(${(1 - join) * -160}px)` }}>
            <Sitter x={1060} ghost={light < 0.85 ? 1 : 0} glow={0.3 + 0.5 * light} rgb={DAWN} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: fonts.mono, fontSize: 30, letterSpacing: 8, color: palette.dim, opacity: sit * (1 - ramp(frame, c1, 10)) }}>00:{String(secs).padStart(2, "0")} · 安静</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 140, textAlign: "center", fontSize: 50, fontWeight: 900, letterSpacing: 18, color: `rgb(${DAWN})`, opacity: ramp(frame, c1 + 4 * BEAT, 12) * (1 - card) }}>自 由</div>
        </div>
      </Cam>
      <Bokeh frame={frame} rgb={light > 0.7 ? DAWN : FLAME} opacity={(0.25 + 0.4 * light) * (1 - card)} />
      {card > 0 && <EndCard opacity={card} signoffAt={c2 + BEAT} />}
      <Sfx name="step" at={2 * BEAT} volume={0.25} />
      <Sfx name="whoosh" at={4 * BEAT} volume={0.2} />
      <Sfx name="rise" at={c1} volume={0.25} />
      <Sfx name="glint" at={c1 + 4 * BEAT} volume={0.4} />
      <Sfx name="boom" at={c2} volume={0.3} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
