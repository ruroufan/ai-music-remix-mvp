import React from "react";
import { useCurrentFrame, interpolate, random } from "remotion";
import { ObsFrame } from "../../../channels/backlit/ObsFrame";
import { FocusBox, Halo, Horizon } from "../../../channels/backlit/parts";
import { fonts, palette } from "../../../channels/backlit/look";
import { Subtitles } from "../../../components/Subtitles";
import { Sfx } from "../../../components/Sfx";
import { useRamp, BEAT, type SceneProps } from "../timing";

const FLOOR = 820;
const DOOR = { x: 1240, w: 220 };
const KEYHOLE = { x: DOOR.x - DOOR.w / 2 + 40, y: 600 };
const PEEPER = { x: KEYHOLE.x - 120 };

// Someone kneeling at a door, eye to the keyhole (facing right).
const Peeper: React.FC<{ x: number; rim: string; fill?: string }> = ({ x, rim, fill = "#030405" }) => (
  <svg width={220} height={260} viewBox="0 0 220 260" style={{ position: "absolute", left: x - 110, top: FLOOR - 260 }}>
    <g fill={fill} stroke={rim} strokeWidth="2.5">
      <path d="M40 260 L60 180 Q70 150 110 140 L150 150 Q170 160 160 180 L120 190 L130 260 Z" />
      <path d="M60 175 Q70 110 130 92 L160 96 Q172 104 165 118 L120 140 Z" />
      <circle cx="178" cy="84" r="28" />
    </g>
  </svg>
);

// Sartre's keyhole, in six beats of story.
export const KeyholeScene: React.FC<SceneProps> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const set = useRamp(0, BEAT);
  const peeper = useRamp(cues[1], 10);
  const absorbed = 0.75 + 0.25 * Math.sin(frame / 6);
  // four footsteps, one per beat
  const steps = [0, 1, 2, 3].map((k) => cues[2] + BEAT + k * BEAT);
  const corridor = interpolate(frame, [cues[2], cues[3]], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const seen = useRamp(cues[3], 4);
  const box = useRamp(cues[3] + BEAT, 6);
  const shame = frame >= cues[4] && frame < cues[5];
  const glitch = shame && frame - cues[4] < 10 ? (random(`g${frame}`) - 0.5) * 30 : 0;
  const exhibit = useRamp(cues[5], 10);
  const rim = exhibit > 0 ? `rgba(232,238,242,${0.3 * (1 - exhibit)})` : shame ? palette.alert : seen > 0 ? "rgba(232,238,242,0.9)" : `rgba(${palette.halo},${0.9 * absorbed})`;

  return (
    <ObsFrame duration={duration}>
      <div style={{ position: "absolute", inset: 0, opacity: set, transform: `translateX(${glitch}px)` }}>
        <Horizon y={FLOOR} />
        {/* the door, warm light leaking around it and through the keyhole */}
        <Halo x={DOOR.x} y={520} r={260} intensity={0.55} />
        <div style={{ position: "absolute", left: DOOR.x - DOOR.w / 2, top: 280, width: DOOR.w, height: FLOOR - 280, background: "#05070a", boxShadow: `0 0 0 3px rgba(${palette.halo},0.45)` }} />
        <div style={{ position: "absolute", left: KEYHOLE.x - 7, top: KEYHOLE.y - 12, width: 14, height: 24, borderRadius: "7px 7px 2px 2px", background: `rgb(${palette.halo})`, boxShadow: `0 0 18px rgb(${palette.halo})` }} />
        <div style={{ position: "absolute", left: 120, top: 210, fontFamily: fonts.mono, fontSize: 18, letterSpacing: 4, color: palette.dim }}>SCENE · 走廊 / 门 / 钥匙孔</div>

        {/* corridor light from the left: someone is coming */}
        <div style={{ position: "absolute", left: 0, top: 0, width: 900, height: 1080, background: `linear-gradient(90deg, rgba(200,220,255,${0.22 * corridor}), transparent)` }} />
        {steps.map((t, k) => (
          <div
            key={k}
            style={{
              position: "absolute",
              left: 140 + k * 120,
              top: FLOOR + 40 + (k % 2) * 30,
              width: 34,
              height: 16,
              borderRadius: 8,
              background: "rgba(200,220,255,0.5)",
              opacity: frame >= t && exhibit === 0 ? 1 : 0,
            }}
          />
        ))}
        {/* the cold beam that catches him */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1920,
            height: 1080,
            opacity: seen * (1 - exhibit),
            background: `linear-gradient(100deg, transparent 20%, rgba(220,235,255,0.18) 35%, transparent 55%)`,
          }}
        />

        <div style={{ opacity: peeper }}>
          {/* in the exhibit he becomes a flat grey thing in a glass case */}
          <div style={{ position: "absolute", inset: 0, filter: exhibit > 0 ? `grayscale(1) brightness(${1 + exhibit * 0.6})` : undefined }}>
            <Peeper x={PEEPER.x} rim={rim} fill={exhibit > 0.5 ? "#4a525c" : "#030405"} />
          </div>
        </div>
        <FocusBox x={PEEPER.x + 10} y={FLOOR - 130} w={260} h={300} progress={box * (1 - exhibit)} label="SUBJECT · 偷看的人" color={shame ? palette.alert : palette.accent} />

        {/* the vitrine */}
        <div style={{ position: "absolute", inset: 0, opacity: exhibit }}>
          <div style={{ position: "absolute", left: PEEPER.x - 170, top: FLOOR - 330, width: 340, height: 330, border: `2px solid rgba(${palette.accentRgb},0.55)`, background: "linear-gradient(135deg, rgba(160,200,220,0.12), transparent 60%)" }} />
          <div style={{ position: "absolute", left: PEEPER.x - 170, top: FLOOR, width: 340, height: 50, background: "#1a212d" }} />
          <div style={{ position: "absolute", left: PEEPER.x + 200, top: FLOOR - 120, padding: "10px 16px", border: `1px solid ${palette.faint}`, fontFamily: fonts.mono, fontSize: 16, lineHeight: 1.7, color: palette.dim }}>
            EXHIBIT No.02
            <br />
            被看的东西
          </div>
        </div>
      </div>

      {/* shame: the word flickers behind everything */}
      {shame && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", fontSize: 260, fontWeight: 900, letterSpacing: 40, color: `rgba(255,77,109,${0.18 + random(`s${frame}`) * 0.1})`, transform: `translateX(${-glitch}px)` }}>
          羞耻
        </div>
      )}

      <Sfx name="glint" at={cues[1]} volume={0.25} />
      {steps.map((t, k) => (
        <Sfx key={k} name="step" at={t} volume={0.6 + k * 0.1} />
      ))}
      <Sfx name="shutter" at={cues[3] + BEAT} volume={0.6} />
      <Sfx name="boom" at={cues[3]} volume={0.5} />
      <Sfx name="glitch" at={cues[4]} volume={0.6} />
      <Sfx name="stamp" at={cues[5]} volume={0.6} />

      <Subtitles lines={lines} cues={cues} duration={duration} />
    </ObsFrame>
  );
};
