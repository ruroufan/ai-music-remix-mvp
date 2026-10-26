import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { CALM, GREY, Inner, WARM } from "../ring";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// Adam Smith's impartial spectator.
// 0 · in close: inside his chest, a small figure sitting quietly in a chair,
//     watching — 公正的旁观者.
// 1 · two halves. Left: the crowd claps — 称赞 → 开心, a quick flash. Right:
//     the small figure, after a beat, nods — 我配得上 → 安心, a steady glow.
// 2 · two words, side by side: 被爱 ≠ 值得被爱.
export const SmithScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : 2;
  const clap = frame >= c1 && frame < c1 + 3 * BEAT ? Math.abs(Math.sin((frame - c1) * 0.6)) : 0;
  const nodAt = c1 + 6 * BEAT;
  const nod = frame > nodAt && frame < nodAt + 20 ? Math.sin(((frame - nodAt) / 20) * Math.PI) : 0;
  const calm = ramp(frame, nodAt, 20);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} whips={[c1, c2]} hits={[c1 + BEAT, nodAt + 10, c2 + 3 * BEAT, ...keyHits(lines, cues, duration)]}>
        {seg === 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 460, top: 140, width: 1000, height: 760, borderRadius: 400, border: `3px solid rgba(${WARM},0.35)`, background: "radial-gradient(circle, rgba(40,30,26,0.6), rgba(10,10,12,0.9))" }} />
            <Inner x={1000} y={760} scale={1.7} glow={0.8} nod={frame > 4 * BEAT && frame < 4 * BEAT + 20 ? Math.sin(((frame - 4 * BEAT) / 20) * Math.PI) : 0} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", fontSize: 52, fontWeight: 900, letterSpacing: 10, color: `rgb(${CALM})`, opacity: ramp(frame, 2 * BEAT, 10) }}>公正的旁观者</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.dim, opacity: ramp(frame, 3 * BEAT, 10) }}>THE IMPARTIAL SPECTATOR · 住在心里</div>
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            {[200, 330, 460, 590, 720].map((x, i) => <Stander key={x} x={x} bottom={860} height={200 + (i % 2) * 20} lift={1.5 * clap} glow={0.2 + 0.5 * clap} rgb={GREY} />)}
            <div style={{ position: "absolute", left: 200, top: 280, fontSize: 44, fontWeight: 900, color: palette.ink, opacity: ramp(frame, c1 + BEAT, 6) * (1 - 0.6 * calm) }}>称赞 → 开心</div>
            <div style={{ position: "absolute", left: 958, top: 140, width: 4, height: 760, background: "rgba(232,238,242,0.2)" }} />
            <Inner x={1420} y={820} scale={1.3} glow={0.3 + 0.6 * calm} nod={nod} />
            <div style={{ position: "absolute", left: 1100, top: 280, fontSize: 44, fontWeight: 900, color: `rgb(${CALM})`, opacity: calm }}>我配得上 → 安心</div>
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 60 }}>
            <div style={{ fontSize: 110, fontWeight: 900, color: palette.dim, opacity: ramp(frame, c2 + 4, 8) }}>被爱</div>
            <div style={{ fontSize: 110, fontWeight: 900, color: "rgb(255,110,110)", opacity: ramp(frame, c2 + 3 * BEAT, 6), transform: `scale(${1.5 - 0.5 * ramp(frame, c2 + 3 * BEAT, 6)})` }}>≠</div>
            <div style={{ fontSize: 110, fontWeight: 900, color: `rgb(${WARM})`, textShadow: `0 0 30px rgba(${WARM},0.6)`, opacity: ramp(frame, c2 + BEAT, 8) }}>值得被爱</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={CALM} opacity={0.35} />
      <Sfx name="rise" at={0} volume={0.25} />
      <Sfx name="glint" at={4 * BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.45} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Sfx key={i} name="stamp" at={c1 + BEAT + i * 5} volume={0.15} />
      ))}
      <Sfx name="glint" at={nodAt + 10} volume={0.45} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.45} />
      <Sfx name="boom" at={c2 + 3 * BEAT} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
