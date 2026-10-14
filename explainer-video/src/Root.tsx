import React from "react";
import { Composition } from "remotion";
import "./fonts";
import { EpisodeVideo, type EpisodeDef } from "./EpisodeVideo";
import { FPS, HEIGHT, WIDTH } from "./theme";
import { pride } from "./episodes/pride";
import { pleasing } from "./episodes/pleasing";

// One composition per episode. Render with `npx remotion render src/index.ts <id>`.
const episodes: [string, EpisodeDef][] = [
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
