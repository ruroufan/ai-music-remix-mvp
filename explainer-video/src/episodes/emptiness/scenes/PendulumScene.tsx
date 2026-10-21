import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam } from "../../glass/immersive";
import { BORE, Pendulum, WARM, bobAt, swing } from "../pendulum";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BAR, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const AMP = 46;

// The episode's picture, in full.
// 0 · he swings on the bob; above the middle, out of reach, a glowing orb —
//     欲望. Each time he swings left, 痛苦 flares.
// 1 · he catches it — the orb drops into his hands and goes grey, and now it's
//     the right end, 无聊, that lights up.
// 2 · the orb crumbles away to nothing; a new one lights up, far off — and the
//     pendulum swings back the other way.
// 3 · back and forth on the beat, harder, a trail behind the rod, the ends
//     flashing in turn; a counter: 一生 · 来回 ×N, racing up.
export const PendulumScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2, c3] = cues;
  const amp = frame < c3 ? AMP : interpolate(frame, [c3, c3 + BAR], [AMP, 56], clamp);
  // starts at the left (pain) end
  const deg = swing(frame, BAR, amp, Math.PI);
  const vel = deg - swing(frame - 1, BAR, amp, Math.PI);
  const pain = Math.pow(Math.max(0, -deg / amp), 3);
  const bore = Math.pow(Math.max(0, deg / amp), 3);
  const bob = bobAt(deg);
  const catchP = interpolate(frame, [c1, c1 + 8], [0, 1], clamp);
  const crumble = interpolate(frame, [c2, c2 + BEAT * 2], [0, 1], clamp);
  const orbX = catchP > 0 ? 960 + (bob.x + 20 - 960) * catchP : 960 + Math.sin(frame / 20) * 20;
  const orbY = catchP > 0 ? 220 + (bob.y - 250 - 220) * catchP : 220 + Math.sin(frame / 13) * 10;
  const grey = catchP;
  const newOrb = interpolate(frame, [c2 + 2 * BEAT, c2 + 3 * BEAT], [0, 1], clamp);
  const passes = Math.round(interpolate(frame, [c3, duration], [1, 29200], { ...clamp, easing: (t) => t * t }));
  const hits = Array.from({ length: 8 }, (_, k) => k * BAR).filter((f) => f < duration);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.02, 1.1]} focus={{ x: 960, y: 480 }} hits={frame >= c3 ? hits.filter((f) => f >= c3) : [c1]}>
        <Pendulum deg={deg} pain={pain} bore={bore * (frame >= c1 ? 1 : 0.3)} amp={56} trail={frame >= c3 ? vel : 0} slump={frame >= c1 && frame < c3 ? 0.6 : 0.2} />
        {/* desire: an orb, then a grey lump, then dust */}
        {crumble < 1 && (
          <div style={{ position: "absolute", left: orbX - 40, top: orbY - 40, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle at 35% 35%, ${grey < 1 ? "#fff3d6" : "#bfc6cc"}, rgba(${grey < 0.5 ? WARM : BORE},${0.9 - 0.3 * crumble}) 60%, transparent 72%)`, boxShadow: `0 0 ${60 * (1 - grey)}px rgba(${WARM},0.9)`, opacity: 1 - crumble, filter: grey > 0.5 ? "saturate(0)" : undefined }} />
        )}
        {crumble > 0 &&
          Array.from({ length: 16 }, (_, i) => {
            const t = crumble;
            return <div key={i} style={{ position: "absolute", left: orbX + (random(`d-x-${i}`) - 0.5) * 220 * t, top: orbY + 160 * t * t * random(`d-y-${i}`) - 20 * t, width: 5, height: 5, borderRadius: 3, background: `rgba(${BORE},${1 - t})` }} />;
          })}
        <div style={{ position: "absolute", left: orbX - 100, width: 200, top: orbY - 90, textAlign: "center", fontSize: 30, fontWeight: 900, color: grey < 0.5 ? look.key : `rgb(${BORE})`, opacity: 1 - crumble }}>{grey < 0.5 ? "欲望" : "满足了"}</div>
        {newOrb > 0 && (
          <div style={{ position: "absolute", left: 1500, top: 230, opacity: newOrb * (frame >= c3 ? 0.6 + 0.4 * Math.sin(frame / 5) : 1) }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: `radial-gradient(circle at 35% 35%, #fff3d6, rgba(${WARM},0.9) 60%, transparent 72%)`, boxShadow: `0 0 50px rgba(${WARM},0.9)` }} />
            <div style={{ marginTop: 8, marginLeft: -30, width: 120, textAlign: "center", fontSize: 24, fontWeight: 900, color: look.key }}>新的欲望</div>
          </div>
        )}
        {frame >= c3 && (
          <div style={{ position: "absolute", left: 210, top: 160, fontFamily: fonts.mono, fontSize: 30, letterSpacing: 4, color: palette.dim }}>
            一生 · 来回 <span style={{ color: look.key, fontSize: 44 }}>×{passes.toLocaleString("en-US")}</span>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} />
      {hits.map((f) => (
        <Sfx key={f} name="whoosh" at={f + BAR / 2 - 8} volume={frame >= c3 ? 0.3 : 0.18} />
      ))}
      <Sfx name="glint" at={c1} volume={0.45} />
      <Sfx name="shatter" at={c2} volume={0.3} />
      <Sfx name="glint" at={c2 + 2 * BEAT} volume={0.3} />
      <Sfx name="boom" at={c3} volume={0.45} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
