import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "观察 No.22",
  topic: "信息焦虑",
  topicLatin: "INFORMATION ANXIETY",
};

export const episode: EpisodeData = {
  id: "fomo",
  title: "信息焦虑",
  bpm: 120, // 15 frames per beat
  script,
  music: "glitchhop", // its own set of sounds: swung crunchy drums, a wobble bass, stutter edits, notification blips — and a kalimba
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // A minor → C major. energy: 0 a kalimba alone · 1 + a soft swung beat, a
  // sub · 2 + the crunchy break, the wobble bass, notification blips · 3 +
  // stutter edits (the bar's last beat chopped into repeats), a bit-crushed
  // lead. The ending — present, at the table — is the kalimba alone, in C.
  moods: {
    hook: { chord: "Am F C G", energy: 1 },
    title: { chord: "Am F", energy: 2 },
    diagnosis: { chord: "F G Am Am", energy: 2 },
    misread: { chord: "Am F C G", energy: 2 },
    everyday: { chord: "Am F C G", energy: 3 },
    seneca: { chord: "Dm Am F E", energy: 3 },
    answer: { chord: "F G Am E", energy: 2 },
    question: { chord: "Am", energy: 0 },
    cost: { chord: "Dm Am F E", energy: 3 },
    turn: { chord: "F G Am Am", energy: 1 },
    ending: { chord: "F G C C", energy: 0 },
  },
};
