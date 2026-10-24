import React from "react";
import { Composition } from "remotion";
import "./fonts";
import { EpisodeVideo, type EpisodeDef } from "./EpisodeVideo";
import { FPS, HEIGHT, WIDTH } from "./theme";
import { pride } from "./episodes/pride";
import { pleasing } from "./episodes/pleasing";
import { inferiority } from "./episodes/inferiority";
import { anxiety } from "./episodes/anxiety";
import { regret } from "./episodes/regret";
import { solitude } from "./episodes/solitude";
import { humility } from "./episodes/humility";
import { procrastination } from "./episodes/procrastination";
import { revenge } from "./episodes/revenge";
import { nostalgia } from "./episodes/nostalgia";
import { age } from "./episodes/age";
import { friction } from "./episodes/friction";
import { perfect } from "./episodes/perfect";
import { doubt } from "./episodes/doubt";
import { appearance } from "./episodes/appearance";
import { social } from "./episodes/social";
import { glass } from "./episodes/glass";
import { love } from "./episodes/love";
import { control } from "./episodes/control";
import { burnout } from "./episodes/burnout";
import { emptiness } from "./episodes/emptiness";
import { fomo } from "./episodes/fomo";
import { intj } from "./episodes/intj";
import { intp } from "./episodes/intp";
import { entj } from "./episodes/entj";
import { entp } from "./episodes/entp";
import { infj } from "./episodes/infj";
import { infp } from "./episodes/infp";
import { enfj } from "./episodes/enfj";
import { enfp } from "./episodes/enfp";

// One composition per episode. Render with `npx remotion render src/index.ts <id>`.
const episodes: [string, EpisodeDef][] = [
  ["Enfp", enfp],
  ["Enfj", enfj],
  ["Infp", infp],
  ["Infj", infj],
  ["Entp", entp],
  ["Entj", entj],
  ["Intp", intp],
  ["Intj", intj],
  ["Fomo", fomo],
  ["Emptiness", emptiness],
  ["Burnout", burnout],
  ["Control", control],
  ["Love", love],
  ["Glass", glass],
  ["Social", social],
  ["Appearance", appearance],
  ["Doubt", doubt],
  ["Perfect", perfect],
  ["Friction", friction],
  ["Age", age],
  ["Nostalgia", nostalgia],
  ["Revenge", revenge],
  ["Procrastination", procrastination],
  ["Humility", humility],
  ["Solitude", solitude],
  ["Regret", regret],
  ["Anxiety", anxiety],
  ["Inferiority", inferiority],
  ["Pleasing", pleasing],
  ["Pride", pride],
];

export const Root: React.FC = () => (
  <>
    {episodes.map(([id, ep]) => (
      <Composition
        key={id}
        id={id}
        component={() => <EpisodeVideo ep={ep} />}
        durationInFrames={ep.timeline.totalFrames}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    ))}
  </>
);
