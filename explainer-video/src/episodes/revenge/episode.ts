import type { Brand, EpisodeData } from "../../types.ts";
import { script } from "./script.ts";
import { channel } from "../../channels/backlit/channel.ts";

export const brand: Brand = {
  ...channel,
  series: "观察 No.09",
  topic: "报复性熬夜",
  topicLatin: "REVENGE BEDTIME",
};

export const episode: EpisodeData = {
  id: "revenge",
  title: "报复性熬夜",
  bpm: 120, // 15 frames per beat
  script,
  music: "lofi", // its own set of sounds: vinyl, electric piano, swung boom-bap, 808, trap hats
  timing: { readCharsPerSec: 7, readPadding: 0.8, minSeconds: 2.5, sceneUnitBeats: 4 },
  // F# minor. energy: 0 e-piano + vinyl · 1 + rim, swung hats, sub · 2 + boom-bap
  // drums and 808 · 3 + trap hat rolls and open hats. Peak on the late-night
  // scenes; the sunlit ending resolves to F# major.
  moods: {
    hook: { chord: "F#m F#m D C#m", energy: 1 },
    title: { chord: "F#m D", energy: 2 },
    diagnosis: { chord: "D E F#m F#m", energy: 2 },
    misread: { chord: "F#m D A E", energy: 2 },
    everyday: { chord: "F#m D A C#m", energy: 3 },
    strings: { chord: "Bm D F#m C#m", energy: 2 },
    answer: { chord: "D E F#m C#m", energy: 3 },
    question: { chord: "F#m", energy: 0 },
    cost: { chord: "Bm F#m D C#m", energy: 2 },
    remedy: { chord: "D A E F#m", energy: 1 },
    ending: { chord: "D A E F#", energy: 0 },
  },
};
