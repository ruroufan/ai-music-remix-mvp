import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Bokeh, Cam } from "../../glass/immersive";
import { ImpactBack, ImpactFront, keyHits } from "../../mbti/impact";
import { BLOOM, GLOW, GREY, GreyStreet, Kept } from "../cloche";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, at: number, len = 8) => interpolate(frame, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
const INSIDE = [["理想", -340, -40], ["善良", 330, -90], ["美", 300, 160]] as const;
const STAMPS = ["嘈杂", "粗糙", "妥协", "讨价还价", "差不多得了", "现实点"];

// 0 · the clean place: the flower under glass, very bright, and around it
//     three words — 理想 · 善良 · 美.
// 1 · the street, loud: grey stamps thud down one after another — 嘈杂 ·
//     粗糙 · 妥协 · 讨价还价 — price tags hanging off everything.
// 2 · the grit blows at the dome and sticks; smudges spread across the glass.
//     失败 — struck out; what he's afraid of: 被弄脏.
// 3 · so he wipes it clean and puts a second glass over the first. Sealed:
//     完好无损.
export const CleanScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const [, c1, c2, c3] = cues;
  const seg = frame < c1 ? 0 : frame < c2 ? 1 : frame < c3 ? 2 : 3;
  const smudge = interpolate(frame, [c2 + BEAT, c2 + 5 * BEAT], [0, 1], clamp);
  const thick = ramp(frame, c3 + 2 * BEAT, 10);
  const seal = ramp(frame, c3 + 4 * BEAT, 6);
  return (
    <ObsFrame duration={duration}>
      <ImpactBack lines={lines} cues={cues} duration={duration} />
      <Cam frame={frame} duration={duration} push={[1, 1.05]} whips={[c1, c2, c3]} hits={[...STAMPS.map((_, i) => c1 + 4 + i * 8), c2 + 5 * BEAT, c3 + 4 * BEAT, ...keyHits(lines, cues, duration)]}>
        {seg !== 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <Kept x={960} y={840} size={1.9} sway={Math.sin(frame / 22) * 3} glow={seg === 0 ? 1.2 : 1 - 0.3 * smudge * (seg === 2 ? 1 : 0)} smudge={seg === 2 ? smudge : 0} thick={seg === 3 ? thick : 0} />
            {seg === 0 &&
              INSIDE.map(([w, dx, dy], i) => (
                <div key={w} style={{ position: "absolute", left: 960 + dx - 100, width: 200, top: 480 + dy, textAlign: "center", fontSize: 50, fontWeight: 900, color: i === 1 ? `rgb(${BLOOM})` : `rgb(${GLOW})`, textShadow: `0 0 20px rgba(${GLOW},0.8)`, opacity: ramp(frame, 2 * BEAT + i * BEAT, 8) }}>{w}</div>
              ))}
            {seg === 0 && <div style={{ position: "absolute", left: 0, right: 0, top: 130, textAlign: "center", fontFamily: fonts.mono, fontSize: 26, letterSpacing: 12, color: `rgb(${GLOW})`, opacity: ramp(frame, 4, 10) }}>心里 · 一块干净的地方</div>}
            {seg === 2 && (
              <>
                <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
                  {Array.from({ length: 40 }, (_, i) => {
                    const t = ((frame - c2) * (0.02 + 0.02 * random(`gt${i}`)) + random(`g${i}`)) % 1;
                    return <circle key={i} cx={1920 - t * 900} cy={300 + random(`gy${i}`) * 500 + Math.sin(t * 6) * 20} r={3 + 4 * random(`gr${i}`)} fill={`rgba(${GREY},0.7)`} />;
                  })}
                </svg>
                <div style={{ position: "absolute", left: 200, top: 260, fontSize: 48, fontWeight: 900, color: palette.dim, textDecoration: "line-through", opacity: ramp(frame, c2 + 4, 8) }}>怕失败</div>
                <div style={{ position: "absolute", left: 200, top: 360, fontSize: 64, fontWeight: 900, color: "rgb(255,120,120)", opacity: ramp(frame, c2 + 5 * BEAT, 6), textShadow: "0 0 20px rgba(255,90,90,0.6)" }}>怕被弄脏</div>
              </>
            )}
            {seg === 3 && (
              <div style={{ position: "absolute", left: 1320, top: 360, padding: "14px 26px", border: `4px solid rgb(${GLOW})`, borderRadius: 10, fontSize: 46, fontWeight: 900, color: `rgb(${GLOW})`, opacity: seal, transform: `rotate(-8deg) scale(${1.5 - 0.5 * seal})` }}>完好无损</div>
            )}
          </div>
        )}
        {seg === 1 && (
          <div style={{ position: "absolute", inset: 0 }}>
            <GreyStreet frame={frame} />
            {STAMPS.map((w, i) => {
              const p = ramp(frame, c1 + 4 + i * 8, 4);
              return <div key={w} style={{ position: "absolute", left: 180 + (i % 3) * 540 + random(`sx${i}`) * 80, top: 220 + Math.floor(i / 3) * 260 + random(`sy${i}`) * 60, padding: "10px 22px", border: `4px solid rgb(${GREY})`, borderRadius: 8, fontSize: 52, fontWeight: 900, color: `rgb(${GREY})`, background: "rgba(10,11,13,0.8)", opacity: p, transform: `rotate(${(random(`sr${i}`) - 0.5) * 16}deg) scale(${1.6 - 0.6 * p})` }}>{w}</div>;
            })}
          </div>
        )}
      </Cam>
      <Bokeh frame={frame} rgb={GLOW} opacity={seg === 1 ? 0.1 : 0.5} />
      <Sfx name="glint" at={2 * BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c1 - 3} volume={0.45} />
      {STAMPS.map((_, i) => (
        <Sfx key={i} name="stamp" at={c1 + 4 + i * 8} volume={0.35} />
      ))}
      <Sfx name="whoosh" at={c2 - 3} volume={0.45} />
      <Sfx name="glitch" at={c2 + 5 * BEAT} volume={0.3} />
      <Sfx name="whoosh" at={c3 - 3} volume={0.45} />
      <Sfx name="glint" at={c3 + 2 * BEAT} volume={0.4} />
      <Sfx name="stamp" at={c3 + 4 * BEAT} volume={0.5} />
      <ImpactFront lines={lines} cues={cues} duration={duration} />
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
