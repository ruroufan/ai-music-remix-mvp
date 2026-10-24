import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { Frame } from "../Frame";
import { Silhouette } from "../../../components/Figures";
import { Subtitles, RichText } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { theme } from "../../../theme";
import { useRamp, HALF_BEAT, BEAT, type SceneProps } from "../timing";

const FLOOR = 760;

const Label: React.FC<{ x: number; title: string; latin: string; show: number }> = ({ x, title, latin, show }) => (
  <div style={{ position: "absolute", left: x - 150, width: 300, top: 160, textAlign: "center", opacity: show, transform: `translateY(${(1 - show) * 12}px)` }}>
    <div style={{ fontSize: 54, fontWeight: 700, letterSpacing: 6 }}>
      <RichText text={`【${title}】`} />
    </div>
    <div style={{ fontSize: 22, color: theme.dim, fontStyle: "italic", letterSpacing: 3, marginTop: 6 }}>{latin}</div>
  </div>
);

// Left: one person, one lamp, a bowl of food — enough on its own.
const WarmRoom: React.FC<{ props: number; lamp: number }> = ({ props, lamp }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: 960, height: 1080, overflow: "hidden", background: "linear-gradient(#1a140e, #0e0b08)" }}>
    <div style={{ position: "absolute", left: 299, top: 0, width: 2, height: 330, background: "rgba(239,233,223,0.35)" }} />
    <div style={{ position: "absolute", left: 286, top: 326, width: 28, height: 28, borderRadius: "50%", background: "#ffe9c4", boxShadow: `0 0 ${40 * lamp}px ${12 * lamp}px rgba(255,200,130,0.7)` }} />
    <div style={{ position: "absolute", left: -100, top: 140, width: 800, height: 800, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,196,120,${0.28 * lamp}), transparent 65%)` }} />
    <div style={{ position: "absolute", left: 0, top: FLOOR, width: 960, height: 2, background: "rgba(239,233,223,0.25)" }} />
    <div style={{ opacity: props }}>
      <div style={{ position: "absolute", left: 520, top: FLOOR - 120, width: 220, height: 10, background: "#3a3128" }} />
      <div style={{ position: "absolute", left: 590, top: FLOOR - 152, width: 80, height: 32, borderRadius: "0 0 40px 40px", background: theme.stone }} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: 610 + i * 18, top: FLOOR - 220, width: 3, height: 52, borderRadius: 3, background: "rgba(239,233,223,0.4)", transform: `skewX(${i % 2 ? 8 : -8}deg)` }} />
      ))}
    </div>
    <Silhouette x={300} bottom={FLOOR} />
  </div>
);

// Right: the same person, surrounded by mirrors that each hold someone else.
const MirrorRoom: React.FC<{ mirrors: number[] }> = ({ mirrors }) => (
  <div style={{ position: "absolute", left: 960, top: 0, width: 960, height: 1080, overflow: "hidden", background: `linear-gradient(${theme.cold}, #080a0f)` }}>
    <div style={{ position: "absolute", left: 230, top: 280, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(140,170,220,0.18), transparent 65%)" }} />
    {[90, 260, 700, 870].map((x, i) => (
      <div key={x} style={{ opacity: mirrors[i], transform: `translateY(${(1 - mirrors[i]) * 30}px)` }}>
        <div style={{ position: "absolute", left: x - 62, top: FLOOR - 340, width: 124, height: 340, border: "2px solid rgba(190,210,240,0.55)", background: "linear-gradient(135deg, rgba(150,180,220,0.18), rgba(20,26,38,0.5))" }} />
        <Silhouette x={x} bottom={FLOOR - 4} height={230} opacity={0.5} rim="rgba(190,210,240,0.5)" />
      </div>
    ))}
    <Silhouette x={480} bottom={FLOOR} rim="rgba(200,220,255,0.9)" />
  </div>
);

export const TwoLovesScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  // Which side is "in focus" follows the narration: both → left → right.
  const left = interpolate(frame, [cues[1], cues[1] + 15, cues[2], cues[2] + 15], [1, 1, 1, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const right = interpolate(frame, [cues[1], cues[1] + 15, cues[2], cues[2] + 15], [1, 0.3, 0.3, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lamp = useRamp(0, 30);
  const props = useRamp(cues[1] + 25, 20);
  const leftLabel = useRamp(cues[1] + 6, 18);
  const rightLabel = useRamp(cues[2] + 6, 18);
  const m0 = useRamp(cues[2] + BEAT, 16);
  const m1 = useRamp(cues[2] + BEAT + HALF_BEAT, 16);
  const m2 = useRamp(cues[2] + 2 * BEAT, 16);
  const m3 = useRamp(cues[2] + 2 * BEAT + HALF_BEAT, 16);
  const divider = useRamp(0, 25);

  return (
    <Frame duration={duration}>
      <div style={{ opacity: left }}>
        <WarmRoom props={props} lamp={lamp} />
      </div>
      <div style={{ opacity: right }}>
        <MirrorRoom mirrors={[m0, m1, m2, m3]} />
      </div>
      <div style={{ position: "absolute", left: 959, top: 0, width: 2, height: 1080 * divider, background: "rgba(239,233,223,0.6)" }} />
      <Label x={480} title="自爱心" latin="amour de soi" show={leftLabel * left} />
      <Label x={1440} title="自尊心" latin="amour-propre" show={rightLabel * right} />
      <Sfx name="whoosh" at={0} volume={0.3} />
      {[2, 3, 4, 5].map((h) => h * HALF_BEAT).map((d) => (
        <Sfx key={d} name="glint" at={cues[2] + d} volume={0.3} />
      ))}

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </Frame>
  );
};
