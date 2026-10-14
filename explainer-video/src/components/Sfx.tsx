import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { onBeat } from "../timeline";

export type SfxName = "boom" | "shatter" | "rise" | "whoosh" | "glint";

// A one-shot sound effect at scene-local frame `at` — place it next to the
// animation it belongs to so the two stay in sync when timings change. Scenes
// start on the beat grid, so snapping to half beats keeps every hit on the music.
export const Sfx: React.FC<{ name: SfxName; at: number; volume?: number }> = ({ name, at, volume = 0.7 }) => (
  <Sequence from={Math.max(0, onBeat(at))} layout="none">
    <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
  </Sequence>
);
