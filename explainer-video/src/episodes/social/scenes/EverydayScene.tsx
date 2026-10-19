import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Stander } from "../../doubt/circles";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const W = 500, H = 600, TOP = 140;
const XS = [370, 960, 1550];
const TAGS = ["CASE 01 · 电梯", "CASE 02 · 会议", "CASE 03 · 深夜"];

const Panel: React.FC<{ i: number; on: number; active: number; children: React.ReactNode }> = ({ i, on, active, children }) => (
  <div style={{ position: "absolute", left: XS[i] - W / 2, top: TOP + (1 - on) * 40, width: W, height: H, opacity: on * (0.35 + 0.65 * active), overflow: "hidden", borderRadius: 16, border: `2px solid ${active > 0.5 ? palette.accent : palette.faint}`, background: "rgba(10,14,20,0.82)" }}>
    <div style={{ position: "absolute", left: 22, top: 16, fontFamily: fonts.mono, fontSize: 18, letterSpacing: 4, color: palette.dim, zIndex: 2 }}>{TAGS[i]}</div>
    {children}
  </div>
);

const Bubble: React.FC<{ x: number; y: number; p: number; s?: number; children: React.ReactNode; dashed?: boolean }> = ({ x, y, p, s = 1, children, dashed }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity: p, transform: `translate(-50%, -50%) scale(${(0.7 + 0.3 * p) * s})`, padding: "10px 20px", borderRadius: 22, background: dashed ? "rgba(232,238,242,0.1)" : "rgba(232,238,242,0.92)", border: dashed ? "2px dashed rgba(232,238,242,0.5)" : undefined, color: dashed ? palette.ink : "#14181e", fontSize: 28, fontWeight: 800, whiteSpace: "nowrap" }}>
    {children}
  </div>
);

