import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox, Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Gilded, GoldTag } from "../gilded";
import { Silhouette } from "../../../components/Figures";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const FLOOR = 660;
const TAGS = ["名校", "名表", "名牌", "精修照", "头衔", "年薪"];

const Hole: React.FC<{ x: number; w: number; open: number }> = ({ x, w, open }) => (
  <div
    style={{
      position: "absolute",
      left: x - (w * open) / 2,
      top: FLOOR + 60 - (w * 0.22 * open) / 2,
      width: w * open,
      height: w * 0.22 * open,
      borderRadius: "50%",
      background: "radial-gradient(ellipse, #000 55%, #0b0f15 100%)",
      boxShadow: `0 0 0 2px rgba(${palette.accentRgb},0.25)`,
    }}
  />
);

// Line 0: a bottomless hole; gold labels keep falling in and vanishing.
// Line 1: cover the hole with a brand-name plate — another opens. And another.
// Line 2: up on a plinth, looked up to — then a scan passes and sees through the gold.
export const PitScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const seg0 = frame < cues[1];
  const seg1 = frame >= cues[1] && frame < cues[2];
  const cover = interpolate(frame, [cues[1] + 2 * BEAT - 4, cues[1] + 2 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hole2 = useRamp(cues[1] + 4 * BEAT, 6);
  const hole3 = useRamp(cues[1] + 6 * BEAT, 6);
  const stage = useRamp(cues[2], 8);
  // the scan band crosses the frame over three beats, starting on beat 3
  const scan = interpolate(frame, [cues[2] + 2 * BEAT, cues[2] + 5 * BEAT], [-0.15, 1.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scanX = scan * 1920;
  const xray = Math.max(0, 1 - Math.abs(scanX - 960) / 220);
  const seen = frame >= cues[2] + 4 * BEAT ? 1 : 0;

  return (
    <ObsFrame duration={duration}>
      {(seg0 || seg1) && <Horizon y={FLOOR} />}
      {seg0 && (
        <>
          <Hole x={960} w={520} open={1} />
          {Array.from({ length: 10 }, (_, i) => {
            const period = 2 * BEAT;
            const t = ((frame + random(`ft-${i}`) * period * 3) % (period * 1.6)) / (period * 1.6);
            const x = 960 + (random(`fx-${i}`) - 0.5) * 300;
            const y = -60 + t * (FLOOR + 120);
            const scale = t > 0.82 ? Math.max(0, 1 - (t - 0.82) / 0.18) : 1; // swallowed
            return <GoldTag key={i} text={TAGS[i % TAGS.length]} x={x} y={y} size={30 * scale} rot={(random(`fr-${i}`) - 0.5) * 60 + t * 90} opacity={scale} />;
          })}
          <div style={{ position: "absolute", left: 960 - 100, top: FLOOR + 110, width: 200, textAlign: "center", fontFamily: fonts.mono, fontSize: 16, letterSpacing: 4, color: palette.dim }}>DEPTH: ∞</div>
        </>
      )}
      {seg1 && (
        <>
          <Hole x={760} w={360} open={1} />
          <div style={{ opacity: cover, transform: `translateY(${(1 - cover) * -80}px)` }}>
            <GoldTag text="名牌" x={760} y={FLOOR + 50} size={56} />
          </div>
          <Hole x={1220} w={300} open={hole2} />
          <Hole x={1520} w={220} open={hole3} />
        </>
      )}
      {frame >= cues[2] && (
        <div style={{ position: "absolute", inset: 0, opacity: stage }}>
          {/* looked up to */}
          <div style={{ position: "absolute", left: 960 - 120, top: 560, width: 240, height: 380, background: "linear-gradient(#1a212d, #0b0f15)", borderTop: `2px solid ${palette.faint}` }} />
          {[420, 620, 1300, 1500].map((x) => (
            <Silhouette key={x} x={x} bottom={960} height={220} fill="#05070a" rim="rgba(232,238,242,0.25)" />
          ))}
          <Gilded x={960} bottom={560} height={300} labels={[1, 1, 1, 1]} crack={1} crackGlow={seen} xray={xray} glow={1 - seen * 0.5} shake={seen * 0.8} frame={frame} />
          {/* the scan band */}
          <div style={{ position: "absolute", left: scanX - 40, top: 0, width: 80, height: 1080, background: `linear-gradient(90deg, transparent, rgba(${palette.accentRgb},0.35), transparent)`, opacity: scan > -0.1 && scan < 1.1 ? 1 : 0 }} />
          <FocusBox x={960} y={410} w={300} h={330} progress={seen} label="SEEN THROUGH · 看穿" color={palette.alert} />
        </div>
      )}

      <Sfx name="whoosh" at={0} volume={0.25} />
      <Sfx name="stamp" at={cues[1] + 2 * BEAT} volume={0.6} />
      <Sfx name="boom" at={cues[1] + 4 * BEAT} volume={0.35} />
      <Sfx name="boom" at={cues[1] + 6 * BEAT} volume={0.35} />
      <Sfx name="rise" at={cues[2]} volume={0.3} />
      <Sfx name="glitch" at={cues[2] + 4 * BEAT} volume={0.5} />

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
