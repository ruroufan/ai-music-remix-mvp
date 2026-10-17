import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "观察 No.14",
  topic: "自我怀疑",
  topicLatin: "SELF-DOUBT",
};

export const episode: EpisodeData = {
  id: "doubt",
  title: "自我怀疑",
  bpm: 120, // 15 frames per beat
  script,
  music: "afrohouse", // its own set of sounds: deep kick, congas, clave, shaker, kalimba, offbeat sub, "ooh" choir
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // A minor → C major. energy: 0 kalimba + pad · 1 + shaker, kick, offbeat sub ·
  // 2 + congas, clave, clap · 3 + the "ooh" choir and conga fills. The ending —
  // walking out of the circle — resolves to C.
  moods: {
    hook: { chord: "Am Am F G", energy: 1 },
    title: { chord: "Am F", energy: 2 },
    diagnosis: { chord: "F G Am Am", energy: 2 },
    misread: { chord: "Am F C G", energy: 2 },
    everyday: { chord: "Am F C G", energy: 3 },
    circle: { chord: "Dm Am F G", energy: 3 },
    answer: { chord: "F G Am E", energy: 2 },
    question: { chord: "Am", energy: 0 },
    cost: { chord: "Dm Am F E", energy: 2 },
    russell: { chord: "F G Am Am", energy: 3 },
    ending: { chord: "F G C C", energy: 0 },
  },
};
