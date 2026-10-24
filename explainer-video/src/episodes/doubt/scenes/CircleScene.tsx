import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { keyLandsAt } from "../../../components/Kinetic";
import { KnowledgeCircle, LightPool, Stander } from "../circles";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const RS = [80, 150, 230];
const STEPS = [0, 3, 6]; // beats

// 0 · knowledge as a circle, seen from above: lit inside (已知), question marks
//     all along the outside. It widens in two steps, on the beat — and its
//     boundary counts up with it: ×1, ×2, ×3. When 未知边界 lands, and on
//     each step, the rim flares gold.
// 1 · the circle drops to the floor and becomes a pool of light: a small one,
//     a man standing in it chin-up — 笃定 100%.
// 2 · beside it, a big one, question marks all round its long rim, a man
//     standing in it looking down — 谦卑, 不安 ↑.
export const CircleScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const step = STEPS.filter((b) => frame >= b * BEAT).length - 1;
  const since = frame - STEPS[Math.max(0, step)] * BEAT;
  const prev = RS[Math.max(0, step - 1)];
  const grow = useRamp(0, 10);
  const r = step <= 0 ? RS[0] * grow : prev + (RS[step] - prev) * (1 - Math.exp(-since / 3));
  const keyAt = keyLandsAt(lines[0].text, BEAT);
  // the rim flares gold when 未知边界 lands, and again on every step
  const flare = Math.max(...[keyAt, ...STEPS.slice(1).map((b) => b * BEAT)].map((t) => (frame >= t ? Math.exp(-(frame - t) / 20) : 0)));
  const drop = interpolate(frame, [cues[1] - 8, cues[1] + 6], [0, 1], { ...clamp, easing: (t) => t * t });
  const small = useRamp(cues[1], 12);
  const sure = useRamp(cues[1] + 4 * BEAT, 8);
  const big = useRamp(cues[2], 14);
  const qs = interpolate(frame, [cues[2], cues[2] + 4 * BEAT], [0.2, 1], clamp);
  const humble = useRamp(cues[2] + 4 * BEAT, 8);
  const keyAt2 = cues[2] + keyLandsAt(lines[2].text, BEAT);
  const uneasy = useRamp(keyAt2, 8);
  return (
    <ObsFrame duration={duration}>
      {drop < 1 && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - drop, transform: `translateY(${drop * 220}px) scale(${1 + drop * 0.6}, ${1 - drop * 0.74})`, transformOrigin: "960px 440px" }}>
          <KnowledgeCircle cx={960} cy={440} r={Math.max(1, r)} frame={frame} />
          {flare > 0.02 && (
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <circle cx={960} cy={440} r={r} fill="none" stroke={look.key} strokeWidth={4 + 8 * flare} opacity={flare} style={{ filter: `drop-shadow(0 0 ${18 * flare}px ${look.key})` }} />
            </svg>
          )}
          <div style={{ position: "absolute", left: 1400, top: 300, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 5, color: palette.dim }}>边界 · BOUNDARY</div>
          <div style={{ position: "absolute", left: 1400, top: 336, fontFamily: fonts.mono, fontSize: 84, fontWeight: 700, color: flare > 0.05 ? look.key : palette.ink, textShadow: flare > 0.05 ? `0 0 20px ${look.keyGlow}` : undefined, transform: `scale(${1 + 0.25 * Math.exp(-since / 4)})`, transformOrigin: "0 50%" }}>
            ×{Math.max(1, step + 1)}
          </div>
          <div style={{ position: "absolute", left: 300, top: 420, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 5, color: palette.dim }}>
            未知 · UNKNOWN
          </div>
        </div>
      )}
      {frame >= cues[1] - 8 && (
        <div style={{ position: "absolute", inset: 0 }}>
          <div style={{ position: "absolute", inset: 0, opacity: small * (1 - 0.35 * big) }}>
            <LightPool cx={440} rx={140} frame={frame} density={0.5} seed="cs" />
            <Stander x={440} height={220} lift={2} glow={0.9} />
            <div style={{ position: "absolute", left: 440 - 160, width: 320, top: 300, textAlign: "center", opacity: sure, transform: `scale(${1.3 - 0.3 * sure})` }}>
              <span style={{ fontSize: 40, fontWeight: 900, color: palette.accent, textShadow: `0 0 14px ${palette.accent}` }}>笃定</span>
              <span style={{ fontFamily: fonts.mono, fontSize: 34, marginLeft: 12, color: palette.ink }}>100%</span>
            </div>
            <div style={{ position: "absolute", left: 440 - 160, width: 320, top: 250, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 4, color: palette.dim, opacity: small }}>懂得少 · 世界很小</div>
          </div>
          <div style={{ position: "absolute", inset: 0, opacity: big }}>
            <LightPool cx={1240} rx={440} frame={frame} qs={qs} seed="cb" />
            <Stander x={1240} height={220} lift={0.1} glow={0.9} />
            <div style={{ position: "absolute", left: 1240 - 220, width: 440, top: 250, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 4, color: palette.dim }}>懂得多 · 未知更多</div>
            <div style={{ position: "absolute", left: 1240 - 220, width: 440, top: 290, textAlign: "center", whiteSpace: "nowrap" }}>
              <span style={{ fontSize: 40, fontWeight: 900, color: palette.ink, opacity: humble }}>谦卑</span>
              <span style={{ fontSize: 40, fontWeight: 900, color: look.key, marginLeft: 26, opacity: uneasy, textShadow: `0 0 16px ${look.keyGlow}`, display: "inline-block", transform: `scale(${1.4 - 0.4 * uneasy}) translateX(${Math.sin(frame * 1.7) * 2 * uneasy}px)` }}>不安 ↑</span>
            </div>
          </div>
        </div>
      )}
      <Sfx name="glint" at={0} volume={0.3} />
      {STEPS.slice(1).map((b) => (
        <Sfx key={b} name="shutter" at={b * BEAT} volume={0.35} />
      ))}
      <Sfx name="rise" at={keyAt} volume={0.35} />
      <Sfx name="whoosh" at={cues[1] - 6} volume={0.35} />
      <Sfx name="stamp" at={cues[1] + 4 * BEAT} volume={0.5} />
      <Sfx name="boom" at={cues[2]} volume={0.5} />
      <Sfx name="glitch" at={keyAt2} volume={0.3} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
