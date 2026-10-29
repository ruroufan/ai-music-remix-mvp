import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Seated } from "../../friction/tangle";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { COOL, WARM } from "../kettle";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const RED = "255, 110, 110";

// Three moments, full screen, a whip-pan between each.
// 1 · a party gone quiet: everyone sitting, …… over their heads, a gauge
//     sinking — 气氛 ↓. He jumps up into the light — 来来来！ — and the gauge
//     shoots up.
// 2 · a clock running 2:00 → 6:00 while he sits by a friend who's falling
//     apart; then him alone, a thermometer — 38.9° — and a phone, typed and
//     deleted: 不说.
// 3 · 你还好吗？ — and his answer bends round in a U-turn straight back to
//     them: 我挺好的，倒是你最近怎么样？
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : 2;
  const up = ramp(frame, 4 * BEAT, 8);
  const mood = interpolate(frame, [0, 4 * BEAT, 4 * BEAT + 12], [0.4, 0.1, 0.95], clamp);
  const hours = interpolate(frame, [c1, c1 + 4 * BEAT], [2, 6], clamp);
  const fever = ramp(frame, c1 + 5 * BEAT, 8);
  const ask = ramp(frame, c2 + 4, 8);
  const turn = interpolate(frame, [c2 + 3 * BEAT, c2 + 5 * BEAT], [0, 1], clamp);
  const FRIENDS = [380, 620, 1300, 1540];
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1, c2]} hits={[4 * BEAT, c1 + 5 * BEAT, c2 + 5 * BEAT, ...keyHits(lines, cues, duration)]}>
        {seg === 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            {FRIENDS.map((x, i) => (
              <div key={x}>
                <Seated x={x} floor={880} scale={1.1} glow={0.25 + 0.4 * up} slump={0.5 * (1 - up)} />
                <div style={{ position: "absolute", left: x - 120, width: 120, top: 520, textAlign: "center", fontSize: 34, color: palette.dim, opacity: 1 - up }}>……</div>
                <div style={{ position: "absolute", left: x - 140, width: 160, top: 520, textAlign: "center", fontSize: 30, fontWeight: 900, color: `rgb(${WARM})`, opacity: up * ramp(frame, 5 * BEAT + i * 4, 6) }}>哈哈哈</div>
              </div>
            ))}
            <Halo x={960} y={560} r={260} intensity={0.9 * up} rgb={WARM} />
            <Stander x={960} bottom={880 - 60 * Math.sin(Math.min(1, up) * Math.PI)} height={340} lift={1.5} glow={0.4 + 0.5 * up} rgb={WARM} />
            <div style={{ position: "absolute", left: 1010, top: 400, padding: "10px 22px", borderRadius: 16, border: `2px solid rgb(${WARM})`, fontSize: 36, fontWeight: 900, color: `rgb(${WARM})`, opacity: up }}>来来来！</div>
            {/* the gauge */}
            <div style={{ position: "absolute", left: 1700, top: 220, width: 40, height: 400, border: "2px solid rgba(232,238,242,0.4)", borderRadius: 20, overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${mood * 100}%`, background: `rgb(${mood > 0.5 ? WARM : COOL})` }} />
            </div>
            <div style={{ position: "absolute", left: 1640, width: 160, top: 640, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: palette.dim }}>气氛 {mood > 0.5 ? "↑" : "↓"}</div>
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", inset: 0, opacity: 1 - fever }}>
              <Seated x={760} floor={880} scale={1.3} glow={0.6} />
              <div style={{ position: "absolute", inset: 0, transform: "scaleX(-1)", transformOrigin: "960px 0" }}>
                <Seated x={760} floor={880} scale={1.3} glow={0.3} slump={1} />
              </div>
              <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
                <circle cx={960} cy={300} r={110} fill="none" stroke="rgba(232,238,242,0.6)" strokeWidth={4} />
                <line x1={960} y1={300} x2={960 + 60 * Math.sin((hours / 12) * 2 * Math.PI)} y2={300 - 60 * Math.cos((hours / 12) * 2 * Math.PI)} stroke="#e8eef2" strokeWidth={6} strokeLinecap="round" />
                <line x1={960} y1={300} x2={960 + 90 * Math.sin(hours * 2 * Math.PI)} y2={300 - 90 * Math.cos(hours * 2 * Math.PI)} stroke={`rgb(${WARM})`} strokeWidth={3} strokeLinecap="round" />
              </svg>
              <div style={{ position: "absolute", left: 1100, top: 270, fontFamily: fonts.mono, fontSize: 36, color: palette.ink }}>{String(Math.floor(hours)).padStart(2, "0")}:00</div>
            </div>
            {fever > 0 && (
              <div style={{ position: "absolute", inset: 0, opacity: fever }}>
                <Stander x={700} bottom={900} height={420} lift={0} glow={0.3} rgb={COOL} />
                <div style={{ position: "absolute", left: 860, top: 330, width: 26, height: 260, borderRadius: 13, border: "3px solid rgba(232,238,242,0.7)" }}>
                  <div style={{ position: "absolute", left: 4, right: 4, bottom: 4, height: 220, borderRadius: 9, background: `rgb(${RED})` }} />
                </div>
                <div style={{ position: "absolute", left: 910, top: 330, fontFamily: fonts.mono, fontSize: 48, color: `rgb(${RED})` }}>38.9°</div>
                <div style={{ position: "absolute", left: 1180, top: 300, width: 300, height: 480, borderRadius: 30, border: "3px solid rgba(232,238,242,0.5)", background: "#111418", padding: "60px 24px" }}>
                  <div style={{ fontSize: 26, color: palette.dim }}>发给：</div>
                  <div style={{ marginTop: 20, fontSize: 30, color: palette.ink, textDecoration: frame > c1 + 7 * BEAT ? "line-through" : undefined, opacity: frame > c1 + 7 * BEAT ? 0.4 : 1 }}>我有点不舒服……</div>
                  <div style={{ marginTop: 40, fontSize: 30, fontWeight: 900, color: `rgb(${RED})`, opacity: ramp(frame, c1 + 7 * BEAT, 6) }}>已删除 · 不说</div>
                </div>
              </div>
            )}
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Stander x={460} bottom={900} height={380} lift={1} glow={0.5} rgb={COOL} />
            <Stander x={1460} bottom={900} height={380} lift={1} glow={0.6} rgb={WARM} />
            <div style={{ position: "absolute", left: 560, top: 300, padding: "14px 28px", borderRadius: 18, border: `2px solid rgb(${COOL})`, fontSize: 40, fontWeight: 900, color: palette.ink, opacity: ask }}>你还好吗？</div>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: turn > 0 ? 1 : 0 }}>
              <path d="M1380 420 C1100 420 1100 600 1300 600 L600 600" fill="none" stroke={`rgb(${WARM})`} strokeWidth={6} strokeDasharray="1600" strokeDashoffset={1600 * (1 - turn)} />
              {turn > 0.95 && <path d="M620 584 L596 600 L620 616" fill="none" stroke={`rgb(${WARM})`} strokeWidth={6} />}
            </svg>
            <div style={{ position: "absolute", left: 880, top: 640, width: 680, textAlign: "center", fontSize: 34, fontWeight: 800, color: `rgb(${WARM})`, opacity: ramp(frame, c2 + 5 * BEAT, 8) }}>我挺好的，倒是你最近怎么样？</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={WARM} opacity={0.45} />
      <Sfx name="stamp" at={4 * BEAT} volume={0.4} />
      <Sfx name="rise" at={4 * BEAT} volume={0.25} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.5} />
      <Sfx name="shutter" at={c1 + 5 * BEAT} volume={0.3} />
      <Sfx name="glitch" at={c1 + 7 * BEAT} volume={0.25} />
      <Sfx name="whoosh" at={c2 - 3} volume={0.5} />
      <Sfx name="whoosh" at={c2 + 3 * BEAT} volume={0.35} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
