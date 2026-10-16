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

// One composition per episode. Render with `npx remotion render src/index.ts <id>`.
const episodes: [string, EpisodeDef][] = [
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
