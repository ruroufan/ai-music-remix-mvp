import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bedroom, Copies, ReplayClip, ROOM } from "../projector";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

// 0 · back in the bedroom; the wall is covered.
// 1 · the hope: think hard enough and you can edit it. An editing timeline —
//     the playhead keeps dragging back, the cursor keeps trying to cut the
//     clip — and every try bounces off a lock: 已发生 · READ ONLY.
export const AnswerScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const room = interpolate(frame, [cues[1] - 6, cues[1] + 4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t = frame - cues[1];
  const tries = Math.floor(t / (2 * BEAT));
  const inTry = t % (2 * BEAT);
  // playhead: drags back over the clip during the first beat of each try, snaps forward on the second
  const head = inTry < BEAT ? interpolate(inTry, [0, BEAT], [1340, 820]) : 1340;
  const bounce = inTry >= BEAT ? Math.exp(-(inTry - BEAT) / 5) * Math.sin((inTry - BEAT) * 1.6) * 18 : 0;
  const lock = inTry >= BEAT ? 1 : 0;

  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: room }}>
        <Bedroom frame={frame}>
          <ReplayClip x={ROOM.wall.x + ROOM.wall.w / 2} y={ROOM.wall.y + ROOM.wall.h / 2} w={420} frame={frame} id="main" count={30 + Math.floor(frame / 15)} />
          <Copies frame={frame + 400} count={14} startAt={0} every={1} spread={1} opacity={0.65} tint={0.5} />
        </Bedroom>
      </div>

      {t >= 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - room }}>
          {/* the preview monitor */}
          <ReplayClip x={960} y={310} w={560} frame={frame} id="pv" />
          {/* the timeline */}
          <div style={{ position: "absolute", left: 360, top: 560, width: 1200, height: 150, border: `1px solid ${palette.faint}`, background: "#0a0e15" }}>
            {Array.from({ length: 25 }, (_, i) => (
              <div key={i} style={{ position: "absolute", left: i * 50, top: 0, width: 1, height: i % 5 ? 10 : 20, background: palette.faint }} />
            ))}
            <div style={{ position: "absolute", left: 440, top: 50, width: 340, height: 70, transform: `translateX(${bounce}px)`, borderRadius: 6, background: `rgba(${palette.halo},0.22)`, border: `2px solid ${lock ? palette.alert : `rgb(${palette.halo})`}` }}>
              <div style={{ position: "absolute", left: 12, top: 8, fontFamily: fonts.mono, fontSize: 18, color: palette.ink, letterSpacing: 2 }}>14:20 会议 · 那句话.mov</div>
              <div style={{ position: "absolute", right: 10, bottom: 8, fontFamily: fonts.mono, fontSize: 18, color: palette.alert, letterSpacing: 2, opacity: lock }}>🔒 已发生 · READ ONLY</div>
            </div>
          </div>
          <div style={{ position: "absolute", left: head - 360 + 360, top: 540, width: 3, height: 190, background: palette.accent }} />
          <div style={{ position: "absolute", left: head - 9, top: 528, width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: `14px solid ${palette.accent}` }} />
          <div style={{ position: "absolute", left: 360, top: 740, fontFamily: fonts.mono, fontSize: 22, letterSpacing: 4, color: palette.dim }}>
            ◀◀ 重想 ×{Math.max(1, tries + 1) * 17} · EDIT FAILED ×{tries + (lock ? 1 : 0)}
          </div>
        </div>
      )}

      {[0, 1, 2].map((k) => (
        <React.Fragment key={k}>
          <Sfx name="whoosh" at={cues[1] + k * 2 * BEAT} volume={0.25} />
          <Sfx name="glitch" at={cues[1] + k * 2 * BEAT + BEAT} volume={0.35} />
        </React.Fragment>
      ))}

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
