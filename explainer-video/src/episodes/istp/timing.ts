import { createTimeline } from "../../timeline";
import { episode } from "./episode";

export const timeline = createTimeline(episode.script, episode.bpm, episode.timing);
export const { BEAT, HALF_BEAT, BAR, onBeat } = timeline;
export { useRamp } from "../../anim";
export type { SceneProps } from "../../types";
