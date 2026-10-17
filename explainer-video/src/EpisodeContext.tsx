import React, { useContext } from "react";
import type { Timeline } from "./timeline";
import type { Brand } from "./types";
import { theme } from "./theme";

// What shared components (subtitles, sound effects) need to know about the
// episode they are playing in.
// `fx` turns on the richer motion layer: kinetic subtitles (characters cascade
// in), 【【key phrases】】 that hit harder, a camera that breathes and punches on
// the beat, zoom-blur cuts, light sweeps and floating dust.
export type EpisodeLook = { accent: string; accentGlow: string; font: string; fx?: boolean; key?: string; keyGlow?: string; board?: boolean };
export type EpisodeCtx = { timeline: Timeline; look: EpisodeLook; brand: Brand };

export const EpisodeContext = React.createContext<EpisodeCtx | null>(null);

export const useEpisode = (): EpisodeCtx => {
  const ctx = useContext(EpisodeContext);
  if (!ctx) throw new Error("useEpisode() outside an <EpisodeVideo>");
  return ctx;
};

export const defaultLook: EpisodeLook = { accent: theme.accent, accentGlow: "rgba(224,83,63,0.6)", font: theme.font };

// Index of the scene being rendered (for chrome that needs the global time).
export const SceneIndexContext = React.createContext(0);
export const useSceneIndex = () => useContext(SceneIndexContext);
