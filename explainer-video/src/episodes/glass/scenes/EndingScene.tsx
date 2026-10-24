import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { Halo } from "../../../channels/backlit/parts";
import { Doer } from "../../friction/tangle";
import { Bokeh, Cam, SpeedLines } from "../immersive";
import { GLASS, GlassDoor, GlassHeart, WordArrow } from "../parts";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FLOOR = 740;
const ME = { x: 600, h: 320 };
const HEART = { x: ME.x + 4, y: FLOOR - 0.62 * ME.h };
const DOOR = 900;
const STOP = { x: 1150, y: HEART.y };

// The episode's picture, in one take.
// 0 · a line comes at him as an arrow — fast, then slower, slower, until it
//     hangs in the air in front of him, trembling. Between the arrow and him a
//     door of glass draws itself in. Its handle lights up. He reaches out
//     toward it… and stops; he doesn't open it. The arrow loses its force and
//     falls, clattering to the floor. The cracks in the glass heart close up.
// 1 · the channel card.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const c1 = cues[1];
  const bubble = interpolate(frame, [2, 8, 16, 20], [0, 1, 1, 0], clamp);
  // the flight: fast at first, easing all the way to a stop (bullet time)
  const fly = interpolate(frame, [16, 4 * BEAT], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 4) });
  const ax = 1720 + (STOP.x - 1720) * fly;
  const ay = 360 + (STOP.y - 360) * fly;
  const ang = 180 + (Math.atan2(STOP.y - 360, 1720 - STOP.x) * 180) / Math.PI * (1 - fly);
  const hang = frame >= 4 * BEAT ? Math.sin(frame * 2.2) * 2 : 0;
  const door = interpolate(frame, [4.5 * BEAT, 6.5 * BEAT], [0, 1], clamp);
  const handle = interpolate(frame, [7 * BEAT, 8 * BEAT], [0, 1], clamp);
  const reach = interpolate(frame, [8 * BEAT, 9.5 * BEAT, 12.5 * BEAT, 14 * BEAT], [0, 0.78, 0.78, 0.2], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const dropAt = 10.5 * BEAT;
  const fall = interpolate(frame, [dropAt, dropAt + 16], [0, 1], { ...clamp, easing: (t) => t * t });
  const landAt = dropAt + 16;
  const bounce = frame > landAt ? Math.abs(Math.sin((frame - landAt) / 4)) * 18 * Math.exp(-(frame - landAt) / 8) : 0;
  const heal = interpolate(frame, [landAt + 6, landAt + 2 * BEAT], [0, 1], clamp);
  const card = useRamp(c1, 12);
  const fx = ax + hang;
  const fy = frame < dropAt ? ay : ay + (FLOOR - 16 - ay) * fall - bounce;
  const fang = frame < dropAt ? ang + hang : 180 - 70 * fall + (frame > landAt ? -20 : 0);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.15, 1]} focus={{ x: 880, y: 520 }} hits={[landAt]}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - 0.75 * card }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR, height: 2, background: `linear-gradient(90deg, transparent, rgba(${GLASS},0.35), transparent)` }} />
          <Halo x={ME.x} y={FLOOR - ME.h * 0.6} r={ME.h} intensity={0.5 + 0.4 * heal} />
          <Doer x={ME.x} floor={FLOOR} height={ME.h} reach={reach} glow={0.8 + 0.4 * heal} />
          <GlassHeart x={HEART.x} y={HEART.y} size={46} crack={0.6} pain={0.5 * (1 - heal)} heal={heal} glow={1 + heal} />
          <GlassDoor x={DOOR} floor={FLOOR} w={210} h={480} appear={door} handle={handle} ripple={interpolate(frame, [4 * BEAT, 4 * BEAT + 30], [0, 1], clamp) * (door > 0 ? 1 : 0)} ry={(HEART.y - (FLOOR - 480)) / 480} />
          <div style={{ position: "absolute", left: STOP.x + 40, top: 360, transform: "translate(-50%, -50%)", opacity: bubble, padding: "12px 26px", borderRadius: 26, background: "rgba(232,238,242,0.92)", color: "#14181e", fontSize: 34, fontWeight: 800, whiteSpace: "nowrap", marginLeft: 500 }}>开个玩笑嘛～</div>
          <SpeedLines x={ax} y={ay} angle={Math.atan2(STOP.y - 360, STOP.x - 1720)} k={frame >= 16 && fly < 0.85 ? 1 - fly : 0} frame={frame} />
          {frame >= 16 && <WordArrow x={fx} y={fy} angle={fang} text="开个玩笑嘛～" size={34} glow={1 - fall * 0.7} />}
        </div>
      </Cam>
      <Bokeh frame={frame} opacity={1 - card} />
      {card > 0 && <EndCard opacity={card} signoffAt={c1 + BEAT} />}
      <Sfx name="whoosh" at={16} volume={0.55} />
      <Sfx name="rise" at={2 * BEAT} volume={0.3} />
      <Sfx name="glint" at={4.5 * BEAT} volume={0.45} />
      <Sfx name="glint" at={7 * BEAT} volume={0.35} />
      <Sfx name="step" at={landAt} volume={0.6} />
      <Sfx name="shatter" at={landAt} volume={0.25} />
      <Sfx name="boom" at={c1} volume={0.35} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[1]} />
    </ObsFrame>
  );
};
