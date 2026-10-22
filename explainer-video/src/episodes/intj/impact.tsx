import React from "react";
import { useCurrentFrame, random } from "remotion";
import { useEpisode, useSceneIndex } from "../../EpisodeContext";
import { keyLandsAt, parseMarks } from "../../components/Kinetic";
import type { SceneProps } from "../../types";
import { BEAT } from "./timing";

// The episode's impact layer: on top of the scenes' own motion, every key
// phrase hits — a flash, a shockwave, the phrase itself slammed huge into the
// background — and in the high-energy scenes the frame's edges pulse on the
// beat.

const GOLD = "255, 199, 122";

type Hit = { at: number; end: number; text: string };
const hitsOf = (lines: SceneProps["lines"], cues: number[], duration: number): Hit[] =>
  lines
    .map((l, i) => {
      const k = keyLandsAt(l.text, BEAT);
      if (k < 0) return null;
      const key = parseMarks(l.text).find((s) => s.kind === "key");
      return { at: cues[i] + k, end: i + 1 < cues.length ? cues[i + 1] : duration, text: key ? key.text.replace(/[“”]/g, "") : "" };
    })
    .filter((h): h is Hit => h !== null && h.at < h.end);

// frames to hand to <Cam hits>
export const keyHits = (lines: SceneProps["lines"], cues: number[], duration = 1e9) => hitsOf(lines, cues, duration).map((h) => h.at);

const useEnergy = () => {
  const { data } = useEpisode() as unknown as { data: { script: { id: string }[]; moods: Record<string, { energy: number }> } };
  const idx = useSceneIndex();
  const id = data?.script?.[idx]?.id;
  return id ? data.moods[id]?.energy ?? 0 : 0;
};

// Behind the scene: the giant ghost of the phrase.
export const ImpactBack: React.FC<{ lines: SceneProps["lines"]; cues: number[]; duration: number }> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {hitsOf(lines, cues, duration).map((h) => {
        const t = frame - h.at;
        if (t < 0 || frame > h.end) return null;
        const fadeOut = Math.min(1, (h.end - frame) / 10);
        const slam = Math.exp(-t / 5);
        const size = Math.min(300, 1760 / Math.max(1, [...h.text].length));
        return (
          <div key={h.at} style={{ position: "absolute", left: 0, right: 0, top: 440 - size / 2, textAlign: "center", fontSize: size, fontWeight: 900, letterSpacing: size * 0.06, whiteSpace: "nowrap", color: "transparent", WebkitTextStroke: `${Math.max(2, size / 70)}px rgba(${GOLD},${(0.16 + 0.5 * slam) * fadeOut})`, transform: `scale(${1 + 0.35 * slam})`, filter: slam > 0.3 ? `blur(${slam * 3}px)` : undefined }}>
            {h.text}
          </div>
        );
      })}
    </>
  );
};

// In front: flash, shockwave, sparks, the beat pulse.
export const ImpactFront: React.FC<{ lines: SceneProps["lines"]; cues: number[]; duration: number }> = ({ lines, cues, duration }) => {
  const frame = useCurrentFrame();
  const energy = useEnergy();
  const pulse = energy >= 2 ? Math.exp(-(frame % BEAT) / 3.5) * (energy >= 3 ? 0.5 : 0.32) : 0;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {pulse > 0.02 && <div style={{ position: "absolute", inset: 0, boxShadow: `inset 0 0 ${160 + 120 * pulse}px rgba(${GOLD},${pulse * 0.55})` }} />}
      {hitsOf(lines, cues, duration).map((h) => {
        const t = frame - h.at;
        if (t < 0 || t > 24) return null;
        const flash = Math.exp(-t / 3);
        const ring = t / 24;
        return (
          <div key={h.at} style={{ position: "absolute", inset: 0 }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 45%, rgba(255,240,210,${0.75 * flash}), rgba(${GOLD},${0.35 * flash}) 40%, transparent 75%)`, mixBlendMode: "screen" }} />
            <div style={{ position: "absolute", left: 960 - 1100 * ring, top: 470 - 1100 * ring, width: 2200 * ring, height: 2200 * ring, borderRadius: "50%", border: `${Math.max(1, 10 * (1 - ring))}px solid rgba(${GOLD},${0.7 * (1 - ring)})` }} />
            {Array.from({ length: 18 }, (_, i) => {
              const a = random(`ia-${h.at}-${i}`) * Math.PI * 2;
              const v = 18 + random(`iv-${h.at}-${i}`) * 26;
              const x = 960 + Math.cos(a) * v * t, y = 470 + Math.sin(a) * v * t * 0.7 + 0.4 * t * t;
              return <div key={i} style={{ position: "absolute", left: x, top: y, width: 5, height: 5, borderRadius: 3, background: `rgb(${GOLD})`, boxShadow: `0 0 10px rgba(${GOLD},1)`, opacity: 1 - ring }} />;
            })}
          </div>
        );
      })}
    </div>
  );
};
