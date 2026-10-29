import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "观察 No.06",
  topic: "孤独",
  topicLatin: "SOLITUDE",
};

export const episode: EpisodeData = {
  id: "solitude",
  title: "孤独",
  bpm: 120, // 15 frames per beat; the porcupines close in and pull apart once per bar
  script,
  music: "drive",
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // F minor. energy: 0 pad only · 1 bass + hats · 2 full beat · 3 full beat + arp.
  // Peak in the crowd; the window seat at the end resolves to F major.
  moods: {
    hook: { chord: "Fm Fm Db C", energy: 1 },
    title: { chord: "Fm Db", energy: 2 },
    diagnosis: { chord: "Db Eb Fm Fm", energy: 2 },
    fable: { chord: "Fm Db Ab Eb", energy: 2 },
    misread: { chord: "Bbm Db Fm C", energy: 2 },
    everyday: { chord: "Fm Db Ab C", energy: 3 },
    crowd: { chord: "Db Eb Fm C", energy: 3 },
    answer: { chord: "Bbm Eb Fm C", energy: 2 },
    question: { chord: "Fm", energy: 0 },
    quote: { chord: "Db Ab Eb Fm", energy: 1 },
    solitude: { chord: "Db Ab Eb Fm", energy: 2 },
    ending: { chord: "Db Ab Eb F", energy: 0 },
  },
};
