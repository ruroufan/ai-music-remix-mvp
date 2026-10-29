import React from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { Halo } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { useEpisode } from "../../../EpisodeContext";
import { KineticText } from "../../../components/Kinetic";
import { FILTER, FILTER_RGB, Face, Phone } from "../faces";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FACTS = ["JEAN BAUDRILLARD", "让 · 鲍德里亚", "1929 — 2007 · 法国哲学家", "SIMULACRA AND SIMULATION · 1981"];

// A profile in a frame: round glasses, a camera beside him (he photographed too).
const Portrait: React.FC = () => (
  <svg width={300} height={360} viewBox="0 0 250 300" style={{ position: "absolute", left: 470, top: 200, overflow: "visible" }}>
    <rect x={0} y={0} width={250} height={300} rx={12} fill="rgba(14,20,28,0.9)" stroke={`rgba(${palette.halo},0.55)`} strokeWidth={2} />
    <g fill="#030405" stroke={`rgba(${palette.halo},0.85)`} strokeWidth={1.8}>
      <path d="M36 300 Q44 232 104 222 Q160 226 182 300 Z" />
      <path d="M86 236 L84 196 L122 196 L124 236 Z" />
      <path d="M78 66 Q118 38 152 72 Q162 88 162 108 L174 128 L162 134 Q166 148 158 158 Q154 178 128 182 L98 198 Q62 194 58 138 Q54 88 78 66 Z" />
      {/* short hair */}
      <path d="M72 84 Q70 52 104 46 Q138 40 154 66 Q130 56 104 62 Q84 68 72 84 Z" fill={`rgba(232,238,242,0.35)`} />
    </g>
    {/* round glasses */}
    <circle cx={146} cy={106} r={13} fill="rgba(200,220,255,0.12)" stroke={`rgba(232,238,242,0.85)`} strokeWidth={2.5} />
    <path d="M133 104 L96 98" stroke={`rgba(232,238,242,0.7)`} strokeWidth={2.2} />
    {/* a camera */}
    <g transform="translate(176 232)">
      <rect x={0} y={0} width={56} height={36} rx={5} fill="#1a1f26" stroke={`rgba(${palette.halo},0.7)`} strokeWidth={1.6} />
      <rect x={8} y={-6} width={14} height={7} rx={2} fill="#1a1f26" stroke={`rgba(${palette.halo},0.7)`} strokeWidth={1.4} />
      <circle cx={30} cy={18} r={11} fill="#0a0d12" stroke={`rgba(232,238,242,0.7)`} strokeWidth={2} />
      <circle cx={30} cy={18} r={4} fill={`rgba(${palette.accentRgb},0.8)`} />
    </g>
  </svg>
);

