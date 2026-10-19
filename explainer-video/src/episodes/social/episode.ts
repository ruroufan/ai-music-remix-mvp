import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "观察 No.16",
  topic: "社恐",
  topicLatin: "SOCIAL ANXIETY",
};

export const episode: EpisodeData = {
  id: "social",
  title: "社恐",
  bpm: 120, // 15 frames per beat
  script,
  music: "electroswing", // its own set of sounds: swung drums, walking upright bass, piano comping, brass stabs, a clarinet
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // G minor → G major. energy: 0 a stride piano alone · 1 + walking bass,
  // brushes, piano comping · 2 + four-on-the-floor kick, claps, brass stabs ·
  // 3 + the clarinet line and a brass riff. The ending — daylight, walking
  // into the crowd — turns to G major.
  moods: {
    hook: { chord: "Gm Cm D Gm", energy: 1 },
    title: { chord: "Gm D", energy: 2 },
    diagnosis: { chord: "Eb D Gm Gm", energy: 2 },
    misread: { chord: "Gm Cm D Gm", energy: 2 },
    everyday: { chord: "Gm Cm Eb D", energy: 3 },
    experiment: { chord: "Gm Cm D Gm", energy: 2 },
    answer: { chord: "Eb D Gm D", energy: 3 },
    question: { chord: "Gm", energy: 0 },
    cost: { chord: "Cm Gm D Gm", energy: 2 },
    relief: { chord: "Eb Bb C D", energy: 1 },
    ending: { chord: "C D G G", energy: 0 },
  },
};
