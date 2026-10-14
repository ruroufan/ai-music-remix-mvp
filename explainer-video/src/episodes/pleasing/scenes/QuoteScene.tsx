import React from "react";
import { ObsFrame } from "../ObsFrame";
import { Halo } from "../parts";
import { fonts, palette } from "../look";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const FLOOR = 800;

// Three empty armchairs.
const Chair: React.FC<{ x: number; s?: number }> = ({ x, s = 1 }) => (
  <svg width={180 * s} height={200 * s} viewBox="0 0 180 200" style={{ position: "absolute", left: x - 90 * s, top: FLOOR - 200 * s }}>
    <path d="M30 20 Q90 0 150 20 L150 120 L30 120 Z" fill="#090c12" stroke={`rgba(${palette.halo},0.45)`} strokeWidth="2" />
    <rect x="10" y="90" width="160" height="50" rx="14" fill="#0b0f16" stroke={`rgba(${palette.halo},0.35)`} strokeWidth="2" />
    <rect x="20" y="140" width="10" height="60" fill="#090c12" />
    <rect x="150" y="140" width="10" height="60" fill="#090c12" />
  </svg>
);

// Sartre's closed room (Huis clos): three chairs, a door with light behind it,
// and a frame on the wall where a mirror should be — there are none.
export const QuoteScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const room = useRamp(0, BEAT);
  const quote = useRamp(cues[1], 10);
  const door = 0.6 + quote * 0.6;

  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: room }}>
        {/* back wall + floor */}
        <div style={{ position: "absolute", left: 260, top: 200, width: 1400, height: FLOOR - 200, background: "linear-gradient(#0d131d, #0a0e15)", border: `1px solid ${palette.faint}` }} />
        <div style={{ position: "absolute", left: 0, top: FLOOR, width: 1920, height: 1080 - FLOOR, background: "linear-gradient(#0d131d, #06080c)" }} />
        {/* the door, lit from behind */}
        <Halo x={1340} y={520} r={330} intensity={door} />
        <div style={{ position: "absolute", left: 1260, top: 330, width: 160, height: FLOOR - 330, background: "#05070a", boxShadow: `0 0 0 3px rgba(${palette.halo},${0.5 * door}), 0 0 40px rgba(${palette.halo},${0.4 * door})` }} />
        {/* the missing mirror */}
        <div style={{ position: "absolute", left: 560, top: 300, width: 150, height: 200, border: `2px dashed ${palette.faint}`, borderRadius: 75 }} />
        <div style={{ position: "absolute", left: 560, top: 510, width: 150, textAlign: "center", fontFamily: fonts.mono, fontSize: 14, letterSpacing: 2, color: palette.dim }}>NO MIRROR</div>
        <Chair x={600} />
        <Chair x={900} />
        <Chair x={1160} s={0.9} />
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 160, textAlign: "center", opacity: quote, transform: `scale(${1.08 - quote * 0.08})` }}>
        <div style={{ fontSize: 110, fontWeight: 900, letterSpacing: 24, textShadow: `0 0 40px rgba(${palette.halo},0.45)` }}>他人即地狱。</div>
        <div style={{ fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim, marginTop: 16 }}>
          JEAN-PAUL SARTRE · 《禁闭》HUIS CLOS · 1944
        </div>
      </div>

      <Sfx name="whoosh" at={0} volume={0.3} />
      <Sfx name="stamp" at={cues[1]} volume={0.7} />

      <Subtitles lines={lines} cues={cues} duration={duration} hide={[1]} />
    </ObsFrame>
  );
};
