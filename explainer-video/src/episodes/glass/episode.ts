import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "观察 No.17",
  topic: "玻璃心",
  topicLatin: "GLASS HEART",
};

export const episode: EpisodeData = {
  id: "glass",
  title: "玻璃心",
  bpm: 120, // 15 frames per beat
  script,
  music: "phonk", // its own set of sounds: cowbell melody, distorted sliding 808, hard drums, a glass harmonica
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // C♯ minor. energy: 0 a glass harmonica alone · 1 + glass chimes, a soft
  // kick, hats · 2 + the distorted 808 sliding under a hard beat, the cowbell
  // riff · 3 + hat rolls, the "ha" chops, the cowbell doubled. The ending — the
  // arrow falls — is the glass harmonica, resolving to E major.
  moods: {
    hook: { chord: "C#m A E B", energy: 1 },
    title: { chord: "C#m A", energy: 2 },
    diagnosis: { chord: "A B C#m C#m", energy: 2 },
    misread: { chord: "C#m A E B", energy: 2 },
    everyday: { chord: "C#m A E B", energy: 3 },
    stoic: { chord: "A E B C#m", energy: 2 },
    answer: { chord: "A B C#m C#m", energy: 3 },
    question: { chord: "C#m", energy: 0 },
    cost: { chord: "C#m A E B", energy: 3 },
    emperor: { chord: "A E B C#m", energy: 2 },
    ending: { chord: "A B E E", energy: 0 },
  },
};
