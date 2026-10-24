import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "人格 No.04 · NT",
  topic: "抬杠",
  topicLatin: "ENTP · THE DEBATER",
};

export const episode: EpisodeData = {
  id: "entp",
  title: "ENTP · 抬杠",
  bpm: 120, // 15 frames per beat
  script,
  music: "funk", // its own set of sounds: a tight funk kit with ghost notes, slap bass, clavinet, brass stabs — and a Rhodes
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // F♯ minor → A major. energy: 0 a Rhodes alone · 1 + a kick and rim, the
  // clavinet comping · 2 + the full kit with ghost snares, the slap bass,
  // 16th hats · 3 + brass stabs on the off-beats, a wah line. The ending —
  // two chairs, face to face — is the Rhodes, in A.
  moods: {
    series: { chord: "F#m D", energy: 3 },
    hook: { chord: "F#m D A E", energy: 1 },
    title: { chord: "F#m D", energy: 2 },
    diagnosis: { chord: "D E F#m F#m", energy: 2 },
    misread: { chord: "F#m D A E", energy: 2 },
    everyday: { chord: "F#m D A E", energy: 3 },
    schopenhauer: { chord: "Bm F#m D C#m", energy: 3 },
    answer: { chord: "D E F#m C#m", energy: 2 },
    question: { chord: "F#m", energy: 0 },
    cost: { chord: "Bm F#m D C#m", energy: 3 },
    turn: { chord: "D E F#m F#m", energy: 1 },
    ending: { chord: "D E A A", energy: 0 },
  },
};
