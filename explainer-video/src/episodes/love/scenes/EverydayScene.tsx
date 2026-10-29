import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Stander } from "../../doubt/circles";
import { Friend } from "../../appearance/faces";
import { Bokeh, Cam } from "../../glass/immersive";
import { HER, HIM } from "../lovers";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const TODO = ["健身", "写报告", "看书", "好好吃饭"];
const FRIENDS = Array.from({ length: 6 }, (_, i) => ({ a: -Math.PI * 0.9 + (i / 5) * Math.PI * 0.8 }));
const HOBBIES = ["吉他", "跑步", "画画", "旅行"];
const EXCUSES = ["他最近太累了", "他一定有苦衷", "是我要求太多了", "他不是故意的"];

// Three moments, full screen, a whip-pan between each.
// 1 · 到家了吗？ — read, no reply; the hours tick up, and on her list every
//     thing she meant to do is crossed off undone.
// 2 · her circle: friends round her and the things she loved doing go dark one
//     per half beat; only he stays lit.
// 3 · he says it — 你想多了吧 — it stings; and straight away she's making his
//     excuses for him, one per half beat.
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : 2;
  const mins = Math.round(interpolate(frame, [0, c1], [5, 192], clamp));
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1, 1.06]} whips={[c1, c2]} hits={[c2 + BEAT]}>
        {seg === 0 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", left: 1100, top: 150, width: 320, height: 580, borderRadius: 40, background: "#0d1117", border: `2px solid rgba(${palette.accentRgb},0.5)`, overflow: "hidden", boxShadow: "0 0 60px rgba(160,210,255,0.15)" }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 70, background: "#161c24", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 12, fontSize: 22, fontWeight: 700 }}>他</div>
              <div style={{ position: "absolute", right: 18, top: 110, padding: "10px 18px", borderRadius: 18, background: "#3fbf6a", color: "#06120a", fontSize: 26, fontWeight: 700 }}>到家了吗？</div>
              <div style={{ position: "absolute", right: 22, top: 162, fontFamily: fonts.mono, fontSize: 14, color: palette.dim }}>已读</div>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 30, textAlign: "center", fontFamily: fonts.mono, fontSize: 22, color: palette.alert }}>未回复 · {Math.floor(mins / 60)}h {String(mins % 60).padStart(2, "0")}m</div>
            </div>
            <Stander x={860} bottom={720} height={300} lift={0} glow={0.7} rgb={HER} />
            <div style={{ position: "absolute", left: 870, top: 470, width: 26, height: 40, borderRadius: 5, background: "#cfe8ff", boxShadow: "0 0 30px rgba(160,210,255,0.8)", transform: "rotate(-10deg)" }} />
            <div style={{ position: "absolute", left: 260, top: 200, width: 360, padding: "22px 26px", borderRadius: 14, background: "rgba(232,238,242,0.06)", border: `1px solid ${palette.faint}` }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 18, letterSpacing: 5, color: palette.dim, marginBottom: 14 }}>TODAY · 今天</div>
              {TODO.map((t, i) => {
                const x = ramp(frame, 3 * BEAT + i * BEAT, 5);
                return (
                  <div key={t} style={{ position: "relative", fontSize: 34, fontWeight: 700, margin: "10px 0", color: x > 0.5 ? palette.dim : palette.ink }}>
                    □ {t}
                    <div style={{ position: "absolute", left: 0, top: 24, height: 4, width: `${x * 80}%`, background: palette.alert }} />
                    <span style={{ position: "absolute", right: 0, top: 6, fontFamily: fonts.mono, fontSize: 18, color: palette.alert, opacity: x }}>没做</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Stander x={880} bottom={720} height={300} lift={0.6} glow={0.8} rgb={HER} />
            <Stander x={1010} bottom={720} height={320} lift={1.1} glow={1} rgb={HIM} />
            {FRIENDS.map((f, i) => {
              const off = ramp(frame, c1 + 2 * BEAT + i * HALF_BEAT, 6);
              return <Friend key={i} x={940 + Math.cos(f.a) * 520} y={520 + Math.sin(f.a) * 280 + 140} s={1.5} tone={i} hair={i * 4} opacity={1 - 0.85 * off} />;
            })}
            {HOBBIES.map((h, i) => {
              const off = ramp(frame, c1 + 2.5 * BEAT + i * BEAT, 6);
              return (
                <div key={h} style={{ position: "absolute", left: [380, 1420, 300, 1500][i], top: [620, 620, 420, 420][i], padding: "8px 18px", borderRadius: 20, border: `2px solid rgba(${HER},${0.8 * (1 - off) + 0.15})`, color: off > 0.5 ? palette.faint : `rgb(${HER})`, fontSize: 28, fontWeight: 800 }}>{h}</div>
              );
            })}
            <div style={{ position: "absolute", left: 0, right: 0, top: 130, textAlign: "center", fontFamily: fonts.mono, fontSize: 26, color: palette.ink }}>
              朋友 ×{6 - Math.min(5, Math.max(0, Math.floor((frame - c1 - 2 * BEAT) / HALF_BEAT) + 1))} · 爱好 ×{4 - Math.min(4, Math.max(0, Math.floor((frame - c1 - 2.5 * BEAT) / BEAT) + 1))}
            </div>
          </div>
        )}
        {seg === 2 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Stander x={760} bottom={720} height={300} lift={0.3} glow={0.8} rgb={HER} />
            <Stander x={1180} bottom={720} height={320} lift={1.4} glow={0.7} rgb={HIM} />
            <div style={{ position: "absolute", left: 1220, top: 260, opacity: ramp(frame, c2 + 4, 6), padding: "12px 24px", borderRadius: 24, background: palette.alert, color: "#fff", fontSize: 32, fontWeight: 900 }}>你想多了吧</div>
            {frame >= c2 + BEAT && frame < c2 + BEAT + 12 && <div style={{ position: "absolute", left: 760 - 80, top: 400 - 80, width: 160, height: 160, borderRadius: "50%", border: `3px solid ${palette.alert}`, opacity: 1 - (frame - c2 - BEAT) / 12, transform: `scale(${0.5 + (frame - c2 - BEAT) / 12})` }} />}
            {EXCUSES.map((e, i) => {
              const p = ramp(frame, c2 + 2.5 * BEAT + i * HALF_BEAT * 1.5, 6);
              return (
                <div key={e} style={{ position: "absolute", left: [380, 300, 420, 340][i], top: 220 + i * 100, opacity: p, transform: `scale(${0.7 + 0.3 * p})`, padding: "10px 22px", borderRadius: 22, background: "rgba(255,170,190,0.12)", border: "2px dashed rgba(255,170,190,0.6)", fontSize: 28, fontWeight: 800, color: palette.ink, whiteSpace: "nowrap" }}>
                  {e}
                </div>
              );
            })}
            <div style={{ position: "absolute", left: 300, top: 160, fontFamily: fonts.mono, fontSize: 18, letterSpacing: 5, color: look.key, opacity: ramp(frame, c2 + 2.5 * BEAT, 8) }}>替他想 · EXCUSES</div>
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb="255, 170, 190" />
      <Sfx name="glint" at={4} volume={0.3} />
      {TODO.map((_, i) => (
        <Sfx key={i} name="shutter" at={3 * BEAT + i * BEAT} volume={0.2} />
      ))}
      <Sfx name="whoosh" at={c1 - 3} volume={0.5} />
      {FRIENDS.map((_, i) => (
        <Sfx key={i} name="step" at={c1 + 2 * BEAT + i * HALF_BEAT} volume={0.15} />
      ))}
      <Sfx name="whoosh" at={c2 - 3} volume={0.5} />
      <Sfx name="shatter" at={c2 + BEAT} volume={0.4} />
      {EXCUSES.map((_, i) => (
        <Sfx key={i} name="glint" at={c2 + 2.5 * BEAT + Math.round(i * HALF_BEAT * 1.5)} volume={0.15} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
