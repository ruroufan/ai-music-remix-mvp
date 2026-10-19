import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Person } from "../../solitude/porcupine";
import { Face, MirrorGlass, Phone } from "../faces";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const smooth = (frame: number, a: number, b: number) => interpolate(frame, [a, b], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });

const Tag: React.FC<{ x: number; y: number; p: number; side: -1 | 1; children: React.ReactNode; color?: string }> = ({ x, y, p, side, children, color = `rgb(${palette.halo})` }) => (
  <div style={{ position: "absolute", left: side < 0 ? x - 220 : x, width: 220, top: y - 26, textAlign: side < 0 ? "right" : "left", opacity: p, transform: `translateX(${(1 - p) * side * 24}px)` }}>
    <span style={{ display: "inline-block", padding: "8px 20px", borderRadius: 24, border: `2px solid ${color}`, background: "rgba(6,8,12,0.8)", fontSize: 32, fontWeight: 900, color }}>{children}</span>
  </div>
);

const NOTHING = ["表情", "温度", "记忆"];

// 0 · the mirror, close: the face ages a little, gets tired, gets a spot, its
//     lines show — each one tagged, warmly this time: 会老 · 会累 · 会长痘 · 细纹.
// 1 · it laughs — 会笑; it cries, a tear — 会哭; then smiles. The mirror moves
//     aside: a snapshot of that smile flies to someone standing in the light,
//     who keeps it. 被记住.
// 2 · the screen's face: plaster, blank-eyed. 表情 · 无 / 温度 · 无 / 记忆 · 无.
export const RealScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2] = cues;
  const show = ramp(frame, 0, 10);
  const age = smooth(frame, BEAT, 2 * BEAT);
  const tired = smooth(frame, 3 * BEAT, 4 * BEAT);
  const pimple = smooth(frame, 5 * BEAT, 5 * BEAT + 8);
  const laugh = smooth(frame, c1 + HALF_BEAT, c1 + 1.5 * BEAT);
  const cry = smooth(frame, c1 + 2.5 * BEAT, c1 + 3.5 * BEAT);
  const settle = smooth(frame, c1 + 4.5 * BEAT, c1 + 5.5 * BEAT);
  const smile = laugh * (1 - cry) + cry * (1 - settle) * -1 + settle * 0.55;
  const tear = interpolate(frame, [c1 + 3 * BEAT, c1 + 5 * BEAT], [0, 1], clamp);
  const aside = smooth(frame, c1 + 5 * BEAT, c1 + 6 * BEAT);
  const fly = smooth(frame, c1 + 6 * BEAT, c1 + 7.5 * BEAT);
  const kept = ramp(frame, c1 + 7.5 * BEAT, 8);
  const out = interpolate(frame, [c2 - 6, c2 + 4], [1, 0], clamp);
  const mx = 960 - 260 * aside;
  const PX = 1380;
  return (
    <ObsFrame duration={duration}>
      {out > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: show * out }}>
          <MirrorGlass x={mx} y={450} w={400} h={540} light={0.8 + 0.3 * settle}>
            <Face id="rl-m" x={200} y={285} size={460} age={age * 0.8} tired={tired} pimple={pimple} smile={smile} tear={tear} rim={0.45} />
          </MirrorGlass>
          {/* 0 · tagged, warmly */}
          <div style={{ opacity: 1 - ramp(frame, c1 - 4, 6) }}>
            <Tag x={mx - 230} y={270} p={ramp(frame, BEAT, 6)} side={-1}>会老</Tag>
            <Tag x={mx + 230} y={340} p={ramp(frame, 3 * BEAT, 6)} side={1}>会累</Tag>
            <Tag x={mx - 230} y={430} p={ramp(frame, 5 * BEAT, 6)} side={-1}>会长痘</Tag>
            <Tag x={mx + 230} y={520} p={ramp(frame, 6.5 * BEAT, 6)} side={1}>细纹</Tag>
          </div>
          {/* 1 · laughs, cries */}
          <div style={{ opacity: 1 - aside }}>
            <Tag x={mx + 230} y={300} p={ramp(frame, c1 + HALF_BEAT, 6) * (1 - cry)} side={1} color={look.key}>会笑</Tag>
            <Tag x={mx - 230} y={360} p={ramp(frame, c1 + 2.5 * BEAT, 6) * (1 - settle)} side={-1} color="rgb(170,210,255)">会哭</Tag>
          </div>
          {aside > 0 && (
            <div style={{ position: "absolute", inset: 0, opacity: aside }}>
              <Person x={PX} bottom={800} height={430} pose="plain" glow={0.6 + 0.6 * kept} />
              {/* the snapshot */}
              {fly > 0 && (
                <div style={{ position: "absolute", left: mx + (PX - 40 - mx) * fly - 70, top: 330 + Math.sin(fly * Math.PI) * -80 + (520 - 330) * fly - 90, width: 140, height: 170, background: "#efe9df", padding: 8, paddingBottom: 30, boxShadow: "0 10px 30px rgba(0,0,0,0.6)", transform: `rotate(${(1 - fly) * -20 + 6}deg) scale(${1 - 0.25 * fly})` }}>
                  <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#2a2f38" }}>
                    <Face id="rl-snap" x={62} y={74} size={150} smile={0.85} rim={0} />
                  </div>
                </div>
              )}
              <div style={{ position: "absolute", left: PX - 160, width: 320, top: 250, textAlign: "center", fontSize: 30, fontWeight: 900, color: look.key, opacity: kept, textShadow: `0 0 16px ${look.keyGlow}` }}>被记住</div>
            </div>
          )}
        </div>
      )}
      {/* 2 · the screen's face has none of it */}
      {frame >= c2 - 6 && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - out }}>
          <Phone x={760} y={440} w={300} h={600} glow={0.8}>
            <Face id="rl-statue" x={140} y={270} size={360} smooth={1} bright={1} slim={1} eyes={1} statue={1} rim={0} />
          </Phone>
          {NOTHING.map((n, i) => {
            const p = ramp(frame, c2 + (1.5 + i) * BEAT, 5);
            return (
              <div key={n} style={{ position: "absolute", left: 1020, top: 290 + i * 100, display: "flex", alignItems: "baseline", gap: 26, opacity: ramp(frame, c2 + 4, 8) }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: palette.dim, width: 100 }}>{n}</span>
                <span style={{ fontFamily: fonts.mono, fontSize: 30, color: palette.faint }}>·</span>
                <span style={{ fontSize: 48, fontWeight: 900, color: look.key, opacity: p, display: "inline-block", transform: `scale(${1.6 - 0.6 * p})`, textShadow: `0 0 16px ${look.keyGlow}` }}>无</span>
              </div>
            );
          })}
        </div>
      )}
      <Sfx name="glint" at={BEAT} volume={0.25} />
      <Sfx name="glint" at={3 * BEAT} volume={0.25} />
      <Sfx name="glint" at={5 * BEAT} volume={0.25} />
      <Sfx name="glint" at={6.5 * BEAT} volume={0.25} />
      <Sfx name="rise" at={c1 + HALF_BEAT} volume={0.25} />
      <Sfx name="whoosh" at={c1 + 6 * BEAT} volume={0.3} />
      <Sfx name="shutter" at={c1 + 6 * BEAT} volume={0.35} />
      <Sfx name="whoosh" at={c2 - 4} volume={0.3} />
      {NOTHING.map((_, i) => (
        <Sfx key={i} name="stamp" at={c2 + (1.5 + i) * BEAT} volume={0.4} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