// 0 · a dossier: Baudrillard, his dates, the 1981 book; then the word itself,
//     拟像 · SIMULACRUM, stamped in the filter's pink.
// 1 · the quote as a card. Under it, a printed photo of a face (真实) and the
//     same face on a phone, filtered (拟像) — on every beat the screen glows
//     brighter and the photo fades: the copy looks realer than the real.
export const DiagnosisScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const { look } = useEpisode();
  const pinkLook = { ...look, accent: FILTER, accentGlow: `rgba(${FILTER_RGB},0.8)` };
  const file = useRamp(0, 10);
  const word = useRamp(4.5 * BEAT, 8);
  const card = useRamp(cues[1], 8);
  const t1 = frame - cues[1];
  const pair = useRamp(cues[1] + 2 * BEAT, 12);
  const k = interpolate(frame, [cues[1] + 3 * BEAT, cues[1] + 10 * BEAT], [0, 1], clamp);
  const beat = Math.exp(-(((t1 % BEAT) + BEAT) % BEAT) / 6) * (k > 0 ? 1 : 0);
  const en = useRamp(cues[1] + 5 * BEAT, 12);
  return (
    <ObsFrame duration={duration}>
      {card < 1 && (
        <div style={{ position: "absolute", inset: 0, opacity: file * (1 - card), transform: `translateY(${-card * 40}px)` }}>
          <Halo x={620} y={380} r={360} intensity={0.5} />
          <Portrait />
          {FACTS.map((f, i) => {
            const p = interpolate(frame, [(i + 1) * BEAT * 0.75, (i + 1) * BEAT * 0.75 + 8], [0, 1], clamp);
            const name = i === 1;
            return (
              <div
                key={f}
                style={{
                  position: "absolute",
                  left: 860,
                  top: [230, 276, 380, 440][i],
                  opacity: p,
                  transform: `translateX(${(1 - p) * 30}px)`,
                  fontFamily: name ? undefined : fonts.mono,
                  fontSize: name ? 72 : 22,
                  fontWeight: name ? 900 : 400,
                  letterSpacing: name ? 6 : 5,
                  color: i === 3 ? `rgb(${palette.halo})` : name ? palette.ink : palette.dim,
                  padding: i === 3 ? "8px 16px" : 0,
                  border: i === 3 ? `1px solid rgba(${palette.halo},0.6)` : undefined,
                  whiteSpace: "nowrap",
                }}
              >
                {f}
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 860, top: 520, opacity: word, transform: `scale(${1.4 - 0.4 * word})`, transformOrigin: "0 50%", display: "flex", alignItems: "baseline", gap: 22 }}>
            <span style={{ fontSize: 84, fontWeight: 900, letterSpacing: 10, color: FILTER, textShadow: `0 0 26px rgba(${FILTER_RGB},0.7)` }}>拟像</span>
            <span style={{ fontFamily: fonts.mono, fontSize: 24, letterSpacing: 6, color: palette.dim }}>SIMULACRUM</span>
          </div>
        </div>
      )}
      {t1 >= 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: card }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", fontFamily: fonts.mono, fontSize: 18, letterSpacing: 5, color: palette.dim }}>JEAN BAUDRILLARD · 1981</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 164, textAlign: "center", fontSize: 44, fontWeight: 700, color: palette.dim, letterSpacing: 4 }}>
            <KineticText text="在现代社会，" t={t1} look={look} beat={BEAT} seed="q0" />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 236, textAlign: "center", fontSize: 80, fontWeight: 900, letterSpacing: 8 }}>
            <KineticText text="【拟像】比真实【【更真实】】。" t={t1 - BEAT} look={pinkLook} beat={BEAT} seed="q1" />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 404, textAlign: "center", fontFamily: fonts.mono, fontSize: 19, letterSpacing: 4, color: palette.dim, opacity: en }}>THE HYPERREAL — MORE REAL THAN THE REAL</div>
          <div style={{ position: "absolute", inset: 0, opacity: pair }}>
            {/* the real: a printed photo, fading */}
            <div style={{ position: "absolute", left: 700 - 130, top: 520, width: 260, height: 320, background: "#e9e4da", padding: 12, paddingBottom: 46, boxShadow: "0 16px 40px rgba(0,0,0,0.6)", transform: "rotate(-3deg)", opacity: 1 - 0.6 * k }}>
              <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#1a1f26", filter: `saturate(${1 - 0.6 * k}) brightness(${1 - 0.4 * k})` }}>
                <Face id="dg-real" x={118} y={150} size={300} rim={0.3} />
              </div>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 10, textAlign: "center", fontSize: 22, fontWeight: 800, color: "#3a3128" }}>真实</div>
            </div>
            <div style={{ position: "absolute", left: 700 - 130, top: 870, width: 260, textAlign: "center", fontFamily: fonts.mono, fontSize: 16, letterSpacing: 4, color: palette.dim }}>THE REAL</div>
            {/* the copy: brighter on every beat */}
            <Phone x={1220} y={680} w={210} h={420} glow={0.6 + 1.2 * k + 0.6 * beat}>
              <Face id="dg-copy" x={95} y={190} size={260} smooth={1} bright={0.9} slim={0.7} eyes={0.6} rim={0} style={{ filter: `brightness(${1 + 0.25 * k + 0.15 * beat})` }} />
            </Phone>
            <div style={{ position: "absolute", left: 1220 - 150, width: 300, top: 904, textAlign: "center", fontFamily: fonts.mono, fontSize: 16, letterSpacing: 4, color: FILTER }}>SIMULACRUM · 拟像</div>
            <div style={{ position: "absolute", left: 960 - 60, top: 650, width: 120, textAlign: "center", fontFamily: fonts.mono, fontSize: 44, color: palette.dim }}>{"<"}</div>
          </div>
        </div>
      )}
      <Sfx name="whoosh" at={0} volume={0.3} />
      {FACTS.map((_, i) => (
        <Sfx key={i} name="shutter" at={Math.round((i + 1) * BEAT * 0.75)} volume={0.14} />
      ))}
      <Sfx name="stamp" at={4.5 * BEAT} volume={0.55} />
      <Sfx name="stamp" at={cues[1] + BEAT} volume={0.5} />
      {[3, 5, 7, 9].map((b) => (
        <Sfx key={b} name="glint" at={cues[1] + b * BEAT} volume={0.18} />
      ))}
      <Subtitles lines={lines} cues={cues} duration={duration} hide={[1]} />
    </ObsFrame>
  );
};
