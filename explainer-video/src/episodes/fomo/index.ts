import type React from "react";
import type { SceneProps } from "../../types";
import { episode, brand } from "./episode";
import { timeline } from "./timing";
import { backlitLookFx } from "../../channels/backlit/look";
import { TypewriterScene } from "../../channels/backlit/TypewriterScene";

// (work in progress: every scene is a placeholder until it's drawn)
const scenes: Record<string, React.FC<SceneProps>> = Object.fromEntries(episode.script.map((s) => [s.id, TypewriterScene]));

export const fomo = { data: episode, timeline, scenes, look: backlitLookFx, brand };
