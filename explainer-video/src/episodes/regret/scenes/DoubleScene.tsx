import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { ReplayClip } from "../projector";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, HALF_BEAT, type SceneProps } from "../timing";

// 0 · two layers slide apart.
// 1 · layer one: the thing itself — one clip, one loss.
// 2 · layer two: going back to it — the same clip, red, the losses stacking per beat.
// 3 · a wall of a hundred replays, filling up; the counter runs ×1 → ×100.
const COLS = 10, ROWS = 10, CW = 104, GAP_X = 116, GAP_Y = 66;

export const DoubleScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const split = interpolate(frame, [BEAT, 2 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => 1 - (1 - t) ** 3 });
  const l1 = interpolate(frame, [cues[1], cues[1] + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const l2 = interpolate(frame, [cues[2], cues[2] + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pains = frame >= cues[2] ? Math.min(7, Math.floor((frame - cues[2] - BEAT) / HALF_BEAT) + 1) : 0;
  const wall = frame >= cues[3];
  const fill = interpolate(frame, [cues[3], cues[3] + 6 * BEAT], [1, COLS * ROWS], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => t * t });
  const shown = Math.floor(fill);
  const stack = interpolate(frame, [cues[3] - 6, cues[3] + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const layer = (y: number, label: string, color: string, o: number, children: React.ReactNode) => (
    <div style={{ position: "absolute", left: 360, top: y, width: 1200, height: 250, opacity: o, border: `1px solid ${color}`, background: "rgba(8,11,16,0.85)", transform: "perspective(1400px) rotateX(14deg)" }}>
      <div style={{ position: "absolute", left: 20, top: 14, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 6, color }}>{label}</div>
      {children}
    </div>
  );

  return (
    <ObsFrame duration={duration}>
      {!wall || stack > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: stack }}>
          {layer(200 - split * 60, "LAYER 2 · 回到那里，再痛一次", palette.alert, (0.35 + 0.65 * l2) * split, (
            <>
              <ReplayClip x={260} y={135} w={300} frame={frame - cues[2]} tint={l2} id="l2" count={frame >= cues[2] ? Math.floor((frame - cues[2]) / 30) + 1 : undefined} />
              {Array.from({ length: pains }, (_, i) => (
                <div key={i} style={{ position: "absolute", left: 470 + i * 96, top: 100 - (i % 2) * 18, fontFamily: fonts.mono, fontSize: 52, fontWeight: 700, color: palette.alert, opacity: 1 - i * 0.07 }}>
                  −1
                </div>
              ))}
            </>
          ))}
          {layer(470 + split * 40, "LAYER 1 · 事情本身", "#e6c46a", 0.35 + 0.65 * Math.max(l1, 1 - split), (
            <>
              <ReplayClip x={260} y={135} w={300} frame={Math.min(frame - cues[1], 59)} id="l1" />
              <div style={{ position: "absolute", left: 470, top: 100, fontFamily: fonts.mono, fontSize: 52, fontWeight: 700, color: "#e6c46a", opacity: interpolate(frame, [cues[1] + BEAT, cues[1] + BEAT + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
                −1 <span style={{ fontSize: 24, letterSpacing: 4 }}>损失 · 只此一次</span>
              </div>
            </>
          ))}
        </div>
      ) : null}

      {wall && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - stack }}>
          {Array.from({ length: shown }, (_, i) => {
            // fill from the centre outward
            const order = ORDER[i];
            const c = order % COLS, r = Math.floor(order / COLS);
            return (
              <ReplayClip
                key={order}
                id={`w${order}`}
                x={960 + (c - (COLS - 1) / 2) * GAP_X}
                y={130 + r * GAP_Y}
                w={CW}
                frame={frame - cues[3] + order * 7}
                tint={i === 0 ? 0 : 0.6}
                opacity={i === 0 ? 1 : 0.75}
              />
            );
          })}
          <div style={{ position: "absolute", left: 960 - 190, top: 300, width: 380, padding: "10px 0", textAlign: "center", background: "rgba(4,5,8,0.82)", border: `1px solid ${palette.alert}`, fontFamily: fonts.mono, fontSize: 120, fontWeight: 700, color: palette.alert, letterSpacing: 4 }}>
            ×{shown}
          </div>
        </div>
      )}

      <Sfx name="whoosh" at={BEAT} volume={0.35} />
      <Sfx name="stamp" at={cues[1] + BEAT} volume={0.55} />
      {Array.from({ length: 7 }, (_, i) => (
        <Sfx key={i} name="step" at={cues[2] + BEAT + i * HALF_BEAT} volume={0.25 + i * 0.04} />
      ))}
      <Sfx name="rise" at={cues[3]} volume={0.4} />
      <Sfx name="boom" at={cues[3] + 6 * BEAT} volume={0.7} />

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};

// Grid cells sorted by distance from the centre.
const ORDER = Array.from({ length: COLS * ROWS }, (_, i) => i).sort((a, b) => {
  const d = (k: number) => Math.hypot((k % COLS) - (COLS - 1) / 2, (Math.floor(k / COLS) - (ROWS - 1) / 2) * 1.6);
  return d(a) - d(b);
});
