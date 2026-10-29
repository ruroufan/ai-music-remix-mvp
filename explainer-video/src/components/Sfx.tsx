import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { useEpisode } from "../EpisodeContext";

export type SfxName = "boom" | "shatter" | "rise" | "whoosh" | "glint" | "step" | "shutter" | "glitch" | "stamp";

// A one-shot sound effect at scene-local frame `at` — place it next to the
// animation it belongs to so the two stay in sync when timings change. Scenes
// start on the beat grid, so snapping to half beats keeps every hit on the music.
// Leaves headroom for effects that land on top of a full drum hit.
const SFX_GAIN = 0.75;

export const Sfx: React.FC<{ name: SfxName; at: number; volume?: number }> = ({ name, at, volume = 0.7 }) => {
  const { timeline } = useEpisode();
  return (
    <Sequence from={Math.max(0, timeline.onBeat(at))} layout="none">
      <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume * SFX_GAIN} />
    </Sequence>
  );
};
