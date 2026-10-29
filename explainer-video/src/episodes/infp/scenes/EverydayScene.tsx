import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { BLOOM, Cloche, GLOW, GREY } from "../cloche";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const DREAMS = ["开一家小书店", "去看极光", "画自己的绘本", "住在海边", "做喜欢的事养活自己"];

// Three moments, full screen, a whip-pan between each.
// 1 · in his head, a whole novel: chapters flying by, 第 1 章 → 第 27 章 · 全书完.
//     On the desk, a page: one line, a blinking cursor — 3%.
// 2 · futures all round him, golden; in the middle a mail window —
//     简历_最终版.pdf — and the cursor hovering over 发送, shaking, never
//     clicking.
// 3 · a grey bubble slams in: 随便。 — and he shrinks, and a glass dome drops
//     over him. 第 1 天 … 第 4 天.
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : 2;
  const ch = Math.min(27, Math.max(1, Math.floor(frame / 3)));
  const page = ramp(frame, 5 * BEAT, 8);
  const hit = c2 + BEAT;
  const shrink = interpolate(frame, [hit, hit + 2 * BEAT], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const dome = interpolate(frame, [hit + 2 * BEAT, hit + 2 * BEAT + 6], [1, 0], { ...clamp, easing: (t) => t * t });
  const days = Math.max(1, Math.min(4, 1 + Math.floor((frame - hit - 3 * BEAT) / BEAT)));
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1, c2]} hits={[5 * BEAT, c1 + 4 * BEAT, hit, hit + 2 * BEAT, ...keyHits(lines, cues, duration)]}>
        {seg === 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <path d="M300 420 Q260 300 380 280 Q420 180 560 210 Q680 150 760 250 Q880 260 860 380 Q900 480 780 500 Q700 580 560 540 Q420 590 360 520 Q250 520 300 420 Z" fill={`rgba(${GLOW},0.1)`} stroke={`rgba(${GLOW},0.7)`} strokeWidth={3} />
            </svg>
            {Array.from({ length: 8 }, (_, i) => {
              const t = ((frame + i * 6) % 48) / 48;
              return <div key={i} style={{ position: "absolute", left: 400 + random(`p${i}`) * 300, top: 460 - t * 220, width: 70, height: 90, background: "#efe6d4", opacity: Math.sin(t * Math.PI) * (frame < 4 * BEAT ? 1 : 0.4), transform: `rotate(${(random(`pr${i}`) - 0.5) * 40 + t * 60}deg)` }} />;
            })}
            <div style={{ position: "absolute", left: 360, width: 460, top: 330, textAlign: "center", fontSize: 40, fontWeight: 900, color: `rgb(${GLOW})`, textShadow: "0 2px 10px #000" }}>
              第 {ch} 章{ch >= 27 ? " · 全书完" : ""}
            </div>
            <div style={{ position: "absolute", left: 360, width: 460, top: 600, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 6, color: palette.dim }}>脑子里</div>
            <div style={{ position: "absolute", left: 1080, top: 220, width: 560, height: 680, background: "#efe6d4", opacity: page, boxShadow: "0 20px 40px rgba(0,0,0,0.6)", padding: "50px 46px", color: "#222", transform: `rotate(2deg) translateY(${(1 - page) * 30}px)` }}>
              <div style={{ fontSize: 36, fontWeight: 900 }}>第一章</div>
              <div style={{ marginTop: 26, fontSize: 28 }}>
                那天的风很轻，她<span style={{ opacity: Math.floor(frame / 8) % 2 ? 1 : 0 }}>|</span>
              </div>
            </div>
            <div style={{ position: "absolute", left: 1080, width: 560, top: 930, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 6, color: palette.dim, opacity: page }}>
              动笔 · <span style={{ color: "rgb(255,110,110)" }}>3%</span>
            </div>
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            {DREAMS.map((d, i) => {
              const a = (i / DREAMS.length) * 2 * Math.PI - Math.PI / 2;
              const p = ramp(frame, c1 + 3 + i * 4, 8);
              return <div key={d} style={{ position: "absolute", left: 960 + Math.cos(a) * 640 - 140, top: 450 + Math.sin(a) * 270 - 30, width: 280, textAlign: "center", padding: "12px 0", borderRadius: 14, border: `2px solid rgba(${GLOW},0.7)`, background: `rgba(${GLOW},0.1)`, fontSize: 28, fontWeight: 800, color: `rgb(${GLOW})`, opacity: p, transform: `translateY(${Math.sin(frame / 15 + i) * 6}px)` }}>{d}</div>;
            })}
            <div style={{ position: "absolute", left: 660, top: 380, width: 600, height: 300, borderRadius: 14, background: "#1a1d23", border: `2px solid rgba(${GREY},0.5)`, opacity: ramp(frame, c1 + 2 * BEAT, 8) }}>
              <div style={{ padding: "18px 24px", fontFamily: fonts.mono, fontSize: 22, color: palette.dim, borderBottom: `1px solid rgba(${GREY},0.3)` }}>新邮件 · 应聘</div>
              <div style={{ padding: "26px 24px", fontSize: 28, color: palette.ink }}>附件：简历_最终版_改7.pdf</div>
              <div style={{ position: "absolute", right: 30, bottom: 30, padding: "12px 34px", borderRadius: 10, background: `rgb(${GLOW})`, fontSize: 28, fontWeight: 900, color: "#1a1208" }}>发送</div>
            </div>
            {/* the cursor, hovering and shaking */}
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: ramp(frame, c1 + 3 * BEAT, 6) }}>
              <path transform={`translate(${1170 + Math.sin(frame * 1.7) * 4 - 30 * ramp(frame, c1 + 3 * BEAT, 20)} ${600 + Math.cos(frame * 2.3) * 3})`} d="M0 0 L0 40 L11 30 L19 48 L26 45 L18 27 L32 27 Z" fill="#fff" stroke="#000" strokeWidth={2} />
            </svg>
            <div style={{ position: "absolute", left: 660, width: 600, top: 700, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 6, color: palette.dim, opacity: ramp(frame, c1 + 5 * BEAT, 8) }}>草稿箱 · 第 43 天</div>
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 1180, top: 300, padding: "18px 34px", borderRadius: 18, background: "#2a2d33", border: `2px solid rgb(${GREY})`, fontSize: 52, fontWeight: 900, color: palette.ink, opacity: ramp(frame, hit, 4), transform: `scale(${1.5 - 0.5 * ramp(frame, hit, 4)}) rotate(-4deg)` }}>随便。</div>
            <div style={{ position: "absolute", inset: 0, transform: `scale(${1 - 0.45 * shrink})`, transformOrigin: "760px 860px" }}>
              <Stander x={760} bottom={860} height={360} lift={0} glow={0.6} rgb={BLOOM} />
            </div>
            <Cloche x={760} y={860} size={1.15} lift={dome} opacity={1 - dome} />
            <div style={{ position: "absolute", left: 260, top: 300, fontFamily: fonts.mono, fontSize: 28, letterSpacing: 4, color: palette.dim, opacity: frame > hit + 3 * BEAT ? 1 : 0 }}>
              缩回去 · 第 <span style={{ fontSize: 44, color: `rgb(${BLOOM})` }}>{days}</span> 天
            </div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={GLOW} opacity={0.5} />
      {Array.from({ length: 9 }, (_, i) => (
        <Sfx key={i} name="shutter" at={i * 9} volume={0.08} />
      ))}
      <Sfx name="stamp" at={5 * BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.5} />
      {DREAMS.map((_, i) => (
        <Sfx key={`d${i}`} name="glint" at={c1 + 3 + i * 4} volume={0.12} />
      ))}
      <Sfx name="whoosh" at={c2 - 3} volume={0.5} />
      <Sfx name="stamp" at={hit} volume={0.5} />
      <Sfx name="glint" at={hit + 2 * BEAT} volume={0.5} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
