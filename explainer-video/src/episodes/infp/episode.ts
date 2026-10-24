import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "人格 No.06 · NF",
  topic: "理想",
  topicLatin: "INFP · THE MEDIATOR",
};

export const episode: EpisodeData = {
  id: "infp",
  title: "INFP · 理想",
  bpm: 120, // 15 frames per beat
  script,
  music: "bossanova", // its own set of sounds: a nylon guitar in the bossa pattern, rim-click clave, shaker, upright bass, brushes — a flute and strings
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // A minor → C major. energy: 0 the nylon guitar alone · 1 + rim clave and
  // shaker · 2 + upright bass, brushed kit · 3 + flute and strings. The
  // ending — the dome lifted, the flower opening in the wind — lands in C.
  moods: {
    series: { chord: "Am F", energy: 3 },
    hook: { chord: "Am Dm G C", energy: 1 },
    title: { chord: "Am F", energy: 2 },
    diagnosis: { chord: "F G Am Am", energy: 2 },
    misread: { chord: "Am Dm G C", energy: 2 },
    everyday: { chord: "Am Dm G C", energy: 3 },
    clean: { chord: "F C Dm E", energy: 3 },
    answer: { chord: "F G Am E", energy: 2 },
    question: { chord: "Am", energy: 0 },
    cost: { chord: "Dm Am F E", energy: 2 },
    turn: { chord: "F G Am Am", energy: 1 },
    ending: { chord: "F G C C", energy: 3 },
  },
};
