import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

// Line 0: the book, and a lens — Spinoza ground lenses for a living.
// Line 1: the diagnosis as a quote, two overlapping circles behind it: twice.
export const DiagnosisScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const book = useRamp(0, 10);
  const lens = interpolate(frame, [BEAT, cues[1]], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const quote = useRamp(cues[1], 10);
  const second = useRamp(cues[1] + 2 * BEAT, BEAT);

  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: book * (1 - quote) }}>
        <Halo x={960} y={520} r={420} intensity={0.6} />
        {/* the open book */}
        <div style={{ position: "absolute", left: 960 - 380, top: 300, width: 760, height: 420, transform: "perspective(1200px) rotateX(28deg)" }}>
          {[0, 1].map((side) => (
            <div key={side} style={{ position: "absolute", left: side * 380, top: 0, width: 380, height: 420, background: "linear-gradient(#e9e6df, #cfcac0)", borderRadius: side ? "0 8px 8px 0" : "8px 0 0 8px", padding: 40, boxSizing: "border-box", color: "#1a1714" }}>
              {side === 0 ? (
                <div style={{ fontFamily: "Georgia, serif", fontSize: 40, letterSpacing: 6, textAlign: "center", marginTop: 90 }}>
                  ETHICA
                  <div style={{ fontSize: 16, letterSpacing: 3, marginTop: 16, opacity: 0.6 }}>ORDINE GEOMETRICO DEMONSTRATA</div>
                </div>
              ) : (
                Array.from({ length: 9 }, (_, i) => <div key={i} style={{ height: 8, borderRadius: 4, background: "rgba(26,23,20,0.22)", marginTop: i ? 20 : 30, width: `${92 - (i % 3) * 12}%` }} />)
              )}
            </div>
          ))}
        </div>
        {/* a lens sliding over the page, light focusing through it */}
        <div style={{ position: "absolute", left: 1100 - lens * 160, top: 380, width: 170, height: 170, borderRadius: "50%", border: `3px solid rgba(${palette.accentRgb},0.8)`, background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.35), rgba(160,200,220,0.08) 60%)", boxShadow: `0 0 30px rgba(${palette.accentRgb},0.3)` }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 220, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 6, color: palette.dim }}>SPINOZA · LENS GRINDER · 1632—1677</div>
      </div>

      <div style={{ position: "absolute", inset: 0, opacity: quote }}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <circle cx={880} cy={470} r={220} fill="none" stroke={`rgba(${palette.halo},0.35)`} strokeWidth={2} />
          <circle cx={880 + second * 160} cy={470} r={220} fill="none" stroke={`rgba(255,77,109,${0.45 * second})`} strokeWidth={2} />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center", transform: `scale(${1.08 - quote * 0.08})` }}>
          <div style={{ fontSize: 96, fontWeight: 900, letterSpacing: 14, textShadow: `0 0 40px rgba(${palette.halo},0.45)` }}>
            后悔的人，是<span style={{ color: palette.accent }}>双重</span>的不幸。
          </div>
          <div style={{ fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim, marginTop: 18 }}>BARUCH SPINOZA · 1632—1677 ·《伦理学》ETHICA</div>
        </div>
      </div>

      <Sfx name="glint" at={BEAT} volume={0.3} />
      <Sfx name="stamp" at={cues[1]} volume={0.7} />
      <Sfx name="stamp" at={cues[1] + 2 * BEAT} volume={0.45} />

      <Subtitles lines={lines} cues={cues} duration={duration} hide={[1]} />
    </ObsFrame>
  );
};
