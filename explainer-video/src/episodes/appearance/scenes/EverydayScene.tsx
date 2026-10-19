import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { FILTER, FILTER_RGB, Face, Friend, Phone } from "../faces";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const XS = [370, 960, 1550];
const W = 300, H = 600, Y = 440;
const TAGS = ["01 · 信息流", "02 · 视频通话", "03 · 原相机"];
const FEED = ["2.3w", "8.1w", "5.6w", "1.2w"];

// Three phones, three everyday moments; the one being talked about lights up.
// 1 · a feed of faces, scrolling; a magnifier stops on a cheek — 毛孔 0.
// 2 · a video call: the front camera shows the real face, the finger hovers
//     over 接听 and won't press… 美颜 on — the face smooths — then it does.
// 3 · a group photo, 原相机: one face is circled — 我… — and a clock spins
//     round a whole day.
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [c1, c2, c3] = cues;
  const on = cues.map((c) => ramp(frame, c, 10));
  const active = (i: number) => (frame >= cues[i] && (i + 1 >= cues.length || frame < cues[i + 1]) ? 1 : 0);
  // 1
  const lensAt = c1 + 3 * BEAT;
  const scroll = Math.min(frame, lensAt) * 6;
  const lens = ramp(frame, lensAt, 8);
  const zero = ramp(frame, lensAt + BEAT, 6);
  // 2
  const toggle = ramp(frame, c2 + 3.5 * BEAT, 6);
  const tapAt = c2 + 5 * BEAT;
  const tap = frame >= tapAt && frame < tapAt + 14 ? (frame - tapAt) / 14 : 0;
  const hover = frame < tapAt ? Math.sin(frame / 2.2) * 6 : 0;
  // 3
  const circle = ramp(frame, c3 + 2 * BEAT, 8);
  const spin = interpolate(frame, [c3 + 3 * BEAT, c3 + 7 * BEAT], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  return (
    <ObsFrame duration={duration}>
      {XS.map((x, i) => (
        <div key={i} style={{ position: "absolute", inset: 0, opacity: on[i] * (0.32 + 0.68 * active(i)), transform: `translateY(${(1 - on[i]) * 40}px)` }}>
          <div style={{ position: "absolute", left: x - W / 2, width: W, top: Y - H / 2 - 40, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 4, color: active(i) ? palette.accent : palette.dim }}>{TAGS[i]}</div>
          <Phone x={x} y={Y} w={W} h={H} glow={0.4 + 0.6 * active(i)}>
            {i === 0 && (
              <>
                {Array.from({ length: 8 }, (_, k) => {
                  const top = 60 + k * 300 - (scroll % 600);
                  return (
                    <div key={k} style={{ position: "absolute", left: 14, top, width: W - 48, height: 284, borderRadius: 14, overflow: "hidden", background: "#11151b" }}>
                      <Face id={`ev-feed-${k}`} x={(W - 48) / 2} y={140} size={250} smooth={1} bright={0.85 + 0.05 * (k % 3)} slim={0.6 + 0.1 * (k % 4)} eyes={0.5 + 0.1 * (k % 3)} rim={0} />
                      <div style={{ position: "absolute", left: 12, bottom: 8, fontFamily: fonts.mono, fontSize: 15, color: FILTER }}>♥ {FEED[k % 4]}</div>
                    </div>
                  );
                })}
                {lens > 0 && (
                  <div style={{ position: "absolute", left: 150 - 76, top: 300 - 76, width: 152, height: 152, opacity: lens, transform: `scale(${0.6 + 0.4 * lens})` }}>
                    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "6px solid #c9d3dc", background: "radial-gradient(circle at 40% 35%, #fff6f1, #f6dccd 60%, #ecc9b6)", boxShadow: "0 8px 26px rgba(0,0,0,0.5)" }} />
                    <div style={{ position: "absolute", left: 118, top: 118, width: 16, height: 70, borderRadius: 6, background: "#8a95a0", transform: "rotate(-45deg)", transformOrigin: "50% 0" }} />
                  </div>
                )}
                {zero > 0 && (
                  <div style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center", opacity: zero, transform: `scale(${1.5 - 0.5 * zero})` }}>
                    <span style={{ padding: "6px 18px", borderRadius: 20, background: "rgba(0,0,0,0.75)", fontSize: 32, fontWeight: 900, color: FILTER, textShadow: `0 0 14px rgba(${FILTER_RGB},0.8)` }}>
                      毛孔 <span style={{ fontFamily: fonts.mono }}>0</span>
                    </span>
                  </div>
                )}
              </>
            )}
            {i === 1 && (
              <>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#1a2230, #0a0d12)" }} />
                <Face id="ev-call" x={140} y={270} size={330} smooth={toggle} bright={0.8 * toggle} slim={0.5 * toggle} eyes={0.4 * toggle} rim={0.3} />
                <div style={{ position: "absolute", left: 0, right: 0, top: 50, textAlign: "center", fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>视频通话邀请…</div>
                {/* the 美颜 toggle */}
                <div style={{ position: "absolute", right: 18, top: 92, display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 16, background: "rgba(0,0,0,0.55)" }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: toggle > 0.5 ? FILTER : "rgba(255,255,255,0.7)" }}>美颜</span>
                  <div style={{ position: "relative", width: 44, height: 24, borderRadius: 12, background: toggle > 0.5 ? FILTER : "rgba(255,255,255,0.25)" }}>
                    <div style={{ position: "absolute", left: 3 + 20 * toggle, top: 3, width: 18, height: 18, borderRadius: 9, background: "#fff" }} />
                  </div>
                </div>
                {/* decline / accept */}
                <div style={{ position: "absolute", left: 46, bottom: 34, width: 64, height: 64, borderRadius: 32, background: "#e5484d", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff" }}>挂断</div>
                <div style={{ position: "absolute", right: 46, bottom: 34, width: 64, height: 64, borderRadius: 32, background: "#30c46b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff", boxShadow: tap > 0 ? `0 0 0 ${tap * 40}px rgba(48,196,107,${0.5 * (1 - tap)})` : undefined }}>接听</div>
                {/* the hesitating finger */}
                <div style={{ position: "absolute", right: 58 + hover, bottom: 46 + (frame < tapAt ? 70 + Math.abs(hover) * 2 : 4), width: 40, height: 40, borderRadius: 20, border: "3px solid rgba(255,255,255,0.9)", background: "rgba(255,255,255,0.25)", opacity: frame >= c2 + BEAT ? 1 : 0 }} />
              </>
            )}
            {i === 2 && (
              <>
                <div style={{ position: "absolute", left: 0, right: 0, top: 54, textAlign: "center", fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>原相机 · 无美颜</div>
                <div style={{ position: "absolute", left: 14, right: 14, top: 96, height: 210, borderRadius: 8, background: "linear-gradient(#3a3f4a, #23272f)", overflow: "hidden" }}>
                  <Friend x={36} y={150} s={1.05} />
                  <Friend x={84} y={146} tone={1} hair={1} />
                  <Face id="ev-me" x={136} y={128} size={150} rim={0} />
                  <Friend x={190} y={146} tone={2} hair={2} />
                  <Friend x={238} y={150} s={1.05} tone={3} hair={1} />
                </div>
                {circle > 0 && (
                  <svg width={W} height={H} style={{ position: "absolute", left: -10, top: -10, overflow: "visible" }}>
                    <ellipse cx={150} cy={226} rx={44} ry={58} fill="none" stroke={palette.alert} strokeWidth={4} strokeDasharray={330} strokeDashoffset={330 * (1 - circle)} />
                  </svg>
                )}
                <div style={{ position: "absolute", left: 186, top: 300, fontSize: 26, fontWeight: 800, color: palette.alert, opacity: circle }}>我…</div>
                {/* the clock */}
                <div style={{ position: "absolute", left: 140 - 70, top: 350, width: 140, height: 140, borderRadius: "50%", border: `3px solid rgba(232,238,242,${0.3 + 0.6 * Math.min(1, spin * 4)})`, opacity: frame >= c3 + 3 * BEAT ? 1 : 0.25 }}>
                  <div style={{ position: "absolute", left: 68, top: 20, width: 4, height: 52, borderRadius: 2, background: palette.ink, transformOrigin: "50% 100%", transform: `rotate(${spin * 720}deg)` }} />
                  <div style={{ position: "absolute", left: 68, top: 34, width: 4, height: 38, borderRadius: 2, background: palette.alert, transformOrigin: "50% 100%", transform: `rotate(${spin * 60 * 360 / 60}deg)` }} />
                </div>
                <div style={{ position: "absolute", left: 0, right: 0, top: 504, textAlign: "center", fontSize: 26, fontWeight: 800, color: palette.ink, opacity: spin > 0 ? 1 : 0 }}>
                  难受 <span style={{ fontFamily: fonts.mono, color: palette.alert }}>{Math.round(spin * 24)}h</span>
                </div>
              </>
            )}
          </Phone>
        </div>
      ))}
      <Sfx name="whoosh" at={c1} volume={0.25} />
      <Sfx name="shutter" at={lensAt} volume={0.4} />
      <Sfx name="stamp" at={lensAt + BEAT} volume={0.5} />
      <Sfx name="whoosh" at={c2} volume={0.25} />
      <Sfx name="glint" at={c2 + 3.5 * BEAT} volume={0.4} />
      <Sfx name="stamp" at={tapAt} volume={0.4} />
      <Sfx name="whoosh" at={c3} volume={0.25} />
      <Sfx name="shutter" at={c3 + HALF_BEAT} volume={0.4} />
      <Sfx name="glitch" at={c3 + 2 * BEAT} volume={0.3} />
      {[3, 4, 5, 6].map((b) => (
        <Sfx key={b} name="step" at={c3 + b * BEAT} volume={0.2} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
