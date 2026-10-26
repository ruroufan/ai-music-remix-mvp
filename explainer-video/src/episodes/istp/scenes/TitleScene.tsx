import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { Bokeh, Cam, Shards } from "../../glass/immersive";
import { FEEL, Feeling, STEEL } from "../bench";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// 沉 · 默 stamped on a steel nameplate, four screws in the corners. On the
// beat a big switch flips — OFF — and the plate goes dark; only a tiny light
// keeps blinking in the corner.
export const TitleScene: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { brand } = useEpisode();
  const [a, b] = [...brand.topic];
  const hit = 2 * BEAT;
  const inK = interpolate(frame, [0, 10], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const off = interpolate(frame, [hit, hit + 4], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.06, 1]} hits={[hit]}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", fontFamily: fonts.mono, fontSize: 30, letterSpacing: 12, color: `rgb(${STEEL})`, opacity: inK }}>ISTP · 鉴赏家</div>
        <div style={{ position: "absolute", left: 460, top: 260, width: 1000, height: 420, borderRadius: 18, background: `linear-gradient(160deg, #3a3f48, #23272e)`, border: `3px solid rgba(${STEEL},0.6)`, opacity: inK, boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}>
          {[[30, 30], [940, 30], [30, 360], [940, 360]].map(([x, y]) => (
            <div key={`${x}${y}`} style={{ position: "absolute", left: x, top: y, width: 30, height: 30, borderRadius: 15, background: "#8a909a", border: "2px solid #555" }}><div style={{ position: "absolute", left: 4, right: 4, top: 13, height: 3, background: "#444", transform: "rotate(30deg)" }} /></div>
          ))}
          <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", fontSize: 230, fontWeight: 900, lineHeight: 1, letterSpacing: 40, color: `rgba(232,238,242,${1 - 0.75 * off})`, textShadow: off < 0.5 ? "0 0 30px rgba(255,255,255,0.3)" : undefined }}>{a}{b}</div>
        </div>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: inK }}>
          <rect x={1520} y={420} width={80} height={140} rx={10} fill="#1d2027" stroke={`rgb(${STEEL})`} strokeWidth={3} />
          <rect x={1546} y={off > 0.5 ? 500 : 432} width={28} height={50} rx={6} fill={off > 0.5 ? "#c43a3a" : "#3cba6a"} />
        </svg>
        <div style={{ position: "absolute", left: 1500, width: 120, top: 570, textAlign: "center", fontFamily: fonts.mono, fontSize: 26, color: off > 0.5 ? "#c43a3a" : "#3cba6a" }}>{off > 0.5 ? "OFF" : "ON"}</div>
        {off > 0.5 && <Feeling x={1410} y={640} size={0.6} frame={frame} />}
        <Shards x={1560} y={490} frame={frame} at={hit} n={12} power={0.5} seed="istp-t" />
        <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: fonts.mono, fontSize: 24, letterSpacing: 10, color: palette.dim }}>{brand.series} · {brand.topicLatin}</div>
      </Cam>
      <Bokeh frame={frame} rgb={FEEL} opacity={0.3 * (1 - 0.6 * off)} />
      <Sfx name="whoosh" at={hit - 8} volume={0.3} />
      <Sfx name="stamp" at={hit} volume={0.8} />
      <Sfx name="boom" at={hit} volume={0.4} />
    </ObsFrame>
  );
};
