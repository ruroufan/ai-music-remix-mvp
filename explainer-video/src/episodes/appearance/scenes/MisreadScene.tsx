import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox, Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { FILTER, FILTER_RGB, Face, MirrorGlass, Phone } from "../faces";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SW = 280, SH = 560; // the phone's screen
const BLOCK = 28;
const BLOCKS = Array.from({ length: Math.ceil(SW / BLOCK) * Math.ceil(SH / BLOCK) }, (_, i) => ({ x: (i % Math.ceil(SW / BLOCK)) * BLOCK, y: Math.floor(i / Math.ceil(SW / BLOCK)) * BLOCK, at: random(`blk-${i}`) }));

// 0 · the notion, 「容貌焦虑」, in the viewfinder — and on the beat it flips
//     over like a mirror image.
// 1 · what we usually think: you (in the mirror) against the one you compare
//     yourself with (on a phone): 62 分 vs 100 分 — 不够好看.
// 2 · the one on the phone glitches, splits, and falls apart block by block:
//     404 — 比较对象不存在. The mirror stays.
export const MisreadScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const card = useRamp(0, 8);
  const flip = interpolate(frame, [4 * BEAT, 4 * BEAT + 9], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const cardOut = useRamp(cues[1] - 4, 6);
  const pair = useRamp(cues[1], 10);
  const arrow = useRamp(cues[1] + BEAT, 10);
  const me = useRamp(cues[1] + 3 * BEAT, 6);
  const them = useRamp(cues[1] + 4 * BEAT, 6);
  const g = interpolate(frame, [cues[2] + 0.5 * BEAT, cues[2] + 3 * BEAT], [0, 1], clamp);
  const gone = interpolate(frame, [cues[2] + 3 * BEAT, cues[2] + 6 * BEAT], [0, 1], clamp);
  const nf = useRamp(cues[2] + 6 * BEAT, 8);
  const jit = g * (1 - gone) * (random(`j-${frame}`) - 0.5) * 30;
  const split = g * (1 - gone) * (6 + 6 * Math.abs(Math.sin(frame * 1.7)));
  return (
    <ObsFrame duration={duration}>
      {cardOut < 1 && (
        <div style={{ position: "absolute", inset: 0, opacity: card * (1 - cardOut), perspective: 1400 }}>
          <Halo x={960} y={400} r={420} intensity={0.45} />
          <div style={{ position: "absolute", left: 960 - 330, top: 290, width: 660, height: 220, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid rgba(${palette.halo},0.6)`, borderRadius: 18, background: "rgba(12,16,22,0.9)", fontSize: 120, fontWeight: 900, letterSpacing: 20, paddingLeft: 20, transform: `rotateY(${flip * 180}deg)`, boxShadow: `0 0 60px rgba(${palette.halo},0.18)` }}>
            容貌焦虑
          </div>
          <FocusBox x={960} y={400} w={760} h={300} progress={interpolate(frame, [6, 16], [0, 1], clamp)} label="认知 · COGNITION" />
          <div style={{ position: "absolute", left: 0, right: 0, top: 590, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 8, color: palette.alert, opacity: flip }}>颠 覆</div>
        </div>
      )}
      {frame >= cues[1] && (
        <div style={{ position: "absolute", inset: 0, opacity: pair }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 126, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim }}>
            我们通常以为 · <span style={{ color: palette.ink, fontFamily: "inherit" }}>不够好看</span>
          </div>
          <MirrorGlass x={620} y={460} w={340} h={460} light={0.6}>
            <Face id="ms-me" x={170} y={250} size={390} rim={0.4} />
          </MirrorGlass>
          <div style={{ position: "absolute", left: 620 - 100, width: 200, top: 718, textAlign: "center", fontSize: 30, fontWeight: 800, color: palette.ink }}>你</div>
          <Phone x={1300} y={460} w={300} h={580} glow={1 - gone}>
            <div style={{ position: "absolute", inset: 0, transform: `translateX(${jit}px)`, filter: split > 0.5 ? `drop-shadow(${split}px 0 0 rgba(255,0,90,0.75)) drop-shadow(${-split}px 0 0 rgba(0,230,255,0.75))` : undefined }}>
              <Face id="ms-them" x={140} y={260} size={360} smooth={1} bright={0.9} slim={0.8} eyes={0.7} rim={0} />
            </div>
            {/* torn scanlines */}
            {g > 0 &&
              gone < 1 &&
              Array.from({ length: 6 }, (_, i) => {
                const y = random(`sl-${i}-${Math.floor(frame / 3)}`) * SH;
                return <div key={i} style={{ position: "absolute", left: 0, right: 0, top: y, height: 4 + random(`sh-${i}-${Math.floor(frame / 3)}`) * 14, background: i % 2 ? "#000" : `rgba(${FILTER_RGB},0.6)`, opacity: g }} />;
              })}
            {/* falling apart, block by block */}
            {gone > 0 && BLOCKS.map((b, i) => (b.at < gone ? <div key={i} style={{ position: "absolute", left: b.x, top: b.y, width: BLOCK, height: BLOCK, background: b.at > gone - 0.08 ? FILTER : "#000" }} /> : null))}
            {nf > 0 && (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, opacity: nf }}>
                <div style={{ fontFamily: fonts.mono, fontSize: 84, fontWeight: 700, color: FILTER, textShadow: `0 0 24px rgba(${FILTER_RGB},0.7)` }}>404</div>
                <div style={{ fontFamily: fonts.mono, fontSize: 16, letterSpacing: 5, color: palette.dim }}>NOT FOUND</div>
              </div>
            )}
          </Phone>
          <div style={{ position: "absolute", left: 1300 - 160, width: 320, top: 760, textAlign: "center", fontSize: 30, fontWeight: 800, color: nf > 0.5 ? look.key : palette.ink, textShadow: nf > 0.5 ? `0 0 16px ${look.keyGlow}` : undefined }}>
            {nf > 0.5 ? "比较对象：不存在" : "比较对象"}
          </div>
          {/* comparing → */}
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: arrow }}>
            <line x1={820} y1={460} x2={820 + 300 * arrow} y2={460} stroke={palette.dim} strokeWidth={3} strokeDasharray="10 8" />
            <path d={`M${820 + 300 * arrow - 16} 448 L${820 + 300 * arrow} 460 L${820 + 300 * arrow - 16} 472`} fill="none" stroke={palette.dim} strokeWidth={3} />
          </svg>
          <div style={{ position: "absolute", left: 870, width: 200, top: 410, textAlign: "center", fontSize: 26, fontWeight: 700, color: palette.dim, opacity: arrow }}>比较</div>
          {/* the scores */}
          <div style={{ position: "absolute", left: 620 - 90, width: 180, top: 182, textAlign: "center", padding: "4px 0", borderRadius: 26, background: "rgba(10,14,20,0.92)", border: `2px solid ${palette.faint}`, fontFamily: fonts.mono, fontSize: 36, fontWeight: 700, color: palette.dim, opacity: me, transform: `scale(${1.5 - 0.5 * me})` }}>62 分</div>
          <div style={{ position: "absolute", left: 1300 - 100, width: 200, top: 142, textAlign: "center", padding: "4px 0", borderRadius: 26, background: "rgba(10,14,20,0.92)", border: `2px solid rgba(${FILTER_RGB},0.6)`, fontFamily: fonts.mono, fontSize: 36, fontWeight: 700, color: FILTER, opacity: them * (1 - 0.6 * nf), transform: `scale(${1.5 - 0.5 * them})`, textDecoration: nf > 0.3 ? "line-through" : undefined }}>
            100 分
          </div>
        </div>
      )}
      <Sfx name="shutter" at={6} volume={0.2} />
      <Sfx name="whoosh" at={4 * BEAT} volume={0.4} />
      <Sfx name="whoosh" at={cues[1]} volume={0.3} />
      <Sfx name="stamp" at={cues[1] + 3 * BEAT} volume={0.4} />
      <Sfx name="stamp" at={cues[1] + 4 * BEAT} volume={0.5} />
      <Sfx name="glitch" at={cues[2] + 0.5 * BEAT} volume={0.45} />
      <Sfx name="glitch" at={cues[2] + 2 * BEAT} volume={0.35} />
      <Sfx name="shatter" at={cues[2] + 3 * BEAT} volume={0.35} />
      <Sfx name="boom" at={cues[2] + 6 * BEAT} volume={0.4} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