// Three cases, a panel each; the one being talked about lights up.
// 1 · the lift: the doors open on someone he knows — 嗨！— and he's suddenly
//     very busy with his phone, its light on his face.
// 2 · the meeting: his hand starts to go up, a bubble starts — 我觉得… — and
//     on the beat both go back down; the bubble shrinks back into him.
// 3 · late at night, on the edge of the bed: one moment replayed over and
//     over — 回放 ×1, ×2, ×3… — 他刚才是不是皱眉了？
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [c1, c2, c3] = cues;
  const on = cues.map((c) => ramp(frame, c, 10));
  const active = (i: number) => (frame >= cues[i] && (i + 1 >= cues.length || frame < cues[i + 1]) ? 1 : 0);
  // 1
  const doors = interpolate(frame, [c1 + BEAT, c1 + 2 * BEAT], [0, 1], clamp);
  const hi = ramp(frame, c1 + 2.5 * BEAT, 6);
  const phone = ramp(frame, c1 + 3.5 * BEAT, 4);
  // 2
  const raise = interpolate(frame, [c2 + BEAT, c2 + 2.5 * BEAT, c2 + 4 * BEAT, c2 + 4.5 * BEAT], [0, 1, 1, 0], clamp);
  const say = interpolate(frame, [c2 + 2 * BEAT, c2 + 2.5 * BEAT, c2 + 4 * BEAT, c2 + 4.6 * BEAT], [0, 1, 1, 0], clamp);
  // 3
  const replays = Math.max(0, Math.min(9, Math.floor((frame - c3 - BEAT) / BEAT) + 1));
  const loop = ((frame - c3) % BEAT) / BEAT;
  return (
    <ObsFrame duration={duration}>
      {/* 1 · the lift */}
      <Panel i={0} on={on[0]} active={active(0)}>
        <div style={{ position: "absolute", left: 60, top: 70, width: 380, height: 470, background: "#1a212c", border: "2px solid #3a4454" }} />
        <div style={{ position: "absolute", left: 210, top: 80, padding: "2px 10px", fontFamily: fonts.mono, fontSize: 18, color: palette.alert, background: "#000" }}>{doors > 0 ? "12F ▲" : "3F"}</div>
        <Stander x={320} bottom={530} height={230} lift={0.4 + 0.6 * (1 - phone) - 0.4 * phone} glow={0.6} />
        {/* the phone's light on his face */}
        {phone > 0 && (
          <>
            <div style={{ position: "absolute", left: 312, top: 380, width: 22, height: 36, borderRadius: 4, background: "#cfe8ff", boxShadow: "0 0 30px rgba(160,210,255,0.9)", opacity: phone, transform: "rotate(-18deg)" }} />
            <div style={{ position: "absolute", left: 250, top: 300, width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle, rgba(160,210,255,0.35), transparent 70%)", opacity: phone }} />
          </>
        )}
        <Stander x={140} bottom={530} height={240} lift={1.3} glow={0.5} rgb={palette.accentRgb} opacity={doors} />
        {/* the doors sliding open */}
        <div style={{ position: "absolute", left: 60, top: 70, width: 190 * (1 - doors * 0.9), height: 470, background: "linear-gradient(90deg, #4a5566, #2c3542)", borderRight: "2px solid #6a7484" }} />
        <div style={{ position: "absolute", left: 250 + 190 * doors * 0.9, top: 70, width: 190 * (1 - doors * 0.9), height: 470, background: "linear-gradient(90deg, #2c3542, #4a5566)", borderLeft: "2px solid #6a7484" }} />
        <Bubble x={150} y={170} p={hi}>嗨！</Bubble>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 18, textAlign: "center", fontFamily: fonts.mono, fontSize: 16, letterSpacing: 4, color: "rgb(160,210,255)", opacity: phone }}>假装很忙 · BUSY</div>
      </Panel>

      {/* 2 · the meeting */}
      <Panel i={1} on={on[1]} active={active(1)}>
        {[90, 190, 410].map((x, k) => (
          <Stander key={k} x={x} bottom={420} height={200} lift={1.2} glow={0.3} rgb={palette.accentRgb} />
        ))}
        <Stander x={300} bottom={420} height={200} lift={1 - raise * 0.2} glow={0.7} />
        {/* his arm going up */}
        <div style={{ position: "absolute", left: 330, top: 300, width: 14, height: 90, borderRadius: 7, background: "#030405", border: `1.5px solid rgba(${palette.halo},0.8)`, transformOrigin: "50% 0%", transform: `rotate(${180 - 150 * raise}deg)`, opacity: raise > 0.02 ? 1 : 0 }} />
        <div style={{ position: "absolute", left: 30, top: 400, width: 440, height: 30, borderRadius: 6, background: "#2a2118", border: `1px solid rgba(${palette.halo},0.4)` }} />
        <div style={{ position: "absolute", left: 40, top: 430, width: 420, height: 120, background: "linear-gradient(#1a140e, transparent)" }} />
        <Bubble x={300} y={150} p={say} s={0.4 + 0.6 * say}>我觉得…</Bubble>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 22, textAlign: "center", fontSize: 26, fontWeight: 800, color: look.key, opacity: ramp(frame, c2 + 4.6 * BEAT, 6) }}>……（咽回去）</div>
      </Panel>

      {/* 3 · the replay */}
      <Panel i={2} on={on[2]} active={active(2)}>
        <div style={{ position: "absolute", right: 24, top: 46, fontFamily: fonts.mono, fontSize: 22, color: palette.alert }}>02:47</div>
        <div style={{ position: "absolute", left: 40, top: 430, width: 420, height: 60, borderRadius: 8, background: "#1c2330", border: `1px solid ${palette.faint}` }} />
        <Stander x={250} bottom={470} height={210} lift={0} glow={0.5} />
        {/* the thought: a little screen looping one moment */}
        <div style={{ position: "absolute", left: 110, top: 80, width: 280, height: 170, borderRadius: 14, border: "2px dashed rgba(232,238,242,0.5)", background: "rgba(232,238,242,0.06)", opacity: ramp(frame, c3 + HALF_BEAT, 8) }}>
          <Stander x={140} bottom={160} height={120} lift={1.2 + 0.4 * Math.sin(loop * Math.PI)} glow={0.4} rgb={palette.accentRgb} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 4, height: 4, background: "rgba(232,238,242,0.15)" }}>
            <div style={{ width: `${loop * 100}%`, height: "100%", background: palette.alert }} />
          </div>
          <div style={{ position: "absolute", right: 8, top: 6, fontFamily: fonts.mono, fontSize: 18, color: palette.alert }}>回放 ×{replays}</div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 290, textAlign: "center", fontSize: 24, fontWeight: 700, color: palette.ink, opacity: ramp(frame, c3 + 3 * BEAT, 8) }}>他刚才是不是皱眉了？</div>
      </Panel>

      <Sfx name="whoosh" at={c1} volume={0.25} />
      <Sfx name="glint" at={c1 + 2.5 * BEAT} volume={0.35} />
      <Sfx name="shutter" at={c1 + 3.5 * BEAT} volume={0.35} />
      <Sfx name="whoosh" at={c2} volume={0.25} />
      <Sfx name="rise" at={c2 + BEAT} volume={0.25} />
      <Sfx name="glitch" at={c2 + 4 * BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c3} volume={0.25} />
      {Array.from({ length: 8 }, (_, k) => (
        <Sfx key={k} name="step" at={c3 + (k + 1) * BEAT} volume={0.15} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
