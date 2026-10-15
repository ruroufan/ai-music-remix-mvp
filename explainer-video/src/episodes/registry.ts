// Every episode's plain data (no React), for code that runs outside the video:
// the music and voiceover scripts, and the font preloader. Add new episodes here
// (and their scenes in src/Root.tsx).
import type { Brand, EpisodeData } from "../types.ts";
import { episode as pride, brand as prideBrand } from "./pride/episode.ts";
import { episode as pleasing, brand as pleasingBrand } from "./pleasing/episode.ts";
import { episode as inferiority, brand as inferiorityBrand } from "./inferiority/episode.ts";
import { episode as anxiety, brand as anxietyBrand } from "./anxiety/episode.ts";
import { episode as regret, brand as regretBrand } from "./regret/episode.ts";
import { episode as solitude, brand as solitudeBrand } from "./solitude/episode.ts";
import { episode as humility, brand as humilityBrand } from "./humility/episode.ts";
import { episode as procrastination, brand as procrastinationBrand } from "./procrastination/episode.ts";

export const EPISODES: Record<string, { episode: EpisodeData; brand: Brand }> = {
  pride: { episode: pride, brand: prideBrand },
  pleasing: { episode: pleasing, brand: pleasingBrand },
  inferiority: { episode: inferiority, brand: inferiorityBrand },
  anxiety: { episode: anxiety, brand: anxietyBrand },
  regret: { episode: regret, brand: regretBrand },
  solitude: { episode: solitude, brand: solitudeBrand },
  humility: { episode: humility, brand: humilityBrand },
  procrastination: { episode: procrastination, brand: procrastinationBrand },
};
