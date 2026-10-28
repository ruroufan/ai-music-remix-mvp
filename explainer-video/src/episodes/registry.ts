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
import { episode as intp, brand as intpBrand } from "./intp/episode.ts";
import { episode as entj, brand as entjBrand } from "./entj/episode.ts";
import { episode as entp, brand as entpBrand } from "./entp/episode.ts";
import { episode as infj, brand as infjBrand } from "./infj/episode.ts";
import { episode as infp, brand as infpBrand } from "./infp/episode.ts";
import { episode as enfj, brand as enfjBrand } from "./enfj/episode.ts";
import { episode as enfp, brand as enfpBrand } from "./enfp/episode.ts";
import { episode as istj, brand as istjBrand } from "./istj/episode.ts";
import { episode as isfj, brand as isfjBrand } from "./isfj/episode.ts";
import { episode as estj, brand as estjBrand } from "./estj/episode.ts";
import { episode as esfj, brand as esfjBrand } from "./esfj/episode.ts";
import { episode as istp, brand as istpBrand } from "./istp/episode.ts";
import { episode as isfp, brand as isfpBrand } from "./isfp/episode.ts";

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
  intp: { episode: intp, brand: intpBrand },
  entj: { episode: entj, brand: entjBrand },
  entp: { episode: entp, brand: entpBrand },
  infj: { episode: infj, brand: infjBrand },
  infp: { episode: infp, brand: infpBrand },
  enfj: { episode: enfj, brand: enfjBrand },
  enfp: { episode: enfp, brand: enfpBrand },
  istj: { episode: istj, brand: istjBrand },
  isfj: { episode: isfj, brand: isfjBrand },
  estj: { episode: estj, brand: estjBrand },
  esfj: { episode: esfj, brand: esfjBrand },
  istp: { episode: istp, brand: istpBrand },
  isfp: { episode: isfp, brand: isfpBrand },
};
