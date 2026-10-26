import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "人格 No.12 · SJ",
  topic: "被喜欢",
  topicLatin: "ESFJ · THE CONSUL",
};

export const episode: EpisodeData = {
  id: "esfj",
  title: "ESFJ · 被喜欢",
  bpm: 120, // 15 frames per beat
  script,
  music: "disco", // its own set of sounds: four-on-the-floor, octave bass, open hats, claps, rhythm guitar, a string section — and a bell lead
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // A minor → C major. energy: 0 strings and electric piano · 1 + kick and
  // octave bass · 2 + open hats, claps, rhythm guitar · 3 + string runs and
  // stabs, a bell lead. The ending — the small figure in his chest nods —
  // resolves into C.
  moods: {
    series: { chord: "Am F", energy: 3 },
    hook: { chord: "Am F C G", energy: 2 },
    title: { chord: "Am F", energy: 3 },
    diagnosis: { chord: "F G Am Am", energy: 1 },
    misread: { chord: "Am F C G", energy: 2 },
    everyday: { chord: "Am F C G", energy: 3 },
    smith: { chord: "Dm Am F E", energy: 2 },
    answer: { chord: "F G Am E", energy: 2 },
    question: { chord: "Am", energy: 0 },
    cost: { chord: "Dm Am F E", energy: 3 },
    turn: { chord: "F G Am Am", energy: 1 },
    ending: { chord: "F G C C", energy: 2 },
  },
};
