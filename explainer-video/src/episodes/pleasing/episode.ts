import type { EpisodeData } from "../../types.ts";
import { script } from "./script.ts";

// Channel identity, shown in the frame of every scene.
export const brand = {
  channel: "背光观察室",
  channelLatin: "BACKLIT OBSERVATORY",
  series: "观察 No.02",
  topic: "讨好",
  topicLatin: "PEOPLE-PLEASING",
};

export const episode: EpisodeData = {
  id: "pleasing",
  title: "讨好",
  bpm: 120, // 15 frames per beat
  script,
  music: "drive",
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // `chord` is a progression, one chord per bar, looping through the scene.
  // energy: 0 = pad only, 1 = bass pulse + hats, 2 = full beat, 3 = full beat + arp lead.
  moods: {
    hook: { chord: "Am Am F E", energy: 1 },
    title: { chord: "Am F", energy: 2 },
    quote: { chord: "F G Am Am", energy: 2 },
    misread: { chord: "Am F C G", energy: 2 },
    chat: { chord: "Am F C E", energy: 3 },
    keyhole: { chord: "Dm Dm E E", energy: 1 },
    mirrorEyes: { chord: "F G Am E", energy: 3 },
    question: { chord: "Am", energy: 0 },
    mirrors: { chord: "Am F C G", energy: 3 },
    verdict: { chord: "Dm F C G", energy: 2 },
    ending: { chord: "F C F C", energy: 0 },
  },
};
