import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox, Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { ALERT, GLOW } from "../screens";
import { Bokeh, Cam } from "../../glass/immersive";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const CHAIN = ["看得越多", "知道得越多", "越不会落后"];
const rampAt = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

const Node: React.FC<{ x: number; y: number; w: number; p: number; children: React.ReactNode; color?: string; border?: string; style?: React.CSSProperties }> = ({ x, y, w, p, children, color = palette.ink, border = palette.faint, style }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: y - 50, width: w, height: 100, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${border}`, borderRadius: 14, background: "rgba(10,14,20,0.88)", fontSize: 50, fontWeight: 900, letterSpacing: 4, color, opacity: p, transform: `scale(${0.85 + 0.15 * p})`, ...style }}>
    {children}
  </div>
);

// 0 · 「信息焦虑」 in the viewfinder, flipped over on the beat.
// 1 · what we usually think, a chain: 看得越多 → 知道得越多 → 越不会落后 — and
//     then the chain cracks apart.
// 2 · the tabs piling up, 12 → 87, and next to them a heartbeat getting
//     faster: ♥ 72 → 146 — 反而越慌.
export const MisreadScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const card = useRamp(0, 8);
  const flip = interpolate(frame, [4 * BEAT, 4 * BEAT + 10], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const cardOut = useRamp(c1 - 4, 6);
  const left = useRamp(c1, 8);
  const out1 = useRamp(c2 - 4, 6);
  const busy = useRamp(c2, 8);
  const want = useRamp(c2 + 2 * BEAT, 10);
  const crack = interpolate(frame, [c2 - 2 * BEAT, c2 - 2 * BEAT + 8], [0, 1], { ...clamp, easing: (t) => t * t });
  const tabs = Math.round(interpolate(frame, [c2, duration], [12, 87], clamp));
  const bpm = Math.round(interpolate(frame, [c2 + 2 * BEAT, duration], [72, 146], clamp));
  // a heartbeat trace that speeds up left to right
  const ecg = Array.from({ length: 190 }, (_, i) => {
    const x = i * 4;
    const ph = (i / 190) * (6 + 10 * (i / 190)) + frame / 20;
    const f = ph % 1;
    const y = f > 0.45 && f < 0.5 ? -90 : f >= 0.5 && f < 0.55 ? 60 : f > 0.6 && f < 0.7 ? -15 : 0;
    return `${x},${130 + y * Math.min(1, (frame - c2 - 2 * BEAT) / 20)}`;
  }).join(" ");
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.08]} hits={[4 * BEAT, c2 - 2 * BEAT, c2 + 2 * BEAT]} whips={[c1, c2]}>
        {cardOut < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: card * (1 - cardOut) }}>
            <Halo x={960} y={400} r={420} intensity={0.45} />
            <div style={{ position: "absolute", left: 960 - 330, top: 290, width: 660, height: 220, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid rgba(${palette.halo},0.6)`, borderRadius: 18, background: "rgba(12,16,22,0.9)", fontSize: 100, fontWeight: 900, letterSpacing: 16, paddingLeft: 16, transform: `rotate(${flip * 180}deg)` }}>信息焦虑</div>
            <FocusBox x={960} y={400} w={760} h={300} progress={interpolate(frame, [6, 16], [0, 1], clamp)} label="认知 · COGNITION" />
            <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.alert, opacity: flip }}>颠 覆</div>
          </div>
        )}
        {frame >= c1 && out1 < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: 1 - out1 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim, opacity: left }}>我们通常以为</div>
            {CHAIN.map((c, i) => {
              const p = rampAt(frame, c1 + i * BEAT);
              const x = 420 + i * 540;
              return (
                <React.Fragment key={c}>
                  <Node x={x} y={400} w={360} p={p} style={{ transform: `translateY(${crack * (i % 2 ? 30 : -20)}px) rotate(${crack * (i - 1) * 6}deg) scale(${0.85 + 0.15 * p})`, opacity: p * (1 - 0.6 * crack) }}>{c}</Node>
                  {i < 2 && <div style={{ position: "absolute", left: x + 190, width: 160, top: 370, textAlign: "center", fontSize: 44, color: palette.accent, opacity: rampAt(frame, c1 + i * BEAT + 8) * (1 - crack) }}>→</div>}
                </React.Fragment>
              );
            })}
          </div>
        )}
        {frame >= c2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 260, top: 210, width: 520, opacity: busy }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: palette.dim }}>看得越多</div>
              <div style={{ fontFamily: fonts.mono, fontSize: 90, fontWeight: 700, color: palette.ink }}>{tabs}<span style={{ fontSize: 30, color: palette.dim }}> 个页面</span></div>
              {/* the tabs, piling up */}
              <div style={{ position: "relative", height: 260 }}>
                {Array.from({ length: Math.min(14, Math.floor(tabs / 6)) }, (_, k) => (
                  <div key={k} style={{ position: "absolute", left: k * 18, top: 20 + k * 14, width: 300, height: 140, borderRadius: 8, background: "rgba(8,16,26,0.95)", border: `2px solid rgba(${GLOW},${0.3 + 0.04 * k})` }} />
                ))}
              </div>
            </div>
            <div style={{ position: "absolute", left: 900, top: 210, width: 760, opacity: want }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: palette.dim }}>
                <span>反而越慌</span>
                <span style={{ color: `rgb(${ALERT})`, fontSize: 40 }}>♥ {bpm}</span>
              </div>
              <svg width={760} height={260} style={{ marginTop: 20 }}>
                <polyline points={ecg} fill="none" stroke={`rgb(${ALERT})`} strokeWidth={4} strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 8px rgba(${ALERT},0.8))` }} />
              </svg>
            </div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} />
      <Sfx name="shutter" at={6} volume={0.2} />
      <Sfx name="whoosh" at={4 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.4} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.4} />
      {CHAIN.map((_, i) => (
        <Sfx key={i} name="stamp" at={c1 + i * BEAT} volume={0.25} />
      ))}
      <Sfx name="shatter" at={c2 - 2 * BEAT} volume={0.4} />
      <Sfx name="boom" at={c2 + 2 * BEAT} volume={0.45} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
