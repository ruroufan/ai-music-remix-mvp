import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Halo } from "../../../channels/backlit/parts";
import { Bokeh, Cam } from "../../glass/immersive";
import { FLOOR, Treadmill } from "../treadmill";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SPOTS = [
  [380, 230], [1420, 200], [520, 420], [1300, 400], [260, 580], [1560, 560], [700, 160], [1120, 150], [420, 760], [1480, 760],
];

// 0 · the treadmill flat out, and all round him one bubble per half beat:
//     还不够 · 还不够 · 还不够…; the battery runs down.
// 1 · 0% — the screen still says 你可以, but he stops running, the belt
//     carries him off the back and he sinks to the floor; the bubbles go out.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const drop = c1 + 2 * BEAT;
  const speedAt = (f: number) => interpolate(f, [0, drop], [0.95, 1], clamp);
  const battery = interpolate(frame, [0, drop], [18, 0], clamp);
  const fall = interpolate(frame, [drop, drop + 20], [0, 1], { ...clamp, easing: (t) => t * t });
  const n = Math.max(0, Math.min(SPOTS.length, Math.floor((frame - BEAT) / HALF_BEAT) + 1));
  const fade = interpolate(frame, [drop, drop + 2 * BEAT], [1, 0.15], clamp);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.05, 1.15]} focus={{ x: 900, y: 560 }} hits={[drop]}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - fall }}>
          <Treadmill cx={900} frame={frame} speedAt={speedAt} lift={0.3} lash={frame < drop ? ((frame % BEAT) / BEAT) : -1} />
        </div>
        {fall > 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Halo x={500} y={FLOOR - 20} r={260} intensity={0.45 * fall} />
            <Treadmill cx={900} frame={frame} speedAt={(f) => interpolate(f, [drop, drop + 3 * BEAT], [1, 0.6], clamp)} run={false} />
            {/* he's slid off the back and down onto the floor */}
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <g opacity={fall} transform={`translate(${520 - 40 * fall} ${FLOOR + 6})`}>
                <ellipse cx={0} cy={0} rx={140} ry={16} fill="rgba(0,0,0,0.6)" />
                <path d="M-120 -8 Q-60 -40 0 -26 Q50 -16 90 -30" stroke={`rgba(${palette.halo},0.85)`} strokeWidth={34} strokeLinecap="round" fill="none" style={{ filter: `drop-shadow(0 0 14px rgba(${palette.halo},0.7))` }} />
                <path d="M-120 -8 Q-60 -40 0 -26 Q50 -16 90 -30" stroke="#030405" strokeWidth={30} strokeLinecap="round" fill="none" />
                <circle cx={114} cy={-40} r={23} fill="#030405" stroke={`rgba(${palette.halo},0.85)`} strokeWidth={2.5} style={{ filter: `drop-shadow(0 0 10px rgba(${palette.halo},0.7))` }} />
              </g>
            </svg>
          </div>
        )}
        {SPOTS.slice(0, n).map(([x, y], i) => {
          const pop = interpolate(frame, [BEAT + i * HALF_BEAT, BEAT + i * HALF_BEAT + 5], [0.6, 1], clamp);
          return (
            <div key={i} style={{ position: "absolute", left: x - 110, top: y - 40, width: 220, padding: "14px 0", textAlign: "center", borderRadius: 40, background: "rgba(40,10,16,0.85)", border: `2px solid rgba(255,77,109,${0.8 * fade})`, fontSize: 38, fontWeight: 900, color: palette.alert, opacity: fade, transform: `scale(${pop}) rotate(${(i % 2 ? 1 : -1) * 4}deg)` }}>还不够</div>
          );
        })}
        <div style={{ position: "absolute", left: 860, top: 150, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative", width: 90, height: 40, border: `3px solid ${battery < 1 ? palette.alert : palette.ink}`, borderRadius: 6 }}>
            <div style={{ position: "absolute", left: 3, top: 3, bottom: 3, width: `${battery * 0.8}px`, background: palette.alert }} />
          </div>
          <span style={{ fontFamily: fonts.mono, fontSize: 30, color: palette.alert, opacity: battery < 1 ? (Math.floor(frame / 6) % 2 ? 1 : 0.3) : 1 }}>{Math.round(battery)}%</span>
        </div>
      </Cam>
      <Bokeh frame={frame} opacity={1 - 0.6 * fall} />
      {SPOTS.map((_, i) => (
        <Sfx key={i} name="stamp" at={BEAT + i * HALF_BEAT} volume={0.14 + 0.02 * i} />
      ))}
      <Sfx name="boom" at={drop} volume={0.5} />
      <Sfx name="glitch" at={drop + 4} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
