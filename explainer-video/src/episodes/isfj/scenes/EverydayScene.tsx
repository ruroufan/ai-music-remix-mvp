import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { Jar, RED, Say, SOFT, WARM } from "../jar";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });

// Three moments, full screen, a whip-pan between each — and in the corner
// his jar, one stone heavier after each.
// 1 · a stack of files slides across the desk from a colleague to him: 没事我来.
// 2 · a birthday cake, its candle never lit; a phone: 0 条新消息 — and him,
//     smiling: 不重要.
// 3 · someone points at him, red, 你怎么能这样？ — he says nothing; a zip
//     runs across his mouth: 不解释.
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : 2;
  const said = [3 * BEAT, c1 + 4 * BEAT, c2 + 5 * BEAT];
  const stones = 16 + said.reduce((a, at) => a + interpolate(frame, [at + 6, at + 14], [0, 1], clamp), 0);
  const slide = interpolate(frame, [4, 2 * BEAT], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const zip = interpolate(frame, [c2 + 4 * BEAT, c2 + 5 * BEAT], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1, c2]} hits={[...said.map((a) => a + 14), ...keyHits(lines, cues, duration)]}>
        {seg === 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 200, top: 700, width: 1300, height: 24, background: "#2a2622" }} />
            <Stander x={360} bottom={900} height={360} lift={1} glow={0.3} rgb="150, 156, 166" />
            <Stander x={1340} bottom={900} height={360} lift={0} glow={0.5} rgb={SOFT} />
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} style={{ position: "absolute", left: 420 + 700 * slide, top: 660 - i * 26, width: 200, height: 22, background: i % 2 ? "#e8e2d4" : "#d8d0bf", border: "1px solid #6a6050" }} />
            ))}
            <Say x={1120} y={340} text="没事我来" k={ramp(frame, said[0], 6)} color={SOFT} />
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <rect x={420} y={560} width={300} height={120} rx={14} fill="#e8d6c0" />
              <rect x={420} y={540} width={300} height={40} rx={14} fill="#f4ece2" />
              <rect x={562} y={460} width={14} height={80} fill={`rgb(${WARM})`} />
              <line x1={569} y1={460} x2={569} y2={448} stroke="#444" strokeWidth={3} />
            </svg>
            <div style={{ position: "absolute", left: 420, width: 300, top: 700, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, color: palette.dim }}>蜡烛 · 没点</div>
            <div style={{ position: "absolute", left: 880, top: 300, width: 260, height: 460, borderRadius: 30, border: "3px solid rgba(232,238,242,0.5)", background: "#111418", padding: "70px 20px", textAlign: "center" }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 40, color: palette.ink }}>10/26</div>
              <div style={{ marginTop: 30, fontSize: 26, color: palette.dim }}>0 条新消息</div>
            </div>
            <Stander x={1440} bottom={900} height={380} lift={0} glow={0.5} rgb={SOFT} />
            <Say x={1240} y={360} text="不重要 :)" k={ramp(frame, said[1], 6)} color={SOFT} />
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Stander x={500} bottom={900} height={400} lift={1.5} glow={0.5} rgb={RED} />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <line x1={540} y1={600} x2={720 + 40 * ramp(frame, c2 + 4, 6)} y2={560} stroke="#030405" strokeWidth={16} strokeLinecap="round" />
            </svg>
            <Say x={420} y={300} text="你怎么能这样？" k={ramp(frame, c2 + 4, 6)} color={RED} />
            <Stander x={1300} bottom={900} height={400} lift={0} glow={0.4} rgb={SOFT} />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <line x1={1276} y1={556} x2={1276 + 60 * zip} y2={556} stroke="#c9ced4" strokeWidth={6} />
              {Array.from({ length: Math.round(zip * 8) }, (_, i) => <line key={i} x1={1280 + i * 7} y1={549} x2={1280 + i * 7} y2={563} stroke="#c9ced4" strokeWidth={2} />)}
            </svg>
            <div style={{ position: "absolute", left: 1400, top: 420, fontSize: 40, fontWeight: 900, color: palette.dim, opacity: ramp(frame, said[2], 8) }}>不解释</div>
          </div>
        )}
        {/* the jar, in the corner, one stone heavier each time */}
        <div style={{ position: "absolute", inset: 0 }}>
          <Jar x={1720} y={300} size={0.6} stones={stones} crack={0.3 + 0.1 * (stones - 16)} />
          <div style={{ position: "absolute", left: 1640, width: 160, top: 316, textAlign: "center", fontFamily: fonts.mono, fontSize: 20, color: palette.dim }}>{Math.floor(stones)} 块</div>
        </div>
      </Cam>
      <Bokeh frame={frame} rgb={SOFT} opacity={0.35} />
      <Sfx name="whoosh" at={4} volume={0.35} />
      {said.map((a, i) => (
        <Sfx key={i} name="step" at={a + 14} volume={0.3} />
      ))}
      <Sfx name="whoosh" at={c1 - 3} volume={0.5} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.5} />
      <Sfx name="stamp" at={c2 + 4} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
