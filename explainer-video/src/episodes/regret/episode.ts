import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "观察 No.05",
  topic: "后悔",
  topicLatin: "REGRET",
};

export const episode: EpisodeData = {
  id: "regret",
  title: "后悔",
  bpm: 120, // 15 frames per beat — one replay of the clip = one bar
  script,
  music: "drive",
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // C minor. energy: 0 pad only · 1 bass + hats · 2 full beat · 3 full beat + arp.
  // Peak at "一百次"; the ending switches the projector off and resolves to C major.
  moods: {
    hook: { chord: "Cm Cm Ab G", energy: 1 },
    title: { chord: "Cm Ab", energy: 2 },
    diagnosis: { chord: "Ab Bb Cm Cm", energy: 2 },
    misread: { chord: "Cm Ab Eb Bb", energy: 2 },
    everyday: { chord: "Cm Ab Eb G", energy: 3 },
    double: { chord: "Fm Ab Cm G", energy: 3 },
    answer: { chord: "Ab Bb Cm G", energy: 2 },
    question: { chord: "Cm", energy: 0 },
    past: { chord: "Fm Cm Ab G", energy: 1 },
    remedy: { chord: "Ab Eb Bb Cm", energy: 2 },
    ending: { chord: "Ab Eb Bb C", energy: 0 },
  },
};
