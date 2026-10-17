import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "观察 No.04",
  topic: "焦虑",
  topicLatin: "ANXIETY",
};

export const episode: EpisodeData = {
  id: "anxiety",
  title: "焦虑",
  bpm: 120, // 15 frames per beat
  script,
  music: "drive",
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // D minor. energy: 0 pad only · 1 bass + hats · 2 full beat · 3 full beat + arp.
  // The cliff parable is held back to a heartbeat-like pulse so the vertigo
  // sits in the picture; the loss of every other path is the peak.
  moods: {
    hook: { chord: "Dm Dm Bb A", energy: 1 },
    title: { chord: "Dm Bb", energy: 2 },
    diagnosis: { chord: "Bb C Dm Dm", energy: 2 },
    misread: { chord: "Dm Bb F C", energy: 2 },
    everyday: { chord: "Dm Bb F A", energy: 3 },
    cliff: { chord: "Gm Gm Dm A", energy: 1 },
    answer: { chord: "Bb C Dm A", energy: 3 },
    question: { chord: "Dm", energy: 0 },
    edge: { chord: "Gm Dm A Dm", energy: 1 },
    quote: { chord: "Bb F C Dm", energy: 2 },
    ending: { chord: "Bb F C F", energy: 0 },
  },
};
