import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// 0 · the 1844 manuscripts: yellowed pages of dense handwriting.
// 1 · the line as a quote card; under it, a day split in two: inside work —
//     not at home; outside it — at home.
export const DiagnosisScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const pages = useRamp(0, 10);
  const card = useRamp(cues[1], 10);
  const split = interpolate(frame, [cues[1] + 3 * BEAT, cues[1] + 5 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: pages * (1 - card) }}>
        <Halo x={960} y={480} r={440} intensity={0.55} />
        {[-1, 0, 1].map((d) => (
          <div key={d} style={{ position: "absolute", left: 960 - 170 + d * 120, top: 250 + Math.abs(d) * 20, width: 340, height: 460, transform: `rotate(${d * 6}deg)`, background: "linear-gradient(#e2d6b8, #c8b78f)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", padding: 30, boxSizing: "border-box" }}>
            {Array.from({ length: 14 }, (_, i) => (
              <svg key={i} width={280} height={24} style={{ display: "block", marginTop: 4 }}>
                <path d={`M0 14 ${Array.from({ length: 18 }, (_, k) => `q 7 ${((k + i + d) % 3) - 1 > 0 ? -8 : 6} 15 0`).join(" ")}`} fill="none" stroke="rgba(60,40,20,0.55)" strokeWidth={1.4} />
              </svg>
            ))}
          </div>
        ))}
        <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 6, color: palette.dim }}>KARL MARX · 1818—1883 · ÖKONOMISCH-PHILOSOPHISCHE MANUSKRIPTE · 1844</div>
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: card }}>
        <Halo x={960} y={330} r={460} intensity={0.4} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 180, textAlign: "center", fontSize: 60, fontWeight: 900, letterSpacing: 4, lineHeight: 1.55 }}>
          <div>劳动者只有在劳动之<span style={{ color: `rgb(${palette.halo})` }}>外</span>才感到自在，</div>
          <div>而在劳动之<span style={{ color: palette.alert }}>中</span>则感到不自在。</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 390, textAlign: "center", fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim }}>KARL MARX ·《1844年经济学哲学手稿》</div>
        <div style={{ position: "absolute", left: 460, top: 520, width: 1000, height: 80, display: "flex", opacity: split }}>
          <div style={{ flex: 10, background: "#3a4456", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700 }}>劳动之中 · 不自在</div>
          <div style={{ flex: 4, background: `rgba(${palette.halo},0.85)`, color: "#1a1208", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700 }}>之外 · 自在</div>
        </div>
      </div>
      <Sfx name="whoosh" at={0} volume={0.3} />
      <Sfx name="stamp" at={cues[1]} volume={0.65} />
      <Sfx name="glint" at={cues[1] + 3 * BEAT} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[1]} />
    </ObsFrame>
  );
};
