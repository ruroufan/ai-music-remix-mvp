import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Stander } from "../../doubt/circles";
import { Bokeh, Cam } from "../../glass/immersive";
import { ALERT, FLOOR, HIM_X, S, ScreenCloud, Table, slot } from "../screens";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// 0 · back at the table, faint, the world's screens all round him; in front
//     of him the bowl, and over it: 今晚吃的是……？ — he can't say.
// 1 · and where is he? A tiny copy of him in every screen — and his own
//     chair, empty: 这里 · 不在.
export const CostScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1] = cues;
  const away = interpolate(frame, [c1, c1 + 12], [0, 1], clamp);
  const ask = interpolate(frame, [2 * BEAT, 2 * BEAT + 8], [0, 1], clamp);
  return (
    <ObsFrame duration={duration}>
      <Cam frame={frame} duration={duration} push={[1.02, 1.1]} focus={{ x: 900, y: 520 }} hits={[2 * BEAT, c1]}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - away }}>
          <Table frame={frame} fade={0.6} />
        </div>
        {away > 0 && (
          <div style={{ position: "absolute", inset: 0, opacity: away }}>
            <Table frame={frame} fade={1} phone={0} />
          </div>
        )}
        <ScreenCloud frame={frame} count={34} />
        {/* him, inside every screen */}
        {away > 0 &&
          Array.from({ length: 34 }, (_, i) => {
            const p = slot(i);
            return (
              <div key={i} style={{ position: "absolute", inset: 0, opacity: away * (0.6 + 0.4 * Math.sin(frame / 7 + i)) }}>
                <Stander x={p.x} bottom={p.y + 30 * p.s} height={60 * p.s} lift={0.5} glow={0.9} />
              </div>
            );
          })}
        <div style={{ position: "absolute", left: 870, top: 470, padding: "8px 18px", borderRadius: 12, background: "rgba(10,14,20,0.9)", border: `1px solid ${palette.faint}`, fontSize: 28, fontWeight: 800, opacity: ask * (1 - away) }}>
          今晚吃的是……<span style={{ color: `rgb(${ALERT})` }}>？</span>
        </div>
        <div style={{ position: "absolute", left: HIM_X - 180 * S, top: FLOOR - 320 * S, fontFamily: fonts.mono, fontSize: 30, fontWeight: 700, letterSpacing: 4, color: `rgb(${ALERT})`, opacity: away, padding: "6px 16px", borderRadius: 10, background: "rgba(10,14,20,0.92)", border: `1px solid rgba(${ALERT},0.6)`, zIndex: 5 }}>这里 · 不在</div>
      </Cam>
      <Bokeh frame={frame} rgb="120, 200, 255" />
      <Sfx name="glitch" at={2 * BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c1} volume={0.45} />
      <Sfx name="shatter" at={c1 + 4} volume={0.2} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
