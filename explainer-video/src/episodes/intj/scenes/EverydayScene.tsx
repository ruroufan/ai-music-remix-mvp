import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Doer } from "../../friction/tangle";
import { Bokeh, Cam } from "../../glass/immersive";
import { BP, Blueprint, GOLD, RED } from "../blueprint";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
// the meeting's long way round, in screen coords
const DETOUR = [[360, 560], [360, 300], [700, 300], [700, 640], [1000, 640], [1000, 220], [1320, 220], [1320, 520], [1560, 520]];
const MINE = ["先定目标，再拆三步。", "第一步其实可以跳过。", "按这个顺序，下周就能做完。"];
const THEIRS = ["嗯嗯", "哦", "……"];

// Three moments, full screen, a whip-pan between each.
// 1 · the meeting as a map: from 现在 to 结局, his line goes straight there in
//     one stroke — and the room's red line winds the long way round.
// 2 · a chat: his advice, three neat messages each ticked ✓; the replies get
//     shorter — 嗯嗯 · 哦 · …… — and then stop.
// 3 · the blueprint, finished; one man carrying a beam; the frame going up
//     one post per beat; 施工人数 1.
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : 2;
  const mine = ramp(frame, BEAT, 6);
  const total = DETOUR.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - DETOUR[i][0], p[1] - DETOUR[i][1]), 0);
  const along = interpolate(frame, [2 * BEAT, c1 - BEAT], [0, total], clamp);
  let left = along;
  const pts: string[] = [`${DETOUR[0][0]},${DETOUR[0][1]}`];
  let head = DETOUR[0];
  for (let i = 1; i < DETOUR.length && left > 0; i++) {
    const [ax, ay] = DETOUR[i - 1], [bx, by] = DETOUR[i];
    const L = Math.hypot(bx - ax, by - ay);
    const k = Math.min(1, left / L);
    head = [ax + (bx - ax) * k, ay + (by - ay) * k];
    pts.push(`${head[0]},${head[1]}`);
    left -= L;
  }
  const posts = Math.max(0, Math.min(6, Math.floor((frame - c2 - BEAT) / BEAT) + 1));
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1, c2]} hits={[...[BEAT], ...keyHits(lines, cues, duration)]}>
        {seg === 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              {Array.from({ length: 13 }, (_, i) => <line key={`v${i}`} x1={240 + i * 120} y1={160} x2={240 + i * 120} y2={720} stroke={`rgba(${BP},0.07)`} />)}
              {Array.from({ length: 6 }, (_, i) => <line key={`h${i}`} x1={240} y1={160 + i * 112} x2={1680} y2={160 + i * 112} stroke={`rgba(${BP},0.07)`} />)}
              <polyline points={pts.join(" ")} fill="none" stroke={`rgb(${RED})`} strokeWidth={5} strokeDasharray="14 10" strokeLinejoin="round" />
              <circle cx={head[0]} cy={head[1]} r={12} fill={`rgb(${RED})`} />
              <line x1={360} y1={560} x2={360 + (1560 - 360) * mine} y2={560 + (520 - 560) * mine} stroke={`rgb(${GOLD})`} strokeWidth={4} style={{ filter: `drop-shadow(0 0 8px rgba(${GOLD},0.9))` }} />
              <circle cx={360} cy={560} r={16} fill={palette.ink} />
              <circle cx={1560} cy={520} r={20} fill="none" stroke={`rgb(${GOLD})`} strokeWidth={4} />
            </svg>
            <div style={{ position: "absolute", left: 300, top: 590, fontSize: 28, fontWeight: 800 }}>现在</div>
            <div style={{ position: "absolute", left: 1500, top: 440, fontSize: 28, fontWeight: 800, color: look.key }}>结局</div>
            <div style={{ position: "absolute", left: 800, top: 500, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: look.key, opacity: mine }}>你：早就看到了</div>
            <div style={{ position: "absolute", left: 250, top: 180, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: `rgb(${RED})` }}>会议 · 已进行 {Math.round(interpolate(frame, [0, c1], [12, 94], clamp))} 分钟</div>
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", left: 560, top: 150, width: 800, height: 600, borderRadius: 24, background: "rgba(14,20,28,0.92)", border: `2px solid ${palette.faint}`, padding: "30px 40px" }}>
            {MINE.map((m, i) => {
              const at = c1 + i * 2 * BEAT;
              const p = ramp(frame, at, 6);
              const r = ramp(frame, at + BEAT, 6);
              return (
                <div key={m}>
                  <div style={{ display: "flex", justifyContent: "flex-end", opacity: p, marginBottom: 12 }}>
                    <div style={{ padding: "12px 20px", borderRadius: 18, background: `rgba(${BP},0.3)`, fontSize: 28, fontWeight: 700 }}>
                      {m} <span style={{ color: "#7fe0a0" }}>✓</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", opacity: r * (1 - 0.25 * i), marginBottom: 16 }}>
                    <div style={{ padding: "10px 18px", borderRadius: 18, background: "rgba(255,255,255,0.1)", fontSize: 28 - 4 * i, color: palette.dim }}>{THEIRS[i]}</div>
                  </div>
                </div>
              );
            })}
            <div style={{ position: "absolute", left: 40, bottom: 26, fontFamily: fonts.mono, fontSize: 20, color: palette.dim, opacity: frame > c1 + 7 * BEAT ? 1 : 0 }}>对方已读 · 未回复</div>
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Blueprint x={140} y={160} w={640} frame={frame} draw={1} checks={1} />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <line x1={980} y1={760} x2={1780} y2={760} stroke={`rgba(${BP},0.4)`} strokeWidth={3} />
              {Array.from({ length: posts }, (_, i) => (
                <rect key={i} x={1060 + i * 130} y={420} width={16} height={340} fill="#3a3428" stroke={`rgba(${GOLD},0.5)`} strokeWidth={1} />
              ))}
              {posts > 1 && <rect x={1060} y={410} width={(posts - 1) * 130 + 16} height={14} fill="#3a3428" />}
              {Array.from({ length: 6 }, (_, i) => <rect key={`g${i}`} x={1060 + i * 130} y={420} width={16} height={340} fill="none" stroke={`rgba(${BP},0.25)`} strokeDasharray="6 6" />)}
            </svg>
            <Doer x={960} floor={760} height={260} reach={0.9} glow={0.8} />
            <div style={{ position: "absolute", left: 1500, top: 220, fontFamily: fonts.mono, fontSize: 26, letterSpacing: 4, color: palette.dim }}>
              施工人数 <span style={{ color: `rgb(${RED})`, fontSize: 40 }}>1</span>
            </div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={BP} />
      <Sfx name="glint" at={BEAT} volume={0.35} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.5} />
      {MINE.map((_, i) => (
        <Sfx key={i} name="shutter" at={c1 + i * 2 * BEAT} volume={0.18} />
      ))}
      <Sfx name="whoosh" at={c2 - 3} volume={0.5} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Sfx key={`p${i}`} name="step" at={c2 + BEAT + i * BEAT} volume={0.25} />
      ))}
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
