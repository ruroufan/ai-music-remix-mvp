import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "观察 No.12",
  topic: "内耗",
  topicLatin: "OVERTHINKING",
};

export const episode: EpisodeData = {
  id: "friction",
  title: "内耗",
  bpm: 120, // 15 frames per beat
  script,
  music: "guochao", // its own set of sounds: plucked zheng, dizi, gong, Chinese percussion over a half-time beat
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // D minor pentatonic (D F G A C). energy: 0 solo zheng + pad · 1 + sub and
  // frame drum · 2 + half-time beat, small cymbals, gong at the top · 3 +
  // dizi melody and 16th shaker. The threads straighten on F major.
  moods: {
    hook: { chord: "Dm Dm Bb C", energy: 1 },
    title: { chord: "Dm Bb", energy: 2 },
    diagnosis: { chord: "Bb C Dm Dm", energy: 2 },
    misread: { chord: "Dm Bb F C", energy: 2 },
    everyday: { chord: "Dm Bb F C", energy: 3 },
    student: { chord: "Gm Dm Bb C", energy: 2 },
    answer: { chord: "Bb C Dm Am", energy: 3 },
    question: { chord: "Dm", energy: 0 },
    cost: { chord: "Gm Bb Dm C", energy: 2 },
    thief: { chord: "Bb C Dm Dm", energy: 3 },
    ending: { chord: "Bb C F F", energy: 0 },
  },
};
