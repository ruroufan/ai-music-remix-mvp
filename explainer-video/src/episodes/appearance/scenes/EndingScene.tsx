import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { EndCard } from "../../../channels/backlit/EndCard";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { keyLandsAt } from "../../../components/Kinetic";
import { FILTER, Face, MirrorGlass, Phone } from "../faces";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const smooth = (frame: number, a: number, b: number) => interpolate(frame, [a, b], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });

// 0 · the phone (the plaster face) and the mirror (the face). The filter is
//     switched off — 滤镜 OFF — and the screen goes dark like an old tube:
//     a line, a dot, black. The phone is put down; the mirror moves to the
//     middle.
// 1 · the mirror warms up, the face in it smiles; when 真实的脸 lands, a warm
//     ring goes out from it.
// 2 · the channel card.
export const EndingScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const [, c1, c2] = cues;
  const show = useRamp(0, 10);
  const off = smooth(frame, 1.5 * BEAT, 1.5 * BEAT + 6);
  const on = interpolate(frame, [2 * BEAT, 2 * BEAT + 14], [1, 0], clamp);
  const putDown = smooth(frame, 4 * BEAT, 6 * BEAT);
  const center = smooth(frame, 4.5 * BEAT, 7.5 * BEAT);
  const light = 0.3 + 0.4 * center + 0.6 * smooth(frame, c1, c1 + 3 * BEAT);
  const smile = 0.7 * smooth(frame, c1 + 2 * BEAT, c1 + 4 * BEAT);
  const keyAt = c1 + keyLandsAt(lines[1].text, BEAT);
  const ring = interpolate(frame, [keyAt, keyAt + 2.5 * BEAT], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const card = useRamp(c2, 12);
  const mx = 1320 - 360 * center;
  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: show * (1 - 0.75 * card) }}>
        {putDown < 1 && (
          <div style={{ position: "absolute", inset: 0, opacity: 1 - putDown, transform: `translateY(${putDown * 220}px) rotate(${putDown * -8}deg)`, transformOrigin: "600px 760px" }}>
            <Phone x={600} y={440} w={300} h={600} on={on} glow={on}>
              <Face id="en-p" x={140} y={270} size={360} smooth={1} bright={1} slim={1} eyes={1} statue={1} rim={0} />
            </Phone>
            {/* the filter switch */}
            <div style={{ position: "absolute", left: 600 - 90, top: 100, width: 180, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "8px 0", borderRadius: 22, background: "rgba(10,10,16,0.85)", border: `1px solid ${off > 0.5 ? palette.faint : FILTER}` }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: off > 0.5 ? palette.dim : FILTER }}>滤镜</span>
              <div style={{ position: "relative", width: 50, height: 26, borderRadius: 13, background: off > 0.5 ? "rgba(255,255,255,0.2)" : FILTER }}>
                <div style={{ position: "absolute", left: 3 + 24 * (1 - off), top: 3, width: 20, height: 20, borderRadius: 10, background: "#fff" }} />
              </div>
              <span style={{ fontFamily: fonts.mono, fontSize: 16, color: palette.dim }}>{off > 0.5 ? "OFF" : "ON"}</span>
            </div>
          </div>
        )}
        {ring > 0 && ring < 1 && (
          <div style={{ position: "absolute", left: mx, top: 450, width: 440 + ring * 900, height: (440 + ring * 900) * 1.3, transform: "translate(-50%, -50%)", borderRadius: "50%", border: `3px solid ${look.key}`, opacity: (1 - ring) * 0.8, boxShadow: `0 0 30px ${look.keyGlow}` }} />
        )}
        <div style={{ position: "absolute", inset: 0, transform: `scale(${1 + 0.1 * center})`, transformOrigin: `${mx}px 450px` }}>
          <MirrorGlass x={mx} y={450} w={380} h={520} light={light}>
            <Face id="en-m" x={190} y={270} size={430} smile={smile} rim={0.4 + 0.4 * center} />
          </MirrorGlass>
        </div>
      </div>
      {card > 0 && <EndCard opacity={card} signoffAt={c2 + BEAT} />}
      <Sfx name="shutter" at={1.5 * BEAT} volume={0.35} />
      <Sfx name="glitch" at={2 * BEAT} volume={0.35} />
      <Sfx name="whoosh" at={4 * BEAT} volume={0.25} />
      <Sfx name="rise" at={c1} volume={0.25} />
      <Sfx name="glint" at={keyAt} volume={0.4} />
      <Sfx name="boom" at={c2} volume={0.35} />
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[2]} />
    </ObsFrame>
  );
};
