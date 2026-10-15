import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { fonts, palette } from "../../../channels/backlit/look";
import { Polaroid, SEPIA } from "../road";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { BEAT, type SceneProps } from "../timing";

// 1 · an old cassette turning, the song's waveform — and a tear meter rising.
// 2 · "then": a pile of exam papers, "累死了". "now": the same photo, sepia, ♥ 最好的时光.
// 3 · the hometown noodle shop: ★★☆☆☆ 难吃 — and the hearts float up anyway.
export const EverydayScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const seg = (i: number) => frame >= cues[i] && (i + 1 >= cues.length || frame < cues[i + 1]);
  const segIn = (i: number) => interpolate(frame, [cues[i], cues[i] + 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const t0 = frame - cues[0], t1 = frame - cues[1], t2 = frame - cues[2];
  const tears = interpolate(t0, [2 * BEAT, 7 * BEAT], [0, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const now = interpolate(t1, [4 * BEAT, 5 * BEAT], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hearts = Math.max(0, Math.floor((t2 - 3 * BEAT) / (BEAT / 2)));
  return (
    <ObsFrame duration={duration}>
      {seg(0) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(0) }}>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <rect x={560} y={260} width={560} height={350} rx={22} fill="#2a2016" stroke={`rgb(${SEPIA})`} strokeWidth={4} />
            <rect x={620} y={300} width={440} height={110} rx={8} fill="#e8dcc0" />
            <text x={840} y={370} textAnchor="middle" fontSize={40} fontWeight={700} fill="#5a3a1a" fontFamily={fonts.sans}>那年的歌 · A 面</text>
            {[700, 980].map((cx) => (
              <g key={cx} transform={`rotate(${frame * 4} ${cx} 500)`}>
                <circle cx={cx} cy={500} r={56} fill="#140e0a" stroke={`rgb(${SEPIA})`} strokeWidth={3} />
                {[0, 60, 120, 180, 240, 300].map((a) => (
                  <line key={a} x1={cx} y1={500} x2={cx + Math.cos((a * Math.PI) / 180) * 30} y2={500 + Math.sin((a * Math.PI) / 180) * 30} stroke={`rgb(${SEPIA})`} strokeWidth={4} />
                ))}
              </g>
            ))}
            {Array.from({ length: 40 }, (_, i) => {
              const h = 8 + Math.abs(Math.sin(i * 0.9 + frame / 4)) * 50;
              return <rect key={i} x={560 + i * 14} y={680 - h / 2} width={8} height={h} rx={3} fill={`rgba(${SEPIA},0.7)`} />;
            })}
          </svg>
          <div style={{ position: "absolute", left: 1260, top: 330, fontFamily: fonts.mono, fontSize: 20, letterSpacing: 4, color: palette.dim }}>
            眼眶湿度
            <div style={{ marginTop: 10, width: 26, height: 260, border: `1px solid ${palette.faint}`, position: "relative" }}>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${tears * 100}%`, background: "rgba(140,190,255,0.8)" }} />
            </div>
          </div>
        </div>
      )}
      {seg(1) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(1) }}>
          <div style={{ position: "absolute", left: 959, top: 150, width: 2, height: 640, background: palette.faint }} />
          <div style={{ position: "absolute", left: 0, width: 960, top: 170, textAlign: "center", fontSize: 40, fontWeight: 900, color: palette.dim }}>当时</div>
          <div style={{ position: "absolute", left: 960, width: 960, top: 170, textAlign: "center", fontSize: 40, fontWeight: 900, color: `rgb(${SEPIA})`, opacity: now }}>现在回看</div>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} style={{ position: "absolute", left: 330 + i * 8, top: 330 - i * 14, width: 260, height: 330, background: "#d9d6cf", border: "1px solid #999", transform: `rotate(${(i % 3) - 1}deg)` }}>
              <div style={{ position: "absolute", right: 16, top: 12, fontFamily: fonts.mono, fontSize: 32, color: palette.alert }}>{[72, 65, 81, 58, 77, 69][i]}</div>
            </div>
          ))}
          <div style={{ position: "absolute", left: 360, top: 700, padding: "10px 20px", borderRadius: 14, background: "rgba(232,238,242,0.92)", color: "#14181e", fontSize: 32, fontWeight: 800 }}>累死了……</div>
          <div style={{ position: "absolute", inset: 0, opacity: now }}>
            <Polaroid x={1440} y={260} w={380} kind="desk" caption="最好的时光 ♥" tone={1} />
          </div>
        </div>
      )}
      {seg(2) && (
        <div style={{ position: "absolute", inset: 0, opacity: segIn(2) }}>
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
            <rect x={620} y={260} width={680} height={460} fill="#1c160f" stroke={`rgba(${SEPIA},0.7)`} strokeWidth={3} />
            <rect x={600} y={220} width={720} height={80} fill={`rgb(${SEPIA})`} />
            <text x={960} y={276} textAnchor="middle" fontSize={50} fontWeight={900} fill="#2a1a0a" fontFamily={fonts.sans}>老街面馆</text>
            <rect x={880} y={420} width={160} height={300} fill="#2a2016" stroke={`rgba(${SEPIA},0.6)`} />
            <rect x={680} y={360} width={150} height={120} fill={`rgba(${SEPIA},0.25)`} />
            <rect x={1090} y={360} width={150} height={120} fill={`rgba(${SEPIA},0.25)`} />
          </svg>
          <div style={{ position: "absolute", left: 1360, top: 300, fontSize: 36, color: "#e6c46a" }}>★★☆☆☆</div>
          <div style={{ position: "absolute", left: 1360, top: 350, fontFamily: fonts.mono, fontSize: 22, color: palette.dim }}>“其实挺难吃”</div>
          {Array.from({ length: Math.min(10, hearts) }, (_, i) => (
            <div key={i} style={{ position: "absolute", left: 700 + ((i * 97) % 520), top: 640 - ((t2 - 3 * BEAT - i * BEAT / 2) * 3) , fontSize: 40, color: palette.alert, opacity: 0.85 }}>♥</div>
          ))}
          <div style={{ position: "absolute", left: 1360, top: 420, fontFamily: fonts.mono, fontSize: 26, color: palette.alert, opacity: hearts > 0 ? 1 : 0 }}>亲切 +{hearts * 10}</div>
        </div>
      )}
      <Sfx name="shutter" at={cues[0]} volume={0.3} />
      <Sfx name="rise" at={cues[0] + 2 * BEAT} volume={0.2} />
      <Sfx name="glint" at={cues[1] + 4 * BEAT} volume={0.4} />
      {[3, 4, 5, 6].map((b) => (
        <Sfx key={b} name="glint" at={cues[2] + b * BEAT} volume={0.15} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
