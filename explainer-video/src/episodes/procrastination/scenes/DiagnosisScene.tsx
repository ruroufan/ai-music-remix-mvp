import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// 0 · a scroll unrolls: the Latin of De Brevitate Vitae.
// 1 · the line as a quote card; under it two pages — 明天 lit up, 今天 going dark.
export const DiagnosisScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const unroll = interpolate(frame, [0, 3 * BEAT], [0, 1], { extrapolateRight: "clamp", easing: (t) => 1 - (1 - t) ** 3 });
  const card = useRamp(cues[1], 10);
  const dim = interpolate(frame, [cues[1] + 3 * BEAT, cues[1] + 6 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const page = (x: number, word: string, color: string, o: number, glow: number) => (
    <div style={{ position: "absolute", left: x, top: 560, width: 180, height: 200, background: "#ece8e0", opacity: o, boxShadow: glow ? `0 0 ${40 * glow}px rgba(${palette.halo},${0.7 * glow})` : "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, fontWeight: 900, color }}>{word}</div>
  );
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - card }}>
        <Halo x={960} y={460} r={440} intensity={0.55} />
        <div style={{ position: "absolute", left: 960 - 360 * unroll, top: 300, width: 720 * unroll, height: 300, overflow: "hidden", background: "linear-gradient(#d8c8a4, #bfa978)", boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }}>
          <div style={{ position: "absolute", left: 360 * unroll - 360, top: 0, width: 720, height: 300, padding: "56px 60px", boxSizing: "border-box", fontFamily: "Georgia, serif", color: "#3b2c16", fontSize: 30, letterSpacing: 3, lineHeight: 1.6, textAlign: "center" }}>
            MAXIMVM VIVENDI IMPEDIMENTVM EST EXSPECTATIO, QVAE PENDET EX CRASTINO, PERDIT HODIERNVM.
          </div>
        </div>
        {[-1, 1].map((d) => (
          <div key={d} style={{ position: "absolute", left: 960 + d * 360 * unroll - 18, top: 286, width: 36, height: 328, borderRadius: 18, background: "linear-gradient(90deg, #6b4a26, #a47a44, #6b4a26)" }} />
        ))}
        <div style={{ position: "absolute", left: 0, right: 0, top: 210, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 6, color: palette.dim }}>SENECA · c.4 BC — AD 65 · DE BREVITATE VITAE</div>
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: card }}>
        <Halo x={960} y={340} r={460} intensity={0.4} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 190, textAlign: "center", fontSize: 62, fontWeight: 900, letterSpacing: 4, lineHeight: 1.55 }}>
          <div>生活最大的障碍是期待，</div>
          <div>
            它寄望于<span style={{ color: `rgb(${palette.halo})` }}>明天</span>，却失去了<span style={{ color: palette.alert }}>今天</span>。
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center", fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim }}>SENECA ·《论生命之短暂》DE BREVITATE VITAE</div>
        {page(720, "明天", "#b2283e", 1, 1 - dim * 0.2)}
        {page(1020, "今天", "#0f8f84", 1 - dim * 0.85, 0)}
      </div>
      <Sfx name="whoosh" at={0} volume={0.35} />
      <Sfx name="stamp" at={cues[1]} volume={0.65} />
      <Sfx name="glitch" at={cues[1] + 3 * BEAT} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[1]} />
    </ObsFrame>
  );
};
