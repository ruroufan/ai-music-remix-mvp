import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "观察 No.07",
  topic: "谦虚",
  topicLatin: "HUMILITY",
};

export const episode: EpisodeData = {
  id: "humility",
  title: "谦虚",
  bpm: 120, // 15 frames per beat
  script,
  music: "drive",
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // G minor. energy: 0 pad only · 1 bass + hats · 2 full beat · 3 full beat + arp.
  // Peak on "拒绝赞美，是希望被赞美两次"; the mask falls on the scale and the
  // ending resolves to G major.
  moods: {
    hook: { chord: "Gm Gm Eb D", energy: 1 },
    title: { chord: "Gm Eb", energy: 2 },
    diagnosis: { chord: "Eb F Gm Gm", energy: 2 },
    misread: { chord: "Gm Eb Bb F", energy: 2 },
    everyday: { chord: "Gm Eb Bb D", energy: 3 },
    twice: { chord: "Cm Eb Gm D", energy: 3 },
    answer: { chord: "Eb F Gm D", energy: 2 },
    question: { chord: "Gm", energy: 0 },
    tired: { chord: "Cm Gm Eb D", energy: 1 },
    scale: { chord: "Eb Bb F Gm", energy: 2 },
    ending: { chord: "Eb Bb F G", energy: 0 },
  },
};
