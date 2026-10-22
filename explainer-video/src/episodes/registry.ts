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
import { episode as revenge, brand as revengeBrand } from "./revenge/episode.ts";
import { episode as nostalgia, brand as nostalgiaBrand } from "./nostalgia/episode.ts";
import { episode as age, brand as ageBrand } from "./age/episode.ts";
import { episode as friction, brand as frictionBrand } from "./friction/episode.ts";
import { episode as perfect, brand as perfectBrand } from "./perfect/episode.ts";
import { episode as doubt, brand as doubtBrand } from "./doubt/episode.ts";
import { episode as appearance, brand as appearanceBrand } from "./appearance/episode.ts";
import { episode as social, brand as socialBrand } from "./social/episode.ts";
import { episode as glass, brand as glassBrand } from "./glass/episode.ts";
import { episode as love, brand as loveBrand } from "./love/episode.ts";
import { episode as control, brand as controlBrand } from "./control/episode.ts";
import { episode as burnout, brand as burnoutBrand } from "./burnout/episode.ts";
import { episode as emptiness, brand as emptinessBrand } from "./emptiness/episode.ts";
import { episode as fomo, brand as fomoBrand } from "./fomo/episode.ts";
import { episode as intj, brand as intjBrand } from "./intj/episode.ts";

export const EPISODES: Record<string, { episode: EpisodeData; brand: Brand }> = {
  pride: { episode: pride, brand: prideBrand },
  pleasing: { episode: pleasing, brand: pleasingBrand },
  inferiority: { episode: inferiority, brand: inferiorityBrand },
  anxiety: { episode: anxiety, brand: anxietyBrand },
  regret: { episode: regret, brand: regretBrand },
  solitude: { episode: solitude, brand: solitudeBrand },
  humility: { episode: humility, brand: humilityBrand },
  procrastination: { episode: procrastination, brand: procrastinationBrand },
  revenge: { episode: revenge, brand: revengeBrand },
  nostalgia: { episode: nostalgia, brand: nostalgiaBrand },
  age: { episode: age, brand: ageBrand },
  friction: { episode: friction, brand: frictionBrand },
  perfect: { episode: perfect, brand: perfectBrand },
  doubt: { episode: doubt, brand: doubtBrand },
  appearance: { episode: appearance, brand: appearanceBrand },
  social: { episode: social, brand: socialBrand },
  glass: { episode: glass, brand: glassBrand },
  love: { episode: love, brand: loveBrand },
  control: { episode: control, brand: controlBrand },
  burnout: { episode: burnout, brand: burnoutBrand },
  emptiness: { episode: emptiness, brand: emptinessBrand },
  fomo: { episode: fomo, brand: fomoBrand },
  intj: { episode: intj, brand: intjBrand },
};
