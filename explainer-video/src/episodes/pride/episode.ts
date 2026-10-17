import type { EpisodeData } from "../../types.ts";
import { script } from "./script.ts";

// Header / watermark shown on every scene.
export const brand = {
  topic: "傲慢",
  topicLatin: "SUPERBIA",
  watermark: "你的频道",
};

export const episode: EpisodeData = {
  id: "pride",
  title: "傲慢",
  bpm: 72, // 25 frames per beat
  script,
  music: "ambient",
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.4, sceneUnitBeats: 2 },
  // Tension builds through the "need others" section and resolves to D major.
  moods: {
    title: { chord: "Dm", energy: 0 },
    diagnosis: { chord: "Bb", energy: 0 },
    misconception: { chord: "Gm", energy: 1 },
    social: { chord: "A", energy: 1 },
    twoLoves: { chord: "F", energy: 0 },
    podium: { chord: "Gm", energy: 1 },
    scores: { chord: "Dm", energy: 1 },
    rebuttal: { chord: "Bb", energy: 1 },
    question: { chord: "A", energy: 0 },
    cup: { chord: "Gm", energy: 1 },
    rank: { chord: "A", energy: 1 },
    audience: { chord: "F", energy: 0 },
    standFirm: { chord: "D", energy: 0 },
  },
};
