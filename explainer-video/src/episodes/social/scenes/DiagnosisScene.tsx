import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { KineticText } from "../../../components/Kinetic";
import { Stander } from "../../doubt/circles";
import { Cone, Lamp } from "../lights";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FACTS = ["THOMAS GILOVICH", "托马斯 · 吉洛维奇", "1954— · 美国心理学家 · 康奈尔大学", "THE SPOTLIGHT EFFECT · 2000"];

// 0 · a dossier: Gilovich (a figure under a little lamp in the frame), the
//     2000 paper — then the term itself, stamped: 聚光灯效应.
// 1 · the line as a card, and under it two bars, growing on the beat: how much
//     attention you think you get (high) against how much you get (low).
export const DiagnosisScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const file = useRamp(0, 10);
  const word = useRamp(5 * BEAT, 8);
  const card = useRamp(cues[1], 8);
  const t1 = frame - cues[1];
  const think = interpolate(frame, [cues[1] + 3 * BEAT, cues[1] + 5 * BEAT], [0, 0.92], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const real = interpolate(frame, [cues[1] + 6 * BEAT, cues[1] + 7 * BEAT], [0, 0.24], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const bar = (label: string, v: number, color: string, y: number, tag: string) => (
    <div style={{ position: "absolute", left: 420, top: y, width: 1080 }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: palette.ink, marginBottom: 12 }}>{label}</div>
      <div style={{ position: "relative", height: 34, borderRadius: 6, background: "rgba(232,238,242,0.08)", border: `1px solid ${palette.faint}` }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${v * 100}%`, borderRadius: 6, background: color, boxShadow: `0 0 18px ${color}` }} />
        <div style={{ position: "absolute", left: `calc(${v * 100}% + 16px)`, top: 0, fontFamily: fonts.mono, fontSize: 26, color, opacity: v > 0.02 ? 1 : 0 }}>{tag}</div>
      </div>
    </div>
  );
  return (
    <ObsFrame duration={duration}>
      {card < 1 && (
        <div style={{ position: "absolute", inset: 0, opacity: file * (1 - card), transform: `translateY(${-card * 40}px)` }}>
          <div style={{ position: "absolute", left: 470, top: 200, width: 300, height: 360, borderRadius: 12, background: "rgba(14,20,28,0.9)", border: `2px solid rgba(${palette.halo},0.55)`, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: -470, top: -200, width: 1920, height: 1080 }}>
              <Cone id="dg" x={620} y={210} aimX={620} floor={540} spread={70} on={0.8} />
              <Lamp x={620} y={210} floor={540} size={0.7} />
              <Stander x={620} bottom={540} height={200} lift={1.2} glow={0.9} />
            </div>
          </div>
          {FACTS.map((f, i) => {
            const p = interpolate(frame, [(i + 1) * BEAT * 0.75, (i + 1) * BEAT * 0.75 + 8], [0, 1], clamp);
            const name = i === 1;
            return (
              <div key={f} style={{ position: "absolute", left: 860, top: [230, 276, 380, 440][i], opacity: p, transform: `translateX(${(1 - p) * 30}px)`, fontFamily: name ? undefined : fonts.mono, fontSize: name ? 68 : 22, fontWeight: name ? 900 : 400, letterSpacing: name ? 6 : 4, color: i === 3 ? `rgb(${palette.halo})` : name ? palette.ink : palette.dim, padding: i === 3 ? "8px 16px" : 0, border: i === 3 ? `1px solid rgba(${palette.halo},0.6)` : undefined, whiteSpace: "nowrap" }}>
                {f}
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 860, top: 520, opacity: word, transform: `scale(${1.4 - 0.4 * word})`, transformOrigin: "0 50%", display: "flex", alignItems: "baseline", gap: 22 }}>
            <span style={{ fontSize: 76, fontWeight: 900, letterSpacing: 8, color: look.key, textShadow: `0 0 26px ${look.keyGlow}` }}>聚光灯效应</span>
            <span style={{ fontFamily: fonts.mono, fontSize: 22, letterSpacing: 5, color: palette.dim }}>SPOTLIGHT EFFECT</span>
          </div>
        </div>
      )}
      {t1 >= 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: card }}>
          <Halo x={960} y={260} r={500} intensity={0.3} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 136, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 5, color: palette.dim }}>THE SPOTLIGHT EFFECT · GILOVICH, 2000</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 190, textAlign: "center", fontSize: 72, fontWeight: 900, letterSpacing: 6 }}>
            <KineticText text="我们总是【【高估】】" t={t1} look={look} beat={BEAT} seed="d0" />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontSize: 56, fontWeight: 800, letterSpacing: 4, color: palette.dim }}>
            <KineticText text="别人对自己的关注。" t={t1 - BEAT} look={look} beat={BEAT} seed="d1" />
          </div>
          {bar("你以为的关注", think, palette.alert, 470, "高")}
          {bar("实际上的关注", real, palette.accent, 620, "低")}
        </div>
      )}
      <Sfx name="whoosh" at={0} volume={0.3} />
      {FACTS.map((_, i) => (
        <Sfx key={i} name="shutter" at={Math.round((i + 1) * BEAT * 0.75)} volume={0.14} />
      ))}
      <Sfx name="stamp" at={5 * BEAT} volume={0.55} />
      <Sfx name="stamp" at={cues[1]} volume={0.4} />
      <Sfx name="rise" at={cues[1] + 3 * BEAT} volume={0.3} />
      <Sfx name="glitch" at={cues[1] + 6 * BEAT} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[1]} />
    </ObsFrame>
  );
};
