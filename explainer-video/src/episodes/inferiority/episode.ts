import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "观察 No.03",
  topic: "自卑",
  topicLatin: "INFERIORITY",
};

export const episode: EpisodeData = {
  id: "inferiority",
  title: "自卑",
  bpm: 120, // 15 frames per beat
  script,
  music: "drive",
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // E minor. energy: 0 pad only · 1 bass + hats · 2 full beat · 3 full beat + arp.
  moods: {
    hook: { chord: "Em Em C B", energy: 1 },
    title: { chord: "Em C", energy: 2 },
    diagnosis: { chord: "C D Em Em", energy: 2 },
    twoFaces: { chord: "Em C G D", energy: 2 },
    showoff: { chord: "Em C G B", energy: 3 },
    child: { chord: "C G Am Em", energy: 1 },
    fork: { chord: "Am B Em Em", energy: 2 },
    answer: { chord: "C D Em B", energy: 3 },
    question: { chord: "Em", energy: 0 },
    pit: { chord: "Em C G B", energy: 3 },
    yesterday: { chord: "C G D Em", energy: 2 },
    ending: { chord: "C G C G", energy: 0 },
  },
};
